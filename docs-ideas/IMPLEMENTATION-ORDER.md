# Implementation order for the feature ideas

This document orders the feature ideas (functional + UX) in a recommended sequence: foundation and high-value first, dependencies respected, growth and monetization later.

---

## Order (1 → 28)

| # | Idea | Doc | Rationale |
|---|------|-----|-----------|
| **1** | In-app notification center | 01-notification-center | **Foundation.** Many features (expiry, wishlist, churn, referral) will push notifications. Build this first so we don’t bolt notifications on later. |
| **2** | Points expiry alerts | 02-points-expiry-alerts | High user value (“don’t lose points”). Depends on notification center (and optional email). |
| **3** | Export reports (CSV/PDF) | 03-export-reports | Quick win, no new infra. Increases stickiness and perceived value. |
| **4** | CSV import | 04-csv-import | Reduces onboarding friction; complements export. |
| **5** | Spend simulator | 05-spend-simulator | Core planning value: “When will I hit min spend?” Uses existing card/snapshot data. |
| **6** | Redemption calculator | 06-redemption-calculator | Core value: “What is my balance worth?” Uses existing points data. |
| **7** | Card comparison tool | 07-card-comparison-tool | Differentiator; uses catalogue + user cards. Good before marketing push. |
| **8** | Churn reminder | 08-churn-reminder | High value (renewal / product switch). Uses card open dates; can use notification center. |
| **9** | Wishlist / watchlist | 09-wishlist-watchlist | Ties to Bonus Value Tracking; “notify when bonus improves.” Needs notification center. |
| **10** | Email digest | 10-email-digest | Re-engagement; needs email sending. Build after core in-app notifications. |
| **11** | Milestones & badges | 11-milestones-badges | Gamification and retention; no hard dependencies. |
| **12** | Share card offer | 12-share-card-offer | Growth with low effort: share link / public offer page. Optional affiliate later. |
| **13** | Referral program | 13-referral-program | Growth and viral loop; can tie reward to “first card added” or similar. |
| **14** | Family / household view | 14-family-household-view | Optional; more complex (invites, permissions). Good after core is solid. |
| **15** | Browser extension | 15-browser-extension | Reduces friction adding cards; needs deep link + optional extension build. |
| **16** | Public deal board | 16-public-deal-board | Community; needs moderation and UGC policy. |
| **17** | Multi-currency / multi-program | 17-multi-currency-programs | Expansion (e.g. USD, US cards). Do when ready to broaden market. |
| **18** | API for power users | 18-api-for-power-users | Read-only API; natural **premium** candidate. |
| **19** | Content hub / blog | 19-content-hub-blog | SEO and authority; affiliate/partner links. Supports acquisition. |
| **20** | Partner offers | 20-partner-offers | B2B / promoted deals; do when we have traffic and partners. |
| **21** | Dashboard summary metrics | 21-dashboard-summary-metrics | Top-of-dashboard tiles (Total Points, Active Cards, Bonus Progress) that surface key info at a glance and link into deeper pages. Uses existing cards/points/bonus data. |
| **22** | Points balance by program | 22-points-balance-by-program | Dashboard panel with one card per program; foundational for understanding where points live and for powering travel goals. |
| **23** | Active bonus trackers UI (improvement) | 23-active-bonus-trackers-ui | Rich “Active Bonus Trackers” section (progress bars, days left, $ remaining) built on Card Pipeline / AI Bonus Plan; drives daily engagement. |
| **24** | Travel goals tracking | 24-travel-goals-tracking | Travel goals entity + tile + page (e.g. “Tokyo, 85% done”) that ties points balances and AI planning to concrete trip outcomes. |
| **25** | In-app help widget | 25-in-app-help-widget | Floating Help button with FAQ links and contact/feedback form; improves onboarding and support, can come later once more features are live. |
| **26** | Family points ledger & valuations | 26-family-points-ledger | Central place to define point programs and cents-per-point valuations (per family or user). Becomes the backbone for points balance, travel goals, and optimization features. |
| **27** | Earn-rate matrix & spend optimizer | 27-earn-rate-matrix-and-spend-optimizer | Uses the ledger (26) to build a matrix of value per dollar by category and a simple optimizer to suggest which card to use for each type of spend. Advanced but high value for power users. |
| **28** | Card history & reactivation insights | 28-card-history-and-reactivation-insights | Surfaced history of when cards were opened/closed and when they might be eligible again. Builds on existing card data; nice-to-have once core tracking and dashboards are in place. |

---

## Summary by theme

- **Foundation (1):** Notification center.  
- **Core value & insights (2–9, 21–23):** Expiry, export, import, spend sim, redemption calc, comparison, churn, wishlist, digest, milestones, dashboard metrics, points balance, active bonus trackers.  
- **Goals & travel planning (24):** Travel goals tracking, integrated with AI planning.  
- **Growth (12–15):** Share offer, referral, household, extension.  
- **Community / expansion (16–17):** Deal board, multi-currency.  
- **Monetization / scale (18–20) + UX polish (25):** API, content hub, partner offers, in-app help.

Adjust order if you ship Bonus Value Tracking or Card Pipeline earlier; wishlist (9), comparison (7), dashboard metrics (21), points balance (22), and active bonus trackers (23) all benefit from those.
