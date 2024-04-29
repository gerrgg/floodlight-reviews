import { useState } from "react";
import { json, redirect } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
  useNavigate,
} from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
  Card,
  Button,
  InlineStack,
  InlineError,
  Layout,
  Page,
  Text,
  TextField,
  Thumbnail,
  BlockStack,
  PageActions,
  Select,
  Grid,
} from "@shopify/polaris";
import { ImageIcon, StarIcon, StarFilledIcon } from "@shopify/polaris-icons";

import db from "../db.server";
import { getReview, validateReview } from "../models/Review.server";

export async function loader({ request, params }) {
  const { admin } = await authenticate.admin(request);

  if (params.id === "new") {
    return json({
      destination: "product",
      title: "",
      is_public: 0,
      rating: 0,
    });
  }

  return json(await getReview(Number(params.id), admin.graphql));
}

export async function action({ request, params }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  /** @type {any} */
  const data = {
    ...Object.fromEntries(await request.formData()),
    shop,
  };

  data.rating = Number(data.rating);
  data.is_public = Number(data.is_public);

  if (data.action === "delete") {
    await db.Review.delete({ where: { id: Number(params.id) } });
    return redirect("/app");
  }

  const errors = validateReview(data);

  if (errors) {
    return json({ errors }, { status: 422 });
  }

  const review =
    params.id === "new"
      ? await db.Review.create({ data })
      : await db.Review.update({ where: { id: Number(params.id) }, data });

  return redirect(`/app/reviews/${review.id}`);
}

export default function ReviewForm() {
  const errors = useActionData()?.errors || {};

  const review = useLoaderData();
  const [formState, setFormState] = useState(review);
  const [cleanFormState, setCleanFormState] = useState(review);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

  const statusOptions = [
    { label: "Draft", value: "0" },
    { label: "Published", value: "1" },
  ];

  const nav = useNavigation();
  const isSaving =
    nav.state === "submitting" && nav.formData?.get("action") !== "delete";
  const isDeleting =
    nav.state === "submitting" && nav.formData?.get("action") === "delete";

  const navigate = useNavigate();

  async function selectProduct() {
    const products = await window.shopify.resourcePicker({
      type: "product",
      action: "select", // customized action verb, either 'select' or 'add',
    });

    if (products) {
      const { images, id, variants, title, handle } = products[0];

      setFormState({
        ...formState,
        productId: id,
        productVariantId: variants[0].id,
        productTitle: title,
        productAlt: images[0]?.altText,
        productImage: images[0]?.originalSrc,
      });
    }
  }

  const submit = useSubmit();

  function handleSave() {
    const data = {
      title: formState.title,
      productId: formState.productId || "",
      productVariantId: formState.productVariantId || "",
      reviewContent: formState.reviewContent || "",
      rating: Number(formState.rating) || 0,
      is_public: formState.is_public,
      user_name: formState.user_name,
    };

    setCleanFormState({ ...formState });
    submit(data, { method: "post" });
  }

  return (
    <Page>
      <ui-title-bar title={review.id ? "Edit Review" : "Create new Review"}>
        <button variant="breadcrumb" onClick={() => navigate("/app")}>
          Reviews
        </button>
      </ui-title-bar>
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="500">
                <Text as={"h2"} variant="headingLg">
                  Visibility
                </Text>
                <Select
                  options={statusOptions}
                  onChange={(is_public) => {
                    console.log(is_public);
                    setFormState({ ...formState, is_public });
                  }}
                  value={formState.is_public}
                />
              </BlockStack>
            </Card>
            <Grid>
              <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                <Card>
                  <BlockStack gap="500">
                    <InlineStack align="space-between">
                      <Text as={"h2"} variant="headingLg">
                        Product
                      </Text>
                      {formState.productId ? (
                        <Button variant="plain" onClick={selectProduct}>
                          Change product
                        </Button>
                      ) : null}
                    </InlineStack>
                    {formState.productId ? (
                      <InlineStack blockAlign="center" gap="500">
                        <Thumbnail
                          source={formState.productImage || ImageIcon}
                          alt={formState.productAlt}
                        />
                        <Text
                          as="span"
                          variant="headingMd"
                          fontWeight="semibold"
                        >
                          {formState.productTitle}
                        </Text>
                      </InlineStack>
                    ) : (
                      <BlockStack gap="200">
                        <Button onClick={selectProduct} id="select-product">
                          Select product
                        </Button>
                        {errors.productId ? (
                          <InlineError
                            message={errors.productId}
                            fieldID="myFieldID"
                          />
                        ) : null}
                      </BlockStack>
                    )}
                  </BlockStack>
                </Card>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                <Card>
                  <BlockStack gap="500">
                    <Text as={"h2"} variant="headingLg">
                      Rating
                    </Text>
                    <InlineStack align="start" gap="200">
                      {[...Array(5)].map((x, i) => (
                        <Button
                          key={`rating-${i}`}
                          icon={
                            formState.rating <= i ? StarIcon : StarFilledIcon
                          }
                          className="--p-color-bg-fill-caution-active"
                          variant="monochromePlain"
                          onClick={(rating) =>
                            setFormState({ ...formState, rating: i + 1 })
                          }
                        />
                      ))}
                    </InlineStack>
                    {errors.rating ? (
                      <InlineError
                        message={errors.rating}
                        fieldID="myFieldID"
                      />
                    ) : null}
                    <input
                      id="rating"
                      label="rating"
                      type="hidden"
                      autoComplete="off"
                      value={formState.rating}
                      onChange={(rating) =>
                        setFormState({ ...formState, rating })
                      }
                      error={errors.rating}
                    />
                    {console.log(errors)}
                  </BlockStack>
                </Card>
              </Grid.Cell>
            </Grid>

            <Card>
              <BlockStack gap="500">
                <Text as={"h2"} variant="headingLg">
                  Title
                </Text>
                <TextField
                  id="title"
                  label="title"
                  labelHidden
                  autoComplete="off"
                  value={formState.title}
                  onChange={(title) => setFormState({ ...formState, title })}
                  error={errors.title}
                />
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="500">
                <Text as={"h2"} variant="headingLg">
                  Review
                </Text>
                <TextField
                  id="title"
                  label="title"
                  labelHidden
                  autoComplete="off"
                  multiline={4}
                  value={formState.reviewContent}
                  onChange={(reviewContent) =>
                    setFormState({ ...formState, reviewContent })
                  }
                  error={errors.reviewContent}
                />
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="500">
                <Text as={"h2"} variant="headingLg">
                  Username
                </Text>
                <TextField
                  id="username"
                  label="username"
                  labelHidden
                  autoComplete="off"
                  value={formState.user_name}
                  onChange={(user_name) =>
                    setFormState({ ...formState, user_name })
                  }
                  error={errors.user_name}
                />
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
        <Layout.Section>
          <PageActions
            secondaryActions={[
              {
                content: "Delete",
                loading: isDeleting,
                disabled: !review.id || !review || isSaving || isDeleting,
                destructive: true,
                outline: true,
                onAction: () =>
                  submit({ action: "delete" }, { method: "post" }),
              },
            ]}
            primaryAction={{
              content: "Save",
              loading: isSaving,
              disabled: !isDirty || isSaving || isDeleting,
              onAction: handleSave,
            }}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
