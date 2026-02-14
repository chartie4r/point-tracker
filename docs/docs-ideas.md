# Docs & ideas

Backlog and ideas for features and documentation. Categories: current priorities first, **NTH** (nice to have) at the end.

---

## NTH (nice to have)

### Setup checklist

**Context:** On the Card details page (tracked view), a checklist to help users get the most out of a new card and stay on track for the welcome bonus.

**Idea:**
- Panel titled “Setup checklist” with a list of actionable items, each with:
  - Checkbox (done / not done)
  - Short label (e.g. “Set up automatic payments”)
  - One-line description (e.g. “Avoid interest and keep the bonus on track with full statement autopay.”)
- Optional: “Mark all as done” action.
- Items can be generic (autopay, mobile wallet, transaction alerts, review card benefits) or later driven by card/offer type.
- Persistence: store completion per user/card (e.g. in backend or local storage) so state survives refresh.

**Removed from UI:** Previously implemented as a section on the Card details (tracked view); removed and captured here for potential future implementation.

---

### Next actions

**Context:** On the Card details page (tracked view), suggested next steps to hit the minimum spend and earn the welcome bonus.

**Idea:**
- Panel titled “Next actions” with a list of tasks, each with:
  - Label and short description
  - Status (e.g. Not started, In progress, Done) with a small badge
  - Optional meta (e.g. “Target this week”, “Ongoing”)
  - “Mark done” (or “Advance”) action to move task to done.
- Example tasks: “Move upcoming trip flights to this card”, “Shift groceries and gas to this card”, “Plan one large purchase”.
- Can be static tips or, later, derived from spend pace and time left (e.g. suggest “Plan one large purchase” when remaining spend is high and days are low).
- Persistence: optional storage of completion per user/card for “Mark done”.

**Removed from UI:** Previously implemented as a section on the Card details (tracked view); removed and captured here for potential future implementation.

---

### Recent activity

**Context:** On the Card details page (tracked view), a table of recent transactions that count toward the welcome bonus.

**Idea:**
- Panel titled "Recent activity" with a table: Date, Merchant, Category, Amount, Points, Counts toward bonus.
- Data should align with Spending Timeline and Spend by Category (same total and category breakdown).
- Optional "View all" link to a full transaction history.
- Backend: real transactions from linked accounts or manual entry; filter by card and bonus-eligibility.

**Removed from UI:** Section removed from Card details (tracked view); captured here for potential future implementation.

---

### Bonus milestones

**Context:** On the Card details page (tracked view), a vertical timeline of key steps from card approval to bonus posting.

**Idea:**
- Panel titled "Bonus milestones" with steps such as: Card approved, Card activated, First purchase, 25% / 50% / 75% of minimum spend, Minimum spend met, Bonus points posted.
- Each step: title, date (or "Estimated …"), short description, status badge (Completed / In progress / Upcoming).
- Visual: dot and connecting line; styling by status (e.g. green for done, accent for current, neutral for upcoming).
- Data can be derived from card open date, deadline, and current spend vs target.

**Removed from UI:** Section removed from Card details (tracked view); captured here for potential future implementation.

---

### Insight & recommendations

**Context:** On the Card details page (tracked view), a panel that surfaces tips and suggestions to optimize bonus progress and card usage.

**Idea:**
- Panel titled "Insight & recommendations" (or "Insights") with a short list of items, each with:
  - One-line insight or recommendation (e.g. "You're on pace to meet the spend target by [date].", "Shift dining spend to this card to earn 3x.")
  - Optional: severity or type (tip, warning, opportunity).
- Content can be static at first, then derived from: spend pace vs deadline, category mix, comparison to target, and card-specific earning rules.
- Keeps the page actionable without overwhelming the user.

---

### Weekly progress

**Context:** On the Card details page (tracked view), a view of week-over-week spending or progress toward the bonus.

**Idea:**
- Panel or subsection titled "Weekly progress" showing:
  - Spend (or progress) per week (e.g. bar chart or list: Week of Jan 13: $X, Week of Jan 20: $Y).
  - Optional: comparison to a target weekly pace (e.g. "You need ~$Z/week to hit the bonus by the deadline.").
- Complements the Spending Timeline (cumulative) by making weekly effort visible.
- Data can be aggregated from the same source as the timeline; later, align with calendar weeks or statement periods.
