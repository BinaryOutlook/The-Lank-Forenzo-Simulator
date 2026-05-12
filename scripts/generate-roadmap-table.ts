import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

type FrontmatterValue = string | string[] | null;
type Frontmatter = Record<string, FrontmatterValue>;

interface RoadmapBrief {
  fileName: string;
  id: string;
  title: string;
  status: string;
  category: string;
  reward: string;
  effort: string;
  technicalDifficulty: string;
  conflictRisk: string;
  coreSystemRisk: string;
  dependencies: string[];
  parallelismClass: string;
  priority: string;
  githubIssue: string | null;
  owner: string | null;
  lastDecision: string | null;
}

const REQUIRED_FIELDS = [
  "id",
  "title",
  "status",
  "category",
  "reward",
  "effort",
  "technical_difficulty",
  "conflict_risk",
  "core_system_risk",
  "parallelism_class",
  "priority",
  "dependencies",
  "github_issue",
  "owner",
  "last_decision",
] as const;

const PARALLELISM_CLASSES = new Set(["Green", "Yellow", "Orange", "Red"]);
const ID_PATTERN = /^FR-\d{4}$/;

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(scriptDir, "..");
const roadmapDir = join(repoRoot, "Future Roadmap");
const issueBriefsDir = join(roadmapDir, "issue-briefs");
const masterTablePath = join(roadmapDir, "MASTER_ROADMAP_TABLE.md");

function parseInlineArray(rawValue: string): string[] {
  const inner = rawValue.slice(1, -1).trim();

  if (inner.length === 0) {
    return [];
  }

  return inner
    .split(",")
    .map((entry) => unquote(entry.trim()))
    .filter((entry) => entry.length > 0);
}

function unquote(rawValue: string): string {
  if (
    (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
    (rawValue.startsWith("'") && rawValue.endsWith("'"))
  ) {
    return rawValue.slice(1, -1);
  }

  return rawValue;
}

function parseScalar(rawValue: string): FrontmatterValue {
  const trimmed = rawValue.trim();

  if (trimmed === "null") {
    return null;
  }

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return parseInlineArray(trimmed);
  }

  return unquote(trimmed);
}

function extractFrontmatter(content: string, fileName: string): Frontmatter {
  const match = content.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);

  if (!match) {
    throw new Error(`${fileName}: missing YAML frontmatter`);
  }

  const frontmatter: Frontmatter = {};

  for (const [index, line] of match[1].split("\n").entries()) {
    const trimmed = line.trim();

    if (trimmed.length === 0 || trimmed.startsWith("#")) {
      continue;
    }

    const keyValueMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);

    if (!keyValueMatch) {
      throw new Error(
        `${fileName}: unsupported frontmatter line ${index + 2}: ${line}`,
      );
    }

    const [, key, rawValue] = keyValueMatch;
    frontmatter[key] = parseScalar(rawValue);
  }

  return frontmatter;
}

function requiredString(
  metadata: Frontmatter,
  fieldName: string,
  fileName: string,
  errors: string[],
): string {
  const value = metadata[fieldName];

  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push(`${fileName}: ${fieldName} must be a non-empty string`);
    return "";
  }

  return value.trim();
}

function requiredArray(
  metadata: Frontmatter,
  fieldName: string,
  fileName: string,
  errors: string[],
): string[] {
  const value = metadata[fieldName];

  if (!Array.isArray(value)) {
    errors.push(`${fileName}: ${fieldName} must be an inline array`);
    return [];
  }

  const emptyValue = value.find((entry) => entry.trim().length === 0);

  if (emptyValue !== undefined) {
    errors.push(`${fileName}: ${fieldName} contains an empty value`);
  }

  return value.map((entry) => entry.trim());
}

function nullableString(
  metadata: Frontmatter,
  fieldName: string,
  fileName: string,
  errors: string[],
): string | null {
  const value = metadata[fieldName];

  if (value === null) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  }

  errors.push(`${fileName}: ${fieldName} must be a string or null`);
  return null;
}

