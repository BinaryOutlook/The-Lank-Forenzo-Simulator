import type {
  DecisionDefinition,
  EndingId,
  HistoryEntry,
  RecapItem,
  RunRecap,
  RunState,
} from "../state/types.js";
import type { DossierThread } from "../dossiers/dossierState.js";
import { summarizeDossiers } from "../dossiers/dossierState.js";
import type { FactionState, FactionStates } from "../factions/factionState.js";
import type { NetworkState } from "../operations/networkState.js";
import type { NetworkQuarterResult } from "../operations/networkResolution.js";

interface StrategyProfile {
  title: string;
  interpretation: string;
}

const STRATEGY_PROFILES: Record<DecisionDefinition["group"], StrategyProfile> =
  {
    labor: {
      title: "Labor shock doctrine",
      interpretation:
        "The run treated the workforce as the cheapest shock absorber, which made people and witnesses the durable memory.",
    },
    finance: {
      title: "Balance-sheet scavenger",
      interpretation:
        "The record leaned on debt, covenants, asset math, and creditor patience as disposable camouflage.",
    },
    operations: {
      title: "Operational denial",
      interpretation:
        "The operation was asked to absorb visible damage so the executive story could keep moving.",
    },
    market: {
      title: "Market-theater operator",
      interpretation:
        "The run sold belief into the room faster than the airline could create durable value.",
    },
    legal: {
      title: "Regulatory theater",
      interpretation:
        "The strategy bought procedure and delay, but procedure leaves a paper trail when the room turns hostile.",
    },
    extraction: {
      title: "Private-ledger extraction",
      interpretation:
        "The company became a vehicle for personal liquidity, and the world learned to price that split.",
    },
    exit: {
      title: "Exit-window commitment",
      interpretation:
        "The final moves were less about repair than getting out before the proof arrived.",
    },
  };
const decisionTitleIndexCache = new WeakMap<
  DecisionDefinition[],
  Map<string, DecisionDefinition>
>();

function getDecisionTitleIndex(
  decisions: DecisionDefinition[],
): Map<string, DecisionDefinition> {
  const cached = decisionTitleIndexCache.get(decisions);

  if (cached) {
    return cached;
  }

  const indexed = new Map(
    decisions.map((decision) => [decision.title, decision]),
  );
  decisionTitleIndexCache.set(decisions, indexed);

  return indexed;
}

function findDecisionsInHistory(
  decisions: DecisionDefinition[],
  historyEntries: HistoryEntry[],
): DecisionDefinition[] {
  const decisionByTitle = getDecisionTitleIndex(decisions);

  return historyEntries
    .filter((entry) => entry.source === "decision")
    .map((entry) => decisionByTitle.get(entry.title))
    .filter((decision): decision is DecisionDefinition => Boolean(decision));
}

function buildOutcomeItems(run: RunState, endingId: EndingId): RecapItem[] {
  if (endingId === "prison") {
    const safetyClause =
      run.metrics.safetyIntegrity <= 35
        ? ` paired with safety integrity ${run.metrics.safetyIntegrity}`
        : "";

    return [
      {
        title: "Why it ended",
        body: `Legal heat reached ${run.metrics.legalHeat}${safetyClause}. Prosecutors no longer needed a theory; the run had become a file with a spine.`,
      },
    ];
  }

  if (endingId === "forcedRemoval") {
    const trigger =
      run.metrics.creditorPatience <= 0
        ? `creditor patience collapsed to ${run.metrics.creditorPatience}`
        : run.metrics.airlineCash <= -140
          ? `airline cash fell to ${run.metrics.airlineCash}`
          : `market confidence fell to ${run.metrics.marketConfidence}`;

    return [
      {
        title: "Why it ended",
        body: `${formatId(trigger)} before a clean exit could be staged. The board, lenders, and press could finally agree on one thing: removal was cheaper than patience.`,
      },
    ];
  }

  if (endingId === "merger") {
    return [
      {
        title: "Why it ended",
        body: "The merger offer matured before the pressure did. The airline disappeared into a cleaner logo while the most useful liabilities became someone else's diligence problem.",
      },
    ];
  }

  if (endingId === "extraction") {
    return [
      {
        title: "Why it ended",
        body: `Market confidence ${run.metrics.marketConfidence}, stock price ${run.metrics.stockPrice}, and personal wealth ${run.metrics.personalWealth} lined up before legal heat crossed the exit ceiling.`,
      },
    ];
  }

  return [
    {
      title: "Why it ended",
      body: `Offshore readiness ${run.metrics.offshoreReadiness} and personal wealth ${run.metrics.personalWealth} made flight more valuable than testimony.`,
    },
  ];
}

