# Backend data to add for the jumbotron

List of information that should be added on the backend so the Card Details jumbotron can be fully driven by API data (no mock). **Do not implement yet** — this is a checklist for a future phase.

---

## 1. ScrapedCard (catalogue)

Used by: GET `/api/available-cards`, GET `/api/available-cards/:id`.

| Field / concept | Type | Purpose | Notes |
|----------------|------|---------|--------|
| **subscribeUrl** | `String?` | "Subscribe to this card" link in jumbotron. | Frontend already uses `card.subscribeUrl`; API does not expose it (not in schema). Scraper would need to capture application/subscribe URL from Milesopedia (or elsewhere). |
| **tags** | `String[]` or JSON / relation | Jumbotron tags (e.g. "First year free", "Travel", "Lounge access", "No FX fee", "Insurance"). | Currently mock in frontend (`jumbotronTags`). Could be scraped (from card page) or curated per card. |
| **highlights** | JSON array `[{ label: string, detail?: string }]` or relation | Jumbotron bullet list (e.g. "Annual fee waived first year · then $120/year", "Complimentary lounge visits · 4 per year"). | Currently mock in frontend (`jumbotronHighlights`). Could be scraped or derived from structured fields. |

**Already present and used:** `id`, `cardName`, `type`, `bank`, `pointsType`, `annualCost`, `welcomeValueY1`, `minSpend`, `bonusDetails`, `milesopediaUrl`, `milesopediaSlug`, `bonusLevels` (with `order`, `spendAmount`, `monthsFromOpen`, `rewardPoints`), `createdAt`, `updatedAt`.

**Optional API only:** Expose `updatedAt` in a human-friendly way for "Offer updated X days ago" (already in serialize; frontend can use it).

---

## 2. Card (tracked)

Used by: GET `/api/cards/:id`.

| Field / concept | Type | Purpose | Notes |
|----------------|------|---------|--------|
| **bonusDetails** | `String?` | One-line offer text for jumbotron (e.g. "50,000 pts after $5,000 spend in 3 months"). | Frontend today builds from `bonusLevels` when missing. Storing it on Card avoids re-deriving and matches catalogue copy when card was created from ScrapedCard. Could be copied from ScrapedCard at creation. |

**Already present and used:** `id`, `cardName`, `type`, `status`, `bank`, `pointsType`, `annualCost`, `expenses`, `deadline`, `rewardPoints`, `pointsValue`, `milesopediaUrl`, `milesopediaSlug`, `bonusLevels` (with `spendAmount`, `monthsFromOpen`, `rewardPoints`, etc.).

No other jumbotron-specific fields required on Card if tags/highlights are only on ScrapedCard and the app enriches the tracked view with catalogue data when `milesopediaSlug` is set (see below).

---

## 3. API behaviour (no new models)

| Change | Purpose |
|--------|---------|
| **GET /api/available-cards/:id** (and list) | Include new ScrapedCard fields when added: `subscribeUrl`, `tags`, `highlights`. |
| **GET /api/cards/:id** | Include `bonusDetails` when added. Optionally: when Card has `milesopediaSlug`, return embedded or linked catalogue snippet (e.g. `catalogueCard: { tags, highlights, subscribeUrl }`) so the tracked jumbotron can show the same tags/highlights without duplicating them on Card. |

---

## 4. Scraper / ingestion

| Change | Purpose |
|--------|---------|
| **Milesopedia (or source) scraper** | Populate `subscribeUrl` if we add it (e.g. link to apply/subscribe on the card page). |
| **Tags / highlights** | Either: (1) scrape from card page content, or (2) maintain a curated mapping (e.g. by `milesopediaSlug` or card name) and write to ScrapedCard when refreshing catalogue. |

---

## 5. Summary table

| Data | Where it lives today | Backend add |
|------|----------------------|-------------|
| Card name, bank, type, points program | ScrapedCard / Card | — |
| Bonus pts, min spend, window, estimated value | ScrapedCard (levels, welcomeValueY1) / Card (levels, expenses, rewardPoints, pointsValue, deadline) | — |
| Annual cost | ScrapedCard / Card | — |
| Bonus offer line | ScrapedCard.bonusDetails / Card: derived from levels | Card: **bonusDetails** (optional) |
| Subscribe link | Frontend expects subscribeUrl; not in schema | ScrapedCard: **subscribeUrl** + scraper |
| Jumbotron tags | Frontend mock | ScrapedCard: **tags** (array or JSON) + scraper/curation |
| Jumbotron highlights | Frontend mock | ScrapedCard: **highlights** (JSON) + scraper/curation |
| "Offer updated" | — | Optional: use existing ScrapedCard.updatedAt in API/UI |

---

## 6. Out of scope for this list

- **On pace?** – Derived on frontend from deadline and spend; no new backend field.
- **Spend to go / days left** – Derived from existing Card fields.
- **Progress (bonus pts / spend)** – Already from Card and bonus levels.
- Changes to other sections of the Card Details page (rewards structure, milestones, etc.).
