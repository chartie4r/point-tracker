# Tech implementation order and feature dependencies

This document prioritizes the **technical roadmap** relative to the **feature roadmap** (`docs-ideas/IMPLEMENTATION-ORDER.md`) and highlights which tech items are **blockers** for which features.

The goal is to make sure the right platform pieces are in place **before** (or alongside) the features that need them.

---

## Tech order (T1 → T6)

| T# | Tech idea | Doc | When to do it | Key dependent features (by # from feature IMPLEMENTATION-ORDER) |
|----|-----------|-----|---------------|------------------------------------------------------------------|
| **T1** | Core platform readiness | 01-core-platform-readiness.md | **Before first external prod deploy.** Can be done in parallel with early feature work. | All features 1–25 (baseline). |
| **T2** | Data integrity, migrations, backups | 02-data-integrity-backups-migrations.md | **Before you start adding lots of new tables** (e.g. wishlist, goals, notifications). | 1 (notifications), 2 (expiry), 5–9, 16–17, 21–24. |
| **T3** | Auth, security, privacy | 03-auth-security-privacy.md | **Before growth and public-facing features** (share, referrals, API, deal board, partner offers). | 10–13, 16, 18–20, 24–25. |
| **T4** | Testing & quality gates | 04-testing-and-quality-gates.md | Start after initial MVP; **must be in place before high-impact changes** (API, partner offers, multi-currency). | 15–20, 21–24 (and any refactors). |
| **T5** | Observability (logging, monitoring, alerts) | 05-observability-logging-monitoring.md | As soon as you have a stable prod deployment; **before traffic grows**. | Helps all features; especially 10–13, 16–20. |
| **T6** | Email & background jobs | 06-email-and-background-jobs.md | MVP version should exist **before or with the first email/cron feature** (expiry alerts). Can be simple at first and improved later. | 1–2 (expiry + notifications), 8 (churn), 10 (email digest), 7 step 3 (scheduled reports), 19–20 (partner campaigns, digests). |

> Note: You chose to **allow a simple cron/email implementation first**, then refactor. That fits T6: start with a minimal shared email + cron setup, then consolidate and harden.

---

## Phased view: tech vs features

### Phase A – MVP foundation

- **Tech:**  
  - **T1** Core platform readiness  
  - Start **T2** (migrations/backups) basics  
  - Begin **T5** observability at a minimum (logs + health check)
- **Features you can safely build:**  
  - 1 Notification center, 3 Export, 4 Import, 5 Spend simulator, 6 Redemption calculator, 7 Comparison, 21 Dashboard summary, 22 Points balance, 23 Active bonus trackers, 25 Help widget.
- **Caution:**  
  - For any feature storing new data (notifications, wishlist, goals), make sure migrations go through T2’s process.

### Phase B – Email and alerts

- **Tech:**  
  - **T6** Email + background jobs (MVP implementation).  
- **Features unlocked / relying on it:**  
  - 1 Notification center (if you send some notifications by email).  
  - 2 Points expiry alerts (cron + email).  
  - 8 Churn reminder (optional emails).  
  - 10 Email digest (weekly/monthly).  
  - 7 step 3 of Export (scheduled reports).

### Phase C – Growth & sharing

- **Tech:**  
  - **T3** Auth/security/privacy (rate limits, authorization audit, account deletion).  
  - **T4** Testing & quality gates (baseline tests + CI).  
- **Features now safer to launch:**  
  - 12 Share card offer, 13 Referral program, 14 Household, 15 Browser extension, 16 Public deal board.  
- **Reason:** These expose more attack surface (sharing, referrals, public content). You want good auth, privacy, and some tests before shipping widely.

### Phase D – Expansion & monetization

- **Tech:**  
  - Mature **T2–T5** (migrations, tests, observability).  
- **Features here:**  
  - 17 Multi-currency, 18 API for power users, 19 Content hub, 20 Partner offers, 24 Travel goals, plus any paid plan logic from `MONETIZATION.md`.  
- **Reason:** These features increase complexity and revenue impact; you’ll want strong migrations, tests, and monitoring to avoid production incidents.

---

## Quick validation: blockers before features

- **Email-dependent features (2, 8, 10, scheduled part of 7, partner campaigns):**  
  - Must not go live without at least **T6 MVP** (working email service + basic cron).  
- **Public/growth features (12–13, 16, 19–20):**  
  - Should wait until **T3** (auth/security/privacy) and at least a basic **T4**/**T5** setup are in place.  
- **Data-heavy features (1 notifications, 9 wishlist, 17 multi-currency, 21–24 dashboards/goals):**  
  - Rely on proper **T2** migrations/backups to avoid data loss or inconsistent schema.

Following this ordering, you’ll naturally implement the tech blockers before or alongside the features that need them, while still keeping the ability to “ship simple first” for email and jobs.

