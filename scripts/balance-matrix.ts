import { pathToFileURL } from "node:url";
import { loadContent } from "../src/simulation/content";
import type { DecisionPackId } from "../src/simulation/state/types";
import {
  archetypePolicies,
  buildCoverageStat,
  buildRepeatedTrayPressure,
  formatPercentage,
  getArgValue,
  getContentHash,
  parsePositiveInteger,
  simulateBotRun,
  type ArchetypeId,
  type ArchetypePolicy,
  type CoverageStat,
  type RepeatedTrayPressure,
} from "./simulation-reporting";

const DEFAULT_RUNS = 200;
const DEFAULT_MAX_ROUNDS = 24;
const DEFAULT_SEED = "v0.5-matrix";

export interface BalanceMatrixOptions {
  runs: number;
  maxRounds: number;
  seed: string;
  archetypes?: ArchetypePolicy[];
}

export interface ArchetypeMatrixRow {
  archetypeId: ArchetypeId;
  label: string;
  botPolicy: string;
  runs: number;
  endingCounts: Record<string, number>;
  averageRunLength: number;
  surfacedDecisionCoverage: CoverageStat;
  selectedDecisionCoverage: CoverageStat;
  triggeredEventCoverage: CoverageStat;
  delayedEventCoverage: CoverageStat;
  hazardEventCoverage: CoverageStat;
  repeatedTrayPressure: RepeatedTrayPressure;
  packCoverage: Record<DecisionPackId, CoverageStat>;
  lowReachabilityPacks: DecisionPackId[];
  surfacedDecisionIds: string[];
  selectedDecisionIds: string[];
  triggeredEventIds: string[];
  triggeredDelayedEventIds: string[];
  triggeredHazardEventIds: string[];
}

export interface BalanceMatrixReport {
  reportName: string;
  contentHash: string;
  seed: string;
  runsPerArchetype: number;
  maxRounds: number;
  archetypes: ArchetypeMatrixRow[];
  aggregate: {
    runs: number;
    endingCounts: Record<string, number>;
    averageRunLength: number;
    surfacedDecisionCoverage: CoverageStat;
    selectedDecisionCoverage: CoverageStat;
    triggeredEventCoverage: CoverageStat;
    delayedEventCoverage: CoverageStat;
    hazardEventCoverage: CoverageStat;
    repeatedTrayPressure: RepeatedTrayPressure;
    packCoverage: Record<DecisionPackId, CoverageStat>;
    lowReachabilityPacks: DecisionPackId[];
  };
}

export function buildBalanceMatrixReport(
  options: BalanceMatrixOptions,
): BalanceMatrixReport {
  const content = loadContent();
  const contentHash = getContentHash(content);
  const archetypes = options.archetypes ?? archetypePolicies;
  const rows: ArchetypeMatrixRow[] = [];
  const aggregateSurfaced = new Set<string>();
  const aggregateSelected = new Set<string>();
  const aggregateEvents = new Set<string>();
  const aggregateDelayedEvents = new Set<string>();
  const aggregateHazardEvents = new Set<string>();
  const aggregatePackSurfaces = createPackSurfaceMap();
  const aggregateEndingCounts = createEndingCounts();
  let aggregateRounds = 0;
  let aggregateOverlap = 0;
  let aggregateSlots = 0;

  for (const archetype of archetypes) {
    const row = simulateArchetypeRow(options, archetype);
    rows.push(row);

    for (const [endingId, count] of Object.entries(row.endingCounts)) {
      aggregateEndingCounts[endingId] =
        (aggregateEndingCounts[endingId] ?? 0) + count;
    }

    aggregateRounds += row.averageRunLength * row.runs;
    aggregateOverlap += row.repeatedTrayPressure.overlapSlots;
    aggregateSlots += row.repeatedTrayPressure.totalSlots;

    for (const decisionId of row.surfacedDecisionIds) {
      aggregateSurfaced.add(decisionId);
    }

    for (const decisionId of row.selectedDecisionIds) {
      aggregateSelected.add(decisionId);
    }

    for (const eventId of row.triggeredEventIds) {
      aggregateEvents.add(eventId);
    }

    for (const eventId of row.triggeredDelayedEventIds) {
      aggregateDelayedEvents.add(eventId);
    }

    for (const eventId of row.triggeredHazardEventIds) {
      aggregateHazardEvents.add(eventId);
    }

    for (const [pack, stat] of Object.entries(row.packCoverage)) {
      if (stat.seen > 0) {
        aggregatePackSurfaces[pack as DecisionPackId].add(row.archetypeId);
      }
    }
  }

  const totalRuns = options.runs * archetypes.length;

  return {
    reportName: "V0.5 archetype balance matrix",
    contentHash,
    seed: options.seed,
    runsPerArchetype: options.runs,
    maxRounds: options.maxRounds,
    archetypes: rows,
    aggregate: {
      runs: totalRuns,
      endingCounts: aggregateEndingCounts,
      averageRunLength: totalRuns === 0 ? 0 : aggregateRounds / totalRuns,
      surfacedDecisionCoverage: buildCoverageStat(
        aggregateSurfaced.size,
        content.decisions.length,
      ),
      selectedDecisionCoverage: buildCoverageStat(
        aggregateSelected.size,
        content.decisions.length,
      ),
      triggeredEventCoverage: buildCoverageStat(
        aggregateEvents.size,
        content.events.length,
      ),
      delayedEventCoverage: buildCoverageStat(
        aggregateDelayedEvents.size,
        content.events.filter((event) => event.kind === "delayed").length,
      ),
      hazardEventCoverage: buildCoverageStat(aggregateHazardEvents.size, 0),
      repeatedTrayPressure: buildRepeatedTrayPressure(
        aggregateOverlap,
        aggregateSlots,
      ),
      packCoverage: buildPackCoverage(aggregatePackSurfaces, archetypes.length),
      lowReachabilityPacks: getLowReachabilityPacks(
        buildPackCoverage(aggregatePackSurfaces, archetypes.length),
        Math.min(2, archetypes.length),
      ),
    },
  };
}

