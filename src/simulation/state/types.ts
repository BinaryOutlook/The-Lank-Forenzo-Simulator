export type ThemeName = "earth" | "armonk-blue";

export type MetricKey =
  | "airlineCash"
  | "personalWealth"
  | "debt"
  | "assetValue"
  | "workforceSize"
  | "workforceMorale"
  | "marketConfidence"
  | "creditorPatience"
  | "legalHeat"
  | "safetyIntegrity"
  | "publicAnger"
  | "stockPrice"
  | "offshoreReadiness";

export type EndingId = "prison" | "forcedRemoval" | "merger" | "extraction" | "bahamas";

export type DecisionGroup =
  | "labor"
  | "finance"
  | "operations"
  | "market"
  | "legal"
  | "extraction"
  | "exit";

export type EventKind = "ambient" | "delayed";

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

export type ImpactSet = Partial<Record<MetricKey, number>>;

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
  title: string;
  summary: string;
  group: DecisionGroup;
  tags: string[];
  impacts: ImpactSet;
  requirements?: RequirementSpec;
  delayedConsequences?: DelayedConsequenceRef[];
  setsFlags?: string[];
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
  requirements?: RequirementSpec;
  setsFlags?: string[];
}

export interface EndingDefinition {
  id: EndingId;
  title: string;
  subtitle: string;
  summary: string;
}

export interface PendingEvent {
  eventId: string;
  triggerRound: number;
}

export interface HistoryEntry {
  id: string;
  round: number;
  source: "decision" | "event" | "system";
  title: string;
  body: string;
  tone: "positive" | "negative" | "neutral";
}

export interface RunState {
  status: "active" | "ended";
  round: number;
  metrics: RunMetrics;
  selectedDecisionIds: string[];
  pendingEvents: PendingEvent[];
  flags: string[];
  history: HistoryEntry[];
  endingId: EndingId | null;
  eventCounts: Record<string, number>;
}

export interface ContentBundle {
  decisions: DecisionDefinition[];
  events: EventDefinition[];
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
