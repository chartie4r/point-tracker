# Backlog by epic (single-agent scoping)

This document groups the feature ideas into **epics** sized so that **one epic = one agent session**: a single, coherent scope (backend + frontend + tests/docs as needed) that one agent can implement in one run without context overflow.

Epics respect the implementation order and dependencies from [IMPLEMENTATION-ORDER.md](IMPLEMENTATION-ORDER.md).

---

## Epic summary

| Epic | Name | Features | Scope for one agent |
|------|------|----------|---------------------|
| E1 | Notifications foundation | 1 | Notification center only |
| E2 | Alerts & reminders | 2, 8 | Expiry alerts + churn reminder |
| E3 | Import/export | 3, 4 | Export CSV/PDF + CSV import |
| E4 | Planning tools | 5, 6 | Spend simulator + redemption calculator |
| E5 | Comparison & wishlist | 7, 9 | Card comparison + wishlist/watchlist |
| E6 | Email & engagement | 10, 11 | Email digest + milestones/badges |
| E7 | Dashboard & active bonus trackers | 21, 22, 23 | **Prerequisite** (schema) + summary tiles + points by program + bonus trackers |
| E8 | Growth & sharing | 12, 13 | Share offer + referral program |
| E9 | Household & extension | 14, 15 | Family view + browser extension |
| E10 | Community & expansion | 16, 17 | Deal board + multi-currency |
| E11 | Monetization & content | 18, 19, 20 | API + content hub + partner offers |
| E12 | Travel goals | 24 | Travel goals tracking |
| E13 | Help & polish | 25 | In-app help widget |
| E14 | Ledger & optimizer | 26, 27 | Family points ledger + earn-rate matrix |
| E15 | Card history | 28 | Card history & reactivation insights |

---

## Epic definitions (scope for one agent)

### E1 – Notifications foundation
- **Features:** 1 (In-app notification center)
- **In scope:** Notification model + API (list, mark read, mark all read); bell icon + dropdown in header; one source of notifications (e.g. stub or points-expiry placeholder) to prove the flow.
- **Out of scope:** Real-time/WebSocket; email push; full integration with expiry/churn/wishlist (those come in E2/E5).
- **Deliverables:** New `Notification` table + CRUD/read API; frontend bell + panel; link from notification to a relevant page. Tests for API and component.
- **Depends on:** None (foundation).

---

### E2 – Alerts & reminders
- **Features:** 2 (Points expiry alerts), 8 (Churn reminder)
- **In scope:** Backend logic to detect "points expiring soon" and "card renewal / churn" from existing card/snapshot data; create notifications via E1; optional email for expiry (if T6 email is available). UI: no new page required if notifications link to existing cards/snapshots; optional "Alerts" settings (which alerts on/off).
- **Out of scope:** Email digest (E6); complex recurrence rules beyond "once per card/event".
- **Deliverables:** Expiry detection + churn detection jobs or on-demand checks; creation of Notification records; optional email for expiry; settings for alert preferences. Tests.
- **Depends on:** E1 (notification center).

---

### E3 – Import/export
- **Features:** 3 (Export reports CSV/PDF), 4 (CSV import)
- **In scope:** Export: endpoint(s) to export user's cards (and optionally snapshots) as CSV and PDF; frontend "Export" button and format choice. Import: CSV upload endpoint; parsing and validation; mapping columns to card fields; create/update cards; frontend "Import" page with template download and upload.
- **Out of scope:** Scheduled exports (E6); import of snapshots in first version (cards only).
- **Deliverables:** Export API (CSV + PDF) + Import API + frontend Export/Import flows; error handling and validation; basic tests.
- **Depends on:** None beyond existing cards/snapshots.

---

### E4 – Planning tools
- **Features:** 5 (Spend simulator), 6 (Redemption calculator)
- **In scope:** Spend simulator: "When will I hit min spend?" from card + snapshot data; backend endpoint(s) or pure frontend calc; simple UI (card selector, min spend, current spend, timeline or date). Redemption calculator: "What is my balance worth?" using points balance and optional cpp; backend or frontend; UI with program selector and optional valuation input.
- **Out of scope:** Family ledger (E14); multi-currency (E11); advanced scenarios.
- **Deliverables:** Two tools (spend sim + redemption calc); APIs or shared logic + frontend pages; tests.
- **Depends on:** Existing cards/snapshots/points data.