export function formatBalanceMatrixReport(report: BalanceMatrixReport): string {
  const lines = [
    report.reportName,
    `Content hash: ${report.contentHash} | Seed: ${report.seed}`,
    `Runs/archetype: ${report.runsPerArchetype} | Max rounds/run: ${report.maxRounds}`,
    "",
    "Aggregate:",
    formatEndingDistribution(report.aggregate.endingCounts, report.aggregate.runs),
    `Average run length: ${report.aggregate.averageRunLength.toFixed(1)} rounds`,
    `Surfaced decisions: ${formatCoverage(report.aggregate.surfacedDecisionCoverage)}`,
    `Selected decisions: ${formatCoverage(report.aggregate.selectedDecisionCoverage)}`,
    `Triggered events: ${formatCoverage(report.aggregate.triggeredEventCoverage)}`,
    `Delayed events: ${formatCoverage(report.aggregate.delayedEventCoverage)}`,
    `Hazard events: ${formatCoverage(report.aggregate.hazardEventCoverage)}`,
    `Repeated-tray pressure: ${report.aggregate.repeatedTrayPressure.overlapSlots}/${report.aggregate.repeatedTrayPressure.totalSlots} (${formatPercentage(report.aggregate.repeatedTrayPressure.percentage)})`,
    `Low-reachability packs: ${formatIdList(report.aggregate.lowReachabilityPacks)}`,
    "",
    "Archetypes:",
  ];

  for (const row of report.archetypes) {
    lines.push(
      "",
      `${row.label} (${row.archetypeId})`,
      `Policy: ${row.botPolicy}`,
      formatEndingDistribution(row.endingCounts, row.runs),
      `Average run length: ${row.averageRunLength.toFixed(1)} rounds`,
      `Surfaced decisions: ${formatCoverage(row.surfacedDecisionCoverage)}`,
      `Selected decisions: ${formatCoverage(row.selectedDecisionCoverage)}`,
      `Triggered events: ${formatCoverage(row.triggeredEventCoverage)}`,
      `Delayed events: ${formatCoverage(row.delayedEventCoverage)}`,
      `Hazard events: ${formatCoverage(row.hazardEventCoverage)}`,
      `Repeated-tray pressure: ${row.repeatedTrayPressure.overlapSlots}/${row.repeatedTrayPressure.totalSlots} (${formatPercentage(row.repeatedTrayPressure.percentage)})`,
      `Low-reachability packs: ${formatIdList(row.lowReachabilityPacks)}`,
    );
  }

  return lines.join("\n");
}

