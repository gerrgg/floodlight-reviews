import { json, redirect } from "@remix-run/node";
import db from "../db.server";
import { validateReview } from "../models/Review.server";

async function getPublicIP() {
  const IPResponse = await fetch("https://api.ipify.org?format=json");
  const { ip } = await IPResponse.json();
  return ip;
}

export async function action({ request }) {
  const shop = "floodlight-design-2024.myshopify.com";

  const data = {
    ...Object.fromEntries(await request.formData()),
    shop,
  };

  data.rating = Number(data.rating);
  data.is_public = 0;
  data.ipAddress = await getPublicIP();

  if (!data.user_name) {
    data.user_name = "Anonymous";
  }

  const errors = validateReview(data);

  if (errors) {
    return json({ errors }, { status: 422 });
  }

  const review = await db.Review.create({ data });

  return json({ review }, { status: 201 });
}
