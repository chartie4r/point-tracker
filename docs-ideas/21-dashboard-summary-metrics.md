# Idea 21: Dashboard summary metrics (Total points, active cards, bonus snapshot)

**Goal:** Give the user an at-a-glance view of their overall situation when they land on the dashboard: **total points across programs**, **how many active cards**, and a quick **bonus progress snapshot**.

**What we build**
- Top-of-dashboard tiles:
  - **Total Points**: sum of points across all tracked programs + small trend badge (e.g. `+12.5%` vs last 30 days).
  - **Active Cards**: count of open cards, plus how many are currently “chasing a bonus” (from Card Pipeline).
  - **Bonus Progress**: “X / Y active bonuses” and an approximate “$ to go” across all bonuses in progress.
- Tiles are *read-only* summaries; each links to deeper pages:
  - Total Points → Points balance view.
  - Active Cards → My cards / Card Pipeline.
  - Bonus Progress → Active bonus trackers view.

**Data**
- Uses existing and planned data:
  - **Cards**: `status`, `openDate`, `welcomeBonusCompletedAt` (from Card Pipeline plan).
  - **Snapshots / points balances**: summed across programs for “Total Points”.
  - **Bonuses in progress**: from Card Pipeline / AI plan (min spend, amount spent, amount remaining).
- New (optional):
  - Store a simple **history** of “total points per week” if we want to show `% change vs last period` more accurately (or we can approximate from snapshots).

**Phases**
1. **Backend aggregation**: endpoints to return:
   - `totalPoints` (current), plus optional `changePercent`.
   - `activeCardsCount`, `cardsChasingBonusCount`.
   - `activeBonusesCount`, `totalAmountRemainingToUnlock`.
2. **Frontend tiles** on dashboard:
   - Three cards styled like the mock (icons, small badges).
   - Click-through to relevant pages.
3. **Trend refinement (optional)**:
   - Use snapshot history to compute change over user-selected window (30 days, 90 days).
   - Let the user hover to see how the metric is computed.

**Dependencies:** Card Pipeline fields for “chasing bonus” and min spend; snapshots or equivalent for program-level points; design system for tiles.

