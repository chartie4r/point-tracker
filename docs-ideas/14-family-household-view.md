# Idea 11: Family / household view (optional)

**Goal:** Let two (or more) users link accounts as "household" to see combined cards and points in one view — useful for couples or families optimizing together.

**What we build**
- "Household": one user invites another by email; invitee accepts. Link is optional and revocable.
- "Household view" (toggle or separate page): combined list of all cards from all members (read-only or with permission), combined points by program, optional shared pipeline view.
- Privacy: each user explicitly opts in; no shared login; we only aggregate data they choose to share.

**Data**
- New: `Household` (id), `HouseholdMember` (householdId, userId, role, joinedAt). Optional: which data to share (cards only, snapshots, etc.).

**Phases**
1. Household model + invite flow (invite by email, accept/decline). No shared view yet.
2. "Household dashboard" or view: aggregate cards (and points) from members who joined same household.
3. Optional: shared pipeline or shared wishlist; permissions (view only vs suggest).

**Dependencies:** Trust and privacy copy; optional premium (household as paid feature?).
