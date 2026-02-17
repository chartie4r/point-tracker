# Roadmap migration artifacts

This folder contains generated drafts used to migrate roadmap docs into Linear and GitHub issues.

## Generate drafts

```bash
npm run roadmap:migration
```

(or `node scripts/generate-roadmap-ticket-drafts.mjs`)

Outputs:
- `roadmap-migration/linear-migration-drafts.md`
- `roadmap-migration/github-implementation-issue-drafts.md`

---

## Automated creation (recommended)

A helper script can create Linear and GitHub issues directly from the generated draft files.

### Script

- `scripts/automate-roadmap-creation.mjs`

### Dry run (safe preview)

```bash
npm run roadmap:create:dry
```

Equivalent:

```bash
node scripts/automate-roadmap-creation.mjs --all
```

### Apply (actually creates issues)

```bash
npm run roadmap:create
```

Equivalent:

```bash
node scripts/automate-roadmap-creation.mjs --all --apply
```

### Required environment variables

#### For Linear (`--linear` or `--all --apply`)

- `LINEAR_API_KEY` – Linear API key.
- `LINEAR_TEAM_ID` – target Linear team id.

Optional:
- `LINEAR_LABEL_IDS` – comma-separated label ids (for example, your `Migrated` label id).

#### For GitHub (`--github` or `--all --apply`)

- `GITHUB_TOKEN` – GitHub token with `repo` issue permissions.
- `GITHUB_REPO` – `owner/repo` (for example `chartie4r/point-tracker`).

Optional:
- `GITHUB_LABELS` – comma-separated labels to apply.

### Output report

Every run writes:

- `roadmap-migration/creation-report.json`

This report includes created issue identifiers/URLs (or dry-run entries).

---

## How to copy manually into Linear (fallback workflow)

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

### 4) Cross-linking checklist in Linear
For each created issue, ensure:
- Link to source markdown doc in this repo.
- Link to related GitHub implementation issue (after GH issue is created).
- Link to parent epic.

---

## How to copy manually into GitHub (fallback workflow)

Use `roadmap-migration/github-implementation-issue-drafts.md`.

1. Open repository issues: `https://github.com/<org-or-user>/point-tracker/issues`.
2. Click **New issue**.
3. For each `## <doc title>` block in the draft file:
   - Use `Suggested issue title` as the issue title.
   - Copy `Summary/context` + checklist into the issue body.
   - Keep `Linked Linear epic/issue` and `Source doc` links in the body.
4. Create the issue, then copy the created GitHub issue URL.
5. Paste that GitHub URL back into the corresponding Linear issue.

---

## Recommended migration order

1. Linear epics (`E0–E15`, `T1–T7`)
2. Linear child issues (`1–28`, `T1–T7` execution issues)
3. GitHub implementation issues (`docs/*.md`)
4. Cross-link validation (Linear ↔ GitHub ↔ source docs)

---

## Done criteria (quick audit)

- Every roadmap doc in `docs-ideas/`, `docs-tech-ideas/`, and key docs in `docs/` has at least one Linear issue.
- Every key implementation doc in `docs/` has a GitHub implementation issue.
- Every migrated ticket includes source-doc links and cross-links between Linear and GitHub.
