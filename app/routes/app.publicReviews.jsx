import { json, redirect } from "@remix-run/node";
import db from "../db.server";
import { validateReview } from "../models/Review.server";

export async function action({ request }) {
  const shop = "floodlight-design-2024.myshopify.com";

  const data = {
    ...Object.fromEntries(await request.formData()),
    shop,
  };

  data.rating = Number(data.rating);
  data.is_public = 0;

  if (!data.user_name) {
    data.user_name = "Anonymous";
  }

  const errors = validateReview(data);

  if (errors) {
    return json({ errors }, { status: 422 });
  }

  const review = await db.Review.create({ data });

  // set metafields
  // const { admin } = await unauthenticated.admin(shop);

  // const { setAverageReviewMetafield, setReviewsMetafield } = await import(
  //   "../models/Review.server"
  // );

  // await setAverageReviewMetafield(data, admin.graphql);
  // await setReviewsMetafield(data, admin.graphql);

  return json({ review }, { status: 201 });
}
