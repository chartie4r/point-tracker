# Bonus Value Tracking – Feature Plan (draft)

**Goal:** Follow the **welcome bonus value** (and related offer details) for each catalogue card over **multiple months**, so the user can see whether the deal is getting **better or worse** over time and decide if now is a good time to apply or wait.

This document is a **plan to refine** before implementation. Improve each section until it matches what you want.

---

## 1. What are we tracking?

**One-sentence:**  
For each card in the catalogue, we keep a **time series** of key offer metrics (welcome bonus value, min spend, annual fee, etc.) so we can compare “then vs now” and show a **trend** (good / bad / neutral deal over time).

**Metrics to track over time (per card):**

| Metric | Source today | Purpose |
|--------|---------------|---------|
| **Welcome bonus value (Y1)** | `ScrapedCard.welcomeValueY1` | Main “deal quality” signal; e.g. $500 → $600 = better, $500 → $400 = worse. |
| **Welcome bonus value (Y2)** | `ScrapedCard.welcomeValueY2` | Optional; same idea for year 2+. |
| **No welcome bonus** | `ScrapedCard.noWelcomeBonus` | Deal disappeared or never had one. |
| **Minimum spend** | `ScrapedCard.minSpend` | Lower min spend = easier to get bonus; track if offer got harder or easier. |
| **Min spend notes** | `ScrapedCard.minSpendNotes` | Human-readable condition (e.g. “$6k in 6 months”); useful in history. |
| **Annual fee** | `ScrapedCard.annualCost` | Context for “value vs cost”; e.g. same bonus but fee went up = worse deal. |

**Optional (to decide):**  
- Track only a subset (e.g. just `welcomeValueY1` + `minSpend` + `annualCost`) to keep history simple.  
- Or add `bonusDetails` (text) for reference, at the cost of more storage.

**Your choice / notes:**  
_

_

---

## 2. Current state vs what we need

**Today:**  
- **ScrapedCard** holds the **current** state of each catalogue card (one row per card, updated on refresh).  
- On catalogue refresh we **overwrite** these values — we do **not** keep previous values.  
- So we have **no history** of “what was the bonus last month vs this month”.

**What we need:**  
- **Historical snapshots** of the same metrics, keyed by **card** (e.g. `milesopediaSlug`) and **time** (e.g. date of the snapshot, or month).  
- Each time we refresh the catalogue (full or single card), we **record** the current bonus-related fields in a **history** table before or after updating `ScrapedCard`.  
- No change to how we scrape or update `ScrapedCard`; we only **add** a step: “save a snapshot of these fields for this card at this date.”

**Your notes:**  
_

_

---

## 3. Data model (high level)

**Option A – Dedicated history table**

- New table, e.g. **`BonusValueHistory`** (or `ScrapedCardHistory`):
  - `id`, `milesopediaSlug` (or `scrapedCardId`), **`snapshotDate`** (date or datetime of the snapshot),
  - `welcomeValueY1`, `welcomeValueY2`, `noWelcomeBonus`, `minSpend`, `minSpendNotes`, `annualCost`,
  - optional: `cardName`, `bank` for easier display without joining.
- One row per card per snapshot.  
- **When:** On every catalogue refresh (and optionally on single-card refresh), for each card that was updated, insert one row with today’s date and current values.

**Option B – Append-only “event” log**

- Same idea but table name / semantics as “we logged the state at this time”; structure similar to Option A.

**Option C – Monthly rollup**

- Store one row per card per **month** (e.g. “2025-01”, “2025-02”). On refresh, upsert the row for the current month with the latest values.  
- Simpler for “one value per month” charts; loses intra-month changes.

**Recommendation:** Start with **Option A** (one row per snapshot per card per refresh date). We can always aggregate by month in queries or in the UI. If storage or volume becomes an issue, we can later prune old snapshots or move to Option C.

**Your choice / notes:**  
_

_

---

## 4. When do we record a snapshot?

| Trigger | When | Notes |
|---------|------|--------|
| **Full catalogue refresh** | After scraping all cards from Milesopedia. | For each card in the result, insert (or upsert) one history row with `snapshotDate = today` and current bonus fields. |
| **Single-card refresh** | After refreshing one card (e.g. superadmin “Refresh” on one catalogue card). | Insert one history row for that card with `snapshotDate = today`. |
| **Never automatically** | Only when user clicks “Record current offer”. | Manual only; more control, but history stays sparse unless users remember to do it. |

**Recommendation:** **Automatic** on every catalogue refresh and every single-card refresh, so history builds up over time without user action. Optional: also allow a “Record snapshot now” button for a card so superadmin can force a point-in-time record.

**Your choice / notes:**  
_

_

---

## 5. Where does this appear in the app?

**Possible placements:**

