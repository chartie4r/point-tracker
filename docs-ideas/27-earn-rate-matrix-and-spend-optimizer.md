# Idea 27: Card earn-rate matrix & spend optimizer

**Goal:** Turn your “Valeurs 1$ / [category]” spreadsheet columns into an in-app **earn-rate matrix** and **spend optimizer** that tells you which card to use for each category, and estimates value earned from your monthly budget.

**What we build**
- **Earn-rate matrix** view:
  - Rows: your cards (Marriott, Aeroplan, TD, RBC, etc.).
  - Columns: spending categories (Essence, Dépanneurs, Restaurants, Épicerie, Pharmacie, Voyage, Streaming, etc.).
  - Cells: **value per dollar** (e.g. `0.02 $` / 1$, as in your sheet) or “points per dollar + point value”.
  - Quickly shows the “best card” per category with highlighting.
- **Spend optimizer**:
  - Input: your monthly spend per category.
  - Output: estimated monthly **value earned** per card and in total, plus recommendations like “Put groceries on X, gas on Y”.
  - Can optionally factor in welcome bonus minimum spends (e.g. ensure enough spend on a specific card during its welcome window).

**Data**
- New or extended model:
  - `SpendingCategory` (id, key, label, icon).
  - `CardEarnRate`:
    - `cardId`, `categoryId`, `pointsPerDollar` or `centsPerDollar` (derived value).
    - Optionally `programId` to link to points program valuation.
  - User preference: monthly budget per category (simple JSON or `UserBudgetCategory` table).
- Uses existing valuation logic:
  - Cents-per-point from the Family Points Ledger / valuation settings (idea 26).

**Phases**
1. **Data entry & matrix**
   - Admin or advanced UI to enter `pointsPerDollar` or `centsPerDollar` per card/category (mirroring your spreadsheet).
   - Matrix view in-app to visualize and compare earn rates.
2. **Spend optimizer MVP**
   - Form for monthly spend per category.
   - Compute recommended “best card per category” and show estimated monthly total value based on current earn rates.
3. **Integration with bonuses (optional)**
   - Use current Card Pipeline / Active Bonus Trackers to:
     - Favor cards where you are chasing a welcome bonus, if you still need spend.
     - Show how long it will take to meet min spend at your current budget.

**Dependencies:** Family points ledger / valuations (idea 26) or other source of cents-per-point; Card and Program data; optional integration with Card Pipeline and AI Bonus Plan for welcome-bonus-aware optimization.

