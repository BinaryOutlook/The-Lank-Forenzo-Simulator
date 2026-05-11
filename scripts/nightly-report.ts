import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { loadContent } from "../src/simulation/content/index.js";
import type {
  ContentBundle,
  DecisionDefinition,
  DecisionPackId,
  EventDefinition,
} from "../src/simulation/state/types.js";
import {
  buildBalanceMatrixReport,
  type ArchetypeMatrixRow,
  type BalanceMatrixReport,
} from "./balance-matrix.js";
import {
  archetypePolicies,
  formatPercentage,
  getArgValue,
  parsePositiveInteger,
  simulateBotRun,
  type ArchetypePolicy,
  type SimulatedRunSummary,
} from "./simulation-reporting.js";

const DEFAULT_RUNS_PER_ARCHETYPE = 750;
const DEFAULT_MAX_ROUNDS = 30;
const DEFAULT_SEED = "nightly-v1";
const DEFAULT_OUTPUT_DIR = "artifacts/nightly-simulation-report";
const DEFAULT_DOMINANT_SEQUENCE_PREFIX_LENGTHS = [2, 3, 4];
const DEFAULT_DOMINANT_SEQUENCE_LIMIT = 12;
const DEFAULT_DOMINANT_SEQUENCE_MINIMUM_COUNT = 10;
const DEFAULT_LOW_CONFIDENCE_PACK_MINIMUM_ARCHETYPES = 2;
const SUCCESSFUL_ENDING_IDS = new Set(["bahamas", "extraction", "merger"]);

export interface NightlySimulationOptions {
  runsPerArchetype?: number;
  maxRounds?: number;
  seed?: string;
  archetypes?: ArchetypePolicy[];
  generatedAt?: string;
  dominantSequencePrefixLengths?: number[];
  dominantSequenceLimit?: number;
  dominantSequenceMinimumCount?: number;
  lowConfidencePackMinimumArchetypes?: number;
}

export interface NightlyRunProfile {
  totalRuns: number;
  runsPerArchetype: number;
  maxRounds: number;
  seed: string;
  archetypeIds: string[];
  dominantSequencePrefixLengths: number[];
  dominantSequenceMinimumCount: number;
  lowConfidencePackMinimumArchetypes: number;
}

export interface EndingDistributionEntry {
  endingId: string;
  count: number;
  percentage: number;
}

export interface LowConfidenceDecisionReference {
  id: string;
  title: string;
  pack: DecisionPackId;
  group: DecisionDefinition["group"];
  tags: string[];
}

export interface LowConfidenceEventReference {
  id: string;
  title: string;
  kind: EventDefinition["kind"];
  tags: string[];
}

export interface LowConfidencePackReference {
  pack: DecisionPackId;
  surfacedInArchetypes: number;
  totalArchetypes: number;
  minimumArchetypes: number;
  percentage: number;
}

export interface LowConfidenceTrendPoint {
  generatedAt: string;
  contentHash: string;
  seed: string;
  totalRuns: number;
  runsPerArchetype: number;
  maxRounds: number;
  endingDistribution: EndingDistributionEntry[];
  coverage: {
    surfacedDecisionPercentage: number;
    selectedDecisionPercentage: number;
    triggeredEventPercentage: number;
    delayedEventPercentage: number;
  };
  lowConfidenceCounts: {
    decisionsNeverSurfaced: number;
    decisionsNeverSelected: number;
    eventsNeverTriggered: number;
    delayedEventsNeverTriggered: number;
    packsBelowThreshold: number;
  };
  lowConfidencePackIds: DecisionPackId[];
}

export interface LowConfidenceContentReport {
  thresholds: {
    packMinimumArchetypes: number;
  };
  decisionsNeverSurfaced: LowConfidenceDecisionReference[];
  decisionsNeverSelected: LowConfidenceDecisionReference[];
  eventsNeverTriggered: LowConfidenceEventReference[];
  delayedEventsNeverTriggered: LowConfidenceEventReference[];
  packsBelowThreshold: LowConfidencePackReference[];
  trend: LowConfidenceTrendPoint;
}

export interface DominantSequenceSummary {
  sequenceIds: string[];
  sequenceTitles: string[];
  prefixLength: number;
  count: number;
  frequency: number;
  winRate: number;
  averagePersonalWealth: number;
  dominanceScore: number;
  endingCounts: Record<string, number>;
  archetypeCounts: Record<string, number>;
}

