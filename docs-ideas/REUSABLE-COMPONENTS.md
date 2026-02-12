# Reusable components (Epic 0)

This document maps **backlog features** to **reusable UI components** so Epic 0 can refactor the frontend once and later epics can compose these building blocks. It is derived from the feature docs (01–28) and [BACKLOG-BY-EPIC.md](BACKLOG-BY-EPIC.md).

---

## Component map (backlog → components)

| Component | Purpose | Used in (epic / idea) |
|-----------|---------|------------------------|
| **MetricTile** | At-a-glance summary: value, label, optional icon, optional trend badge, link to detail page. | E7 (21: Total Points, Active Cards, Bonus Progress); E12 (24: travel goal tile). |
| **ContentCard** | Clickable or static card: title, optional subtitle/logo/bank badge, body slot, optional footer/CTA. | E7 (22: one card per program; 23: one card per active bonus); E5 (7: comparison cards); E5 (9: wishlist item); E12 (24: goal card); E6 (11: badge card). |
| **Panel** | Section container: title, optional action button, slot for list or grid of children. | E1 (1: notification dropdown/panel); E7 (Points Balance panel, Active Bonus Trackers section); E12 (Travel Goals list). |
| **ProgressBar** | Min/max progress with optional label, percentage, and variant (e.g. warning when &lt; 25% time left). | E7 (23: min spend progress); E12 (24: goal progress). |
| **Badge** | Small pill: trend (+12%), count, status, or “days left”. Variants: neutral, success, warning. | E7 (21: trend on tiles; 22: change vs last period); E7 (23: days left); E6 (11: badge icon/label). |
| **Button** | Primary, secondary, outline; consistent sizing and focus. | All epics (CTAs, “Add Bonus”, “Share”, “Mark all read”, form submit). |
| **Form controls** | **Select**, **Input**, **Label**: consistent border, focus ring, error state. | E3 (export format, import); E4 (5–6: simulator/calculator inputs); E5 (card select); CardList (filters). |
| **EmptyState** | Icon + message + optional CTA when a list or panel has no items. | E1 (no notifications); E5 (9: empty wishlist); E7 (no active bonuses, no programs). |
| **List / Row** | Repeatable row with optional leading icon/logo, main text, trailing badge or action. | E1 (notification list); E7 (bonus rows); E14 (ledger rows). |
| **PageHeader** | Page title + optional actions (filters, “Add” button). Consistent spacing. | CardList, E3 (Export/Import), E5 (Compare), E7 (dashboard), E12 (Travel Goals). |

Existing components to keep and reuse: **BankLogo**, **CardNetworkLogo** (used in cards, lists, comparison).

---

## How Epic 0 uses this

1. **Refactor only** — no new product features; no backend changes (unless a tiny API consistency fix).
2. **Introduce** the components above (or a minimal set that covers the most epics: MetricTile, ContentCard, Panel, ProgressBar, Badge, Button, Form controls, EmptyState).
3. **Apply** them where it’s low-risk: e.g. Home tiles → ContentCard or MetricTile; CardList filters → Form Select; one view’s “empty” state → EmptyState.
4. **Document** in this file or in code (e.g. `components/README.md`) which component to use for which pattern, so E1–E15 can use the same primitives.

**Implementation details and examples:** see [frontend/src/components/README.md](../frontend/src/components/README.md) in the repo.

---

## Out of scope for Epic 0

- New features or new pages from the idea docs.
- Full design system (tokens, dark mode) unless trivial.
- Backend or API changes.
- Replacing every inline style in one go — prefer incremental refactor and clear contracts for new work.
