import { describe, expect, it } from "vitest";
import { loadContent } from "../../src/simulation/content";

describe("content library", () => {
  it("loads a materially expanded multi-pack event library", () => {
    const content = loadContent();
    const ambientEvents = content.events.filter((event) => event.kind === "ambient");
    const delayedEvents = content.events.filter((event) => event.kind === "delayed");

    expect(content.events.length).toBeGreaterThanOrEqual(100);
    expect(ambientEvents.length).toBeGreaterThanOrEqual(50);
    expect(delayedEvents.length).toBeGreaterThanOrEqual(35);
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
