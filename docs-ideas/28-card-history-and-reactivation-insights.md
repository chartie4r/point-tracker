# Idea 28: Card history & reactivation insights

**Goal:** Model your detailed “Historique cartes de crédit” sheet in the app so you can see your **full card history** (open → close → reopen → refused), and get **reactivation insights** such as “when can I get this card again?” and “how much value have I already extracted from this bank/program?”.

**What we build**
- **Per-card history timeline**:
  - For each card product (e.g. “Marriott Bonvoy Amex”), show all instances you and your partner have had:
    - Person (Jo/My), open date, close date, reopen date (if any), status (Open, Closed, Refused).
    - Welcome bonus details: min spend, delay, value of gain, whether you hit it (✅ / ⛔).
  - Aggregate totals and per-bank/program summary (similar to your “Totaux” row).
- **Reactivation insights**:
  - For each bank/program, store simple reapply rules (e.g. “once every 24 months since last welcome bonus”).
  - Compute and display **earliest recommended reapply date** for you and your partner per card.
  - Flag cards that are “eligible again” or “too soon”.
- **Integration with pipeline / planning**:
  - Feed these insights into the Card Pipeline and AI Bonus Plan so the app knows which cards are actually available to recommend.

**Data**
- Extend existing models or add:
  - `CardProduct` (if not already distinct from user `Card` instances).
  - `CardInstance` (id, userId, cardProductId, ownerLabel, openDate, closeDate, annualFee, creditLimit, status, welcomeBonusValue, minSpend, window, bonusCompletedAt, notes).
  - `ReapplyRule` per cardProduct or per bank/program (simple fields: `minMonthsBetweenBonuses`, `notes`).
- Derived fields:
  - Lifetime gain per product, per bank, per program.
  - “Eligible again on [date]” per person + product.

**Phases**
1. **History storage**
   - Model `CardInstance` so multiple historical instances of the same product are supported (matching your multiple rows per product/person).
   - UI to view history per product and per bank/program, with totals.
2. **Reapply rules + insights**
   - Simple rule model and UI (admin-editable to start).
   - Compute eligibility dates and show them in card detail and pipeline views.
3. **Planning integration**
   - AI Bonus Plan and Card Pipeline use history + rules to avoid recommending cards that are not yet eligible.
   - Optional warnings when you try to add a card that violates a rule.

**Dependencies:** Card Pipeline and AI Bonus Plan documents; migrations to move from a single-card record to multiple `CardInstance` records where needed; optional Household feature (idea 11) for multi-person portfolios.

