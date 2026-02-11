# Idea 17: CSV import (cards or snapshots)

**Goal:** Let users bulk-import cards or snapshot history from a CSV (e.g. export from another tool or their own spreadsheet) so they don’t have to type everything.

**What we build**
- "Import" in My cards or Snapshots: upload CSV. We validate columns (e.g. cardName, bank, type, openDate…) and show preview (first 5 rows, mapping). User confirms → we create cards or snapshots.
- Template: "Download template CSV" so users know the format. Optional: support multiple formats (e.g. "Milesopedia export" if they have one).
- Errors: report which rows failed (e.g. duplicate, invalid date); successful rows are created.

**Data**
- No new tables. We create Card or WeeklySnapshot from CSV rows. Optional: store import log (userId, filename, rowsSuccess, rowsFailed, createdAt) for support.

**Phases**
1. Backend: endpoint POST /api/cards/import (and optionally /snapshots/import); parse CSV; validate; bulk create. Return summary (created, errors).
2. Frontend: upload component; column mapping if we allow flexible columns; preview; submit.
3. Template download; improve error messages per row.

**Dependencies:** None; CSV parsing lib (e.g. papaparse frontend or backend).
