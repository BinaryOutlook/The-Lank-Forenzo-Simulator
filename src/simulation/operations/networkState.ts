import type { DecisionDefinition, OperationEffectSet } from "../state/types";

export interface HubState {
  id: string;
  slotCapacity: number;
  fragility: number;
}

export interface RouteState {
  id: string;
  from: string;
  to: string;
  demand: number;
  fragility: number;
}

export interface FleetState {
  id: string;
  aircraft: number;
  maintenanceBurden: number;
}

export interface CrewPoolState {
  id: string;
  availableCrews: number;
  fatigue: number;
}

export interface WeatherFrontState {
  id: string;
  affectedHubIds: string[];
  severity: number;
  roundsRemaining: number;
}

export interface NetworkState {
  hubs: HubState[];
  routes: RouteState[];
  fleet: FleetState[];
  crewPools: CrewPoolState[];
  weatherFronts: WeatherFrontState[];
  maintenanceBacklog: number;
  contractorDependence: number;
  serviceDisruption: number;
}

export interface NetworkDecisionEffectInput {
  selectedDecisions: readonly Pick<
    DecisionDefinition,
    "id" | "operationEffects"
  >[];
}

export function createDefaultNetworkState(): NetworkState {
  return {
    hubs: [
      { id: "ewr", slotCapacity: 82, fragility: 48 },
      { id: "ord", slotCapacity: 76, fragility: 44 },
      { id: "iah", slotCapacity: 68, fragility: 38 },
      { id: "den", slotCapacity: 72, fragility: 36 },
      { id: "lax", slotCapacity: 66, fragility: 42 },
      { id: "sfo", slotCapacity: 62, fragility: 46 },
      { id: "mco", slotCapacity: 40, fragility: 34 },
      { id: "cle", slotCapacity: 36, fragility: 52 },
    ],
    routes: [
      { id: "ewr-ord", from: "ewr", to: "ord", demand: 78, fragility: 46 },
      { id: "ewr-iah", from: "ewr", to: "iah", demand: 62, fragility: 42 },
      { id: "ewr-den", from: "ewr", to: "den", demand: 58, fragility: 40 },
      { id: "ord-den", from: "ord", to: "den", demand: 66, fragility: 36 },
      { id: "ord-lax", from: "ord", to: "lax", demand: 70, fragility: 44 },
      { id: "ord-sfo", from: "ord", to: "sfo", demand: 64, fragility: 43 },
      { id: "iah-den", from: "iah", to: "den", demand: 56, fragility: 34 },
      { id: "iah-mco", from: "iah", to: "mco", demand: 48, fragility: 32 },
      { id: "den-lax", from: "den", to: "lax", demand: 60, fragility: 38 },
      { id: "den-sfo", from: "den", to: "sfo", demand: 52, fragility: 37 },
      { id: "lax-sfo", from: "lax", to: "sfo", demand: 74, fragility: 41 },
      { id: "cle-ewr", from: "cle", to: "ewr", demand: 36, fragility: 55 },
    ],
    fleet: [
      { id: "narrowbody", aircraft: 112, maintenanceBurden: 36 },
      { id: "widebody", aircraft: 44, maintenanceBurden: 54 },
      { id: "regional", aircraft: 68, maintenanceBurden: 48 },
    ],
    crewPools: [
      { id: "mainline", availableCrews: 720, fatigue: 28 },
      { id: "regional", availableCrews: 410, fatigue: 36 },
      { id: "contract", availableCrews: 180, fatigue: 42 },
    ],
    weatherFronts: [
      {
        id: "front-normal",
        affectedHubIds: ["ewr"],
        severity: 24,
        roundsRemaining: 2,
      },
    ],
    maintenanceBacklog: 18,
    contractorDependence: 22,
    serviceDisruption: 10,
  };
}

export function applyNetworkDecisionEffects(
  network: NetworkState,
  input: NetworkDecisionEffectInput,
): NetworkState {
  const effects = combineOperationEffects(
    input.selectedDecisions.map((decision) => decision.operationEffects),
  );
  const maintenanceBacklog = clamp(
    network.maintenanceBacklog + (effects.maintenanceBacklog ?? 0),
    0,
    100,
  );
  const contractorDependence = clamp(
    network.contractorDependence + (effects.contractorDependence ?? 0),
    0,
    100,
  );
  const serviceDisruption = clamp(
    network.serviceDisruption + (effects.serviceDisruption ?? 0),
    0,
    100,
  );
  const crewFatigue = effects.crewFatigue ?? 0;

  return {
    ...network,
    maintenanceBacklog,
    contractorDependence,
    serviceDisruption,
    hubs: network.hubs.map((hub) => ({
      ...hub,
      fragility: clamp(
        hub.fragility +
          Math.round(maintenanceBacklog / 24) +
          (effects.hubFragility?.[hub.id] ?? 0),
        0,
        100,
      ),
    })),
    routes: network.routes.map((route) => ({
      ...route,
      fragility: clamp(
        route.fragility + (effects.routeFragility?.[route.id] ?? 0),
        0,
        100,
      ),
    })),
    crewPools: network.crewPools.map((pool) => ({
      ...pool,
      fatigue: clamp(pool.fatigue + crewFatigue, 0, 100),
    })),
    weatherFronts: network.weatherFronts.map((front) => ({
      ...front,
      severity: clamp(front.severity + (effects.weatherExposure ?? 0), 0, 100),
    })),
  };
}

function combineOperationEffects(
  effectSets: readonly (OperationEffectSet | undefined)[],
): OperationEffectSet {
  const combined: OperationEffectSet = {};

  for (const effects of effectSets) {
    if (!effects) {
      continue;
    }

    addScalarEffect(combined, "maintenanceBacklog", effects.maintenanceBacklog);
    addScalarEffect(
      combined,
      "contractorDependence",
      effects.contractorDependence,
    );
    addScalarEffect(combined, "crewFatigue", effects.crewFatigue);
    addScalarEffect(combined, "serviceDisruption", effects.serviceDisruption);
    addScalarEffect(combined, "weatherExposure", effects.weatherExposure);
    addRecordEffects(combined, "hubFragility", effects.hubFragility);
    addRecordEffects(combined, "routeFragility", effects.routeFragility);
  }

  return combined;
}

function addScalarEffect(
  target: OperationEffectSet,
  key:
    | "maintenanceBacklog"
    | "contractorDependence"
    | "crewFatigue"
    | "serviceDisruption"
    | "weatherExposure",
  value: number | undefined,
) {
  if (value === undefined) {
    return;
  }

  target[key] = (target[key] ?? 0) + value;
}

function addRecordEffects(
  target: OperationEffectSet,
  key: "hubFragility" | "routeFragility",
  values: Record<string, number> | undefined,
) {
  if (!values) {
    return;
  }

  target[key] ??= {};

  for (const [id, value] of Object.entries(values)) {
    target[key][id] = (target[key][id] ?? 0) + value;
  }
}

export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}
