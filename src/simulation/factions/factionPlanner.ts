import type { RunMetrics } from "../state/types";
import type {
  FactionEffect,
  FactionEffectSource,
  FactionId,
  FactionIntent,
  FactionIntentFamily,
  FactionState,
  FactionStates,
} from "./factionState";

const emptyExplicitSourceIds = new Set<string>();
const explicitSourceIdsCache = new WeakMap<FactionUpdateInput, Set<string>>();

export interface FactionUpdateInput {
  metrics: RunMetrics;
  selectedDecisionIds: string[];
  emittedEventIds: string[];
  flags?: string[];
  evidenceHints?: Partial<Record<string, number>>;
  factionEffectSources?: FactionEffectSource[];
}

export interface FactionPlanningInput {
  metrics: RunMetrics;
  round: number;
}

export function updateFactionStates(
  current: FactionStates,
  input: FactionUpdateInput,
): FactionStates {
  return {
    board: updateBoard(current.board, input),
    creditors: updateCreditors(current.creditors, input),
    labor: updateLabor(current.labor, input),
    regulators: updateRegulators(current.regulators, input),
    press: updatePress(current.press, input),
  };
}

export function planFactionIntents(
  factions: FactionStates,
  input: FactionPlanningInput,
): FactionIntent[] {
  return (Object.keys(factions) as FactionId[])
    .map((factionId) => planFactionIntent(factions[factionId], input))
    .filter((intent): intent is FactionIntent => Boolean(intent));
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
  ]);

  const updated = {
    ...faction,
    patience: faction.patience - riskyExitSignals.length * 2,
    aggression: faction.aggression + riskyExitSignals.length * 3,
    trust: faction.trust + confidenceBonus - heatPenalty + boardSignals.length,
    leverage: faction.leverage + (input.metrics.stockPrice >= 28 ? 3 : 0),
    dossierWeight:
      faction.dossierWeight +
      (input.evidenceHints?.insider_trading ?? 0) * 0.2 +
      riskyExitSignals.length * 2,
    recentGrievances: mergeRecentGrievances(
      faction.recentGrievances,
      riskyExitSignals,
    ),
  };

  return clampFaction(applyExplicitFactionEffects(updated, input));
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

  const updated = {
    ...faction,
    patience: faction.patience - cashStress - debtStress - creditorSignals.length * 3,
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
  };

  return clampFaction(applyExplicitFactionEffects(updated, input));
}

function updateLabor(
  faction: FactionState,
  input: FactionUpdateInput,
): FactionState {
  const laborEvidence = input.evidenceHints?.labor_abuse ?? 0;
  const grievanceSources =
    input.metrics.workforceMorale < 42 || laborEvidence > 0
      ? collectLegacySourceIds(input)
      : [];

  const updated = {
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
  };

  return clampFaction(applyExplicitFactionEffects(updated, input));
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
  ]);

  const updated = {
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
    dossierWeight: faction.dossierWeight + evidence + regulatorSignals.length * 3,
    recentGrievances: mergeRecentGrievances(
      faction.recentGrievances,
      regulatorSignals,
    ),
  };

  return clampFaction(applyExplicitFactionEffects(updated, input));
}

function updatePress(
  faction: FactionState,
  input: FactionUpdateInput,
): FactionState {
  const evidence =
    (input.evidenceHints?.insider_trading ?? 0) +
    (input.evidenceHints?.offshore_evasion ?? 0) +
    (input.evidenceHints?.labor_abuse ?? 0);
  const pressSignals = collectMatchingSignals(input, [
    "leak",
    "deck",
    "press",
    "tv",
    "public",
    "compensation",
    "offshore",
    "inspection",
  ]);

  const updated = {
    ...faction,
    aggression:
      faction.aggression +
      (input.metrics.publicAnger >= 55 ? 9 : 0) +
      pressSignals.length * 4,
    leverage: faction.leverage + Math.round(evidence / 3) + pressSignals.length * 3,
    dossierWeight: faction.dossierWeight + evidence + pressSignals.length * 3,
    recentGrievances: mergeRecentGrievances(
      faction.recentGrievances,
      pressSignals,
    ),
  };

  return clampFaction(applyExplicitFactionEffects(updated, input));
}

