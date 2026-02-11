# Idea 16: API for power users (read-only)

**Goal:** Offer a read-only API (API key per user) so power users can pull their cards and snapshots into their own spreadsheets, dashboards, or scripts — differentiation and potential premium tier.

**What we build**
- User can generate an "API key" in profile (one or more; can revoke). Key is used in header or query for auth.
- Endpoints: e.g. GET /api/v1/me/cards, GET /api/v1/me/cards/:id/snapshots, GET /api/v1/catalogue (public or key). Read-only; rate limit (e.g. 100 req/hour per key).
- Docs: simple page or OpenAPI spec for developers.

**Data**
- New: `ApiKey` (id, userId, keyHash, name, lastUsedAt, createdAt). Store hashed key; rate limit in Redis or in-memory per key.

**Phases**
1. ApiKey model + generate/revoke in profile. Middleware: auth by API key (instead of session) for selected routes.
2. Endpoints: me/cards, me/cards/:id/snapshots; return JSON. Rate limit.
3. Public docs (markdown or OpenAPI); optional "API usage" in dashboard.

**Dependencies:** Rate limiting; docs. Good candidate for paid tier (e.g. API access only on Pro).