| Place | Description |
|-------|--------------|
| **New “Bonus history” or “Deal tracker” page** | Dedicated page: list catalogue cards (or a subset), per card show a timeline or chart of bonus value (and optionally min spend, annual fee) over time; indicate “better” / “worse” / “same” vs previous snapshot or vs N months ago. |
| **Inside catalogue (Available cards)** | On the catalogue list or card detail: “Bonus history” link or small chart (e.g. “Last 6 months: $500 → $600”) for that card. |
| **Both** | A full “Deal tracker” page with all cards + trends, and a short summary or link on each catalogue card. |

**What the user sees (examples):**

- **Table:** Card name | 3 months ago | 2 months ago | 1 month ago | Today | Trend (e.g. ↑ better, ↓ worse, → same).  
- **Chart:** Line chart per card – e.g. welcome value (Y1) on Y-axis, time on X-axis.  
- **Badge or label:** “Best offer in 6 months” or “Offer down from 6 months ago”.

**Your choice / notes:**  
_

_

---

## 6. “Good” vs “bad” deal – how do we define it?

So the user can see at a glance if the deal is good or bad over time, we need a simple rule (or a few).

**Possible rules:**

| Rule | Example |
|------|---------|
| **Vs previous snapshot** | Current welcome value &gt; previous → “Better”; &lt; previous → “Worse”; same → “Same”. |
| **Vs N months ago** | Current vs value from 3 (or 6) months ago. |
| **Vs max in history** | “Currently at the highest we’ve seen” = good; “Below max” = show “Best was $X on date Y”. |
| **Composite** | Consider both bonus value and min spend (e.g. same bonus but lower min spend = better). |

**Edge cases:**  
- Card had no welcome bonus before, now has one (or vice versa).  
- New card in catalogue (no history yet) → show “No history” or “First snapshot today”.

**Your choice / notes:**  
_

_

---

## 7. Who can see it?

| Audience | Notes |
|----------|--------|
| **All logged-in users** | Any user can see bonus history for catalogue cards (read-only). |
| **Superadmin only** | Only superadmin sees the tracker (e.g. to monitor deals before recommending). |
| **Public (no login)** | Unlikely for a points-tracker app; possible if you want a “public deal tracker” later. |

**Your choice / notes:**  
_

_

---

## 8. Technical notes

- **Backend:** New model (e.g. `BonusValueHistory`) and migration; hook into existing **catalogue refresh** and **single-card refresh** flows to insert a row per card after update. New API routes, e.g. `GET /api/available-cards/:slug/bonus-history` or `GET /api/bonus-history` (list all cards with history).
- **Frontend:** New page or section; call API and render table and/or chart (e.g. with a small charting library or simple HTML/CSS trend indicators).
- **Performance:** If history grows large, index on `(milesopediaSlug, snapshotDate)` and limit queries to last N months or last N snapshots per card.

**Your notes:**  
_

_

---

## 9. Phases (implementation order)

**Phase 1 – Data and capture**  
- [ ] Add **BonusValueHistory** (or chosen name) model and migration.  
- [ ] On **catalogue refresh**: after updating `ScrapedCard`, insert one history row per card with current bonus fields + `snapshotDate = today`.  
- [ ] On **single-card refresh**: same for that one card.  
- [ ] API: `GET /api/bonus-history` (or per-card) returning time series for one or all cards.

**Phase 2 – Basic UI**  
- [ ] New “Bonus history” / “Deal tracker” page (or integrate into catalogue).  
- [ ] List cards with at least one history row; show **table** of snapshots (e.g. last 6 dates) and **trend** (better / worse / same vs previous or vs oldest in range).

**Phase 3 – Charts and polish**  
- [ ] Simple **chart** per card (e.g. welcome value over time).  
- [ ] “Best in N months” / “Below best” labels.  
- [ ] Optional: filter by card, date range, or program (Aeroplan, etc.).

**Phase 4 – Optional**  
- [ ] “Record snapshot now” button (superadmin or user) to force a snapshot without a full refresh.  
- [ ] Export (CSV) or link to catalogue card from each row.

**Your changes to phases:**  
_

_

---

## 10. Open questions

- **Retention:** Keep all snapshots forever, or prune after 12/24 months to limit DB size?  
- **Timezone:** Use server date (UTC or app timezone) for `snapshotDate` so “today” is consistent.  
- **New cards:** When a new card appears in the catalogue (new `milesopediaSlug`), first snapshot is at first refresh — no “before” to compare; UI can show “First recorded on &lt;date&gt;”.

**Your questions / answers:**  
_

_

---

## 11. Summary (fill after you refine)

- **What we track:**  
- **When we record:**  
- **Where in app:**  
- **Good vs bad rule:**  
- **First phase scope:**  

---

*Edit this file and add your choices; when you’re happy with it, we can turn it into implementation tasks.*
