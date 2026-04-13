import { hashNumber, shuffleWithSeed } from "../../lib/random/seeded";
import type {
  DecisionDefinition,
  DecisionGroup,
  DecisionPackId,
  RunState,
} from "../state/types";
import { hasRequirementConstraints, meetsRequirements } from "./requirements";

const MAIN_TRAY_SIZE = 5;
const MIN_DISTINCT_PACKS = 3;
const MAX_GROUP_DUPLICATES = 2;

const decisionScorePolicy = {
  cashReliefWhenLow: 26,
  heatReliefWhenHigh: 24,
  safetyRepairWhenLow: 20,
  creditorReliefWhenLow: 18,
  confidenceLiftWhenLow: 16,
  personalWealthWhenLow: 14,
  exitAvailability: 40,
  extractionWhenHeatSafe: 6,
  heatRiskPenaltyWhenHigh: -12,
  previousRoundPenalty: -40,
  followUpBonus: 8,
  flaggedRequirementBonus: 12,
  setsFlagBonus: 4,
  tagWeight: 1,
} as const;

interface RankedDecision {
  decision: DecisionDefinition;
  score: number;
  seededIndex: number;
}

export function isDecisionEligible(
  decision: DecisionDefinition,
  run: RunState,
): boolean {
  return meetsRequirements(decision.requirements, run);
}

function isFollowUpDecision(decision: DecisionDefinition): boolean {
  return hasRequirementConstraints(decision.requirements);
}

function scoreDecision(
  decision: DecisionDefinition,
  run: RunState,
  previousRoundIds: Set<string>,
): number {
  let score = 0;
  const { metrics } = run;
  const { impacts } = decision;

  if (metrics.airlineCash < 110 && (impacts.airlineCash ?? 0) > 0) {
    score += decisionScorePolicy.cashReliefWhenLow;
  }

  if (metrics.legalHeat > 58 && (impacts.legalHeat ?? 0) < 0) {
    score += decisionScorePolicy.heatReliefWhenHigh;
  }

  if (metrics.safetyIntegrity < 55 && (impacts.safetyIntegrity ?? 0) > 0) {
    score += decisionScorePolicy.safetyRepairWhenLow;
  }

  if (metrics.creditorPatience < 40 && (impacts.creditorPatience ?? 0) > 0) {
    score += decisionScorePolicy.creditorReliefWhenLow;
  }

  if (metrics.marketConfidence < 45 && (impacts.marketConfidence ?? 0) > 0) {
    score += decisionScorePolicy.confidenceLiftWhenLow;
  }

  if (metrics.personalWealth < 42 && (impacts.personalWealth ?? 0) > 0) {
    score += decisionScorePolicy.personalWealthWhenLow;
  }

  if (decision.group === "exit") {
    score += decisionScorePolicy.exitAvailability;
  }

  if (decision.group === "extraction" && metrics.legalHeat < 70) {
    score += decisionScorePolicy.extractionWhenHeatSafe;
  }

  if ((impacts.legalHeat ?? 0) > 0 && metrics.legalHeat > 72) {
    score += decisionScorePolicy.heatRiskPenaltyWhenHigh;
  }

  if (previousRoundIds.has(decision.id)) {
    score += decisionScorePolicy.previousRoundPenalty;
  }

  if (isFollowUpDecision(decision)) {
    score += decisionScorePolicy.followUpBonus;
  }

  if ((decision.requirements?.flagsAll?.length ?? 0) > 0) {
    score += decisionScorePolicy.flaggedRequirementBonus;
  }

  if ((decision.setsFlags?.length ?? 0) > 0) {
    score += decisionScorePolicy.setsFlagBonus;
  }

  score += decision.tags.length * decisionScorePolicy.tagWeight;

  return score;
}

function sortRankedDecisions(
  left: RankedDecision,
  right: RankedDecision,
): number {
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

    if (
      options.enforceGroupCap &&
      (groupCounts.get(decision.group) ?? 0) >= MAX_GROUP_DUPLICATES
    ) {
      continue;
    }

    return decision;
  }

  return null;
}

export function getAvailableDecisions(
  decisions: DecisionDefinition[],
  run: RunState,
): DecisionDefinition[] {
  const eligible = decisions.filter((decision) =>
    isDecisionEligible(decision, run),
  );
  const exits = eligible.filter((decision) => decision.group === "exit");
  const mainPool = eligible.filter((decision) => decision.group !== "exit");
  const previousRoundIds = new Set(run.lastOfferedDecisionIds ?? []);

  const seeded = shuffleWithSeed(
    mainPool,
    hashNumber(
      run.round,
      run.metrics.legalHeat,
      run.metrics.marketConfidence,
      run.metrics.airlineCash,
    ),
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
      pickCandidate(
        ranked,
        chosenIds,
        previousRoundIds,
        chosenPacks,
        groupCounts,
        {
          allowRepeats: false,
          enforceGroupCap: true,
          requireNewPack: true,
        },
      ) ??
      pickCandidate(
        ranked,
        chosenIds,
        previousRoundIds,
        chosenPacks,
        groupCounts,
        {
          allowRepeats: true,
          enforceGroupCap: true,
          requireNewPack: true,
        },
      ) ??
      pickCandidate(
        ranked,
        chosenIds,
        previousRoundIds,
        chosenPacks,
        groupCounts,
        {
          allowRepeats: true,
          enforceGroupCap: false,
          requireNewPack: true,
        },
      );

    if (!candidate) {
      break;
    }

    appendDecision(chosen, candidate, chosenIds, chosenPacks, groupCounts);
  }

  if (!chosen.some(isFollowUpDecision)) {
    const followUpCandidate =
      pickCandidate(
        ranked,
        chosenIds,
        previousRoundIds,
        chosenPacks,
        groupCounts,
        {
          allowRepeats: false,
          enforceGroupCap: true,
          requireFollowUp: true,
        },
      ) ??
      pickCandidate(
        ranked,
        chosenIds,
        previousRoundIds,
        chosenPacks,
        groupCounts,
        {
          allowRepeats: true,
          enforceGroupCap: true,
          requireFollowUp: true,
        },
      );

    if (followUpCandidate) {
      appendDecision(
        chosen,
        followUpCandidate,
        chosenIds,
        chosenPacks,
        groupCounts,
      );
    }
  }

  while (chosen.length < MAIN_TRAY_SIZE) {
    const candidate =
      pickCandidate(
        ranked,
        chosenIds,
        previousRoundIds,
        chosenPacks,
        groupCounts,
        {
          allowRepeats: false,
          enforceGroupCap: true,
        },
      ) ??
      pickCandidate(
        ranked,
        chosenIds,
        previousRoundIds,
        chosenPacks,
        groupCounts,
        {
          allowRepeats: true,
          enforceGroupCap: true,
        },
      ) ??
      pickCandidate(
        ranked,
        chosenIds,
        previousRoundIds,
        chosenPacks,
        groupCounts,
        {
          allowRepeats: true,
          enforceGroupCap: false,
        },
      );

    if (!candidate) {
      break;
    }

    appendDecision(chosen, candidate, chosenIds, chosenPacks, groupCounts);
  }

  if (exits.length > 0) {
    const [bestExit] = [...exits].sort(
      (left, right) =>
        scoreDecision(right, run, previousRoundIds) -
        scoreDecision(left, run, previousRoundIds),
    );
    if (bestExit) {
      chosen.push(bestExit);
    }
  }

  return chosen;
}
