import { hashNumber, shuffleWithSeed } from "../../lib/random/seeded";
import type { DecisionDefinition, RequirementSpec, RunState } from "../state/types";

function meetsMetricRequirements(
  requirements: RequirementSpec | undefined,
  run: RunState,
): boolean {
  if (!requirements) {
    return true;
  }

  if (requirements.roundAtLeast !== undefined && run.round < requirements.roundAtLeast) {
    return false;
  }

  if (requirements.roundAtMost !== undefined && run.round > requirements.roundAtMost) {
    return false;
  }

  for (const [metric, minimum] of Object.entries(requirements.metricMin ?? {})) {
    const key = metric as keyof typeof run.metrics;
    if (run.metrics[key] < minimum) {
      return false;
    }
  }

  for (const [metric, maximum] of Object.entries(requirements.metricMax ?? {})) {
    const key = metric as keyof typeof run.metrics;
    if (run.metrics[key] > maximum) {
      return false;
    }
  }

  if (requirements.flagsAll?.some((flag) => !run.flags.includes(flag))) {
    return false;
  }

  if (requirements.flagsNone?.some((flag) => run.flags.includes(flag))) {
    return false;
  }

  return true;
}

export function isDecisionEligible(decision: DecisionDefinition, run: RunState): boolean {
  return meetsMetricRequirements(decision.requirements, run);
}

function scoreDecision(decision: DecisionDefinition, run: RunState): number {
  let score = 0;
  const { metrics } = run;
  const { impacts } = decision;

  if (metrics.airlineCash < 110 && (impacts.airlineCash ?? 0) > 0) {
    score += 26;
  }

  if (metrics.legalHeat > 58 && (impacts.legalHeat ?? 0) < 0) {
    score += 24;
  }

  if (metrics.safetyIntegrity < 55 && (impacts.safetyIntegrity ?? 0) > 0) {
    score += 20;
  }

  if (metrics.creditorPatience < 40 && (impacts.creditorPatience ?? 0) > 0) {
    score += 18;
  }

  if (metrics.marketConfidence < 45 && (impacts.marketConfidence ?? 0) > 0) {
    score += 16;
  }

  if (metrics.personalWealth < 42 && (impacts.personalWealth ?? 0) > 0) {
    score += 14;
  }

  if (decision.group === "exit") {
    score += 40;
  }

  if (decision.group === "extraction" && metrics.legalHeat < 70) {
    score += 6;
  }

  if ((impacts.legalHeat ?? 0) > 0 && metrics.legalHeat > 72) {
    score -= 12;
  }

  score += decision.tags.length;

  return score;
}

export function getAvailableDecisions(decisions: DecisionDefinition[], run: RunState): DecisionDefinition[] {
  const eligible = decisions.filter((decision) => isDecisionEligible(decision, run));
  const exits = eligible.filter((decision) => decision.group === "exit");
  const mainPool = eligible.filter((decision) => decision.group !== "exit");

  const seeded = shuffleWithSeed(
    mainPool,
    hashNumber(run.round, run.metrics.legalHeat, run.metrics.marketConfidence, run.metrics.airlineCash),
  );

  const sortedMainPool = [...seeded].sort(
    (left, right) => scoreDecision(right, run) - scoreDecision(left, run),
  );

  const chosen = sortedMainPool.slice(0, 5);

  if (exits.length > 0) {
    const [bestExit] = [...exits].sort((left, right) => scoreDecision(right, run) - scoreDecision(left, run));
    if (bestExit) {
      chosen.push(bestExit);
    }
  }

  return chosen;
}
