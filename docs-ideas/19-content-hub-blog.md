# Idea 18: Content hub / blog (guides, SEO)

**Goal:** Publish guides and articles (e.g. "How to hit min spend", "Aeroplan sweet spots", "Best no-fee cards") to attract organic traffic, build authority, and optionally monetize via affiliate or sponsors.

**What we build**
- Content section: /blog or /guides. List of articles (title, excerpt, slug, publishedAt). Article page: markdown or rich text, SEO meta.
- CMS: simple admin (superadmin) to create/edit articles, or use headless CMS (e.g. Sanity, Strapi) or static markdown in repo.
- Optional: affiliate links in articles (e.g. "Apply for this card" → our affiliate link); disclose in footer. Optional: "Related cards" from catalogue in article.

**Data**
- Option A: `Article` (id, slug, title, body, publishedAt, createdAt). Option B: external CMS. Option C: markdown files in repo, rendered at build or via simple API.

**Phases**
1. Articles list page + single article page (route /blog/:slug). Content from DB or markdown.
2. Admin UI for create/edit (if DB) or doc for adding markdown files. SEO: meta title/description per article.
3. Optional: affiliate link helper; "Related cards" by tagging articles with card slugs.

**Dependencies:** Content strategy; optional CMS. Affiliate programs if we monetize links.
