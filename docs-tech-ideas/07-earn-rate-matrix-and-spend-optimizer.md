# Tech Idea 07 – Earn-rate matrix & spend optimizer engine

This doc is the **technical companion** to `docs-ideas/27-earn-rate-matrix-and-spend-optimizer.md`. It focuses on the data model, calculations, and performance/UX considerations for turning the “Valeurs 1$ / [catégorie]” spreadsheet into a production-ready feature.

---

## Goal

Provide a reliable backend+frontend foundation for:

- The **earn‑rate matrix** (cards × categories, value per dollar).
- The **spend optimizer** that, given a monthly budget per category, recommends which card to use and estimates value.

This should be accurate, explainable, and fast enough to feel instant when the user tweaks values.

---

## What we build (technical)

1. **Normalized schema for categories and earn rates**
   - `SpendingCategory` table with stable keys (e.g. `GROCERY`, `GAS`, `STREAMING`) and localized labels.
   - `CardEarnRate` table linking user cards (or catalogue cards) to categories:
     - `cardId` → `Card` (user card) or `ScrapedCard`/reference card.
     - `categoryId` → `SpendingCategory`.
     - `pointsPerDollar` (INT) and/or `centsPerDollar` (FLOAT, derived).
     - Optional `programKey` (e.g. `AEROPLAN`, `MR`) for valuation lookup.

2. **Valuation service**
   - Small service layer that exposes:
     - `getCentsPerPoint(programKey)` (from idea 26 “family points ledger/valuations”).
     - `toCentsPerDollar(pointsPerDollar, programKey)`.
   - Ensures we don’t duplicate the cents‑per‑point logic across the app.

3. **User budget input**
   - `UserBudgetCategory` table or JSON column on `User`:
     - `userId`, `categoryId`, `monthlyAmountCents`.
   - Read/write endpoints for:
     - Fetching current budget assumptions.
     - Updating categories/amounts.

4. **Optimizer engine (pure functions)**
   - A pure module (no DB inside) that:
     - Accepts:
       - List of cards with their earn rates (already resolved to cents per dollar).
       - User monthly budget per category.
       - Optional constraints (e.g. “force at least X$ on card Y to chase welcome bonus”).
     - Returns:
       - Best card per category (max cents per dollar, respecting constraints).
       - Estimated monthly value per card and global total.
       - A “reason” object to explain why a card was picked (best earn rate vs. min‑spend push, etc).
   - This engine should be easily unit‑testable and not coupled to Express/Prisma.

5. **API endpoints**
   - `GET /api/earn-matrix`:
     - Returns cards, categories, and earn‑rate matrix for the logged‑in user.
   - `POST /api/earn-matrix/budget`:
     - Saves `UserBudgetCategory` values.
   - `POST /api/earn-matrix/optimize`:
     - Body: current cards + budget (or just budget, if server pulls cards).
     - Response: optimizer result for the matrix UI.

---

## Data & migrations

- **New Prisma models** (names illustrative; adjust to existing conventions):

```prisma
model SpendingCategory {
  id        String   @id @default(uuid())
  key       String   @unique
  label     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  earnRates CardEarnRate[]
}

model CardEarnRate {
  id              String   @id @default(uuid())
  cardId          String
  categoryId      String
  programKey      String?      // e.g. 'AEROPLAN', 'MR'
  pointsPerDollar Int?         // nullable if we only store centsPerDollar
  centsPerDollar  Float?       // either stored or derived at read time

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  card      Card            @relation(fields: [cardId], references: [id], onDelete: Cascade)
  category  SpendingCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
}

model UserBudgetCategory {
  id              String   @id @default(uuid())
  userId          String
  categoryId      String
  monthlyAmount   Int      // cents
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user     User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  category SpendingCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@unique([userId, categoryId])
}
```

- Seed script (one‑off) to create canonical spending categories that mirror the Notion sheet / spreadsheet.

---

## Phases (tech)

1. **Model + seeding**
   - Add Prisma models and migrations.
   - Seed `SpendingCategory` with an initial set of categories.

2. **Valuation + earn‑rate storage**
   - Implement valuation helper functions using idea 26.
   - Build small admin/advanced UI or script to populate `CardEarnRate` for your own cards, using the Notion/CSV as starting data.

3. **Optimizer function + tests**
   - Implement the pure optimization function with a comprehensive Vitest suite:
     - Best card per category with simple earn rates.
     - Tie‑breaking (e.g. prefer card with active welcome bonus).
     - Edge cases: missing data, zero budget, categories with no matching card.

4. **API + frontend integration**
   - Implement `GET /api/earn-matrix`, `POST /api/earn-matrix/budget`, `POST /api/earn-matrix/optimize`.
   - Connect to a dashboard UI (tiles similar to the PointsRocket mock) to visualize:
     - Matrix.
     - Optimized monthly value.

5. **Performance & UX**
   - Ensure optimizer can run on every small change (client‑side or server‑side) without noticeable lag.
   - Consider computing some aggregates client‑side when all necessary data is already on the page.

---

## Dependencies & risks

- Depends on:
  - **Idea 26** (Family points ledger / valuation) or another reliable source of cents‑per‑point.
  - Stable **Card** and **Program** models.
- Risks:
  - User confusion if recommendations contradict current welcome‑bonus chasing strategy → mitigate by exposing “why this card?” messaging.
  - Earn rates getting stale → consider admin tooling or lightweight in‑app editing with audit history.

