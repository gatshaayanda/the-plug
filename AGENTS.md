# The Plug — Agent Operating Contract

## Product
The Plug is a Botswana sneaker and apparel sourcing/order PWA for Frank's side business. Core proposition: If we can source it, you can get it. This is a real small-business product, not a generic demo.

## Roles and workflow
- Product owner / final reviewer: user.
- Technical navigator and implementation: ChatGPT through repository tooling.
- GitHub is the source of truth; Vercel production status must be checked independently.
- Workflow: START → INSPECT → BUILD → VERIFY → CHECKPOINT → CONTINUE/RECOVER.
- Golden rule: Unexpected result = STOP → inspect reality → then act.
- Read this file first. Inspect actual source, route tree, Firebase rules/config, recent commits, and deployment before changing code. Do not invent state.
- Make the smallest controlled changes, preserve working behavior, inspect the resulting diff, run verification, and report exact commit/deployment state. Never claim a push, fix, notification, request, or deployment succeeded without evidence.

## Customer experience — account-first
- The intended customer model is an account-based member experience, not guest-first. Google sign-in should be the clear, low-friction entry path.
- Do not silently create anonymous customer accounts or let customers submit sourcing requests as guests. A customer must be signed in with a persistent account before using private feed, private messages, saved profile, sourcing requests, and order tracking.
- Public landing/discovery content may explain The Plug and link to the WhatsApp catalogue/contact, but clearly signal that member features require an account. Keep the value proposition visible before asking the customer to sign in.
- Preserve a return path through sign-in so a customer resumes the task they started. Handle cancelled/blocked popups, unauthorized domains, network failures and sign-out with actionable, non-technical messages.
- After sign-in, guide customers to complete essential profile details, then offer notification setup and a real test. Notification permission remains controlled by the browser/OS; do not imply it can be forced or that permission alone proves delivery.
- Member value: private updates from Frank, new-drop/catalogue-reorganisation notices, published member offers, account-linked private inquiries, request/order status, and legitimate recorded rewards. Do not invent active offers, deadlines, winners, stock, balances or discounts.
- Customers can privately reply to an announcement with its context attached. Keep conversations scoped to their authenticated customer ID; admins remain role-controlled.
- The private feed must never feel empty: when there are no live posts, show clearly labelled evergreen programme information and examples of possible member benefits, not fake announcements or active promotions.

## Customer sourcing and commercial workflow
1. Customer shares a listed item or submits a sourcing request while signed in.
2. Frank checks the sourcing route.
3. Frank confirms the current quote and delivery expectation.
4. Customer pays the agreed 50% deposit before sourcing begins.
5. Frank records the quote, deposit and order state.
6. Status progresses through sourcing to delivery/collection.
- Request flow captures product/name/link or screenshot, desired size, colour, notes and contact details.
- Never claim a quote, stock position, sourcing acceptance, deposit receipt, reward, winner, or delivery date until the business records it.
- The usual guide may be 3–4 weeks, but the actual expectation must be communicated for each order.
- WhatsApp/phone +267 76 411 150 is the explicit direct fallback if The Plug cannot safely save or deliver a request.
- BOEMO order/conversation infrastructure is a code-pattern foundation only. Remove food-specific wording and never use BOEMO Firebase project credentials, data, service-worker configuration or deployment target.

## Member feed, incentives and admin
- Add a simple admin publishing workflow: update type, title/message, audience, optional media/link, publish/schedule state and explicit validity window when applicable.
- Update types may include announcement, new drop, catalogue reorganisation, member offer, service update and winner/reward notice.
- Feed posts and offers must have clear lifecycle/status (draft, scheduled, published, expired/archived). A countdown is allowed only when a real end timestamp is saved and visible; expired offers must stop presenting as active.
- Announcement replies should open a private conversation linked to the announcement ID/title; do not expose customer messages to other customers.
- Reward/loyalty and “order lotto” outcomes must be recorded, auditable, and tied to clear rules. Never randomly or automatically claim a winner/discount without an admin-recorded outcome.
- Keep admin lightweight: sourcing requests/orders, quote/deposit recording, customer communication, announcements/offers, and verified-data preparation. Do not build an ERP.
- The verified product inventory file and unresolved-data list are a later deliverable, after the customer journey and admin publishing workflow are ready. Do not build or pay for catalogue integration until available data sources are inspected and the inventory requirements are known.
- Do not create a second product-entry system by default. WhatsApp Business remains the current catalogue source of truth until a deliberate migration is approved. Links/screenshots do not prove stock, current price, sizes, authenticity or sourcing availability.

