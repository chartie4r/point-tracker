import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = new Set(process.argv.slice(2));

const runLinear = args.has('--linear') || args.has('--all');
const runGitHub = args.has('--github') || args.has('--all');
const apply = args.has('--apply');
const dryRun = !apply;

if (!runLinear && !runGitHub) {
  console.error('Usage: node scripts/automate-roadmap-creation.mjs [--linear|--github|--all] [--apply]');
  process.exit(1);
}

const linearFile = path.join(root, 'roadmap-migration/linear-migration-drafts.md');
const githubFile = path.join(root, 'roadmap-migration/github-implementation-issue-drafts.md');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function section(content, startHeading, endHeading) {
  const start = content.indexOf(startHeading);
  if (start < 0) return '';
  const end = endHeading ? content.indexOf(endHeading, start) : -1;
  return content.slice(start, end > -1 ? end : content.length);
}

function parseLinearEpics(content) {
  const sec = section(content, '## Feature epics (E0–E15)', '## Feature issues (1–28)');
  const blocks = sec.split('\n### ').slice(1);
  return blocks.map((b) => {
    const lines = b.trim().split('\n');
    const heading = lines[0].trim();
    const code = heading.split(':')[0].trim();
    return {
      code,
      title: heading,
      description: lines.slice(1).join('\n'),
    };
  });
}

function parseLinearIdeas(content) {
  const sec = section(content, '## Feature issues (1–28)', '## Tech epics/issues (T1–T6 + T7 engine)');
  const blocks = sec.split('\n### ').slice(1);
  return blocks.map((b) => {
    const lines = b.trim().split('\n');
    const heading = lines[0].trim();
    const parentLine = lines.find((l) => l.startsWith('- Parent epic:')) || '';
    const parentCode = parentLine.replace('- Parent epic:', '').trim();
    return {
      title: heading,
      parentCode,
      description: lines.slice(1).join('\n'),
    };
  });
}

function parseLinearTech(content) {
  const sec = section(content, '## Tech epics/issues (T1–T6 + T7 engine)', null);
  const blocks = sec.split('\n### ').slice(1);
  return blocks.map((b) => {
    const lines = b.trim().split('\n');
    const heading = lines[0].trim();
    return {
      title: heading,
      description: lines.slice(1).join('\n'),
    };
  });
}

function parseGitHubDrafts(content) {
  const blocks = content.split('\n## ').slice(1);
  return blocks.map((b) => {
    const lines = b.trim().split('\n');
    const docHeading = lines[0].trim();
    const titleLine = lines.find((l) => l.startsWith('- Suggested issue title:')) || '';
    const title = titleLine.replace('- Suggested issue title:', '').trim() || `Implement ${docHeading}`;
    const body = lines.slice(1).join('\n').trim();
    return { title, body };
  });
}

async function linearGraphQL(query, variables) {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) throw new Error('LINEAR_API_KEY is required for --linear --apply');

  const res = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });

  const data = await res.json();
  if (!res.ok || data.errors) {
    throw new Error(`Linear API error: ${JSON.stringify(data.errors || data)}`);
  }
  return data.data;
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

async function createGitHubIssue({ owner, repo, title, body, labels }) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is required for --github --apply');

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({ title, body, labels }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
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

  const createdMap = new Map();
  const output = { epics: [], ideas: [], tech: [] };

  for (const epic of epics) {
    if (dryRun) {
      console.log(`[DRY-RUN][Linear][Epic] ${epic.title}`);
      createdMap.set(epic.code, { id: `dry-${epic.code}`, identifier: epic.code, url: '' });
      output.epics.push({ code: epic.code, title: epic.title, dryRun: true });
      continue;
    }
    if (!teamId) throw new Error('LINEAR_TEAM_ID is required for --linear --apply');

    const issue = await createLinearIssue({
      teamId,
      title: epic.title,
      description: toMarkdownDesc(epic.description),
      labelIds,
    });
    createdMap.set(epic.code, issue);
    output.epics.push(issue);
    console.log(`[Linear][Epic] Created ${issue.identifier} ${issue.url}`);
  }

  for (const idea of ideas) {
    if (dryRun) {
      console.log(`[DRY-RUN][Linear][Idea] ${idea.title} (parent ${idea.parentCode})`);
      output.ideas.push({ title: idea.title, parentCode: idea.parentCode, dryRun: true });
      continue;
    }
    const parent = createdMap.get(idea.parentCode);
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

async function runGitHubCreation() {
  const fullRepo = process.env.GITHUB_REPO;
  if (!dryRun && !fullRepo) {
    throw new Error('GITHUB_REPO is required for --github --apply (format: owner/repo)');
  }

  const labels = (process.env.GITHUB_LABELS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const drafts = parseGitHubDrafts(read(githubFile));
  const output = [];

  let owner = '';
  let repo = '';
  if (fullRepo) {
    [owner, repo] = fullRepo.split('/');
  }

  for (const draft of drafts) {
    if (dryRun) {
      console.log(`[DRY-RUN][GitHub] ${draft.title}`);
      output.push({ title: draft.title, dryRun: true });
      continue;
    }
    const issue = await createGitHubIssue({ owner, repo, title: draft.title, body: draft.body, labels });
    output.push({ number: issue.number, title: issue.title, url: issue.html_url });
    console.log(`[GitHub] Created #${issue.number} ${issue.html_url}`);
  }

  return output;
}

(async () => {
  const report = {
    dryRun,
    timestamp: new Date().toISOString(),
  };

  if (runLinear) {
    report.linear = await runLinearCreation();
  }

  if (runGitHub) {
    report.github = await runGitHubCreation();
  }

  const outPath = path.join(root, 'roadmap-migration/creation-report.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`Wrote ${outPath}`);
})();
