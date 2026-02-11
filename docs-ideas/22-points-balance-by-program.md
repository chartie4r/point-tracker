# Idea 22: Points balance by program (dashboard panel)

**Goal:** Show a clear breakdown of **points by program** (e.g. Aeroplan, Amex MR, Marriott) so users can immediately see where their balances are and which programs are strongest or weakest.

**What we build**
- A **“Points Balance”** panel on the dashboard:
  - One card per program: program name, logo/color, current balance.
  - Optional: label for points type (e.g. “Ultimate Rewards”, “Membership Rewards”).
  - Optional: small badge for change vs last period (e.g. `+12k this month`).
- Clicking a program card takes the user to a **program detail view**:
  - History over time (from snapshots).
  - Which cards feed this program.

**Data**
- Uses existing/planned data:
  - Program identifier per snapshot or per account (e.g. “Aeroplan”, “Amex MR”).
  - Current balance per program from the latest snapshot.
- Optional:
  - `Program` reference table for display name, logo, color.
  - Snapshot history for per-program trend charts.

**Phases**
1. **Aggregation**:
   - Backend endpoint to return list of `{ programId, name, balance }` for the user.
   - Reuse or adapt snapshot model to compute current per-program balance.
2. **Dashboard panel**:
   - Render “Points Balance” component with program cards.
   - Click-through to a basic program detail page (even if just a filtered snapshot list at first).
3. **Enhancements (optional)**:
   - Show trend badges per program (change vs last snapshot / last month).
   - Program detail charts (line chart of balance over time), and list of contributing cards.

**Dependencies:** Snapshot or equivalent points tracking per program; UI design for cards; optional Program table for metadata.

