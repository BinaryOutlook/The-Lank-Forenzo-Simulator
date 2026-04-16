import { pickWeighted } from "../../lib/random/seeded";
import type { EventDefinition, RunState } from "../state/types";
import { meetsRequirements } from "../systems/requirements";

export type EventById = Record<string, EventDefinition>;

export interface ScheduledEvent {
  id: string;
  kind: "guaranteed" | "hazard";
  eventId: string;
  triggerRound: number;
  priority: number;
  staleAfterRound?: number;
  sourceRefs: string[];
}

export interface HazardRule {
  id: string;
  eventId: string;
  baseWeight: number;
  cooldownRounds: number;
  tags: string[];
}

export interface EventSchedulerState {
  queue: ScheduledEvent[];
  cooldowns: Record<string, number>;
  firedEventIds: Record<string, number>;
}

export type SchedulerDiagnostic =
  | {
      kind: "stale";
      scheduledEventId: string;
      eventId: string;
    }
  | {
      kind: "requirements-unmet";
      scheduledEventId: string;
      eventId: string;
    }
  | {
      kind: "budget-deferred";
      scheduledEventId: string;
      eventId: string;
    }
  | {
      kind: "missing-event";
      scheduledEventId: string;
      eventId: string;
    };

export interface EventSchedulerBudget {
  guaranteedEvents: number;
  hazardEvents: number;
}

export interface ResolveEventSchedulerInput {
  run: RunState;
  state: EventSchedulerState;
  eventById: EventById;
  hazardRules: HazardRule[];
  seed: number;
  budget?: Partial<EventSchedulerBudget>;
}

export interface ResolveEventSchedulerResult {
  state: EventSchedulerState;
  events: EventDefinition[];
  diagnostics: SchedulerDiagnostic[];
}

const DEFAULT_BUDGET: EventSchedulerBudget = {
  guaranteedEvents: 1,
  hazardEvents: 1,
};

export function createInitialEventSchedulerState(): EventSchedulerState {
  return {
    queue: [],
    cooldowns: {},
    firedEventIds: {},
  };
}

export function scheduleEvent(
  state: EventSchedulerState,
  event: ScheduledEvent,
): EventSchedulerState {
  return {
    ...state,
    queue: [...state.queue, event].sort(compareScheduledEvents),
  };
}

export function resolveEventScheduler({
  run,
  state,
  eventById,
  hazardRules,
  seed,
  budget,
}: ResolveEventSchedulerInput): ResolveEventSchedulerResult {
  const resolvedBudget = { ...DEFAULT_BUDGET, ...budget };
  const diagnostics: SchedulerDiagnostic[] = [];
  const events: EventDefinition[] = [];
  const nextQueue: ScheduledEvent[] = [];
  const firedEventIds = { ...state.firedEventIds };
  const cooldowns = { ...state.cooldowns };
  let guaranteedRemaining = resolvedBudget.guaranteedEvents;

  for (const scheduled of [...state.queue].sort(compareScheduledEvents)) {
    if (scheduled.triggerRound > run.round) {
      nextQueue.push(scheduled);
      continue;
    }

    if (
      scheduled.staleAfterRound !== undefined &&
      run.round > scheduled.staleAfterRound
    ) {
      diagnostics.push({
        kind: "stale",
        scheduledEventId: scheduled.id,
        eventId: scheduled.eventId,
      });
      continue;
    }

    const event = eventById[scheduled.eventId];
    if (!event) {
      diagnostics.push({
        kind: "missing-event",
        scheduledEventId: scheduled.id,
        eventId: scheduled.eventId,
      });
      continue;
    }

    if (!meetsRequirements(event.requirements, run)) {
      nextQueue.push(scheduled);
      diagnostics.push({
        kind: "requirements-unmet",
        scheduledEventId: scheduled.id,
        eventId: scheduled.eventId,
      });
      continue;
    }

    if (guaranteedRemaining <= 0) {
      nextQueue.push(scheduled);
      diagnostics.push({
        kind: "budget-deferred",
        scheduledEventId: scheduled.id,
        eventId: scheduled.eventId,
      });
      continue;
    }

    guaranteedRemaining -= 1;
    events.push(event);
    firedEventIds[event.id] = (firedEventIds[event.id] ?? 0) + 1;
  }

  let hazardRemaining = resolvedBudget.hazardEvents;
  const hazardCandidates = hazardRules
    .filter((rule) => hazardRemaining > 0 && (cooldowns[rule.id] ?? 0) <= run.round)
    .map((rule) => ({
      rule,
      event: eventById[rule.eventId],
      weight: Math.max(0, rule.baseWeight),
    }))
    .filter(
      (
        candidate,
      ): candidate is {
        rule: HazardRule;
        event: EventDefinition;
        weight: number;
      } =>
        Boolean(candidate.event) &&
        candidate.weight > 0 &&
        meetsRequirements(candidate.event.requirements, run),
    );

  const pickedHazard = pickWeighted(
    hazardCandidates,
    (candidate) => candidate.weight,
    seed,
  );

  if (pickedHazard && hazardRemaining > 0) {
    hazardRemaining -= 1;
    events.push(pickedHazard.event);
    firedEventIds[pickedHazard.event.id] =
      (firedEventIds[pickedHazard.event.id] ?? 0) + 1;
    cooldowns[pickedHazard.rule.id] =
      run.round + pickedHazard.rule.cooldownRounds;
  }

  return {
    events,
    diagnostics,
    state: {
      queue: nextQueue.sort(compareScheduledEvents),
      cooldowns,
      firedEventIds,
    },
  };
}

function compareScheduledEvents(
  left: ScheduledEvent,
  right: ScheduledEvent,
): number {
  return (
    left.triggerRound - right.triggerRound ||
    right.priority - left.priority ||
    left.id.localeCompare(right.id)
  );
}