---

### E5 – Comparison & wishlist
- **Features:** 7 (Card comparison tool), 9 (Wishlist/watchlist)
- **In scope:** Comparison: backend endpoint to compare 2–3 cards (from catalogue or user) on key fields; frontend "Compare" flow (select cards, show side-by-side). Wishlist: `WishlistItem` (user, scrapedCardId or cardId, optional target); "Add to wishlist" from catalogue; list view; "notify when bonus improves" creates a notification (E1).
- **Out of scope:** Public comparison links (E8); wishlist price history charts.
- **Deliverables:** Comparison API + UI; Wishlist model + API + UI; notification when bonus improves (if criteria defined). Tests.
- **Depends on:** E1 (notifications for wishlist); catalogue and user cards.

---

### E6 – Email & engagement
- **Features:** 10 (Email digest), 11 (Milestones & badges)
- **In scope:** Digest: backend job to build digest payload (summary of points, alerts, tips); email sending via existing T6 email; user preference "weekly/monthly digest". Milestones/badges: model (e.g. "First card", "5 cards", "100k points"); backend to evaluate and assign; UI to show badges on profile or dashboard.
- **Out of scope:** Real-time in-app feed beyond notifications (E1); complex gamification (levels, leaderboards).
- **Deliverables:** Digest job + email template + preference; Milestones/badges model + evaluation + UI. Tests.
- **Depends on:** E1; T6 email (for digest).

---

### E7 – Dashboard & active bonus trackers
- **Prerequisite (do first in this epic):** Card Pipeline schema change required for 21 and 23. Add to `Card`: `welcomeBonusCompletedAt` (DateTime?, optional) — null = chasing bonus, set = bonus done. For 23 also add `minSpend` (Int?, optional) on Card (catalogue has it on ScrapedCard; user cards need it for progress). Migration + optional backfill.
- **Features:** 21 (Dashboard summary metrics), 22 (Points balance by program), 23 (Active bonus trackers UI)
- **In scope:** (1) Schema change + migration as above. (2) Backend: aggregations (total points, optional trend, active cards count, bonus-in-progress count, points-by-program); API for active bonuses (list with progress, days left, $ remaining). (3) Frontend: dashboard tiles (Total Points, Active Cards, Bonus Progress) linking to detail pages; Points balance panel (by program) and link from Total Points; Active Bonus Trackers section (progress bars, days left, $ remaining per card) on dashboard or dedicated page.
- **Out of scope:** Trend over arbitrary windows (phase 2); travel goals; editing min-spend rules in UI (use existing/entered data).
- **Deliverables:** Schema + migration; aggregation APIs; active-bonuses API; dashboard tiles; points-by-program panel + page; Active Bonus Trackers UI. Tests.
- **Depends on:** Snapshots for points; no other epic.

---

### E8 – Growth & sharing
- **Features:** 12 (Share card offer), 13 (Referral program)
- **In scope:** Share: public offer page (by slug or id); "Share" button copying link; optional affiliate param. Referral: referral code or link per user; track "referred by"; reward rule (e.g. "first card added"); notification when qualified (E1); simple referral dashboard or profile section.
- **Out of scope:** Household (E9); full affiliate dashboard.
- **Deliverables:** Public offer page + share flow; Referral model + code generation + tracking + reward logic + UI. Tests.
- **Depends on:** E1 (notifications); T3 auth/security for public page and referral links.

---

### E9 – Household & extension
- **Features:** 14 (Family/household view), 15 (Browser extension)
- **In scope:** Household: model (household, membership, roles); invite flow; shared view of aggregated cards/points (read-only or as defined); permissions. Extension: minimal extension that deep-links into app (e.g. "Add this card" from a partner page); optional capture of offer URL; no full extension UI in first version.
- **Out of scope:** Multi-currency (E10); full extension feature parity with web.
- **Deliverables:** Household + invites + shared view; extension scaffold + deep link + optional URL capture. Tests.
- **Depends on:** E1; T3; existing cards/points.

