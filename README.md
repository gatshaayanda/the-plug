# The Plug

**The Plug — Sneakers & Apparel Sourcing**

Mobile-first sourcing and customer operations PWA for sneaker and apparel requests in Botswana.

## Customer flow
Home → Catalogue → Request a product → Request tracking → Customer account

Customers can browse available products, ask The Plug to source a specific sneaker or apparel item, follow request progress, and message the business.

## Operations
/admin is protected by Firebase Authentication plus admins/{uid} with role owner/staff.

## Development
npm install
npm run dev

Quality gates:
npx tsc --noEmit
npm run lint
npm run verify:identity
npm run build

See AGENTS.md for the implementation contract.

## Notifications
Customer and operations notifications use Firebase Cloud Messaging. Notification permission is requested only from the user's explicit settings action.
