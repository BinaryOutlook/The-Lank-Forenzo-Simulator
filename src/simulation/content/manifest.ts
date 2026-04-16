import type {
  ContentBundle,
  DecisionDefinition,
  EndingDefinition,
  EventDefinition,
  MetricKey,
  RequirementSpec,
} from "../state/types";
import { runMetricBounds } from "../systems/metricEffects";

export type ContentDiagnosticKind =
  | "duplicate-id"
  | "broken-delayed-reference"
  | "unreferenced-delayed-event"
  | "producer-only-flag"
  | "consumer-only-flag"
  | "likely-impossible-requirement"
  | "pack-coverage";

export type ContentDiagnosticSeverity = "info" | "warning" | "error";

export interface ContentDiagnostic {
  kind: ContentDiagnosticKind;
  severity: ContentDiagnosticSeverity;
  id: string;
  message: string;
  sourceId?: string;
  sourceKind?: "decision" | "event" | "ending";
  count?: number;
  sources?: string[];
}

export interface CompiledContentManifest extends ContentBundle {
  version: string;
  contentHash: string;
  decisionById: Record<string, DecisionDefinition>;
  eventById: Record<string, EventDefinition>;
  endingById: Record<string, EndingDefinition>;
  decisionsByPack: Record<string, string[]>;
  decisionsByTag: Record<string, string[]>;
  eventsByTag: Record<string, string[]>;
  flags: string[];
  flagProducers: Record<string, string[]>;
  flagConsumers: Record<string, string[]>;
  diagnostics: ContentDiagnostic[];
}

export function compileContentManifest(
  content: ContentBundle,
  version = "v0.5",
): CompiledContentManifest {
  const decisionById = indexById(content.decisions);
  const eventById = indexById(content.events);
  const endingById = indexById(content.endings);
  const decisionsByPack = groupIds(content.decisions, (decision) => [
    decision.pack,
  ]);
  const decisionsByTag = groupIds(
    content.decisions,
    (decision) => decision.tags,
  );
  const eventsByTag = groupIds(content.events, (event) => event.tags);
  const diagnostics: ContentDiagnostic[] = [
    ...findDuplicateDiagnostics(content),
    ...findDelayedEventDiagnostics(content, eventById),
    ...findRequirementDiagnostics(content),
    ...findPackCoverageDiagnostics(decisionsByPack),
  ];
  const { flags, flagProducers, flagConsumers } = indexFlags(content);

  diagnostics.push(...findFlagDiagnostics(flags, flagProducers, flagConsumers));

  diagnostics.sort(compareDiagnostics);

  return {
    version,
    contentHash: createContentHash(content),
    decisions: content.decisions,
    events: content.events,
    endings: content.endings,
    decisionById,
    eventById,
    endingById,
    decisionsByPack,
    decisionsByTag,
    eventsByTag,
    flags,
    flagProducers,
    flagConsumers,
    diagnostics,
  };
}

function indexById<T extends { id: string }>(items: T[]): Record<string, T> {
  const indexed: Record<string, T> = {};

  for (const item of items) {
    indexed[item.id] = item;
  }

  return indexed;
}

function groupIds<T extends { id: string }>(
  items: T[],
  getKeys: (item: T) => string[],
): Record<string, string[]> {
  const groups: Record<string, string[]> = {};

  for (const item of items) {
    for (const key of getKeys(item)) {
      groups[key] ??= [];
      groups[key].push(item.id);
    }
  }

  return sortGroupedIds(groups);
}

function sortGroupedIds(
  groups: Record<string, string[]>,
): Record<string, string[]> {
  const sorted: Record<string, string[]> = {};

  for (const key of Object.keys(groups).sort((left, right) =>
    left.localeCompare(right),
  )) {
    sorted[key] = [...groups[key]].sort((left, right) =>
      left.localeCompare(right),
    );
  }

  return sorted;
}

function findDuplicateDiagnostics(content: ContentBundle): ContentDiagnostic[] {
  return [
    ...findDuplicates(content.decisions, "decision"),
    ...findDuplicates(content.events, "event"),
    ...findDuplicates(content.endings, "ending"),
  ];
}

