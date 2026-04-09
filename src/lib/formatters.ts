import type { ImpactSet, MetricKey, RunMetrics } from "../simulation/state/types";
import { getImpactPriority } from "../simulation/state/metricSemantics";

export const metricLabels: Record<MetricKey, string> = {
  airlineCash: "Airline cash",
  personalWealth: "Personal wealth",
  debt: "Debt",
  assetValue: "Asset value",
  workforceSize: "Workforce",
  workforceMorale: "Workforce morale",
  marketConfidence: "Market confidence",
  creditorPatience: "Creditor patience",
  legalHeat: "Legal heat",
  safetyIntegrity: "Safety integrity",
  publicAnger: "Public anger",
  stockPrice: "Stock price",
  offshoreReadiness: "Offshore readiness",
};

const millionMetrics: MetricKey[] = ["airlineCash", "personalWealth", "debt", "assetValue"];
const gaugeMetrics: MetricKey[] = [
  "workforceMorale",
  "marketConfidence",
  "creditorPatience",
  "legalHeat",
  "safetyIntegrity",
  "publicAnger",
  "offshoreReadiness",
];

export function formatMetricValue(metric: MetricKey, value: number): string {
  if (millionMetrics.includes(metric)) {
    const formatter = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
    });
    return `$${formatter.format(value)}M`;
  }

  if (metric === "workforceSize") {
    return new Intl.NumberFormat("en-US").format(value);
  }

  if (metric === "stockPrice") {
    return `$${value.toFixed(1)}`;
  }

  if (gaugeMetrics.includes(metric)) {
    return `${Math.round(value)}/100`;
  }

  return `${value}`;
}

export function formatDelta(metric: MetricKey, value: number): string {
  const prefix = value > 0 ? "+" : "";
  if (millionMetrics.includes(metric)) {
    return `${prefix}$${value}M`;
  }

  if (metric === "stockPrice") {
    return `${prefix}$${value.toFixed(1)}`;
  }

  return `${prefix}${value}`;
}

export function getImpactPreview(impacts: ImpactSet): Array<{ metric: MetricKey; delta: number }> {
  const entries = Object.entries(impacts)
    .filter(([, delta]) => delta !== undefined && delta !== 0)
    .map(([metric, delta]) => ({
      metric: metric as MetricKey,
      delta: delta as number,
    }))
    .sort((left, right) => getImpactPriority(right.metric, right.delta) - getImpactPriority(left.metric, left.delta));

  return entries.slice(0, 4);
}

export function summarizeRun(metrics: RunMetrics): string {
  if (metrics.legalHeat >= 75) {
    return "Counsel is no longer writing memos. Counsel is writing exits.";
  }

  if (metrics.creditorPatience <= 28) {
    return "Lenders are done being strategic. They want collateral and blood.";
  }

  if (metrics.marketConfidence >= 68 && metrics.personalWealth < 45) {
    return "Wall Street still believes in the story. This is the moment to monetize belief.";
  }

  if (metrics.safetyIntegrity <= 42) {
    return "Operations are running on mercy, shortcuts, and the hope that weather stays boring.";
  }

  if (metrics.personalWealth > metrics.airlineCash / 4) {
    return "Your private position is improving faster than the airline's public one.";
  }

  return "The airline still looks governable, which means it still has extractable value.";
}