## Data and security
- Firebase rules are the security boundary, not just UI hiding. Customer profiles, requests, messages, tokens and orders must be owner-scoped; admin writes must be role-controlled.
- Review Firestore and Storage rules before adding any collection or write path. Do not loosen default-deny rules broadly.
- Never commit secrets. The Plug must use its own Firebase project. Keep environment placeholders blank only for build/prerender fallback; do not claim production auth/FCM is connected until verified.
- Do not broadly cache private customer data, private feed responses, account pages, messages, tokens or admin screens in the service worker.

## Notifications
- Reuse the proven shape of the BOEMO notification UX only, not BOEMO project settings, keys, payload assumptions or business logic.
- Web push requires HTTPS, correct Firebase web-push configuration, a service worker, browser permission, a valid registration/token, server credentials and device/browser support.
- Ask permission in context after explaining the benefit; avoid prompting on first paint. Make enable/test states explicit: unsupported, permission denied, setup incomplete, token registered, test requested, confirmed response, and failure. Never call a server HTTP response proof that the OS displayed a notification.
- A test should provide a clear next step and distinguish foreground/in-app feedback from a system notification. Keep WhatsApp as fallback where push is unavailable.

## Browser, PWA and offline
- The Plug is commonly opened from WhatsApp/social links, including embedded in-app browsers.
- Detect embedded browsers from server request headers and pass the result into one client-side PWA gate, so a branded, accessible dialog is present in the initial server-rendered HTML. No duplicate/legacy embedded-browser prompts.
- The embedded-browser gate must lock background scrolling, retain keyboard focus, prevent Escape from dismissing a blocking gate, and present one clear primary OPEN IN CHROME / OPEN IN BROWSER action. Do not strand the customer in the embedded browser with a dismiss-only control.
- After reaching a normal browser, do not block ordinary browsing with an automatic install modal. Offer a visible, non-disruptive install action; invoke the browser's proper install prompt only from the customer's click when supported. Otherwise give platform-specific instructions on request. Respect prior dismissal and standalone/installed state.
- Never use JavaScript alerts for install guidance. Do not present Add to Home Screen as the generic primary fallback; iPhone/iPad instructions may explain Safari's share → Add to Home Screen flow. Browser chrome/address-bar labels are controlled by the browser/host app, not The Plug.
- Keep app shell, offline route, manifest, service-worker update flow and Firestore persistence. Cached pages are not proof that a request/message reached Frank. Show honest local/queued/syncing/confirmed/failed states; do not duplicate writes on retry.
- Use concise, purposeful emojis paired with words, visible action cues, clear status feedback and responsive layouts. Avoid stacked overlays, ambiguous buttons and decorative motion that competes with the task.

## UX and accessibility research standard
- Use current primary sources where possible: web.dev/MDN for PWA install behavior, Firebase documentation for push/auth, W3C WCAG for accessibility, and credible usability research (e.g. Nielsen Norman Group) for ecommerce hierarchy and feedback.
- Make product imagery/selection controls prominent when real verified inventory is available; use search/filter and clear next actions rather than fake product data.
- Use motion to signal state changes, focus or navigation—not as decoration. Respect `prefers-reduced-motion`, avoid flashing/continuous distracting motion, maintain visible focus, semantic headings, labels, keyboard operation, adequate contrast and comfortable touch targets.
- Do not use psychological research as a pretext for dark patterns, false urgency, fake scarcity, guilt, or notification coercion. Explain member value honestly and let the customer make informed choices.

## Verification
- Before a meaningful checkpoint run: `npx tsc --noEmit`, `npm run lint`, `npm run build`.
- Inspect actual diff and repository status before committing. Verify public browser/deployment behavior when tools allow it.
- Do not tell the user to QA before the source change is committed and the deployment is READY. If local verification is unavailable through repository tooling, state that limitation rather than pretending tests ran.
- Do not push speculative commits merely to trigger Vercel. Confirm the exact commit and READY deployment alias.

## Recovery
The BOEMO foundation commit remains a reference for infrastructure behavior only. If The Plug work breaks offline/auth/notification/PWA infrastructure, stop and compare the actual behavior to the foundation rather than layering fixes blindly.
