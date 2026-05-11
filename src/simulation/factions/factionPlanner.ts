import type { ImpactSet, RunMetrics } from "../state/types";
import {
  coerceFactionStates,
  createEmptyIntentMemory,
  type FactionBehaviorMemory,
  type FactionBehaviorPattern,
  type FactionCurrentIntent,
  type FactionId,
  type FactionIntent,
  type FactionIntentFamily,
  type FactionIntentMemory,
  type FactionIntentScore,
  type FactionState,
  type FactionStates,
} from "./factionState";

export interface FactionUpdateInput {
  metrics: RunMetrics;
  selectedDecisionIds: string[];
  emittedEventIds: string[];
  flags?: string[];
  evidenceHints?: Partial<Record<string, number>>;
}

export interface FactionPlanningInput {
  metrics: RunMetrics;
  round: number;
}

export interface FactionIntentMemoryInput {
  intents: FactionIntent[];
  round: number;
}

interface IntentCandidate {
  family: FactionIntentFamily;
  urgency: number;
  leverage: number;
  evidence: number;
  reasons: string[];
  metricImpacts?: ImpactSet;
}

interface ScoredIntentCandidate extends IntentCandidate {
  score: FactionIntentScore;
}

const INTENT_THRESHOLD = 48;
const FAMILY_PRIORITY: Record<FactionIntentFamily, number> = {
  replace: 0,
  defect: 1,
  pressure: 2,
  investigate: 3,
  leak: 4,
  organize: 5,
  shield: 6,
  negotiate: 7,
};

export function updateFactionStates(
  current: FactionStates,
  input: FactionUpdateInput,
): FactionStates {
  const factions = coerceFactionStates(current);

  return {
    board: updateBoard(factions.board, input),
    creditors: updateCreditors(factions.creditors, input),
    labor: updateLabor(factions.labor, input),
    regulators: updateRegulators(factions.regulators, input),
    press: updatePress(factions.press, input),
  };
}

export function planFactionIntents(
  factions: FactionStates,
  input: FactionPlanningInput,
): FactionIntent[] {
  const normalized = coerceFactionStates(factions);

  return (Object.keys(normalized) as FactionId[])
    .map((factionId) => planFactionIntent(normalized[factionId], input))
    .filter((intent): intent is FactionIntent => Boolean(intent));
}

export function rememberFactionIntents(
  current: FactionStates,
  input: FactionIntentMemoryInput,
): FactionStates {
  const factions = coerceFactionStates(current);
  const intentByFaction = new Map(
    input.intents.map((intent) => [intent.factionId, intent]),
  );

  return {
    board: rememberFactionIntent(
      factions.board,
      intentByFaction.get("board"),
      input.round,
    ),
    creditors: rememberFactionIntent(
      factions.creditors,
      intentByFaction.get("creditors"),
      input.round,
    ),
    labor: rememberFactionIntent(
      factions.labor,
      intentByFaction.get("labor"),
      input.round,
    ),
    regulators: rememberFactionIntent(
      factions.regulators,
      intentByFaction.get("regulators"),
      input.round,
    ),
    press: rememberFactionIntent(
      factions.press,
      intentByFaction.get("press"),
      input.round,
    ),
  };
}

function updateBoard(
  faction: FactionState,
  input: FactionUpdateInput,
): FactionState {
  const confidenceBonus = input.metrics.marketConfidence >= 60 ? 3 : -2;
  const heatPenalty = input.metrics.legalHeat >= 70 ? 5 : 0;
  const boardSignals = collectMatchingSignals(input, [
    "board",
    "director",
    "merger",
    "cash_out",
    "nassau",
    "offshore",
    "stock",
  ]);
  const riskyExitSignals = collectMatchingSignals(input, [
    "cash_out",
    "nassau",
    "offshore",
    "customs",
    "nominee",
    "correspondent",
  ]);
  const offshoreEvidence = input.evidenceHints?.offshore_evasion ?? 0;
  const offshoreObserved =
    riskyExitSignals.length > 0 || offshoreEvidence > 0 ? 1 : 0;
  const boardShieldingObserved =
    riskyExitSignals.length === 0 &&
    (boardSignals.length > 0 ||
      (input.metrics.marketConfidence >= 64 &&
        input.metrics.stockPrice >= 28 &&
        input.metrics.legalHeat < 58))
      ? 1
      : 0;

  return clampFaction({
    ...faction,
    patience: faction.patience - riskyExitSignals.length * 2,
    aggression: faction.aggression + riskyExitSignals.length * 3,
    trust: faction.trust + confidenceBonus - heatPenalty + boardSignals.length,
    leverage: faction.leverage + (input.metrics.stockPrice >= 28 ? 3 : 0),
    dossierWeight:
      faction.dossierWeight +
      (input.evidenceHints?.insider_trading ?? 0) * 0.2 +
      offshoreEvidence * 0.25 +
      riskyExitSignals.length * 2,
    recentGrievances: mergeRecentGrievances(
      faction.recentGrievances,
      riskyExitSignals,
    ),
    behaviorMemory: incrementBehaviorMemory(faction.behaviorMemory, {
      offshore_behavior: offshoreObserved,
      board_shielding: boardShieldingObserved,
    }),
  });
}

