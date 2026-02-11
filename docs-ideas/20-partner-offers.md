# Idea 19: Partner offers (promoted deals)

**Goal:** Let partners (e.g. travel agencies, financial advisors) promote offers to our users in a controlled way — we get revenue share or fee; users see relevant offers if they opt in.

**What we build**
- "Partner offer" slot: e.g. banner or card on dashboard or in email: "Partner: [Name] — [Offer] — CTA". User can dismiss or click. Only shown if user has not opted out of "promotional content".
- Backend: `PartnerOffer` (id, partnerId, title, copy, ctaUrl, imageUrl, startDate, endDate, targetCriteria optional). `Partner` (id, name, contract). Track impressions and clicks (optional).
- Admin: superadmin or partner portal to create offers; we approve and schedule.

**Data**
- New: `Partner`, `PartnerOffer`. Optional: `PartnerOfferClick` or impression log. User: `optedOutOfPromo` or `marketingConsent`.

**Phases**
1. PartnerOffer model + API (list active offers for user; optional targeting by segment). Frontend: one slot on dashboard or in digest email.
2. Consent: in profile, "Receive offers from partners" toggle. Only show if consent and offer active.
3. Partner admin or form to submit offer; we publish. Optional: revenue share tracking.

**Dependencies:** Legal (consent, disclosure); partner contracts. Good for monetization.
