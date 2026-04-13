import type { EndingId, RunMetrics } from "../state/types";

type EndingRule = {
  id: EndingId;
  matches: (metrics: RunMetrics) => boolean;
};

const automaticEndingRules: EndingRule[] = [
  {
    id: "prison",
    matches: (metrics) =>
      metrics.legalHeat >= 95 ||
      (metrics.legalHeat >= 86 && metrics.safetyIntegrity <= 35),
  },
  {
    id: "forcedRemoval",
    matches: (metrics) =>
      metrics.creditorPatience <= 0 ||
      metrics.airlineCash <= -140 ||
      metrics.marketConfidence <= 6,
  },
];

export function getAutomaticEndingId(metrics: RunMetrics): EndingId | null {
  for (const rule of automaticEndingRules) {
    if (rule.matches(metrics)) {
      return rule.id;
    }
  }

  return null;
}
