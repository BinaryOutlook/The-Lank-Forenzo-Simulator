import {
  hashNumber,
  hashString,
  pickWeighted,
  shuffleWithSeed,
} from "../../lib/random/seeded";
import { getImpactSetScore } from "../state/metricSemantics";
import { getAvailableDecisions } from "../systems/decisionEngine";
import { applyImpactSet } from "../systems/metricEffects";
import { loadContent } from "../content";
import { getAutomaticEndingId } from "../systems/endingRules";
import { meetsRequirements } from "../systems/requirements";
import {
  type ContentBundle,
  type DecisionDefinition,
  type EndingId,
  type EventDefinition,
  type HistoryEntry,
  type ImpactSet,
  type PendingEvent,
  type RunMetrics,
  type RunState,
} from "../state/types";

function toneFromImpact(impacts: ImpactSet): HistoryEntry["tone"] {
  const score = getImpactSetScore(impacts);

  if (score > 5) {
    return "positive";
  }

  if (score < -5) {
    return "negative";
  }

  return "neutral";
}

function buildHistoryEntry(
  round: number,
  source: HistoryEntry["source"],
  title: string,
  body: string,
  impacts: ImpactSet,
): HistoryEntry {
  return {
    id: `${source}-${title}-${round}-${Math.abs(hashNumber(round, Object.keys(impacts).length))}`,
    round,
    source,
    title,
    body,
    tone: toneFromImpact(impacts),
  };
}

function resolveOperatingDrift(metrics: RunMetrics): {
  impacts: ImpactSet;
  body: string;
} {
  const operatingBalance =
    metrics.assetValue * 0.09 +
    metrics.marketConfidence * 1.1 +
    metrics.workforceMorale * 0.35 +
    metrics.safetyIntegrity * 0.22 -
    metrics.debt * 0.075 -
    metrics.workforceSize * 0.008 -
    metrics.publicAnger * 0.42 -
    metrics.legalHeat * 0.35;

  const cashDelta = Math.round(operatingBalance / 4);
  const confidenceDelta =
    Math.round(cashDelta / 10) -
    (metrics.publicAnger > 55 ? 2 : 0) -
    (metrics.legalHeat > 70 ? 2 : 0);
  const creditorDelta = cashDelta >= 0 ? 1 : -2;
  const stockDelta =
    Math.round(cashDelta / 12) +
    (metrics.marketConfidence >= 60 ? 2 : 0) -
    (metrics.legalHeat >= 70 ? 3 : 0);
  const moraleDelta = metrics.safetyIntegrity >= 68 ? 1 : -1;
  const heatDelta =
    metrics.safetyIntegrity < 45 ? 3 : metrics.safetyIntegrity > 75 ? -1 : 0;
  const angerDelta = metrics.workforceMorale < 40 ? 3 : -1;

  const impacts: ImpactSet = {
    airlineCash: cashDelta,
    marketConfidence: confidenceDelta,
    creditorPatience: creditorDelta,
    stockPrice: stockDelta,
    workforceMorale: moraleDelta,
    legalHeat: heatDelta,
    publicAnger: angerDelta,
  };

  const body =
    cashDelta >= 0
      ? "The quarter closes with enough cash discipline to keep the board listening."
      : "Operations bleed cash faster than the story can hide it.";

  return { impacts, body };
}

function processEvent(
  event: EventDefinition,
  round: number,
  metrics: RunMetrics,
  flags: Set<string>,
  eventCounts: Record<string, number>,
): { metrics: RunMetrics; flags: Set<string>; history: HistoryEntry } {
  const nextMetrics = applyImpactSet(metrics, event.impacts);
  const nextFlags = new Set(flags);

  for (const flag of event.setsFlags ?? []) {
    nextFlags.add(flag);
  }

  eventCounts[event.id] = (eventCounts[event.id] ?? 0) + 1;

  return {
    metrics: nextMetrics,
    flags: nextFlags,
    history: buildHistoryEntry(
      round,
      "event",
      event.title,
      event.body,
      event.impacts,
    ),
  };
}