export interface NightlySimulationReport {
  reportName: string;
  generatedAt: string;
  contentHash: string;
  runProfile: NightlyRunProfile;
  matrix: BalanceMatrixReport;
  lowConfidenceContent: LowConfidenceContentReport;
  dominantSequences: DominantSequenceSummary[];
  softWarnings: string[];
}

interface NightlyCliOptions extends Required<NightlySimulationOptions> {
  outputDir: string;
  json: boolean;
}

interface NightlyRunRecord {
  archetypeId: string;
  endingId: string;
  selectedDecisionSequence: string[];
  finalPersonalWealth: number;
}

interface SequenceAccumulator {
  sequenceIds: string[];
  count: number;
  successfulCount: number;
  totalPersonalWealth: number;
  endingCounts: Record<string, number>;
  archetypeCounts: Record<string, number>;
}

export function buildNightlySimulationReport(
  options: NightlySimulationOptions = {},
): NightlySimulationReport {
  const content = loadContent();
  const normalizedOptions = normalizeOptions(options);
  const matrix = buildBalanceMatrixReport({
    runs: normalizedOptions.runsPerArchetype,
    maxRounds: normalizedOptions.maxRounds,
    seed: normalizedOptions.seed,
    archetypes: normalizedOptions.archetypes,
  });
  const runRecords = collectNightlyRunRecords({
    archetypes: normalizedOptions.archetypes,
    content,
    maxRounds: normalizedOptions.maxRounds,
    runsPerArchetype: normalizedOptions.runsPerArchetype,
    seed: normalizedOptions.seed,
  });
  const totalRuns =
    normalizedOptions.runsPerArchetype * normalizedOptions.archetypes.length;
  const lowConfidenceContent = buildLowConfidenceContentReport({
    content,
    generatedAt: normalizedOptions.generatedAt,
    matrix,
    packMinimumArchetypes:
      normalizedOptions.lowConfidencePackMinimumArchetypes,
  });
  const dominantSequences = buildDominantSequenceSummaries({
    content,
    limit: normalizedOptions.dominantSequenceLimit,
    minimumCount: normalizedOptions.dominantSequenceMinimumCount,
    prefixLengths: normalizedOptions.dominantSequencePrefixLengths,
    runRecords,
    totalRuns,
  });
  const runProfile: NightlyRunProfile = {
    totalRuns,
    runsPerArchetype: normalizedOptions.runsPerArchetype,
    maxRounds: normalizedOptions.maxRounds,
    seed: normalizedOptions.seed,
    archetypeIds: normalizedOptions.archetypes.map((archetype) => archetype.id),
    dominantSequencePrefixLengths:
      normalizedOptions.dominantSequencePrefixLengths,
    dominantSequenceMinimumCount:
      normalizedOptions.dominantSequenceMinimumCount,
    lowConfidencePackMinimumArchetypes:
      normalizedOptions.lowConfidencePackMinimumArchetypes,
  };

  return {
    reportName: "Nightly long-run simulation report",
    generatedAt: normalizedOptions.generatedAt,
    contentHash: matrix.contentHash,
    runProfile,
    matrix,
    lowConfidenceContent,
    dominantSequences,
    softWarnings: buildSoftWarnings(matrix, lowConfidenceContent, dominantSequences),
  };
}

