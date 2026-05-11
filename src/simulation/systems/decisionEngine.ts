import { hashNumber, hashString } from "../../lib/random/seeded";
import type {
  DecisionDefinition,
  DecisionGroup,
  DecisionPackId,
  RunState,
} from "../state/types";
import { hasRequirementConstraints, meetsRequirements } from "./requirements";

export const TRAY_COMPOSER_POLICY = {
  mainTraySize: 5,
  beamWidth: 12,
  candidatePoolSize: 28,
  minDistinctGroups: 3,
  minDistinctPacks: 3,
  maxGroupDuplicates: 2,
  cashReliefWhenLow: 26,
  heatReliefWhenHigh: 24,
  safetyRepairWhenLow: 20,
  creditorReliefWhenLow: 18,
  confidenceLiftWhenLow: 16,
  personalWealthWhenLow: 14,
  exitAvailability: 40,
  extractionWhenHeatSafe: 6,
  personalWealthOpportunity: 18,
  offshoreReadinessOpportunity: 14,
  stockWindowOpportunity: 12,
  heatRiskPenaltyWhenHigh: -12,
  previousRoundPenalty: -40,
  followUpBonus: 8,
  followUpPresenceBonus: 18,
  flaggedRequirementBonus: 16,
  setsFlagBonus: 14,
  tagWeight: 2,
  lowReachabilityRepairBonus: 8,
  newGroupBonus: 30,
  neededGroupBonus: 42,
  duplicateGroupPenalty: -18,
  groupCapPenalty: -80,
  newPackBonus: 8,
  neededPackBonus: 12,
  repeatTrayPenalty: -90,
  noRepeatCandidateBonus: 10,
} as const;

export type TrayPickReasonCode =
  | "relief"
  | "temptation"
  | "exit-window"
  | "chain-continuation"
  | "risk-penalty"
  | "repeat-suppression"
  | "group-diversity"
  | "pack-diversity"
  | "low-reachability-repair";

export interface TrayPickReason {
  decisionId: string;
  score: number;
  reasons: TrayPickReasonCode[];
}

interface RankedDecision {
  decision: DecisionDefinition;
  score: number;
  tieBreaker: number;
  rankedIndex: number;
  reasons: TrayPickReasonCode[];
}

interface UnrankedDecisionScore {
  decision: DecisionDefinition;
  score: number;
  tieBreaker: number;
  reasons: TrayPickReasonCode[];
}

interface TrayScoreContext {
  previousRoundIds: Set<string>;
  availableGroupCount: number;
  availablePackCount: number;
  traySize: number;
}

interface TrayCandidate {
  entries: RankedDecision[];
  score: number;
  nextIndex: number;
}

interface TraySetSummary {
  groupCounts: Map<DecisionGroup, number>;
  packCounts: Map<DecisionPackId, number>;
  repeatedCount: number;
  freshCount: number;
  hasFollowUp: boolean;
}

export interface TrayCompositionResult {
  decisions: DecisionDefinition[];
  diagnostics: {
    eligibleCount: number;
    mainPoolCount: number;
    previousRepeatCount: number;
    distinctGroups: number;
    distinctPacks: number;
    exitPreserved: boolean;
    pickReasons: TrayPickReason[];
  };
}

const LOW_REACHABILITY_PACKS: ReadonlySet<DecisionPackId> = new Set([
  "marketTheater",
  "safetyDenial",
  "shadowSubsidiaries",
]);

const TRAY_PICK_REASON_ORDER: TrayPickReasonCode[] = [
  "relief",
  "temptation",
  "exit-window",
  "chain-continuation",
  "risk-penalty",
  "repeat-suppression",
  "group-diversity",
  "pack-diversity",
  "low-reachability-repair",
];

export function isDecisionEligible(
  decision: DecisionDefinition,
  run: RunState,
): boolean {
  return meetsRequirements(decision.requirements, run);
}

function isFollowUpDecision(decision: DecisionDefinition): boolean {
  return hasRequirementConstraints(decision.requirements);
}

