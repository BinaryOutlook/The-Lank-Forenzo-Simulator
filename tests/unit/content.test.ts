import { describe, expect, it } from "vitest";
import { loadContent } from "../../src/simulation/content";

describe("content library", () => {
  it("loads a materially expanded multi-pack decision library", () => {
    const content = loadContent();
    const decisionPacks = new Set(content.decisions.map((decision) => decision.pack));
    const delayedDecisions = content.decisions.filter((decision) => decision.delayedConsequences?.length);

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
    const ambientEvents = content.events.filter((event) => event.kind === "ambient");
    const delayedEvents = content.events.filter((event) => event.kind === "delayed");

    expect(content.events.length).toBeGreaterThanOrEqual(132);
    expect(ambientEvents.length).toBeGreaterThanOrEqual(50);
    expect(delayedEvents.length).toBeGreaterThanOrEqual(70);
  });

  it("keeps delayed consequence pools pointed at delayed events", () => {
    const content = loadContent();
    const delayedEventMap = new Map(
      content.events.filter((event) => event.kind === "delayed").map((event) => [event.id, event]),
    );

    const delayedDecisions = content.decisions.filter((decision) => decision.delayedConsequences?.length);

    expect(delayedDecisions.length).toBeGreaterThan(0);

    for (const decision of delayedDecisions) {
      for (const delayed of decision.delayedConsequences ?? []) {
        const referencedIds = delayed.eventId ? [delayed.eventId] : delayed.eventIds ?? [];

        expect(referencedIds.length).toBeGreaterThan(0);

        for (const eventId of referencedIds) {
          expect(delayedEventMap.get(eventId)?.kind).toBe("delayed");
        }
      }
    }
  });
});
