import db from "../db.server";

export async function getShop(graphql) {
  const response = await graphql(`
    query {
      shop {
        url
      }
    }
  `);

  const { data } = await response.json();
  return data;
}

// get single QR code for QR code form
export async function getReview(id, graphql) {
  // get a QR code by ID
  const review = await db.Review.findFirst({ where: { id } });

  if (!review) {
    return null;
  }

  return supplementReview(review, graphql);
}

// get multiple QR codes
export async function getReviews(shop, graphql) {
  // get multiple QR codes by ID
  const reviews = await db.Review.findMany({
    where: { shop },
    orderBy: { id: "desc" },
  });

  if (reviews.length === 0) return [];

  return Promise.all(
    reviews.map((review) => supplementReview(review, graphql)),
  );
}

// query graphQL for product and QR code data
async function supplementReview(review, graphql) {
  // get product data
  const response = await graphql(
    `
      query supplementReview($id: ID!) {
        product(id: $id) {
          title
          images(first: 1) {
            nodes {
              altText
              url
            }
          }
        }
      }
    `,
    {
      variables: {
        id: review.productId,
      },
    },
  );

  const {
    data: { product },
  } = await response.json();

  return {
    ...review,
    productDeleted: !product?.title,
    productTitle: product?.title,
    productImage: product?.images?.nodes[0]?.url,
  };
}

// get all reviews that match shop, product and are public
async function getAllProductReviews(shop, productId) {
  const reviews = await db.Review.findMany({
    where: { shop, productId, is_public: 1 },
    orderBy: { id: "desc" },
  });

  return reviews;
}

export async function setReviewsMetafield(review, graphql) {
  const data = await getAllProductReviews(review.shop, review.productId);

  const reviewData = data.map((d) => {
    const obj = {
      title: d.title,
      content: d.reviewContent,
      username: d.user_name,
      rating: d.rating,
      created: d.createdAt,
    };

    return obj;
  });

  const json = JSON.stringify(reviewData);

  await graphql(
    `
      mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            key
            namespace
            value
            createdAt
            updatedAt
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `,
    {
      variables: {
        metafields: [
          {
            key: "reviews",
            namespace: "fld",
            ownerId: review.productId,
            type: "json",
            value: json,
          },
        ],
      },
    },
  );
}

export async function setAverageReviewMetafield(review, graphql) {
  const reviews = await getAllProductReviews(review.shop, review.productId);
  const ratings = reviews.map((r) => r.rating);
  const avg = Math.ceil(
    ratings.reduce((sum, a) => sum + a, 0) / ratings.length,
  );

  await graphql(
    `
      mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            key
            namespace
            value
            createdAt
            updatedAt
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `,
    {
      variables: {
        metafields: [
          {
            key: "avg_rating",
            namespace: "fld",
            ownerId: review.productId,
            type: "number_integer",
            value: String(avg),
          },
        ],
      },
    },
  );
}

// QR code validation, title, product and destination URL is required
export function validateReview(data) {
  const errors = {};

  if (!data.title) {
    errors.title = "Title is required";
  }

  if (!data.productId) {
    errors.productId = "Product is required";
  }

  if (data.rating == 0) {
    errors.rating = "Rating is required";
  }

  if (Object.keys(errors).length) {
    return errors;
  }
}
