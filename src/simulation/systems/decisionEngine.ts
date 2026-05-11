import { hashNumber, shuffleWithSeed } from "../../lib/random/seeded";
import type {
  DecisionDefinition,
  DecisionGroup,
  DecisionPackId,
  RunState,
} from "../state/types";
import { hasRequirementConstraints, meetsRequirements } from "./requirements";

export const TRAY_COMPOSER_POLICY = {
  mainTraySize: 5,
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
  heatRiskPenaltyWhenHigh: -12,
  previousRoundPenalty: -40,
  followUpBonus: 8,
  flaggedRequirementBonus: 16,
  setsFlagBonus: 14,
  tagWeight: 2,
  newGroupBonus: 30,
  neededGroupBonus: 42,
  duplicateGroupPenalty: -18,
  groupCapPenalty: -80,
  newPackBonus: 8,
  neededPackBonus: 12,
  repeatTrayPenalty: -90,
  noRepeatCandidateBonus: 10,
} as const;

export const TRAY_PICK_REASONS = [
  "relief",
  "temptation",
  "chain-continuation",
  "exit-window",
  "coverage-repair",
  "repeat-avoidance",
  "fallback-fill",
] as const;

export type TrayPickReason = (typeof TRAY_PICK_REASONS)[number];

export interface TrayPickDiagnostic {
  decisionId: string;
  score: number;
  reasons: TrayPickReason[];
}

export type TrayPickReasonCounts = Record<TrayPickReason, number>;

interface RankedDecision {
  decision: DecisionDefinition;
  score: number;
  seededIndex: number;
}

interface PickedDecision {
  decision: DecisionDefinition;
  score: number;
  seededIndex: number;
  options: PickCandidateOptions;
}

interface TrayScoreContext {
  run: RunState;
  previousRoundIds: Set<string>;
  availableGroupCount: number;
  availablePackCount: number;
}

interface PickCandidateOptions {
  allowRepeats: boolean;
  enforceGroupCap: boolean;
  requireNewPack?: boolean;
  requireFollowUp?: boolean;
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
    pickReasons: TrayPickDiagnostic[];
    reasonCounts: TrayPickReasonCounts;
  };
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

function addReason(
  reasons: Set<TrayPickReason>,
  reason: TrayPickReason,
): void {
  reasons.add(reason);
}

function sortReasons(reasons: Iterable<TrayPickReason>): TrayPickReason[] {
  const reasonSet = new Set(reasons);
  const sorted = TRAY_PICK_REASONS.filter((reason) => reasonSet.has(reason));

  return sorted.length > 0 ? sorted : ["fallback-fill"];
}

function orderReasons(reasons: Iterable<TrayPickReason>): TrayPickReason[] {
  const reasonSet = new Set(reasons);

  return TRAY_PICK_REASONS.filter((reason) => reasonSet.has(reason));
}

