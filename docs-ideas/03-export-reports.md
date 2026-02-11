# Idea 7: Export & reports (PDF / CSV)

**Goal:** Let users export their data (cards, snapshots, timeline) as CSV or PDF for their records, taxes, or sharing with an advisor.

**What we build**
- "Export" from My cards or Dashboard: choose format (CSV, PDF).
- CSV: cards with key fields; snapshots with dates and points/expenses. One file or two (cards, snapshots).
- PDF: simple report (e.g. "Point Tracker – Summary – [date]") with table of cards and optional snapshot summary.

**Data**
- Read-only over existing Card, WeeklySnapshot, User. No new tables. Generate file on demand.

**Phases**
1. CSV export: cards list + snapshots (filter by date range optional). API endpoint that returns file or triggers download.
2. PDF export: use a lib (e.g. jsPDF, or backend Puppeteer/PDF) to generate one-page summary.
3. Optional: scheduled "monthly report" email with PDF attached (premium?).

**Dependencies:** None for CSV; PDF lib for PDF.
