import { describe, expect, it } from "vitest";
import { createInitialRunState } from "../../src/simulation/resolution/resolveRound";
import {
  createInitialEventSchedulerState,
  resolveEventScheduler,
  scheduleEvent,
  type EventById,
  type HazardRule,
  type ScheduledEvent,
} from "../../src/simulation/scheduler/eventScheduler";
import type { EventDefinition } from "../../src/simulation/state/types";

function makeEvent(
  id: string,
  overrides: Partial<EventDefinition> = {},
): EventDefinition {
  return {
    id,
    kind: "delayed",
    title: id,
    body: `${id} body`,
    weight: 1,
    tags: [],
    impacts: {},
    ...overrides,
  };
}

function makeScheduledEvent(
  id: string,
  eventId: string,
  overrides: Partial<ScheduledEvent> = {},
): ScheduledEvent {
  return {
    id,
    kind: "guaranteed",
    eventId,
    triggerRound: 3,
    priority: 0,
    sourceRefs: [],
    ...overrides,
  };
}

function indexEvents(events: EventDefinition[]): EventById {
  return Object.fromEntries(events.map((event) => [event.id, event]));
}

describe("event scheduler", () => {
  it("resolves due guaranteed events and records fired counts", () => {
    const run = createInitialRunState();
    run.round = 3;

    const state = scheduleEvent(
      createInitialEventSchedulerState(),
      makeScheduledEvent("schedule-1", "hearing_notice"),
    );

    const result = resolveEventScheduler({
      run,
      state,
      eventById: indexEvents([makeEvent("hearing_notice")]),
      hazardRules: [],
      seed: 10,
    });

    expect(result.events.map((event) => event.id)).toEqual(["hearing_notice"]);
    expect(result.state.queue).toEqual([]);
    expect(result.state.firedEventIds).toEqual({ hearing_notice: 1 });
  });

  it("expires stale scheduled events with diagnostics instead of firing them", () => {
    const run = createInitialRunState();
    run.round = 6;

    const state = scheduleEvent(
      createInitialEventSchedulerState(),
      makeScheduledEvent("stale-1", "stale_notice", {
        triggerRound: 2,
        staleAfterRound: 5,
      }),
    );

    const result = resolveEventScheduler({
      run,
      state,
      eventById: indexEvents([makeEvent("stale_notice")]),
      hazardRules: [],
      seed: 10,
    });

    expect(result.events).toEqual([]);
    expect(result.state.queue).toEqual([]);
    expect(result.diagnostics).toContainEqual({
      kind: "stale",
      scheduledEventId: "stale-1",
      eventId: "stale_notice",
    });
  });

  it("defers due events when requirements are not met", () => {
    const run = createInitialRunState();
    run.round = 4;

    const state = scheduleEvent(
      createInitialEventSchedulerState(),
      makeScheduledEvent("blocked-1", "blocked_notice", {
        triggerRound: 2,
      }),
    );

    const result = resolveEventScheduler({
      run,
      state,
      eventById: indexEvents([
        makeEvent("blocked_notice", {
          requirements: { flagsAll: ["consentOrderLive"] },
        }),
      ]),
      hazardRules: [],
      seed: 10,
    });

    expect(result.events).toEqual([]);
    expect(result.state.queue.map((event) => event.id)).toEqual(["blocked-1"]);
    expect(result.diagnostics).toContainEqual({
      kind: "requirements-unmet",
      scheduledEventId: "blocked-1",
      eventId: "blocked_notice",
    });
  });

  it("uses priority order and defers extra guaranteed events when the budget is spent", () => {
    const run = createInitialRunState();
    run.round = 3;

    const initialState = createInitialEventSchedulerState();
    const state = [
      makeScheduledEvent("low-priority", "low_notice", { priority: 1 }),
      makeScheduledEvent("high-priority", "high_notice", { priority: 5 }),
    ].reduce(scheduleEvent, initialState);

    const result = resolveEventScheduler({
      run,
      state,
      eventById: indexEvents([makeEvent("low_notice"), makeEvent("high_notice")]),
      hazardRules: [],
      seed: 10,
      budget: { guaranteedEvents: 1, hazardEvents: 0 },
    });

    expect(result.events.map((event) => event.id)).toEqual(["high_notice"]);
    expect(result.state.queue.map((event) => event.id)).toEqual([
      "low-priority",
    ]);
    expect(result.diagnostics).toContainEqual({
      kind: "budget-deferred",
      scheduledEventId: "low-priority",
      eventId: "low_notice",
    });
  });

  it("selects hazard events deterministically and applies cooldowns", () => {
    const run = createInitialRunState();
    run.round = 3;
    const hazardRules: HazardRule[] = [
      {
        id: "legal-hazard",
        eventId: "legal_alarm",
        baseWeight: 0,
        cooldownRounds: 2,
        tags: ["legal"],
      },
      {
        id: "operations-hazard",
        eventId: "operations_alarm",
        baseWeight: 5,
        cooldownRounds: 2,
        tags: ["operations"],
      },
    ];

    const first = resolveEventScheduler({
      run,
      state: createInitialEventSchedulerState(),
      eventById: indexEvents([
        makeEvent("legal_alarm"),
        makeEvent("operations_alarm"),
      ]),
      hazardRules,
      seed: 77,
      budget: { guaranteedEvents: 0, hazardEvents: 1 },
    });
    const repeated = resolveEventScheduler({
      run,
      state: createInitialEventSchedulerState(),
      eventById: indexEvents([
        makeEvent("legal_alarm"),
        makeEvent("operations_alarm"),
      ]),
      hazardRules,
      seed: 77,
      budget: { guaranteedEvents: 0, hazardEvents: 1 },
    });

    expect(first.events.map((event) => event.id)).toEqual(["operations_alarm"]);
    expect(repeated.events.map((event) => event.id)).toEqual(
      first.events.map((event) => event.id),
    );
    expect(first.state.cooldowns).toEqual({ "operations-hazard": 5 });

    const cooldownRun = createInitialRunState();
    cooldownRun.round = 4;
    const duringCooldown = resolveEventScheduler({
      run: cooldownRun,
      state: first.state,
      eventById: indexEvents([
        makeEvent("legal_alarm"),
        makeEvent("operations_alarm"),
      ]),
      hazardRules: [hazardRules[1]],
      seed: 77,
      budget: { guaranteedEvents: 0, hazardEvents: 1 },
    });

    expect(duringCooldown.events).toEqual([]);

    const resumedRun = createInitialRunState();
    resumedRun.round = 6;
    const afterCooldown = resolveEventScheduler({
      run: resumedRun,
      state: first.state,
      eventById: indexEvents([
        makeEvent("legal_alarm"),
        makeEvent("operations_alarm"),
      ]),
      hazardRules: [hazardRules[1]],
      seed: 77,
      budget: { guaranteedEvents: 0, hazardEvents: 1 },
    });

    expect(afterCooldown.events.map((event) => event.id)).toEqual([
      "operations_alarm",
    ]);
  });
});
