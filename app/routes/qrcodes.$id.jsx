import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { useLoaderData } from "@remix-run/react";

import db from "../db.server";
import { getQRCodeImage } from "../models/QRCode.server";

// Because the qrcodes.$id.jsx doesn't require authentication or need to be rendered inside of the Shopify admin, it doesn't use the app layout.

// check that there's an ID in the URL, if there isnt throw an error
// if there is an ID, check that it matches a QR code in the DB
// if it matches, return the QR code
export const loader = async ({ params }) => {
  invariant(params.id, "Could not find QR code destination");

  const id = Number(params.id);
  const qrCode = await db.qRCode.findFirst({ where: { id } });

  invariant(qrCode, "Could not find QR code destination");

  return json({
    title: qrCode.title,
    image: await getQRCodeImage(id),
  });
};

export default function QRCode() {
  const { image, title } = useLoaderData();

  return (
    <>
      <h1>{title}</h1>
      <img src={image} alt={`QR Code for product`} />
    </>
  );
}
