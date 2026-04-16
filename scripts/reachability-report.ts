import { pathToFileURL } from "node:url";
import { hashNumber, hashString, shuffleWithSeed } from "../src/lib/random/seeded";
import { loadContent } from "../src/simulation/content";
import {
  createInitialRunState,
  resolveRound,
} from "../src/simulation/resolution/resolveRound";
import { getAvailableDecisions } from "../src/simulation/systems/decisionEngine";
import type {
  ContentBundle,
  DecisionDefinition,
  DecisionPackId,
  EventDefinition,
  MetricKey,
  RunState,
} from "../src/simulation/state/types";
import {
  buildCoverageStat,
  buildRepeatedTrayPressure,
  formatPercentage,
  getArgValue,
  getContentHash,
  parsePositiveInteger,
  type CoverageStat,
  type RepeatedTrayPressure,
} from "./simulation-reporting";

const DEFAULT_WIDTH = 32;
const DEFAULT_DEPTH = 24;
const DEFAULT_SEED = "v0.5-default";
const MAX_BRANCHING_TRAY = 7;

export interface ReachabilityOptions {
  width: number;
  depth: number;
  seed: string;
  content?: ContentBundle;
}

export interface AbstractRunState {
  status: RunState["status"];
  endingId: string;
  roundBucket: string;
  metricBuckets: Record<MetricKey, string>;
  flags: string[];
}

export interface NoveltyContext {
  knownStateKeys: Set<string>;
  surfacedDecisionIds: Set<string>;
  selectedDecisionIds: Set<string>;
  triggeredEventIds: Set<string>;
  endingIds: Set<string>;
  packIds: Set<string>;
  flagIds: Set<string>;
}

export interface CandidateNoveltyInput {
  stateKey: string;
  surfacedDecisionIds: Iterable<string>;
  selectedDecisionIds: Iterable<string>;
  triggeredEventIds: Iterable<string>;
  endingId?: string | null;
  packIds: Iterable<string>;
  flagIds: Iterable<string>;
}

export interface ReachabilityReport {
  reportName: string;
  contentHash: string;
  seed: string;
  width: number;
  depth: number;
  exploredStates: number;
  frontierStates: number;
  confidence: "low" | "medium" | "high";
  surfacedDecisionCoverage: CoverageStat;
  selectedDecisionCoverage: CoverageStat;
  triggeredEventCoverage: CoverageStat;
  delayedEventCoverage: CoverageStat;
  hazardEventCoverage: CoverageStat;
  endingCoverage: CoverageStat;
  packCoverage: Record<DecisionPackId, CoverageStat>;
  flagCoverage: CoverageStat;
  repeatedTrayPressure: RepeatedTrayPressure;
  lowConfidenceDecisionIds: string[];
  lowConfidenceEventIds: string[];
  lowConfidencePackIds: DecisionPackId[];
  endingIds: string[];
  topStateKeys: string[];
}

interface SearchNode {
  run: RunState;
  score: number;
  path: string[];
  stateKey: string;
}