function scoreReliefUtility(
  decision: DecisionDefinition,
  run: RunState,
): number {
  let score = 0;
  const { metrics } = run;
  const { impacts } = decision;

  if (metrics.airlineCash < 110 && (impacts.airlineCash ?? 0) > 0) {
    score += TRAY_COMPOSER_POLICY.cashReliefWhenLow;
  }

  if (metrics.legalHeat > 58 && (impacts.legalHeat ?? 0) < 0) {
    score += TRAY_COMPOSER_POLICY.heatReliefWhenHigh;
  }

  if (metrics.safetyIntegrity < 55 && (impacts.safetyIntegrity ?? 0) > 0) {
    score += TRAY_COMPOSER_POLICY.safetyRepairWhenLow;
  }

  if (metrics.creditorPatience < 40 && (impacts.creditorPatience ?? 0) > 0) {
    score += TRAY_COMPOSER_POLICY.creditorReliefWhenLow;
  }

  if (metrics.marketConfidence < 45 && (impacts.marketConfidence ?? 0) > 0) {
    score += TRAY_COMPOSER_POLICY.confidenceLiftWhenLow;
  }

  if (metrics.personalWealth < 42 && (impacts.personalWealth ?? 0) > 0) {
    score += TRAY_COMPOSER_POLICY.personalWealthWhenLow;
  }

  return score;
}

function scoreTemptationUtility(
  decision: DecisionDefinition,
  run: RunState,
): number {
  let score = decision.tags.length * TRAY_COMPOSER_POLICY.tagWeight;

  if (decision.group === "extraction" && run.metrics.legalHeat < 70) {
    score += TRAY_COMPOSER_POLICY.extractionWhenHeatSafe;
  }

  if ((decision.impacts.personalWealth ?? 0) > 0) {
    score += TRAY_COMPOSER_POLICY.personalWealthOpportunity;
  }

  if ((decision.impacts.offshoreReadiness ?? 0) > 0) {
    score += TRAY_COMPOSER_POLICY.offshoreReadinessOpportunity;
  }

  if (
    decision.tags.includes("stock") &&
    run.metrics.marketConfidence >= 55 &&
    run.metrics.stockPrice >= 20
  ) {
    score += TRAY_COMPOSER_POLICY.stockWindowOpportunity;
  }

  return score;
}

function scoreExitUtility(decision: DecisionDefinition): number {
  return decision.group === "exit" ? TRAY_COMPOSER_POLICY.exitAvailability : 0;
}

function scoreFollowUpUtility(decision: DecisionDefinition): number {
  let score = 0;

  if (isFollowUpDecision(decision)) {
    score += TRAY_COMPOSER_POLICY.followUpBonus;
  }

  if ((decision.requirements?.flagsAll?.length ?? 0) > 0) {
    score += TRAY_COMPOSER_POLICY.flaggedRequirementBonus;
  }

  if ((decision.setsFlags?.length ?? 0) > 0) {
    score += TRAY_COMPOSER_POLICY.setsFlagBonus;
  }

  return score;
}

function scoreReachabilityRepairUtility(decision: DecisionDefinition): number {
  return LOW_REACHABILITY_PACKS.has(decision.pack)
    ? TRAY_COMPOSER_POLICY.lowReachabilityRepairBonus
    : 0;
}

function scoreRiskPenalty(
  decision: DecisionDefinition,
  run: RunState,
  previousRoundIds: Set<string>,
): number {
  let score = 0;
  const { impacts } = decision;

  if ((impacts.legalHeat ?? 0) > 0 && run.metrics.legalHeat > 72) {
    score += TRAY_COMPOSER_POLICY.heatRiskPenaltyWhenHigh;
  }

  if (previousRoundIds.has(decision.id)) {
    score += TRAY_COMPOSER_POLICY.previousRoundPenalty;
  }

  return score;
}

function scoreDecisionUtility(
  decision: DecisionDefinition,
  run: RunState,
  previousRoundIds: Set<string>,
): number {
  return (
    scoreReliefUtility(decision, run) +
    scoreTemptationUtility(decision, run) +
    scoreExitUtility(decision) +
    scoreFollowUpUtility(decision) +
    scoreReachabilityRepairUtility(decision) +
    scoreRiskPenalty(decision, run, previousRoundIds)
  );
}

