# Idea 13: Public deal board (community)

**Goal:** A feed of "hot deals" or data points from the community (e.g. "AMEX 80k seen today", "DP: approved with 2 existing AMEX") — anonymous, upvote/downvote, to help others time their applications.

**What we build**
- "Deal board" or "Community" page: list of posts. Each post: title, optional body, source (e.g. "Milesopedia", "User"), program/card tag, date, upvotes.
- Anyone can submit (optional: require login); moderation (approve/flag) or auto-publish.
- Sort by recent or hot (upvotes). Optional: comment thread.

**Data**
- New: `DealPost` (id, userId nullable, title, body, cardProgramOrSlug, source, createdAt, upvotes count or table). `DealPostVote` (userId, postId, vote ±1) if we want per-user vote.

**Phases**
1. Backend: posts table + API (create, list, optional vote). Basic moderation (e.g. superadmin approves).
2. Frontend: feed UI; submit form (title, link, optional body); upvote button.
3. Optional: comments; richer tags; "verified" badge (e.g. we cross-check with our catalogue).

**Dependencies:** Moderation policy; legal (user-generated content, disclaimer).