export function formatNightlySimulationReport(
  report: NightlySimulationReport,
): string {
  const lines = [
    `# ${report.reportName}`,
    "",
    `Generated: ${report.generatedAt}`,
    `Content hash: \`${report.contentHash}\``,
    `Seed: \`${report.runProfile.seed}\``,
    "",
    "## Run profile",
    "",
    `- Total runs: ${report.runProfile.totalRuns}`,
    `- Runs per archetype: ${report.runProfile.runsPerArchetype}`,
    `- Max rounds per run: ${report.runProfile.maxRounds}`,
    `- Archetypes: ${formatIdList(report.runProfile.archetypeIds)}`,
    "",
    "## Ending distribution",
    "",
    "| Ending | Runs | Share |",
    "| --- | ---: | ---: |",
    ...toEndingDistribution(
      report.matrix.aggregate.endingCounts,
      report.matrix.aggregate.runs,
    ).map(
      (entry) =>
        `| ${entry.endingId} | ${entry.count} | ${formatPercentage(entry.percentage)} |`,
    ),
    "",
    "## Coverage",
    "",
    `- Surfaced decisions: ${formatCoverage(report.matrix.aggregate.surfacedDecisionCoverage)}`,
    `- Selected decisions: ${formatCoverage(report.matrix.aggregate.selectedDecisionCoverage)}`,
    `- Triggered events: ${formatCoverage(report.matrix.aggregate.triggeredEventCoverage)}`,
    `- Delayed events: ${formatCoverage(report.matrix.aggregate.delayedEventCoverage)}`,
    `- Low-confidence packs: ${formatIdList(report.lowConfidenceContent.packsBelowThreshold.map((entry) => entry.pack))}`,
    "",
    "## Low-confidence content",
    "",
    `Pack threshold: surfaced by at least ${report.lowConfidenceContent.thresholds.packMinimumArchetypes} archetypes.`,
    "",
    `- Decisions never surfaced: ${report.lowConfidenceContent.decisionsNeverSurfaced.length}`,
    `- Decisions never selected: ${report.lowConfidenceContent.decisionsNeverSelected.length}`,
    `- Events never triggered: ${report.lowConfidenceContent.eventsNeverTriggered.length}`,
    `- Delayed events never triggered: ${report.lowConfidenceContent.delayedEventsNeverTriggered.length}`,
    `- Packs below threshold: ${report.lowConfidenceContent.packsBelowThreshold.length}`,
    "",
    "### First low-confidence decisions",
    "",
    formatReferenceList(report.lowConfidenceContent.decisionsNeverSurfaced),
    "",
    "### First low-confidence events",
    "",
    formatReferenceList(report.lowConfidenceContent.eventsNeverTriggered),
    "",
    "## Dominant sequence candidates",
    "",
    "Dominance is computed as:",
    "",
    "$$",
    "\\text{Dominance}(q) = \\text{WinRate}(q) \\times \\text{Frequency}(q) \\times \\text{AverageWealth}(q)",
    "$$",
    "",
    "| Rank | Prefix | Count | Frequency | Win rate | Avg. wealth | Score | Endings |",
    "| ---: | --- | ---: | ---: | ---: | ---: | ---: | --- |",
    ...formatDominantSequenceRows(report.dominantSequences),
    "",
    "## Soft warnings",
    "",
    report.softWarnings.length === 0
      ? "No soft warnings for this run."
      : report.softWarnings.map((warning) => `- ${warning}`).join("\n"),
    "",
  ];

  return lines.join("\n");
}

export async function writeNightlySimulationArtifacts(
  report: NightlySimulationReport,
  outputDir: string,
): Promise<string[]> {
  await mkdir(outputDir, { recursive: true });

  const artifacts = [
    {
      filename: "nightly-report.md",
      contents: formatNightlySimulationReport(report),
    },
    {
      filename: "nightly-report.json",
      contents: JSON.stringify(report, null, 2),
    },
    {
      filename: "low-confidence-content.json",
      contents: JSON.stringify(report.lowConfidenceContent, null, 2),
    },
    {
      filename: "low-confidence-trend.json",
      contents: JSON.stringify(report.lowConfidenceContent.trend, null, 2),
    },
    {
      filename: "dominant-sequences.json",
      contents: JSON.stringify(report.dominantSequences, null, 2),
    },
  ];

  await Promise.all(
    artifacts.map((artifact) =>
      writeFile(join(outputDir, artifact.filename), `${artifact.contents}\n`, "utf8"),
    ),
  );

  return artifacts.map((artifact) => join(outputDir, artifact.filename));
}

function normalizeOptions(
  options: NightlySimulationOptions,
): Required<NightlySimulationOptions> {
  const archetypes = options.archetypes ?? archetypePolicies;

  return {
    runsPerArchetype:
      options.runsPerArchetype ?? DEFAULT_RUNS_PER_ARCHETYPE,
    maxRounds: options.maxRounds ?? DEFAULT_MAX_ROUNDS,
    seed: options.seed ?? DEFAULT_SEED,
    archetypes,
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    dominantSequencePrefixLengths: normalizePositiveIntegers(
      options.dominantSequencePrefixLengths ??
        DEFAULT_DOMINANT_SEQUENCE_PREFIX_LENGTHS,
    ),
    dominantSequenceLimit:
      options.dominantSequenceLimit ?? DEFAULT_DOMINANT_SEQUENCE_LIMIT,
    dominantSequenceMinimumCount:
      options.dominantSequenceMinimumCount ??
      DEFAULT_DOMINANT_SEQUENCE_MINIMUM_COUNT,
    lowConfidencePackMinimumArchetypes:
      options.lowConfidencePackMinimumArchetypes ??
      DEFAULT_LOW_CONFIDENCE_PACK_MINIMUM_ARCHETYPES,
  };
}