function getBasePickReasons(
  decision: DecisionDefinition,
  run: RunState,
  previousRoundIds: Set<string>,
): TrayPickReasonCode[] {
  const reasons: TrayPickReasonCode[] = [];

  if (scoreReliefUtility(decision, run) > 0) {
    reasons.push("relief");
  }

  if (scoreTemptationUtility(decision, run) > 0) {
    reasons.push("temptation");
  }

  if (scoreExitUtility(decision) > 0) {
    reasons.push("exit-window");
  }

  if (scoreFollowUpUtility(decision) > 0) {
    reasons.push("chain-continuation");
  }

  if ((decision.impacts.legalHeat ?? 0) > 0 && run.metrics.legalHeat > 72) {
    reasons.push("risk-penalty");
  }

  if (previousRoundIds.has(decision.id)) {
    reasons.push("repeat-suppression");
  }

  if (scoreReachabilityRepairUtility(decision) > 0) {
    reasons.push("low-reachability-repair");
  }

  return reasons;
}

function getTraySeed(run: RunState): number {
  return hashNumber(
    run.round,
    run.metrics.legalHeat,
    run.metrics.marketConfidence,
    run.metrics.airlineCash,
    hashString(run.contentHash ?? "no-content-hash"),
  );
}

function getDecisionTieBreaker(
  decision: DecisionDefinition,
  seed: number,
): number {
  return hashNumber(
    seed,
    hashString(decision.id),
    hashString(decision.pack),
    hashString(decision.group),
  );
}

function sortScoredDecisions(
  left: UnrankedDecisionScore,
  right: UnrankedDecisionScore,
): number {
  if (right.score !== left.score) {
    return right.score - left.score;
  }

  if (left.tieBreaker !== right.tieBreaker) {
    return left.tieBreaker - right.tieBreaker;
  }

  return left.decision.id.localeCompare(right.decision.id);
}

function rankDecisions(
  decisions: DecisionDefinition[],
  run: RunState,
  previousRoundIds: Set<string>,
  seed: number,
): RankedDecision[] {
  return decisions
    .map((decision) => ({
      decision,
      score: scoreDecisionUtility(decision, run, previousRoundIds),
      tieBreaker: getDecisionTieBreaker(decision, seed),
      reasons: getBasePickReasons(decision, run, previousRoundIds),
    }))
    .sort(sortScoredDecisions)
    .map((entry, rankedIndex) => ({ ...entry, rankedIndex }));
}

function selectSearchPool(ranked: RankedDecision[]): RankedDecision[] {
  const pool = new Map<string, RankedDecision>();
  const groups = new Set<DecisionGroup>();
  const packs = new Set<DecisionPackId>();

  for (const entry of ranked) {
    if (!groups.has(entry.decision.group)) {
      pool.set(entry.decision.id, entry);
      groups.add(entry.decision.group);
    }

    if (!packs.has(entry.decision.pack)) {
      pool.set(entry.decision.id, entry);
      packs.add(entry.decision.pack);
    }
  }

  for (const entry of ranked) {
    if (pool.size >= TRAY_COMPOSER_POLICY.candidatePoolSize) {
      break;
    }

    pool.set(entry.decision.id, entry);
  }

  return [...pool.values()].sort(
    (left, right) => left.rankedIndex - right.rankedIndex,
  );
}

function countDistinctGroups(decisions: DecisionDefinition[]): number {
  return new Set(decisions.map((decision) => decision.group)).size;
}

function countDistinctPacks(decisions: DecisionDefinition[]): number {
  return new Set(decisions.map((decision) => decision.pack)).size;
}

function getGroupTarget(context: TrayScoreContext): number {
  return Math.min(
    TRAY_COMPOSER_POLICY.minDistinctGroups,
    context.traySize,
    context.availableGroupCount,
  );
}

function getPackTarget(context: TrayScoreContext): number {
  return Math.min(
    TRAY_COMPOSER_POLICY.minDistinctPacks,
    context.traySize,
    context.availablePackCount,
  );
}

function summarizeTraySet(
  entries: RankedDecision[],
  previousRoundIds: Set<string>,
): TraySetSummary {
  const groupCounts = new Map<DecisionGroup, number>();
  const packCounts = new Map<DecisionPackId, number>();
  let repeatedCount = 0;
  let hasFollowUp = false;

  for (const { decision } of entries) {
    groupCounts.set(decision.group, (groupCounts.get(decision.group) ?? 0) + 1);
    packCounts.set(decision.pack, (packCounts.get(decision.pack) ?? 0) + 1);

    if (previousRoundIds.has(decision.id)) {
      repeatedCount += 1;
    }

    if (isFollowUpDecision(decision)) {
      hasFollowUp = true;
    }
  }

  return {
    groupCounts,
    packCounts,
    repeatedCount,
    freshCount: entries.length - repeatedCount,
    hasFollowUp,
  };
}