function updateCreditors(
  faction: FactionState,
  input: FactionUpdateInput,
): FactionState {
  const cashStress = input.metrics.airlineCash < 120 ? 8 : 0;
  const debtStress = input.metrics.debt > 720 ? 6 : 0;
  const creditorSignals = collectMatchingSignals(input, [
    "creditor",
    "covenant",
    "debt",
    "lender",
    "vendor",
    "reserve",
  ]);
  const creditorStressObserved =
    cashStress > 0 || debtStress > 0 || creditorSignals.length > 0 ? 1 : 0;

  return clampFaction({
    ...faction,
    patience:
      faction.patience - cashStress - debtStress - creditorSignals.length * 3,
    aggression:
      faction.aggression + cashStress + debtStress + creditorSignals.length * 4,
    leverage:
      faction.leverage +
      (input.metrics.creditorPatience < 35 ? 6 : 0) +
      creditorSignals.length * 2,
    recentGrievances: mergeRecentGrievances(
      faction.recentGrievances,
      creditorSignals,
    ),
    behaviorMemory: incrementBehaviorMemory(faction.behaviorMemory, {
      creditor_stress: creditorStressObserved,
    }),
  });
}

function updateLabor(
  faction: FactionState,
  input: FactionUpdateInput,
): FactionState {
  const laborEvidence = input.evidenceHints?.labor_abuse ?? 0;
  const laborSignals = collectMatchingSignals(input, [
    "labor",
    "scope",
    "seniority",
    "severance",
    "contractor",
    "headcount",
    "promise",
    "union",
  ]);
  const grievanceSources =
    input.metrics.workforceMorale < 42 ||
    laborEvidence > 0 ||
    laborSignals.length > 0
      ? [...input.selectedDecisionIds, ...input.emittedEventIds]
      : [];
  const laborAbuseObserved =
    input.metrics.workforceMorale < 42 ||
    laborEvidence > 0 ||
    laborSignals.length > 0
      ? 1
      : 0;

  return clampFaction({
    ...faction,
    patience: faction.patience - (input.metrics.workforceMorale < 42 ? 8 : 0),
    aggression:
      faction.aggression +
      (input.metrics.workforceMorale < 42 ? 12 : 0) +
      laborEvidence,
    cohesion:
      faction.cohesion +
      (input.metrics.publicAnger >= 50 ? 8 : 0) +
      Math.round(laborEvidence / 3),
    leverage:
      faction.leverage +
      (input.metrics.publicAnger >= 50 ? 6 : 0) +
      Math.round(laborEvidence / 4),
    dossierWeight: faction.dossierWeight + laborEvidence,
    recentGrievances: mergeRecentGrievances(
      faction.recentGrievances,
      grievanceSources,
    ),
    behaviorMemory: incrementBehaviorMemory(faction.behaviorMemory, {
      labor_abuse: laborAbuseObserved,
    }),
  });
}

