import { json, redirect } from "@remix-run/node";
import db from "../db.server";

export async function action({ request, params }) {
  const shop = "floodlight-design-2024.myshopify.com";
  const id = parseInt(params.id);

  const review = await db.Review.findFirst({
    where: { id },
  });

  if (review) {
    const data = { ...review, helpful: review.helpful + 1 };
    await db.Review.update({ where: { id }, data });
    return json({ status: 201 });
  } else {
    return json({ status: 404 });
  }
}
