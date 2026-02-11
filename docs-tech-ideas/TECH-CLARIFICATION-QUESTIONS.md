# PointsRocket – Technical Clarification Questions

This questionnaire is the **technical** counterpart to `docs-ideas/IDEA-CLARIFICATION-QUESTIONS.md`.

Use it to clarify and de‑risk each tech idea before implementation.  
Work through it alongside:
- `docs-tech-ideas/*.md` (T‑docs below),
- `docs-ideas/IMPLEMENTATION-ORDER.md`,
- `docs-tech-ideas/IMPLEMENTATION-ORDER.md`.

You can either:
- Answer directly in each tech idea file, or
- Copy these questions into a planning doc / Notion and then update the tech docs with your decisions.

---

## T1. Core platform readiness (`01-core-platform-readiness.md`)

1. **Environments & branching**
   - Which environments do we have (local, dev, staging, prod)?  
   - Which git branches map to which environment (e.g. `main` → prod, `develop` → staging)?  
   - How are migrations and seed data handled per environment?

2. **Configuration & secrets**
   - Which config values must be environment‑specific (DB URLs, API keys, email provider, etc.)?  
   - Do we standardize on `.env` + a typed config module, or something else?  
   - Where do secrets live (CI secret store, cloud secret manager), and how are they rotated?

3. **Build & deploy pipeline**
   - What is the canonical deploy path for backend and frontend (Vercel, Render, Fly, Docker images, …)?  
   - Do we need zero‑downtime deploys, or is brief downtime acceptable in early stages?  
   - How do we keep DB schema in sync with deployed backend versions (migrations as part of deploy)?

4. **Health checks & readiness**
   - What HTTP endpoint(s) expose health/readiness (DB, external dependencies)?  
   - How do we verify that background workers (if any) are healthy?  
   - What is the minimal set of checks required before routing traffic to a new release?

5. **Security baseline**
   - Are HTTPS and HSTS enforced at the edge for all environments?  
   - Do we have a minimal CORS policy defined that matches the frontend deployment domains?  
   - How do we manage admin/superadmin accounts and protect superadmin‑only routes?

6. **Data residency & backups (interaction with T3/T2)**
   - In which region(s) is data stored, and do we need to document that for users?  
   - What is the minimal backup/restore story required before calling prod “live”?

---

## T2. Data integrity, migrations, backups (`02-data-integrity-backups-migrations.md`)

1. **Migration workflow**
   - How are Prisma migrations created, reviewed, and applied (local vs CI vs deploy step)?  
   - Do we allow destructive schema changes (drops) in prod, and under what safeguards?  
   - How do we roll back a bad migration?

2. **Backups**
   - What is the backup frequency and retention for the main DB (daily, hourly)?  
   - Where are backups stored and how are they encrypted?  
   - Have we tested a full restore into a non‑prod environment recently?

3. **Data integrity checks**
   - Do we need periodic integrity checks (e.g. orphans, invalid foreign keys, inconsistent aggregates)?  
   - Should we enforce more constraints at DB level (unique indexes, foreign keys with `ON DELETE` rules) vs code level?  
   - How do we detect and correct bad data (scripts, admin tools, migration fixes)?

4. **Schema evolution strategy**
   - How do we handle long‑running transitions (e.g. adding new columns while still reading old ones)?  
   - Do we have a convention for deprecating fields (e.g. `deprecated_*`), and over what timeline?  

5. **Multi‑tenant & user isolation**
   - If we ever support multiple “workspaces” or households, do we need tenant IDs in key tables?  
   - Are there any records that must never be shared across users/tenants (beyond obvious PII)?

6. **Local/dev data**
   - Do we maintain seed data sets (demo users/cards) separately from migrations?  
   - How do we prevent local/staging data from leaking into analytics/production pipelines?

---

## T3. Auth, security, privacy (`03-auth-security-privacy.md`)

1. **Auth model**
   - What is the canonical login mechanism (email/password only, social providers later, magic links)?  
   - How do we store password hashes (algorithm, parameters, re‑hash policy)?  
   - Do we need refresh tokens or long‑lived sessions, and how are they secured?

2. **Session management**
   - Are we using signed cookies, JWTs in headers, or both?  
   - How do we handle session revocation (logout‑all‑devices, password change)?  
   - What is the session timeout policy (idle vs absolute expiry)?

3. **Authorization**
   - What roles exist today (user, superadmin, maybe future roles)?  
   - Is authorization enforced centrally (middleware) or scattered throughout routes?  
   - Do we need per‑resource access checks (e.g. card belongs to user) standardized in a helper?

4. **Account lifecycle & privacy**
   - How do we implement account deletion (soft delete vs hard delete, data anonymization)?  
   - Which data must be deleted vs retained for legal/analytics reasons?  
   - Do we need export‑my‑data endpoints beyond CSV exports?

5. **Input validation & protections**
   - Which layers do validation (frontend, backend schema validation, DB constraints)?  
   - How do we guard against typical web risks (XSS, CSRF, brute force, rate limits)?  
   - Do we need per‑IP or per‑account rate limits for sensitive routes (login, password reset, API)?

6. **Secrets & third‑party integrations**
   - Are third‑party keys scoped appropriately (email provider, AI APIs, scraping tools)?  
   - How do we avoid leaking secrets in logs or error messages?

7. **Compliance posture**
   - Do we need to aim toward any specific compliance (GDPR‑style rights, data processing agreements), at least informally?  
   - What do we need to document publicly (privacy policy, security overview)?

---

## T4. Testing & quality gates (`04-testing-and-quality-gates.md`)

