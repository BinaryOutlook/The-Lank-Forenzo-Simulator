import type { RunState } from "../state/types";

export interface BriefingSignal {
  title: string;
  body: string;
  tone: "positive" | "negative" | "neutral";
}

export function buildBriefingSignals(run: RunState): BriefingSignal[] {
  const { metrics } = run;
  const signals: BriefingSignal[] = [];

  if (metrics.personalWealth > metrics.airlineCash * 0.18) {
    signals.push({
      title: "Private upside is outpacing public health",
      body: "The split between your fortune and the airline's condition is now visible in the numbers.",
      tone: "positive",
    });
  }

  if (metrics.legalHeat >= 60) {
    signals.push({
      title: "Exposure is becoming personal",
      body: "The next reckless move is likely to create testimony, not just headlines.",
      tone: "negative",
    });
  }

  if (metrics.creditorPatience <= 38) {
    signals.push({
      title: "Creditors are close to collective action",
      body: "Soft restructuring language is losing value. Cash or a merger story would help.",
      tone: "negative",
    });
  }

  if (metrics.marketConfidence >= 62) {
    signals.push({
      title: "Market still buying the narrative",
      body: "You have one of the most valuable assets in the game: temporary belief.",
      tone: "positive",
    });
  }

  if (metrics.safetyIntegrity <= 50) {
    signals.push({
      title: "Ops integrity is dangerously thin",
      body: "Savings from deferred maintenance are now converting into event risk.",
      tone: "negative",
    });
  }

  if (signals.length === 0) {
    signals.push({
      title: "The board still thinks this is a turnaround",
      body: "That fiction is what keeps lenders, analysts, and directors inside the tent.",
      tone: "neutral",
    });
  }

  return signals.slice(0, 3);
}
