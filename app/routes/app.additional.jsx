import { json } from "@remix-run/node";
import { useState } from "react";
import {
  useLoaderData,
  Link,
  useNavigate,
  useSubmit,
  useNavigation,
} from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
  Card,
  Page,
  Text,
  BlockStack,
  InlineGrid,
  Box,
  TextField,
  Layout,
  PageActions,
} from "@shopify/polaris";

// Load QR codes using the qrcodes function from app/models/QRCode.server.js, and return them in a JSON Response.
export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);

  const { getAppInstallationSendgridAPIkey } = await import(
    "../models/Settings.server"
  );

  const apiKey = await getAppInstallationSendgridAPIkey(admin.graphql);
  // const apiKey = await getSendgridAPIKey(AppInstallationID, admin.graphql);

  return json({
    apiKey,
  });
}

export async function action({ request, params }) {
  const { session, admin } = await authenticate.admin(request);
  const { shop } = session;

  const data = {
    ...Object.fromEntries(await request.formData()),
    shop,
  };

  const { setSendgridAPIKey } = await import("../models/Settings.server");

  await setSendgridAPIKey(data.apiKey, admin.graphql);

  return json({ status: 201 });
}

// layout
export default function Index() {
  const submitDisabled = useState(true);
  const apiKey = useLoaderData();
  const [formState, setFormState] = useState(apiKey);
  const [cleanFormState, setCleanFormState] = useState(apiKey);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

  const submit = useSubmit();

  const nav = useNavigation();
  const isSaving = nav.state === "submitting";

  function handleSave() {
    const data = {
      apiKey: formState.apiKey,
    };

    setCleanFormState({ ...formState });
    submit(data, { method: "post" });
  }

  return (
    <Page>
      <ui-title-bar title={"Settings"}></ui-title-bar>
      <BlockStack gap={{ xs: "800", sm: "400" }}>
        <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
          <Box
            as="section"
            paddingInlineStart={{ xs: 400, sm: 0 }}
            paddingInlineEnd={{ xs: 400, sm: 0 }}
          >
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd">
                Sendgrid
              </Text>
              <Text as="p" variant="bodyMd">
                Enter your sendgrid API key to send review email reminders to
                customers.
              </Text>
            </BlockStack>
          </Box>
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <TextField
                value={formState.apiKey}
                label="Sendgrid API Key"
                id="apikey"
                labelHidden
                autoComplete="off"
                onChange={(apiKey) => setFormState({ ...formState, apiKey })}
              />
            </BlockStack>
          </Card>
        </InlineGrid>
      </BlockStack>
      <Layout.Section>
        <PageActions
          primaryAction={{
            content: "Save",
            disabled: !isDirty || isSaving,
            onAction: handleSave,
          }}
        />
      </Layout.Section>
    </Page>
  );
}