function getUtilityReasons(
  decision: DecisionDefinition,
  run: RunState,
): TrayPickReason[] {
  const reasons = new Set<TrayPickReason>();
  const { metrics } = run;
  const { impacts } = decision;

  if (metrics.airlineCash < 110 && (impacts.airlineCash ?? 0) > 0) {
    addReason(reasons, "relief");
  }

  if (metrics.legalHeat > 58 && (impacts.legalHeat ?? 0) < 0) {
    addReason(reasons, "relief");
  }

  if (metrics.safetyIntegrity < 55 && (impacts.safetyIntegrity ?? 0) > 0) {
    addReason(reasons, "relief");
  }

  if (metrics.creditorPatience < 40 && (impacts.creditorPatience ?? 0) > 0) {
    addReason(reasons, "relief");
  }

  if (metrics.marketConfidence < 45 && (impacts.marketConfidence ?? 0) > 0) {
    addReason(reasons, "relief");
  }

  if (
    decision.group === "extraction" ||
    (metrics.personalWealth < 42 && (impacts.personalWealth ?? 0) > 0)
  ) {
    addReason(reasons, "temptation");
  }

  if (decision.group === "exit" || decision.ending) {
    addReason(reasons, "exit-window");
  }

  if (isFollowUpDecision(decision) || (decision.setsFlags?.length ?? 0) > 0) {
    addReason(reasons, "chain-continuation");
  }

  return orderReasons(reasons);
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

  if (decision.group === "exit") {
    score += TRAY_COMPOSER_POLICY.exitAvailability;
  }

  if (decision.group === "extraction" && metrics.legalHeat < 70) {
    score += TRAY_COMPOSER_POLICY.extractionWhenHeatSafe;
  }

  if ((impacts.legalHeat ?? 0) > 0 && metrics.legalHeat > 72) {
    score += TRAY_COMPOSER_POLICY.heatRiskPenaltyWhenHigh;
  }

  if (previousRoundIds.has(decision.id)) {
    score += TRAY_COMPOSER_POLICY.previousRoundPenalty;
  }

  if (isFollowUpDecision(decision)) {
    score += TRAY_COMPOSER_POLICY.followUpBonus;
  }

  if ((decision.requirements?.flagsAll?.length ?? 0) > 0) {
    score += TRAY_COMPOSER_POLICY.flaggedRequirementBonus;
  }

  if ((decision.setsFlags?.length ?? 0) > 0) {
    score += TRAY_COMPOSER_POLICY.setsFlagBonus;
  }

  score += decision.tags.length * TRAY_COMPOSER_POLICY.tagWeight;

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

function appendPickedDecision(
  chosen: DecisionDefinition[],
  picked: PickedDecision,
  chosenIds: Set<string>,
  chosenPacks: Set<DecisionPackId>,
  groupCounts: Map<DecisionGroup, number>,
  context: TrayScoreContext,
  pickReasons: TrayPickDiagnostic[],
): void {
  const { decision } = picked;
  const reasons = getCandidateReasons(
    decision,
    chosen,
    groupCounts,
    chosenPacks,
    context,
    picked.options,
  );

  chosen.push(decision);
  chosenIds.add(decision.id);
  chosenPacks.add(decision.pack);
  groupCounts.set(decision.group, (groupCounts.get(decision.group) ?? 0) + 1);
  pickReasons.push({
    decisionId: decision.id,
    score: picked.score,
    reasons,
  });
}

function countDistinctGroups(decisions: DecisionDefinition[]): number {
  return new Set(decisions.map((decision) => decision.group)).size;
}

function countDistinctPacks(decisions: DecisionDefinition[]): number {
  return new Set(decisions.map((decision) => decision.pack)).size;
}

function scoreTrayCandidate(
  entry: RankedDecision,
  chosen: DecisionDefinition[],
  groupCounts: Map<DecisionGroup, number>,
  chosenPacks: Set<DecisionPackId>,
  context: TrayScoreContext,
): number {
  const { decision } = entry;
  const groupCount = groupCounts.get(decision.group) ?? 0;
  const distinctGroups = countDistinctGroups(chosen);
  const groupTarget = Math.min(
    TRAY_COMPOSER_POLICY.minDistinctGroups,
    TRAY_COMPOSER_POLICY.mainTraySize,
    context.availableGroupCount,
  );
  const packTarget = Math.min(
    TRAY_COMPOSER_POLICY.minDistinctPacks,
    TRAY_COMPOSER_POLICY.mainTraySize,
    context.availablePackCount,
  );
  let score = entry.score;

  if (groupCount === 0) {
    score +=
      distinctGroups < groupTarget
        ? TRAY_COMPOSER_POLICY.neededGroupBonus
        : TRAY_COMPOSER_POLICY.newGroupBonus;
  } else {
    score += TRAY_COMPOSER_POLICY.duplicateGroupPenalty * groupCount;
  }

  if (groupCount >= TRAY_COMPOSER_POLICY.maxGroupDuplicates) {
    score += TRAY_COMPOSER_POLICY.groupCapPenalty;
  }

  if (!chosenPacks.has(decision.pack)) {
    score +=
      chosenPacks.size < packTarget
        ? TRAY_COMPOSER_POLICY.neededPackBonus
        : TRAY_COMPOSER_POLICY.newPackBonus;
  }

  if (context.previousRoundIds.has(decision.id)) {
    score += TRAY_COMPOSER_POLICY.repeatTrayPenalty;
  } else {
    score += TRAY_COMPOSER_POLICY.noRepeatCandidateBonus;
  }

  return score;
}

function getCandidateReasons(
  decision: DecisionDefinition,
  chosen: DecisionDefinition[],
  groupCounts: Map<DecisionGroup, number>,
  chosenPacks: Set<DecisionPackId>,
  context: TrayScoreContext,
  options: PickCandidateOptions,
): TrayPickReason[] {
  const groupCount = groupCounts.get(decision.group) ?? 0;
  const distinctGroups = countDistinctGroups(chosen);
  const groupTarget = Math.min(
    TRAY_COMPOSER_POLICY.minDistinctGroups,
    TRAY_COMPOSER_POLICY.mainTraySize,
    context.availableGroupCount,
  );
  const packTarget = Math.min(
    TRAY_COMPOSER_POLICY.minDistinctPacks,
    TRAY_COMPOSER_POLICY.mainTraySize,
    context.availablePackCount,
  );
  const reasons = new Set(getUtilityReasons(decision, context.run));

  if (
    (groupCount === 0 && distinctGroups < groupTarget) ||
    (!chosenPacks.has(decision.pack) && chosenPacks.size < packTarget) ||
    options.requireNewPack
  ) {
    addReason(reasons, "coverage-repair");
  }

  if (
    context.previousRoundIds.size > 0 &&
    !context.previousRoundIds.has(decision.id)
  ) {
    addReason(reasons, "repeat-avoidance");
  }

  return sortReasons(reasons);
}

function pickCandidate(
  ranked: RankedDecision[],
  chosen: DecisionDefinition[],
  chosenIds: Set<string>,
  previousRoundIds: Set<string>,
  chosenPacks: Set<DecisionPackId>,
  groupCounts: Map<DecisionGroup, number>,
  context: TrayScoreContext,
  options: PickCandidateOptions,
): PickedDecision | null {
  let best: PickedDecision | null = null;

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
      (groupCounts.get(decision.group) ?? 0) >=
        TRAY_COMPOSER_POLICY.maxGroupDuplicates
    ) {
      continue;
    }

    const setScore = scoreTrayCandidate(
      entry,
      chosen,
      groupCounts,
      chosenPacks,
      context,
    );

    if (
      !best ||
      setScore > best.score ||
      (setScore === best.score && entry.seededIndex < best.seededIndex)
    ) {
      best = {
        decision,
        score: setScore,
        seededIndex: entry.seededIndex,
        options,
      };
    }
  }

  return best;
}

