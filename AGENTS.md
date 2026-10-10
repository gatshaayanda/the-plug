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
- The Plug is install-first through its public landing page: keep the primary “Install The Plug” CTA visible with concise benefits and branded visuals.
- Match the working PurePress/Admin Hub install control: an explicit “Install The Plug” click invokes the retained `beforeinstallprompt` event directly, so the browser's native installation prompt is the next screen. Do not interpose a second Android/desktop instruction modal or a “Continue in browser” detour.
- Do not auto-open a blocking install modal on page load or private/account routes. The browser/OS owns final consent. On iOS Safari only, where `beforeinstallprompt` is unavailable, a concise Share → Add to Home Screen path is acceptable.
- A missing `beforeinstallprompt` event must never make an install CTA silently do nothing. Keep a persistent branded install action visible outside standalone/embedded-gate states. If the retained native event exists, invoke it directly from the user's click. If it does not, show the branded, platform-specific fallback used by Odi: Safari Share → Add to Home Screen on iOS; concise Chrome install-menu steps on Android; Chrome/Edge install-app steps on desktop. Continue investigating manifest/installability and do not claim JavaScript can force the native prompt.
- Remember install-card dismissal across reloads for seven days, matching PurePress's respectful dismissal pattern. Clear dismissal after `appinstalled`. Installed/standalone state must suppress the install journey.
- Embedded-browser guidance remains a separate branded blocking gate with one clear OPEN IN CHROME / OPEN IN BROWSER action; do not confuse it with install promotion or show two overlays.
- Never use JavaScript alerts for install guidance. Do not present Add to Home Screen as the generic primary fallback. Browser chrome/address-bar labels are controlled by the browser/host app, not The Plug.
- Keep app shell, offline route, manifest, service-worker update flow and Firestore persistence. Cached pages are not proof that a request/message reached Frank. Show honest local/queued/syncing/confirmed/failed states; do not duplicate writes on retry.
- Use concise, purposeful emojis paired with words, visible action cues, clear status feedback and responsive layouts. Avoid stacked overlays, ambiguous buttons and decorative motion that competes with the task.

## UX and accessibility research standard
- Use current primary sources where possible: web.dev/MDN for PWA install behavior, Firebase documentation for push/auth, W3C WCAG for accessibility, and credible usability research (e.g. Nielsen Norman Group) for ecommerce hierarchy and feedback.
- Make product imagery/selection controls prominent when real verified inventory is available; use search/filter and clear next actions rather than fake product data.
- Use motion to signal state changes, focus or navigation—not as decoration. Respect `prefers-reduced-motion`, avoid flashing/continuous distracting motion, maintain visible focus, semantic headings, labels, keyboard operation, adequate contrast and comfortable touch targets.
- Do not use psychological research as a pretext for dark patterns, false urgency, fake scarcity, guilt, or notification coercion. Explain member value honestly and let the customer make an informed choice.

## Verification
- Before a meaningful checkpoint run: `npx tsc --noEmit`, `npm run lint`, `npm run build`.
- Inspect actual diff and repository status before committing. Verify public browser/deployment behavior when tools allow it.
- Do not tell the user to QA before the source change is committed and the deployment is READY. If local verification is unavailable through repository tooling, state that limitation rather than pretending tests ran.
- Do not push speculative commits merely to trigger Vercel. Confirm the exact commit and READY deployment alias.

## Recovery
The BOEMO foundation commit remains a reference for infrastructure behavior only. If The Plug work breaks offline/auth/notification/PWA infrastructure, stop and compare the actual behavior to the foundation rather than layering fixes blindly.

## Install/auth incident hardening (2026-10-09)
- Never auto-open a blocking install modal on every route. A non-blocking branded install card may appear automatically on the public homepage only when native installation is available, or on iOS Safari's supported manual path; never show this promotion over private/account tasks. The homepage also keeps its visible hero/header CTA. Keep one install state machine; do not stack overlays or navigate/loop when dismissed.
- Install controls on every route dispatch one stable event to the root PWA controller. When a retained native install event exists, call it directly from the customer's click. The controller must not intercept route navigation or render the homepage as a fallback for private routes. Confirm /, /account, /request, and /offline each return their own route content online and offline; do not precache or return private authenticated HTML as a generic shell.
- Treat missing Firebase web configuration as a deployment configuration failure, not as a Firebase Auth user error. Never substitute fake placeholder project IDs/API keys in a live browser build and then expose raw Firebase exceptions. Keep build/prerender safe, detect configuration completeness before initializing Auth, and show a clear actionable message that Google sign-in is unavailable until the real The Plug Firebase web config is set.
- Before claiming Google sign-in works, verify the production Vercel environment contains the required The Plug-specific NEXT_PUBLIC_FIREBASE_* values, Google provider is enabled in that Firebase project, and the actual production domain is authorized. Never copy credentials or project settings from BOEMO or another client.
- When the install or auth experience loops, inspect route tree, PWA root component lifecycle, service-worker fetch/cache strategy, production deployment source SHA, and Vercel environment variable presence before changing code. Cache-version bumps alone are not a fix.
- UX principle: offer a clear install value proposition on the landing page before asking for installation. Respectful dismissal must leave the user on the route they chose. The browser/OS remains the final installation consent surface. If the native install event is absent, never leave the install control inert: show a branded, platform-specific fallback with concise steps, while continuing to investigate why native installability/event delivery is absent. Do not imply JavaScript can force a native prompt.


