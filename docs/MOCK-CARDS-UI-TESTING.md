# Mock cards for UI integration testing

The backend seed creates a test user and two mock cards so you can exercise the full UI without real data.

## Setup

From the backend directory:

```bash
# Ensure DB exists and is migrated
npx prisma db push   # or: npx prisma migrate dev

# Run the seed
npx prisma db seed
```

## Test user

- **Email:** `ui-test@example.com`
- **Password:** `test-password-123`

Log in with this user to see the mock tracked card in “My cards” and to open the tracked card detail.

## Mock card

One mock card is seeded with the **same id** for both tracked and catalogue (`mock-ui-catalogue`), so the “Tracked card view” / “Catalogue preview” toggle works without errors.

| Where              | URL / usage |
|--------------------|-------------|
| My cards + detail  | **/cards/mock-ui-catalogue** (after logging in as the test user) |
| Catalogue list     | **/available-cards** (card appears in list) |
| Catalogue preview  | **/cards/mock-ui-catalogue?mode=catalogue** |

The mock card has bonus levels, progress (e.g. 55% progression, $3.3k spend toward $3k), and a deadline so that CardDetails “Tracked card view” and all tiles/charts render. You can switch between “Tracked card view” and “Catalogue preview” on the same page without getting a “card not found” error.

## Reseeding

Re-running `npx prisma db seed` is safe: it uses upserts, so the test user and mock cards are updated in place and not duplicated.
