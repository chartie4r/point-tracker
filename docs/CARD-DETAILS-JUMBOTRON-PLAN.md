# Plan: Card Details – Jumbotron section (real data)

Implement the **jumbotron (Section A – Hero)** of the Card details page with real API data instead of mock data. This is the first section to wire up; other sections (progress, rewards structure, etc.) will follow in later phases.

---

## 1. What the jumbotron shows

From [CardDetails.vue](frontend/src/views/CardDetails.vue) (lines ~31–163):

| Element | Current source | Data needed |
|--------|----------------|-------------|
| Title | `card.cardName` | Card name |
| Subtitle | `card.bonusOffer` | Short offer text (e.g. “Earn 60k pts after $4k in 3 months”) |
| Badges | `card.bank`, `card.type`, `card.pointsProgram` | Bank, card network (VISA/AMEX/MC), points program |
| Status badge (tracked only) | `card.status` | Open / In progress / etc. |
| Minimum spend | `card.minSpend`, `card.bonusWindowMonths` | Amount and window (e.g. $4,000 in 3 months) |
| Bonus points | `card.bonusPointsTarget`, `card.estimatedValue` | Target points and estimated value (e.g. “$750+”) |
| On pace? (tracked only) | Derived | From spend vs target and deadline (can stay simple for now) |
| CTAs | `editLink`, `card.subscribeUrl` | Edit tracking (tracked), Start tracking (catalogue), Subscribe (catalogue, optional) |
| Card artwork (right) | `card.cardName`, `card.bank`, `card.pointsProgram`, `card.network` | Same as above + network for logo |
| Progress on card (tracked) | `bonusProgress` | `bonusPointsEarned` / `bonusPointsTarget`, percent |

So the jumbotron needs a single **view model** with: `id`, `cardName`, `bank`, `type` (network), `pointsProgram`, `status`, `bonusOffer`, `minSpend`, `bonusWindowMonths`, `bonusPointsTarget`, `estimatedValue`, `subscribeUrl`, `annualCost`; and when tracked: `spendSoFar`, `bonusPointsEarned`, `daysRemaining` (for pace/progress).

---

## 2. Data sources

- **Catalogue mode** (`?mode=catalogue`): Data comes from **ScrapedCard** (and ScrapedBonusLevel). The route param `id` is the ScrapedCard id. No user Card exists yet.
- **Tracked mode**: Data comes from **Card** (and CardBonusLevel, optional snapshots). The route param `id` is the Card id. Offer/target info can come from the Card record; if the card has `milesopediaSlug`, we can optionally enrich from ScrapedCard later (out of scope for this section).

Existing APIs:

- **GET /api/cards/:id** – Returns a user Card with bonusLevels and snapshots. Used for tracked view. Already exists.
- **GET /api/available-cards** – Returns list of ScrapedCards with bonusLevels. There is **no GET /api/available-cards/:id** yet; catalogue view currently cannot fetch a single card by id.

---

## 3. Backend changes (minimal for jumbotron)

### 3.1 Add GET /api/available-cards/:id

- **File**: [backend/src/routes/availableCards.js](backend/src/routes/availableCards.js)
- **Behavior**: Return a single ScrapedCard by id (primary key), with `bonusLevels` ordered by `order`. Use the same `serialize` helper as the list.
- **Response**: 200 with serialized card (same shape as list items); 404 if not found.
- **Auth**: Same as list (session; no need for superadmin for read).

This allows CardDetails in catalogue mode to load one card by id from the route.

### 3.2 Ensure card APIs expose jumbotron fields

- **GET /api/cards/:id** (cardService.getCard): Already returns cardName, bank, type, pointsType, annualCost, milesopediaUrl, milesopediaSlug, bonusLevels, expenses, deadline, rewardPoints, etc. No change required for the jumbotron; we only need to map these to the view model (see below). Optional: if you want “bonus offer” text on tracked cards without re-fetching Milesopedia, we could add a `bonusDetails`-style field to Card in a later phase; for this section we can derive a short line from bonusLevels or leave it from initial creation.
- **ScrapedCard** list/single: Already has cardName, type, bank, pointsType, annualCost, welcomeValueY1, minSpend, bonusDetails, bonusLevels. We do **not** need new ScrapedCard fields (e.g. subscribeUrl, bonusWindowMonths) for the jumbotron-only scope: we can derive bonusWindowMonths from bonus levels (max `monthsFromOpen`) and bonusPointsTarget from sum of `rewardPoints` in bonus levels; subscribeUrl can be omitted (hide “Subscribe” link when null).

---

## 4. Frontend changes (CardDetails.vue)

