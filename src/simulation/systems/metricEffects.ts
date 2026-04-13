import type { ImpactSet, MetricKey, RunMetrics } from "../state/types";

export const runMetricBounds: Record<MetricKey, { min: number; max: number }> =
  {
    airlineCash: { min: -280, max: 900 },
    personalWealth: { min: 0, max: 240 },
    debt: { min: 0, max: 1200 },
    assetValue: { min: 120, max: 1500 },
    workforceSize: { min: 1200, max: 12000 },
    workforceMorale: { min: 0, max: 100 },
    marketConfidence: { min: 0, max: 100 },
    creditorPatience: { min: 0, max: 100 },
    legalHeat: { min: 0, max: 100 },
    safetyIntegrity: { min: 0, max: 100 },
    publicAnger: { min: 0, max: 100 },
    stockPrice: { min: 2, max: 120 },
    offshoreReadiness: { min: 0, max: 100 },
  };

export function clamp(
  number: number,
  minimum: number,
  maximum: number,
): number {
  return Math.min(maximum, Math.max(minimum, number));
}

export function clampRunMetrics(metrics: RunMetrics): RunMetrics {
  return {
    airlineCash: clamp(
      metrics.airlineCash,
      runMetricBounds.airlineCash.min,
      runMetricBounds.airlineCash.max,
    ),
    personalWealth: clamp(
      metrics.personalWealth,
      runMetricBounds.personalWealth.min,
      runMetricBounds.personalWealth.max,
    ),
    debt: clamp(
      metrics.debt,
      runMetricBounds.debt.min,
      runMetricBounds.debt.max,
    ),
    assetValue: clamp(
      metrics.assetValue,
      runMetricBounds.assetValue.min,
      runMetricBounds.assetValue.max,
    ),
    workforceSize: clamp(
      metrics.workforceSize,
      runMetricBounds.workforceSize.min,
      runMetricBounds.workforceSize.max,
    ),
    workforceMorale: clamp(
      metrics.workforceMorale,
      runMetricBounds.workforceMorale.min,
      runMetricBounds.workforceMorale.max,
    ),
    marketConfidence: clamp(
      metrics.marketConfidence,
      runMetricBounds.marketConfidence.min,
      runMetricBounds.marketConfidence.max,
    ),
    creditorPatience: clamp(
      metrics.creditorPatience,
      runMetricBounds.creditorPatience.min,
      runMetricBounds.creditorPatience.max,
    ),
    legalHeat: clamp(
      metrics.legalHeat,
      runMetricBounds.legalHeat.min,
      runMetricBounds.legalHeat.max,
    ),
    safetyIntegrity: clamp(
      metrics.safetyIntegrity,
      runMetricBounds.safetyIntegrity.min,
      runMetricBounds.safetyIntegrity.max,
    ),
    publicAnger: clamp(
      metrics.publicAnger,
      runMetricBounds.publicAnger.min,
      runMetricBounds.publicAnger.max,
    ),
    stockPrice: clamp(
      metrics.stockPrice,
      runMetricBounds.stockPrice.min,
      runMetricBounds.stockPrice.max,
    ),
    offshoreReadiness: clamp(
      metrics.offshoreReadiness,
      runMetricBounds.offshoreReadiness.min,
      runMetricBounds.offshoreReadiness.max,
    ),
  };
}

export function applyImpactSet(
  metrics: RunMetrics,
  impacts: ImpactSet,
): RunMetrics {
  const next: RunMetrics = { ...metrics };

  for (const [metric, delta] of Object.entries(impacts)) {
    if (delta === undefined) {
      continue;
    }

    const key = metric as MetricKey;
    next[key] += delta;
  }

  return clampRunMetrics(next);
}
