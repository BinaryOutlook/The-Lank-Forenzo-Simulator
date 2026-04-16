import { hashNumber, hashString } from "../src/lib/random/seeded";
import { compileContentManifest, loadContent } from "../src/simulation/content";
import { getImpactSetScore } from "../src/simulation/state/metricSemantics";
import {
  createInitialRunState,
  resolveRound,
} from "../src/simulation/resolution/resolveRound";
import { getAvailableDecisions } from "../src/simulation/systems/decisionEngine";
import type {
  ContentBundle,
  DecisionDefinition,
  DecisionGroup,
  DecisionPackId,
  EventDefinition,
  EndingId,
  ImpactSet,
  MetricKey,
  RunMetrics,
  RunState,
} from "../src/simulation/state/types";

export interface CoverageStat {
  seen: number;
  total: number;
  percentage: number;
}

export interface RepeatedTrayPressure {
  overlapSlots: number;
  totalSlots: number;
  percentage: number;
}

export type ArchetypeId = "extraction" | "merger" | "offshore" | "stabilizer";

export interface ArchetypePolicy {
  id: ArchetypeId;
  label: string;
  description: string;
  groupWeights: Partial<Record<DecisionGroup, number>>;
  tagWeights: Record<string, number>;
  impactWeights: Partial<Record<MetricKey, number>>;
  pressureRelief: Partial<Record<MetricKey, number>>;
  exitBias: number;
  preferredEnding?: EndingId;
}

export interface SimulatedRunSummary {
  endingId: string;
  roundsPlayed: number;
  surfacedDecisionIds: Set<string>;
  selectedDecisionIds: Set<string>;
  triggeredEventIds: Set<string>;
  triggeredDelayedEventIds: Set<string>;
  triggeredHazardEventIds: Set<string>;
  surfacedPacks: Set<DecisionPackId>;
  finalFlags: Set<string>;
  repeatedTrayOverlap: number;
  repeatedTraySlots: number;
  finalRun: RunState;
}

export interface SimulateBotRunOptions {
  archetype: ArchetypePolicy;
  maxRounds: number;
  seed: string;
  runIndex: number;
  content?: ContentBundle;
}

export const archetypePolicies: ArchetypePolicy[] = [
  {
    id: "extraction",
    label: "Extraction bot",
    description:
      "Prioritizes personal wealth, asset harvests, and exit windows even when institutional pressure rises.",
    groupWeights: {
      extraction: 30,
      finance: 10,
      legal: 6,
      exit: 34,
    },
    tagWeights: {
      extraction: 16,
      asset_sale: 12,
      executive: 8,
      offshore: 6,
    },
    impactWeights: {
      personalWealth: 3.8,
      airlineCash: 0.6,
      offshoreReadiness: 0.7,
      legalHeat: -0.6,
      publicAnger: -0.4,
    },
    pressureRelief: {
      airlineCash: 0.4,
      creditorPatience: 0.2,
      legalHeat: -0.3,
    },
    exitBias: 46,
    preferredEnding: "extraction",
  },
  {
    id: "merger",
    label: "Merger bot",
    description:
      "Grooms the balance sheet and market story for a strategic transaction.",
    groupWeights: {
      finance: 16,
      market: 24,
      legal: 8,
      exit: 26,
    },
    tagWeights: {
      merger: 22,
      market: 12,
      board: 10,
      creditor: 8,
    },
    impactWeights: {
      marketConfidence: 2.2,
      stockPrice: 2.4,
      assetValue: 0.9,
      creditorPatience: 1.4,
      debt: -0.7,
      legalHeat: -0.8,
    },
    pressureRelief: {
      marketConfidence: 1.1,
      creditorPatience: 1.0,
      legalHeat: -0.7,
      publicAnger: -0.4,
    },
    exitBias: 30,
    preferredEnding: "merger",
  },
  {
    id: "offshore",
    label: "Offshore bot",
    description:
      "Builds escape readiness and legal insulation before taking an exit.",
    groupWeights: {
      extraction: 18,
      legal: 20,
      market: 4,
      exit: 32,
    },
    tagWeights: {
      offshore: 28,
      legal: 10,
      secrecy: 12,
      extraction: 10,
    },
    impactWeights: {
      offshoreReadiness: 3.4,
      legalHeat: -1.3,
      publicAnger: -0.9,
      personalWealth: 1.5,
      marketConfidence: 0.4,
    },
    pressureRelief: {
      legalHeat: -1.4,
      publicAnger: -1.0,
      creditorPatience: 0.3,
    },
    exitBias: 42,
    preferredEnding: "bahamas",
  },
  {
    id: "stabilizer",
    label: "Stabilizer bot",
    description:
      "Keeps the company alive by repairing safety, morale, cash, and creditor patience.",
    groupWeights: {
      operations: 22,
      labor: 18,
      finance: 14,
      legal: 10,
      exit: -8,
    },
    tagWeights: {
      safety: 18,
      labor: 12,
      operations: 12,
      creditor: 8,
      reform: 10,
    },
    impactWeights: {
      safetyIntegrity: 2.6,
      workforceMorale: 2.1,
      airlineCash: 0.9,
      creditorPatience: 1.8,
      legalHeat: -1.1,
      publicAnger: -1.0,
      marketConfidence: 0.8,
      personalWealth: -0.6,
    },
    pressureRelief: {
      airlineCash: 1.0,
      safetyIntegrity: 1.4,
      workforceMorale: 1.1,
      creditorPatience: 1.1,
      legalHeat: -1.3,
      publicAnger: -1.0,
    },
    exitBias: -12,
  },
];