### 4.1 Fetch card by route (catalogue vs tracked)

- **When**: On mount (and when `route.params.id` or `route.query.mode` changes).
- **Logic**:
  - If `route.query.mode === 'catalogue'`: call **GET /api/available-cards/:id** (with `route.params.id`). On success, treat response as the “card” payload for the page.
  - Else: call **GET /api/cards/:id**. On success, treat response as the “card” payload.
- **State**: Introduce a `cardPayload` ref (or `catalogueCard` / `trackedCard`) holding the raw API response, plus `loading` and `error` (e.g. 404). Replace the current hardcoded `card` computed with a computed that builds the jumbotron view model from `cardPayload` (and `isTracked`).

### 4.2 Map API payload → jumbotron view model

**From ScrapedCard (catalogue):**

| View field | Source |
|------------|--------|
| id | payload.id |
| cardName | payload.cardName |
| bank | payload.bank |
| type / network | payload.type (VISA / AMEX / MASTERCARD) |
| pointsProgram | payload.pointsType (or humanized: Aeroplan, Scene, etc.) |
| status | Not applicable (or “Available to track”) |
| bonusOffer | payload.bonusDetails (first paragraph or truncated) or constructed from bonusLevels |
| minSpend | payload.minSpend |
| bonusWindowMonths | Max of bonusLevels[].monthsFromOpen, or 3/12 fallback if no levels |
| bonusPointsTarget | Sum of bonusLevels[].rewardPoints, or first level’s rewardPoints, or null |
| estimatedValue | Format welcomeValueY1 (e.g. “$510” or “~$510”) or “—” when null |
| subscribeUrl | null (or add later when we scrape it) |
| annualCost | payload.annualCost |
| spendSoFar / bonusPointsEarned / daysRemaining | 0 / 0 / null in catalogue (not used) |

**From Card (tracked):**

| View field | Source |
|------------|--------|
| id | payload.id |
| cardName | payload.cardName |
| bank | payload.bank |
| type / network | payload.type |
| pointsProgram | payload.pointsType |
| status | payload.status |
| bonusOffer | From payload.bonusDetails if we add it to Card, or built from bonusLevels; otherwise a generic line from minSpend/deadline (or leave empty for now) |
| minSpend | From first bonus level’s spendAmount or a Card field if we add it; for now use bonusLevels[0].spendAmount |
| bonusWindowMonths | Max of bonusLevels[].monthsFromOpen |
| bonusPointsTarget | Sum of bonusLevels[].rewardPoints or payload.rewardPoints |
| estimatedValue | From pointsValue or welcome value if stored; or “—” |
| subscribeUrl | payload.milesopediaUrl (or null) |
| annualCost | payload.annualCost |
| spendSoFar | payload.expenses ?? 0 |
| bonusPointsEarned | payload.rewardPoints ?? 0 |
| daysRemaining | From payload.deadline and today’s date |

Add null-safety: if `minSpend` or `bonusWindowMonths` is null, show “–” or “N/A” instead of calling `.toLocaleString()` on undefined.

### 4.3 Loading and error states (jumbotron area)

- **Loading**: While `loading === true`, show a skeleton or spinner in the hero (e.g. same layout with placeholders). Optionally disable or hide CTAs.
- **Error**: If the request fails (e.g. 404), show a short message in the hero (“Card not found” or “This card is no longer available”) and a link back to list (e.g. “Back to cards” / “Back to catalogue”).
- Keep the rest of the page (sections B–F) unchanged for this phase; they can keep using the same view model and will benefit from real data once `card` is driven by the API.

### 4.4 “On pace?” and progress (tracked)

- **bonusProgress**: Use `card.bonusPointsEarned` and `card.bonusPointsTarget` from the view model (from Card.rewardPoints and sum of bonus level targets).
- **spendProgress**: Use `card.spendSoFar` and `card.minSpend` (from Card.expenses and bonus level).
- **On pace?**: Can remain a simple heuristic (e.g. compare spendSoFar / minSpend to elapsed vs total time using deadline) or keep “Comfortably on track” as placeholder until a later section. No backend change required for this section.

### 4.5 CTAs

- **Edit tracking settings**: Already uses `editLink` (route to `/cards/:id/edit`). No change.
- **Start tracking this card**: Keep as button; navigation to “add card” flow (e.g. prefill from catalogue) can be implemented in a separate step; for this section only ensure the button is present when `!isTracked`.
- **Subscribe to this card**: Already gated by `card.subscribeUrl`. Leave as-is; link will appear when we add subscribeUrl to the API in a later phase.

---

## 5. Implementation order

