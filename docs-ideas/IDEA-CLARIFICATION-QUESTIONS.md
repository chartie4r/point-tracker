# PointsRocket – Idea Clarification Questions

This file is a **questionnaire** to clarify each idea before implementation.  
Work through it **in order (1 → 28)** alongside `IMPLEMENTATION-ORDER.md` and each idea doc (`01-*.md`, etc.).

For every idea:
- Answer the questions directly in that idea’s own doc, or
- Copy the questions into a planning doc / Notion and answer them there,
then update the idea doc with the decisions.

---

## 1. In‑app notification center (`01-notification-center.md`)

1. Which notification types do we need in v1 (expiry alerts, churn, wishlist, referral, system messages, …)?  
2. Where does the notification center live in the UI (icon in header, separate page, panel on dashboard)?  
3. Do notifications need **read/unread** state and “mark all as read”?  
4. How long do we keep notifications (forever, N days, only until read)?  
5. Do we group notifications by card / program / date or show a flat list?  
6. Do we support **in‑app only** in v1, or do we also mirror some notifications via email?  
7. What user settings are needed (mute certain types, disable all, etc.)?

---

## 2. Points expiry alerts (`02-points-expiry-alerts.md`)

1. Are expiry dates tracked **per program**, **per card**, or both in v1?  
2. Who sets/updates expiry info: only the user, or can we prefill based on known rules (e.g. Aeroplan inactivity rules)?  
3. Which reminder offsets do we support initially (e.g. 90/30/7/1 days)? Are they configurable per entry or global?  
4. Which channels do we support for alerts in v1 (in‑app, email, both)?  
5. What should the alert text look like (include card name, program, current balance, suggested actions)?  
6. How do we avoid duplicate alerts if the user updates the expiry date or “snoozes” it?  
7. Do we allow **one expiry per program** per user, or multiple entries (e.g. separate family pools)?

---

## 3. Export reports (CSV/PDF) (`03-export-reports.md`)

1. What export formats are required in v1 (CSV only, CSV + simple PDF, something else)?  
2. Which entities can be exported: cards, snapshots, expiry rules, travel goals, all of the above?  
3. Is exporting **user‑scoped only**, or do we need admin exports of many users?  
4. Do we need scheduled exports (e.g. monthly email) in v1, or only “export now”?  
5. How should we handle large datasets—streaming download vs. synchronous generation limits?  
6. Are there any privacy constraints on what can appear in exports (e.g. hide email, internal IDs)?  
7. Should exports include **derived metrics** (e.g. total points value, bonus progress) or raw data only?

---

## 4. CSV import (`04-csv-import.md`)

1. What will users import first: cards, snapshots, or both?  
2. Which CSV formats do we support in v1 (our own template, bank exports, third‑party tools)?  
3. How do we map columns: fixed header names, a mapping step in the UI, or both?  
4. How do we handle duplicates (e.g. same card already exists, same snapshot week)?  
5. Should imports be **idempotent** (safe to re‑import the same file)? If so, based on which keys?  
6. Do we need an “import preview” and error report (rows rejected with reasons)?  
7. Where does the import entry point live in the UI (profile, settings, dedicated import page)?

---

## 5. Spend simulator (`05-spend-simulator.md`)

1. What is the primary question the simulator must answer (e.g. “When will I hit this card’s min spend?” vs “How much value will I earn per month?”)?  
2. Is the simulator per card, per group of cards, or both?  
3. Which inputs do we ask from the user: monthly spend by category, by merchant, or total monthly spend?  
4. How precise does the model need to be regarding categories vs. flat earn rates (integrate with earn‑rate matrix later or keep v1 simple)?  
5. How do we surface the output: simple text and a date, a small chart, or a card-like summary with options?  
6. Can the simulator consider **multiple welcome bonuses at once** (e.g. prioritize card X until min spend reached, then card Y)?  
7. Should we store simulator scenarios, or is it ephemeral/what‑if only in v1?

---

## 6. Redemption calculator (`06-redemption-calculator.md`)

1. Is the calculator program‑specific (Aeroplan vs. Marriott) or generic “cents per point”?  
2. Where do the point valuations come from: static defaults, user‑adjustable values, or from idea 26 (Family points ledger)?  
3. What are the main user questions: “What is my current balance worth?”, “Is this redemption a good deal?”, or both?  
4. Do we need **what‑if sliders** (e.g. number of points, cash copay) or just simple inputs?  
5. How do we present “good vs bad value”—thresholds, color coding, or textual tips?  
6. Should we support **multi‑program redemptions** (e.g. transferring points) in v1 or add that later?  
7. Where does this tool live: standalone page, embedded in dashboard, or inside card details?

---

## 7. Card comparison tool (`07-card-comparison-tool.md`)