function planFactionIntent(
  faction: FactionState,
  input: FactionPlanningInput,
): FactionIntent | null {
  if (
    faction.id === "board" &&
    faction.trust >= 70 &&
    faction.leverage >= 60 &&
    input.metrics.marketConfidence >= 60
  ) {
    return buildIntent(faction, "shield", input.round, faction.trust);
  }

  if (
    faction.id === "creditors" &&
    (faction.patience <= 25 || input.metrics.creditorPatience <= 30)
  ) {
    return buildIntent(faction, "pressure", input.round, faction.aggression);
  }

  if (
    faction.id === "labor" &&
    (faction.aggression >= 55 ||
      faction.cohesion >= 65 ||
      input.metrics.workforceMorale < 40)
  ) {
    return buildIntent(faction, "organize", input.round, faction.aggression);
  }

  if (
    faction.id === "regulators" &&
    (faction.aggression >= 55 ||
      faction.dossierWeight >= 45 ||
      input.metrics.legalHeat >= 60)
  ) {
    return buildIntent(
      faction,
      "investigate",
      input.round,
      faction.dossierWeight + faction.aggression / 2,
    );
  }

  if (
    faction.id === "press" &&
    (faction.aggression >= 60 ||
      faction.leverage >= 70 ||
      faction.dossierWeight >= 40)
  ) {
    return buildIntent(faction, "leak", input.round, faction.leverage);
  }

  return null;
}

function buildIntent(
  faction: FactionState,
  family: FactionIntentFamily,
  round: number,
  urgency: number,
): FactionIntent {
  return {
    id: `${faction.id}-${family}-${round}`,
    factionId: faction.id,
    family,
    urgency: clampNumber(Math.round(urgency), 0, 100),
    rationale: `${faction.id} posture supports ${family}.`,
  };
}

function mergeRecentGrievances(
  current: string[],
  next: string[],
): string[] {
  return [...new Set([...current, ...next])].slice(-8);
}

function collectMatchingSignals(
  input: FactionUpdateInput,
  needles: string[],
): string[] {
  const explicitSourceIds = collectExplicitSourceIds(input);
  const hasExplicitSources = explicitSourceIds.size > 0;

  return [
    ...input.selectedDecisionIds,
    ...input.emittedEventIds,
    ...(input.flags ?? []),
  ].filter(
    (id) =>
      (!hasExplicitSources || !explicitSourceIds.has(id)) &&
      needles.some((needle) => id.includes(needle)),
  );
}

function collectLegacySourceIds(input: FactionUpdateInput): string[] {
  const explicitSourceIds = collectExplicitSourceIds(input);
  const sourceIds = [...input.selectedDecisionIds, ...input.emittedEventIds];

  if (explicitSourceIds.size === 0) {
    return sourceIds;
  }

  return sourceIds.filter((id) => !explicitSourceIds.has(id));
}

function collectExplicitSourceIds(input: FactionUpdateInput): Set<string> {
  if (!input.factionEffectSources?.length) {
    return emptyExplicitSourceIds;
  }

  const cached = explicitSourceIdsCache.get(input);

  if (cached) {
    return cached;
  }

  const sourceIds = new Set(
    input.factionEffectSources.map((source) => source.sourceId),
  );
  explicitSourceIdsCache.set(input, sourceIds);

  return sourceIds;
}

function applyExplicitFactionEffects(
  faction: FactionState,
  input: FactionUpdateInput,
): FactionState {
  if (!input.factionEffectSources?.length) {
    return faction;
  }

  let next = faction;
  const grievances: string[] = [];

  for (const source of input.factionEffectSources) {
    const effect = source.effects[faction.id];

    if (!effect) {
      continue;
    }

    next = applyFactionEffect(next, effect);

    if (effect.grievance) {
      grievances.push(`${source.sourceId}: ${effect.grievance}`);
    }
  }

  if (grievances.length === 0) {
    return next;
  }

  return {
    ...next,
    recentGrievances: mergeRecentGrievances(next.recentGrievances, grievances),
  };
}

function applyFactionEffect(
  faction: FactionState,
  effect: FactionEffect,
): FactionState {
  return {
    ...faction,
    patience: faction.patience + (effect.patience ?? 0),
    aggression: faction.aggression + (effect.aggression ?? 0),
    trust: faction.trust + (effect.trust ?? 0),
    cohesion: faction.cohesion + (effect.cohesion ?? 0),
    leverage: faction.leverage + (effect.leverage ?? 0),
    dossierWeight: faction.dossierWeight + (effect.dossierWeight ?? 0),
  };
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
