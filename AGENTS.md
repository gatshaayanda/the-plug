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


## Firebase isolation checkpoint
The Plug must never use BOEMO's Firebase project, credentials, service-worker config, rules deployment target or production data. The foundation was copied for code architecture only. A dedicated The Plug Firebase project must be provisioned before production auth, Firestore, Storage or FCM testing. Until then, environment placeholders remain blank and push notifications are not claimed as live.

Current Firebase Web guidance requires HTTPS, correct service-worker setup and web push credentials for FCM. The server notification path can remain Next.js/Vercel + Firebase Admin without Firebase Cloud Functions.

## Operational customer flow checkpoint
The customer-facing model is now a sourcing workflow, not a food-order workflow:
- Browse catalogue or start a sourcing request.
- Guest submits product/name/link or screenshot, size, colour, contact and notes.
- A structured `sourcingRequests` record is created and linked to the existing private conversation system.
- Frank's admin queue manages: New Request → Quote Ready → Awaiting Deposit → Deposit Received → Sourcing → In Transit → Ready → Delivered/Collected → Cancelled.
- Frank records quote, 50% deposit required/received, sourcing expectation, fulfilment method/details and customer-facing note.
- Customer can track the private request from My The Plug and a dedicated request route.
- Status/quote updates can trigger customer notifications when the dedicated Firebase project and FCM credentials are configured.
- If notification infrastructure is unavailable, the request remains the source of truth and WhatsApp is the explicit fallback.

## Build-state fallback language
- Explain that The Plug is still being built/connected where relevant.
- Never claim a notification was sent if it was not confirmed.
- Never claim a request reached Frank if the Firestore write was not confirmed.
- Offer WhatsApp `+267 76 411 150` as the reliable direct fallback.
- Offline messaging must distinguish cached/app-shell availability from a request actually reaching Frank.
## PWA install UX standard
- Use a small number of purposeful, context-relevant emojis to make mobile guidance more approachable and scannable; pair them with clear words and never rely on emoji alone.
The Plug is commonly opened from WhatsApp/social links, including embedded in-app browsers. If the app detects an embedded browser, show the branded guidance automatically on first render after client detection, before the customer needs to scroll or interact with the page. The guidance must behave as a blocking accessible dialog: lock background scrolling, keep keyboard focus inside it, and require the primary **Open The Plug in your browser** action to continue; do not provide a silent/dismiss-only path that leaves the customer stuck in the embedded browser. Hand the customer to a normal browser (Chrome on Android where supported). After they reach a normal browser, keep installation guidance available and use the browser's proper **Install app** flow when exposed. Do not use a JavaScript alert for install guidance. Do not present **Add to Home screen** as the generic primary fallback; platform-specific iPhone/iPad guidance may still explain Safari's Home Screen flow. Browser chrome such as the embedded app's address-bar title/URL is controlled by the host app/browser and cannot be changed by The Plug. Keep install messaging concise, branded and in-page, with no duplicate stacked dialogs.