1. How many cards can be compared side by side in v1 (2, 3, more)?  
2. Which dimensions must appear in the comparison (fees, welcome bonus, earn rates, perks, insurance, etc.)?  
3. Are we comparing **catalogue cards**, **user cards**, or both?  
4. How do users pick cards to compare (from catalogue list, search, saved list, deep links)?  
5. Do we need computed fields like “value 1st year after fees,” “net value after min spend”?  
6. How should we present complex data like tiered bonuses or multiple point currencies?  
7. Will comparison results link directly to actions (Apply, Add to my cards, Add to wishlist)?

---

## 8. Churn reminder (`08-churn-reminder.md`)

1. Do reminders fire based on **anniversary date**, **annual fee date**, or a custom user‑defined churn window?  
2. Should we support **multiple reminders** per card (e.g. 60/30/7 days before)?  
3. What actions do we suggest at reminder time (close, product switch, downgrade, keep)?  
4. How does the user configure per‑card churn strategy (e.g. “close unless fee waived”) if at all?  
5. Which channels: in‑app only in v1, or in‑app + email?  
6. How do we handle cards without reliable open/fee dates (fallback assumptions or no reminder)?  
7. Should we tie churn reminders into any “card history / reactivation” logic (idea 28)?

---

## 9. Wishlist / watchlist (`09-wishlist-watchlist.md`)

1. Is the wishlist per **catalogue card** only, or can users wishlist custom cards as well?  
2. What events trigger alerts for a watchlisted card (welcome bonus value change, fee waiver, special promo)?  
3. Where does the wishlist live in the UI (separate page, section on catalogue, dashboard tile)?  
4. Do we need priority or ordering (e.g. “top 3 next cards I want”)?  
5. Which notification channels are used for wishlist events?  
6. How do we avoid spamming users if bonuses change frequently (rate‑limiting, digest mode)?  
7. Do we expose any meta‑info like how long a card has been on the wishlist or how often its bonus changes?

---

## 10. Email digest (`10-email-digest.md`)

1. How often do we send digests (weekly, monthly, configurable)?  
2. What core sections should the digest contain: upcoming expiries, churn reminders, new bonuses, progress on goals, etc.?  
3. Does the user choose which sections to include, or is there a fixed template in v1?  
4. How do we link from email back into the app (deep links per card/goal)?  
5. What is the minimum email infrastructure we want before launching (provider, tracking, unsubscribe)?  
6. How do users opt‑in/out of digests, and is it separate from other email types (alerts, marketing)?  
7. Should digests be **localized** and follow the app’s language preference?

---

## 11. Milestones & badges (`11-milestones-badges.md`)

1. Which specific milestones do we want in v1 (e.g. first card added, first bonus completed, total points earned thresholds)?  
2. Are milestones purely informational, or do they unlock any additional features/perks?  
3. Where do badges show up (profile, dashboard, notification center)?  
4. Do we need a **history** of milestone achievements or just current badges?  
5. How frequently do we award badges that might encourage unhealthy behaviour (e.g. too many cards)? Any guardrails?  
6. Are milestones per user only, or do we need household / shared milestones later?  
7. How important is configurability vs. hard‑coded rules in v1?

---

## 12. Share card offer (`12-share-card-offer.md`)

1. What exactly is shared: a generic card description page, a personalized invite link, or both?  
2. Where do we host shared pages (public PointsRocket domain, custom domain, deep links)?  
3. How do we include affiliate/referral IDs while staying transparent (disclaimers, labeling)?  
4. Do shared pages show **live bonus data** from the catalogue or a snapshot at time of sharing?  
5. Which channels should be optimized in the UI (copy link, email, WhatsApp, etc.)?  
6. Do we track share events and resulting signups/approvals, and if so, how?  
7. Are there privacy concerns if a shared link reveals anything about the sharer beyond a generic referral code?

---

## 13. Referral program (`13-referral-program.md`)

1. What is the referral **reward** (extra features, Pro trial, points, nothing for now)?  
2. At what milestone do we grant the reward (invitee signs up, adds a card, hits first snapshot, etc.)?  
3. How do we prevent abuse (self‑referrals, spam, throwaway accounts)?  
4. Do we need per‑user referral codes, invite links, or both?  
5. Where in the app do we surface referral CTAs (header, profile, dedicated page)?  
6. How much referral metrics do we expose to users (number of invites, successful referrals, pending)?  
7. Do we need admin tooling to manage/refund/correct referral rewards?

---

## 14. Family / household view (`14-family-household-view.md`)

