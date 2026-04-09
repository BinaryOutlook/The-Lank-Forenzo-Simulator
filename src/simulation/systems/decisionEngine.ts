import { hashNumber, shuffleWithSeed } from "../../lib/random/seeded";
import type { DecisionDefinition, DecisionGroup, DecisionPackId, RequirementSpec, RunState } from "../state/types";

const MAIN_TRAY_SIZE = 5;
const MIN_DISTINCT_PACKS = 3;
const MAX_GROUP_DUPLICATES = 2;

interface RankedDecision {
  decision: DecisionDefinition;
  score: number;
  seededIndex: number;
}

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

function isFollowUpDecision(decision: DecisionDefinition): boolean {
  const requirements = decision.requirements;
  if (!requirements) {
    return false;
  }

  return Boolean(
    requirements.roundAtLeast !== undefined ||
      requirements.roundAtMost !== undefined ||
      Object.keys(requirements.metricMin ?? {}).length > 0 ||
      Object.keys(requirements.metricMax ?? {}).length > 0 ||
      (requirements.flagsAll?.length ?? 0) > 0 ||
      (requirements.flagsNone?.length ?? 0) > 0,
  );
}

function scoreDecision(decision: DecisionDefinition, run: RunState, previousRoundIds: Set<string>): number {
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

  if (previousRoundIds.has(decision.id)) {
    score -= 40;
  }

  if (isFollowUpDecision(decision)) {
    score += 8;
  }

  if ((decision.requirements?.flagsAll?.length ?? 0) > 0) {
    score += 12;
  }

  if ((decision.setsFlags?.length ?? 0) > 0) {
    score += 4;
  }

  score += decision.tags.length;

  return score;
}

function sortRankedDecisions(left: RankedDecision, right: RankedDecision): number {
  if (right.score !== left.score) {
    return right.score - left.score;
  }

  return left.seededIndex - right.seededIndex;
}

function appendDecision(
  chosen: DecisionDefinition[],
  decision: DecisionDefinition,
  chosenIds: Set<string>,
  chosenPacks: Set<DecisionPackId>,
  groupCounts: Map<DecisionGroup, number>,
) {
  chosen.push(decision);
  chosenIds.add(decision.id);
  chosenPacks.add(decision.pack);
  groupCounts.set(decision.group, (groupCounts.get(decision.group) ?? 0) + 1);
}

function pickCandidate(
  ranked: RankedDecision[],
  chosenIds: Set<string>,
  previousRoundIds: Set<string>,
  chosenPacks: Set<DecisionPackId>,
  groupCounts: Map<DecisionGroup, number>,
  options: {
    allowRepeats: boolean;
    enforceGroupCap: boolean;
    requireNewPack?: boolean;
    requireFollowUp?: boolean;
  },
): DecisionDefinition | null {
  for (const entry of ranked) {
    const { decision } = entry;

    if (chosenIds.has(decision.id)) {
      continue;
    }

    if (!options.allowRepeats && previousRoundIds.has(decision.id)) {
      continue;
    }

    if (options.requireNewPack && chosenPacks.has(decision.pack)) {
      continue;
    }

    if (options.requireFollowUp && !isFollowUpDecision(decision)) {
      continue;
    }

    if (options.enforceGroupCap && (groupCounts.get(decision.group) ?? 0) >= MAX_GROUP_DUPLICATES) {
      continue;
    }

    return decision;
  }

  return null;
}

export function getAvailableDecisions(decisions: DecisionDefinition[], run: RunState): DecisionDefinition[] {
  const eligible = decisions.filter((decision) => isDecisionEligible(decision, run));
  const exits = eligible.filter((decision) => decision.group === "exit");
  const mainPool = eligible.filter((decision) => decision.group !== "exit");
  const previousRoundIds = new Set(run.lastOfferedDecisionIds ?? []);

  const seeded = shuffleWithSeed(
    mainPool,
    hashNumber(run.round, run.metrics.legalHeat, run.metrics.marketConfidence, run.metrics.airlineCash),
  );

  const ranked = seeded
    .map((decision, seededIndex) => ({
      decision,
      seededIndex,
      score: scoreDecision(decision, run, previousRoundIds),
    }))
    .sort(sortRankedDecisions);

  const chosen: DecisionDefinition[] = [];
  const chosenIds = new Set<string>();
  const chosenPacks = new Set<DecisionPackId>();
  const groupCounts = new Map<DecisionGroup, number>();
  const packTarget = Math.min(
    MIN_DISTINCT_PACKS,
    MAIN_TRAY_SIZE,
    new Set(ranked.map((entry) => entry.decision.pack)).size,
  );

  while (chosenPacks.size < packTarget) {
    const candidate =
      pickCandidate(ranked, chosenIds, previousRoundIds, chosenPacks, groupCounts, {
        allowRepeats: false,
        enforceGroupCap: true,
        requireNewPack: true,
      }) ??
      pickCandidate(ranked, chosenIds, previousRoundIds, chosenPacks, groupCounts, {
        allowRepeats: true,
        enforceGroupCap: true,
        requireNewPack: true,
      }) ??
      pickCandidate(ranked, chosenIds, previousRoundIds, chosenPacks, groupCounts, {
        allowRepeats: true,
        enforceGroupCap: false,
        requireNewPack: true,
      });

    if (!candidate) {
      break;
    }

    appendDecision(chosen, candidate, chosenIds, chosenPacks, groupCounts);
  }

  if (!chosen.some(isFollowUpDecision)) {
    const followUpCandidate =
      pickCandidate(ranked, chosenIds, previousRoundIds, chosenPacks, groupCounts, {
        allowRepeats: false,
        enforceGroupCap: true,
        requireFollowUp: true,
      }) ??
      pickCandidate(ranked, chosenIds, previousRoundIds, chosenPacks, groupCounts, {
        allowRepeats: true,
        enforceGroupCap: true,
        requireFollowUp: true,
      });

    if (followUpCandidate) {
      appendDecision(chosen, followUpCandidate, chosenIds, chosenPacks, groupCounts);
    }
  }

  while (chosen.length < MAIN_TRAY_SIZE) {
    const candidate =
      pickCandidate(ranked, chosenIds, previousRoundIds, chosenPacks, groupCounts, {
        allowRepeats: false,
        enforceGroupCap: true,
      }) ??
      pickCandidate(ranked, chosenIds, previousRoundIds, chosenPacks, groupCounts, {
        allowRepeats: true,
        enforceGroupCap: true,
      }) ??
      pickCandidate(ranked, chosenIds, previousRoundIds, chosenPacks, groupCounts, {
        allowRepeats: true,
        enforceGroupCap: false,
      });

    if (!candidate) {
      break;
    }

    appendDecision(chosen, candidate, chosenIds, chosenPacks, groupCounts);
  }

  if (exits.length > 0) {
    const [bestExit] = [...exits].sort(
      (left, right) => scoreDecision(right, run, previousRoundIds) - scoreDecision(left, run, previousRoundIds),
    );
    if (bestExit) {
      chosen.push(bestExit);
    }
  }

  return chosen;
}
