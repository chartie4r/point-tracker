# Idea 24: Active bonus trackers UI (improvement to Card Pipeline / AI Bonus Plan)

**Goal:** Upgrade the **“current bonuses in progress”** view into a clear, card-style **Active Bonus Trackers** section, showing per-card min spend progress, time left, and reward — similar to the mock (e.g. Chase Sapphire card with `$3,245 / $4,000`, `32 days left`, `$755 to go`, and `60,000 pts`).

**Type:** Improvement to existing **Card Pipeline** and **AI Bonus Plan** features.

**What we build**
- On the dashboard (or Bonuses tab), an **“Active Bonus Trackers”** panel:
  - One row/card per active bonus (from Card Pipeline “Current” column).
  - Fields per card:
    - Card name + bank badge.
    - Min spend requirement and time window (e.g. “Spend $4,000 in 3 months”).
    - **Progress bar** and numeric progress: `$X / $Y`, `%`, `$ remaining`.
    - **Days left** until deadline, with warnings when close.
    - Reward summary (e.g. `60,000 pts`) and link to “View details”.
  - **“Add Bonus”** button to quickly create a new tracked bonus (shortcut into Card Pipeline/AI plan).

**Data**
- Extends existing Card Pipeline / AI plan data:
  - `cardId`, `minSpend`, `minSpendWindow`, `deadline`, `amountSpentSoFar`, `amountRemaining`, `welcomeBonusPoints`, `welcomeBonusCompletedAt`.
- No new tables required; this is a new **read** view and some lightweight UI flows on top of existing models.

**Phases**
1. **Backend view model**:
   - Endpoint that returns a list of “active bonuses” with all fields needed for the UI (including computed `percentComplete`, `daysLeft`, `$remaining`).
2. **Active Bonus Trackers component**:
   - Dashboard/Bonuses section with one card per active bonus, progress bar, and CTA to details.
   - “Add Bonus” button that opens the “add card / add bonus” flow.
3. **Quality-of-life improvements (optional)**:
   - Sorting (soonest deadline first, highest reward first).
   - Filter by bank or program.
   - Visual warnings when user is unlikely to make the deadline (based on spend trend from snapshots).

**Dependencies:** Card Pipeline implementation (with min spend + deadline fields), snapshots or spend tracking for `amountSpentSoFar`, dashboard page.

