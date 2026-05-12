import {
  consumableResourceLabels,
  getInsufficientResourceKeys,
} from "../../simulation/systems/consumables.js";
import type {
  ConsumableResources,
  ResourceCostSet,
} from "../../simulation/state/types.js";

export type RoundPhase = "read" | "choose" | "resolve";

export interface RoundPhaseConfig {
  id: RoundPhase;
  step: string;
  label: string;
  title: string;
  description: string;
}

export interface RoundSelectionValidation {
  valid: boolean;
  statusLabel: string;
  guidance: string;
}

interface RoundSelectionValidationInput {
  resources: ConsumableResources;
  selectedCost: ResourceCostSet;
  selectedDecisionCount: number;
}

const requiredRoundDecisionCount = 2;

export const roundPhaseConfigs: RoundPhaseConfig[] = [
  {
    id: "read",
    step: "01",
    label: "Read / Board Packet",
    title: "Read the packet",
    description:
      "Inspect run state, pressure reads, and the consequence record.",
  },
  {
    id: "choose",
    step: "02",
    label: "Choose Plays",
    title: "Choose plays",
    description: "Queue up to two decisions on a dedicated selection surface.",
  },
  {
    id: "resolve",
    step: "03",
    label: "Resolve / End Round",
    title: "Resolve the quarter",
    description:
      "Confirm queued action and advance the deterministic simulation.",
  },
];

export function getRoundPhaseIndex(phase: RoundPhase): number {
  return roundPhaseConfigs.findIndex((config) => config.id === phase);
}

export function getNextRoundPhase(phase: RoundPhase): RoundPhase {
  if (phase === "read") {
    return "choose";
  }

  if (phase === "choose") {
    return "resolve";
  }

  return "resolve";
}

export function isRoundPhaseReachable(
  targetPhase: RoundPhase,
  furthestPhase: RoundPhase,
): boolean {
  if (targetPhase !== "resolve") {
    return true;
  }

  return getRoundPhaseIndex(furthestPhase) >= getRoundPhaseIndex("choose");
}

export function getRoundResolveLabel(): string {
  return "End quarter";
}

export function validateRoundSelection({
  resources,
  selectedCost,
  selectedDecisionCount,
}: RoundSelectionValidationInput): RoundSelectionValidation {
  if (selectedDecisionCount > requiredRoundDecisionCount) {
    return {
      valid: false,
      statusLabel: "Selection overflow",
      guidance: "Reduce the docket to two queued plays before resolution.",
    };
  }

  const insufficientResources = getInsufficientResourceKeys(
    resources,
    selectedCost,
  );

  if (insufficientResources.length > 0) {
    return {
      valid: false,
      statusLabel: "Reserve shortfall",
      guidance: `Missing reserves: ${insufficientResources
        .map((resource) => consumableResourceLabels[resource])
        .join(", ")}. Amend the docket before resolution.`,
    };
  }

  if (selectedDecisionCount < requiredRoundDecisionCount) {
    const missingDecisionCount =
      requiredRoundDecisionCount - selectedDecisionCount;

    return {
      valid: true,
      statusLabel: `${missingDecisionCount} choice${
        missingDecisionCount === 1 ? "" : "s"
      } pending`,
      guidance: `${missingDecisionCount} more choice${
        missingDecisionCount === 1 ? "" : "s"
      } required before the quarter can resolve.`,
    };
  }

  return {
    valid: true,
    statusLabel: `${selectedDecisionCount}/${requiredRoundDecisionCount} plays ready`,
    guidance: "Queued plays satisfy the selection and reserve checks.",
  };
}