1. What is the base **entity**: “household”, “family”, or just sharing between users?  
2. How are members invited and verified (email invite, link, require accounts first)?  
3. What data can be shared: all cards, only some cards, just points balances, or aggregated totals only?  
4. How do we handle **permissions** (owner vs member, who can edit what)?  
5. Are household features free or part of a Pro plan (see `MONETIZATION.md`)?  
6. How will household data appear in dashboards (combined points, per‑member breakdown)?  
7. Do we need controls for leaving a household and handling shared data afterwards?

---

## 15. Browser extension (`15-browser-extension.md`)

1. Primary purpose: quick add of cards, parsing offers from bank sites, auto‑capture of statements, or something else?  
2. Which browsers are in scope for v1 (Chrome/Edge, Firefox, Safari)?  
3. What is the minimal API surface between extension and backend (auth token, add card endpoint, capture snapshot)?  
4. Do we need content‑script scraping of bank pages, or just manual form helpers?  
5. How do we handle auth securely (avoid storing long‑lived tokens in extension where possible)?  
6. What is the failure mode when the extension can’t parse a page (fallback manual entry UX)?  
7. Are there any compliance/ToS concerns with scraping particular bank websites we need to consider?

---

## 16. Public deal board (`16-public-deal-board.md`)

1. Who can post deals: only admins, selected contributors, or any logged‑in user?  
2. What content structure do deals have (title, description, expiry date, tags, affiliate links)?  
3. How do we moderate (review queue, reporting mechanism, edit/delete rules)?  
4. Do we need voting / ranking (upvotes, trending, hot/new tabs)?  
5. Are deals strictly card offers, or also promos, transfer bonuses, hotel/flight deals?  
6. How do we differentiate **editorial/organic** deals vs **sponsored** or partner offers?  
7. Where do we link to the deal board from inside the app and homepage?

---

## 17. Multi‑currency / multi‑program (`17-multi-currency-programs.md`)

1. Which additional currencies/programs do we want to support first (USD, EUR, US card programs, etc.)?  
2. How do we store currency at the data model level (per card, per snapshot, global user currency)?  
3. Where and how do we convert between currencies (live FX rates, daily snapshot, manual override)?  
4. How do we adapt existing UX (totals, dashboards, calculators) to show mixed currencies cleanly?  
5. Do we need per‑program valuations in multiple currencies (e.g. Aeroplan in CAD vs USD)?  
6. Should users be able to **filter or segment** views by currency/program?  
7. How does this interact with future regions (e.g. US‑only vs CA‑only offers)?

---

## 18. API for power users (`18-api-for-power-users.md`)

1. Is the API read‑only in v1, or do we allow writes (adding cards, snapshots)?  
2. What auth model will we use (personal access tokens, OAuth client, both)?  
3. Which resources are in scope for v1 (cards, snapshots, goals, valuations, notifications)?  
4. Are there any rate limits we need from day one?  
5. How will we document the API (OpenAPI, docs site, examples)?  
6. Is the API a **Pro‑only** feature, and if so, how do we enforce that at token level?  
7. Are there any data we explicitly **must not** expose via API (sensitive info, internal IDs)?

---

## 19. Content hub / blog (`19-content-hub-blog.md`)

1. Who will write content: you, guest posts, curated links?  
2. What is the target cadence and content type (how‑tos, guides, deals, opinion pieces)?  
3. Do we need a full CMS or is a static MD/MDX-based blog enough for v1?  
4. How tightly integrated should content be with the app (e.g. related articles on dashboard, inside tools)?  
5. How do we handle localization (French only, bilingual, later expansion)?  
6. How will we use affiliate links or partner placements in content while staying transparent?  
7. Do we need search, tags, and categories in v1?

---

## 20. Partner offers (`20-partner-offers.md`)

1. What forms can partner offers take (banners, tiles, deal‑board “featured” spots, email placements)?  
2. How do we **label** sponsored vs organic content to stay transparent?  
3. How will partners configure and track campaigns (manual config, internal admin UI, external self‑serve)?  
4. What targeting rules do we need (country, card portfolio, goals, wishlist items)?  
5. Do we need frequency caps per user to avoid overwhelming them?  
6. How do partner offers interact with Pro users (remove promos entirely, reduce, or no change)?  
7. What reporting/analytics do we owe partners (impressions, clicks, conversions)?

---

## 21. Dashboard summary metrics (`21-dashboard-summary-metrics.md`)

1. Which tiles are in v1 (Total points, Active cards, Bonus progress, Travel goal, …)?  
2. For each tile, what is the exact formula and data source (e.g. which fields on `Card`, `Snapshot`, `Goal`)?  
3. How “live” do metrics need to be (on‑the‑fly compute vs pre‑computed nightly)?  
4. Do tiles link into deeper views (e.g. click “Total Points” → points by program)?  
5. What happens when there is **no data** yet (empty state text and guidance)?  
6. Should metrics be scoped per user only, per household, or both with a toggle?  
7. Are any tiles Pro‑only, or is the summary always free?

