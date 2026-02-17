# Project: Chore Board Setup

Status: In Progress  
Owner: Assistant  
Created: 2026-02-17

## Objective
Create a durable, low-overhead work-tracking system inside the repo so progress is visible without constant supervision.

## Scope
- Add a board file with clear workflow columns
- Define naming conventions for branches and PRs
- Seed initial work items from audit findings
- Define update rules for moving tasks across statuses

## Deliverables
- `docs/PROJECT_BOARD.md` (kanban-style board)
- This project brief for traceability

## Success Criteria
- Every active ticket has:
  - task ID
  - status
  - branch name (when active)
  - PR link (when opened)
- Zero direct commits to `master`

## Initial Task Inventory
- SEC-001: Patch dependency vulnerabilities
- SEC-002: Remove reset URL/token exposure
- SEC-003: Production session secret hardening
- QA-001: Fix failing frontend tests
- DX-001: Add CI workflow
- DX-002: Add lint/format scripts
- OPS-001: Add scraper refresh status visibility

## Risks
- Process drifts if board is not updated as part of PR workflow
- No CI may allow board state to diverge from actual code quality

## Notes
This project file exists to keep the board setup itself auditable as a discrete initiative.
