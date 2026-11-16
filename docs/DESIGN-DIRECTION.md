# The Plug — Design direction

**Updated:** 16 November 2026  
**Reference:** Iteration13 customer-first app shell and visual/operational standards.

## Product genre

The Plug is a curated sneaker and apparel sourcing storefront. Its primary customer task is to discover a real published find, inspect it, and continue into a private account request without losing the selected item.

- **Dominant: Loud editorial retail.** Product imagery and confident typographic composition make the merchandise the centre of the experience.
- **Secondary: Atmosphere.** Use the featured hero artwork to give Frank's current pick a distinctive campaign/editorial stage.
- **Secondary: Quiet + Data.** My Plug, request progress, quotes, deposits and conversations need compact, calm, scannable layouts and truthful operational status.

## Visual system

- Palette: near-black ink, warm neutral/paper surfaces, white and The Plug cobalt (#0866ff) for primary actions. Use red only as a restrained accent where it already exists.
- Typography: strong compact sans-serif headlines; readable body copy; small uppercase kickers for editorial metadata; avoid long all-caps paragraphs.
- Composition: product image first, title and price grouped together, one unmistakable primary action. Use consistent gutters and compact vertical rhythm; avoid large explanatory blocks.
- Product imagery: use Frank's actual uploaded images. Never replace a missing product image with generated or stock imagery. Keep decorative hero layers behind the image.
- Controls: use full-width, high-contrast selection buttons for “View details” and “Continue in My Plug”. Save/share remain distinct secondary actions.
- Motion: restrained entrance/reveal, slight image hover and purposeful state feedback. Respect reduced motion and never hijack scroll or auto-advance product rails.

## Customer flow

1. Storefront shows real published finds and active offers.
2. “View details” on a card or hero opens the product details modal.
3. “Continue in My Plug” opens the customer account with product, item type and listed BWP price prefilled.
4. Customer submits from the account composer; existing Firebase/UploadThing/request/conversation logic remains the single source of truth.
5. Successful save returns to My Plug with the new request pinned and visibly confirmed.

The listed BWP price is only the price shown when the customer opened the request. It is not a payment, reservation or final quote. Frank confirms availability and final price.

## Standards to apply

Use Iteration13's VISUAL-DIRECTION-STANDARD.md, DESIGN-INTELLIGENCE-AND-EXPERIENCE-QUALITY-STANDARD.md, OPERATIONAL-TRANSPARENCY-STANDARD.md and docs/assets/washride-home-reference.jpeg as supporting standards/reference. Apply their mobile-first compactness, purposeful hierarchy, readable contrast, accessible touch targets, real loading/saving/error states and reduced-motion requirements. This document records The Plug's specific expression; it does not replace those standards.
