import { json, redirect } from "@remix-run/node";
import db from "../db.server";

export async function loader({ request, params }) {
  const id = `gid://shopify/Product/${params.id}`;
  const ip = params.ip;
  const review = await db.Review.findFirst({
    where: { productId: id, ipAddress: ip },
  });

  return json({ data: review });
}
