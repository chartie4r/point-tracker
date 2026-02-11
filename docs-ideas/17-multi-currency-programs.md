# Idea 15: Multi-currency / multi-program expansion

**Goal:** Support cards or programs beyond current Canadian focus — e.g. USD cards, US cards (Chase, Amex US), or other programs — so the app serves expats, cross-border, or future markets.

**What we build**
- Data: add currency (CAD, USD) to Card and/or ScrapedCard; optional region (Canada, US). Catalogue can filter by region.
- UI: optional "Region" or "Currency" in profile; filters in catalogue and cards list. Display amounts with currency symbol.
- Optional: separate catalogue source or scraper for US cards (different data source than Milesopedia).

**Data**
- Card / ScrapedCard: currency (default CAD), optional region. Existing amounts stay as numbers; we interpret by currency. Optional: conversion rate for "show all in CAD" (we’d need a rate source).

**Phases**
1. Add currency (and optional region) to schema; migration. Backend: return currency; frontend: show $ vs US$ etc.
2. Filters: "Show only CAD" / "Show only USD" or "All". Profile: "My primary currency".
3. Optional: second catalogue or scraper for US; or partner data feed.

**Dependencies:** Data source for non-CA cards if we expand catalogue; optional FX for conversion.