function findDuplicates<T extends { id: string }>(
  items: T[],
  sourceKind: ContentDiagnostic["sourceKind"],
): ContentDiagnostic[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const item of items) {
    if (seen.has(item.id)) {
      duplicates.add(item.id);
      continue;
    }

    seen.add(item.id);
  }

  return [...duplicates]
    .sort((left, right) => left.localeCompare(right))
    .map((id) => ({
      kind: "duplicate-id",
      severity: "error",
      id,
      sourceKind,
      message: `Duplicate ${sourceKind} id "${id}".`,
    }));
}

function findDelayedEventDiagnostics(
  content: ContentBundle,
  eventById: Record<string, EventDefinition>,
): ContentDiagnostic[] {
  const diagnostics: ContentDiagnostic[] = [];
  const referencedDelayedEventIds = new Set<string>();

  for (const decision of content.decisions) {
    for (const delayed of decision.delayedConsequences ?? []) {
      const referencedIds = delayed.eventId
        ? [delayed.eventId]
        : (delayed.eventIds ?? []);

      for (const eventId of referencedIds) {
        const event = eventById[eventId];

        if (!event) {
          diagnostics.push({
            kind: "broken-delayed-reference",
            severity: "error",
            id: eventId,
            sourceId: decision.id,
            sourceKind: "decision",
            message: `Decision "${decision.id}" references unknown delayed event "${eventId}".`,
          });
          continue;
        }

        if (event.kind !== "delayed") {
          diagnostics.push({
            kind: "broken-delayed-reference",
            severity: "error",
            id: eventId,
            sourceId: decision.id,
            sourceKind: "decision",
            message: `Decision "${decision.id}" references non-delayed event "${eventId}".`,
          });
          continue;
        }

        referencedDelayedEventIds.add(eventId);
      }
    }
  }

  for (const event of content.events) {
    if (event.kind === "delayed" && !referencedDelayedEventIds.has(event.id)) {
      diagnostics.push({
        kind: "unreferenced-delayed-event",
        severity: "warning",
        id: event.id,
        sourceId: event.id,
        sourceKind: "event",
        message: `Delayed event "${event.id}" is not referenced by a decision consequence.`,
      });
    }
  }

  return diagnostics;
}

function findRequirementDiagnostics(
  content: ContentBundle,
): ContentDiagnostic[] {
  const diagnostics: ContentDiagnostic[] = [];

  for (const decision of content.decisions) {
    diagnostics.push(
      ...getImpossibleRequirementReasons(decision.requirements).map(
        (reason) => ({
          kind: "likely-impossible-requirement" as const,
          severity: "warning" as const,
          id: decision.id,
          sourceId: decision.id,
          sourceKind: "decision" as const,
          message: `Likely impossible requirements on decision "${decision.id}": ${reason}.`,
        }),
      ),
    );
  }

  for (const event of content.events) {
    diagnostics.push(
      ...getImpossibleRequirementReasons(event.requirements).map((reason) => ({
        kind: "likely-impossible-requirement" as const,
        severity: "warning" as const,
        id: event.id,
        sourceId: event.id,
        sourceKind: "event" as const,
        message: `Likely impossible requirements on event "${event.id}": ${reason}.`,
      })),
    );
  }

  return diagnostics;
}

function findPackCoverageDiagnostics(
  decisionsByPack: Record<string, string[]>,
): ContentDiagnostic[] {
  return Object.entries(decisionsByPack).map(([pack, decisionIds]) => ({
    kind: "pack-coverage",
    severity: "info",
    id: pack,
    count: decisionIds.length,
    sources: decisionIds,
    message: `Decision pack "${pack}" contains ${decisionIds.length} decision${decisionIds.length === 1 ? "" : "s"}.`,
  }));
}