function scoreGroupDiversity(
  groupCounts: Map<DecisionGroup, number>,
  groupTarget: number,
): number {
  const distinctGroups = groupCounts.size;
  const targetGroups = Math.min(distinctGroups, groupTarget);
  const extraGroups = Math.max(0, distinctGroups - groupTarget);
  let score =
    targetGroups * TRAY_COMPOSER_POLICY.neededGroupBonus +
    extraGroups * TRAY_COMPOSER_POLICY.newGroupBonus;

  for (const count of groupCounts.values()) {
    if (count > 1) {
      const duplicatePairs = (count * (count - 1)) / 2;
      score += duplicatePairs * TRAY_COMPOSER_POLICY.duplicateGroupPenalty;
    }

    if (count > TRAY_COMPOSER_POLICY.maxGroupDuplicates) {
      score +=
        (count - TRAY_COMPOSER_POLICY.maxGroupDuplicates) *
        TRAY_COMPOSER_POLICY.groupCapPenalty;
    }
  }

  return score;
}

function scorePackDiversity(
  packCounts: Map<DecisionPackId, number>,
  packTarget: number,
): number {
  const distinctPacks = packCounts.size;
  const targetPacks = Math.min(distinctPacks, packTarget);
  const extraPacks = Math.max(0, distinctPacks - packTarget);

  return (
    targetPacks * TRAY_COMPOSER_POLICY.neededPackBonus +
    extraPacks * TRAY_COMPOSER_POLICY.newPackBonus
  );
}

function scoreRepeatPressure(summary: TraySetSummary): number {
  return (
    summary.repeatedCount * TRAY_COMPOSER_POLICY.repeatTrayPenalty +
    summary.freshCount * TRAY_COMPOSER_POLICY.noRepeatCandidateBonus
  );
}

function scoreTraySet(
  entries: RankedDecision[],
  context: TrayScoreContext,
): number {
  const summary = summarizeTraySet(entries, context.previousRoundIds);
  const baseScore = entries.reduce((sum, entry) => sum + entry.score, 0);
  const followUpScore = summary.hasFollowUp
    ? TRAY_COMPOSER_POLICY.followUpPresenceBonus
    : 0;

  return (
    baseScore +
    scoreGroupDiversity(summary.groupCounts, getGroupTarget(context)) +
    scorePackDiversity(summary.packCounts, getPackTarget(context)) +
    scoreRepeatPressure(summary) +
    followUpScore
  );
}

function compareTrayCandidates(
  context: TrayScoreContext,
): (left: TrayCandidate, right: TrayCandidate) => number {
  return (left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    const leftSummary = summarizeTraySet(left.entries, context.previousRoundIds);
    const rightSummary = summarizeTraySet(
      right.entries,
      context.previousRoundIds,
    );

    if (leftSummary.repeatedCount !== rightSummary.repeatedCount) {
      return leftSummary.repeatedCount - rightSummary.repeatedCount;
    }

    if (rightSummary.groupCounts.size !== leftSummary.groupCounts.size) {
      return rightSummary.groupCounts.size - leftSummary.groupCounts.size;
    }

    if (rightSummary.packCounts.size !== leftSummary.packCounts.size) {
      return rightSummary.packCounts.size - leftSummary.packCounts.size;
    }

    return getTrayFingerprint(left).localeCompare(getTrayFingerprint(right));
  };
}

function getTrayFingerprint(candidate: TrayCandidate): string {
  return candidate.entries.map((entry) => entry.decision.id).join("|");
}

function searchBestTray(
  ranked: RankedDecision[],
  context: TrayScoreContext,
): TrayCandidate {
  let beam: TrayCandidate[] = [
    {
      entries: [],
      nextIndex: 0,
      score: scoreTraySet([], context),
    },
  ];

  for (let depth = 0; depth < context.traySize; depth += 1) {
    const expanded: TrayCandidate[] = [];

    for (const candidate of beam) {
      for (let index = candidate.nextIndex; index < ranked.length; index += 1) {
        const entries = [...candidate.entries, ranked[index]];
        const remainingSlots = context.traySize - entries.length;
        const remainingCandidates = ranked.length - (index + 1);

        if (remainingCandidates < remainingSlots) {
          continue;
        }

        expanded.push({
          entries,
          nextIndex: index + 1,
          score: scoreTraySet(entries, context),
        });
      }
    }

    if (expanded.length === 0) {
      break;
    }

    beam = expanded
      .sort(compareTrayCandidates(context))
      .slice(0, TRAY_COMPOSER_POLICY.beamWidth);
  }

  return (
    beam[0] ?? {
      entries: [],
      nextIndex: 0,
      score: scoreTraySet([], context),
    }
  );
}