export function getArchetypePolicy(id: ArchetypeId): ArchetypePolicy {
  const policy = archetypePolicies.find((entry) => entry.id === id);

  if (!policy) {
    throw new Error(`Unknown archetype policy "${id}".`);
  }

  return policy;
}

export function buildCoverageStat(seen: number, total: number): CoverageStat {
  return {
    seen,
    total,
    percentage: total === 0 ? 0 : seen / total,
  };
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function parsePositiveInteger(raw: string, label: string): number {
  const value = Number.parseInt(raw, 10);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(
      `Expected ${label} to be a positive integer, received "${raw}".`,
    );
  }

  return value;
}

export function getArgValue(
  argv: string[],
  index: number,
  name: string,
): string | null {
  const arg = argv[index];

  if (arg === name && argv[index + 1]) {
    return argv[index + 1] ?? null;
  }

  const prefix = `${name}=`;
  if (arg?.startsWith(prefix)) {
    return arg.slice(prefix.length);
  }

  return null;
}

export function getContentHash(content: ContentBundle = loadContent()): string {
  return compileContentManifest(content).contentHash;
}

export function simulateBotRun(
  options: SimulateBotRunOptions,
): SimulatedRunSummary {
  const content = options.content ?? loadContent();
  const eventKindById = new Map(
    content.events.map((event) => [event.id, event.kind] as const),
  );
  const seedValue = hashString(options.seed, options.archetype.id);
  let run: RunState = createInitialRunState();
  const surfacedDecisionIds = new Set<string>();
  const selectedDecisionIds = new Set<string>();
  const triggeredEventIds = new Set<string>();
  const surfacedPacks = new Set<DecisionPackId>();
  let repeatedTrayOverlap = 0;
  let repeatedTraySlots = 0;
  let previousMainTrayIds = new Set<string>();
  let roundsPlayed = 0;

  while (run.status === "active" && roundsPlayed < options.maxRounds) {
    const tray = getAvailableDecisions(content.decisions, run);
    const mainTray = tray.filter((decision) => decision.group !== "exit");
    const mainTrayIds = new Set(mainTray.map((decision) => decision.id));

    for (const decision of tray) {
      surfacedDecisionIds.add(decision.id);
      surfacedPacks.add(decision.pack);
    }

    for (const decision of mainTray) {
      if (previousMainTrayIds.has(decision.id)) {
        repeatedTrayOverlap += 1;
      }
    }

    repeatedTraySlots += mainTray.length;
    previousMainTrayIds = mainTrayIds;

    const chosenIds = chooseArchetypeDecisions(
      tray,
      run,
      options.archetype,
      seedValue,
      options.runIndex,
    );

    for (const decisionId of chosenIds) {
      selectedDecisionIds.add(decisionId);
    }

    run = resolveRound({
      ...run,
      selectedDecisionIds: chosenIds,
    });
    roundsPlayed += 1;
  }

  for (const [eventId, count] of Object.entries(run.eventCounts)) {
    if (count > 0) {
      triggeredEventIds.add(eventId);
    }
  }

  return {
    endingId: run.endingId ?? "active",
    roundsPlayed,
    surfacedDecisionIds,
    selectedDecisionIds,
    triggeredEventIds,
    triggeredDelayedEventIds: filterEventsByKind(
      triggeredEventIds,
      eventKindById,
      "delayed",
    ),
    triggeredHazardEventIds: new Set(),
    surfacedPacks,
    finalFlags: new Set(run.flags),
    repeatedTrayOverlap,
    repeatedTraySlots,
    finalRun: run,
  };
}