export function exploreReachabilityReport(
  options: ReachabilityOptions,
): ReachabilityReport {
  const content = options.content ?? loadContent();
  const contentHash = getContentHash(content);
  const context = createNoveltyContext();
  const eventKindById = new Map(
    content.events.map((event) => [event.id, event.kind] as const),
  );
  let frontier: SearchNode[] = [
    {
      run: createInitialRunState(),
      score: 0,
      path: [],
      stateKey: abstractRunStateKey(createInitialRunState()),
    },
  ];
  let exploredStates = 0;
  let repeatedTrayOverlap = 0;
  let repeatedTraySlots = 0;

  context.knownStateKeys.add(frontier[0]?.stateKey ?? "");

  for (let depthIndex = 0; depthIndex < options.depth; depthIndex += 1) {
    const candidates: SearchNode[] = [];

    for (const node of frontier) {
      if (node.run.status === "ended") {
        candidates.push(node);
        continue;
      }

      const tray = getAvailableDecisions(content.decisions, node.run);
      const mainTray = tray.filter((decision) => decision.group !== "exit");
      const previousTrayIds = new Set(node.run.lastOfferedDecisionIds);

      for (const decision of tray) {
        context.surfacedDecisionIds.add(decision.id);
        context.packIds.add(decision.pack);
      }

      for (const decision of mainTray) {
        if (previousTrayIds.has(decision.id)) {
          repeatedTrayOverlap += 1;
        }
      }

      repeatedTraySlots += mainTray.length;

      for (const selectedDecisionIds of buildDecisionBranches(
        tray,
        node.run,
        options.seed,
        depthIndex,
      )) {
        const nextRun = resolveRound({
          ...node.run,
          selectedDecisionIds,
        });
        const selectedDecisions = selectedDecisionIds
          .map((decisionId) =>
            content.decisions.find((decision) => decision.id === decisionId),
          )
          .filter((decision): decision is DecisionDefinition => Boolean(decision));
        const stateKey = abstractRunStateKey(nextRun);
        const triggeredEventIds = getTriggeredEventIds(nextRun);
        const packIds = selectedDecisions.map((decision) => decision.pack);
        const novelty = scoreNovelty(context, {
          stateKey,
          surfacedDecisionIds: tray.map((decision) => decision.id),
          selectedDecisionIds,
          triggeredEventIds,
          endingId: nextRun.endingId,
          packIds,
          flagIds: nextRun.flags,
        });

        for (const decisionId of selectedDecisionIds) {
          context.selectedDecisionIds.add(decisionId);
        }

        for (const eventId of triggeredEventIds) {
          context.triggeredEventIds.add(eventId);
        }

        for (const flag of nextRun.flags) {
          context.flagIds.add(flag);
        }

        if (nextRun.endingId) {
          context.endingIds.add(nextRun.endingId);
        }

        context.knownStateKeys.add(stateKey);
        candidates.push({
          run: nextRun,
          score: node.score + novelty,
          path: [...node.path, selectedDecisionIds.join("+") || "pass"],
          stateKey,
        });
        exploredStates += 1;
      }
    }

    frontier = candidates
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }

        return left.stateKey.localeCompare(right.stateKey);
      })
      .slice(0, options.width);

    if (frontier.every((node) => node.run.status === "ended")) {
      break;
    }
  }

  const delayedEvents = filterEventsByKind(
    context.triggeredEventIds,
    eventKindById,
    "delayed",
  );
  const packCoverage = buildPackCoverage(context.packIds, content);

  return {
    reportName: "V0.5 reachability explorer",
    contentHash,
    seed: options.seed,
    width: options.width,
    depth: options.depth,
    exploredStates,
    frontierStates: frontier.length,
    confidence: getConfidence(options, exploredStates),
    surfacedDecisionCoverage: buildCoverageStat(
      context.surfacedDecisionIds.size,
      content.decisions.length,
    ),
    selectedDecisionCoverage: buildCoverageStat(
      context.selectedDecisionIds.size,
      content.decisions.length,
    ),
    triggeredEventCoverage: buildCoverageStat(
      context.triggeredEventIds.size,
      content.events.length,
    ),
    delayedEventCoverage: buildCoverageStat(
      delayedEvents.size,
      content.events.filter((event) => event.kind === "delayed").length,
    ),
    hazardEventCoverage: buildCoverageStat(0, 0),
    endingCoverage: buildCoverageStat(context.endingIds.size, content.endings.length),
    packCoverage,
    flagCoverage: buildCoverageStat(
      context.flagIds.size,
      getKnownFlagIds(content).size,
    ),
    repeatedTrayPressure: buildRepeatedTrayPressure(
      repeatedTrayOverlap,
      repeatedTraySlots,
    ),
    lowConfidenceDecisionIds: content.decisions
      .filter((decision) => !context.surfacedDecisionIds.has(decision.id))
      .map((decision) => decision.id)
      .sort(),
    lowConfidenceEventIds: content.events
      .filter((event) => !context.triggeredEventIds.has(event.id))
      .map((event) => event.id)
      .sort(),
    lowConfidencePackIds: Object.entries(packCoverage)
      .filter(([, stat]) => stat.seen === 0)
      .map(([pack]) => pack as DecisionPackId)
      .sort(),
    endingIds: [...context.endingIds].sort(),
    topStateKeys: frontier.map((node) => node.stateKey).slice(0, 8),
  };
}

export function abstractRunState(run: RunState): AbstractRunState {
  return {
    status: run.status,
    endingId: run.endingId ?? "active",
    roundBucket: bucketRound(run.round),
    metricBuckets: Object.fromEntries(
      Object.entries(run.metrics).map(([metric, value]) => [
        metric,
        bucketMetric(metric as MetricKey, value),
      ]),
    ) as Record<MetricKey, string>,
    flags: [...run.flags].sort(),
  };
}

