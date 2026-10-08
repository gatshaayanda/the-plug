# The Plug — Agent Operating Contract

## Product
The Plug is a Botswana sneaker and apparel sourcing/order PWA for Frank's side business. Core proposition: If we can source it, you can get it.

This is a real small-business product, not a generic demo.

## Roles
- Product owner / final reviewer: user
- Technical navigator + implementation: ChatGPT through repository tooling
- GitHub is the source of truth

## Workflow
START → INSPECT → BUILD → VERIFY → CHECKPOINT → CONTINUE/RECOVER.
Golden rule: Unexpected result = STOP → inspect reality → then act.
Before changing code, inspect the actual repository, Git state, Firebase configuration, deployed state when relevant, and the real business workflow. Do not invent current state.

## Customer
- Browse published sneaker/apparel catalogue.
- Search and filter products.
- Product requests work even when an item is not listed.
- Request flow captures product, screenshot/image, desired size, colour and notes.
- Customer can contact Frank by WhatsApp/phone.
- Guest-first: no account required merely to make a sourcing request.
- Optional account keeps request/order history.
- Offline browsing/drafts must be honest about what has and has not reached Frank.
- Never claim a quote, stock position, deposit receipt, sourcing acceptance or delivery date until recorded by the business.

## Commercial workflow
1. Customer sends a listed product or sourcing request.
2. Frank checks the sourcing route.
3. Frank confirms current quote and delivery expectation.
4. Customer pays the agreed 50% deposit before sourcing begins.
5. Frank records the order/deposit.
6. Status progresses through sourcing to delivery/collection.

The BOEMO order/conversation infrastructure is a foundation only; remove food-specific customer wording as The Plug evolves.

## Admin
Keep admin lightweight: catalogue/product media, sourcing requests/orders, quote/deposit recording, status, customer communication and delivery notes. Do not build an ERP.

## Data/security
Firebase rules remain the security boundary. Do not expose customer profiles/orders publicly. Admin access remains role-controlled. Never commit credentials. Public catalogue reads are allowed; catalogue writes are admin-only.

## PWA/offline
Keep installable manifest, service worker, offline route, app-shell caching and Firestore persistence. Do not indiscriminately cache private Firebase data or large product media.

## UX basis
Current ecommerce research supports prominent product imagery, visible size controls, useful search/filtering, fast comparison and mobile-first discovery. Product detail should use visible button-like size selectors and strong media inspection.

## Verification
Before a meaningful checkpoint run: npx tsc --noEmit, npm run lint, npm run build. Review the actual diff before committing. Do not push speculative Vercel-trigger commits.

## Recovery
The BOEMO foundation commit remains the recovery source for infrastructure behavior. If The Plug work breaks offline/auth/notification/PWA infrastructure, stop and compare against the original BOEMO foundation rather than layering fixes blindly.
