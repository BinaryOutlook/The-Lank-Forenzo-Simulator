import type { ImpactSet, MetricKey } from "./types";

export type MetricPolarity = "higher-is-better" | "lower-is-better" | "contextual";
export type MetricIndicatorTone = "positive" | "negative" | "neutral";

interface MeterScale {
  max: number;
}

interface MetricSemantics {
  polarity: MetricPolarity;
  historyWeight: number;
  meter: MeterScale | null;
}

export const metricSemantics: Record<MetricKey, MetricSemantics> = {
  airlineCash: {
    polarity: "higher-is-better",
    historyWeight: 0.5,
    meter: { max: 300 },
  },
  personalWealth: {
    polarity: "higher-is-better",
    historyWeight: 1,
    meter: { max: 300 },
  },
  debt: {
    polarity: "lower-is-better",
    historyWeight: 0.45,
    meter: { max: 1200 },
  },
  assetValue: {
    polarity: "higher-is-better",
    historyWeight: 0.3,
    meter: { max: 1500 },
  },
  workforceSize: {
    polarity: "contextual",
    historyWeight: 0,
    meter: { max: 12000 },
  },
  workforceMorale: {
    polarity: "higher-is-better",
    historyWeight: 0.35,
    meter: { max: 100 },
  },
  marketConfidence: {
    polarity: "higher-is-better",
    historyWeight: 1.2,
    meter: { max: 100 },
  },
  creditorPatience: {
    polarity: "higher-is-better",
    historyWeight: 0.8,
    meter: { max: 100 },
  },
  legalHeat: {
    polarity: "lower-is-better",
    historyWeight: 1.4,
    meter: { max: 100 },
  },
  safetyIntegrity: {
    polarity: "higher-is-better",
    historyWeight: 0.7,
    meter: { max: 100 },
  },
  publicAnger: {
    polarity: "lower-is-better",
    historyWeight: 0.7,
    meter: { max: 100 },
  },
  stockPrice: {
    polarity: "higher-is-better",
    historyWeight: 0.75,
    meter: { max: 50 },
  },
  offshoreReadiness: {
    polarity: "higher-is-better",
    historyWeight: 0.95,
    meter: { max: 100 },
  },
};

export function getDirectionalDelta(metric: MetricKey, delta: number): number {
  const { polarity } = metricSemantics[metric];

  if (polarity === "higher-is-better") {
    return delta;
  }

  if (polarity === "lower-is-better") {
    return delta * -1;
  }

  return 0;
}

export function getImpactTone(metric: MetricKey, delta: number): MetricIndicatorTone {
  const directionalDelta = getDirectionalDelta(metric, delta);

  if (directionalDelta > 0) {
    return "positive";
  }

  if (directionalDelta < 0) {
    return "negative";
  }

  return "neutral";
}

export function getImpactPriority(metric: MetricKey, delta: number): number {
  const { historyWeight } = metricSemantics[metric];
  const directionalDelta = getDirectionalDelta(metric, delta);

  if (directionalDelta !== 0) {
    return Math.abs(directionalDelta) * historyWeight;
  }

  return Math.abs(delta) * 0.15;
}

export function getImpactSetScore(impacts: ImpactSet): number {
  return Object.entries(impacts).reduce((score, [metric, delta]) => {
    if (delta === undefined) {
      return score;
    }

    const key = metric as MetricKey;
    return score + getDirectionalDelta(key, delta) * metricSemantics[key].historyWeight;
  }, 0);
}

export function getMetricMeterValue(metric: MetricKey, value: number): number | null {
  const meter = metricSemantics[metric].meter;

  if (!meter) {
    return null;
  }

  return Math.min(100, Math.max(0, (value / meter.max) * 100));
}

export function getMetricMeterTone(metric: MetricKey): MetricIndicatorTone {
  const { polarity } = metricSemantics[metric];

  if (polarity === "higher-is-better") {
    return "positive";
  }

  if (polarity === "lower-is-better") {
    return "negative";
  }

  return "neutral";
}