function collectNightlyRunRecords(options: {
  archetypes: ArchetypePolicy[];
  content: ContentBundle;
  maxRounds: number;
  runsPerArchetype: number;
  seed: string;
}): NightlyRunRecord[] {
  const records: NightlyRunRecord[] = [];

  for (const archetype of options.archetypes) {
    for (let runIndex = 0; runIndex < options.runsPerArchetype; runIndex += 1) {
      records.push(
        toRunRecord(
          archetype.id,
          simulateBotRun({
            archetype,
            content: options.content,
            maxRounds: options.maxRounds,
            runIndex,
            seed: options.seed,
          }),
        ),
      );
    }
  }

  return records;
}

function toRunRecord(
  archetypeId: string,
  summary: SimulatedRunSummary,
): NightlyRunRecord {
  return {
    archetypeId,
    endingId: summary.endingId,
    selectedDecisionSequence: summary.selectedDecisionSequence,
    finalPersonalWealth: summary.finalRun.metrics.personalWealth,
  };
}

function buildLowConfidenceContentReport(options: {
  content: ContentBundle;
  generatedAt: string;
  matrix: BalanceMatrixReport;
  packMinimumArchetypes: number;
}): LowConfidenceContentReport {
  const surfacedDecisionIds = collectRowIds(
    options.matrix.archetypes,
    (row) => row.surfacedDecisionIds,
  );
  const selectedDecisionIds = collectRowIds(
    options.matrix.archetypes,
    (row) => row.selectedDecisionIds,
  );
  const triggeredEventIds = collectRowIds(
    options.matrix.archetypes,
    (row) => row.triggeredEventIds,
  );
  const delayedEventIds = new Set(
    options.content.events
      .filter((event) => event.kind === "delayed")
      .map((event) => event.id),
  );
  const packsBelowThreshold = Object.entries(options.matrix.aggregate.packCoverage)
    .filter(([, stat]) => stat.seen < options.packMinimumArchetypes)
    .map(([pack, stat]) => ({
      pack: pack as DecisionPackId,
      surfacedInArchetypes: stat.seen,
      totalArchetypes: stat.total,
      minimumArchetypes: options.packMinimumArchetypes,
      percentage: stat.percentage,
    }))
    .sort((left, right) => left.pack.localeCompare(right.pack));
  const decisionsNeverSurfaced = options.content.decisions
    .filter((decision) => !surfacedDecisionIds.has(decision.id))
    .map(formatDecisionReference)
    .sort(sortById);
  const decisionsNeverSelected = options.content.decisions
    .filter((decision) => !selectedDecisionIds.has(decision.id))
    .map(formatDecisionReference)
    .sort(sortById);
  const eventsNeverTriggered = options.content.events
    .filter((event) => !triggeredEventIds.has(event.id))
    .map(formatEventReference)
    .sort(sortById);
  const delayedEventsNeverTriggered = options.content.events
    .filter(
      (event) =>
        delayedEventIds.has(event.id) && !triggeredEventIds.has(event.id),
    )
    .map(formatEventReference)
    .sort(sortById);

  return {
    thresholds: {
      packMinimumArchetypes: options.packMinimumArchetypes,
    },
    decisionsNeverSurfaced,
    decisionsNeverSelected,
    eventsNeverTriggered,
    delayedEventsNeverTriggered,
    packsBelowThreshold,
    trend: {
      generatedAt: options.generatedAt,
      contentHash: options.matrix.contentHash,
      seed: options.matrix.seed,
      totalRuns: options.matrix.aggregate.runs,
      runsPerArchetype: options.matrix.runsPerArchetype,
      maxRounds: options.matrix.maxRounds,
      endingDistribution: toEndingDistribution(
        options.matrix.aggregate.endingCounts,
        options.matrix.aggregate.runs,
      ),
      coverage: {
        surfacedDecisionPercentage:
          options.matrix.aggregate.surfacedDecisionCoverage.percentage,
        selectedDecisionPercentage:
          options.matrix.aggregate.selectedDecisionCoverage.percentage,
        triggeredEventPercentage:
          options.matrix.aggregate.triggeredEventCoverage.percentage,
        delayedEventPercentage:
          options.matrix.aggregate.delayedEventCoverage.percentage,
      },
      lowConfidenceCounts: {
        decisionsNeverSurfaced: decisionsNeverSurfaced.length,
        decisionsNeverSelected: decisionsNeverSelected.length,
        eventsNeverTriggered: eventsNeverTriggered.length,
        delayedEventsNeverTriggered: delayedEventsNeverTriggered.length,
        packsBelowThreshold: packsBelowThreshold.length,
      },
      lowConfidencePackIds: packsBelowThreshold.map((entry) => entry.pack),
    },
  };
}

