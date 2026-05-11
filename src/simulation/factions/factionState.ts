import type { ImpactSet } from "../state/types";
import type { DossierTheme } from "../dossiers/dossierState";

export const factionIds = [
  "board",
  "creditors",
  "labor",
  "regulators",
  "press",
] as const;

export type FactionId =
  | "board"
  | "creditors"
  | "labor"
  | "regulators"
  | "press";

export const factionIntentFamilies = [
  "pressure",
  "negotiate",
  "leak",
  "investigate",
  "organize",
  "defect",
  "shield",
  "replace",
] as const;

export type FactionIntentFamily = (typeof factionIntentFamilies)[number];

export const factionBehaviorPatterns = [
  "labor_abuse",
  "safety_denial",
  "offshore_behavior",
  "board_shielding",
  "creditor_stress",
] as const;

export type FactionBehaviorPattern = (typeof factionBehaviorPatterns)[number];

export type FactionBehaviorMemory = Partial<
  Record<FactionBehaviorPattern, number>
>;

export type FactionFamilyCounts = Partial<Record<FactionIntentFamily, number>>;

export interface FactionIntentMemory {
  cooldowns: Partial<Record<FactionIntentFamily, number>>;
  familyCounts: FactionFamilyCounts;
  lastFamily: FactionIntentFamily | null;
  lastRound: number | null;
  consecutiveCount: number;
}

export interface FactionIntentScore {
  urgency: number;
  leverage: number;
  evidence: number;
  cooldown: number;
  total: number;
}

export interface FactionCurrentIntent {
  id: string;
  family: FactionIntentFamily;
  round: number;
  urgency: number;
  rationale: string;
  score: FactionIntentScore;
}

export interface FactionState {
  id: FactionId;
  patience: number;
  aggression: number;
  trust: number;
  cohesion: number;
  leverage: number;
  dossierWeight: number;
  recentGrievances: string[];
  currentIntent: FactionCurrentIntent | null;
  intentMemory: FactionIntentMemory;
  behaviorMemory: FactionBehaviorMemory;
  lastIntentId?: string;
}

export type FactionStates = Record<FactionId, FactionState>;

export interface FactionIntent {
  id: string;
  factionId: FactionId;
  family: FactionIntentFamily;
  urgency: number;
  rationale: string;
  score: FactionIntentScore;
  metricImpacts?: ImpactSet;
}

export type FactionEvidenceHints = Partial<Record<DossierTheme, number>>;

export type FactionStateOverrides = Partial<
  Record<FactionId, Partial<Omit<FactionState, "id">>>
>;

const DEFAULT_FACTIONS: FactionStates = {
  board: {
    id: "board",
    patience: 62,
    aggression: 18,
    trust: 58,
    cohesion: 64,
    leverage: 54,
    dossierWeight: 10,
    recentGrievances: [],
    currentIntent: null,
    intentMemory: createEmptyIntentMemory(),
    behaviorMemory: {},
  },
  creditors: {
    id: "creditors",
    patience: 56,
    aggression: 32,
    trust: 42,
    cohesion: 58,
    leverage: 58,
    dossierWeight: 12,
    recentGrievances: [],
    currentIntent: null,
    intentMemory: createEmptyIntentMemory(),
    behaviorMemory: {},
  },
  labor: {
    id: "labor",
    patience: 48,
    aggression: 34,
    trust: 28,
    cohesion: 42,
    leverage: 35,
    dossierWeight: 8,
    recentGrievances: [],
    currentIntent: null,
    intentMemory: createEmptyIntentMemory(),
    behaviorMemory: {},
  },
  regulators: {
    id: "regulators",
    patience: 52,
    aggression: 30,
    trust: 34,
    cohesion: 50,
    leverage: 44,
    dossierWeight: 16,
    recentGrievances: [],
    currentIntent: null,
    intentMemory: createEmptyIntentMemory(),
    behaviorMemory: {},
  },
  press: {
    id: "press",
    patience: 44,
    aggression: 36,
    trust: 26,
    cohesion: 46,
    leverage: 42,
    dossierWeight: 14,
    recentGrievances: [],
    currentIntent: null,
    intentMemory: createEmptyIntentMemory(),
    behaviorMemory: {},
  },
};

