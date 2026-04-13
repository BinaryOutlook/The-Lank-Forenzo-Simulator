import type {
  ContentBundle,
  DecisionDefinition,
  EventDefinition,
  MetricKey,
  RequirementSpec,
} from "../state/types";
import { runMetricBounds } from "../systems/metricEffects";

type ValidationSeverity = "error" | "warning";

type ValidationEntry = {
  message: string;
  severity: ValidationSeverity;
};

type ValidationMap = Map<string, number>;

export interface ContentValidationReport {
  decisions: {
    total: number;
    byPack: ValidationMap;
    byGroup: ValidationMap;
  };
  events: {
    total: number;
    byKind: ValidationMap;
  };
  endings: number;
  errors: ValidationEntry[];
  warnings: ValidationEntry[];
}

export function validateContentBundle(
  content: ContentBundle,
): ContentValidationReport {
  const byPack = new Map<string, number>();
  const byGroup = new Map<string, number>();
  const byKind = new Map<string, number>();
  const errors: ValidationEntry[] = [];
  const warnings: ValidationEntry[] = [];
  const referencedDelayedEventIds = new Set<string>();
  const setFlags = new Set<string>();
  const requiredFlags = new Set<string>();
  const referencedFlags = new Set<string>();

  accumulateCounts(content.decisions, (decision) => decision.pack, byPack);
  accumulateCounts(content.decisions, (decision) => decision.group, byGroup);
  accumulateCounts(content.events, (event) => event.kind, byKind);

  collectDuplicates(
    content.decisions,
    (decision) => decision.id,
    "decision",
    errors,
  );
  collectDuplicates(content.events, (event) => event.id, "event", errors);
  collectDuplicates(content.endings, (ending) => ending.id, "ending", errors);

  const eventById = new Map(
    content.events.map((event) => [event.id, event] as const),
  );

  for (const decision of content.decisions) {
    collectFlagsAndRequirements(
      decision,
      setFlags,
      requiredFlags,
      referencedFlags,
      warnings,
    );

    for (const delayed of decision.delayedConsequences ?? []) {
      const referencedIds = delayed.eventId
        ? [delayed.eventId]
        : (delayed.eventIds ?? []);

      for (const eventId of referencedIds) {
        const event = eventById.get(eventId);

        if (!event) {
          errors.push({
            severity: "error",
            message: `Broken delayed ref: decision "${decision.id}" references unknown event "${eventId}".`,
          });
          continue;
        }

        if (event.kind !== "delayed") {
          errors.push({
            severity: "error",
            message: `Broken delayed ref: decision "${decision.id}" references non-delayed event "${eventId}".`,
          });
          continue;
        }

        referencedDelayedEventIds.add(eventId);
      }
    }
  }

  for (const event of content.events) {
    collectFlagsAndRequirements(
      event,
      setFlags,
      requiredFlags,
      referencedFlags,
      warnings,
    );
  }

  const unreferencedDelayedEvents = content.events
    .filter(
      (event) =>
        event.kind === "delayed" && !referencedDelayedEventIds.has(event.id),
    )
    .map((event) => event.id)
    .sort((left, right) => left.localeCompare(right));

  if (unreferencedDelayedEvents.length > 0) {
    warnings.push({
      severity: "warning",
      message: `Unreferenced delayed events: ${unreferencedDelayedEvents.join(", ")}.`,
    });
  }

  const setOnlyFlags = [...setFlags]
    .filter((flag) => !referencedFlags.has(flag))
    .sort((left, right) => left.localeCompare(right));
  if (setOnlyFlags.length > 0) {
    warnings.push({
      severity: "warning",
      message: `Flags set but never required: ${setOnlyFlags.join(", ")}.`,
    });
  }

  const requiredOnlyFlags = [...requiredFlags]
    .filter((flag) => !setFlags.has(flag))
    .sort((left, right) => left.localeCompare(right));
  if (requiredOnlyFlags.length > 0) {
    errors.push({
      severity: "error",
      message: `Flags required but never set: ${requiredOnlyFlags.join(", ")}.`,
    });
  }

  return {
    decisions: {
      total: content.decisions.length,
      byPack,
      byGroup,
    },
    events: {
      total: content.events.length,
      byKind,
    },
    endings: content.endings.length,
    errors,
    warnings,
  };
}

export function formatContentValidationReport(
  report: ContentValidationReport,
): string[] {
  const lines = [
    report.errors.length > 0
      ? "Content validation failed."
      : "Content validation passed.",
    `Decisions: ${report.decisions.total}`,
    `Decision packs: ${formatCounts(report.decisions.byPack)}`,
    `Decision groups: ${formatCounts(report.decisions.byGroup)}`,
    `Events: ${report.events.total}`,
    `Events by kind: ${formatCounts(report.events.byKind)}`,
    `Endings: ${report.endings}`,
  ];

  if (report.errors.length > 0) {
    lines.push("Errors:");
    lines.push(...report.errors.map((entry) => `- ${entry.message}`));
  }

  if (report.warnings.length > 0) {
    lines.push("Warnings:");
    lines.push(...report.warnings.map((entry) => `- ${entry.message}`));
  }

  return lines;
}

function accumulateCounts<T>(
  items: T[],
  selector: (item: T) => string,
  counts: ValidationMap,
) {
  for (const item of items) {
    const key = selector(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
}

function collectDuplicates<T>(
  items: T[],
  selector: (item: T) => string,
  kind: string,
  errors: ValidationEntry[],
) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const item of items) {
    const id = selector(item);
    if (seen.has(id)) {
      duplicates.add(id);
      continue;
    }

    seen.add(id);
  }

  if (duplicates.size > 0) {
    errors.push({
      severity: "error",
      message: `Duplicate ${kind} ids: ${[...duplicates].sort((left, right) => left.localeCompare(right)).join(", ")}.`,
    });
  }
}

function collectFlagsAndRequirements(
  item: DecisionDefinition | EventDefinition,
  setFlags: Set<string>,
  requiredFlags: Set<string>,
  referencedFlags: Set<string>,
  warnings: ValidationEntry[],
) {
  for (const flag of item.setsFlags ?? []) {
    setFlags.add(flag);
  }

  const requirements = item.requirements;
  if (!requirements) {
    return;
  }

  for (const flag of requirements.flagsAll ?? []) {
    requiredFlags.add(flag);
    referencedFlags.add(flag);
  }

  for (const flag of requirements.flagsNone ?? []) {
    referencedFlags.add(flag);
  }

  const impossibleReasons = getImpossibleRequirementReasons(requirements);
  if (impossibleReasons.length > 0) {
    warnings.push({
      severity: "warning",
      message: `Likely impossible requirements on "${item.id}": ${impossibleReasons.join("; ")}.`,
    });
  }
}

function getImpossibleRequirementReasons(
  requirements: RequirementSpec,
): string[] {
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

function formatCounts(counts: ValidationMap): string {
  return [...counts.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join(", ");
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(2);
}