function addReason(
  reasons: Set<TrayPickReasonCode>,
  reason: TrayPickReasonCode,
): void {
  reasons.add(reason);
}

function sortPickReasons(
  left: TrayPickReasonCode,
  right: TrayPickReasonCode,
): number {
  return (
    TRAY_PICK_REASON_ORDER.indexOf(left) - TRAY_PICK_REASON_ORDER.indexOf(right)
  );
}

function createPickReason(
  entry: RankedDecision,
  entries: RankedDecision[],
  context: TrayScoreContext,
): TrayPickReason {
  const reasons = new Set<TrayPickReasonCode>(entry.reasons);
  const summary = summarizeTraySet(entries, context.previousRoundIds);
  const groupCount = summary.groupCounts.get(entry.decision.group) ?? 0;
  const packCount = summary.packCounts.get(entry.decision.pack) ?? 0;

  if (summary.groupCounts.size > 1 && groupCount === 1) {
    addReason(reasons, "group-diversity");
  }

  if (summary.packCounts.size > 1 && packCount === 1) {
    addReason(reasons, "pack-diversity");
  }

  return {
    decisionId: entry.decision.id,
    score: entry.score,
    reasons: [...reasons].sort(sortPickReasons),
  };
}

function createExitPickReason(entry: RankedDecision): TrayPickReason {
  const reasons = new Set<TrayPickReasonCode>(entry.reasons);
  addReason(reasons, "exit-window");

  return {
    decisionId: entry.decision.id,
    score: entry.score,
    reasons: [...reasons].sort(sortPickReasons),
  };
}

export function composeDecisionTray(
  decisions: DecisionDefinition[],
  run: RunState,
): TrayCompositionResult {
  const eligible = decisions.filter((decision) =>
    isDecisionEligible(decision, run),
  );
  const exits = eligible.filter((decision) => decision.group === "exit");
  const mainPool = eligible.filter((decision) => decision.group !== "exit");
  const previousRoundIds = new Set(run.lastOfferedDecisionIds ?? []);
  const seed = getTraySeed(run);
  const ranked = rankDecisions(mainPool, run, previousRoundIds, seed);
  const searchPool = selectSearchPool(ranked);
  const searchContext: TrayScoreContext = {
    previousRoundIds,
    availableGroupCount: new Set(ranked.map((entry) => entry.decision.group))
      .size,
    availablePackCount: new Set(ranked.map((entry) => entry.decision.pack)).size,
    traySize: Math.min(TRAY_COMPOSER_POLICY.mainTraySize, searchPool.length),
  };
  const bestTray = searchBestTray(searchPool, searchContext);
  const chosen = bestTray.entries.map((entry) => entry.decision);
  const pickReasons = bestTray.entries.map((entry) =>
    createPickReason(entry, bestTray.entries, searchContext),
  );
  const [bestExit] = rankDecisions(exits, run, previousRoundIds, seed);
  let exitPreserved = false;

  if (bestExit) {
    chosen.push(bestExit.decision);
    pickReasons.push(createExitPickReason(bestExit));
    exitPreserved = true;
  }

  return {
    decisions: chosen,
    diagnostics: {
      eligibleCount: eligible.length,
      mainPoolCount: mainPool.length,
      previousRepeatCount: chosen.filter((decision) =>
        previousRoundIds.has(decision.id),
      ).length,
      distinctGroups: countDistinctGroups(
        chosen.filter((decision) => decision.group !== "exit"),
      ),
      distinctPacks: countDistinctPacks(
        chosen.filter((decision) => decision.group !== "exit"),
      ),
      exitPreserved,
      pickReasons,
    },
  };
}

export function getAvailableDecisions(
  decisions: DecisionDefinition[],
  run: RunState,
): DecisionDefinition[] {
  return composeDecisionTray(decisions, run).decisions;
}
