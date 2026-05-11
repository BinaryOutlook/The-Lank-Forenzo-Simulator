import {
  hashNumber,
  hashString,
  pickWeighted,
  shuffleWithSeed,
} from "../../lib/random/seeded";
import {
  applyEvidenceFragments,
  collectEvidenceFragments,
  type EvidenceFragment,
} from "../dossiers/evidence";
import {
  createInitialDossierState,
  getDossierCaseTheory,
  getDossierSeverityBand,
  normalizeDossierState,
  summarizeDossiers,
  type DossierSummary,
  type DossierSeverityBand,
  type DossierTheme,
  type DossierThread,
} from "../dossiers/dossierState";
import {
  createInitialFactionStates,
  type FactionEffectSource,
  type FactionIntent,
  type FactionStates,
} from "../factions/factionState";
import {
  planFactionIntents,
  updateFactionStates,
} from "../factions/factionPlanner";
import {
  applyNetworkDecisionEffects,
  createDefaultNetworkState,
  type NetworkState,
} from "../operations/networkState";
import {
  resolveNetworkQuarter,
  type NetworkQuarterResult,
} from "../operations/networkResolution";
import { buildRunRecap } from "./runRecap.js";
import {
  createInitialEventSchedulerState,
  getEventNarrativeWeight,
  noteEventInSchedulerState,
  resolveEventScheduler,
  scheduleEvent,
  type EventSchedulerState,
  type HazardRule,
} from "../scheduler/eventScheduler";
import { getImpactSetScore } from "../state/metricSemantics";
import { getAvailableDecisions } from "../systems/decisionEngine";
import {
  canAffordResourceCosts,
  deductResourceCosts,
  formatResourceCostSummary,
  initialConsumableResources,
  normalizeConsumableResources,
} from "../systems/consumables.js";
import { applyImpactSet } from "../systems/metricEffects";
import { loadContentManifest } from "../content";
import { getAutomaticEndingId } from "../systems/endingRules";
import { meetsRequirements } from "../systems/requirements";
import {
  type BoardSignal,
  type ConsumableResources,
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
  const manifest = loadContentManifest();

  return {
    status: "active",
    round: 1,
    contentVersion: manifest.version,
    contentHash: manifest.contentHash,
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
    resources: initialConsumableResources,
    selectedDecisionIds: [],
    lastOfferedDecisionIds: [],
    pendingEvents: [],
    scheduler: createInitialEventSchedulerState(),
    factions: createInitialFactionStates(),
    operations: createDefaultNetworkState(),
    dossiers: createInitialDossierState(),
    systemSignals: [],
    recap: null,
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
  resources: ConsumableResources;
  flags: Set<string>;
  scheduler: EventSchedulerState;
  historyEntries: HistoryEntry[];
  executedDecisionIds: string[];
  factionEffectSources: FactionEffectSource[];
  executedDecisions: DecisionDefinition[];
  endingId: EndingId | null;
}

function applySelectedDecisions(
  run: RunState,
  round: number,
  decisionById: Record<string, DecisionDefinition>,
  scheduler: EventSchedulerState,
): SelectedDecisionResult {
  let metrics = { ...run.metrics };
  let resources = normalizeConsumableResources(run.resources);
  let endingId: EndingId | null = null;
  const flags = new Set(run.flags);
  const historyEntries: HistoryEntry[] = [];
  const executedDecisionIds: string[] = [];
  const factionEffectSources: FactionEffectSource[] = [];
  const executedDecisions: DecisionDefinition[] = [];
  let nextScheduler = scheduler;

  for (const decisionId of run.selectedDecisionIds) {
    const decision = decisionById[decisionId];
    if (!decision) {
      continue;
    }

    if (!canAffordResourceCosts(resources, decision.resourceCosts)) {
      historyEntries.push({
        id: `system-resource-shortfall-${decision.id}-${round}`,
        round,
        source: "system",
        title: "Strategic Reserve Shortfall",
        body: `${decision.title} stayed on the pad because the reserve ledger could not cover ${formatResourceCostSummary(decision.resourceCosts)}.`,
        tone: "neutral",
      });
      continue;
    }

    resources = deductResourceCosts(resources, decision.resourceCosts);
    metrics = applyImpactSet(metrics, decision.impacts);
    executedDecisionIds.push(decision.id);
    if (decision.factionEffects) {
      factionEffectSources.push({
        sourceId: decision.id,
        effects: decision.factionEffects,
      });
    }
    executedDecisions.push(decision);
    historyEntries.push(
      buildHistoryEntry(
        round,
        "decision",
        decision.title,
        formatDecisionHistoryBody(decision),
        decision.impacts,
      ),
    );

    for (const [index, delayed] of (
      decision.delayedConsequences ?? []
    ).entries()) {
      const eventId = pickDelayedEventId(decision.id, round, delayed);

      if (!eventId) {
        continue;
      }

      nextScheduler = scheduleEvent(nextScheduler, {
        id: `${decision.id}-${eventId}-${round}-${index}`,
        kind: "guaranteed",
        eventId,
        triggerRound: round + delayed.delay,
        priority: 0,
        sourceRefs: [`decision:${decision.id}`],
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
    resources,
    flags,
    scheduler: nextScheduler,
    historyEntries,
    executedDecisionIds,
    factionEffectSources,
    executedDecisions,
    endingId,
  };
}

function formatDecisionHistoryBody(decision: DecisionDefinition): string {
  if (!decision.resourceCosts) {
    return decision.summary;
  }

  return `${decision.summary} Reserve spend: ${formatResourceCostSummary(decision.resourceCosts)}.`;
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
  scheduler: EventSchedulerState;
  historyEntries: HistoryEntry[];
  emittedEventIds: string[];
}

function resolveScheduledEventsStep(
  run: RunState,
  round: number,
  metrics: RunMetrics,
  flags: Set<string>,
  eventCounts: Record<string, number>,
  scheduler: EventSchedulerState,
  eventById: Record<string, EventDefinition>,
  hazardRules: HazardRule[],
): EventResolutionResult {
  let nextMetrics = metrics;
  let nextFlags = flags;
  const historyEntries: HistoryEntry[] = [];
  const emittedEventIds: string[] = [];
  const schedulerResult = resolveEventScheduler({
    run: {
      ...run,
      round,
      metrics: nextMetrics,
      flags: [...nextFlags],
    },
    state: scheduler,
    eventById,
    hazardRules,
    seed: hashNumber(round, nextMetrics.legalHeat, nextMetrics.publicAnger),
    budget: {
      guaranteedEvents: 1,
      hazardEvents: 1,
    },
  });

  for (const emitted of schedulerResult.emittedEvents) {
    const { event } = emitted;
    const processed = processEvent(
      event,
      round,
      nextMetrics,
      nextFlags,
      eventCounts,
    );
    nextMetrics = processed.metrics;
    nextFlags = processed.flags;
    historyEntries.push({
      ...processed.history,
      sourceKind:
        emitted.sourceKind === "hazard" ? "hazard_event" : "scheduled_event",
      scheduledEventId: emitted.sourceId,
      cause: emitted.hazardRule?.explanation,
    });
    emittedEventIds.push(event.id);
  }

  return {
    metrics: nextMetrics,
    flags: nextFlags,
    scheduler: schedulerResult.state,
    historyEntries,
    emittedEventIds,
  };
}

function resolveAmbientEvent(
  run: RunState,
  round: number,
  metrics: RunMetrics,
  flags: Set<string>,
  eventCounts: Record<string, number>,
  events: EventDefinition[],
  scheduler: EventSchedulerState,
): {
  metrics: RunMetrics;
  flags: Set<string>;
  history: HistoryEntry | null;
  eventId: string | null;
  scheduler: EventSchedulerState;
} {
  const ambientEvents = events.filter((event) => event.kind === "ambient");
  const ambientCandidates = ambientEvents.filter((event) =>
    meetsRequirements(event.requirements, {
      ...run,
      round,
      metrics,
      flags: [...flags],
    }),
  );
  const weightedCandidates = ambientCandidates
    .map((event) => {
      const seenPenalty = eventCounts[event.id]
        ? Math.max(1, event.weight - eventCounts[event.id] * 2)
        : event.weight;

      return {
        event,
        weight: getEventNarrativeWeight(event, seenPenalty, scheduler),
      };
    })
    .filter((candidate) => candidate.weight > 0);
  const ambientPool =
    weightedCandidates.length > 0
      ? weightedCandidates
      : ambientCandidates.map((event) => ({
          event,
          weight: eventCounts[event.id]
            ? Math.max(1, event.weight - eventCounts[event.id] * 2)
            : event.weight,
        }));

  const pickedAmbientEvent = pickWeighted(
    ambientPool,
    (candidate) => candidate.weight,
    hashNumber(
      round,
      metrics.legalHeat,
      metrics.publicAnger,
      metrics.marketConfidence,
    ),
  )?.event;

  if (!pickedAmbientEvent) {
    return { metrics, flags, history: null, eventId: null, scheduler };
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
    eventId: pickedAmbientEvent.id,
    scheduler: noteEventInSchedulerState(scheduler, pickedAmbientEvent),
  };
}

function getRunScheduler(run: RunState): EventSchedulerState {
  let scheduler = run.scheduler ?? createInitialEventSchedulerState();

  if (!run.scheduler && run.pendingEvents.length > 0) {
    for (const [index, pending] of run.pendingEvents.entries()) {
      scheduler = scheduleEvent(scheduler, {
        id: `legacy-${pending.eventId}-${pending.triggerRound}-${index}`,
        kind: "guaranteed",
        eventId: pending.eventId,
        triggerRound: pending.triggerRound,
        priority: 0,
        sourceRefs: ["legacy:pendingEvents"],
      });
    }
  }

  return scheduler;
}

function mirrorPendingEvents(scheduler: EventSchedulerState): PendingEvent[] {
  return scheduler.queue.map((event) => ({
    eventId: event.eventId,
    triggerRound: event.triggerRound,
  }));
}

function getRunFactions(run: RunState): FactionStates {
  return run.factions ?? createInitialFactionStates();
}

function getRunOperations(run: RunState): NetworkState {
  return run.operations ?? createDefaultNetworkState();
}

function getRunDossiers(run: RunState): DossierThread[] {
  return normalizeDossierState(run.dossiers);
}

function summarizeEvidenceHints(
  fragments: EvidenceFragment[],
): Partial<Record<DossierTheme, number>> {
  const hints: Partial<Record<DossierTheme, number>> = {};

  for (const fragment of fragments) {
    hints[fragment.theme] = (hints[fragment.theme] ?? 0) + fragment.weight;
  }

  return hints;
}

function collectEventFactionEffectSources(
  emittedEventIds: string[],
  eventById: Record<string, EventDefinition>,
): FactionEffectSource[] {
  const sources: FactionEffectSource[] = [];

  for (const eventId of emittedEventIds) {
    const event = eventById[eventId];

    if (!event?.factionEffects) {
      continue;
    }

    sources.push({
      sourceId: event.id,
      effects: event.factionEffects,
    });
  }

  return sources;
}

function buildFactionSignals(intents: FactionIntent[]): BoardSignal[] {
  return intents.slice(0, 2).map((intent) => ({
    title: `${formatId(intent.factionId)} ${formatId(intent.family)}`,
    body: `${intent.rationale} Urgency ${intent.urgency}.`,
  }));
}

function buildOperationSignals(result: NetworkQuarterResult): BoardSignal[] {
  return result.briefingSignals.slice(0, 2).map((signal) => ({
    title: signal.title,
    body: signal.body,
  }));
}

function buildDossierSignals(dossiers: DossierThread[]): BoardSignal[] {
  return summarizeDossiers(dossiers, 1).map((summary) => ({
    title: `${formatId(summary.theme)} dossier`,
    body: `Evidence weight ${summary.evidenceWeight}; likely exposure ${formatId(summary.likelyExposure)}.`,
  }));
}

function buildFactionHistoryEntry(
  round: number,
  intents: FactionIntent[],
): HistoryEntry | null {
  const [intent] = [...intents].sort(
    (left, right) => right.urgency - left.urgency,
  );

  if (!intent || intent.urgency < 50) {
    return null;
  }

  return {
    id: `faction-${intent.id}`,
    round,
    source: "faction",
    sourceKind: "faction_intent",
    factionId: intent.factionId,
    title: `${formatId(intent.factionId)} ${formatId(intent.family)}`,
    body: intent.rationale,
    tone: intent.family === "shield" ? "positive" : "negative",
  };
}

function buildOperationHistoryEntry(
  round: number,
  result: NetworkQuarterResult,
): HistoryEntry | null {
  const cascade = result.cascades[0];
  const signal = result.briefingSignals[0];

  if (!cascade && !signal) {
    return null;
  }

  return {
    id: `operation-${round}-${cascade?.id ?? signal?.title ?? "read"}`,
    round,
    source: "operation",
    sourceKind: cascade ? "operational_cascade" : "operational_read",
    operationId: cascade?.id ?? "network-quarter",
    title: cascade?.id
      ? formatId(cascade.id)
      : (signal?.title ?? "Operational read"),
    body: cascade
      ? `${cascade.body} Cause: ${cascade.cause}`
      : (signal?.body ??
        "The network absorbed the quarter without a named cascade."),
    cause: cascade?.cause,
    tone: cascade || signal?.tone === "negative" ? "negative" : "neutral",
  };
}

function buildDossierHistoryEntry(
  round: number,
  summaries: DossierSummary[],
): HistoryEntry | null {
  const summary = summaries[0];

  if (!summary || summary.evidenceWeight < 12) {
    return null;
  }

  return {
    id: `dossier-${summary.theme}-${round}`,
    round,
    source: "dossier",
    sourceKind: "evidence_thread",
    dossierTheme: summary.theme,
    title: `${formatId(summary.theme)} file thickens`,
    body: `Investigators can now connect ${formatId(summary.likelyExposure)} to the pattern.`,
    tone: "negative",
  };
}

function buildDossierThresholdEntries(input: {
  round: number;
  previous: DossierThread[];
  current: DossierThread[];
}): {
  impacts: ImpactSet;
  flags: string[];
  historyEntries: HistoryEntry[];
} {
  const previousByTheme = Object.fromEntries(
    input.previous.map((thread) => [thread.theme, thread]),
  ) as Partial<Record<DossierTheme, DossierThread>>;
  const impacts: ImpactSet = {};
  const flags: string[] = [];
  const historyEntries: HistoryEntry[] = [];
  let strongestLegalHeatImpact = 0;

  for (const thread of input.current) {
    const previousBand =
      previousByTheme[thread.theme]?.severityBand ??
      getDossierSeverityBand(previousByTheme[thread.theme]?.evidenceWeight ?? 0);
    const currentBand = getDossierSeverityBand(thread.evidenceWeight);

    if (!isThresholdEscalation(previousBand, currentBand)) {
      continue;
    }

    const impact = getDossierThresholdImpact(currentBand);

    if (impact.legalHeat) {
      strongestLegalHeatImpact = Math.max(
        strongestLegalHeatImpact,
        impact.legalHeat,
      );
    }

    flags.push(`dossier:${thread.theme}:${currentBand}`);
    historyEntries.push({
      id: `dossier-threshold-${thread.theme}-${currentBand}-${input.round}`,
      round: input.round,
      source: "dossier",
      sourceKind: "dossier_threshold",
      dossierTheme: thread.theme,
      title: `${formatId(thread.theme)} dossier turns ${currentBand}`,
      body: `${thread.nextStep} is now live. ${getDossierRecapBody({
        theme: thread.theme,
        severity: thread.severity,
        evidenceWeight: thread.evidenceWeight,
        severityBand: currentBand,
        likelyExposure:
          thread.linkedEventIds.at(-1) ??
          thread.linkedDecisionIds.at(-1) ??
          "unfiled evidence",
        witnesses: thread.witnesses,
        factionOwner: thread.factionOwner,
        nextStep: thread.nextStep,
        caseTheory: getDossierCaseTheory(thread.theme),
      })}`,
      tone: "negative",
    });
  }

  if (strongestLegalHeatImpact > 0) {
    impacts.legalHeat = strongestLegalHeatImpact;
  }

  return { impacts, flags, historyEntries };
}

function isThresholdEscalation(
  previous: DossierSeverityBand,
  current: DossierSeverityBand,
): boolean {
  return getSeverityRank(current) >= getSeverityRank("medium") &&
    getSeverityRank(current) > getSeverityRank(previous);
}

function getSeverityRank(severityBand: DossierSeverityBand): number {
  switch (severityBand) {
    case "dormant":
      return 0;
    case "light":
      return 1;
    case "medium":
      return 2;
    case "heavy":
      return 3;
    case "terminal":
      return 4;
  }
}

function getDossierThresholdImpact(
  severityBand: DossierSeverityBand,
): ImpactSet {
  switch (severityBand) {
    case "terminal":
      return { legalHeat: 4 };
    case "heavy":
      return { legalHeat: 2 };
    case "medium":
      return { legalHeat: 1 };
    case "light":
    case "dormant":
      return {};
  }
}

function getDossierRecapBody(summary: DossierSummary): string {
  const witnessText =
    summary.witnesses.length > 0
      ? ` Witnesses: ${summary.witnesses.slice(0, 3).join(", ")}.`
      : "";

  return `${summary.caseTheory} Evidence weight ${summary.evidenceWeight} (${summary.severityBand}); likely exposure ${formatId(summary.likelyExposure)}. ${formatId(summary.factionOwner)} is pushing the next step: ${summary.nextStep}.${witnessText}`;
}

function formatId(value: string): string {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export interface ResolveRoundOptions {
  buildRecap?: boolean;
}

export function resolveRound(
  run: RunState,
  options: ResolveRoundOptions = {},
): RunState {
  const content = loadContentManifest();
  const offeredThisRound = getAvailableDecisions(content.decisions, run).map(
    (decision) => decision.id,
  );
  const round = run.round + 1;
  const eventCounts = { ...run.eventCounts };
  const previousScheduler = getRunScheduler(run);

  const selectedDecisionResult = applySelectedDecisions(
    run,
    round,
    content.decisionById,
    previousScheduler,
  );
  let metrics = selectedDecisionResult.metrics;
  const resources = selectedDecisionResult.resources;
  let flags = selectedDecisionResult.flags;
  let endingId = selectedDecisionResult.endingId;
  const historyEntries = [...selectedDecisionResult.historyEntries];
  const selectedDecisionIds = selectedDecisionResult.executedDecisionIds;
  const initialEvidence = collectEvidenceFragments({
    selectedDecisionIds,
    emittedEventIds: [],
    factionIntents: [],
    decisionEvidenceById: content.decisionEvidenceById,
    eventEvidenceById: content.eventEvidenceById,
  });
  let operations = applyNetworkDecisionEffects(getRunOperations(run), {
    selectedDecisions: selectedDecisionResult.executedDecisions,
  });
  let factions = updateFactionStates(getRunFactions(run), {
    metrics,
    selectedDecisionIds,
    emittedEventIds: [],
    evidenceHints: summarizeEvidenceHints(initialEvidence),
    factionEffectSources: selectedDecisionResult.factionEffectSources,
  });
  const factionIntents = planFactionIntents(factions, {
    metrics,
    round,
  });
  const factionHistory = buildFactionHistoryEntry(round, factionIntents);

  if (factionHistory) {
    historyEntries.push(factionHistory);
  }

  const operatingDrift = applyOperatingDriftStep(round, metrics);
  metrics = operatingDrift.metrics;
  historyEntries.push(operatingDrift.history);

  const operationResult = resolveNetworkQuarter(operations, {
    round,
    metrics,
  });
  operations = operationResult.network;
  metrics = applyImpactSet(metrics, operationResult.impacts);
  const operationHistory = buildOperationHistoryEntry(round, operationResult);

  if (operationHistory) {
    historyEntries.push(operationHistory);
  }

  const scheduledResult = resolveScheduledEventsStep(
    run,
    round,
    metrics,
    flags,
    eventCounts,
    selectedDecisionResult.scheduler,
    content.eventById,
    content.hazards,
  );
  metrics = scheduledResult.metrics;
  flags = scheduledResult.flags;
  historyEntries.push(...scheduledResult.historyEntries);
  const emittedEventIds = [...scheduledResult.emittedEventIds];
  let scheduler = scheduledResult.scheduler;

  if (!endingId) {
    const ambientResult = resolveAmbientEvent(
      run,
      round,
      metrics,
      flags,
      eventCounts,
      content.events,
      scheduler,
    );
    metrics = ambientResult.metrics;
    flags = ambientResult.flags;
    scheduler = ambientResult.scheduler;
    if (ambientResult.history) {
      historyEntries.push(ambientResult.history);
    }
    if (ambientResult.eventId) {
      emittedEventIds.push(ambientResult.eventId);
    }

    endingId = getAutomaticEndingId(metrics);
  }

  const followOnEvidence = collectEvidenceFragments({
    selectedDecisionIds: [],
    emittedEventIds,
    factionIntents,
    operationCascades: operationResult.cascades,
    decisionEvidenceById: content.decisionEvidenceById,
    eventEvidenceById: content.eventEvidenceById,
  });
  factions = updateFactionStates(factions, {
    metrics,
    selectedDecisionIds: [],
    emittedEventIds,
    evidenceHints: summarizeEvidenceHints(followOnEvidence),
    factionEffectSources: collectEventFactionEffectSources(
      emittedEventIds,
      content.eventById,
    ),
  });
  const previousDossiers = getRunDossiers(run);
  const dossiers = applyEvidenceFragments(previousDossiers, [
    ...initialEvidence,
    ...followOnEvidence,
  ]);
  const dossierSummaries = summarizeDossiers(dossiers, 2);
  const dossierHistory = buildDossierHistoryEntry(round, dossierSummaries);

  if (dossierHistory) {
    historyEntries.push(dossierHistory);
  }

  const dossierThresholds = buildDossierThresholdEntries({
    round,
    previous: previousDossiers,
    current: dossiers,
  });

  if (Object.keys(dossierThresholds.impacts).length > 0) {
    metrics = applyImpactSet(metrics, dossierThresholds.impacts);
  }

  for (const flag of dossierThresholds.flags) {
    flags.add(flag);
  }

  if (dossierThresholds.historyEntries.length > 0) {
    historyEntries.push(...dossierThresholds.historyEntries);
  }

  if (!endingId) {
    endingId = getAutomaticEndingId(metrics);
  }

  const systemSignals = [
    ...buildFactionSignals(factionIntents),
    ...buildOperationSignals(operationResult),
    ...buildDossierSignals(dossiers),
  ].slice(0, 4);
  const nextRunForRecap: RunState = {
    ...run,
    round,
    metrics,
    resources,
    flags: [...flags],
    endingId,
  };
  const recap =
    endingId && (options.buildRecap ?? true)
      ? buildRunRecap({
          run: nextRunForRecap,
          endingId,
          factions,
          operations,
          dossiers,
          selectedDecisionIds,
          decisions: content.decisions,
          decisionById: content.decisionById,
          historyEntries: [...historyEntries, ...run.history],
          operationResult,
        })
      : null;

  return {
    status: endingId ? "ended" : "active",
    round,
    contentVersion: content.version,
    contentHash: content.contentHash,
    metrics,
    resources,
    selectedDecisionIds: [],
    lastOfferedDecisionIds: offeredThisRound,
    pendingEvents: mirrorPendingEvents(scheduler),
    scheduler,
    factions,
    operations,
    dossiers,
    systemSignals,
    recap,
    flags: [...flags],
    endingId,
    eventCounts,
    history: [...historyEntries.reverse(), ...run.history].slice(0, 24),
  };
}
