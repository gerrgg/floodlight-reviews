import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import db from "../db.server";

import { getDestinationUrl } from "../models/QRCode.server";

/**
Validate the QR code ID
Create a loader function to load the QR code from the database.
In this function, check there is an ID in the URL. If the ID isn't present, then throw an error using tiny-invariant.
Load the QR code from the Prisma database. If a QR code with the specified ID doesn't exist, then throw an error using tiny-invariant.
 */

export const loader = async ({ params }) => {
  invariant(params.id, "Could not find QR code destination");

  const id = Number(params.id);
  const qrCode = await db.qRCode.findFirst({ where: { id } });

  invariant(qrCode, "Could not find QR code destination");

  await db.qRCode.update({
    where: { id },
    data: { scans: { increment: 1 } },
  });

  return redirect(getDestinationUrl(qrCode));
};