export function chooseArchetypeDecisions(
  tray: DecisionDefinition[],
  run: RunState,
  archetype: ArchetypePolicy,
  seedValue: number,
  runIndex: number,
): string[] {
  const scored = tray
    .map((decision) => ({
      decision,
      score: scoreArchetypeDecision(
        decision,
        run,
        archetype,
        seedValue,
        runIndex,
      ),
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.decision.id.localeCompare(right.decision.id);
    });

  if (scored.length === 0) {
    return [];
  }

  const chosen: DecisionDefinition[] = [scored[0].decision];
  const primaryGroup = scored[0].decision.group;

  for (const entry of scored.slice(1)) {
    if (chosen.length >= 2) {
      break;
    }

    const differentGroup = entry.decision.group !== primaryGroup;
    const isExit = entry.decision.group === "exit" || Boolean(entry.decision.ending);
    const worthwhile = entry.score >= 10 || (isExit && entry.score > 0);

    if (differentGroup && worthwhile) {
      chosen.push(entry.decision);
      break;
    }
  }

  return chosen.map((decision) => decision.id);
}

export function scoreArchetypeDecision(
  decision: DecisionDefinition,
  run: RunState,
  archetype: ArchetypePolicy,
  seedValue: number,
  runIndex: number,
): number {
  const baseScore = getImpactSetScore(decision.impacts) * 4;
  const groupScore = archetype.groupWeights[decision.group] ?? 0;
  const tagScore = decision.tags.reduce(
    (sum, tag) => sum + (archetype.tagWeights[tag] ?? 0),
    0,
  );
  const impactScore = scoreImpacts(decision.impacts, archetype.impactWeights);
  const pressureScore = scorePressureRelief(
    decision.impacts,
    run.metrics,
    archetype.pressureRelief,
  );
  const exitScore = getExitScore(decision, archetype);
  const jitter =
    hashNumber(seedValue, runIndex, run.round, hashString(decision.id)) % 997;

  return (
    baseScore +
    groupScore +
    tagScore +
    impactScore +
    pressureScore +
    exitScore +
    jitter / 1000
  );
}

function getExitScore(
  decision: DecisionDefinition,
  archetype: ArchetypePolicy,
): number {
  if (!decision.ending && decision.group !== "exit") {
    return 0;
  }

  if (!decision.ending || !archetype.preferredEnding) {
    return archetype.exitBias < 0 ? -1000 : archetype.exitBias;
  }

  return decision.ending === archetype.preferredEnding ? archetype.exitBias : -1000;
}

export function buildRepeatedTrayPressure(
  overlapSlots: number,
  totalSlots: number,
): RepeatedTrayPressure {
  return {
    overlapSlots,
    totalSlots,
    percentage: totalSlots === 0 ? 0 : overlapSlots / totalSlots,
  };
}

function scoreImpacts(
  impacts: ImpactSet,
  weights: Partial<Record<MetricKey, number>>,
): number {
  return Object.entries(impacts).reduce((sum, [metric, value]) => {
    const weight = weights[metric as MetricKey] ?? 0;
    return sum + value * weight;
  }, 0);
}

function scorePressureRelief(
  impacts: ImpactSet,
  metrics: RunMetrics,
  weights: Partial<Record<MetricKey, number>>,
): number {
  let score = 0;

  for (const [metric, weight] of Object.entries(weights)) {
    const key = metric as MetricKey;
    const impact = impacts[key] ?? 0;

    if (impact === 0) {
      continue;
    }

    const pressure = getMetricPressure(metrics, key);
    score += impact * weight * pressure;
  }

  return score;
}

function getMetricPressure(metrics: RunMetrics, metric: MetricKey): number {
  const value = metrics[metric];

  switch (metric) {
    case "airlineCash":
      return value < 200 ? 2 : value < 320 ? 1 : 0.4;
    case "debt":
      return value > 700 ? 2 : value > 560 ? 1 : 0.4;
    case "legalHeat":
    case "publicAnger":
      return value > 70 ? 2 : value > 45 ? 1.2 : 0.5;
    case "safetyIntegrity":
    case "workforceMorale":
    case "creditorPatience":
    case "marketConfidence":
      return value < 40 ? 2 : value < 58 ? 1.2 : 0.5;
    case "offshoreReadiness":
      return value < 55 ? 1.4 : 0.7;
    case "stockPrice":
      return value < 18 ? 1.3 : 0.6;
    default:
      return 0.7;
  }
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
