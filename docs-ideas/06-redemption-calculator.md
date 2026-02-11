# Idea 4: Redemption calculator

**Goal:** "I have X Aeroplan (or other) points — what can I get?" Rough value in $ or sample redemptions (flights, hotels) to make points tangible.

**What we build**
- User enters: program (e.g. Aeroplan), points balance.
- Output: (1) Cash-value equivalent (e.g. "Often valued at ~$Y at 1.5¢/pt") with disclaimer; (2) Example redemptions (e.g. "Short-haul ~15k one-way", "Economy to Europe ~60k") — static or from a small data set.
- Optional: link to program's reward chart or partner.

**Data**
- Static content or small table: program, redemption type, typical points range, short label. Optional: value-per-point assumption (editable by us, not user).

**Phases**
1. Single program (e.g. Aeroplan): static examples + simple "value at X¢/pt" calculator.
2. Add more programs (Marriott, BNC, etc.) with placeholder or real ranges.
3. Optional: "How many points do I need for [trip type]?" (reverse).

**Dependencies:** None critical; improves with bonus tracking and AI plan (user knows their points).
