import db from "../db.server";

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

// QR code validation, title, product and destination URL is required
export function validateReview(data) {
  const errors = {};

  if (!data.title) {
    errors.title = "Title is required";
  }

  if (!data.productId) {
    errors.productId = "Product is required";
  }

  console.log(data);
  if (data.rating == 0) {
    errors.rating = "Rating is required";
  }

  if (Object.keys(errors).length) {
    return errors;
  }
}
