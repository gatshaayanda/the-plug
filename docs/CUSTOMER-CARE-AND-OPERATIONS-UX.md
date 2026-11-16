# Customer Care & Operations UX Standard

Updated: 16 November 2026

This document records the customer-care and staff-operations decisions implemented in The Plug. The interface follows the compact, task-first app-shell principles in the Admin Hub / Iteration13 visual direction: clear hierarchy, one obvious next action, readable contrast, restrained colour, mobile-first density and operational transparency.

## Customer care: My Plug

My Plug is the customer's ongoing care account, not a marketing landing page or a detached request form. The primary destinations are Store, My requests, Messages, Receipts, Rewards and My details. Keep account connection, notifications and social/circle settings secondary to the active customer relationship.

### Receipts & payments

- A receipt-like record is created only when staff explicitly records money received against a customer-approved quote.
- Each payment record contains its own amount, method, optional reference and timestamp, and is tied to the sourcing request.
- Partial payments appear as individual payment acknowledgements; remaining balance is calculated against the current confirmed quote.
- A quote, deposit request, payment intent or customer-submitted claim is not a payment receipt.
- The document is labelled **Payment acknowledgement**, and explicitly says it is an operational record entered by The Plug—not a tax invoice, payment processor confirmation or independent proof of funds.
- Customers can print/save the acknowledgement as PDF from My Plug.
- Existing legacy deposit totals remain visible as legacy records, with missing dates disclosed rather than invented.

### Rewards

- There is no fabricated points balance, tier, progress bar, automatic discount or promise of a reward.
- Frank issues a specific benefit with clear description/terms, optional code and optional expiry.
- Reward eligibility is currently restricted to a request marked Delivered or Collected, with recorded payments covering the full confirmed quote.
- The reward is private to the customer account that owns the originating request.
- Staff can mark an available reward redeemed; customers can see available, redeemed and expired states. Expiry is calculated from the recorded expiry date.
- A reward is a specific benefit, not cash. Terms and redemption are confirmed by The Plug.

### Trust and usability principles

- Show the transaction state, amount, date, method and reference together; distinguish recorded facts from pending actions and estimates.
- Preserve customer control: no opt-in marketing, surprise discounts, automatic reward claims or forced Google connection.
- Use concrete language and explicit eligibility rather than vague gamified promises.
- Keep receipts and rewards discoverable in the customer app shell, but don't let optional benefits distract from requests, messages and fulfilment.
- Keep the interface readable: strong text contrast, visible labels, clear empty/error/loading states, keyboard-operable controls and reduced-motion support.

## Staff operations

The admin dashboard follows Iteration13's task-first operations pattern:

1. Operations identity and direct links to the storefront studio, community feed and live storefront.
2. Storefront product management as a distinct, obvious workflow.
3. Customer-journey signals with explicit caveats: interactions are not unique customers, paid orders or confirmed sales.
4. Commercial snapshot with open quoted value, payments recorded, fulfilled quote value and work awaiting action.
5. Sourcing queue and customer inbox for day-to-day work.
6. Itemised payment capture and customer reward issuance within the relevant staff workflow.

Staff must approve the exact quote in My Plug before recording payment. Payment entries cannot exceed the confirmed quote. A reward cannot be issued until the request is delivered/collected and fully paid. Operational status and manually recorded money must never be described as independently verified revenue or profit.

## Research notes informing the design

These studies inform the interaction principles; they do not justify inventing a loyalty scheme or manipulating customers with fake progress.

- Kivetz, Urminsky & Zheng (2006), *The Goal-Gradient Hypothesis Resurrected: Purchase Acceleration, Illusionary Goal Progress, and Customer Retention*, Journal of Marketing Research. The research supports the motivational role of genuine progress toward a real reward. The Plug therefore does not display progress toward a reward until an actual programme and threshold exist. https://journals.sagepub.com/doi/full/10.1509/jmkr.43.1.39
- *Managing loyalty program communications in the digital era: Does culture matter?* (2021), Journal of Retailing and Consumer Services. Experimental work finds that progress framing effects vary across cultural contexts. The Plug uses plain factual states instead of assuming one motivational framing works for every customer. https://www.sciencedirect.com/science/article/pii/S0969698921000424
- Khamitov et al. (2025), *The Visual Moderation Effect: How the Representation of Loyalty Reward Progress Affects Consumer Judgments and Behaviors*, Journal of the Academy of Marketing Science. Across nine studies, visual progress displays can distort perceived progress. The Plug avoids ambiguous reward progress graphics and shows concrete issued benefits and dates. https://doi.org/10.1007/S11747-025-01133-1
- Ko & Song (2024), *Nonlinear Reward Gradient Behavior in Customer Reward and Loyalty Programs*, Journal of Hospitality & Tourism Research. Reward motivation changes with proximity and is not a simple linear meter. This supports not adding arbitrary progress bars without a defined programme. https://doi.org/10.1177/10963480231226083
- Buell & Norton (2011), *The Labor Illusion: How Operational Transparency Increases Perceived Value for Consumers*, Management Science. Operational transparency can make service work more visible; staff and customer records should therefore show what actually happened and who recorded it, without overstating outcomes. https://pubsonline.informs.org/doi/abs/10.1287/mnsc.1110.1376

## QA acceptance checklist

- A customer can open My Plug and navigate to each real destination on desktop and phone.
- No payment acknowledgement appears for an unrecorded quote or requested deposit.
- Each staff-recorded partial payment appears separately with accurate details and remaining balance.
- A full-payment delivered/collected request can receive a reward; an unpaid, partially paid or unfulfilled request cannot.
- A reward appears only in the owning customer's account and staff can mark it redeemed.
- No fake points, tiers, discounts, sales attribution or completed-purchase counts are displayed.
- Staff can distinguish customer interest, submitted requests, manually recorded payments and delivered/collected work.
- Admin layout remains task-first and readable at phone widths; no horizontal overflow or low-contrast text.
- Firebase rules remain the enforcement boundary; hiding a control in the UI is not authorization.