export function createInitialFactionStates(
  overrides: FactionStateOverrides = {},
): FactionStates {
  return {
    board: applyOverride(DEFAULT_FACTIONS.board, overrides.board),
    creditors: applyOverride(DEFAULT_FACTIONS.creditors, overrides.creditors),
    labor: applyOverride(DEFAULT_FACTIONS.labor, overrides.labor),
    regulators: applyOverride(
      DEFAULT_FACTIONS.regulators,
      overrides.regulators,
    ),
    press: applyOverride(DEFAULT_FACTIONS.press, overrides.press),
  };
}

export function createEmptyIntentMemory(): FactionIntentMemory {
  return {
    cooldowns: {},
    familyCounts: {},
    lastFamily: null,
    lastRound: null,
    consecutiveCount: 0,
  };
}

export function coerceFactionStates(value: unknown): FactionStates {
  return createInitialFactionStates({
    board: coerceFactionOverride(value, "board"),
    creditors: coerceFactionOverride(value, "creditors"),
    labor: coerceFactionOverride(value, "labor"),
    regulators: coerceFactionOverride(value, "regulators"),
    press: coerceFactionOverride(value, "press"),
  });
}

function applyOverride(
  faction: FactionState,
  override: Partial<Omit<FactionState, "id">> | undefined,
): FactionState {
  const merged: FactionState = {
    ...faction,
    ...override,
    id: faction.id,
    recentGrievances: [
      ...(override?.recentGrievances ?? faction.recentGrievances),
    ],
    currentIntent: cloneCurrentIntent(
      override?.currentIntent ?? faction.currentIntent,
    ),
    intentMemory: cloneIntentMemory(
      override?.intentMemory ?? faction.intentMemory,
    ),
    behaviorMemory: { ...(override?.behaviorMemory ?? faction.behaviorMemory) },
  };

  return merged;
}

function coerceFactionOverride(
  value: unknown,
  factionId: FactionId,
): Partial<Omit<FactionState, "id">> | undefined {
  const candidate = getFactionCandidate(value, factionId);

  if (!isRecord(candidate)) {
    return undefined;
  }

  const fallback = DEFAULT_FACTIONS[factionId];

  return {
    patience: readNumber(candidate, "patience", fallback.patience),
    aggression: readNumber(candidate, "aggression", fallback.aggression),
    trust: readNumber(candidate, "trust", fallback.trust),
    cohesion: readNumber(candidate, "cohesion", fallback.cohesion),
    leverage: readNumber(candidate, "leverage", fallback.leverage),
    dossierWeight: readNumber(
      candidate,
      "dossierWeight",
      fallback.dossierWeight,
    ),
    recentGrievances: readStringArray(
      candidate,
      "recentGrievances",
      fallback.recentGrievances,
    ),
    currentIntent: coerceCurrentIntent(candidate.currentIntent),
    intentMemory: coerceIntentMemory(candidate.intentMemory),
    behaviorMemory: coerceBehaviorMemory(candidate.behaviorMemory),
    lastIntentId:
      typeof candidate.lastIntentId === "string"
        ? candidate.lastIntentId
        : undefined,
  };
}

function getFactionCandidate(value: unknown, factionId: FactionId): unknown {
  if (Array.isArray(value)) {
    return value.find((entry) => isFactionRecord(entry, factionId));
  }

  if (isRecord(value)) {
    return value[factionId];
  }

  return undefined;
}

function isFactionRecord(value: unknown, factionId: FactionId): boolean {
  return isRecord(value) && value.id === factionId;
}

