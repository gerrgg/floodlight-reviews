import { json, redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import Sendgrid from "@sendgrid/mail";

async function getOrder(orderId, graphql) {
  const response = await graphql(
    `
      query getOrderID($id: ID!) {
        node(id: $id) {
          id
          ... on Order {
            name
            customer {
              displayName
            }
            canNotifyCustomer
            email
            phone
            id
            lineItems(first: 5) {
              nodes {
                name
                image {
                  url
                }
                product {
                  handle
                }
              }
            }
          }
        }
      }
    `,
    {
      variables: {
        id: orderId,
      },
    },
  );

  const { data } = await response.json();

  return data.node;
}

async function getShop(graphql) {
  const response = await graphql(`
    query {
      shop {
        name
        contactEmail
        url
        billingAddress {
          formatted
        }
      }
    }
  `);

  const { data } = await response.json();

  return data.shop;
}

function getReviewHtml(order, store, subject, body, buttonColor, logo) {
  const name = order.customer.displayName;
  const lastItem = order.lineItems.nodes[0];

  const header = logo.length
    ? ` <img style="margin: 28px auto" src=${logo} alt="${store.name}" />`
    : `<h1 style="font-family: Helvetica, sans-serif; font-size: 28px; font-weight: bold; margin: 0; margin-bottom: 16px; text-align: center">${store.name}</h1>`;

  const html = `
  <!doctype html>
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>${subject}</title>
        <style media="all" type="text/css">
          @media all {
            .btn-primary table td:hover {
              background-color: #ec0867 !important;
            }

            .btn-primary a:hover {
              background-color: #ec0867 !important;
              border-color: #ec0867 !important;
            }
              }
          @media only screen and (max-width: 640px) {
            .main p,
          .main td,
          .main span {
              font-size: 16px !important;
            }

            .wrapper {
              padding: 8px !important;
            }

            .content {
              padding: 0 !important;
            }

            .container {
              padding: 0 !important;
              padding-top: 8px !important;
              width: 100% !important;
            }

            .main {
              border-left-width: 0 !important;
              border-radius: 0 !important;
              border-right-width: 0 !important;
            }

            .btn table {
              max-width: 100% !important;
              width: 100% !important;
            }

            .btn a {
              font-size: 16px !important;
              max-width: 100% !important;
              width: 100% !important;
            }
          }
          @media all {
            .ExternalClass {
              width: 100%;
            }

            .ExternalClass,
          .ExternalClass p,
          .ExternalClass span,
          .ExternalClass font,
          .ExternalClass td,
          .ExternalClass div {
              line-height: 100%;
            }

            .apple-link a {
              color: inherit !important;
              font-family: inherit !important;
              font-size: inherit !important;
              font-weight: inherit !important;
              line-height: inherit !important;
              text-decoration: none !important;
            }

            #MessageViewBody a {
              color: inherit;
              text-decoration: none;
              font-size: inherit;
              font-family: inherit;
              font-weight: inherit;
              line-height: inherit;
            }
          }
          </style>
        </head>
        <body style="font-family: Helvetica, sans-serif; -webkit-font-smoothing: antialiased; font-size: 16px; line-height: 1.3; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; background-color: #f4f5f6; margin: 0; padding: 0;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f4f5f6; width: 100%;" width="100%" bgcolor="#f4f5f6">
            <tr>
              <td style="font-family: Helvetica, sans-serif; font-size: 16px; vertical-align: top;" valign="top">&nbsp;</td>
              <td class="container" style="font-family: Helvetica, sans-serif; font-size: 16px; vertical-align: top; max-width: 600px; padding: 0; padding-top: 24px; width: 600px; margin: 0 auto;" width="600" valign="top">
                <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 600px; padding: 0;">

                  <!-- START CENTERED WHITE CONTAINER -->
                  <span class="preheader" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">This is preheader text. Some clients will show this text as a preview.</span>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff; border: 1px solid #eaebed; border-radius: 16px; width: 100%;" width="100%">

                    <!-- START MAIN CONTENT AREA -->
                    <tr>
                      <td class="wrapper" style="font-family: Helvetica, sans-serif; font-size: 16px; vertical-align: top; box-sizing: border-box; padding: 24px;" valign="top">
                        ${header}
                        <p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">Hi ${name},</p>
                        <p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">We hope you're enjoying your new ${lastItem.name}!</p>
                        <p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">${body}</p>
                        <p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">Would you take a moment to share your experience with your recent purchase?</p>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; box-sizing: border-box; width: 100%; min-width: 100%;" width="100%">
                          <tbody>
                            <tr>
                              <td align="left" style="font-family: Helvetica, sans-serif; font-size: 16px; vertical-align: top; padding-bottom: 16px;" valign="top">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;">
                                  <tbody>
                                    <tr>
                                      <td style="font-family: Helvetica, sans-serif; font-size: 16px; vertical-align: top; border-radius: 4px; text-align: center; background-color: ${buttonColor};" valign="top" align="center" bgcolor="${buttonColor}"> <a href="${store.url}/products/${lastItem.product.handle}#fld-reviews" target="_blank" style="border: solid 2px ${buttonColor}; border-radius: 4px; box-sizing: border-box; cursor: pointer; display: inline-block; font-size: 16px; font-weight: bold; margin: 0 auto; padding: 12px 24px; text-decoration: none; text-transform: capitalize; background-color: ${buttonColor}; border-color: ${buttonColor}; color: #ffffff;">Write a Review</a> </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">Thank you for being a valued customer. We look forward to hearing from you!</p>
                        <p style="font-family: Helvetica, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 16px;">Happy shredding,<br>The ${store.name} Team</p>
                      </td>
                    </tr>
                    <!-- END MAIN CONTENT AREA -->
                  </table>

                  <!-- START FOOTER -->
                  <div class="footer" style="clear: both; padding-top: 24px; text-align: center; width: 100%;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                      <tr>
                        <td class="content-block" style="font-family: Helvetica, sans-serif; vertical-align: top; color: #9a9ea6; font-size: 16px; text-align: center;" valign="top" align="center">
                          <span class="apple-link" style="color: #9a9ea6; font-size: 16px; text-align: center;">${store.billingAddress.formatted.join("<br>")}</span>
                          <br> Don't like these emails? <a href="http://htmlemail.io/blog" style="text-decoration: underline; color: #9a9ea6; font-size: 16px; text-align: center;">Unsubscribe</a>.<br><br><br>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- END FOOTER -->
                  
              <!-- END CENTERED WHITE CONTAINER --></div>
              </td>
              <td style="font-family: Helvetica, sans-serif; font-size: 16px; vertical-align: top;" valign="top">&nbsp;</td>
            </tr>
          </table>
        </body>
      </html>
  `;
  return html;
}

export async function action({ request }) {
  const { admin, payload } = await authenticate.flow(request);

  Sendgrid.setApiKey(process.env.SENDGRID_API_KEY || "");

  const orderId = payload.properties.order_id;
  const shopData = await getShop(admin.graphql);
  const subject = payload.properties.subject;
  const body = payload.properties["email-body"];
  const buttonColor = payload.properties.button_color;
  const logo = payload.properties.logo_url;
  console.log(payload.properties);

  try {
    const orderData = await getOrder(orderId, admin.graphql);
    const html = getReviewHtml(
      orderData,
      shopData,
      subject,
      body,
      buttonColor,
      logo,
    );

    const msg = {
      to: orderData.email,
      from: shopData.contactEmail,
      subject,
      text: "This is a test email",
      html: html,
    };

    await Sendgrid.send(msg);
  } catch (e) {
    console.log("getting order failed", e);
  }

  return json({ status: 200 });
}
