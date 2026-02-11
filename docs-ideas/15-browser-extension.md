# Idea 12: Browser extension (quick-add from Milesopedia / bank)

**Goal:** When user is on a Milesopedia card page (or partner site), one click to "Add to PointTracker" — pre-fill from page or open app with context, so adding cards is frictionless.

**What we build**
- Browser extension (Chrome, optionally Firefox): icon in toolbar; on Milesopedia card URL, show "Add to PointTracker" or "Save to catalogue wishlist".
- Action: open PointTracker in new tab with deep link (e.g. /available-cards?add=slug) or send URL to backend; backend scrapes or looks up by slug and returns prefill; app opens CardNew with prefill.
- Optional: on other sites (e.g. bank offer page), "Save offer" with URL + note.

**Data**
- No new backend tables for MVP; deep link + existing prefill from catalogue. Optional: "Saved from extension" (URL, date) for analytics.

**Phases**
1. Deep link: app accepts query param (e.g. milesopediaSlug) and pre-fills form from catalogue.
2. Extension: minimal popup or content script on known URLs; button opens app with deep link.
3. Publish to Chrome Web Store; optional Firefox.

**Dependencies:** App supports prefill (already does); extension build pipeline.