function updateRegulators(
  faction: FactionState,
  input: FactionUpdateInput,
): FactionState {
  const evidence =
    (input.evidenceHints?.maintenance_fraud ?? 0) +
    (input.evidenceHints?.regulatory_capture ?? 0);
  const heatStress = input.metrics.legalHeat >= 58 ? 8 : 0;
  const regulatorSignals = collectMatchingSignals(input, [
    "inspection",
    "maintenance",
    "safety",
    "audit",
    "faa",
    "regulatory",
    "hearing",
    "vendor",
  ]);
  const safetyDenialObserved =
    evidence > 0 ||
    regulatorSignals.length > 0 ||
    input.metrics.safetyIntegrity < 45
      ? 1
      : 0;

  return clampFaction({
    ...faction,
    patience: faction.patience - regulatorSignals.length * 2,
    aggression:
      faction.aggression +
      heatStress +
      Math.round(evidence / 2) +
      regulatorSignals.length * 3,
    leverage:
      faction.leverage +
      (input.metrics.safetyIntegrity < 50 ? 8 : 0) +
      regulatorSignals.length * 2,
    dossierWeight:
      faction.dossierWeight + evidence + regulatorSignals.length * 3,
    recentGrievances: mergeRecentGrievances(
      faction.recentGrievances,
      regulatorSignals,
    ),
    behaviorMemory: incrementBehaviorMemory(faction.behaviorMemory, {
      safety_denial: safetyDenialObserved,
    }),
  });
}

function updatePress(
  faction: FactionState,
  input: FactionUpdateInput,
): FactionState {
  const insiderEvidence = input.evidenceHints?.insider_trading ?? 0;
  const offshoreEvidence = input.evidenceHints?.offshore_evasion ?? 0;
  const laborEvidence = input.evidenceHints?.labor_abuse ?? 0;
  const evidence = insiderEvidence + offshoreEvidence + laborEvidence;
  const pressSignals = collectMatchingSignals(input, [
    "leak",
    "deck",
    "press",
    "tv",
    "public",
    "compensation",
    "offshore",
    "inspection",
    "customs",
    "nassau",
  ]);
  const offshoreObserved =
    offshoreEvidence > 0 || pressSignals.length > 0 ? 1 : 0;
  const laborObserved = laborEvidence > 0 ? 1 : 0;

  return clampFaction({
    ...faction,
    aggression:
      faction.aggression +
      (input.metrics.publicAnger >= 55 ? 9 : 0) +
      pressSignals.length * 4,
    leverage:
      faction.leverage + Math.round(evidence / 3) + pressSignals.length * 3,
    dossierWeight: faction.dossierWeight + evidence + pressSignals.length * 3,
    recentGrievances: mergeRecentGrievances(
      faction.recentGrievances,
      pressSignals,
    ),
    behaviorMemory: incrementBehaviorMemory(faction.behaviorMemory, {
      offshore_behavior: offshoreObserved,
      labor_abuse: laborObserved,
    }),
  });
}

function planFactionIntent(
  faction: FactionState,
  input: FactionPlanningInput,
): FactionIntent | null {
  const [bestCandidate] = buildIntentCandidates(faction, input.metrics)
    .map((candidate) => scoreCandidate(faction, candidate, input.round))
    .filter((candidate) => candidate.score.total >= INTENT_THRESHOLD)
    .sort(compareCandidates);

  if (!bestCandidate) {
    return null;
  }

  return buildIntent(faction, bestCandidate, input.round);
}

function buildIntentCandidates(
  faction: FactionState,
  metrics: RunMetrics,
): IntentCandidate[] {
  switch (faction.id) {
    case "board":
      return buildBoardCandidates(faction, metrics);
    case "creditors":
      return buildCreditorCandidates(faction, metrics);
    case "labor":
      return buildLaborCandidates(faction, metrics);
    case "regulators":
      return buildRegulatorCandidates(faction, metrics);
    case "press":
      return buildPressCandidates(faction, metrics);
  }
}

