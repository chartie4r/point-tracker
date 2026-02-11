# Idea 2: Min-spend simulator

**Goal:** Answer "If I put $X/month on this card, when do I hit the minimum spend?" so users can plan realistically.

**What we build**
- On catalogue card detail or "my card" (when chasing bonus): input "Monthly spend I can put on this card" (or use plan context budget).
- Output: "At $3,000/month you'll hit $6,000 in 2 months" + optional calendar strip (Month 1, Month 2, done by [date]).
- Warn if deadline (from bonus terms) is tight: "You have 6 months; at $2k/month you'll need 3 months — OK."

**Data**
- Inputs: min spend (from catalogue or card), deadline if any (user or catalogue), monthly amount (user input or from plan context).
- No new tables; computation only.

**Phases**
1. Simple calculator component: min spend, months or deadline, monthly spend → result + "done by" date.
2. Integrate on card detail (catalogue or my card) and optionally in AI plan output.
3. Optional: "What monthly spend do I need to hit this by [date]?" (reverse calc).

**Dependencies:** Catalogue/card has min spend and optional deadline; plan context can supply default monthly budget.
