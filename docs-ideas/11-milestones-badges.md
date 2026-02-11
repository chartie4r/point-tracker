# Idea 9: Milestones & badges (gamification)

**Goal:** Light gamification: celebrate "First card added", "Met min spend on 3 cards", "5 cards in pipeline", etc., with badges and optional shareable card (image or link).

**What we build**
- Define milestones: e.g. first_card, five_cards, min_spend_met_3, pipeline_complete_1, etc.
- Backend: compute which milestones user has achieved (from cards, snapshots, pipeline state).
- UI: "Achievements" or "Badges" page; badge icons; optional "Share this badge" (image or social link).
- Optional: badge appears on profile or dashboard.

**Data**
- New: `Milestone` (id, key, name, description, iconOrImage). `UserMilestone` (userId, milestoneId, achievedAt). Or compute on the fly from cards/snapshots.

**Phases**
1. Define 5–10 milestones and logic (e.g. "min_spend_met" = card with welcomeBonusCompletedAt set). Backend: endpoint "my milestones".
2. Badges UI: grid of earned/locked badges.
3. Optional: share image (canvas or server-rendered) or share URL.

**Dependencies:** Pipeline (welcomeBonusCompletedAt) for some milestones; optional image generation.