function buildBoardCandidates(
  faction: FactionState,
  metrics: RunMetrics,
): IntentCandidate[] {
  const offshoreCount = getBehaviorCount(faction, "offshore_behavior");
  const shieldCount = getBehaviorCount(faction, "board_shielding");
  const candidates: IntentCandidate[] = [];

  candidates.push({
    family: "shield",
    urgency:
      10 +
      Math.max(0, faction.trust - 60) * 0.7 +
      Math.max(0, metrics.marketConfidence - 55) * 0.5 +
      (metrics.stockPrice >= 28 ? 5 : 0),
    leverage: faction.leverage * 0.3 + faction.cohesion * 0.08,
    evidence: shieldCount * 4 + (metrics.legalHeat < 55 ? 4 : 0),
    reasons: [
      "market confidence gives directors cover",
      "board leverage can absorb a hostile read",
    ],
    metricImpacts: {
      marketConfidence: 3,
      stockPrice: 1,
      legalHeat: -1,
    },
  });

  if (
    offshoreCount >= 1 ||
    faction.dossierWeight >= 28 ||
    faction.aggression >= 45
  ) {
    candidates.push({
      family: "replace",
      urgency:
        12 +
        faction.aggression * 0.25 +
        offshoreCount * 10 +
        (metrics.legalHeat >= 55 ? 8 : 0),
      leverage:
        faction.leverage * 0.25 + Math.max(0, 100 - faction.trust) * 0.1,
      evidence: faction.dossierWeight * 0.3 + offshoreCount * 10,
      reasons: [
        `${offshoreCount} repeated offshore behavior signal${offshoreCount === 1 ? "" : "s"}`,
        "directors can threaten succession instead of shielding",
      ],
      metricImpacts: {
        marketConfidence: -5,
        stockPrice: -2,
        publicAnger: 2,
      },
    });
  }

  return candidates;
}

function buildCreditorCandidates(
  faction: FactionState,
  metrics: RunMetrics,
): IntentCandidate[] {
  const stressCount = getBehaviorCount(faction, "creditor_stress");
  const pressureReasons = [
    "cash discipline looks fragile",
    "lender leverage is available this quarter",
  ];
  const candidates: IntentCandidate[] = [
    {
      family: "pressure",
      urgency:
        8 +
        faction.aggression * 0.25 +
        Math.max(0, 40 - metrics.creditorPatience) * 0.5 +
        (metrics.airlineCash < 140 ? 8 : 0) +
        (metrics.debt > 720 ? 6 : 0),
      leverage: faction.leverage * 0.3,
      evidence: stressCount * 5 + Math.max(0, 45 - faction.patience) * 0.25,
      reasons: pressureReasons,
      metricImpacts: {
        airlineCash: -8,
        creditorPatience: -4,
        marketConfidence: -2,
      },
    },
  ];

  if (faction.trust >= 50 && metrics.creditorPatience >= 40) {
    candidates.push({
      family: "negotiate",
      urgency: 8 + faction.trust * 0.2 + metrics.creditorPatience * 0.15,
      leverage: faction.leverage * 0.15,
      evidence: Math.max(0, 70 - metrics.debt / 12),
      reasons: ["creditors still believe a controlled amendment can pay"],
      metricImpacts: {
        creditorPatience: 2,
        marketConfidence: 1,
      },
    });
  }

  return candidates;
}

function buildLaborCandidates(
  faction: FactionState,
  metrics: RunMetrics,
): IntentCandidate[] {
  const abuseCount = getBehaviorCount(faction, "labor_abuse");
  const candidates: IntentCandidate[] = [
    {
      family: "organize",
      urgency:
        12 +
        faction.aggression * 0.35 +
        Math.max(0, 42 - metrics.workforceMorale) * 0.6 +
        Math.max(0, faction.cohesion - 45) * 0.3,
      leverage: faction.cohesion * 0.25 + faction.leverage * 0.15,
      evidence: faction.dossierWeight * 0.2 + abuseCount * 3,
      reasons: [
        "workforce morale is low enough to coordinate",
        `${abuseCount} repeated labor abuse signal${abuseCount === 1 ? "" : "s"}`,
      ],
      metricImpacts: {
        workforceMorale: -4,
        publicAnger: 5,
      },
    },
  ];

  if (abuseCount >= 2 || faction.aggression >= 72) {
    candidates.push({
      family: "defect",
      urgency:
        10 +
        faction.aggression * 0.25 +
        Math.max(0, 45 - metrics.workforceMorale) * 0.7 +
        abuseCount * 10,
      leverage: faction.cohesion * 0.25 + faction.leverage * 0.2,
      evidence: faction.dossierWeight * 0.25 + abuseCount * 7,
      reasons: [
        `${abuseCount} repeated labor abuse signals make quiet organizing insufficient`,
        "crews now have enough cohesion to disrupt execution",
      ],
      metricImpacts: {
        airlineCash: -10,
        workforceMorale: -6,
        safetyIntegrity: -3,
        publicAnger: 6,
      },
    });
  }

  return candidates;
}