1. **Test pyramid**
   - What levels of tests do we commit to in the near term: unit, integration (API), end‑to‑end (browser), snapshots/visual?  
   - For each layer, where do tests live (folders, naming conventions)?

2. **Coverage expectations**
   - Do we enforce a minimum coverage threshold (global vs critical modules only)?  
   - How do we handle tests for experimental features vs core infrastructure?

3. **CI pipeline**
   - Which checks must pass before merge to `main` / deploy (lint, tests, type check, build)?  
   - How long can the pipeline take before it becomes frustrating (target runtime)?  
   - Do we need different pipelines for PRs vs mainline builds?

4. **Test data & fixtures**
   - How do we seed test databases (shared fixtures vs per‑test factories)?  
   - How do we ensure fixtures stay in sync with Prisma schema and docs‑ideas (e.g. card statuses, programs)?  
   - Do we want a centralized fixture module (like `test/cardFixtures.js`) for reuse?

5. **End‑to‑end testing strategy**
   - Which user journeys must be covered in E2E tests (sign‑up, add card, snapshot, expiry alert, etc.)?  
   - What tools do we prefer (Playwright, Cypress, etc.) and how do they run in CI?  
   - How do we manage test accounts and data isolation in E2E?

6. **Quality gates for risky changes**
   - Which areas require stricter gating (auth, migrations, payment/monetization, partner offers)?  
   - Do we require extra approvals or manual verifications for certain change types (schema changes, auth changes)?

---

## T5. Observability, logging, monitoring (`05-observability-logging-monitoring.md`)

1. **Logging**
   - What is our logging stack (console + structured JSON, third‑party log service)?  
   - Which context should be present on most logs (request ID, user ID, environment, version)?  
   - Do we have a convention for log levels (info/warn/error) and what they mean?

2. **Error tracking**
   - Do we integrate with a hosted error tracker (Sentry, etc.)?  
   - How do we group and prioritize recurring errors vs one‑offs?  
   - How do we link errors back to specific deploys/commits?

3. **Metrics**
   - Which core metrics matter initially (request rate, error rate, latency, DB query durations)?  
   - How do we collect them (Prometheus, provider‑native metrics, custom)?  
   - Do we need application‑level metrics like “cards created per day”, “expiry alerts sent”, etc.?

4. **Health checks & dashboards**
   - What dashboards do we need in v1 (infra health, app errors, business KPIs)?  
   - Who is responsible for watching them and how often?

5. **Alerting**
   - What are the initial alert rules (e.g. error rate spike, repeated failed jobs, DB CPU/connection saturation)?  
   - Which channels do alerts go to (email, Slack, SMS)?  
   - How do we avoid alert fatigue (thresholds, grouping, quiet hours)?

6. **Log privacy & PII**
   - What data must never be logged (passwords, tokens, full card numbers, etc.)?  
   - Do we need a redaction layer or safe logging helpers to enforce this?

---

## T6. Email & background jobs (`06-email-and-background-jobs.md`)

1. **Email provider & abstraction**
   - Which provider are we using in v1 (Resend, SendGrid, Postmark, etc.)?  
   - Do we wrap it in our own small email module to make provider swapping easier?

2. **Email types & templates**
   - Which types of emails exist (auth, expiry alerts, churn reminders, digests, partner campaigns)?  
   - How are templates stored (files in repo, provider‑hosted templates, code‑generated)?  
   - How do we localize emails and handle HTML vs plain text?

3. **Background job runner**
   - Are we using simple cron (e.g. `node-cron`, hosted schedulers) or a full job queue (BullMQ, etc.)?  
   - What is the minimum job scheduling resolution we need (daily, hourly, per‑minute)?  
   - How do we ensure jobs are idempotent and safe to retry?

4. **Job types & ownership**
   - Which jobs do we anticipate (expiry alert dispatcher, churn reminders, email digests, partner campaigns)?  
   - Where do we track job metadata (successful runs, failures, retries)?

5. **Error handling**
   - How do we deal with transient vs permanent email failures?  
   - Do we log and alert on repeated failures for certain job types?

6. **User preferences & compliance**
   - How are email preferences modeled (per type, global unsubscribe)?  
   - How do we ensure background jobs respect preferences at send time (not just when scheduled)?

---

## T7. Earn‑rate matrix & spend optimizer engine (`07-earn-rate-matrix-and-spend-optimizer.md`)

1. **Scope of the engine**
   - Will the engine support only simple “best card per category” optimization in v1, or also global constraints (min‑spend chasing, caps)?  
   - Do we want to design it so that future constraints are easy to plug in?

2. **Data sourcing**
   - Will earn rates be pulled from user cards only, or also from catalogue cards / reference profiles?  
   - How often do we recompute `centsPerDollar` (on read, on rate change, scheduled batch)?

3. **Architecture & performance**
   - Should the optimizer run entirely in memory on the backend per request, or can we compute some aggregates in SQL?  
   - What is the maximum number of cards × categories we expect and what latency is acceptable?

4. **Explainability**
   - What explanation do we need to return (e.g. “this card yields 2.1¢/1$, best in 'Groceries'”)?  
   - How do we trace recommendations back to underlying data (valuations, earn rates) for debugging?

5. **Testing**
   - What test cases are required to feel safe (simple matrices, ties, missing data, conflicting constraints)?  
   - Do we want snapshot tests for matrix outputs or pure numeric assertions only?

6. **Integration points**
   - Which frontend components will call the optimizer (dashboard, dedicated “Optimizer” page)?  
   - How do we version the optimizer API if formulas or valuation logic change?

7. **Failure modes**
   - What do we show the user when data is incomplete (no earn rates, missing valuations)?  
   - How do we detect that underlying assumptions are stale (e.g. last updated date) and surface that?

