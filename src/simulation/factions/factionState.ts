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

export type FactionIntentFamily =
  | "pressure"
  | "negotiate"
  | "leak"
  | "investigate"
  | "organize"
  | "defect"
  | "shield"
  | "replace";

export interface FactionState {
  id: FactionId;
  patience: number;
  aggression: number;
  trust: number;
  cohesion: number;
  leverage: number;
  dossierWeight: number;
  recentGrievances: string[];
  lastIntentId?: string;
}

export type FactionStates = Record<FactionId, FactionState>;

export interface FactionIntent {
  id: string;
  factionId: FactionId;
  family: FactionIntentFamily;
  urgency: number;
  rationale: string;
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
  },
};

export function createInitialFactionStates(
  overrides: FactionStateOverrides = {},
): FactionStates {
  return {
    board: applyOverride(DEFAULT_FACTIONS.board, overrides.board),
    creditors: applyOverride(DEFAULT_FACTIONS.creditors, overrides.creditors),
    labor: applyOverride(DEFAULT_FACTIONS.labor, overrides.labor),
    regulators: applyOverride(DEFAULT_FACTIONS.regulators, overrides.regulators),
    press: applyOverride(DEFAULT_FACTIONS.press, overrides.press),
  };
}

function applyOverride(
  faction: FactionState,
  override: Partial<Omit<FactionState, "id">> | undefined,
): FactionState {
  return {
    ...faction,
    recentGrievances: [...(override?.recentGrievances ?? faction.recentGrievances)],
    ...override,
    id: faction.id,
  };
}