---

### E10 – Community & expansion
- **Features:** 16 (Public deal board), 17 (Multi-currency / multi-program)
- **In scope:** Deal board: UGC submissions (title, link, description); moderation (approve/reject); public listing; optional "submit" from app. Multi-currency: support multiple currencies and programs (e.g. USD, US programs); schema and API extensions; frontend filters and display.
- **Out of scope:** Partner offers (E11); full community features (comments, votes).
- **Deliverables:** Deal board model + moderation + public API + UI; Multi-currency schema + API + frontend. Tests.
- **Depends on:** T2/T3; existing catalogue and cards.

---

### E11 – Monetization & content
- **Features:** 18 (API for power users), 19 (Content hub/blog), 20 (Partner offers)
- **In scope:** API: read-only API (e.g. cards, snapshots) with API key auth; rate limits; docs or minimal explorer. Content hub: blog or content section; CMS or markdown; affiliate links in content. Partner offers: model for promoted deals; display in app; optional campaign tracking.
- **Out of scope:** Paid subscriptions (see MONETIZATION.md); full CMS.
- **Deliverables:** API auth + endpoints + rate limit; content hub structure + at least one article; Partner offers model + UI. Tests.
- **Depends on:** T3/T4; existing data.

---

### E12 – Travel goals
- **Features:** 24 (Travel goals tracking)
- **In scope:** Travel goal entity (name, target amount or date, linked programs); tile and page "Tokyo, 85%"; use points balance (E7) and optional AI planning; CRUD + progress display.
- **Out of scope:** Ledger (E14); booking integration.
- **Deliverables:** Travel goal model + API + tile + page; progress from points and optional AI. Tests.
- **Depends on:** E7 (points by program) recommended; Card Pipeline optional.

---

### E13 – Help & polish
- **Features:** 25 (In-app help widget)
- **In scope:** Floating Help button; dropdown or modal with FAQ links and contact/feedback form; backend to store feedback or email; styling consistent with app.
- **Out of scope:** Chatbot; knowledge base CMS.
- **Deliverables:** Help widget component; FAQ links; feedback endpoint + form. Tests.
- **Depends on:** None (can ship anytime).

---

### E14 – Ledger & optimizer
- **Features:** 26 (Family points ledger & valuations), 27 (Earn-rate matrix & spend optimizer)
- **In scope:** Ledger: point programs and cents-per-point (per user or household); CRUD and use in balance/valuation. Optimizer: matrix of value per dollar by category; "suggest card for this spend" using ledger; simple UI (category selector, suggestion).
- **Out of scope:** Travel goals (E12) integration in same epic; advanced optimizer (multi-goal).
- **Deliverables:** Ledger model + API + UI; optimizer logic + API + UI. Tests.
- **Depends on:** E9 optional (household ledger); existing cards and spend data.

---

### E15 – Card history
- **Features:** 28 (Card history & reactivation insights)
- **In scope:** Surface history of when cards were opened/closed; "eligible again" date from rules or data; optional "reactivation" reminder notification. Backend: derive from existing card data or new history table; frontend: timeline or table on card or dedicated view.
- **Out of scope:** Full credit-report style history.
- **Deliverables:** History derivation or model + API; UI to show history and reactivation hint. Tests.
- **Depends on:** Existing card data; E1 for reminder.

---

## How to use this for a single agent run

1. **Pick one epic** (e.g. E3 Import/export).
2. **Provide the agent** with:
   - This file (BACKLOG-BY-EPIC.md),
   - The feature docs for that epic (e.g. 03-export-reports.md, 04-csv-import.md),
   - IMPLEMENTATION-ORDER.md for dependency context.
3. **Instruction:** "Implement Epic E3 (Import/export) as scoped above. Do not implement features from other epics."
4. The agent implements only the in-scope deliverables for that epic in one session.

Dependencies are listed per epic; the agent should assume dependent epics (or tech items T1–T6) are already done or out of scope for the run.
