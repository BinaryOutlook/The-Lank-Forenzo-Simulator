import { loadContent } from "../src/simulation/content/index";
import type { DecisionDefinition } from "../src/simulation/state/types";

const content = loadContent();
const eventIds = new Set(content.events.map((event) => event.id));

assertUniqueIds("decision", content.decisions.map((decision) => decision.id));
assertUniqueIds("event", content.events.map((event) => event.id));
assertUniqueIds("ending", content.endings.map((ending) => ending.id));

for (const decision of content.decisions) {
  assertDelayedConsequencesResolve(decision, eventIds);
}

console.log(
  [
    "Content validation passed.",
    `Decisions: ${content.decisions.length}`,
    `Events: ${content.events.length}`,
    `Endings: ${content.endings.length}`,
  ].join("\n"),
);

function assertUniqueIds(kind: string, ids: string[]) {
  const seen = new Set<string>();

  for (const id of ids) {
    if (seen.has(id)) {
      throw new Error(`Duplicate ${kind} id detected: ${id}`);
    }

    seen.add(id);
  }
}

function assertDelayedConsequencesResolve(decision: DecisionDefinition, knownEventIds: Set<string>) {
  for (const delayed of decision.delayedConsequences ?? []) {
    const referencedEvents = delayed.eventId ? [delayed.eventId] : delayed.eventIds ?? [];

    for (const eventId of referencedEvents) {
      if (!knownEventIds.has(eventId)) {
        throw new Error(`Decision "${decision.id}" references unknown delayed event "${eventId}".`);
      }
    }
  }
}