function buildRegulatorCandidates(
  faction: FactionState,
  metrics: RunMetrics,
): IntentCandidate[] {
  const denialCount = getBehaviorCount(faction, "safety_denial");
  const candidates: IntentCandidate[] = [
    {
      family: "investigate",
      urgency:
        10 +
        faction.aggression * 0.3 +
        (metrics.legalHeat >= 60 ? 12 : 0) +
        Math.max(0, 50 - metrics.safetyIntegrity) * 0.5,
      leverage: faction.leverage * 0.2,
      evidence: faction.dossierWeight * 0.35 + denialCount * 4,
      reasons: [
        "legal heat makes the file easier to open",
        `${denialCount} repeated safety denial signal${denialCount === 1 ? "" : "s"}`,
      ],
      metricImpacts: {
        legalHeat: 4,
        marketConfidence: -2,
      },
    },
  ];

  if (denialCount >= 2 || metrics.safetyIntegrity <= 34) {
    candidates.push({
      family: "pressure",
      urgency:
        12 +
        faction.aggression * 0.25 +
        Math.max(0, 55 - metrics.safetyIntegrity) * 0.6 +
        denialCount * 9,
      leverage: faction.leverage * 0.28,
      evidence: faction.dossierWeight * 0.3 + denialCount * 8,
      reasons: [
        `${denialCount} repeated safety denial signals justify enforcement pressure`,
        "inspection leverage is stronger than another quiet inquiry",
      ],
      metricImpacts: {
        airlineCash: -6,
        legalHeat: 5,
        marketConfidence: -3,
      },
    });
  }

  return candidates;
}

function buildPressCandidates(
  faction: FactionState,
  metrics: RunMetrics,
): IntentCandidate[] {
  const offshoreCount = getBehaviorCount(faction, "offshore_behavior");
  const laborCount = getBehaviorCount(faction, "labor_abuse");

  return [
    {
      family: "leak",
      urgency:
        8 +
        faction.aggression * 0.25 +
        Math.max(0, metrics.publicAnger - 45) * 0.4 +
        (metrics.offshoreReadiness >= 30 ? 6 : 0) +
        offshoreCount * 5,
      leverage: faction.leverage * 0.28,
      evidence:
        faction.dossierWeight * 0.3 + offshoreCount * 8 + laborCount * 4,
      reasons: [
        `${offshoreCount} repeated offshore behavior signal${offshoreCount === 1 ? "" : "s"}`,
        "public records now have enough hooks for a leak",
      ],
      metricImpacts: {
        publicAnger: 5,
        marketConfidence: -4,
        legalHeat: 2,
      },
    },
  ];
}

function scoreCandidate(
  faction: FactionState,
  candidate: IntentCandidate,
  round: number,
): ScoredIntentCandidate {
  const urgency = clampNumber(Math.round(candidate.urgency), 0, 60);
  const leverage = clampNumber(Math.round(candidate.leverage), 0, 40);
  const evidence = clampNumber(Math.round(candidate.evidence), 0, 50);
  const cooldown = getCooldownPenalty(
    faction.intentMemory,
    candidate.family,
    round,
  );
  const total = clampNumber(urgency + leverage + evidence - cooldown, 0, 100);

  return {
    ...candidate,
    score: {
      urgency,
      leverage,
      evidence,
      cooldown,
      total,
    },
  };
}

function compareCandidates(
  left: ScoredIntentCandidate,
  right: ScoredIntentCandidate,
): number {
  if (right.score.total !== left.score.total) {
    return right.score.total - left.score.total;
  }

  return FAMILY_PRIORITY[left.family] - FAMILY_PRIORITY[right.family];
}

function buildIntent(
  faction: FactionState,
  candidate: ScoredIntentCandidate,
  round: number,
): FactionIntent {
  return {
    id: `${faction.id}-${candidate.family}-${round}`,
    factionId: faction.id,
    family: candidate.family,
    urgency: candidate.score.total,
    rationale: buildRationale(faction, candidate),
    score: candidate.score,
    metricImpacts: candidate.metricImpacts,
  };
}

function buildRationale(
  faction: FactionState,
  candidate: ScoredIntentCandidate,
): string {
  const reasonText = candidate.reasons.join("; ");

  return `${formatFactionName(faction.id)} favors ${candidate.family} because ${reasonText}. Score urgency ${candidate.score.urgency}, leverage ${candidate.score.leverage}, evidence ${candidate.score.evidence}, cooldown ${candidate.score.cooldown}.`;
}

