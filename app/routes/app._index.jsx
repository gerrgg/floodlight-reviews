import { json } from "@remix-run/node";
import { useLoaderData, Link, useNavigate, useSubmit } from "@remix-run/react";
import { useState, useLayoutEffect } from "react";
import { authenticate } from "../shopify.server";
import {
  Card,
  EmptyState,
  Layout,
  Page,
  IndexTable,
  Thumbnail,
  Text,
  Icon,
  InlineStack,
  Button,
  useIndexResourceState,
} from "@shopify/polaris";
import { getReviews } from "../models/Review.server";
import {
  AlertDiamondIcon,
  ImageIcon,
  StarIcon,
  StarFilledIcon,
  DeleteIcon,
} from "@shopify/polaris-icons";

// Load QR codes using the reviews function from app/models/Review.server.js, and return them in a JSON Response.
export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const reviews = await getReviews(session.shop, admin.graphql);

  return json({
    reviews,
  });
}

export async function action({ request, params }) {
  const { session, admin } = await authenticate.admin(request);
  const data = {
    ...Object.fromEntries(await request.formData()),
  };

  console.log(data);

  // await db.Review.delete({ where: { id: Number(params.id) } });

  return json({ status: 201 });
}

// If there are no QR codes, use EmptyState to present a call to action to create QR codes.
const EmptyReviewState = ({ onAction }) => (
  <EmptyState
    heading="Create reviews for your product"
    action={{
      content: "Create Review",
      onAction,
    }}
    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
  >
    <p>Provide customers with product insight, reviews and ratings</p>
  </EmptyState>
);

function truncate(str, { length = 25 } = {}) {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

// If QR codes are present, list them
const ReviewTable = ({ reviews }) => {
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(reviews);

  const submit = useSubmit();

  const bulkActions = [
    {
      content: "Publish",
      onAction: () => console.log("Todo: implement publish"),
    },
    {
      icon: DeleteIcon,
      destructive: true,
      content: "Delete reviews",
      onAction: () => {
        const data = {
          ids: selectedResources,
        };

        submit(data, { method: "post", action: "/app/reviews/delete" });
      },
    },
  ];

  return (
    <IndexTable
      resourceName={{
        singular: "Review",
        plural: "Reviews",
      }}
      itemCount={reviews.length}
      selectedItemsCount={
        allResourcesSelected ? "All" : selectedResources.length
      }
      onSelectionChange={handleSelectionChange}
      headings={[
        { title: "Thumbnail", hidden: true },
        { title: "Product" },
        { title: "Title" },
        { title: "Rating" },
        { title: "Status" },
        { title: "Date created" },
      ]}
      promotedBulkActions={bulkActions}
      selectable={true}
    >
      {reviews.map((review) => (
        <ReviewTableRow
          selectedResources={selectedResources}
          key={review.id}
          review={review}
        />
      ))}
    </IndexTable>
  );
};

// Map over each QR code and render an IndexTable.Row that uses Polaris components to structure the row and render QR code information.
const ReviewTableRow = ({ review, selectedResources }) => {
  return (
    <IndexTable.Row
      id={review.id}
      position={review.id}
      selected={selectedResources.includes(review.id)}
    >
      <IndexTable.Cell>
        <Thumbnail
          source={review.productImage || ImageIcon}
          alt={review.productTitle}
          size="small"
        />
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Link to={`reviews/${review.id}`}>{truncate(review.title)}</Link>
      </IndexTable.Cell>
      <IndexTable.Cell>
        {/* Warn when a product that a QR code is built for is deleted */}
        {review.productDeleted ? (
          <InlineStack align="start" gap="200">
            <span style={{ width: "20px" }}>
              <Icon source={AlertDiamondIcon} tone="critical" />
            </span>
            <Text tone="critical" as="span">
              product has been deleted
            </Text>
          </InlineStack>
        ) : (
          truncate(review.productTitle)
        )}
      </IndexTable.Cell>
      <IndexTable.Cell>
        {[...Array(5)].map((x, i) => (
          <Button
            key={`rating-${i}`}
            icon={review.rating <= i ? StarIcon : StarFilledIcon}
            className="--p-color-bg-fill-caution-active"
            variant="monochromePlain"
          />
        ))}
      </IndexTable.Cell>
      <IndexTable.Cell>
        {review.is_public ? "Published" : "Draft"}
      </IndexTable.Cell>
      <IndexTable.Cell>
        {new Date(review.createdAt).toDateString()}
      </IndexTable.Cell>
    </IndexTable.Row>
  );
};

// layout
export default function Index() {
  const { reviews } = useLoaderData();
  const navigate = useNavigate();

  return (
    <Page>
      <ui-title-bar title="Product Reviews">
        <button variant="primary" onClick={() => navigate("/app/reviews/new")}>
          Create Review
        </button>
      </ui-title-bar>
      <Layout>
        <Layout.Section>
          <Card padding="0">
            {reviews.length === 0 ? (
              <EmptyReviewState onAction={() => navigate("reviews/new")} />
            ) : (
              <ReviewTable reviews={reviews} />
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
