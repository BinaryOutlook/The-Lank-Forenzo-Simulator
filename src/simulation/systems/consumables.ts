import { consumableResourceKeys } from "../content/metadata.js";
import type {
  ConsumableResourceKey,
  ConsumableResources,
  DecisionDefinition,
  ResourceCostSet,
} from "../state/types.js";

export const initialConsumableResources: ConsumableResources = {
  inGameMoney: 54,
  personalAssets: 9,
  publicRelationsCapital: 16,
};

export const consumableResourceLabels: Record<ConsumableResourceKey, string> = {
  inGameMoney: "Strategic cash",
  personalAssets: "Personal assets",
  publicRelationsCapital: "PR capital",
};

const consumableResourceUnits: Record<ConsumableResourceKey, string> = {
  inGameMoney: "$M",
  personalAssets: "asset",
  publicRelationsCapital: "PR",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function normalizeConsumableResources(
  resources: Partial<ConsumableResources> | undefined,
): ConsumableResources {
  return Object.fromEntries(
    consumableResourceKeys.map((resource) => [
      resource,
      Math.max(0, Math.round(resources?.[resource] ?? initialConsumableResources[resource])),
    ]),
  ) as ConsumableResources;
}

export function coerceConsumableResources(value: unknown): ConsumableResources {
  if (!isRecord(value)) {
    return normalizeConsumableResources(undefined);
  }

  const resources: Partial<ConsumableResources> = {};

  for (const resource of consumableResourceKeys) {
    const rawValue = value[resource];

    if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
      resources[resource] = rawValue;
    }
  }

  return normalizeConsumableResources(resources);
}

export function normalizeResourceCosts(
  costs: ResourceCostSet | undefined,
): ResourceCostSet {
  if (!costs) {
    return {};
  }

  return Object.fromEntries(
    consumableResourceKeys
      .map((resource) => [resource, Math.max(0, Math.round(costs[resource] ?? 0))] as const)
      .filter(([, value]) => value > 0),
  ) as ResourceCostSet;
}

export function getDecisionResourceCosts(
  decision: DecisionDefinition,
): ResourceCostSet {
  return normalizeResourceCosts(decision.resourceCosts);
}

export function hasResourceCosts(costs: ResourceCostSet | undefined): boolean {
  return consumableResourceKeys.some((resource) => (costs?.[resource] ?? 0) > 0);
}

export function addResourceCosts(
  left: ResourceCostSet | undefined,
  right: ResourceCostSet | undefined,
): ResourceCostSet {
  return Object.fromEntries(
    consumableResourceKeys
      .map((resource) => [
        resource,
        (left?.[resource] ?? 0) + (right?.[resource] ?? 0),
      ] as const)
      .filter(([, value]) => value > 0),
  ) as ResourceCostSet;
}

export function getDecisionSelectionCost(
  decisions: DecisionDefinition[],
): ResourceCostSet {
  return decisions.reduce<ResourceCostSet>(
    (total, decision) => addResourceCosts(total, decision.resourceCosts),
    {},
  );
}

export function canAffordResourceCosts(
  resources: ConsumableResources,
  costs: ResourceCostSet | undefined,
): boolean {
  return consumableResourceKeys.every(
    (resource) => resources[resource] >= (costs?.[resource] ?? 0),
  );
}

export function getInsufficientResourceKeys(
  resources: ConsumableResources,
  costs: ResourceCostSet | undefined,
): ConsumableResourceKey[] {
  return consumableResourceKeys.filter(
    (resource) => resources[resource] < (costs?.[resource] ?? 0),
  );
}

export function deductResourceCosts(
  resources: ConsumableResources,
  costs: ResourceCostSet | undefined,
): ConsumableResources {
  return Object.fromEntries(
    consumableResourceKeys.map((resource) => [
      resource,
      Math.max(0, resources[resource] - (costs?.[resource] ?? 0)),
    ]),
  ) as ConsumableResources;
}

export function projectResourceSpend(
  resources: ConsumableResources,
  costs: ResourceCostSet | undefined,
): ConsumableResources {
  return deductResourceCosts(resources, costs);
}

export function formatResourceValue(
  resource: ConsumableResourceKey,
  value: number,
): string {
  if (resource === "inGameMoney") {
    return `$${value}M`;
  }

  const unit = consumableResourceUnits[resource];
  const roundedValue = Math.round(value);

  if (resource === "personalAssets") {
    return `${roundedValue} ${unit}${roundedValue === 1 ? "" : "s"}`;
  }

  return `${roundedValue} ${unit}`;
}

export function formatResourceCost(
  resource: ConsumableResourceKey,
  value: number,
): string {
  if (resource === "inGameMoney") {
    return `-$${value}M`;
  }

  return `-${formatResourceValue(resource, value)}`;
}

export function formatResourceCostSummary(
  costs: ResourceCostSet | undefined,
): string {
  const entries = consumableResourceKeys
    .map((resource) => {
      const value = costs?.[resource] ?? 0;

      return value > 0
        ? `${consumableResourceLabels[resource]} ${formatResourceCost(resource, value)}`
        : null;
    })
    .filter((entry): entry is string => Boolean(entry));

  if (entries.length === 0) {
    return "No strategic reserve spend";
  }

  return entries.join(", ");
}
