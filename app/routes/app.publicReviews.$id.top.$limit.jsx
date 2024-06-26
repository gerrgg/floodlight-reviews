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
        rating: "desc",
      },
    ],
  });

  return json({ data: review });
}
