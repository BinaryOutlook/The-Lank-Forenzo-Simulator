import { hashNumber, hashString, pickWeighted, shuffleWithSeed } from "../../lib/random/seeded";
import { getImpactSetScore } from "../state/metricSemantics";
import { loadContent } from "../content";
import {
  boundedMetricKeys,
  type ContentBundle,
  type DecisionDefinition,
  type EndingId,
  type EventDefinition,
  type HistoryEntry,
  type ImpactSet,
  type MetricKey,
  type RunMetrics,
  type RunState,
} from "../state/types";

function clamp(number: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, number));
}

function applyImpact(metrics: RunMetrics, impacts: ImpactSet): RunMetrics {
  const next: RunMetrics = { ...metrics };

  for (const [metric, delta] of Object.entries(impacts)) {
    if (delta === undefined) {
      continue;
    }

    const key = metric as MetricKey;
    next[key] += delta;
  }

  for (const metric of boundedMetricKeys) {
    next[metric] = clamp(next[metric], 0, 100);
  }

  next.stockPrice = clamp(next.stockPrice, 2, 120);
  next.debt = clamp(next.debt, 0, 1200);
  next.assetValue = clamp(next.assetValue, 120, 1500);
  next.workforceSize = clamp(next.workforceSize, 1200, 12000);
  next.personalWealth = clamp(next.personalWealth, 0, 240);
  next.airlineCash = clamp(next.airlineCash, -280, 900);

  return next;
}

function meetsEventRequirements(event: EventDefinition, run: RunState): boolean {
  const requirements = event.requirements;
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

function resolveOperatingDrift(metrics: RunMetrics): { impacts: ImpactSet; body: string } {
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
  const confidenceDelta = Math.round(cashDelta / 10) - (metrics.publicAnger > 55 ? 2 : 0) - (metrics.legalHeat > 70 ? 2 : 0);
  const creditorDelta = cashDelta >= 0 ? 1 : -2;
  const stockDelta =
    Math.round(cashDelta / 12) +
    (metrics.marketConfidence >= 60 ? 2 : 0) -
    (metrics.legalHeat >= 70 ? 3 : 0);
  const moraleDelta = metrics.safetyIntegrity >= 68 ? 1 : -1;
  const heatDelta = metrics.safetyIntegrity < 45 ? 3 : metrics.safetyIntegrity > 75 ? -1 : 0;
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
  const nextMetrics = applyImpact(metrics, event.impacts);
  const nextFlags = new Set(flags);

  for (const flag of event.setsFlags ?? []) {
    nextFlags.add(flag);
  }

  eventCounts[event.id] = (eventCounts[event.id] ?? 0) + 1;

  return {
    metrics: nextMetrics,
    flags: nextFlags,
    history: buildHistoryEntry(round, "event", event.title, event.body, event.impacts),
  };
}

function checkEnding(metrics: RunMetrics): EndingId | null {
  if (metrics.legalHeat >= 95 || (metrics.legalHeat >= 86 && metrics.safetyIntegrity <= 35)) {
    return "prison";
  }

  if (metrics.creditorPatience <= 0 || metrics.airlineCash <= -140 || metrics.marketConfidence <= 6) {
    return "forcedRemoval";
  }

  return null;
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

function getDecisionMap(content: ContentBundle): Map<string, DecisionDefinition> {
  return new Map(content.decisions.map((decision) => [decision.id, decision]));
}

function pickDelayedEventId(decisionId: string, round: number, delayed: DecisionDefinition["delayedConsequences"][number]): string | null {
  if (delayed.eventId) {
    return delayed.eventId;
  }

  const eventIds = delayed.eventIds ?? [];

  if (eventIds.length === 0) {
    return null;
  }

  if (eventIds.length === 1) {
    return eventIds[0] ?? null;
  }

  const seededChoices = shuffleWithSeed(eventIds, hashNumber(round, delayed.delay, hashString(decisionId)));
  return seededChoices[0] ?? null;
}

export function resolveRound(run: RunState): RunState {
  const content = loadContent();
  const decisionMap = getDecisionMap(content);
  const round = run.round + 1;
  let metrics = { ...run.metrics };
  let endingId: EndingId | null = null;
  let flags = new Set(run.flags);
  const historyEntries: HistoryEntry[] = [];
  const eventCounts = { ...run.eventCounts };
  const nextPendingEvents = [...run.pendingEvents];

  for (const decisionId of run.selectedDecisionIds) {
    const decision = decisionMap.get(decisionId);
    if (!decision) {
      continue;
    }

    metrics = applyImpact(metrics, decision.impacts);
    historyEntries.push(buildHistoryEntry(round, "decision", decision.title, decision.summary, decision.impacts));

    for (const delayed of decision.delayedConsequences ?? []) {
      const eventId = pickDelayedEventId(decision.id, round, delayed);

      if (!eventId) {
        continue;
      }

      nextPendingEvents.push({
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

  const operatingDrift = resolveOperatingDrift(metrics);
  metrics = applyImpact(metrics, operatingDrift.impacts);
  historyEntries.push(buildHistoryEntry(round, "system", "Quarter Close", operatingDrift.body, operatingDrift.impacts));

  const delayedEvents = content.events.filter((event) => event.kind === "delayed");
  const remainingPendingEvents = [];

  for (const pendingEvent of nextPendingEvents) {
    if (pendingEvent.triggerRound > round) {
      remainingPendingEvents.push(pendingEvent);
      continue;
    }

    const event = delayedEvents.find((entry) => entry.id === pendingEvent.eventId);
    if (!event) {
      continue;
    }

    const probeRun: RunState = {
      ...run,
      round,
      metrics,
      flags: [...flags],
    };

    if (!meetsEventRequirements(event, probeRun)) {
      continue;
    }

    const processed = processEvent(event, round, metrics, flags, eventCounts);
    metrics = processed.metrics;
    flags = processed.flags;
    historyEntries.push(processed.history);
  }

  if (!endingId) {
    const ambientEvents = content.events.filter((event) => event.kind === "ambient");
    const ambientCandidates = ambientEvents.filter((event) =>
      meetsEventRequirements(event, {
        ...run,
        round,
        metrics,
        flags: [...flags],
      }),
    );

    const pickedAmbientEvent = pickWeighted(
      ambientCandidates,
      (event) => {
        const seenPenalty = eventCounts[event.id] ? Math.max(1, event.weight - eventCounts[event.id] * 2) : event.weight;
        return seenPenalty;
      },
      hashNumber(round, metrics.legalHeat, metrics.publicAnger, metrics.marketConfidence),
    );

    if (pickedAmbientEvent) {
      const processed = processEvent(pickedAmbientEvent, round, metrics, flags, eventCounts);
      metrics = processed.metrics;
      flags = processed.flags;
      historyEntries.push(processed.history);
    }

    endingId = checkEnding(metrics);
  }

  return {
    status: endingId ? "ended" : "active",
    round,
    metrics,
    selectedDecisionIds: [],
    pendingEvents: remainingPendingEvents,
    flags: [...flags],
    endingId,
    eventCounts,
    history: [...historyEntries.reverse(), ...run.history].slice(0, 24),
  };
}