function buildDominantSequenceSummaries(options: {
  content: ContentBundle;
  limit: number;
  minimumCount: number;
  prefixLengths: number[];
  runRecords: NightlyRunRecord[];
  totalRuns: number;
}): DominantSequenceSummary[] {
  const accumulators = new Map<string, SequenceAccumulator>();

  for (const record of options.runRecords) {
    for (const prefixLength of options.prefixLengths) {
      if (record.selectedDecisionSequence.length < prefixLength) {
        continue;
      }

      const sequenceIds = record.selectedDecisionSequence.slice(0, prefixLength);
      const key = `${prefixLength}:${sequenceIds.join(">")}`;
      const accumulator = getSequenceAccumulator(accumulators, key, sequenceIds);
      accumulator.count += 1;
      accumulator.totalPersonalWealth += record.finalPersonalWealth;
      incrementCount(accumulator.endingCounts, record.endingId);
      incrementCount(accumulator.archetypeCounts, record.archetypeId);

      if (SUCCESSFUL_ENDING_IDS.has(record.endingId)) {
        accumulator.successfulCount += 1;
      }
    }
  }

  const decisionTitleById = new Map(
    options.content.decisions.map((decision) => [decision.id, decision.title]),
  );

  return [...accumulators.values()]
    .filter((accumulator) => accumulator.count >= options.minimumCount)
    .map((accumulator) => {
      const frequency = safeDivide(accumulator.count, options.totalRuns);
      const winRate = safeDivide(accumulator.successfulCount, accumulator.count);
      const averagePersonalWealth = safeDivide(
        accumulator.totalPersonalWealth,
        accumulator.count,
      );

      return {
        sequenceIds: accumulator.sequenceIds,
        sequenceTitles: accumulator.sequenceIds.map(
          (decisionId) => decisionTitleById.get(decisionId) ?? decisionId,
        ),
        prefixLength: accumulator.sequenceIds.length,
        count: accumulator.count,
        frequency,
        winRate,
        averagePersonalWealth,
        dominanceScore: frequency * winRate * averagePersonalWealth,
        endingCounts: sortCountRecord(accumulator.endingCounts),
        archetypeCounts: sortCountRecord(accumulator.archetypeCounts),
      };
    })
    .sort((left, right) => {
      if (right.dominanceScore !== left.dominanceScore) {
        return right.dominanceScore - left.dominanceScore;
      }

      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return left.sequenceIds.join(">").localeCompare(right.sequenceIds.join(">"));
    })
    .slice(0, options.limit);
}

