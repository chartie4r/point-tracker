# Idea 6: Wishlist / watchlist (catalogue cards)

**Goal:** Let users save "I'm interested in these cards" from the catalogue and get notified when the bonus improves (or when we add new info), so they know when to apply.

**What we build**
- "Add to wishlist" on catalogue cards (heart or list icon). Stored per user.
- "My wishlist" page: list of watched cards with current bonus, min spend.
- When bonus value history is updated (Bonus Value Tracking feature): if a watched card's bonus went up, flag "Bonus improved" and optionally notify (in-app or email).

**Data**
- New: `WishlistItem` — userId, scrapedCardId (or milesopediaSlug), createdAt. Optional: notifyOnImprove (boolean).

**Phases**
1. Backend: wishlist table + API (add, remove, list). Frontend: button on catalogue card, "My wishlist" page.
2. Integrate with Bonus Value Tracking: on new snapshot, if card is in any user's wishlist and value went up, set "improved" flag or trigger notification.
3. Optional: email "A card on your wishlist has a better offer."

**Dependencies:** Bonus Value Tracking (history) for "improved" logic; optional email.
