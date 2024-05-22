import { authenticate } from "../shopify.server";
import { json, redirect } from "@remix-run/node";
import db from "../db.server";

export async function action({ request, params }) {
  const { session, admin } = await authenticate.admin(request);
  const { shop } = session;

  /** @type {any} */
  const data = {
    ...Object.fromEntries(await request.formData()),
    shop,
  };

  const ids = data.ids.split(",");
  const ints = ids.map((id) => parseInt(id));

  await db.Review.deleteMany({
    where: {
      id: {
        in: ints,
      },
    },
  });

  return redirect("/app");
}
