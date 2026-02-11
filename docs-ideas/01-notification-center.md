# Idea 20: In-app notification center

**Goal:** One place for all in-app notifications: bonus improved (wishlist), renewal reminder, points expiring, referral qualified, system announcements — so users don’t miss important updates.

**What we build**
- Bell icon in header; dropdown or sidebar panel: list of notifications (title, body, link, read/unread, createdAt). "Mark all read."
- Backend: `Notification` (id, userId, type, title, body, link, readAt nullable, createdAt). Create notifications from other features (wishlist, expiry, churn, referral, etc.).
- Optional: real-time (WebSocket or polling) so new notifications appear without refresh.

**Data**
- New: `Notification` table. Other features call a "createNotification(userId, type, ...)" when something happens.

**Phases**
1. Notification model + API (list, mark read, mark all read). Create from one source (e.g. points expiry) to test.
2. UI: bell icon + dropdown; link to relevant page. Integrate with more features (wishlist, churn, referral).
3. Optional: push or email for high-priority; preference "Notify me in app only / also by email".

**Dependencies:** Other features (wishlist, expiry, churn) to emit events; optional push/email.
