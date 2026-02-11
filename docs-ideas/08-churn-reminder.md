# Idea 5: Churn / renewal reminder

**Goal:** Remind users before a card's annual fee hits or before they're "safe" to product-switch or cancel (e.g. 11–12 months after opening) so they don't forget to optimize.

**What we build**
- For each Open card with openDate: compute "renewal window" (e.g. 11 months after open).
- In-app list or dashboard widget: "Coming up: Card X renewal in [date]" with actions: "Product switch?", "Cancel?", "Keep?".
- Optional: email reminder 30 days before.

**Data**
- Uses Card.openDate, Card.annualCost. Optional: user preference "remind me N days before renewal".

**Phases**
1. Compute "renewal in X days" per card; show on dashboard or "My cards" (e.g. badge or section).
2. Dedicated "Renewals" page or section: list by date, add notes ("I'll product switch").
3. Optional: email reminder job; user setting for reminder offset.

**Dependencies:** None; uses existing card + open date.
