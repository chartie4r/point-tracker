# Tech Idea 1: Core platform readiness (prod baseline)

**Goal:** Define and implement the minimum technical baseline for running PointTracker in production reliably: configuration, environments, security basics, and stable build/deploy.

**What we build**
- **Environment separation:** Clear dev / staging / prod environments with separate databases and API endpoints.
- **Config management:** Use environment variables (and `.env.example`) for secrets and environment-specific config; no secrets in git.
- **Build pipeline:** Repeatable build commands for backend and frontend (CI-friendly), with versioning and tagged releases.
- **Basic security hardening:** HTTPS-only in production, secure cookies, minimum password/credential rules, dependency scanning.

**Data / infra**
- Uses existing backend and frontend projects; no new DB tables.
- Needs production database (Postgres) and production file/email providers configured.

**Phases**
1. **Environments & config**
   - Define `.env` variables for backend/frontend prod.
   - Document how to run dev vs prod; ensure no secret defaults in code.
2. **Deploy scripts**
   - Standardize `npm run build` / `npm run start` for backend and frontend.
   - Tie into chosen deployment targets (e.g. Vercel for frontend, Fly.io/Render for backend).
3. **Security baseline**
   - Enforce HTTPS in reverse proxy or platform config.
   - Set secure cookie flags, basic rate limits for auth endpoints, and dependency updates policy.

**Dependencies:** Database migration strategy, deployment choices (see other tech ideas).

