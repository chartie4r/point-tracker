# Roadmap migration artifacts

This folder contains generated drafts used to migrate roadmap docs into Linear issues.

## Generate drafts

```bash
npm run roadmap:migration
```

(or `node scripts/generate-roadmap-ticket-drafts.mjs`)

Output:
- `roadmap-migration/linear-migration-drafts.md`

---

## Automated creation (Linear only)

A helper script creates **Linear issues only** from `roadmap-migration/linear-migration-drafts.md`.

### Script

- `scripts/automate-roadmap-creation.mjs`

### Dry run (safe preview)

```bash
npm run roadmap:create:dry
```

Equivalent:

```bash
node scripts/automate-roadmap-creation.mjs --linear
```

### Apply (actually creates Linear issues)

```bash
npm run roadmap:create
```

Equivalent:

```bash
node scripts/automate-roadmap-creation.mjs --linear --apply
```

### Required environment variables

- `LINEAR_API_KEY` – Linear API key.
- `LINEAR_TEAM_ID` – target Linear team id.

Optional:
- `LINEAR_LABEL_IDS` – comma-separated label ids (for example, your `Migrated` label id).

The script loads env vars from `.env` and `.env.local` automatically.

Supported aliases:
- API key: `LINEAR_API_KEY` or `LINEAR_KEY`
- Team id: `LINEAR_TEAM_ID` or `LINEAR_TEAM` or `TEAM_ID`

Example `.env`:

```bash
LINEAR_API_KEY=lin_api_xxx
LINEAR_TEAM_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
LINEAR_LABEL_IDS=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

If you still see `LINEAR_TEAM_ID is required for --apply`, verify there is no typo, no surrounding spaces in key names, and that the script is run from repository root.

### Output report

Every run writes:

- `roadmap-migration/creation-report.json`

This report includes created Linear identifiers/URLs (or dry-run entries).

---

## Manual fallback workflow (Linear)

Use `roadmap-migration/linear-migration-drafts.md`.

### 1) Create epics first (E0–E15 and T1–T7)
1. Open Linear for team **PointsRocket**.
2. Go to your project/roadmap and click **New issue** (or **New epic**, depending on workspace setup).
3. For each `### E*` / `### T*` block in the draft file:
   - Copy the heading as the issue title.
   - Copy bullets (`Scope`, `Features`, `Source`) into the description.
   - Apply label: `Migrated`.
4. Keep each created issue URL handy (temporary notes doc/spreadsheet) so you can link child tickets.

### 2) Create feature issues (1–28)
1. In the same draft file, go to `## Feature issues (1–28)`.
2. For each `### Idea N` block:
   - Create one Linear issue.
   - Title: `Idea N: <name>` (or your preferred concise title).
   - Description: copy `Summary`, `Rationale / value`, `Acceptance criteria / deliverables`, `Source doc`, `Clarification follow-ups`.
   - Set parent/relationship to the matching epic from `Parent epic`.
3. Add unresolved clarification items as subtasks/comments and include the questionnaire link from the block.

### 3) Create tech issues (T1–T7)
1. In the same file, go to `## Tech epics/issues (T1–T6 + T7 engine)`.
2. For each `### T*` block:
   - Create one Linear issue under the corresponding tech epic.
   - Copy `Goals & phases summary`, `Timing`, `Feature dependencies`, checklist, and source links.
   - Add open clarification questions as subtasks/comments.

---

## Recommended migration order

1. Linear epics (`E0–E15`, `T1–T7`)
2. Linear child issues (`1–28`, `T1–T7` execution issues)
3. Cross-link validation to source docs

---

## Done criteria (quick audit)

- Every roadmap doc in `docs-ideas/`, `docs-tech-ideas/`, and key docs in `docs/` has at least one Linear issue.
- Every migrated ticket includes source-doc links.