function buildDominantStrategyItems(input: {
  run: RunState;
  decisions: DecisionDefinition[];
  decisionById: Record<string, DecisionDefinition>;
  selectedDecisionIds: string[];
  historyEntries: HistoryEntry[];
}): RecapItem[] {
  const historicalDecisions = findDecisionsInHistory(
    input.decisions,
    input.historyEntries,
  );
  const visibleDecisions =
    historicalDecisions.length > 0
      ? historicalDecisions
      : input.selectedDecisionIds
          .map((decisionId) => input.decisionById[decisionId])
          .filter((decision): decision is DecisionDefinition =>
            Boolean(decision),
          );

  if (visibleDecisions.length === 0) {
    return [
      {
        title: "Crisis improvisation",
        body: `No single playbook controlled the visible record. By round ${input.run.round}, accumulated pressure mattered more than one decisive move.`,
      },
    ];
  }

  const groupCounts = new Map<DecisionDefinition["group"], number>();

  for (const decision of visibleDecisions) {
    groupCounts.set(decision.group, (groupCounts.get(decision.group) ?? 0) + 1);
  }

  const [dominantGroup, count] = [...groupCounts.entries()].sort(
    ([leftGroup, leftCount], [rightGroup, rightCount]) => {
      if (rightCount !== leftCount) {
        return rightCount - leftCount;
      }

      return leftGroup.localeCompare(rightGroup);
    },
  )[0] ?? ["market", 0];
  const profile = STRATEGY_PROFILES[dominantGroup];
  const finalDecision =
    input.selectedDecisionIds
      .map((decisionId) => input.decisionById[decisionId])
      .find((decision): decision is DecisionDefinition => Boolean(decision)) ??
    visibleDecisions[0];

  return [
    {
      title: profile.title,
      body: `${count} visible decision ${count === 1 ? "record points" : "records point"} to ${formatId(dominantGroup)} as the dominant method. ${profile.interpretation} Last clear move: ${finalDecision.title}.`,
    },
  ];
}

function buildFactionRecapItems(factions: FactionStates): RecapItem[] {
  return Object.values(factions)
    .sort(
      (left, right) =>
        Math.max(right.aggression, right.leverage) -
        Math.max(left.aggression, left.leverage),
    )
    .slice(0, 2)
    .map((faction) => {
      const grievance =
        faction.recentGrievances[0] ??
        "No single grievance controlled the room, so accumulated suspicion did the work.";
      const intent = faction.currentIntent
        ? `Intent ${formatId(faction.currentIntent.family)} at urgency ${faction.currentIntent.urgency}.`
        : "Intent not active.";

      return {
        title: `${formatId(faction.id)} pressure`,
        body: `${intent} Aggression ${faction.aggression}, leverage ${faction.leverage}. ${formatFactionBehaviorMemory(faction)} ${grievance}`,
      };
    });
}

function formatFactionBehaviorMemory(faction: FactionState): string {
  const [topPattern, count] =
    Object.entries(faction.behaviorMemory).sort(
      (left, right) => (right[1] ?? 0) - (left[1] ?? 0),
    )[0] ?? [];

  if (topPattern && typeof count === "number" && count > 0) {
    return `Remembered pattern: ${formatId(topPattern)} x${count}.`;
  }

  return "No repeated behavior pattern dominated.";
}

function buildOperationRecapItems(
  operations: NetworkState,
  operationResult: NetworkQuarterResult,
): RecapItem[] {
  const cascade = operationResult.cascades[0];

  if (cascade) {
    return [
      {
        title: formatId(cascade.id),
        body: `${cascade.body} Severity ${cascade.severity}; maintenance backlog ${operations.maintenanceBacklog}; service disruption ${operations.serviceDisruption}.`,
      },
    ];
  }

  return [
    {
      title: "Accumulated network drag",
      body: `No named cascade landed, but maintenance backlog ${operations.maintenanceBacklog} and service disruption ${operations.serviceDisruption} show how much damage the operation had to swallow.`,
    },
  ];
}

function buildDossierRecapItems(dossiers: DossierThread[]): RecapItem[] {
  return summarizeDossiers(dossiers, 2).map((summary) => {
    const witnessClause =
      summary.witnesses.length > 0
        ? ` Witnesses: ${summary.witnesses.slice(0, 2).join(", ")}.`
        : "";

    return {
      title: formatId(summary.theme),
      body: `${summary.caseTheory} The case file can tie evidence weight ${summary.evidenceWeight} and severity ${summary.severity} to ${formatId(summary.likelyExposure)}.${witnessClause}`,
    };
  });
}

