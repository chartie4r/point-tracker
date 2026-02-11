# AI Bonus Plan – Feature Plan (draft)

**Goal:** Help the user follow a **step-by-step plan** to get credit card welcome bonuses (e.g. which card to get next, minimum spend, deadlines), tailored to their travel goals, family situation, and budget.

**Example of the kind of plan we want to produce:**  
[Notion – Gabrielle Garand & Mathieu Bourgeois](https://www.notion.so/myjeto/Gabrielle-Garand-Mathieu-Bourgeois-17e3a6212136804997e5e1a9d1e8edda) — reference for the structure, level of detail, and type of recommendations to aim for.

This document is a **plan to refine** before implementation. Improve each section until it matches what you want.

---

## 0. Key information needed before we can create the plan

The AI plan must be based on **concrete inputs**. Below is the set of information we need before generating a useful, personalized plan.

| # | Information | Purpose | Source in app |
|---|--------------|---------|----------------|
| 1 | **Current and past credit cards (and when)** | Know what the user already has / had; avoid re-recommending; respect “once per X years” rules; see portfolio mix (banks, programs). | **Already available:** Card list with status (Open / Closed / To_Open / Refused), open date, close date. “Previously owned” = cards with status Closed (and close date). |
| 2 | **What kind of travel they want** | Align card programs and points (e.g. Aeroplan vs Marriott vs flexible). | **To collect:** User preference (e.g. “Aeroplan / Canada”, “Marriott”, “Flexible points”, “Mix”). |
| 3 | **Family composition** | Size of trip (1 adult, 2 adults, adults + kids) drives how many points / cards needed and redemption strategy. | **To collect:** e.g. “1 adult”, “2 adults”, “2 adults + kids”, “Other”. |
| 4 | **When they want to travel** | Timeline drives card order and min-spend deadlines (e.g. “Travel in 18 months” → roadmap over 12–18 months). | **To collect:** e.g. target date or “Next 12 months”, “Next 24 months”, “No fixed date”. |
| 5 | **Monthly budget and where** | Estimate if min spend is achievable; which spend categories matter (groceries, travel, etc.). | **To collect:** Monthly budget (amount) + where they spend (categories or “general”); optional: which categories are easiest to put on a new card. |

**Summary:**

- **We already have:** Current and past cards + dates (from the existing card list).
- **We need to collect:** Travel type, family composition, travel timeline, monthly budget and where.

So the app needs a **“Plan context”** (or “Plan profile”) step: either a dedicated form before first plan generation, or a “My plan preferences” section that the user fills once and can edit. The AI then receives both **card history** (from DB) and **plan context** (travel, family, when, budget) to produce a plan in the style of your Notion example.

---

## 1. What is “the plan”?

**One-sentence:**  
A personalized, ordered list of actions (e.g. “Apply for card X → Meet min spend by date Y → Optionally add card Z”) that the user can follow to maximize or track welcome bonuses.

**Possible shapes (pick or combine):**

| Option | Description |
|--------|-------------|
| **A. Next-card suggestion** | AI suggests “your next best card” based on catalogue + user’s current cards and status. |
| **B. Full roadmap** | Ordered sequence of cards (and/or steps) over 6–24 months with rough dates. |
| **C. Per-card checklist** | For each card the user has or is considering: “Meet $X spend by date Y” with progress. |
| **D. Hybrid** | Next-card suggestion + checklist for current/planned cards (min spend, deadlines). |

**Your choice / notes:**  
_Replace this with: “We want A + C” or “We want B, then later D”, etc._

---

## 2. Who is it for?

- **Primary:** Logged-in users who have or want to add cards (from the catalogue).
- **Optional:** Should “the plan” exist for users with zero cards (e.g. “Start with these 3 cards”)? Yes / No / Later.

**Your notes:**  
_

_

---

## 3. What data do we have? (inputs for AI)

### 3.1 Already in the app (no new collection)

| Data | Where | Useful for plan? |
|------|--------|-------------------|
| **Catalogue (ScrapedCard)** | DB | Welcome bonus value (Y1/Y2), min spend, min spend notes, annual fee, bank, type, points type. |
| **User’s cards (current + past)** | Card + User | Card name, status (Open / Closed / To_Open / Refused), **open date, close date** → “currently have” vs “previously owned and when”. |
| **Snapshots** | WeeklySnapshot | Progress toward spend / points over time (if user tracks expenses). |
| **User profile** | User | Email, name. |

### 3.2 To collect: “Plan context” (needed before first plan)

These are the **key information** from Section 0. They must be stored (e.g. per-user table or JSON) and sent to the AI together with card history and catalogue.

| Field | Description | Example values / format |
|-------|--------------|--------------------------|
| **Travel type** | What kind of travel they want (drives program choice). | “Aeroplan / Canada”, “Marriott”, “Flexible points”, “Mix”, “Not sure yet”. |
| **Family composition** | Who is travelling (drives points volume and strategy). | “1 adult”, “2 adults”, “2 adults + kids”, “Other” (free text). |
| **When they want to travel** | Target timeline for the trip. | Date (e.g. “Summer 2026”), or “Next 12 months”, “Next 24 months”, “No fixed date”. |
| **Monthly budget** | How much they can put on cards (to meet min spend). | Amount in CAD (e.g. 3000). |
| **Where they spend (optional)** | Categories or notes (groceries, travel, etc.). | “Groceries, restaurants, subscriptions” or predefined categories. |

**Optional extra preferences (to decide):**

- “Only no-annual-fee”, “Only Aeroplan”, “Avoid AMEX”, etc.
- “Horizon”: “Plan for next 12 months” vs “Just the next card.”

**Your notes:**  
_

_

---

## 4. What does the AI produce? (outputs)

**Reference:** The plan output should match the **style and depth** of your Notion example ([Gabrielle Garand & Mathieu Bourgeois](https://www.notion.so/myjeto/Gabrielle-Garand-Mathieu-Bourgeois-17e3a6212136804997e5e1a9d1e8edda)): clear sections, timeline, card recommendations with reasoning, and actionable steps.

**Possible outputs:**

1. **Recommended next card(s)**  
   - 1–3 cards from catalogue with short reason (e.g. “Best value vs annual fee”, “Fits your travel goal + family size”, “Complements your current portfolio”).

2. **Ordered steps (roadmap)**  
   - e.g. “Step 1: Apply for Card A. Step 2: Spend $6,000 in 6 months (by date Y). Step 3: After bonus, consider Card B.” — aligned with **when they want to travel** and **monthly budget**.

3. **Per-card checklist items**  
   - e.g. “Card X: Spend $3,000 by 2025-08-01” with optional progress (if we have snapshot/expense data).

4. **Warnings / constraints**  
   - e.g. “You already have 2 AMEX; approval may be harder” or “Card Y has 6-month min spend – with your budget, plan 4–5 months.”

5. **Context summary (optional)**  
   - Short recap the AI used: “Travel: Aeroplan, 2 adults, target Summer 2026, ~$3k/month spend” so the user sees what the plan is based on.

**Format:**  
Structured (e.g. JSON) so the app can render sections, steps, dates, and links to cards — not only a long prose answer. Structure should allow the same **sections and flow** as in your Notion template.

**Your choice / notes:**  
_

_

---

## 4b. User flow (collect context → generate plan)

1. **First time / no context yet**  
   User goes to “My plan” (or clicks “Generate plan”).  
   - If plan context is missing → show form: travel type, family, when to travel, monthly budget, where they spend.  
   - On submit → save context, then call “Generate plan” (AI with context + card history + catalogue).  
   - Show the generated plan.

2. **Returning / context already saved**  
   User goes to “My plan”.  
   - Can click “Generate plan” or “Refresh plan” → AI runs with saved context + latest cards/catalogue.  
   - Can click “Edit preferences” to change travel, family, when, budget → save → optionally auto-refresh plan or prompt “Regenerate plan?”.

3. **Card list is the source of truth for “current and past cards”**  
   No extra form for card history; we use existing Card list (status, open/close dates) as in Section 0.

**Your notes:**  
_

_

---

## 5. Where does the plan live in the app?

**Possible placements:**

| Place | Pros | Cons |
|-------|------|------|
| **New “Plan” or “My plan” page** | Dedicated place; can show roadmap + checklist. | New route, new nav item. |
| **Dashboard / Home (logged-in)** | High visibility. | Home can get busy. |
| **Section inside “My cards”** | Close to card data. | Plan is more than “my cards” (catalogue too). |
| **Modal / side panel from Home or Nav** | Quick access. | Harder to show a long roadmap. |

**Your choice / notes:**  
_

_

---

## 6. How is the plan created or updated?

| Trigger | When | Notes |
|---------|------|--------|
| **On demand** | User clicks “Generate my plan” or “Refresh plan”. | Simple; user controls when AI runs. |
| **After changes** | After adding/removing a card or when catalogue is refreshed. | Always fresh but more API calls. |
| **Scheduled** | e.g. Weekly refresh in background. | More complex (jobs, storage). |

**Persistence:**  
- **Option A:** Do not store; generate on each visit (simpler, always uses latest data).  
- **Option B:** Store “last plan” in DB (e.g. `UserPlan` or JSON in User) and optionally refresh on demand or on data change.

**Your choice / notes:**  
_

_

---

## 7. Technical integration (high level)

- **AI provider:** Reuse existing **Anthropic** (already used for Milesopedia extraction). Same API key; new prompt(s) and possibly a new service (e.g. `bonusPlanService.js`).
- **Inputs to AI:**
  - **From DB:** User’s cards (current + past with open/close dates), catalogue subset (e.g. cards with welcome bonus).
  - **Plan context (new):** Travel type, family composition, when they want to travel, monthly budget, where they spend (see Section 0 and 3.2). Stored per user (new model or JSON column).
- **Output:** Parse AI response into a **structured plan** (e.g. `{ nextCards: [...], steps: [...], checklist: [...], contextSummary?: string }`) matching the structure of your Notion example; optionally store last plan per user.
- **Frontend:**
  - **Collect context:** Form or “Plan preferences” page (travel type, family, when, budget, where) — required or prompted before first “Generate plan”.
  - **Plan page:** Displays steps, checklist, and links to catalogue/cards; “Generate plan” / “Refresh” button; optional “Edit preferences” link.

**Risks / constraints:**  
- Token usage and latency (plan generation can be longer than extraction).  
- Need clear prompts and validation so the plan is safe and non-financial-advice (disclaimer if needed).

**Your notes:**  
_

_

---

## 8. Phases (implementation order)

**Phase 0 – Plan context (key information)**  
- [ ] **Data model:** Store “Plan context” per user: travel type, family composition, when they want to travel, monthly budget, where they spend (see Section 0 & 3.2). (New table e.g. `UserPlanContext` or JSON on User.)  
- [ ] **UI:** Form or “Plan preferences” / “My plan context” to collect and edit these 5 fields (and optional preferences).  
- [ ] **Flow:** Either require context before first plan, or prompt “Answer a few questions to get a personalized plan” when user clicks “Generate plan” and context is missing.

**Phase 1 – Foundation**  
- [ ] Define the **exact** structure of “the plan” (schema or JSON shape) to match the Notion example (sections, steps, checklist).  
- [ ] Backend: endpoint to **generate plan** (AI + card history + catalogue + **plan context**).  
- [ ] Optional: store last plan per user.

**Phase 2 – Basic UI**  
- [ ] “My plan” (or chosen) page with **Generate / Refresh** button.  
- [ ] If context missing → redirect or inline form to collect it, then generate.  
- [ ] Display plan (next card(s) + reasons, ordered steps, optional context summary).

**Phase 3 – Richer plan**  
- [ ] Checklist per card (min spend, deadline) with optional progress.  
- [ ] Links to catalogue and to “My cards”.  
- [ ] Optional filters: “Only no-annual-fee”, “Only Aeroplan”, etc.

**Phase 4 – Polish**  
- [ ] Copy and disclaimers (“Not financial advice”, etc.).  
- [ ] Loading and error states.  
- [ ] Optional: “Why this card?” expandable or tooltip; “Edit plan preferences” easily accessible.

**Your changes to phases:**  
_

_

---

## 9. Open questions

- **Liability / disclaimer:** Should we show a short “This is not financial advice” (or similar) near the plan?  
- **Language:** Plan in French, English, or both (e.g. follow app locale)?  
- **Catalogue scope:** Use full catalogue or filter (e.g. only cards with welcome bonus, or only certain banks)?  
- **Cost:** Should we cache plans or limit “Generate” frequency to control API cost?  
- **Notion structure:** To mirror your [Notion example](https://www.notion.so/myjeto/Gabrielle-Garand-Mathieu-Bourgeois-17e3a6212136804997e5e1a9d1e8edda) in the app, do you want to define the exact sections (e.g. “Summary”, “Timeline”, “Card 1 – …”, “Checklist”) so we can map them to a JSON schema and prompt the AI to output in that structure?

**Your questions / answers:**  
_

_

---

## 10. Summary (fill after you refine)

Once you’ve filled the “Your choice / notes” and “Your notes” above, summarize here so we have a single place to look before implementation:

- **Key information we need:**  
  - Cards (current + past with dates) → from existing card list.  
  - Travel type, family, when to travel, monthly budget, where they spend → collected via “Plan context” form and stored per user.

- **Plan shape:**  
- **Primary output:**  
- **Where in app:**  
- **When generated / stored:**  
- **First phase scope:** (Phase 0 = Plan context model + form; Phase 1 = AI + plan structure; etc.)

---

*Edit this file and add your choices; when you’re happy with it, we can turn it into implementation tasks.*
