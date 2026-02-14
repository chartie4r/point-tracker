# Plan: Crawl multi-level bonus details from Milesopedia

## Goal

Extract and store **tiered welcome bonus levels** from Milesopedia card pages (e.g. Scotiabank Passport Visa Infinite: 40,000 pts after $2k in 3 months, 10,000 pts after $10k in 6 months, 10,000 pts after $40k in first year) so the catalogue and "Add to my cards" can use structured levels instead of only a single `minSpend` and free-text `minSpendNotes`.

## Source of truth on the page

From [Scotiabank Passport Visa Infinite](https://milesopedia.com/en/credit-cards/scotiabank-passport-visa-infinite-card/):

- **Embedded JSON** (in page HTML) usually has **one** tier: `"minimum_spending":"$2,000"`, `"minimum_spending_timeframe_months":"3 month(s)"`, `"mc_welcome_bonus_amount":"60000"`.
- The **multi-tier breakdown** appears in the **"Our review"** section as prose:
  - "**40,000 points** after $2,000 in purchases within the first three months"
  - "**10,000 points** after $10,000 in purchases within the first six months"
  - "10,000 points after $40,000 in purchases in the first year"

So we need to **parse that section** (or equivalent FR: "Notre avis" / "X points après Y $ d'achats dans les X premiers mois") to get an ordered list of levels.

## Data model

### Option A (recommended): Child table `ScrapedBonusLevel`

- Same idea as `CardBonusLevel` for user cards, but for the catalogue.
- **ScrapedBonusLevel**: `id`, `scrapedCardId` (FK), `order` (Int), `spendAmount` (Int?), `monthsFromOpen` (Int?), `rewardPoints` (Int?), optional `requirementType` / `minTransactions` if we ever see "1 transaction" tiers.
- **ScrapedCard** gets relation `bonusLevels ScrapedBonusLevel[]`.
- Pros: Normalized, easy to prefill user `CardBonusLevel` when adding from catalogue; consistent with existing CardBonusLevel shape. Cons: One more table and replace logic on refresh.

### Option B: JSON column on ScrapedCard

- Add `bonusLevelsJson` (or `bonus_levels`) to ScrapedCard storing `[{ order, spendAmount, monthsFromOpen, rewardPoints }, ...]`.
- Pros: No new table; simple. Cons: Harder to query/filter by level; prefill still needs mapping.

**Recommendation:** Option A so catalogue levels and user card levels share the same structure and we can copy levels when user adds a card.

## Extraction strategy

### 1. Regex-based parser (no AI)

- **Target section:** Locate "Our review" / "Notre avis" (or the block that contains bullet lines like "X points after $Y in ... first N months").
- **Patterns (EN):**
  - `(\d{1,3}(?:,\d{3})*)\s*points?\s+after\s+\$?([\d,]+)\s+in\s+purchases?\s+within\s+the\s+first\s+(\d+)\s+months?`
  - `(\d{1,3}(?:,\d{3})*)\s*points?\s+after\s+\$?([\d,]+)\s+in\s+purchases?\s+in\s+the\s+first\s+year`
- **Patterns (FR):** e.g. "X points après Y $ d'achats dans les Z premiers mois", "dans la première année".
- **Output:** Array of `{ rewardPoints, spendAmount, monthsFromOpen }` in document order. Normalize numbers (strip commas, parse "first year" as 12 months).

### 2. Fallback / enhancement: AI extraction

- Extend [milesopediaAiExtractor.js](backend/src/services/milesopediaAiExtractor.js) to optionally return `bonusLevels: [{ rewardPoints, spendAmount, monthsFromOpen }, ...]` from the page text.
- Use when regex finds nothing or when `useAi: true` (e.g. "Refresh with AI"). Merge or override regex result with AI result (e.g. prefer AI when both exist and AI has more levels).

### 3. Embedded JSON (single tier only)

- Keep using existing `extractEmbeddedCardData` for the **first** tier (minSpend, timeframe). If we have no parsed levels from review text, we can build a single level from embedded `minimum_spending` + `minimum_spending_timeframe_months` + `mc_welcome_bonus_amount` when present.

## Implementation outline

### 1. Schema

- Add **ScrapedBonusLevel** to [backend/prisma/schema.prisma](backend/prisma/schema.prisma) and [backend/prisma/schema.postgres.prisma](backend/prisma/schema.postgres.prisma):
  - `id`, `scrapedCardId`, `order`, `spendAmount`, `monthsFromOpen`, `rewardPoints`; optional `requirementType`, `minTransactions` for future.
  - Relation on ScrapedCard: `bonusLevels ScrapedBonusLevel[]`.
- Run migration / `db push` and `prisma generate`.

### 2. Extractor (new module or inside scraper)

- **Function:** `extractBonusLevelsFromHtml(html)` (and optionally `extractBonusLevelsFromText(text)` for AI).
  - Returns `Array<{ order, spendAmount, monthsFromOpen, rewardPoints }>`.
  - Implement EN/FR regex for "X points after $Y in ... first N months" and "first year" (→ 12 months).
  - Locate "Our review" / "Notre avis" section (e.g. by heading or by class) and run regex on that block to reduce false positives.
- Call from **parseCardDetail**: after building `bonusDetails` and `minSpend`, run `extractBonusLevelsFromHtml(html)` and attach `bonusLevels` to the returned card object (so the in-memory card has `bonusLevels: [...]`).
- **mergeAiExtraction:** If AI returns `bonusLevels`, use it to override or merge (e.g. override when AI returns a non-empty array).

### 3. Persistence

- **Full catalog refresh** ([milesopediaScraper.js](backend/src/services/milesopediaScraper.js) `scrapeMilesopediaCards`):
  - After `prisma.scrapedCard.upsert`, get the created/updated row id (upsert returns the row), then replace that card's bonus levels: `prisma.scrapedBonusLevel.deleteMany({ where: { scrapedCardId } })` and `prisma.scrapedBonusLevel.createMany({ data: levels.map(...) })`.
- **Single-card refresh** ([availableCards.js](backend/src/routes/availableCards.js) `POST /:id/refresh`):
  - `scrapeSingleMilesopediaCard` returns card with `bonusLevels`. After `prisma.scrapedCard.update`, run the same delete + createMany for that card's bonus levels (using existing card id).

### 4. API

- **GET /api/available-cards:** Include `bonusLevels` in the serialized card (nested array, sorted by `order`). In [availableCards.js](backend/src/routes/availableCards.js), use `findMany({ include: { bonusLevels: { orderBy: { order: 'asc' } } } })` and serialize each level (order, spendAmount, monthsFromOpen, rewardPoints).
- **POST /api/available-cards/:id/refresh** response: Same; return serialized card with `bonusLevels`.

### 5. Catalogue UI (optional)

- In [AvailableCardsList.vue](frontend/src/views/AvailableCardsList.vue) detail modal, if `card.bonusLevels` exists and length > 0, show a **"Bonus levels"** section (e.g. bullet list: "Level 1: 40,000 pts after $2,000 in 3 months", etc.) using existing i18n patterns.

### 6. Prefill when adding to my cards (optional)

- When user clicks "Add to my cards" from catalogue, [toPrefill](frontend/src/views/AvailableCardsList.vue) already builds a prefill object. Extend it to include `bonusLevels: scrapedCard.bonusLevels.map(...)` so the card form opens with bonus levels pre-filled (same shape as CardBonusLevel: order, spendAmount, monthsFromOpen, requirementType 'spend', rewardPoints). Backend createCard already accepts `bonusLevels` and creates CardBonusLevel records.

## File checklist

- [ ] **Schema:** [backend/prisma/schema.prisma](backend/prisma/schema.prisma), [backend/prisma/schema.postgres.prisma](backend/prisma/schema.postgres.prisma) – add ScrapedBonusLevel.
- [ ] **Scraper:** [backend/src/services/milesopediaScraper.js](backend/src/services/milesopediaScraper.js) – add `extractBonusLevelsFromHtml`, call from parseCardDetail, persist levels in scrapeMilesopediaCards (and in single-card flow if we persist there; currently single-card refresh is done in the route, so the route must write levels).
- [ ] **AI extractor (optional):** [backend/src/services/milesopediaAiExtractor.js](backend/src/services/milesopediaAiExtractor.js) – extend prompt and response to include `bonusLevels` array; merge in mergeAiExtraction.
- [ ] **Routes:** [backend/src/routes/availableCards.js](backend/src/routes/availableCards.js) – GET include bonusLevels and serialize; POST refresh: after update, replace ScrapedBonusLevel for that card.
- [ ] **Frontend:** [frontend/src/views/AvailableCardsList.vue](frontend/src/views/AvailableCardsList.vue) – detail modal: show bonus levels section when present; toPrefill: add bonusLevels from scraped card.

## Regex and section detection (reference)

- **EN:** "Our review" section often contains a list; look for `<li>` or `<p>` with text matching:
  - `(\d{1,3}(?:,\d{3})*)\s*points?\s+after\s+\$?([\d,]+)\s+in\s+purchases?\s+within\s+the\s+first\s+(\d+)\s+months?`
  - `(\d{1,3}(?:,\d{3})*)\s*points?\s+after\s+\$?([\d,]+)\s+in\s+purchases?\s+in\s+the\s+first\s+year`
- **FR:** "X points après Y $ d'achats dans les Z premiers mois" / "dans la première année".
- Normalize: remove commas from numbers; "first year" → 12 months; order levels by appearance (or by monthsFromOpen ascending).

## Out of scope (for this plan)

- Changing how Milesopedia renders the page (we only parse what’s there).
- Backfilling existing ScrapedCard rows with levels (can be a one-off script or run on next full refresh).
