import { loadContentManifest } from "./content/index.js";
import {
  createInitialRunState,
  resolveRound as resolveSimulationRound,
} from "./resolution/resolveRound.js";
import {
  composeDecisionTray,
  type TrayCompositionResult,
} from "./systems/decisionEngine.js";
import {
  canAffordResourceCosts,
  getDecisionSelectionCost,
  normalizeConsumableResources,
} from "./systems/consumables.js";
import type {
  DecisionDefinition,
  EndingDefinition,
  RunState,
} from "./state/types.js";

/**
 * Reserved extension point for future seeded/content-injected run creation.
 *
 * The runtime intentionally accepts no meaningful creation options yet: callers
 * should not depend on configuration that the simulation does not honor.
 */
export type InitialRunInput = void;

/**
 * Public runtime boundary for deterministic simulation play.
 *
 * React, scripts, tests, workers, and replay tooling should prefer this facade
 * over importing resolver, content, or decision-system internals directly when
 * they need to drive a run. Lower-level modules remain available for focused
 * unit tests and system-specific diagnostics.
 */
export interface SimulationRuntime {
  createInitialRun(input?: InitialRunInput): RunState;
  getAvailableDecisions(run: RunState): TrayCompositionResult;
  toggleDecision(run: RunState, decisionId: string): RunState;
  resolveRound(run: RunState): RunState;
  getEnding(run: RunState): EndingDefinition | null;
}

function createEmptyTrayResult(): TrayCompositionResult {
  return {
    decisions: [],
    diagnostics: {
      eligibleCount: 0,
      mainPoolCount: 0,
      previousRepeatCount: 0,
      distinctGroups: 0,
      distinctPacks: 0,
      exitPreserved: false,
      pickReasons: [],
    },
  };
}

function getDecisionsById(
  decisionIds: string[],
  decisionById: Record<string, DecisionDefinition>,
): DecisionDefinition[] {
  return decisionIds
    .map((decisionId) => decisionById[decisionId])
    .filter((decision): decision is DecisionDefinition => Boolean(decision));
}

export function createInitialRun(input?: InitialRunInput): RunState;
export function createInitialRun(): RunState {
  return createInitialRunState();
}

export function getAvailableDecisions(run: RunState): TrayCompositionResult {
  if (run.status !== "active") {
    return createEmptyTrayResult();
  }

  return composeDecisionTray(loadContentManifest().decisions, run);
}

export function toggleDecision(run: RunState, decisionId: string): RunState {
  if (run.status !== "active") {
    return run;
  }

  const selectedDecisionIds = run.selectedDecisionIds.includes(decisionId)
    ? run.selectedDecisionIds.filter((id) => id !== decisionId)
    : [...run.selectedDecisionIds, decisionId].slice(0, 2);
  const resources = normalizeConsumableResources(run.resources);
  const selectedDecisions = getDecisionsById(
    selectedDecisionIds,
    loadContentManifest().decisionById,
  );
  const selectionCost = getDecisionSelectionCost(selectedDecisions);

  if (!canAffordResourceCosts(resources, selectionCost)) {
    return {
      ...run,
      resources,
    };
  }

  return {
    ...run,
    resources,
    selectedDecisionIds,
  };
}

export function resolveRound(run: RunState): RunState {
  if (run.status !== "active") {
    return run;
  }

  return resolveSimulationRound(run);
}

export function getEnding(run: RunState): EndingDefinition | null {
  if (!run.endingId) {
    return null;
  }

  return loadContentManifest().endingById[run.endingId] ?? null;
}

export const simulationRuntime: SimulationRuntime = {
  createInitialRun,
  getAvailableDecisions,
  toggleDecision,
  resolveRound,
  getEnding,
};
