# Card Pipeline – Feature Plan (draft)

**Goal:** Give the user a **pipeline view** of their cards in three stages: **waiting list** (cards they plan to get), **current** (cards they have and are waiting for the welcome bonus), and **completed** (bonus done or card closed). So they can see at a glance what’s next, what’s in progress, and what’s done.

This document is a **plan to refine** before implementation. Improve each section until it matches what you want.

---

## 1. Pipeline stages (columns)

**Three columns:**

| Stage | Meaning | User sees |
|-------|---------|-----------|
| **Waiting list** | Cards the user **plans to get** (not yet applied or not yet approved). | List of cards in “to open” / queue; optional order (e.g. “get this one first”). |
| **Current (waiting for bonus)** | Cards they **have open** and are **still working toward** the welcome bonus (e.g. meeting min spend). | Cards in progress: name, min spend target, deadline, optional progress. |
| **Completed** | Cards where the **bonus is done** (or they’re done with the card). | Cards that have earned the bonus or are closed; no action needed. |

**Optional fourth column (to decide):**  
- **Refused** — applications that were refused (today `status = Refused`). Could stay in “Waiting list” greyed out, or have their own column.

**Your choice / notes:**  
_

_

---

## 2. Mapping to existing data

**Current Card model:**  
- `status`: **Open** | **Closed** | **Refused** | **To_Open**

**Proposed mapping:**

| Pipeline stage | Card status | Notes |
|----------------|-------------|--------|
| **Waiting list** | **To_Open** | “Planned” / “I want this card” — already exists. |
| **Current (waiting for bonus)** | **Open** and “bonus not yet completed”. | We need a way to know if the user is still chasing the bonus. |
| **Completed** | **Open** with “bonus completed”, or **Closed**. | Done with the card or bonus. |
| **Refused** (optional) | **Refused** | Separate bucket or inside waiting list. |

**Gap:**  
Today we don’t store whether an **Open** card has “earned the welcome bonus” or not. So we can’t cleanly split Open cards into “current (chasing bonus)” vs “completed (bonus done)” without one of the following:

- **Option A – New field:** Add something like `welcomeBonusCompletedAt` (date) or `chasingBonus` (boolean). When the user marks “I got the bonus”, we set it. Then:  
  - **Current** = Open + `chasingBonus === true` (or `welcomeBonusCompletedAt == null`).  
  - **Completed** = Open + bonus completed, or Closed.
- **Option B – Inferred:** Use existing data only. E.g. “Current” = Open with `openDate` in the last N months and no “completed” flag; “Completed” = Open older than N months or Closed. (Less accurate.)
- **Option C – User chooses column:** Let the user **move** a card between “Current” and “Completed” (e.g. drag-and-drop or “Mark bonus completed”). Back end stores that as a new field (same as Option A) or as a separate “pipeline stage” override.

**Recommendation:** **Option A** (or C with storage): add `welcomeBonusCompletedAt` (DateTime?, optional). Null = still chasing bonus; set = bonus done. No need to change `status`; pipeline view uses status + this field to place the card.

**Your choice / notes:**  
_

_

---

## 3. What each column shows

**Waiting list**  
- Card name, bank, type, points type.  
- Optional: target “when to apply” (date or text).  
- Optional: **order** (e.g. 1, 2, 3) so the user can order “get this first, then this”. Order could be a new field `pipelineOrder` or `waitingListOrder` for cards with status To_Open.

**Current (waiting for bonus)**  
- Card name, bank, min spend to meet, deadline (if we have it: from catalogue or user-entered).  
- Optional: **progress** (e.g. “$2k / $6k spent”) if we have expense/snapshot data.  
- Link to card detail or snapshots.

**Completed**  
- Card name, bank, when bonus was completed (if we store it) or when closed.  
- Read-only; maybe “Move back to current” only in edge cases.

**Your choice / notes:**  
_

_

---

## 4. Where does the pipeline live in the app?

**Possible placements:**

| Place | Description |
|-------|-------------|
| **New “Pipeline” or “My pipeline” page** | Dedicated page with three columns (kanban-style or three lists). Default view for “where am I at” with my cards. |
| **Dashboard / Home (logged-in)** | Pipeline as the main widget (compact: counts or first few cards per column, “See full pipeline” link). |
| **Inside “My cards”** | Tab or view toggle: “List” vs “Pipeline”. |

