# Idea 14: Share card offer (refer-a-friend to apply)

**Goal:** Let users share a specific card offer (from catalogue) with a friend — "Apply here" link. If we have affiliate links, we can earn when they apply; otherwise it's just shareable link for better UX.

**What we build**
- On catalogue card: "Share this offer" → copy link (e.g. /available-cards?highlight=slug or public page /offer/slug) or pre-filled "Email this to a friend" (we send email with link).
- Public landing page (optional): /offer/:slug shows card name, bonus, min spend, CTA "Apply on [bank site]" (we link to Milesopedia or bank). No login required.
- If we ever have affiliate agreements: use affiliate link in CTA and track (e.g. referral ID in URL).

**Data**
- Optional: track share events (userId, cardSlug, method, createdAt) for analytics or affiliate. Public offer page is read-only from catalogue.

**Phases**
1. Share dialog: copy link; optional email form (we send one email with link).
2. Public /offer/:slug page: read from catalogue by slug; show summary + CTA to external apply link.
3. Optional: affiliate link integration; track clicks/applications.

**Dependencies:** Optional affiliate program; email send for "email to friend".