function rememberFactionIntent(
  faction: FactionState,
  intent: FactionIntent | undefined,
  round: number,
): FactionState {
  if (!intent) {
    return {
      ...faction,
      currentIntent: null,
      intentMemory: pruneExpiredCooldowns(faction.intentMemory, round),
    };
  }

  const previousMemory = faction.intentMemory ?? createEmptyIntentMemory();
  const familyCounts = {
    ...previousMemory.familyCounts,
    [intent.family]: (previousMemory.familyCounts[intent.family] ?? 0) + 1,
  };
  const consecutiveCount =
    previousMemory.lastFamily === intent.family
      ? previousMemory.consecutiveCount + 1
      : 1;
  const cooldowns = {
    ...previousMemory.cooldowns,
    [intent.family]:
      round + getIntentCooldownLength(intent.family, consecutiveCount),
  };
  const currentIntent: FactionCurrentIntent = {
    id: intent.id,
    family: intent.family,
    round,
    urgency: intent.urgency,
    rationale: intent.rationale,
    score: { ...intent.score },
  };

  return {
    ...faction,
    currentIntent,
    lastIntentId: intent.id,
    intentMemory: {
      cooldowns,
      familyCounts,
      lastFamily: intent.family,
      lastRound: round,
      consecutiveCount,
    },
  };
}

function getIntentCooldownLength(
  family: FactionIntentFamily,
  consecutiveCount: number,
): number {
  const repeatExtension = Math.max(0, consecutiveCount - 1);

  if (family === "shield" || family === "negotiate") {
    return 1 + repeatExtension;
  }

  if (family === "replace" || family === "defect") {
    return 3 + repeatExtension;
  }

  return 2 + repeatExtension;
}

function getCooldownPenalty(
  memory: FactionIntentMemory,
  family: FactionIntentFamily,
  round: number,
): number {
  const cooldownUntilRound = memory.cooldowns[family] ?? 0;

  if (cooldownUntilRound < round) {
    return 0;
  }

  return 28 + Math.max(0, cooldownUntilRound - round) * 4;
}

function pruneExpiredCooldowns(
  memory: FactionIntentMemory,
  round: number,
): FactionIntentMemory {
  const cooldowns: Partial<Record<FactionIntentFamily, number>> = {};

  for (const [family, cooldownUntilRound] of Object.entries(memory.cooldowns)) {
    if (typeof cooldownUntilRound === "number" && cooldownUntilRound >= round) {
      cooldowns[family as FactionIntentFamily] = cooldownUntilRound;
    }
  }

  return {
    ...memory,
    cooldowns,
  };
}

function getBehaviorCount(
  faction: FactionState,
  pattern: FactionBehaviorPattern,
): number {
  return faction.behaviorMemory[pattern] ?? 0;
}

function incrementBehaviorMemory(
  current: FactionBehaviorMemory,
  increments: Partial<Record<FactionBehaviorPattern, number>>,
): FactionBehaviorMemory {
  const next: FactionBehaviorMemory = { ...current };

  for (const [pattern, amount] of Object.entries(increments)) {
    if (!amount) {
      continue;
    }

    const key = pattern as FactionBehaviorPattern;
    next[key] = clampNumber(Math.round((next[key] ?? 0) + amount), 0, 99);
  }

  return next;
}

function mergeRecentGrievances(current: string[], next: string[]): string[] {
  return [...new Set([...current, ...next])].slice(-8);
}

function collectMatchingSignals(
  input: FactionUpdateInput,
  needles: string[],
): string[] {
  return [
    ...input.selectedDecisionIds,
    ...input.emittedEventIds,
    ...(input.flags ?? []),
  ].filter((id) => needles.some((needle) => id.includes(needle)));
}

function clampFaction(faction: FactionState): FactionState {
  return {
    ...faction,
    patience: clampNumber(Math.round(faction.patience), 0, 100),
    aggression: clampNumber(Math.round(faction.aggression), 0, 100),
    trust: clampNumber(Math.round(faction.trust), 0, 100),
    cohesion: clampNumber(Math.round(faction.cohesion), 0, 100),
    leverage: clampNumber(Math.round(faction.leverage), 0, 100),
    dossierWeight: clampNumber(Math.round(faction.dossierWeight), 0, 100),
  };
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function formatFactionName(factionId: FactionId): string {
  return factionId.charAt(0).toUpperCase() + factionId.slice(1);
}
