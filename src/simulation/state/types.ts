import type {
  consumableResourceKeys,
  decisionGroups,
  decisionPackIds,
  endingIds,
  eventKinds,
  hazardSourceFamilies,
  metricKeys,
} from "../content/metadata";
import type {
  DossierTheme,
  DossierThread,
} from "../dossiers/dossierState";
import type {
  FactionEffectSet,
  FactionStates,
} from "../factions/factionState.js";
import type { NetworkState } from "../operations/networkState";
import type { EventSchedulerState } from "../scheduler/eventScheduler";

export type ThemeName = "earth" | "armonk-blue";

export type MetricKey = (typeof metricKeys)[number];

export type ConsumableResourceKey = (typeof consumableResourceKeys)[number];

export type EndingId = (typeof endingIds)[number];

export type DecisionGroup = (typeof decisionGroups)[number];

export type DecisionPackId = (typeof decisionPackIds)[number];

export type EventKind = (typeof eventKinds)[number];

export type HazardSourceFamily = (typeof hazardSourceFamilies)[number];

export interface RunMetrics {
  airlineCash: number;
  personalWealth: number;
  debt: number;
  assetValue: number;
  workforceSize: number;
  workforceMorale: number;
  marketConfidence: number;
  creditorPatience: number;
  legalHeat: number;
  safetyIntegrity: number;
  publicAnger: number;
  stockPrice: number;
  offshoreReadiness: number;
}

export type ConsumableResources = Record<ConsumableResourceKey, number>;

export type ImpactSet = Partial<Record<MetricKey, number>>;

export type ResourceCostSet = Partial<Record<ConsumableResourceKey, number>>;

export interface DossierEvidenceDefinition {
  theme: DossierTheme;
  weight: number;
  witness?: string;
  detail?: string;
}

export interface OperationEffectSet {
  maintenanceBacklog?: number;
  contractorDependence?: number;
  crewFatigue?: number;
  serviceDisruption?: number;
  hubFragility?: Record<string, number>;
  routeFragility?: Record<string, number>;
  weatherExposure?: number;
}

export interface RequirementSpec {
  roundAtLeast?: number;
  roundAtMost?: number;
  metricMin?: Partial<Record<MetricKey, number>>;
  metricMax?: Partial<Record<MetricKey, number>>;
  flagsAll?: string[];
  flagsNone?: string[];
}

export interface DelayedConsequenceRef {
  delay: number;
  eventId?: string;
  eventIds?: string[];
}

export interface DecisionDefinition {
  id: string;
  pack: DecisionPackId;
  title: string;
  summary: string;
  group: DecisionGroup;
  tags: string[];
  impacts: ImpactSet;
  resourceCosts?: ResourceCostSet;
  evidence?: DossierEvidenceDefinition[];
  operationEffects?: OperationEffectSet;
  requirements?: RequirementSpec;
  delayedConsequences?: DelayedConsequenceRef[];
  setsFlags?: string[];
  factionEffects?: FactionEffectSet;
  ending?: EndingId;
}

export interface EventDefinition {
  id: string;
  kind: EventKind;
  title: string;
  body: string;
  weight: number;
  tags: string[];
  impacts: ImpactSet;
  evidence?: DossierEvidenceDefinition[];
  requirements?: RequirementSpec;
  setsFlags?: string[];
  factionEffects?: FactionEffectSet;
}

export interface EndingDefinition {
  id: EndingId;
  title: string;
  subtitle: string;
  summary: string;
}

export interface HazardDefinition {
  id: string;
  eventId: string;
  baseWeight: number;
  cooldownRounds: number;
  requirements: RequirementSpec;
  sourceFamily: HazardSourceFamily;
  explanation: string;
}

export interface PendingEvent {
  eventId: string;
  triggerRound: number;
}

export interface HistoryEntry {
  id: string;
  round: number;
  source: "decision" | "event" | "system" | "faction" | "operation" | "dossier";
  title: string;
  body: string;
  tone: "positive" | "negative" | "neutral";
  sourceLabel?: string;
  sourceKind?: string;
  factionId?: string;
  operationId?: string;
  dossierTheme?: string;
  scheduledEventId?: string;
  cause?: string;
}

export interface BoardSignal {
  title: string;
  body: string;
}

export interface RecapItem {
  title: string;
  body: string;
}

export interface RunRecap {
  headline: string;
  factions: RecapItem[];
  operations: RecapItem[];
  dossiers: RecapItem[];
  missedExitWindows: RecapItem[];
  criticalChains: RecapItem[];
}

export interface RunState {
  status: "active" | "ended";
  round: number;
  contentVersion?: string;
  contentHash?: string;
  metrics: RunMetrics;
  resources: ConsumableResources;
  selectedDecisionIds: string[];
  lastOfferedDecisionIds: string[];
  pendingEvents: PendingEvent[];
  scheduler?: EventSchedulerState;
  factions?: FactionStates;
  operations?: NetworkState;
  dossiers?: DossierThread[];
  systemSignals?: BoardSignal[];
  recap?: RunRecap | null;
  flags: string[];
  history: HistoryEntry[];
  endingId: EndingId | null;
  eventCounts: Record<string, number>;
}

export interface ContentBundle {
  decisions: DecisionDefinition[];
  events: EventDefinition[];
  hazards: HazardDefinition[];
  endings: EndingDefinition[];
}

export const boundedMetricKeys: MetricKey[] = [
  "workforceMorale",
  "marketConfidence",
  "creditorPatience",
  "legalHeat",
  "safetyIntegrity",
  "publicAnger",
  "offshoreReadiness",
];

export const moneyMetricKeys: MetricKey[] = [
  "airlineCash",
  "personalWealth",
  "debt",
  "assetValue",
];
