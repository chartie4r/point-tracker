# Idea 10: Referral program (invite friends)

**Goal:** Grow user base: each user gets a unique referral link; when a new user signs up via that link and completes an action (e.g. adds first card), the referrer gets a reward (e.g. extended trial, badge, or future premium benefit).

**What we build**
- User has a referral code or link (e.g. /register?ref=abc123). Store in new user: referredByUserId.
- "Invite friends" page: show link, copy button, optional email-invite form (we send email with link).
- When referred user completes "qualifying action" (e.g. add first card): mark referral as successful; reward referrer (what reward = configurable: badge, 1 month premium, etc.).

**Data**
- User: referralCode (unique), referredByUserId (nullable). ReferralEvent or Referral: referrerId, referredUserId, createdAt, qualifiedAt (nullable).

**Phases**
1. Generate referral code per user; store referredBy on signup; "Invite" page with link.
2. Define qualifying action; when it happens, set qualifiedAt and grant reward (e.g. set "premium until date" if we have paid tier).
3. Optional: referral dashboard (how many referred, how many qualified); email invite.

**Dependencies:** Clear definition of "reward"; paid tier if reward is premium.