function coerceCurrentIntent(value: unknown): FactionCurrentIntent | null {
  if (!isRecord(value) || !isFactionIntentFamily(value.family)) {
    return null;
  }

  const round = readNumber(value, "round", 0);
  const urgency = readNumber(value, "urgency", 0);
  const id = typeof value.id === "string" ? value.id : `intent-${value.family}`;
  const rationale =
    typeof value.rationale === "string"
      ? value.rationale
      : "Stored faction intent.";

  return {
    id,
    family: value.family,
    round,
    urgency,
    rationale,
    score: coerceIntentScore(value.score, urgency),
  };
}

function coerceIntentMemory(value: unknown): FactionIntentMemory {
  if (!isRecord(value)) {
    return createEmptyIntentMemory();
  }

  return {
    cooldowns: coerceFamilyNumberRecord(value.cooldowns),
    familyCounts: coerceFamilyNumberRecord(value.familyCounts),
    lastFamily: isFactionIntentFamily(value.lastFamily)
      ? value.lastFamily
      : null,
    lastRound: typeof value.lastRound === "number" ? value.lastRound : null,
    consecutiveCount: readNumber(value, "consecutiveCount", 0),
  };
}

function cloneCurrentIntent(
  currentIntent: FactionCurrentIntent | null,
): FactionCurrentIntent | null {
  if (!currentIntent) {
    return null;
  }

  return {
    ...currentIntent,
    score: { ...currentIntent.score },
  };
}

function cloneIntentMemory(
  intentMemory: FactionIntentMemory,
): FactionIntentMemory {
  return {
    cooldowns: { ...intentMemory.cooldowns },
    familyCounts: { ...intentMemory.familyCounts },
    lastFamily: intentMemory.lastFamily,
    lastRound: intentMemory.lastRound,
    consecutiveCount: intentMemory.consecutiveCount,
  };
}

function coerceIntentScore(
  value: unknown,
  fallbackTotal: number,
): FactionIntentScore {
  if (!isRecord(value)) {
    return {
      urgency: fallbackTotal,
      leverage: 0,
      evidence: 0,
      cooldown: 0,
      total: fallbackTotal,
    };
  }

  return {
    urgency: readNumber(value, "urgency", fallbackTotal),
    leverage: readNumber(value, "leverage", 0),
    evidence: readNumber(value, "evidence", 0),
    cooldown: readNumber(value, "cooldown", 0),
    total: readNumber(value, "total", fallbackTotal),
  };
}

function coerceFamilyNumberRecord(value: unknown): FactionFamilyCounts {
  const record: FactionFamilyCounts = {};

  if (!isRecord(value)) {
    return record;
  }

  for (const family of factionIntentFamilies) {
    const familyValue = value[family];

    if (typeof familyValue === "number" && Number.isFinite(familyValue)) {
      record[family] = familyValue;
    }
  }

  return record;
}

function coerceBehaviorMemory(value: unknown): FactionBehaviorMemory {
  const memory: FactionBehaviorMemory = {};

  if (!isRecord(value)) {
    return memory;
  }

  for (const pattern of factionBehaviorPatterns) {
    const patternValue = value[pattern];

    if (typeof patternValue === "number" && Number.isFinite(patternValue)) {
      memory[pattern] = patternValue;
    }
  }

  return memory;
}

function readNumber(
  record: Record<string, unknown>,
  key: string,
  fallback: number,
): number {
  const value = record[key];

  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readStringArray(
  record: Record<string, unknown>,
  key: string,
  fallback: string[],
): string[] {
  const value = record[key];

  if (!Array.isArray(value)) {
    return [...fallback];
  }

  return value.filter((entry): entry is string => typeof entry === "string");
}

function isFactionIntentFamily(value: unknown): value is FactionIntentFamily {
  return (
    typeof value === "string" &&
    factionIntentFamilies.includes(value as FactionIntentFamily)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