function indexFlags(content: ContentBundle): {
  flags: string[];
  flagProducers: Record<string, string[]>;
  flagConsumers: Record<string, string[]>;
} {
  const flagProducers: Record<string, string[]> = {};
  const flagConsumers: Record<string, string[]> = {};

  for (const decision of content.decisions) {
    collectProducedFlags(
      `decision:${decision.id}`,
      decision.setsFlags,
      flagProducers,
    );
    collectConsumedFlags(
      `decision:${decision.id}`,
      decision.requirements,
      flagConsumers,
    );
  }

  for (const event of content.events) {
    collectProducedFlags(`event:${event.id}`, event.setsFlags, flagProducers);
    collectConsumedFlags(
      `event:${event.id}`,
      event.requirements,
      flagConsumers,
    );
  }

  const flags = [
    ...new Set([...Object.keys(flagProducers), ...Object.keys(flagConsumers)]),
  ].sort((left, right) => left.localeCompare(right));

  return {
    flags,
    flagProducers: sortGroupedIds(flagProducers),
    flagConsumers: sortGroupedIds(flagConsumers),
  };
}

function collectProducedFlags(
  sourceId: string,
  flags: string[] | undefined,
  flagProducers: Record<string, string[]>,
) {
  for (const flag of flags ?? []) {
    flagProducers[flag] ??= [];
    flagProducers[flag].push(sourceId);
  }
}

function collectConsumedFlags(
  sourceId: string,
  requirements: RequirementSpec | undefined,
  flagConsumers: Record<string, string[]>,
) {
  for (const flag of [
    ...(requirements?.flagsAll ?? []),
    ...(requirements?.flagsNone ?? []),
  ]) {
    flagConsumers[flag] ??= [];
    flagConsumers[flag].push(sourceId);
  }
}

function findFlagDiagnostics(
  flags: string[],
  flagProducers: Record<string, string[]>,
  flagConsumers: Record<string, string[]>,
): ContentDiagnostic[] {
  const diagnostics: ContentDiagnostic[] = [];

  for (const flag of flags) {
    if (!flagConsumers[flag]) {
      diagnostics.push({
        kind: "producer-only-flag",
        severity: "warning",
        id: flag,
        sources: flagProducers[flag],
        message: `Flag "${flag}" is produced but never consumed.`,
      });
    }

    if (!flagProducers[flag]) {
      diagnostics.push({
        kind: "consumer-only-flag",
        severity: "error",
        id: flag,
        sources: flagConsumers[flag],
        message: `Flag "${flag}" is consumed but never produced.`,
      });
    }
  }

  return diagnostics;
}

function getImpossibleRequirementReasons(
  requirements: RequirementSpec | undefined,
): string[] {
  if (!requirements) {
    return [];
  }

  const reasons: string[] = [];

  for (const [metric, minimum] of Object.entries(
    requirements.metricMin ?? {},
  )) {
    const bounds = runMetricBounds[metric as MetricKey];
    if (minimum > bounds.max) {
      reasons.push(
        `${metric} minimum ${formatNumber(minimum)} exceeds known max ${formatNumber(bounds.max)}`,
      );
    }
  }

  for (const [metric, maximum] of Object.entries(
    requirements.metricMax ?? {},
  )) {
    const bounds = runMetricBounds[metric as MetricKey];
    if (maximum < bounds.min) {
      reasons.push(
        `${metric} maximum ${formatNumber(maximum)} falls below known min ${formatNumber(bounds.min)}`,
      );
    }
  }

  for (const [metric, minimum] of Object.entries(
    requirements.metricMin ?? {},
  )) {
    const maximum = requirements.metricMax?.[metric as MetricKey];
    if (maximum !== undefined && minimum > maximum) {
      reasons.push(
        `${metric} minimum ${formatNumber(minimum)} exceeds maximum ${formatNumber(maximum)}`,
      );
    }
  }

  return reasons;
}

function createContentHash(content: ContentBundle): string {
  let hash = 0x811c9dc5;
  const input = stableStringify(content);

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort((left, right) => left.localeCompare(right))
      .map(
        (key) =>
          `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`,
      )
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function compareDiagnostics(
  left: ContentDiagnostic,
  right: ContentDiagnostic,
): number {
  return (
    left.kind.localeCompare(right.kind) ||
    left.id.localeCompare(right.id) ||
    (left.sourceId ?? "").localeCompare(right.sourceId ?? "")
  );
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(2);
}
