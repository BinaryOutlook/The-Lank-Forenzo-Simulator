import { hashNumber, hashString } from "../src/lib/random/seeded";
import { compileContentManifest, loadContent } from "../src/simulation/content";
import { getImpactSetScore } from "../src/simulation/state/metricSemantics";
import {
  createInitialRunState,
  resolveRound,
} from "../src/simulation/resolution/resolveRound";
import {
  getAvailableDecisions,
  isDecisionEligible,
} from "../src/simulation/systems/decisionEngine";
import {
  canAffordResourceCosts,
  getDecisionSelectionCost,
} from "../src/simulation/systems/consumables.js";
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

export type ArchetypeId =
  | "extraction"
  | "merger"
  | "offshore"
  | "stabilizer"
  | "safety-denial"
  | "shadow-subsidiary"
  | "creditor-trench"
  | "regulatory-theatre";

export interface ArchetypePolicy {
  id: ArchetypeId;
  label: string;
  description: string;
  groupWeights: Partial<Record<DecisionGroup, number>>;
  packWeights?: Partial<Record<DecisionPackId, number>>;
  diagnosticPacks?: DecisionPackId[];
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
  selectedDecisionSequence: string[];
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
    packWeights: {
      executiveEscape: 24,
      assetHarvest: 12,
      marketTheater: 8,
    },
    diagnosticPacks: ["executiveEscape", "marketTheater"],
    tagWeights: {
      extraction: 16,
      stock: -8,
      market: 14,
      personal: 18,
      asset_sale: 8,
      executive: 8,
      offshore: 4,
      timing: -60,
      merger: -30,
      shell: -16,
      subsidiary: -12,
    },
    impactWeights: {
      personalWealth: 4.2,
      airlineCash: 0.6,
      offshoreReadiness: 0.4,
      marketConfidence: 2.4,
      stockPrice: 2.6,
      legalHeat: -2.2,
      publicAnger: -0.6,
    },
    pressureRelief: {
      airlineCash: 0.4,
      marketConfidence: 1.2,
      stockPrice: 1.2,
      creditorPatience: 0.2,
      legalHeat: -1.5,
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
      bahamas: 40,
      escape: 24,
      offshore: 28,
      legal: 10,
      secrecy: 12,
      extraction: 10,
      merger: -36,
      shell: -32,
      subsidiary: -24,
    },
    impactWeights: {
      offshoreReadiness: 5,
      legalHeat: -1.6,
      publicAnger: -0.9,
      personalWealth: 2.2,
      marketConfidence: 0.2,
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
      paperwork: -20,
      spin: -18,
      cuts: -14,
      deferments: -14,
      quality: -12,
      contractors: -8,
      parts: -8,
      training: -8,
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
  {
    id: "safety-denial",
    label: "Safety-denial bot",
    description:
      "Converts maintenance drift into cash while preferring paperwork, deferments, and contractor blame over real safety repair.",
    groupWeights: {
      operations: 30,
      legal: 12,
      market: 4,
      finance: 4,
      exit: -18,
    },
    packWeights: {
      safetyDenial: 42,
      regulatoryTheater: 8,
    },
    diagnosticPacks: ["safetyDenial"],
    tagWeights: {
      safety: 18,
      maintenance: 12,
      paperwork: 10,
      contractors: 8,
      fleet: 6,
      parts: 7,
      training: 7,
      cuts: 12,
      deferments: 12,
      quality: 8,
      spin: 5,
    },
    impactWeights: {
      airlineCash: 1.2,
      safetyIntegrity: -3.5,
      workforceMorale: -0.6,
      legalHeat: 0.4,
      publicAnger: -0.2,
      marketConfidence: 0.3,
      personalWealth: 0.2,
    },
    pressureRelief: {
      airlineCash: 1.2,
      legalHeat: -0.3,
      publicAnger: -0.2,
    },
    exitBias: -24,
  },
  {
    id: "shadow-subsidiary",
    label: "Shadow-subsidiary bot",
    description:
      "Builds shell-carrier optionality and then routes labor, liabilities, and growth through the subsidiary lane.",
    groupWeights: {
      operations: 22,
      labor: 22,
      finance: 18,
      market: 16,
      legal: 6,
      exit: -14,
    },
    packWeights: {
      shadowSubsidiaries: 46,
      laborShock: 8,
      marketTheater: 6,
    },
    diagnosticPacks: ["shadowSubsidiaries"],
    tagWeights: {
      shell: 30,
      subsidiary: 22,
      growth: 8,
      labor: 12,
      flying: 10,
      pensions: 8,
      finance: 8,
      brand: 6,
      "wet-lease": 10,
      liability: 10,
      rehire: 10,
      integration: 6,
    },
    impactWeights: {
      airlineCash: 1.1,
      marketConfidence: 0.9,
      stockPrice: 0.7,
      debt: -0.5,
      workforceMorale: -1.2,
      publicAnger: -0.3,
      legalHeat: 0.3,
      creditorPatience: 0.2,
    },
    pressureRelief: {
      airlineCash: 0.9,
      marketConfidence: 0.6,
      creditorPatience: 0.3,
    },
    exitBias: -16,
  },
  {
    id: "creditor-trench",
    label: "Creditor trench bot",
    description:
      "Fights the debt stack directly, preferring covenant pressure, lender intimidation, and restructuring brinkmanship.",
    groupWeights: {
      finance: 32,
      legal: 16,
      market: 8,
      operations: 2,
      exit: -10,
    },
    packWeights: {
      creditorWarfare: 40,
      mergerBait: 6,
      core: 4,
    },
    diagnosticPacks: ["creditorWarfare"],
    tagWeights: {
      creditors: 24,
      debt: 18,
      restructuring: 14,
      threats: 12,
      dip: 10,
      capital: 8,
      venue: 8,
      risk: 8,
      finance: 6,
      vendors: 5,
      lessors: 5,
    },
    impactWeights: {
      airlineCash: 1.2,
      debt: -1.9,
      creditorPatience: -2.6,
      legalHeat: 0.4,
      marketConfidence: 0.6,
      stockPrice: 0.3,
      publicAnger: -0.2,
    },
    pressureRelief: {
      airlineCash: 1.2,
      debt: -1.1,
      creditorPatience: 0.2,
      legalHeat: -0.4,
    },
    exitBias: -8,
  },
  {
    id: "regulatory-theatre",
    label: "Regulatory theatre bot",
    description:
      "Buys calendar time with reform optics, managed compliance, hearings, concessions, and regulator-facing narrative control.",
    groupWeights: {
      legal: 30,
      market: 18,
      operations: 10,
      finance: 4,
      exit: -20,
    },
    packWeights: {
      regulatoryTheater: 42,
      safetyDenial: 6,
      marketTheater: 6,
    },
    diagnosticPacks: ["regulatoryTheater"],
    tagWeights: {
      regulators: 28,
      legal: 10,
      optics: 16,
      review: 12,
      spin: 8,
      jobs: 7,
      press: 5,
      compliance: 14,
      paperwork: 8,
      hearing: 12,
      concessions: 8,
      inspection: 10,
      consent: 12,
      delay: 8,
      reform: 12,
      board: 4,
      safety: 4,
    },
    impactWeights: {
      legalHeat: -2.5,
      marketConfidence: 1.3,
      creditorPatience: 1.0,
      publicAnger: -1.0,
      safetyIntegrity: 0.5,
      stockPrice: 0.4,
      airlineCash: -0.2,
    },
    pressureRelief: {
      legalHeat: -1.8,
      publicAnger: -1.1,
      marketConfidence: 0.8,
      creditorPatience: 0.7,
      safetyIntegrity: 0.4,
    },
    exitBias: -20,
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
  const hazardRuleIds = new Set(content.hazards.map((hazard) => hazard.id));
  const seedValue = hashString(options.seed, options.archetype.id);
  let run: RunState = createInitialRunState();
  const surfacedDecisionIds = new Set<string>();
  const selectedDecisionIds = new Set<string>();
  const selectedDecisionSequence: string[] = [];
  const triggeredEventIds = new Set<string>();
  const surfacedPacks = new Set<DecisionPackId>();
  let repeatedTrayOverlap = 0;
  let repeatedTraySlots = 0;
  let previousMainTrayIds = new Set<string>();
  let roundsPlayed = 0;

  while (run.status === "active" && roundsPlayed < options.maxRounds) {
    const tray = buildArchetypeDiagnosticTray(
      getAvailableDecisions(content.decisions, run),
      content.decisions,
      run,
      options.archetype,
      seedValue,
      options.runIndex,
    );
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
    selectedDecisionSequence.push(...chosenIds);

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
    selectedDecisionSequence,
    triggeredEventIds,
    triggeredDelayedEventIds: filterEventsByKind(
      triggeredEventIds,
      eventKindById,
      "delayed",
    ),
    triggeredHazardEventIds: new Set(
      Object.keys(run.scheduler?.cooldowns ?? {}).filter((hazardId) =>
        hazardRuleIds.has(hazardId),
      ),
    ),
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

  const primary = scored.find((entry) =>
    canAffordResourceCosts(
      run.resources,
      getDecisionSelectionCost([entry.decision]),
    ),
  );

  if (!primary) {
    return [];
  }

  const chosen: DecisionDefinition[] = [primary.decision];
  const primaryGroup = primary.decision.group;

  for (const entry of scored) {
    if (chosen.length >= 2) {
      break;
    }

    if (entry.decision.id === primary.decision.id) {
      continue;
    }

    const differentGroup = entry.decision.group !== primaryGroup;
    const isExit =
      entry.decision.group === "exit" || Boolean(entry.decision.ending);
    const worthwhile = entry.score >= 10 || (isExit && entry.score > 0);
    const affordable = canAffordResourceCosts(
      run.resources,
      getDecisionSelectionCost([...chosen, entry.decision]),
    );

    if (differentGroup && worthwhile && affordable) {
      chosen.push(entry.decision);
      break;
    }
  }

  return chosen.map((decision) => decision.id);
}

function buildArchetypeDiagnosticTray(
  baseTray: DecisionDefinition[],
  decisions: DecisionDefinition[],
  run: RunState,
  archetype: ArchetypePolicy,
  seedValue: number,
  runIndex: number,
): DecisionDefinition[] {
  const diagnosticPacks = archetype.diagnosticPacks ?? [];

  if (diagnosticPacks.length === 0) {
    return baseTray;
  }

  const tray = [...baseTray];
  const offeredIds = new Set(tray.map((decision) => decision.id));

  for (const pack of diagnosticPacks) {
    if (tray.some((decision) => decision.pack === pack)) {
      continue;
    }

    const [bestCandidate] = decisions
      .filter(
        (decision) =>
          decision.pack === pack &&
          !offeredIds.has(decision.id) &&
          isDecisionEligible(decision, run) &&
          canAffordResourceCosts(
            run.resources,
            getDecisionSelectionCost([decision]),
          ),
      )
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

    if (bestCandidate) {
      tray.push(bestCandidate.decision);
      offeredIds.add(bestCandidate.decision.id);
    }
  }

  return tray;
}

export function scoreArchetypeDecision(
  decision: DecisionDefinition,
  run: RunState,
  archetype: ArchetypePolicy,
  seedValue: number,
  runIndex: number,
): number {
  const baseScore = getImpactSetScore(decision.impacts) * 4;
  const groupScore = scoreGroupAffinity(decision, archetype);
  const tagScore = scoreTagAffinity(decision, archetype);
  const packScore = scorePackAffinity(decision, archetype);
  const impactScore = scoreImpacts(decision.impacts, archetype.impactWeights);
  const setupScore = scorePreferredExitSetup(decision, run, archetype);
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
    packScore +
    impactScore +
    setupScore +
    pressureScore +
    exitScore +
    jitter / 1000
  );
}

function scoreGroupAffinity(
  decision: DecisionDefinition,
  archetype: ArchetypePolicy,
): number {
  return archetype.groupWeights[decision.group] ?? 0;
}

function scoreTagAffinity(
  decision: DecisionDefinition,
  archetype: ArchetypePolicy,
): number {
  return decision.tags.reduce(
    (sum, tag) => sum + (archetype.tagWeights[tag] ?? 0),
    0,
  );
}

function scorePackAffinity(
  decision: DecisionDefinition,
  archetype: ArchetypePolicy,
): number {
  return archetype.packWeights?.[decision.pack] ?? 0;
}

function scorePreferredExitSetup(
  decision: DecisionDefinition,
  run: RunState,
  archetype: ArchetypePolicy,
): number {
  if (archetype.preferredEnding !== "extraction") {
    return 0;
  }

  const marketAfter =
    run.metrics.marketConfidence + (decision.impacts.marketConfidence ?? 0);
  const stockAfter = run.metrics.stockPrice + (decision.impacts.stockPrice ?? 0);
  const heatAfter = run.metrics.legalHeat + (decision.impacts.legalHeat ?? 0);

  if (
    decision.tags.includes("timing") &&
    decision.tags.includes("stock") &&
    marketAfter >= 65 &&
    stockAfter >= 28 &&
    heatAfter <= 74
  ) {
    return 72;
  }

  const confidenceDamage = Math.min(0, marketAfter - 65);
  const stockDamage = Math.min(0, stockAfter - 28);
  const heatOverage = Math.max(0, heatAfter - 74);

  return confidenceDamage * 2 + stockDamage * 2.4 - heatOverage * 4;
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