export function abstractRunStateKey(run: RunState): string {
  const abstracted = abstractRunState(run);
  const metricSignature = Object.entries(abstracted.metricBuckets)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([metric, bucket]) => `${metric}:${bucket}`)
    .join(",");

  return [
    abstracted.status,
    abstracted.endingId,
    abstracted.roundBucket,
    metricSignature,
    `flags:${abstracted.flags.join(",")}`,
  ].join("|");
}

export function scoreNovelty(
  context: NoveltyContext,
  candidate: CandidateNoveltyInput,
): number {
  let score = context.knownStateKeys.has(candidate.stateKey) ? 0 : 18;
  score += countNew(candidate.surfacedDecisionIds, context.surfacedDecisionIds) * 2;
  score += countNew(candidate.selectedDecisionIds, context.selectedDecisionIds) * 7;
  score += countNew(candidate.triggeredEventIds, context.triggeredEventIds) * 9;
  score += countNew(candidate.packIds, context.packIds) * 5;
  score += countNew(candidate.flagIds, context.flagIds) * 3;

  if (candidate.endingId && !context.endingIds.has(candidate.endingId)) {
    score += 24;
  }

  return score;
}

export function formatReachabilityReport(report: ReachabilityReport): string {
  const lines = [
    report.reportName,
    `Content hash: ${report.contentHash} | Seed: ${report.seed}`,
    `Width: ${report.width} | Depth: ${report.depth} | Explored states: ${report.exploredStates} | Frontier: ${report.frontierStates}`,
    `Confidence: ${report.confidence}`,
    "",
    `Surfaced decisions: ${formatCoverage(report.surfacedDecisionCoverage)}`,
    `Selected decisions: ${formatCoverage(report.selectedDecisionCoverage)}`,
    `Triggered events: ${formatCoverage(report.triggeredEventCoverage)}`,
    `Delayed events: ${formatCoverage(report.delayedEventCoverage)}`,
    `Hazard events: ${formatCoverage(report.hazardEventCoverage)}`,
    `Endings reached: ${formatCoverage(report.endingCoverage)} (${formatIdList(report.endingIds)})`,
    `Flags reached: ${formatCoverage(report.flagCoverage)}`,
    `Repeated-tray pressure: ${report.repeatedTrayPressure.overlapSlots}/${report.repeatedTrayPressure.totalSlots} (${formatPercentage(report.repeatedTrayPressure.percentage)})`,
    `Low-confidence decision ids: ${formatIdList(report.lowConfidenceDecisionIds.slice(0, 24))}`,
    `Low-confidence event ids: ${formatIdList(report.lowConfidenceEventIds.slice(0, 24))}`,
    `Low-confidence packs: ${formatIdList(report.lowConfidencePackIds)}`,
    "",
    "Top frontier abstractions:",
    ...report.topStateKeys.map((key) => `- ${key}`),
  ];

  return lines.join("\n");
}

function createNoveltyContext(): NoveltyContext {
  return {
    knownStateKeys: new Set(),
    surfacedDecisionIds: new Set(),
    selectedDecisionIds: new Set(),
    triggeredEventIds: new Set(),
    endingIds: new Set(),
    packIds: new Set(),
    flagIds: new Set(),
  };
}

function buildDecisionBranches(
  tray: DecisionDefinition[],
  run: RunState,
  seed: string,
  depthIndex: number,
): string[][] {
  const ranked = shuffleWithSeed(
    tray,
    hashNumber(hashString(seed), run.round, depthIndex, tray.length),
  )
    .slice(0, MAX_BRANCHING_TRAY)
    .sort((left, right) => scoreBranchDecision(right) - scoreBranchDecision(left));
  const branches: string[][] = [[]];

  for (const decision of ranked) {
    branches.push([decision.id]);
  }

  for (let left = 0; left < ranked.length; left += 1) {
    for (let right = left + 1; right < ranked.length; right += 1) {
      if (ranked[left]?.group === ranked[right]?.group) {
        continue;
      }

      branches.push([ranked[left]?.id, ranked[right]?.id].filter(Boolean));
    }
  }

  return branches.slice(0, MAX_BRANCHING_TRAY * 2);
}