function normalizeBrief(
  fileName: string,
  metadata: Frontmatter,
  errors: string[],
): RoadmapBrief {
  for (const fieldName of REQUIRED_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(metadata, fieldName)) {
      errors.push(`${fileName}: missing required field ${fieldName}`);
    }
  }

  const brief: RoadmapBrief = {
    fileName,
    id: requiredString(metadata, "id", fileName, errors),
    title: requiredString(metadata, "title", fileName, errors),
    status: requiredString(metadata, "status", fileName, errors),
    category: requiredString(metadata, "category", fileName, errors),
    reward: requiredString(metadata, "reward", fileName, errors),
    effort: requiredString(metadata, "effort", fileName, errors),
    technicalDifficulty: requiredString(
      metadata,
      "technical_difficulty",
      fileName,
      errors,
    ),
    conflictRisk: requiredString(metadata, "conflict_risk", fileName, errors),
    coreSystemRisk: requiredString(
      metadata,
      "core_system_risk",
      fileName,
      errors,
    ),
    dependencies: requiredArray(metadata, "dependencies", fileName, errors),
    parallelismClass: requiredString(
      metadata,
      "parallelism_class",
      fileName,
      errors,
    ),
    priority: requiredString(metadata, "priority", fileName, errors),
    githubIssue: nullableString(metadata, "github_issue", fileName, errors),
    owner: nullableString(metadata, "owner", fileName, errors),
    lastDecision: nullableString(metadata, "last_decision", fileName, errors),
  };

  if (brief.id.length > 0 && !ID_PATTERN.test(brief.id)) {
    errors.push(`${fileName}: id must match FR-0000 format`);
  }

  if (
    brief.parallelismClass.length > 0 &&
    !PARALLELISM_CLASSES.has(brief.parallelismClass)
  ) {
    errors.push(
      `${fileName}: parallelism_class must be one of Green, Yellow, Orange, Red`,
    );
  }

  return brief;
}