function simulateArchetypeRow(
  options: BalanceMatrixOptions,
  archetype: ArchetypePolicy,
): ArchetypeMatrixRow {
  const content = loadContent();
  const surfaced = new Set<string>();
  const selected = new Set<string>();
  const events = new Set<string>();
  const delayedEvents = new Set<string>();
  const hazardEvents = new Set<string>();
  const packSurfaces = createPackSurfaceMap();
  const endingCounts = createEndingCounts();
  let totalRounds = 0;
  let overlap = 0;
  let slots = 0;

  for (let runIndex = 0; runIndex < options.runs; runIndex += 1) {
    const summary = simulateBotRun({
      archetype,
      maxRounds: options.maxRounds,
      seed: options.seed,
      runIndex,
      content,
    });

    endingCounts[summary.endingId] = (endingCounts[summary.endingId] ?? 0) + 1;
    totalRounds += summary.roundsPlayed;
    overlap += summary.repeatedTrayOverlap;
    slots += summary.repeatedTraySlots;

    for (const decisionId of summary.surfacedDecisionIds) {
      surfaced.add(decisionId);
    }

    for (const decisionId of summary.selectedDecisionIds) {
      selected.add(decisionId);
    }

    for (const eventId of summary.triggeredEventIds) {
      events.add(eventId);
    }

    for (const eventId of summary.triggeredDelayedEventIds) {
      delayedEvents.add(eventId);
    }

    for (const eventId of summary.triggeredHazardEventIds) {
      hazardEvents.add(eventId);
    }

    for (const pack of summary.surfacedPacks) {
      packSurfaces[pack].add(`run-${runIndex}`);
    }
  }

  const packCoverage = buildPackCoverage(packSurfaces, options.runs);

  return {
    archetypeId: archetype.id,
    label: archetype.label,
    botPolicy: archetype.description,
    runs: options.runs,
    endingCounts,
    averageRunLength: options.runs === 0 ? 0 : totalRounds / options.runs,
    surfacedDecisionCoverage: buildCoverageStat(surfaced.size, content.decisions.length),
    selectedDecisionCoverage: buildCoverageStat(selected.size, content.decisions.length),
    triggeredEventCoverage: buildCoverageStat(events.size, content.events.length),
    delayedEventCoverage: buildCoverageStat(
      delayedEvents.size,
      content.events.filter((event) => event.kind === "delayed").length,
    ),
    hazardEventCoverage: buildCoverageStat(hazardEvents.size, 0),
    repeatedTrayPressure: buildRepeatedTrayPressure(overlap, slots),
    packCoverage,
    lowReachabilityPacks: getLowReachabilityPacks(
      packCoverage,
      Math.min(2, options.runs),
    ),
    surfacedDecisionIds: [...surfaced].sort(),
    selectedDecisionIds: [...selected].sort(),
    triggeredEventIds: [...events].sort(),
    triggeredDelayedEventIds: [...delayedEvents].sort(),
    triggeredHazardEventIds: [...hazardEvents].sort(),
  };
}

function createEndingCounts(): Record<string, number> {
  const content = loadContent();
  return Object.fromEntries(
    ["active", ...content.endings.map((ending) => ending.id)].map((endingId) => [
      endingId,
      0,
    ]),
  );
}

function createPackSurfaceMap(): Record<DecisionPackId, Set<string>> {
  const content = loadContent();
  return Object.fromEntries(
    [...new Set(content.decisions.map((decision) => decision.pack))].map(
      (pack) => [pack, new Set<string>()],
    ),
  ) as Record<DecisionPackId, Set<string>>;
}

function buildPackCoverage(
  packSurfaces: Record<DecisionPackId, Set<string>>,
  total: number,
): Record<DecisionPackId, CoverageStat> {
  return Object.fromEntries(
    Object.entries(packSurfaces).map(([pack, seen]) => [
      pack,
      buildCoverageStat(seen.size, total),
    ]),
  ) as Record<DecisionPackId, CoverageStat>;
}

function getLowReachabilityPacks(
  packCoverage: Record<DecisionPackId, CoverageStat>,
  minimumSeen: number,
): DecisionPackId[] {
  return Object.entries(packCoverage)
    .filter(([, stat]) => stat.seen < minimumSeen)
    .map(([pack]) => pack as DecisionPackId)
    .sort();
}

function formatEndingDistribution(
  endingCounts: Record<string, number>,
  runs: number,
): string {
  const entries = Object.entries(endingCounts)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(
      ([endingId, count]) =>
        `${endingId} ${count} (${formatPercentage(count / Math.max(1, runs))})`,
    );

  return `Ending distribution: ${entries.join(", ")}`;
}

function formatCoverage(stat: CoverageStat): string {
  return `${stat.seen}/${stat.total} (${formatPercentage(stat.percentage)})`;
}

function formatIdList(ids: string[]): string {
  return ids.length === 0 ? "none" : ids.join(", ");
}

function parseArgs(argv: string[]): BalanceMatrixOptions {
  const options: BalanceMatrixOptions = {
    runs: DEFAULT_RUNS,
    maxRounds: DEFAULT_MAX_ROUNDS,
    seed: DEFAULT_SEED,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const runs = getArgValue(argv, index, "--runs");
    if (runs !== null) {
      options.runs = parsePositiveInteger(runs, "runs");
      index += argv[index] === "--runs" ? 1 : 0;
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
    }
  }

  return options;
}

function main() {
  const argv = process.argv.slice(2);
  const report = buildBalanceMatrixReport(parseArgs(argv));
  console.log(
    argv.includes("--json")
      ? JSON.stringify(report, null, 2)
      : formatBalanceMatrixReport(report),
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main();
}
