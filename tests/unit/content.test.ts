import { describe, expect, it } from "vitest";
import { loadContent } from "../../src/simulation/content";
import { validateContentBundle } from "../../src/simulation/content/validation";
import { runMetricBounds } from "../../src/simulation/systems/metricEffects";

describe("content library", () => {
  it("loads a materially expanded multi-pack decision library", () => {
    const content = loadContent();
    const decisionPacks = new Set(
      content.decisions.map((decision) => decision.pack),
    );
    const delayedDecisions = content.decisions.filter(
      (decision) => decision.delayedConsequences?.length,
    );

    expect(content.decisions.length).toBeGreaterThanOrEqual(100);
    expect(decisionPacks.size).toBeGreaterThanOrEqual(10);
    expect(decisionPacks.has("mergerBait")).toBe(true);
    expect(decisionPacks.has("shadowSubsidiaries")).toBe(true);
    expect(decisionPacks.has("regulatoryTheater")).toBe(true);
    expect(decisionPacks.has("executiveEscape")).toBe(true);
    expect(delayedDecisions.length).toBeGreaterThanOrEqual(70);
  });

  it("loads a materially expanded multi-pack event library", () => {
    const content = loadContent();
    const ambientEvents = content.events.filter(
      (event) => event.kind === "ambient",
    );
    const delayedEvents = content.events.filter(
      (event) => event.kind === "delayed",
    );

    expect(content.events.length).toBeGreaterThanOrEqual(132);
    expect(ambientEvents.length).toBeGreaterThanOrEqual(50);
    expect(delayedEvents.length).toBeGreaterThanOrEqual(70);
  });

  it("keeps delayed consequence pools pointed at delayed events", () => {
    const content = loadContent();
    const delayedEventMap = new Map(
      content.events
        .filter((event) => event.kind === "delayed")
        .map((event) => [event.id, event]),
    );

    const delayedDecisions = content.decisions.filter(
      (decision) => decision.delayedConsequences?.length,
    );

    expect(delayedDecisions.length).toBeGreaterThan(0);

    for (const decision of delayedDecisions) {
      for (const delayed of decision.delayedConsequences ?? []) {
        const referencedIds = delayed.eventId
          ? [delayed.eventId]
          : (delayed.eventIds ?? []);

        expect(referencedIds.length).toBeGreaterThan(0);

        for (const eventId of referencedIds) {
          expect(delayedEventMap.get(eventId)?.kind).toBe("delayed");
        }
      }
    }
  });

  it("summarizes the current content library with concise diagnostics", () => {
    const report = validateContentBundle(loadContent());

    expect(report.decisions.total).toBeGreaterThanOrEqual(100);
    expect(report.decisions.byPack.get("core")).toBeGreaterThan(0);
    expect(report.decisions.byGroup.get("finance")).toBeGreaterThan(0);
    expect(report.events.total).toBeGreaterThanOrEqual(132);
    expect(report.events.byKind.get("ambient")).toBeGreaterThan(0);
    expect(report.events.byKind.get("delayed")).toBeGreaterThan(0);
    expect(report.errors).toHaveLength(0);
    expect(report.warnings).toHaveLength(0);
  });

  it("flags broken refs, orphaned delayed events, flag gaps, and impossible requirements", () => {
    const report = validateContentBundle({
      decisions: [
        {
          id: "duplicate-decision",
          pack: "core",
          title: "Duplicate Decision",
          summary: "A fixture used to provoke duplicate-id detection.",
          group: "finance",
          tags: ["fixture"],
          impacts: {},
          requirements: {
            metricMin: {
              stockPrice: runMetricBounds.stockPrice.max + 1,
            },
            flagsAll: ["ghostFlag"],
            flagsNone: ["orphanFlag"],
          },
          delayedConsequences: [{ delay: 2, eventId: "missing_delayed_event" }],
          setsFlags: ["orphanFlag"],
        },
        {
          id: "duplicate-decision",
          pack: "core",
          title: "Duplicate Decision Copy",
          summary: "The duplicate companion.",
          group: "labor",
          tags: ["fixture"],
          impacts: {},
        },
      ],
      events: [
        {
          id: "present_ambient_event",
          kind: "ambient",
          title: "Ambient Fixture",
          body: "This event is present but not delayed.",
          weight: 1,
          tags: ["fixture"],
          impacts: {},
          setsFlags: ["setOnlyFlag"],
        },
        {
          id: "present_delayed_event",
          kind: "delayed",
          title: "Delayed Fixture",
          body: "This delayed event is not referenced.",
          weight: 1,
          tags: ["fixture"],
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
    });

    expect(
      report.errors.some((entry) =>
        entry.message.includes("Duplicate decision ids"),
      ),
    ).toBe(true);
    expect(
      report.errors.some((entry) =>
        entry.message.includes('unknown event "missing_delayed_event"'),
      ),
    ).toBe(true);
    expect(
      report.errors.some((entry) =>
        entry.message.includes("Flags required but never set"),
      ),
    ).toBe(true);
    expect(
      report.warnings.some((entry) =>
        entry.message.includes("present_delayed_event"),
      ),
    ).toBe(true);
    expect(
      report.warnings.some((entry) =>
        entry.message.includes("Flags set but never required"),
      ),
    ).toBe(true);
    expect(
      report.warnings.some((entry) =>
        entry.message.includes("Likely impossible requirements"),
      ),
    ).toBe(true);
  });
});
