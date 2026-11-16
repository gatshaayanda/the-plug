# The Plug — Customer receipts, rewards and operations

## Customer receipts & payments

Authorized staff record each received payment against a confirmed sourcing quote. Each entry stores amount, method, timestamp, optional reference and a stable payment ID. My Plug renders one printable acknowledgement per payment and shows the request quote, cumulative recorded payments and remaining balance.

The acknowledgement is deliberately not called a tax invoice or proof from a payment processor. It reflects a staff-entered record. Quotes, requested deposits and unrecorded transfers are not receipts. Older aggregate deposit entries remain visible as legacy records with missing-date disclosure; the first new ledger entry preserves that legacy amount.

## Rewards

The rewards wallet is a private record of specific benefits issued by staff. A reward has a title, plain-language terms, optional code, optional expiry, source completed request, issue timestamp and status. Staff may issue only against a Delivered or Collected request whose cumulative recorded payments meet or exceed the confirmed quote, and mark an available reward redeemed. Customers cannot award or redeem themselves. No points, cash value, discount or automatic eligibility is implied.

The account shows factual completed-purchase and reward-issued counts. No progress bar is shown until a real reward target and earning rules are defined.

## Research applied carefully

- Kivetz, Urminsky & Zheng (2006), The Goal-Gradient Hypothesis Resurrected: https://journals.sagepub.com/doi/full/10.1509/jmkr.43.1.39
- Yang et al. (2021), Managing loyalty program communications in the digital era: Does culture matter?: https://www.sciencedirect.com/science/article/pii/S0969698921000424
- Belli et al. (2022), 40 years of loyalty programs: how effective are they?: https://link.springer.com/article/10.1007/s11747-021-00804-z
- EY 2025 Loyalty Market Study: https://www.ey.com/content/dam/ey-unified-site/ey-com/en-us/campaigns/cmo/documents/ey-loyalty-market-study-2025.pdf

Research suggests that loyalty effects and progress framing vary by customer, culture, product and program design. The implementation therefore favors accurate to-date information, clear terms and useful, personally issued benefits—not fabricated progress or guaranteed psychological outcomes.

## Admin operations

The admin interface uses Iteration13's Data + Quiet direction: compact authorized-staff identity, clear task navigation, high-contrast surfaces, the sourcing queue and request editor ahead of secondary analytics and commercial reporting. Existing request transitions, storefront publishing, demand analytics and private inbox are preserved.

## Security and verification

- customerRewards: customer-owner/admin reads; admin-only creation; source request must belong to the customer and be Delivered/Collected; admin-only one-way redemption; no deletion.
- Payment ledger entries are stored on the protected sourcing request; request writes remain admin-only.
- A production Firebase rules deployment and end-to-end authorization/payment/reward tests are required before claiming production readiness.
