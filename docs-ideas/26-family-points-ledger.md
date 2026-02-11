# Idea 26: Family points ledger (per program, per person, with value)

**Goal:** Replace the manual “family points totals” spreadsheet with an in-app **points ledger** that tracks balances per program, per person (Jo, My, etc.), and shows the **cash-equivalent value** based on your own cents-per-point assumptions.

**What we build**
- **Points accounts**:
  - Each combination of **person + program** (e.g. Jo – Aeroplan, My – Marriott, Household – TD) is a separate “points account” with its own balance.
  - Optional account type: personal vs shared vs business.
- **Ledger view (table)**:
  - Rows: each points account.
  - Columns: program, owner, current balance, **value per point** (cents), **estimated value** in dollars, last updated date.
  - Totals row similar to your sheet (total points, total estimated value).
- **Editing + sync**:
  - User can adjust balances manually or via snapshots/import.
  - Value-per-point per program is editable in a “valuation settings” section so you can plug in your own numbers.

**Data**
- New tables / models:
  - `PointsProgram` (id, name, code, defaultCentsPerPoint).
  - `PointsAccount` (id, userId, ownerLabel, programId, balance, lastUpdatedAt).
  - `PointsProgramValuation` (userId, programId, centsPerPointOverride optional).
- Computed:
  - `estimatedValue = balance * centsPerPoint` per account.
  - Totals per person, per program, and for the whole household.

**Phases**
1. **MVP ledger**
   - CRUD for `PointsProgram` and `PointsAccount` in the API.
   - Simple UI table under a new “Points ledger” or “Family points” page, with totals row.
2. **Valuation settings**
   - UI to set your own cents-per-point per program (like the values you keep in your sheet).
   - Show both default and overridden valuations; persist to `PointsProgramValuation`.
3. **Integrations (optional)**
   - Pull balances from weekly snapshots or manual inputs in Card view, and roll them up into the ledger automatically.
   - Feed these values into:
     - Dashboard Total Points / Points Balance cards (ideas 21 & 22).
     - Travel Goals (idea 23) and Redemption Calculator (idea 4).

**Dependencies:** Snapshot or manual balance inputs; Points Balance by Program (idea 22) can reuse this structure; optional Household feature (idea 11) if you want per-person segmentation to follow “family” membership instead of just labels.

