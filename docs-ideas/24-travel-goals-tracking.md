# Idea 23: Travel goals tracking (Tokyo-style goal card and page)

**Goal:** Let users define **travel goals** (e.g. “Tokyo in 12 months”) and see their progress in points toward those goals, both as a **dashboard tile** and on a dedicated **Travel Goals** page.

**What we build**
- **Travel Goal entity**:
  - Destination name (e.g. Tokyo), optional description.
  - Target date or time window.
  - Required points (one or more programs or a blended estimate).
  - Which user/program balances should count toward this goal.
- Dashboard tile:
  - Shows primary goal name, progress percent, and “points needed” remaining.
  - Click goes to full Travel Goals view.
- **Travel Goals page** (nav item):
  - List of goals with progress bars.
  - For a selected goal: breakdown of which programs/cards contribute, and suggestions from AI Bonus Plan / Card Pipeline (e.g. which bonuses to chase next).

**Data**
- New: `TravelGoal` table:
  - `id`, `userId`, `name`, `description`, `targetDate`, `requiredPoints`, `createdAt`, `updatedAt`.
  - Optional: `primaryProgramId` or a more flexible mapping table `TravelGoalProgram` to support multiple programs and weights.
- Computed:
  - Current total points toward the goal from Points Balance by Program.
  - Progress percent and remaining points.

**Phases**
1. **MVP travel goal**:
   - User can create one goal with name, required points, target date, and which program to use.
   - Dashboard shows that goal’s progress as a tile.
2. **Travel Goals page**:
   - List of multiple goals; edit/delete; show per-goal progress breakdown.
   - Simple integration with existing points balances.
3. **AI integration (optional)**:
   - AI Bonus Plan suggests how many cards/bonuses and which programs to target to reach each goal.
   - “Can I make this trip by [date]?” helper that reads goal + budget and updates plan.

**Dependencies:** Points Balance by Program; AI Bonus Plan and/or Card Pipeline for recommendations; design for Travel Goals page and tile.