function readRoadmapBriefs(): RoadmapBrief[] {
  const errors: string[] = [];
  const briefs: RoadmapBrief[] = [];
  const seenIds = new Map<string, string>();

  for (const fileName of readdirSync(issueBriefsDir)
    .filter((entry) => entry.endsWith(".md") && entry !== "README.md")
    .sort()) {
    try {
      const fullPath = join(issueBriefsDir, fileName);
      const content = readFileSync(fullPath, "utf8");
      const metadata = extractFrontmatter(content, fileName);
      const brief = normalizeBrief(fileName, metadata, errors);
      const existingFile = seenIds.get(brief.id);

      if (existingFile) {
        errors.push(
          `${fileName}: duplicate id ${brief.id}; already used by ${existingFile}`,
        );
      } else if (brief.id.length > 0) {
        seenIds.set(brief.id, fileName);
      }

      briefs.push(brief);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  if (briefs.length === 0) {
    errors.push("No issue briefs found");
  }

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  return briefs.sort((left, right) =>
    left.id.localeCompare(right.id, undefined, { numeric: true }),
  );
}

function escapeTableCell(value: string): string {
  return value.replace(/\r?\n/g, "<br>").replace(/\|/g, "\\|");
}

function formatNullable(value: string | null, fallback: string): string {
  return value === null ? fallback : escapeTableCell(value);
}

function formatDependencies(dependencies: string[]): string {
  if (dependencies.length === 0) {
    return "None";
  }

  return escapeTableCell(dependencies.join(", "));
}

function formatGithubIssue(value: string | null): string {
  if (value === null) {
    return "None";
  }

  if (value.startsWith("https://") || value.startsWith("http://")) {
    return `[Link](${value})`;
  }

  return escapeTableCell(value);
}

function renderTableRow(brief: RoadmapBrief): string {
  const briefLink = `[Brief](issue-briefs/${encodeURI(basename(brief.fileName))})`;
  const cells = [
    brief.id,
    brief.title,
    briefLink,
    brief.category,
    brief.reward,
    brief.effort,
    brief.technicalDifficulty,
    brief.conflictRisk,
    brief.coreSystemRisk,
    formatDependencies(brief.dependencies),
    brief.parallelismClass,
    brief.priority,
    brief.status,
    formatGithubIssue(brief.githubIssue),
    formatNullable(brief.owner, "Unassigned"),
    formatNullable(brief.lastDecision, "None"),
  ];

  return `| ${cells.map(escapeTableCell).join(" | ")} |`;
}

function renderMasterTable(briefs: RoadmapBrief[]): string {
  const rows = briefs.map(renderTableRow).join("\n");

  return `<!-- GENERATED FILE - DO NOT EDIT MANUALLY -->
<!-- Source: Future Roadmap/issue-briefs/*.md -->
<!-- Regenerate using the documented roadmap generation command. -->

# Master Roadmap Table

Status: Generated candidate-work index

This table is the active candidate queue. A row here does not mean the work is active. It means the work has been noticed, categorized, and given enough structure to decide whether it should wait, be clarified, receive architecture review, or be promoted to a GitHub issue.

Individual issue briefs are the source of truth. To change this table, edit the frontmatter in the relevant brief under [\`issue-briefs/\`](issue-briefs/) and run \`npm run roadmap:generate\`.

Completed, rejected, or superseded records move to [\`archive/\`](archive/) after the post-merge or review audit. Keep this table focused on decisions still waiting in line.

## Status Values

- \`Idea\`: raw but worth keeping visible.
- \`Candidate Brief\`: has a standalone brief under \`issue-briefs/\`.
- \`Needs Clarification\`: blocked on product, technical, or ownership questions.
- \`Needs Architecture Review\`: touches high-risk systems or durable boundaries.
- \`Ready for GitHub Issue\`: scoped and reviewed enough to promote.
- \`Promoted to GitHub Issue\`: active tracker item exists.
- \`In Progress\`: promoted work is actively underway.
- \`Blocked\`: cannot proceed until a dependency or decision clears.
- \`Done\`: complete and merged, waiting for archive cleanup.
- \`Rejected / Archived\`: deliberately not moving forward, waiting for or already represented by an archive record.

## Parallelism Class Legend

| Class | Meaning | Agent Guidance |
| --- | --- | --- |
| Green | Safe to parallelize aggressively. | Good for docs, isolated tests, content notes, or small local fixes with clear file ownership. |
| Yellow | Parallelize with clear file/module boundaries. | Split files or modules before assigning multiple agents. Coordinate merge order. |
| Orange | One main owner, helpers allowed. | The main owner controls integration. Helpers should produce bounded patches or research. |
| Red | Do not parallelize core mutation. | One owner only until the risky core change is merged or split by architecture review. |

## Candidate Queue

| ID | Title | Brief Link | Category | Reward | Effort | Technical Difficulty | Conflict Risk | Core-System Risk | Dependencies | Parallelism Class | Priority | Status | GitHub Issue | Owner | Last Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${rows}

## Notes For Maintainers

- Individual issue briefs are the roadmap source of truth.
- Agents may edit issue briefs, but only the generation script may edit \`MASTER_ROADMAP_TABLE.md\`.
- Do not add candidate work directly to this table.
- Use \`npm run roadmap:generate\` after changing issue brief frontmatter.
- Use \`npm run roadmap:check\` before opening a PR.
- PRs should include both issue brief metadata changes and the regenerated table when the table is committed.
- Completed rows should move to [\`archive/\`](archive/) after issue -> PR -> merge to \`main\` -> post-merge audit, then this table should be regenerated.
`;
}

function generateMasterTable(): string {
  return renderMasterTable(readRoadmapBriefs());
}

function main() {
  const mode = process.argv[2];

  if (mode !== "generate" && mode !== "check") {
    throw new Error(
      "Usage: node --import tsx scripts/generate-roadmap-table.ts <generate|check>",
    );
  }

  const generatedTable = generateMasterTable();

  if (mode === "generate") {
    writeFileSync(masterTablePath, generatedTable, "utf8");
    console.log(`Generated ${masterTablePath}`);
    return;
  }

  if (!existsSync(masterTablePath)) {
    throw new Error(`${masterTablePath} does not exist`);
  }

  const currentTable = readFileSync(masterTablePath, "utf8");

  if (currentTable !== generatedTable) {
    throw new Error(
      `${masterTablePath} is stale. Run npm run roadmap:generate and commit the result.`,
    );
  }

  console.log(`${masterTablePath} is up to date`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