function scoreBranchDecision(decision: DecisionDefinition): number {
  return (
    Object.values(decision.impacts).reduce(
      (sum, value) => sum + Math.abs(value),
      0,
    ) +
    decision.tags.length * 3 +
    (decision.ending ? 40 : 0)
  );
}

function getTriggeredEventIds(run: RunState): string[] {
  return Object.entries(run.eventCounts)
    .filter(([, count]) => count > 0)
    .map(([eventId]) => eventId);
}

function filterEventsByKind(
  eventIds: Set<string>,
  eventKindById: Map<string, EventDefinition["kind"]>,
  kind: EventDefinition["kind"],
): Set<string> {
  return new Set(
    [...eventIds].filter((eventId) => eventKindById.get(eventId) === kind),
  );
}

function buildPackCoverage(
  seenPacks: Set<string>,
  content: ContentBundle,
): Record<DecisionPackId, CoverageStat> {
  const packs = [...new Set(content.decisions.map((decision) => decision.pack))];

  return Object.fromEntries(
    packs.map((pack) => [pack, buildCoverageStat(seenPacks.has(pack) ? 1 : 0, 1)]),
  ) as Record<DecisionPackId, CoverageStat>;
}

function getKnownFlagIds(content: ContentBundle): Set<string> {
  const flags = new Set<string>();

  for (const decision of content.decisions) {
    for (const flag of decision.setsFlags ?? []) {
      flags.add(flag);
    }

    for (const flag of decision.requirements?.flagsAll ?? []) {
      flags.add(flag);
    }

    for (const flag of decision.requirements?.flagsNone ?? []) {
      flags.add(flag);
    }
  }

  for (const event of content.events) {
    for (const flag of event.setsFlags ?? []) {
      flags.add(flag);
    }

    for (const flag of event.requirements?.flagsAll ?? []) {
      flags.add(flag);
    }

    for (const flag of event.requirements?.flagsNone ?? []) {
      flags.add(flag);
    }
  }

  return flags;
}

function countNew(ids: Iterable<string>, known: Set<string>): number {
  let count = 0;

  for (const id of ids) {
    if (!known.has(id)) {
      count += 1;
    }
  }

  return count;
}

function bucketRound(round: number): string {
  if (round <= 4) {
    return "early";
  }

  if (round <= 12) {
    return "middle";
  }

  if (round <= 24) {
    return "late";
  }

  return "extended";
}

function bucketMetric(metric: MetricKey, value: number): string {
  if (metric === "airlineCash" || metric === "personalWealth") {
    if (value < 80) {
      return "scarce";
    }

    if (value < 260) {
      return "thin";
    }

    return "flush";
  }

  if (metric === "debt" || metric === "assetValue" || metric === "workforceSize") {
    if (value < 300) {
      return "low";
    }

    if (value < 800) {
      return "mid";
    }

    return "high";
  }

  if (value < 30) {
    return "low";
  }

  if (value < 60) {
    return "medium";
  }

  if (value < 80) {
    return "high";
  }

  return "extreme";
}

function getConfidence(
  options: ReachabilityOptions,
  exploredStates: number,
): ReachabilityReport["confidence"] {
  if (options.width >= 48 && options.depth >= 20 && exploredStates >= 400) {
    return "high";
  }

  if (options.width >= 16 && options.depth >= 12 && exploredStates >= 120) {
    return "medium";
  }

  return "low";
}

function formatCoverage(stat: CoverageStat): string {
  return `${stat.seen}/${stat.total} (${formatPercentage(stat.percentage)})`;
}

function formatIdList(ids: string[]): string {
  return ids.length === 0 ? "none" : ids.join(", ");
}

function parseArgs(argv: string[]): ReachabilityOptions {
  const options: ReachabilityOptions = {
    width: DEFAULT_WIDTH,
    depth: DEFAULT_DEPTH,
    seed: DEFAULT_SEED,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const width = getArgValue(argv, index, "--width");
    if (width !== null) {
      options.width = parsePositiveInteger(width, "width");
      index += argv[index] === "--width" ? 1 : 0;
      continue;
    }

    const depth = getArgValue(argv, index, "--depth");
    if (depth !== null) {
      options.depth = parsePositiveInteger(depth, "depth");
      index += argv[index] === "--depth" ? 1 : 0;
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
  const report = exploreReachabilityReport(parseArgs(argv));
  console.log(
    argv.includes("--json")
      ? JSON.stringify(report, null, 2)
      : formatReachabilityReport(report),
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main();
}
