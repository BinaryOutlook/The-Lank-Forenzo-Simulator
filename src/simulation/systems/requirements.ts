import type { RequirementSpec, RunState } from "../state/types";

export function hasRequirementConstraints(
  requirements: RequirementSpec | undefined,
): boolean {
  if (!requirements) {
    return false;
  }

  return Boolean(
    requirements.roundAtLeast !== undefined ||
    requirements.roundAtMost !== undefined ||
    Object.keys(requirements.metricMin ?? {}).length > 0 ||
    Object.keys(requirements.metricMax ?? {}).length > 0 ||
    (requirements.flagsAll?.length ?? 0) > 0 ||
    (requirements.flagsNone?.length ?? 0) > 0,
  );
}

export function meetsRequirements(
  requirements: RequirementSpec | undefined,
  run: RunState,
): boolean {
  if (!requirements) {
    return true;
  }

  if (
    requirements.roundAtLeast !== undefined &&
    run.round < requirements.roundAtLeast
  ) {
    return false;
  }

  if (
    requirements.roundAtMost !== undefined &&
    run.round > requirements.roundAtMost
  ) {
    return false;
  }

  for (const [metric, minimum] of Object.entries(
    requirements.metricMin ?? {},
  )) {
    const key = metric as keyof typeof run.metrics;

    if (run.metrics[key] < minimum) {
      return false;
    }
  }

  for (const [metric, maximum] of Object.entries(
    requirements.metricMax ?? {},
  )) {
    const key = metric as keyof typeof run.metrics;

    if (run.metrics[key] > maximum) {
      return false;
    }
  }

  if (requirements.flagsAll?.some((flag) => !run.flags.includes(flag))) {
    return false;
  }

  if (requirements.flagsNone?.some((flag) => run.flags.includes(flag))) {
    return false;
  }

  return true;
}
