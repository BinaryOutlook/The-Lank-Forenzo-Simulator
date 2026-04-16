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
  selectedDecisionIds: string[];
}

const MAINTENANCE_DEFERRAL_DECISIONS = new Set([
  "downgrade_the_inspection_memo",
  "vendor_swap_the_heavy_checks",
  "stretch_the_mel_clock",
]);

const CREW_STRESS_DECISIONS = new Set([
  "replace_the_strike_map",
  "headcount_bloodletting",
  "weaponize_the_scope_clause",
]);

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
  let maintenanceBacklog = network.maintenanceBacklog;
  let contractorDependence = network.contractorDependence;
  let crewStress = 0;

  for (const decisionId of input.selectedDecisionIds) {
    if (MAINTENANCE_DEFERRAL_DECISIONS.has(decisionId)) {
      maintenanceBacklog += 16;
      contractorDependence += decisionId === "vendor_swap_the_heavy_checks" ? 14 : 6;
    }

    if (CREW_STRESS_DECISIONS.has(decisionId)) {
      crewStress += 12;
    }
  }

  return {
    ...network,
    maintenanceBacklog,
    contractorDependence,
    hubs: network.hubs.map((hub) => ({
      ...hub,
      fragility: clamp(hub.fragility + Math.round(maintenanceBacklog / 24), 0, 100),
    })),
    crewPools: network.crewPools.map((pool) => ({
      ...pool,
      fatigue: clamp(pool.fatigue + crewStress, 0, 100),
    })),
  };
}

export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}
