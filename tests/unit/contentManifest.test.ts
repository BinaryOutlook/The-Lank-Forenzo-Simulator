import { describe, expect, it } from "vitest";
import {
  compileContentManifest,
  loadContentManifest,
} from "../../src/simulation/content";
import type { HazardRule } from "../../src/simulation/scheduler/eventScheduler.js";
import type { ContentBundle } from "../../src/simulation/state/types";
import { runMetricBounds } from "../../src/simulation/systems/metricEffects";

describe("content manifest", () => {
  it("builds deterministic direct lookup maps for authored content", () => {
    const manifest = loadContentManifest();
    const repeatedLoad = loadContentManifest();

    expect(manifest.version).toBe("v0.5");
    expect(manifest.contentHash).toMatch(/^[a-f0-9]{8}$/);
    expect(repeatedLoad).toBe(manifest);
    expect(repeatedLoad.contentHash).toBe(manifest.contentHash);
    expect(manifest.hazardRules.length).toBeGreaterThan(0);

    const decision = manifest.decisions[0];
    const event = manifest.events[0];
    const ending = manifest.endings[0];

    expect(manifest.decisionById[decision.id]).toBe(decision);
    expect(manifest.eventById[event.id]).toBe(event);
    expect(manifest.endingById[ending.id]).toBe(ending);
    for (const rule of manifest.hazardRules) {
      expect(manifest.eventById[rule.eventId]?.kind).toBe("ambient");
    }
  });

  it("indexes decisions by pack and events by tag using stable id lists", () => {
    const manifest = loadContentManifest();
    const coreDecisionIds = manifest.decisions
      .filter((decision) => decision.pack === "core")
      .map((decision) => decision.id)
      .sort((left, right) => left.localeCompare(right));
    const eventTag = manifest.events[0].tags[0];
    const taggedEventIds = manifest.events
      .filter((event) => event.tags.includes(eventTag))
      .map((event) => event.id)
      .sort((left, right) => left.localeCompare(right));

    expect(manifest.decisionsByPack.core).toEqual(coreDecisionIds);
    expect(manifest.eventsByTag[eventTag]).toEqual(taggedEventIds);
  });

  it("indexes flag producers and consumers across decisions and events", () => {
    const fixture = compileContentManifest(createFixtureContent(), "fixture");

    expect(fixture.flags).toEqual([
      "decisionOnlyFlag",
      "eventOnlyFlag",
      "producedAndRequiredFlag",
      "requiredOnlyFlag",
      "suppressedFlag",
    ]);
    expect(fixture.flagProducers.producedAndRequiredFlag).toEqual([
      "decision:fixture_decision",
      "event:fixture_event",
    ]);
    expect(fixture.flagConsumers.producedAndRequiredFlag).toEqual([
      "decision:fixture_followup",
    ]);
    expect(fixture.flagConsumers.suppressedFlag).toEqual([
      "event:fixture_delayed",
    ]);
  });

  it("emits diagnostics for dead refs, flag gaps, impossible requirements, and pack coverage", () => {
    const fixture = compileContentManifest(createFixtureContent(), "fixture");

    expect(
      fixture.diagnostics.some(
        (diagnostic) =>
          diagnostic.kind === "producer-only-flag" &&
          diagnostic.id === "decisionOnlyFlag",
      ),
    ).toBe(true);
    expect(
      fixture.diagnostics.some(
        (diagnostic) =>
          diagnostic.kind === "consumer-only-flag" &&
          diagnostic.id === "requiredOnlyFlag",
      ),
    ).toBe(true);
    expect(
      fixture.diagnostics.some(
        (diagnostic) =>
          diagnostic.kind === "unreferenced-delayed-event" &&
          diagnostic.id === "orphan_delayed",
      ),
    ).toBe(true);
    expect(
      fixture.diagnostics.some(
        (diagnostic) =>
          diagnostic.kind === "broken-delayed-reference" &&
          diagnostic.id === "missing_delayed",
      ),
    ).toBe(true);
    expect(
      fixture.diagnostics.some(
        (diagnostic) =>
          diagnostic.kind === "likely-impossible-requirement" &&
          diagnostic.sourceId === "fixture_followup",
      ),
    ).toBe(true);
    expect(
      fixture.diagnostics.some(
        (diagnostic) =>
          diagnostic.kind === "pack-coverage" &&
          diagnostic.id === "core" &&
          diagnostic.count === 2,
      ),
    ).toBe(true);
  });

  it("compiles hazard rules into the manifest with deterministic diagnostics", () => {
    const hazardRules: HazardRule[] = [
      {
        id: "fixture-hazard",
        eventId: "fixture_event",
        baseWeight: 3,
        cooldownRounds: 2,
        tags: ["fixture"],
        requirements: {
          flagsAll: ["producedAndRequiredFlag"],
        },
      },
      {
        id: "fixture-hazard",
        eventId: "fixture_delayed",
        baseWeight: 1,
        cooldownRounds: 1,
        tags: ["fixture"],
      },
      {
        id: "missing-hazard-event",
        eventId: "missing_ambient",
        baseWeight: 1,
        cooldownRounds: 1,
        tags: ["fixture"],
      },
    ];

    const fixture = compileContentManifest(
      createFixtureContent(),
      "fixture",
      hazardRules,
    );

    expect(fixture.hazardRules).toEqual(hazardRules);
    expect(fixture.flagConsumers.producedAndRequiredFlag).toContain(
      "hazard:fixture-hazard",
    );
    expect(
      fixture.diagnostics.some(
        (diagnostic) =>
          diagnostic.kind === "duplicate-hazard-rule" &&
          diagnostic.id === "fixture-hazard",
      ),
    ).toBe(true);
    expect(
      fixture.diagnostics.some(
        (diagnostic) =>
          diagnostic.kind === "broken-hazard-reference" &&
          diagnostic.sourceId === "fixture-hazard" &&
          diagnostic.id === "fixture_delayed",
      ),
    ).toBe(true);
    expect(
      fixture.diagnostics.some(
        (diagnostic) =>
          diagnostic.kind === "broken-hazard-reference" &&
          diagnostic.sourceId === "missing-hazard-event" &&
          diagnostic.id === "missing_ambient",
      ),
    ).toBe(true);
  });
});

