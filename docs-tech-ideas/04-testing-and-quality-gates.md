# Tech Idea 5: Testing and quality gates

**Goal:** Prevent regressions and ship confidently by introducing automated tests and basic quality gates before deploying to production.

**What we build**
- **Backend tests**:
  - Unit tests for key services (card calculations, snapshots, bonus logic).
  - API tests for critical routes (auth, cards, snapshots).
- **Frontend tests**:
  - Component tests for core views (Login, Dashboard, Card list).
  - Basic end-to-end flow (login → add card → snapshot).
- **CI pipeline**:
  - Run tests and linters on every pull request / main branch push.

**Data / infra**
- Uses existing code and test frameworks (Vitest already present for backend).
- CI provider (e.g. GitHub Actions) configured with node versions and secrets.

**Phases**
1. **Test baseline**
   - Add a small but meaningful set of tests around the most important business flows.
2. **CI setup**
   - Create CI config to run tests + lint on each push/PR.
3. **Quality gates**
   - Optionally require tests to pass before merging to main.
   - Track code coverage over time (informational at first).

**Dependencies:** Stable build commands for backend/frontend.