## PWA manifest single source of truth (2026-10-10)
- In this Next.js App Router project, `src/app/manifest.ts` is the canonical generated manifest route and must contain the complete installability metadata, including explicit 192×192 and 512×512 PNG icons. Do not assume `public/manifest.webmanifest` is what Chrome receives when the generated route exists.
- Whenever manifest/icon installability metadata changes, bump the service-worker cache version in `public/sw.js` so an older cached `/manifest.webmanifest` cannot keep Chrome evaluating stale metadata.
- Verify the generated production manifest and each declared icon URL, then inspect Chrome's installability diagnostics before claiming the native prompt works.


## Golden system: WhatsApp embedded browser → normal browser → install (2026-10-10)
This is a reusable product pattern, not a one-off The Plug workaround. Reproduce it for new projects and audit/upgrade it in existing projects. Treat the full journey as one intentional, tested system with two separate states: **escape the embedded browser**, then **install from the real browser**.

### Required customer journey
1. **Entry from WhatsApp or another embedded browser:** detect the in-app browser reliably. Present one branded, accessible blocking gate in the initial render, explaining briefly why opening the normal browser matters. Do not stack overlays, use JavaScript alerts, or leave only a dismiss/cancel action.
2. **One clear escape action:** provide one obvious primary action such as **OPEN IN CHROME** or **OPEN IN BROWSER**, using a valid platform-appropriate external-browser handoff/deep link when supported. Preserve a sensible fallback if the host app cannot launch the external browser. Do not claim the handoff succeeded unless it is observable.
3. **Normal-browser landing:** once the customer reaches Chrome, Safari, Edge, or another supported browser, show the real app/landing page—not a loop back into the embedded-browser gate. The embedded-browser gate and install promotion are separate UI states and must not appear as competing overlays.
4. **Visible install action:** in the normal browser, keep a clear branded **Install [App Name]** action available until the app is installed or running in standalone mode. Explain the concrete benefit briefly. Hide the install promotion in standalone mode and while the embedded-browser gate is active.
5. **Native prompt first:** retain the `beforeinstallprompt` event when the browser fires it. On the customer's explicit install-button click, invoke that retained event directly from the user gesture. Do not insert a second Android/desktop instructions modal, another “continue in browser” step, or unrelated confirmation between the click and the native prompt.
6. **Never silently fail:** if no native event is available, the install action must still respond. Open a branded, concise platform-specific help panel (iOS Safari Share → Add to Home Screen; Android Chrome install option; desktop Chrome/Edge install option) and show an actionable state. This fallback is a fallback—not proof the native prompt is broken permanently and not permission to stop investigating installability.
7. **Respect the platform:** the browser/OS controls whether the native prompt is eligible and what it looks like. JavaScript cannot force it. iOS generally needs its supported manual installation path. Do not promise a prompt on every visit or automatically open a blocking install modal on page load.
8. **Installed/dismissed states:** detect standalone/installed state and suppress the journey. If the product uses a dismissible install card, persist dismissal according to the project's documented policy and clear it after `appinstalled` where appropriate. A dismissal must not redirect the customer or block normal app use.
9. **One controller/state machine:** use a single root PWA controller and stable event contract for install CTAs across routes. Do not add duplicate listeners, competing legacy prompts, nested gates, alert boxes, or route-navigation hacks. Keep the WhatsApp handoff gate independent from the install prompt state.

### Required implementation and verification protocol
- **START → INSPECT → BUILD → VERIFY → CHECKPOINT.** Read `AGENTS.md`, inspect the actual routes/layout, root PWA controller, install buttons, manifest, icon assets, service worker/cache strategy, browser detection/handoff logic, recent Git commits, and production deployment before editing. Do not assume a cloned project's inherited install system is correct.
- For a new project, implement this journey deliberately from the start. For an existing project, map the current behavior against every step above and repair the smallest real cause; do not blindly copy code or cache-version bumps from another app.
- Inspect manifest output and every declared icon URL; verify HTTPS, standalone/display metadata, service-worker registration/scope, event capture timing, and browser-specific installability diagnostics where tools permit. Make sure early `beforeinstallprompt` capture cannot be missed due to hydration/timing.
- Test the two transitions separately: (A) opening from WhatsApp reaches the normal browser without an endless loop; (B) in the normal browser, the install button directly opens the native prompt when the event exists, and shows the branded fallback when it does not. Also test already-installed/standalone state and ordinary direct browser entry.
- Check the actual changed diff, run available type/lint/build checks, commit/push, and verify the exact Vercel deployment for the new source SHA is **READY** before asking the user to test. Do not claim live behavior based on source code, an earlier deployment, or a cached page.
- When a deployment is READY, report the commit and deployment state honestly. If public inspection is blocked or the browser cannot be driven with available tools, say exactly what could and could not be verified—never invent a successful test.
- Preserve this pattern in the destination project's `AGENTS.md` after implementing it. Record app-specific paths, handoff method, install controller/event, manifest route, service-worker cache version, test evidence, and any unresolved browser/platform limitation.

### Copyable acceptance checklist
- [ ] WhatsApp embedded entry shows one branded blocking gate with one clear open-in-browser action.
- [ ] The handoff reaches the normal browser and does not loop back into WhatsApp or strand the user.
- [ ] Normal-browser page displays one clear branded install action.
- [ ] When `beforeinstallprompt` exists, clicking Install invokes the native prompt directly.
- [ ] When it does not exist, clicking Install opens helpful branded platform-specific guidance—never a dead button.
- [ ] No stacked overlays, JavaScript alerts, duplicate controllers, or unrelated detours.
- [ ] Standalone/installed state suppresses install UI; dismissal does not hijack navigation.
- [ ] Manifest, icons, service worker, cache version, event timing, and installability were inspected.
- [ ] The exact source commit's Vercel production deployment is READY before customer QA is requested.