**Recommendation:** **New “Pipeline” page** in the nav (e.g. next to “My cards” and “Catalogue”), so the pipeline is a first-class view. “My cards” stays the full list/table; Pipeline is the funnel view.

**Your choice / notes:**  
_

_

---

## 5. Actions and behaviour

**Waiting list**  
- Add card: from catalogue (“Add to my cards” with status To_Open) or “Add to pipeline” → new card with status To_Open.  
- Remove: delete card or change status.  
- Reorder: drag-and-drop or up/down buttons (needs `waitingListOrder` or similar).  
- “Move to current”: only when the card is actually open (e.g. user opens it in real life, then changes status to Open in the app; pipeline will show it in Current if bonus not completed).

**Current (waiting for bonus)**  
- “Mark bonus completed”: set `welcomeBonusCompletedAt = today` (or set `chasingBonus = false`); card moves to **Completed**.  
- Edit card / log snapshots: link to existing card detail and snapshots.

**Completed**  
- View only; or “Reopen” / “Mark as chasing bonus again” if we allow moving back (rare).

**Refused**  
- If we show them: keep in a separate column or in waiting list with a “Refused” badge; user can remove or change status.

**Your choice / notes:**  
_

_

---

## 6. Data model changes (summary)

| Change | Purpose |
|--------|---------|
| **`welcomeBonusCompletedAt`** (DateTime?, on Card) | Split Open cards into “current (chasing)” vs “completed (bonus done)”. |
| **`waitingListOrder`** (Int?, on Card) | Optional order of To_Open cards in the waiting list (1 = first, 2 = second, etc.). |

Both optional at first: we can ship a first version with **Completed** = “Open with welcomeBonusCompletedAt set, or Closed”, and **Current** = “Open with welcomeBonusCompletedAt null”. Order in waiting list can be “by created date” until we add `waitingListOrder`.

**Your choice / notes:**  
_

_

---

## 7. Who sees it?

- **All logged-in users** who have cards (or empty pipeline).  
- Pipeline is **per user** (only their own cards). No change to auth.

**Your choice / notes:**  
_

_

---

## 8. Phases (implementation order)

**Phase 1 – Backend and mapping**  
- [ ] Add **`welcomeBonusCompletedAt`** to Card (migration).  
- [ ] API: ensure cards list (or new endpoint) returns this field; pipeline logic: **Waiting list** = To_Open, **Current** = Open + welcomeBonusCompletedAt null, **Completed** = Open with welcomeBonusCompletedAt set OR Closed.  
- [ ] API: “Mark bonus completed” (PATCH card, set welcomeBonusCompletedAt).

**Phase 2 – Pipeline page (basic)**  
- [ ] New **Pipeline** page: three columns (Waiting list | Current | Completed).  
- [ ] Fetch user’s cards; group by stage; display cards in each column (name, bank, key info).  
- [ ] “Mark bonus completed” button on cards in Current.

**Phase 3 – Waiting list order and polish**  
- [ ] Optional: **`waitingListOrder`** on Card; API to reorder (PATCH order).  
- [ ] UI: drag-and-drop or up/down to reorder waiting list.  
- [ ] Show min spend / deadline in Current (from catalogue or card); optional progress if we have data.

**Phase 4 – Optional**  
- [ ] Refused column or badge.  
- [ ] “Target apply date” on waiting-list cards.  
- [ ] Link to Bonus Value Tracking (“Is this card’s offer good right now?”).

**Your changes to phases:**  
_

_

---

## 9. Open questions

- **Refused:** Separate column, or show inside waiting list with a “Refused” label?  
- **Order:** Do we need a custom order for Completed (e.g. “most recent first”) or is “by date” enough?  
- **Min spend / deadline in Current:** From catalogue (via milesopediaSlug) or user-entered on Card (we have `deadline`; do we have “min spend for this card” on Card or only in catalogue)?

**Your questions / answers:**  
_

_

---

## 10. Summary (fill after you refine)

- **Stages:** Waiting list | Current (waiting for bonus) | Completed [(+ Refused?)].  
- **Mapping:** To_Open → Waiting list; Open + bonus not done → Current; Open (bonus done) or Closed → Completed.  
- **New field:** `welcomeBonusCompletedAt` (optional date) on Card.  
- **Where:** New “Pipeline” page.  
- **First phase scope:**  

---

*Edit this file and add your choices; when you’re happy with it, we can turn it into implementation tasks.*
