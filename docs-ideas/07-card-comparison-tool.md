# Idea 3: Card comparison tool

**Goal:** Side-by-side comparison of 2–3 cards (from catalogue or user's cards) so users can choose the best offer.

**What we build**
- "Compare" flow: user selects 2 or 3 cards (from catalogue or a mix).
- Table or cards: columns = cards; rows = annual fee, welcome bonus Y1/Y2, min spend, min spend notes, program, bank.
- Optional: "Best for" short line (e.g. "Best value", "Easiest min spend") — rule-based or AI one-liner.

**Data**
- Uses existing ScrapedCard (catalogue) and Card (user). No new schema; read-only comparison view.

**Phases**
1. Compare page or modal: multi-select cards (from catalogue), then display table.
2. Add user's cards to the selection (so "catalogue card A vs my current card B").
3. Optional: save comparison sets or share link (e.g. /compare?ids=uuid1,uuid2).

**Dependencies:** Catalogue and card data with bonus, fee, min spend.