export function createInitialRunState(): RunState {
  return {
    status: "active",
    round: 1,
    metrics: {
      airlineCash: 320,
      personalWealth: 6,
      debt: 690,
      assetValue: 980,
      workforceSize: 7600,
      workforceMorale: 58,
      marketConfidence: 52,
      creditorPatience: 56,
      legalHeat: 24,
      safetyIntegrity: 72,
      publicAnger: 28,
      stockPrice: 18,
      offshoreReadiness: 8,
    },
    selectedDecisionIds: [],
    lastOfferedDecisionIds: [],
    pendingEvents: [],
    flags: [],
    endingId: null,
    eventCounts: {},
    history: [
      {
        id: "opening-brief",
        round: 1,
        source: "system",
        title: "Opening Board Packet",
        body: "The company still looks rescuable. That makes it valuable.",
        tone: "neutral",
      },
    ],
  };
}

function getDecisionMap(
  content: ContentBundle,
): Map<string, DecisionDefinition> {
  return new Map(content.decisions.map((decision) => [decision.id, decision]));
}

function pickDelayedEventId(
  decisionId: string,
  round: number,
  delayed: NonNullable<DecisionDefinition["delayedConsequences"]>[number],
): string | null {
  if (delayed.eventId) {
    return delayed.eventId;
  }

  const eventIds: string[] = delayed.eventIds ?? [];

  if (eventIds.length === 0) {
    return null;
  }

  if (eventIds.length === 1) {
    return eventIds[0] ?? null;
  }

  const seededChoices = shuffleWithSeed(
    eventIds,
    hashNumber(round, delayed.delay, hashString(decisionId)),
  );
  return seededChoices[0] ?? null;
}

interface SelectedDecisionResult {
  metrics: RunMetrics;
  flags: Set<string>;
  pendingEvents: PendingEvent[];
  historyEntries: HistoryEntry[];
  endingId: EndingId | null;
}

function applySelectedDecisions(
  run: RunState,
  round: number,
  decisionMap: Map<string, DecisionDefinition>,
): SelectedDecisionResult {
  let metrics = { ...run.metrics };
  let endingId: EndingId | null = null;
  const flags = new Set(run.flags);
  const historyEntries: HistoryEntry[] = [];
  const pendingEvents = [...run.pendingEvents];

  for (const decisionId of run.selectedDecisionIds) {
    const decision = decisionMap.get(decisionId);
    if (!decision) {
      continue;
    }

    metrics = applyImpactSet(metrics, decision.impacts);
    historyEntries.push(
      buildHistoryEntry(
        round,
        "decision",
        decision.title,
        decision.summary,
        decision.impacts,
      ),
    );

    for (const delayed of decision.delayedConsequences ?? []) {
      const eventId = pickDelayedEventId(decision.id, round, delayed);

      if (!eventId) {
        continue;
      }

      pendingEvents.push({
        eventId,
        triggerRound: round + delayed.delay,
      });
    }

    for (const flag of decision.setsFlags ?? []) {
      flags.add(flag);
    }

    if (decision.ending) {
      endingId = decision.ending;
    }
  }

  return {
    metrics,
    flags,
    pendingEvents,
    historyEntries,
    endingId,
  };
}

function applyOperatingDriftStep(
  round: number,
  metrics: RunMetrics,
): { metrics: RunMetrics; history: HistoryEntry } {
  const operatingDrift = resolveOperatingDrift(metrics);

  return {
    metrics: applyImpactSet(metrics, operatingDrift.impacts),
    history: buildHistoryEntry(
      round,
      "system",
      "Quarter Close",
      operatingDrift.body,
      operatingDrift.impacts,
    ),
  };
}

interface EventResolutionResult {
  metrics: RunMetrics;
  flags: Set<string>;
  pendingEvents: PendingEvent[];
  historyEntries: HistoryEntry[];
}

