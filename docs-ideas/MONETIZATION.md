# Monetization: what to sell, how, and what stays free

This document outlines a balanced approach: keep core value **free** to grow usage and trust, then monetize through **premium features**, **partners**, and **optional paid add-ons**.

---

## 1. What stays free (always)

- **Core tracking:** Add and manage cards; weekly snapshots; view points and min-spend progress.  
- **Catalogue:** Browse available cards; compare bonuses and min spend from the catalogue.  
- **Essential planning:** Spend simulator (“when will I hit min spend?”), redemption calculator (“what are my points worth?”), card comparison (e.g. 2–3 cards).  
- **Basic alerts:** At least one channel for “points expiring” and “renewal / churn” (e.g. in-app only, or limited email).  
- **Export:** At least CSV export of your data (so users never feel locked in).  
- **Share / referral:** Share card offer link; refer a friend (basic referral reward if we can afford it).  

**Rationale:** Free core builds habit and trust. Locking basic tracking behind paywall would hurt growth and word-of-mouth.

---

## 2. What we can sell (premium)

| Offering | What it is | Why paid |
|----------|------------|----------|
| **Pro / Premium plan (subscription)** | Monthly or annual tier | Unlocks “power user” and convenience features below. |
| **Extra email & reminders** | More reminder types (expiry, churn), higher frequency, or “priority” email digest | We pay for email; power users get more. |
| **Wishlist “bonus improved” alerts** | Notify when a watched card’s bonus gets better | Tied to our bonus value data; differentiator. |
| **API access** | Read-only API key for cards/snapshots (spreadsheets, dashboards) | Serves power users and small teams; easy to gate. |
| **Household view** | Link accounts and see combined cards/points | Optional: make this Pro-only to avoid support complexity. |
| **Export PDF / advanced reports** | PDF export, or scheduled reports | Can be free for 1/month, unlimited on Pro. |
| **No (or fewer) “Partner offer” promos** | Pro users see fewer or no partner banners | Cleaner experience as a benefit of paying. |

**Suggested Pro price:** e.g. **$4–6/month** or **$40–50/year** (discount). Start with one plan; add higher tier later if needed.

---

## 3. How to sell (paywall placement)

- **Soft paywall:** User can use the app fully; when they hit a “Pro” feature (e.g. “Add to wishlist and get bonus alerts,” “Generate API key,” “Add second household member”), show: “This is a Pro feature — upgrade to unlock.”  
- **Free trial:** e.g. 14 days Pro when they sign up (or when they first try a Pro feature). No credit card if possible; then ask for payment to continue.  
- **Upgrade CTA:** In app header or profile: “Upgrade to Pro” linking to plan comparison and checkout.  
- **Checkout:** Use Stripe (or similar) for subscriptions; store `plan` (free/pro) and `subscriptionStatus` per user.

**What’s free vs Pro:** Keep the list in section 2 clear in a “Pricing” or “Pro” page so users know what they get.

---

## 4. Other ways to make money (non-subscription)

| Channel | What we do | Notes |
|--------|------------|--------|
| **Affiliate (card applications)** | When user clicks “Apply” to a card, use our affiliate link (Milesopedia, bank, etc.). We earn when they get approved. | Disclose “We may earn a commission.” Keep best offers visible; don’t bias catalogue unfairly. |
| **Partner offers (B2B)** | Partners pay to show promoted offers (banner, slot in digest). We charge per placement or rev share. | Requires consent (“Receive offers from partners”); see idea 19. |
| **Content hub / blog** | Articles with affiliate links (“Best cards for X,” “How to hit min spend”). SEO traffic → signups and clicks. | Some content stays purely educational (no paywall). |
| **Sponsored or “Featured” in deal board** | If we build the public deal board, one “Featured” slot could be paid (clearly labeled). | Only after we have organic community content and guidelines. |

---

## 5. Suggested rollout

1. **Phase 1 (no paywall):** Ship core free features; add affiliate where we already link to card applications.  
2. **Phase 2:** Introduce **Pro** with 2–3 clear benefits (e.g. API, wishlist alerts, PDF export). Add Stripe; 14-day trial.  
3. **Phase 3:** Add partner offers (with consent); optional “Household” or “No promos” as Pro perks.  
4. **Phase 4:** Content hub and deal board; use affiliate and optional sponsored slot for extra revenue.

---

## 6. One-line summary

- **Free:** Core tracking, catalogue, main planning tools, basic alerts, CSV export, share/referral.  
- **Paid (Pro):** Extra alerts, wishlist alerts, API, optional household, PDF/advanced export, fewer promos.  
- **Other revenue:** Affiliate (apply links), partner offers, content/SEO, optional sponsored deal board.

This keeps the app useful and trustworthy for free users while giving a clear reason to pay and multiple ways to grow revenue over time.