function buildCriticalChainItems(
  selectedDecisionIds: string[],
  decisionById: Record<string, DecisionDefinition>,
): RecapItem[] {
  return selectedDecisionIds.slice(0, 3).map((decisionId) => {
    const decision = decisionById[decisionId];

    if (!decision) {
      return {
        title: formatId(decisionId),
        body: "Selected in the final resolved quarter.",
      };
    }

    return {
      title: decision.title,
      body: `${decision.summary} This was a final-quarter ${formatId(decision.group)} move.`,
    };
  });
}

export function buildRunRecap(input: {
  run: RunState;
  endingId: EndingId;
  factions: FactionStates;
  operations: NetworkState;
  dossiers: DossierThread[];
  selectedDecisionIds: string[];
  decisions: DecisionDefinition[];
  decisionById: Record<string, DecisionDefinition>;
  historyEntries: HistoryEntry[];
  operationResult: NetworkQuarterResult;
}): RunRecap {
  return {
    headline: `The ${formatId(input.endingId)} record is now legible.`,
    outcome: buildOutcomeItems(input.run, input.endingId),
    dominantStrategy: buildDominantStrategyItems({
      run: input.run,
      decisions: input.decisions,
      decisionById: input.decisionById,
      selectedDecisionIds: input.selectedDecisionIds,
      historyEntries: input.historyEntries,
    }),
    factions: buildFactionRecapItems(input.factions),
    operations: buildOperationRecapItems(
      input.operations,
      input.operationResult,
    ),
    dossiers: buildDossierRecapItems(input.dossiers),
    missedExitWindows: getMissedExitWindows(input.run, input.endingId),
    criticalChains: buildCriticalChainItems(
      input.selectedDecisionIds,
      input.decisionById,
    ),
  };
}

function getMissedExitWindows(run: RunState, endingId: EndingId): RecapItem[] {
  const missed: RecapItem[] = [];

  if (endingId !== "merger" && run.flags.includes("mergerOffer")) {
    missed.push({
      title: "Merger offer",
      body: "A buyer had reached the table, but the ending fired before you converted that offer into a clean corporate disappearing act.",
    });
  } else if (
    endingId !== "merger" &&
    ["mergerNarrative", "suitorWhispers", "synergyDeckReady"].some((flag) =>
      run.flags.includes(flag),
    )
  ) {
    missed.push({
      title: "Merger narrative",
      body: "The sale story existed, but it never matured into a firm offer before the scandal overtook the deck.",
    });
  }

  if (
    endingId !== "extraction" &&
    run.round >= 7 &&
    run.metrics.marketConfidence >= 65 &&
    run.metrics.stockPrice >= 28 &&
    run.metrics.personalWealth >= 35 &&
    run.metrics.legalHeat <= 74
  ) {
    missed.push({
      title: "Respectable exit",
      body: "The market, stock price, and private ledger were aligned for a cash-out, but the final choice did not take the window.",
    });
  } else if (
    endingId !== "extraction" &&
    run.round >= 7 &&
    run.metrics.marketConfidence >= 60 &&
    run.metrics.stockPrice >= 24 &&
    run.metrics.personalWealth >= 30 &&
    run.metrics.legalHeat > 74
  ) {
    missed.push({
      title: "Extraction window",
      body: "Market belief was available, but personal exposure made the cash-out unsafe.",
    });
  }

  if (
    endingId !== "bahamas" &&
    run.round >= 6 &&
    run.metrics.offshoreReadiness >= 35 &&
    run.metrics.personalWealth >= 45
  ) {
    missed.push({
      title: "Nassau run",
      body: "The offshore apparatus and personal liquidity were both ready, but the escape route was left unused.",
    });
  } else if (
    endingId !== "bahamas" &&
    run.round >= 6 &&
    run.metrics.offshoreReadiness >= 35 &&
    run.metrics.personalWealth < 45
  ) {
    missed.push({
      title: "Nassau window",
      body: "The offshore apparatus was nearly ready before personal liquidity caught up.",
    });
  }

  if (
    missed.length === 0 &&
    (endingId === "prison" || endingId === "forcedRemoval")
  ) {
    missed.push({
      title: "No clean window left",
      body: "By the time the ending fired, every exit route still needed more market belief, personal liquidity, offshore preparation, or merger proof.",
    });
  }

  return missed.slice(0, 3);
}

function formatId(value: string): string {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