1. **Backend**: Add GET `/api/available-cards/:id` in [availableCards.js](backend/src/routes/availableCards.js) (find by id, include bonusLevels, serialize, 404 if not found).
2. **Frontend**: In CardDetails, add `cardPayload`, `loading`, `error`; in `onMounted` (and watch route) call the correct API (catalogue vs tracked) and set payload/loading/error.
3. **Frontend**: Add a computed (e.g. `card`) that maps `cardPayload` + `isTracked` to the jumbotron view model (with null-safe defaults for minSpend, bonusWindowMonths, bonusPointsTarget, estimatedValue).
4. **Frontend**: Add loading UI in the hero (skeleton or spinner) and error UI (“Card not found” + back link).
5. **Frontend**: Ensure all jumbotron bindings use the new `card` (no more hardcoded Chase Sapphire). Test catalogue (ScrapedCard id) and tracked (Card id) routes.

---

## 6. Out of scope for this section

- Adding `subscribeUrl` or `bonusWindowMonths` to ScrapedCard schema and scraper (do in a later “scrape & save” section).
- Rewards-by-category, offer end date, or other new scraped fields.
- “Start tracking” flow (prefill form from catalogue card).
- Changing sections other than the jumbotron (e.g. Spending Timeline, Bonus milestones, Card Benefits & Rewards Structure).

Once the jumbotron is wired to real data, the next section can be another block of the page (e.g. progress section, or rewards structure) or the scraper enhancements (subscribeUrl, bonusWindowMonths, rewardsByCategory).

---

## 7. Ideas to increase usage and quick information (jumbotron)

Ideas to add to the jumbotron to **drive app usage** and **surface quick, decision-useful info** without overcrowding.

### Quick information (glanceable)

| Idea | Description | Data / mock |
|------|-------------|------------|
| **Estimated value** | Prominent “Worth ~$X” next to bonus pts (e.g. “50k pts ≈ $750”) so the user sees dollar value at a glance. | `card.estimatedValue` (already in dl); could move or duplicate in a pill/badge. |
| **Days left** (tracked) | “X days left to hit bonus” in the hero so urgency is visible without scrolling. | `card.daysRemaining` (already mapped); show in badge or small line. |
| **Spend to go** | “$X more to spend” for tracked cards so the next action is obvious. | Derived: `minSpend - spendSoFar`; show next to or instead of “Minimum spend” when tracked. |
| **Progress ring or bar** (tracked) | Mini progress (pts or spend) on the card visual or under the title. | `bonusProgress` / `spendProgress`; compact ring or thin bar. |
| **Compare to average** | “Top 20% offer” or “Above average welcome bonus” if we have benchmark data. | Mock or future: compare bonus pts / value to catalogue average. |
| **Last updated** (catalogue) | “Offer updated 2 days ago” to build trust and prompt refresh. | ScrapedCard `updatedAt` or last scrape time. |

### Usage / engagement

| Idea | Description | Implementation |
|------|-------------|-----------------|
| **Primary CTA above the fold** | Keep “Log a transaction” / “Start tracking” as the main button; ensure it’s visible without scroll. | Already in jumbotron; optional: make it more prominent (size, color). |
| **Secondary CTA** | “Set a reminder” or “Add to calendar” (bonus deadline) to bring users back. | New: reminder flow or “Copy deadline” (mock date from `deadline`). |
| **Quick log** | One-click “I spent $X today” from the hero (opens small modal or inline input). | New: minimal “Log transaction” from jumbotron with amount only; category/defaults from card. |
| **Share or save** | “Save this card” (bookmark) or “Share this offer” link so users return or invite others. | New: saved cards list or share URL (e.g. copy link with `?mode=catalogue`). |
| **Next step hint** (tracked) | Short line: “Log a transaction to update your progress” or “You’re $X away — use this card for your next purchase.” | Derived from `spendToGo` + copy; nudges toward “Log a transaction”. |
| **Offer expiry** (catalogue) | “Offer may change; track this card to lock your bonus terms” to encourage starting tracking. | Copy only, or future “offer valid until” from scraper. |

### Layout / UX

- **Card visual (right)**: Already shows bank, pts, number, cardholder, network. Optional: add a tiny progress arc or “X% to bonus” for tracked cards.
- **Left column**: Subtitle, tags, highlights, and dl are dense. Consider a single “Key numbers” row (pts, value, spend to go, days left) as pills so the dl is secondary.
- **Mobile**: Stack card visual below the text; keep primary CTA and one key number (e.g. “$X to go” or “X days left”) visible first.

Prioritize by impact and data availability: e.g. **estimated value** and **days left / spend to go** (tracked) first, then **quick log** or **next step hint** for usage.