function resolveDueDelayedEvents(
  run: RunState,
  round: number,
  metrics: RunMetrics,
  flags: Set<string>,
  eventCounts: Record<string, number>,
  pendingEvents: PendingEvent[],
  delayedEvents: EventDefinition[],
): EventResolutionResult {
  let nextMetrics = metrics;
  let nextFlags = flags;
  const historyEntries: HistoryEntry[] = [];
  const remainingPendingEvents: PendingEvent[] = [];

  for (const pendingEvent of pendingEvents) {
    if (pendingEvent.triggerRound > round) {
      remainingPendingEvents.push(pendingEvent);
      continue;
    }

    const event = delayedEvents.find(
      (entry) => entry.id === pendingEvent.eventId,
    );
    if (!event) {
      continue;
    }

    const probeRun: RunState = {
      ...run,
      round,
      metrics: nextMetrics,
      flags: [...nextFlags],
    };

    if (!meetsRequirements(event.requirements, probeRun)) {
      continue;
    }

    const processed = processEvent(
      event,
      round,
      nextMetrics,
      nextFlags,
      eventCounts,
    );
    nextMetrics = processed.metrics;
    nextFlags = processed.flags;
    historyEntries.push(processed.history);
  }

  return {
    metrics: nextMetrics,
    flags: nextFlags,
    pendingEvents: remainingPendingEvents,
    historyEntries,
  };
}

function resolveAmbientEvent(
  run: RunState,
  round: number,
  metrics: RunMetrics,
  flags: Set<string>,
  eventCounts: Record<string, number>,
  events: EventDefinition[],
): { metrics: RunMetrics; flags: Set<string>; history: HistoryEntry | null } {
  const ambientEvents = events.filter((event) => event.kind === "ambient");
  const ambientCandidates = ambientEvents.filter((event) =>
    meetsRequirements(event.requirements, {
      ...run,
      round,
      metrics,
      flags: [...flags],
    }),
  );

  const pickedAmbientEvent = pickWeighted(
    ambientCandidates,
    (event) => {
      const seenPenalty = eventCounts[event.id]
        ? Math.max(1, event.weight - eventCounts[event.id] * 2)
        : event.weight;
      return seenPenalty;
    },
    hashNumber(
      round,
      metrics.legalHeat,
      metrics.publicAnger,
      metrics.marketConfidence,
    ),
  );

  if (!pickedAmbientEvent) {
    return { metrics, flags, history: null };
  }

  const processed = processEvent(
    pickedAmbientEvent,
    round,
    metrics,
    flags,
    eventCounts,
  );

  return {
    metrics: processed.metrics,
    flags: processed.flags,
    history: processed.history,
  };
}

export function resolveRound(run: RunState): RunState {
  const content = loadContent();
  const offeredThisRound = getAvailableDecisions(content.decisions, run).map(
    (decision) => decision.id,
  );
  const decisionMap = getDecisionMap(content);
  const round = run.round + 1;
  const eventCounts = { ...run.eventCounts };

  const selectedDecisionResult = applySelectedDecisions(
    run,
    round,
    decisionMap,
  );
  let metrics = selectedDecisionResult.metrics;
  let flags = selectedDecisionResult.flags;
  let endingId = selectedDecisionResult.endingId;
  const historyEntries = [...selectedDecisionResult.historyEntries];

  const operatingDrift = applyOperatingDriftStep(round, metrics);
  metrics = operatingDrift.metrics;
  historyEntries.push(operatingDrift.history);

  const delayedEvents = content.events.filter(
    (event) => event.kind === "delayed",
  );
  const delayedResult = resolveDueDelayedEvents(
    run,
    round,
    metrics,
    flags,
    eventCounts,
    selectedDecisionResult.pendingEvents,
    delayedEvents,
  );
  metrics = delayedResult.metrics;
  flags = delayedResult.flags;
  historyEntries.push(...delayedResult.historyEntries);

  if (!endingId) {
    const ambientResult = resolveAmbientEvent(
      run,
      round,
      metrics,
      flags,
      eventCounts,
      content.events,
    );
    metrics = ambientResult.metrics;
    flags = ambientResult.flags;
    if (ambientResult.history) {
      historyEntries.push(ambientResult.history);
    }

    endingId = getAutomaticEndingId(metrics);
  }

  return {
    status: endingId ? "ended" : "active",
    round,
    metrics,
    selectedDecisionIds: [],
    lastOfferedDecisionIds: offeredThisRound,
    pendingEvents: delayedResult.pendingEvents,
    flags: [...flags],
    endingId,
    eventCounts,
    history: [...historyEntries.reverse(), ...run.history].slice(0, 24),
  };
}
