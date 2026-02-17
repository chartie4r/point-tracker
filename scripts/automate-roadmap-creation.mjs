import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = new Set(process.argv.slice(2));

const runLinear = args.has('--linear') || args.has('--all') || args.size === 0;
const apply = args.has('--apply');
const dryRun = !apply;

if (!runLinear) {
  console.error('Usage: node scripts/automate-roadmap-creation.mjs [--linear|--all] [--apply]');
  process.exit(1);
}

const linearFile = path.join(root, 'roadmap-migration/linear-migration-drafts.md');

const read = (file) => fs.readFileSync(file, 'utf8');

function section(content, startHeading, endHeading) {
  const start = content.indexOf(startHeading);
  if (start < 0) return '';
  const end = endHeading ? content.indexOf(endHeading, start) : -1;
  return content.slice(start, end > -1 ? end : content.length);
}

function parseLinearEpics(content) {
  const sec = section(content, '## Feature epics (E0–E15)', '## Feature issues (1–28)');
  return sec.split('\n### ').slice(1).map((block) => {
    const lines = block.trim().split('\n');
    const heading = lines[0].trim();
    return {
      code: heading.split(':')[0].trim(),
      title: heading,
      description: lines.slice(1).join('\n'),
    };
  });
}

function parseLinearIdeas(content) {
  const sec = section(content, '## Feature issues (1–28)', '## Tech epics/issues (T1–T6 + T7 engine)');
  return sec.split('\n### ').slice(1).map((block) => {
    const lines = block.trim().split('\n');
    const parentLine = lines.find((l) => l.startsWith('- Parent epic:')) || '';
    return {
      title: lines[0].trim(),
      parentCode: parentLine.replace('- Parent epic:', '').trim(),
      description: lines.slice(1).join('\n'),
    };
  });
}

function parseLinearTech(content) {
  const sec = section(content, '## Tech epics/issues (T1–T6 + T7 engine)', null);
  return sec.split('\n### ').slice(1).map((block) => {
    const lines = block.trim().split('\n');
    return {
      title: lines[0].trim(),
      description: lines.slice(1).join('\n'),
    };
  });
}

async function linearGraphQL(query, variables) {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) throw new Error('LINEAR_API_KEY is required for --apply');

  const response = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json();
  if (!response.ok || payload.errors) {
    throw new Error(`Linear API error: ${JSON.stringify(payload.errors || payload)}`);
  }
  return payload.data;
}

async function createLinearIssue({ teamId, title, description, parentId, labelIds = [] }) {
  const query = `
    mutation IssueCreate($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue { id identifier url title }
      }
    }
  `;

  const input = { teamId, title, description };
  if (parentId) input.parentId = parentId;
  if (labelIds.length > 0) input.labelIds = labelIds;

  const out = await linearGraphQL(query, { input });
  return out.issueCreate.issue;
}

function toMarkdownDesc(text) {
  return text.replace(/^- /gm, '* ');
}

async function runLinearCreation() {
  const teamId = process.env.LINEAR_TEAM_ID;
  const labelIds = (process.env.LINEAR_LABEL_IDS || '').split(',').map((s) => s.trim()).filter(Boolean);

  const content = read(linearFile);
  const epics = parseLinearEpics(content);
  const ideas = parseLinearIdeas(content);
  const tech = parseLinearTech(content);

  const createdEpics = new Map();
  const output = { epics: [], ideas: [], tech: [] };

  for (const epic of epics) {
    if (dryRun) {
      console.log(`[DRY-RUN][Linear][Epic] ${epic.title}`);
      createdEpics.set(epic.code, { id: `dry-${epic.code}` });
      output.epics.push({ title: epic.title, dryRun: true });
      continue;
    }

    if (!teamId) throw new Error('LINEAR_TEAM_ID is required for --apply');

    const issue = await createLinearIssue({
      teamId,
      title: epic.title,
      description: toMarkdownDesc(epic.description),
      labelIds,
    });

    createdEpics.set(epic.code, issue);
    output.epics.push(issue);
    console.log(`[Linear][Epic] Created ${issue.identifier} ${issue.url}`);
  }

  for (const idea of ideas) {
    if (dryRun) {
      console.log(`[DRY-RUN][Linear][Idea] ${idea.title} (parent ${idea.parentCode})`);
      output.ideas.push({ title: idea.title, parentCode: idea.parentCode, dryRun: true });
      continue;
    }

    const parent = createdEpics.get(idea.parentCode);
    const issue = await createLinearIssue({
      teamId,
      title: idea.title,
      description: toMarkdownDesc(idea.description),
      parentId: parent?.id,
      labelIds,
    });

    output.ideas.push(issue);
    console.log(`[Linear][Idea] Created ${issue.identifier} ${issue.url}`);
  }

  for (const t of tech) {
    if (dryRun) {
      console.log(`[DRY-RUN][Linear][Tech] ${t.title}`);
      output.tech.push({ title: t.title, dryRun: true });
      continue;
    }

    const issue = await createLinearIssue({
      teamId,
      title: t.title,
      description: toMarkdownDesc(t.description),
      labelIds,
    });

    output.tech.push(issue);
    console.log(`[Linear][Tech] Created ${issue.identifier} ${issue.url}`);
  }

  return output;
}

(async () => {
  const report = {
    dryRun,
    timestamp: new Date().toISOString(),
    linear: await runLinearCreation(),
  };

  const outPath = path.join(root, 'roadmap-migration/creation-report.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`Wrote ${outPath}`);
})();
