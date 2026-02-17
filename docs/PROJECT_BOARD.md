# Point Tracker — Project Board

Last updated: 2026-02-17 (UTC)

## Workflow

- **Backlog** → Not started
- **Ready** → Clear scope, can be picked up
- **In Progress** → Active development on a branch
- **In Review** → PR open, awaiting review
- **Done** → Merged to `master`

Branch naming convention:
- `feat/<short-description>`
- `fix/<short-description>`
- `chore/<short-description>`

PR title convention:
- `[feat] ...`
- `[fix] ...`
- `[chore] ...`

---

## Backlog

- [ ] **SEC-001** Patch dependency vulnerabilities (frontend axios high severity)
- [ ] **SEC-002** Remove reset URL/token exposure from `POST /api/auth/forgot-password`
- [ ] **SEC-003** Enforce strict session secret policy in production
- [ ] **QA-001** Fix frontend failing tests (`AppSelect.spec.js`, `logos.test.js`)
- [ ] **DX-001** Add CI pipeline (backend tests, frontend tests, frontend build)
- [ ] **DX-002** Add lint/format setup and scripts
- [ ] **OPS-001** Add scraper refresh status endpoint + last run metadata

## Ready

- [ ] **AUD-001** Turn initial audit findings into GitHub issues

## In Progress

- [ ] **OPS-000** Project board setup
  - Branch: `chore/project-board-setup`
  - PR: _TBD_
  - Owner: assistant

## In Review

- _(none)_

## Done

- _(none)_

---

## Current Sprint Proposal (v0)

### Sprint Goal
Stabilize security + delivery quality so feature work can move fast safely.

### Sprint Items
- SEC-001
- SEC-002
- SEC-003
- QA-001
- DX-001

### Definition of Done
- PR merged
- Tests pass in CI
- No high severity vulnerabilities in default install
- Board updated with PR links and merge commit

---

## How to use this board

1. Create/update an issue for each task ID.
2. Move task from **Backlog** → **Ready** when scope is clear.
3. On start, move to **In Progress** and add branch name.
4. When PR opens, move to **In Review** and paste PR URL.
5. After merge, move to **Done** with merge date.

---

## Optional GitHub Project fields (if enabled later)

- Status: Backlog / Ready / In Progress / In Review / Done
- Priority: P0 / P1 / P2
- Area: Backend / Frontend / Infra / Security
- PR: URL
- Owner: person
- Target release: `v0.x`