---

## 22. Points balance by program (`22-points-balance-by-program.md`)

1. How do we define a “program” entity (key, display name, valuation source)?  
2. How do we aggregate balances from multiple cards in the same program?  
3. How do we handle programs that can’t be easily inferred from cards (manual entries)?  
4. What additional info do we show per program tile (valuation, recent change, last updated)?  
5. How does this tie into idea 26 (family points ledger & valuations)?  
6. Where does this widget live (dashboard right column like your reference design, dedicated page)?  
7. Do we need to support **household totals by program** in v1?

---

## 23. Active bonus trackers UI (`23-active-bonus-trackers-ui.md`)

1. Which card fields define an “active bonus” (min spend, deadline, bonus value, status)?  
2. What is the minimum data we require to show a card in this section?  
3. How do we visualize progress (amount spent vs required, days left, % complete)?  
4. Should we integrate AI or Card Pipeline logic in v1, or stick to deterministic calculations?  
5. How does the user **mark a bonus complete** or cancel it?  
6. Where does this UI live (dashboard center panel like your screenshot, separate page)?  
7. Do we show historical/completed bonuses anywhere, or only current ones?

---

## 24. Travel goals tracking (`24-travel-goals-tracking.md`)

1. What is the core entity for a travel goal (destination, date, cost estimate, program breakdown)?  
2. How do we estimate required points/cash for a goal (manual input vs calculator integration)?  
3. Can a goal be funded by **multiple programs** and currencies, and how do we present that?  
4. How do we tie goals to cards and bonuses (recommended cards to pursue, recommended redemptions)?  
5. What indicators do we show: % progress, remaining points, ETA based on current earn rate?  
6. How many active goals can a user reasonably have, and do we enforce a limit?  
7. Where do goals surface in the UI (dashboard tile, dedicated goals page, integration in travel‑related content)?

---

## 25. In‑app help widget (`25-in-app-help-widget.md`)

1. What should the help widget include in v1 (FAQ links, search, contact form, feedback, all of these)?  
2. Where does the entry point live (bottom‑right button, header icon, help link in nav)?  
3. Do we need any third‑party integration (Intercom, Crisp, custom email form), or is it static links first?  
4. How do we collect feedback or bug reports (simple form, screenshot capture, structured categories)?  
5. Do we localize help content and links, or keep it language‑agnostic initially?  
6. Who receives help requests, and how are they routed/triaged on your side?  
7. Do we log any analytics around help usage to inform future onboarding improvements?

---

## 26. Family points ledger & valuations (`26-family-points-ledger.md`)

1. At what level do we store valuations: global defaults, per user, per household, or all of the above?  
2. How granular are valuations (per program only, or per program + redemption type)?  
3. What UI do we need for power users to override defaults (simple form vs advanced settings)?  
4. How do we ensure we don’t break historical numbers when valuations are updated (versioning, timestamps)?  
5. Which features consume this ledger in v1 (redemption calculator, points balance by program, dashboard tiles, optimizer)?  
6. How do we handle multi‑currency valuations (CAD vs USD vs others)?  
7. Should valuations ever be pulled from an external source (community averages, your own inputs) or fully manual?

---

## 27. Earn‑rate matrix & spend optimizer (`27-earn-rate-matrix-and-spend-optimizer.md`)

1. Which categories must we support initially (match your spreadsheet: groceries, gas, restaurants, etc.)?  
2. Who enters earn rates: only you/admin in an internal tool, or can end users edit earn rates too?  
3. How do we display the matrix (dense table, responsive cards, color‑highlighted “best card” cells)?  
4. For the optimizer, what is the simplest output we can ship that is still useful (card per category + total monthly value)?  
5. Do we need to consider welcome bonus min‑spend constraints in v1, or add that later?  
6. Should we suggest **alternative strategies** (e.g. “maximize everyday value” vs “prioritize bonuses”)?  
7. Is this feature Pro‑only, or partially free (matrix free, optimizer Pro)?

---

## 28. Card history & reactivation insights (`28-card-history-and-reactivation-insights.md`)

1. What history do we want to show per card (open date, close date, bonuses earned, product changes)?  
2. Where in the UI will this history live (within card detail, separate history page, timeline widget)?  
3. How do we determine “reactivation eligibility” (simple rules per bank, custom per user, manual notes)?  
4. Do we need to support bank‑specific rules (e.g. “once per lifetime,” “24 months between bonuses”)?  
5. How should we surface insights (e.g. “You may be eligible again for Card X after [date]”)?  
6. Should we integrate these insights into churn reminders and the wishlist (“wait until eligible again” suggestions)?  
7. Are there any privacy/retention limits on how long we keep card history (e.g. delete after account deletion, anonymization)?