function createFixtureContent(): ContentBundle {
  return {
    decisions: [
      {
        id: "fixture_decision",
        pack: "core",
        title: "Fixture Decision",
        summary: "Fixture decision.",
        group: "finance",
        tags: ["finance", "setup"],
        impacts: {},
        delayedConsequences: [
          { delay: 1, eventId: "fixture_delayed" },
          { delay: 2, eventId: "missing_delayed" },
        ],
        setsFlags: ["producedAndRequiredFlag", "decisionOnlyFlag"],
      },
      {
        id: "fixture_followup",
        pack: "core",
        title: "Fixture Follow-Up",
        summary: "Fixture follow-up.",
        group: "legal",
        tags: ["legal"],
        impacts: {},
        requirements: {
          metricMin: {
            stockPrice: runMetricBounds.stockPrice.max + 1,
          },
          flagsAll: ["producedAndRequiredFlag", "requiredOnlyFlag"],
        },
      },
    ],
    events: [
      {
        id: "fixture_event",
        kind: "ambient",
        title: "Fixture Event",
        body: "Fixture event.",
        weight: 1,
        tags: ["finance", "ambient"],
        impacts: {},
        setsFlags: ["producedAndRequiredFlag", "eventOnlyFlag"],
      },
      {
        id: "fixture_delayed",
        kind: "delayed",
        title: "Fixture Delayed",
        body: "Fixture delayed event.",
        weight: 1,
        tags: ["legal", "delayed"],
        impacts: {},
        requirements: {
          flagsNone: ["suppressedFlag"],
        },
      },
      {
        id: "orphan_delayed",
        kind: "delayed",
        title: "Orphan Delayed",
        body: "Fixture orphan delayed event.",
        weight: 1,
        tags: ["orphan"],
        impacts: {},
      },
    ],
    endings: [
      {
        id: "prison",
        title: "Prison",
        subtitle: "Fixture",
        summary: "Fixture ending.",
      },
    ],
  };
}
