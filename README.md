# Floodlight Design Reviews - Shopify

## Getting Started

Download the Shopify-CLI - https://shopify.dev/docs/api/shopify-cli

## Development Mode

Run the following command to start the product
`shopify app dev`

### Update Schema

Edit prisma/schema.primsa file to make changes to database then run

```
npm run prisma migrate dev -- --name what-you-did-here
```

### Launch Prisma

Run the following command to view and alter data in the database

```
npm run prisma studio
```
