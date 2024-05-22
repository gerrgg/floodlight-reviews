export async function getAppInstallationSendgridAPIkey(graphql) {
  const response = await graphql(`
    query {
      currentAppInstallation {
        metafield(key: "api_key", namespace: "secret_keys") {
          value
        }
      }
    }
  `);

  const {
    data: {
      currentAppInstallation: {
        metafield: { value },
      },
    },
  } = await response.json();

  return value;
}

export async function getAppInstallationId(graphql) {
  const response = await graphql(`
    query {
      currentAppInstallation {
        id
      }
    }
  `);

  const {
    data: {
      currentAppInstallation: {
        metafield: { value },
      },
    },
  } = await response.json();

  return value;
}

export async function setSendgridAPIKey(apikey, graphql) {
  const ownerIDResponse = await graphql(`
    query {
      currentAppInstallation {
        id
      }
    }
  `);

  const {
    data: {
      currentAppInstallation: { id },
    },
  } = await ownerIDResponse.json();

  const response = await graphql(
    `
      mutation CreateAppDataMetafield($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        metafields: [
          {
            namespace: "secret_keys",
            key: "api_key",
            type: "single_line_text_field",
            value: apikey,
            ownerId: id,
          },
        ],
      },
    },
  );

  return id;
}