export function createEmptyTrayPickReasonCounts(): TrayPickReasonCounts {
  return Object.fromEntries(
    TRAY_PICK_REASONS.map((reason) => [reason, 0]),
  ) as TrayPickReasonCounts;
}

export function summarizeTrayPickReasons(
  pickReasons: TrayPickDiagnostic[],
): TrayPickReasonCounts {
  const counts = createEmptyTrayPickReasonCounts();

  for (const pick of pickReasons) {
    for (const reason of pick.reasons) {
      counts[reason] += 1;
    }
  }

  return counts;
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
  const pickReasons: TrayPickDiagnostic[] = [];
  const scoreContext: TrayScoreContext = {
    run,
    previousRoundIds,
    availableGroupCount: new Set(ranked.map((entry) => entry.decision.group))
      .size,
    availablePackCount: new Set(ranked.map((entry) => entry.decision.pack))
      .size,
  };
  const packTarget = Math.min(
    TRAY_COMPOSER_POLICY.minDistinctPacks,
    TRAY_COMPOSER_POLICY.mainTraySize,
    new Set(ranked.map((entry) => entry.decision.pack)).size,
  );

  while (chosenPacks.size < packTarget) {
    const candidate =
      pickCandidate(
        ranked,
        chosen,
        chosenIds,
        previousRoundIds,
        chosenPacks,
        groupCounts,
        scoreContext,
        {
          allowRepeats: false,
          enforceGroupCap: true,
          requireNewPack: true,
        },
      ) ??
      pickCandidate(
        ranked,
        chosen,
        chosenIds,
        previousRoundIds,
        chosenPacks,
        groupCounts,
        scoreContext,
        {
          allowRepeats: true,
          enforceGroupCap: true,
          requireNewPack: true,
        },
      ) ??
      pickCandidate(
        ranked,
        chosen,
        chosenIds,
        previousRoundIds,
        chosenPacks,
        groupCounts,
        scoreContext,
        {
          allowRepeats: true,
          enforceGroupCap: false,
          requireNewPack: true,
        },
      );

    if (!candidate) {
      break;
    }

    appendPickedDecision(
      chosen,
      candidate,
      chosenIds,
      chosenPacks,
      groupCounts,
      scoreContext,
      pickReasons,
    );
  }

  if (!chosen.some(isFollowUpDecision)) {
    const followUpCandidate =
      pickCandidate(
        ranked,
        chosen,
        chosenIds,
        previousRoundIds,
        chosenPacks,
        groupCounts,
        scoreContext,
        {
          allowRepeats: false,
          enforceGroupCap: true,
          requireFollowUp: true,
        },
      ) ??
      pickCandidate(
        ranked,
        chosen,
        chosenIds,
        previousRoundIds,
        chosenPacks,
        groupCounts,
        scoreContext,
        {
          allowRepeats: true,
          enforceGroupCap: true,
          requireFollowUp: true,
        },
      );

    if (followUpCandidate) {
      appendPickedDecision(
        chosen,
        followUpCandidate,
        chosenIds,
        chosenPacks,
        groupCounts,
        scoreContext,
        pickReasons,
      );
    }
  }

  while (chosen.length < TRAY_COMPOSER_POLICY.mainTraySize) {
    const candidate =
      pickCandidate(
        ranked,
        chosen,
        chosenIds,
        previousRoundIds,
        chosenPacks,
        groupCounts,
        scoreContext,
        {
          allowRepeats: false,
          enforceGroupCap: true,
        },
      ) ??
      pickCandidate(
        ranked,
        chosen,
        chosenIds,
        previousRoundIds,
        chosenPacks,
        groupCounts,
        scoreContext,
        {
          allowRepeats: true,
          enforceGroupCap: true,
        },
      ) ??
      pickCandidate(
        ranked,
        chosen,
        chosenIds,
        previousRoundIds,
        chosenPacks,
        groupCounts,
        scoreContext,
        {
          allowRepeats: true,
          enforceGroupCap: false,
        },
      );

    if (!candidate) {
      break;
    }

    appendPickedDecision(
      chosen,
      candidate,
      chosenIds,
      chosenPacks,
      groupCounts,
      scoreContext,
      pickReasons,
    );
  }

  let exitPreserved = false;

  if (exits.length > 0) {
    const [bestExit] = [...exits].sort(
      (left, right) =>
        scoreDecision(right, run, previousRoundIds) -
        scoreDecision(left, run, previousRoundIds),
    );
    if (bestExit) {
      appendPickedDecision(
        chosen,
        {
          decision: bestExit,
          score: scoreDecision(bestExit, run, previousRoundIds),
          seededIndex: mainPool.length,
          options: {
            allowRepeats: true,
            enforceGroupCap: false,
          },
        },
        chosenIds,
        chosenPacks,
        groupCounts,
        scoreContext,
        pickReasons,
      );
      exitPreserved = true;
    }
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
      reasonCounts: summarizeTrayPickReasons(pickReasons),
    },
  };
}

export function getAvailableDecisions(
  decisions: DecisionDefinition[],
  run: RunState,
): DecisionDefinition[] {
  return composeDecisionTray(decisions, run).decisions;
}
