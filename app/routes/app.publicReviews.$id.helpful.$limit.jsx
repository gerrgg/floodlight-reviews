import { json, redirect } from "@remix-run/node";
import db from "../db.server";

export async function loader({ request, params }) {
  const id = `gid://shopify/Product/${params.id}`;
  const limit = parseInt(params.limit);
  const review = await db.Review.findMany({
    where: { productId: id, is_public: 1 },
    take: limit,
    orderBy: [
      {
        helpful: "desc",
      },
    ],
  });

  return json({ data: review });
}

export async function action({ request, params }) {
  const shop = "floodlight-design-2024.myshopify.com";
  const id = parseInt(params.id);

  const review = await db.Review.findFirst({
    where: { id, shop },
  });

  if (review) {
    const data = { ...review, helpful: review.helpful + 1 };
    await db.Review.update({ where: { id }, data });
    return json({ status: 201 });
  } else {
    return json({ status: 404 });
  }
}