function buildSoftWarnings(
  matrix: BalanceMatrixReport,
  lowConfidenceContent: LowConfidenceContentReport,
  dominantSequences: DominantSequenceSummary[],
): string[] {
  const warnings: string[] = [];
  const distribution = toEndingDistribution(
    matrix.aggregate.endingCounts,
    matrix.aggregate.runs,
  );
  const [dominantEnding] = [...distribution].sort(
    (left, right) => right.percentage - left.percentage,
  );

  if (dominantEnding && dominantEnding.percentage > 0.6) {
    warnings.push(
      `${dominantEnding.endingId} dominates ${formatPercentage(dominantEnding.percentage)} of runs.`,
    );
  }

  if (matrix.aggregate.surfacedDecisionCoverage.percentage < 0.55) {
    warnings.push(
      `Surfaced decision coverage is ${formatPercentage(matrix.aggregate.surfacedDecisionCoverage.percentage)}, below the 55% watch line.`,
    );
  }

  if (matrix.aggregate.triggeredEventCoverage.percentage < 0.35) {
    warnings.push(
      `Triggered event coverage is ${formatPercentage(matrix.aggregate.triggeredEventCoverage.percentage)}, below the 35% watch line.`,
    );
  }

  if (lowConfidenceContent.packsBelowThreshold.length > 0) {
    warnings.push(
      `Packs below the low-confidence threshold: ${formatIdList(lowConfidenceContent.packsBelowThreshold.map((entry) => entry.pack))}.`,
    );
  }

  if (dominantSequences.length === 0) {
    warnings.push("No dominant sequence candidate met the minimum count threshold.");
  }

  return warnings;
}

function getSequenceAccumulator(
  accumulators: Map<string, SequenceAccumulator>,
  key: string,
  sequenceIds: string[],
): SequenceAccumulator {
  const existing = accumulators.get(key);

  if (existing) {
    return existing;
  }

  const accumulator: SequenceAccumulator = {
    sequenceIds,
    count: 0,
    successfulCount: 0,
    totalPersonalWealth: 0,
    endingCounts: {},
    archetypeCounts: {},
  };
  accumulators.set(key, accumulator);

  return accumulator;
}

function collectRowIds(
  rows: ArchetypeMatrixRow[],
  selectIds: (row: ArchetypeMatrixRow) => string[],
): Set<string> {
  const ids = new Set<string>();

  for (const row of rows) {
    for (const id of selectIds(row)) {
      ids.add(id);
    }
  }

  return ids;
}

function toEndingDistribution(
  endingCounts: Record<string, number>,
  runs: number,
): EndingDistributionEntry[] {
  return Object.entries(endingCounts)
    .map(([endingId, count]) => ({
      endingId,
      count,
      percentage: safeDivide(count, runs),
    }))
    .sort((left, right) => left.endingId.localeCompare(right.endingId));
}

function formatDecisionReference(
  decision: DecisionDefinition,
): LowConfidenceDecisionReference {
  return {
    id: decision.id,
    title: decision.title,
    pack: decision.pack,
    group: decision.group,
    tags: decision.tags,
  };
}

function formatEventReference(event: EventDefinition): LowConfidenceEventReference {
  return {
    id: event.id,
    title: event.title,
    kind: event.kind,
    tags: event.tags,
  };
}

function formatReferenceList(
  references: Array<{ id: string; title: string }>,
): string {
  if (references.length === 0) {
    return "None.";
  }

  return references
    .slice(0, 12)
    .map((reference) => `- \`${reference.id}\` — ${reference.title}`)
    .join("\n");
}

function formatDominantSequenceRows(
  sequences: DominantSequenceSummary[],
): string[] {
  if (sequences.length === 0) {
    return ["| — | No sequence met the minimum count threshold. | — | — | — | — | — | — |"];
  }

  return sequences.map((sequence, index) => {
    const label = sequence.sequenceTitles.join(" → ");
    const endings = Object.entries(sequence.endingCounts)
      .map(([endingId, count]) => `${endingId}:${count}`)
      .join(", ");

    return `| ${index + 1} | ${label} | ${sequence.count} | ${formatPercentage(sequence.frequency)} | ${formatPercentage(sequence.winRate)} | ${sequence.averagePersonalWealth.toFixed(1)} | ${sequence.dominanceScore.toFixed(3)} | ${endings} |`;
  });
}

function formatCoverage(stat: { seen: number; total: number; percentage: number }): string {
  return `${stat.seen}/${stat.total} (${formatPercentage(stat.percentage)})`;
}

function formatIdList(ids: string[]): string {
  return ids.length === 0 ? "none" : ids.join(", ");
}

function sortById<T extends { id: string }>(left: T, right: T): number {
  return left.id.localeCompare(right.id);
}

function sortCountRecord(counts: Record<string, number>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)),
  );
}

function incrementCount(counts: Record<string, number>, key: string): void {
  counts[key] = (counts[key] ?? 0) + 1;
}

