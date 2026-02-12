# Reusable components

Shared UI building blocks for PointTracker. For the **backlog → component map** (which epic uses which component), see [docs-ideas/REUSABLE-COMPONENTS.md](../../docs-ideas/REUSABLE-COMPONENTS.md).

## Overview

| Component | Purpose | Typical use |
|-----------|---------|-------------|
| **AppButton** | Primary, secondary, outline, or danger button; link when `to` is set. | CTAs, form submit, "Add", "Share", "Mark all read". |
| **Badge** | Small pill for trend, count, status. Variants: neutral, success, warning, info. | E7 tiles trend; E7 days left; E6 milestones. |
| **AppLabel** | Form label; use with `for` (id of control). | AppInput, AppSelect. |
| **AppInput** | Text/number/date input with optional label (default slot), error state. | Forms (E3, E4, E5, CardForm, CardSnapshots). |
| **AppSelect** | Select with optional label slot, `options` array or default slot for `<option>`. | Filters (CardList, AvailableCardsList), form fields. |
| **MetricTile** | At-a-glance KPI: label, value, optional trend badge, optional link. | E7 dashboard tiles; E12 travel goal tile. |
| **ContentCard** | Card with optional header/footer slots; optional `to` (link); optional `tint` (violet, emerald, amber, sky). | E7 points-by-program, active bonus cards; E5 comparison, wishlist; Home tiles. |
| **Panel** | Section with title, optional action button, default slot for content. | E1 notification panel; E7 Points Balance, Active Bonuses; CardSnapshots History. |
| **ProgressBar** | Progress bar with value/max, optional label, %; variants default, warning, success. | E7 min-spend progress; E12 goal progress. |
| **EmptyState** | Centered icon (slot), title, message, optional CTA (actionLabel + actionTo or @action). | E1 no notifications; E5 empty wishlist; E7 empty bonuses; CardList/CardSnapshots empty. |
| **PageHeader** | Row: default slot (title), `actions` slot (filters/buttons). | CardList, E3, E5, E7, E12. |
| **ListRow** | Row with optional `leading`, default (main), `trailing` slots; optional `to` (clickable). | E1 notification list; E7 bonus rows; E14 ledger. |
| **BankLogo** | Bank logo or initials. | Cards, lists, comparison. |
| **CardNetworkLogo** | Card network (Visa, MC, Amex) logo. | Cards, catalogue. |

## Usage examples

### AppButton

```vue
<AppButton variant="primary" size="md">Save</AppButton>
<AppButton to="/cards" variant="secondary">My cards</AppButton>
<AppButton variant="danger" @click="confirmDelete">Delete</AppButton>
```

### AppInput

```vue
<AppInput v-model="email" type="email" required>Email</AppInput>
<AppInput v-model="amount" type="number" min="0" :error="errors.amount">Amount</AppInput>
```

### AppSelect

```vue
<AppSelect v-model="status" :options="statusOptions" placeholder="All statuses" />
```

### ContentCard

```vue
<ContentCard padding="md" :to="`/cards/${card.id}`">
  <template #header><h3>{{ card.name }}</h3></template>
  <p>{{ card.description }}</p>
  <template #footer><AppButton size="sm">View</AppButton></template>
</ContentCard>
```

### Panel

```vue
<Panel title="History" action-label="Add" @action="openAdd">
  <table>...</table>
</Panel>
```

### EmptyState

```vue
<EmptyState
  title="No cards yet"
  message="Add your first card from the catalogue."
  action-label="Add a card"
  action-to="/available-cards"
/>
```

### PageHeader

```vue
<PageHeader>
  <h1>My cards</h1>
  <template #actions>
    <AppSelect v-model="filter" :options="opts" />
    <AppButton to="/cards/new">Add card</AppButton>
  </template>
</PageHeader>
```

### MetricTile

```vue
<MetricTile label="Total points" :value="totalPoints" trend="+12%" to="/points" />
```

### ProgressBar

```vue
<ProgressBar :value="spent" :max="minSpend" label="$3,245 / $4,000" :variant="percent < 25 ? 'warning' : 'default'" />
```

All components use the Tailwind theme from `tailwind.config.js` (primary, surface, borders, shadows). No new CSS variables; styling is via Tailwind classes.
