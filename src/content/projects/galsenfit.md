---
title: "Galsenfit"
headline: "Galsenfit is a Shopify e-commerce store with no native support for local mobile payment methods in Senegal. Built a custom integration system to bridge Shopify with local mobile money providers."
order: 4
draft: false
url: "https://galsenfit.com"
---
Built a ![Node.js](https://svgl.app/library/nodejs.svg) **Node.js** payment integration connected to ![Shopify](https://svgl.app/library/shopify.svg) **Shopify** via webhooks to intercept orders in real time and trigger the appropriate payment flow based on the customer’s selected method.

Integrated **Wave** and **Orange Money** APIs to generate SMS payment links, with transaction confirmation through IPN and automatic order updates via ![Shopify](https://svgl.app/library/shopify.svg) **Shopify**’s ![GraphQL](https://svgl.app/library/graphql.svg) **GraphQL** API. Deployed to production, where it handles more than 120 orders per day.