function safeDivide(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

function normalizePositiveIntegers(values: number[]): number[] {
  return [...new Set(values.filter((value) => Number.isInteger(value) && value > 0))]
    .sort((left, right) => left - right);
}

function parsePositiveIntegerList(raw: string, label: string): number[] {
  const values = raw
    .split(",")
    .map((entry) => parsePositiveInteger(entry.trim(), label));
  const normalizedValues = normalizePositiveIntegers(values);

  if (normalizedValues.length === 0) {
    throw new Error(`Expected ${label} to include at least one positive integer.`);
  }

  return normalizedValues;
}

function parseArgs(argv: string[]): NightlyCliOptions {
  const options: NightlyCliOptions = {
    runsPerArchetype: DEFAULT_RUNS_PER_ARCHETYPE,
    maxRounds: DEFAULT_MAX_ROUNDS,
    seed: DEFAULT_SEED,
    archetypes: archetypePolicies,
    generatedAt: new Date().toISOString(),
    dominantSequencePrefixLengths: DEFAULT_DOMINANT_SEQUENCE_PREFIX_LENGTHS,
    dominantSequenceLimit: DEFAULT_DOMINANT_SEQUENCE_LIMIT,
    dominantSequenceMinimumCount: DEFAULT_DOMINANT_SEQUENCE_MINIMUM_COUNT,
    lowConfidencePackMinimumArchetypes:
      DEFAULT_LOW_CONFIDENCE_PACK_MINIMUM_ARCHETYPES,
    outputDir: DEFAULT_OUTPUT_DIR,
    json: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const runsPerArchetype = getArgValue(argv, index, "--runs-per-archetype");
    if (runsPerArchetype !== null) {
      options.runsPerArchetype = parsePositiveInteger(
        runsPerArchetype,
        "runs-per-archetype",
      );
      index += argv[index] === "--runs-per-archetype" ? 1 : 0;
      continue;
    }

    const maxRounds = getArgValue(argv, index, "--max-rounds");
    if (maxRounds !== null) {
      options.maxRounds = parsePositiveInteger(maxRounds, "max-rounds");
      index += argv[index] === "--max-rounds" ? 1 : 0;
      continue;
    }

    const seed = getArgValue(argv, index, "--seed");
    if (seed !== null) {
      options.seed = seed;
      index += argv[index] === "--seed" ? 1 : 0;
      continue;
    }

    const outputDir = getArgValue(argv, index, "--output-dir");
    if (outputDir !== null) {
      options.outputDir = outputDir;
      index += argv[index] === "--output-dir" ? 1 : 0;
      continue;
    }

    const sequenceLengths = getArgValue(argv, index, "--sequence-lengths");
    if (sequenceLengths !== null) {
      options.dominantSequencePrefixLengths = parsePositiveIntegerList(
        sequenceLengths,
        "sequence-lengths",
      );
      index += argv[index] === "--sequence-lengths" ? 1 : 0;
      continue;
    }

    const sequenceLimit = getArgValue(argv, index, "--sequence-limit");
    if (sequenceLimit !== null) {
      options.dominantSequenceLimit = parsePositiveInteger(
        sequenceLimit,
        "sequence-limit",
      );
      index += argv[index] === "--sequence-limit" ? 1 : 0;
      continue;
    }

    const sequenceMinimumCount = getArgValue(
      argv,
      index,
      "--sequence-min-count",
    );
    if (sequenceMinimumCount !== null) {
      options.dominantSequenceMinimumCount = parsePositiveInteger(
        sequenceMinimumCount,
        "sequence-min-count",
      );
      index += argv[index] === "--sequence-min-count" ? 1 : 0;
      continue;
    }

    const packMinimumArchetypes = getArgValue(
      argv,
      index,
      "--pack-min-archetypes",
    );
    if (packMinimumArchetypes !== null) {
      options.lowConfidencePackMinimumArchetypes = parsePositiveInteger(
        packMinimumArchetypes,
        "pack-min-archetypes",
      );
      index += argv[index] === "--pack-min-archetypes" ? 1 : 0;
      continue;
    }

    if (argv[index] === "--json") {
      options.json = true;
    }
  }

  return options;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const report = buildNightlySimulationReport(options);
  const artifactPaths = await writeNightlySimulationArtifacts(
    report,
    options.outputDir,
  );

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(formatNightlySimulationReport(report));
  console.log("\nArtifacts written:");
  for (const artifactPath of artifactPaths) {
    console.log(`- ${artifactPath}`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await main();
}
