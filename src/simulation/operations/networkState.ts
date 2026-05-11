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

export interface NetworkDecisionEffect {
  maintenanceBacklog?: number;
  contractorDependence?: number;
  crewFatigue?: number;
  serviceDisruption?: number;
  hubFragility?: Record<string, number>;
  hubSlotCapacity?: Record<string, number>;
  routeDemand?: Record<string, number>;
  routeFragility?: Record<string, number>;
  fleetAircraft?: Record<string, number>;
  fleetMaintenanceBurden?: Record<string, number>;
}

const HUB_IDS = ["ewr", "ord", "iah", "den", "lax", "sfo", "mco", "cle"];
const ROUTE_IDS = [
  "ewr-ord",
  "ewr-iah",
  "ewr-den",
  "ord-den",
  "ord-lax",
  "ord-sfo",
  "iah-den",
  "iah-mco",
  "den-lax",
  "den-sfo",
  "lax-sfo",
  "cle-ewr",
];
const CORE_ROUTES = [
  "ewr-ord",
  "ewr-iah",
  "ord-lax",
  "ord-sfo",
  "den-lax",
  "lax-sfo",
];
const REGIONAL_ROUTES = ["cle-ewr", "iah-mco", "ewr-den", "iah-den"];
const FLEET_IDS = ["narrowbody", "widebody", "regional"];

const DECISION_OPERATION_EFFECTS: Record<string, NetworkDecisionEffect> = {
  downgrade_the_inspection_memo: {
    maintenanceBacklog: 16,
    contractorDependence: 6,
    routeFragility: valuesFor(["ewr-ord", "ewr-iah", "ord-sfo"], 3),
    fleetMaintenanceBurden: { narrowbody: 5, regional: 3 },
  },
  vendor_swap_the_heavy_checks: {
    maintenanceBacklog: 16,
    contractorDependence: 14,
    hubFragility: valuesFor(["ord", "lax", "sfo"], 4),
    fleetMaintenanceBurden: { narrowbody: 5, widebody: 8 },
  },
  stretch_the_mel_clock: {
    maintenanceBacklog: 16,
    contractorDependence: 6,
    routeFragility: valuesFor(CORE_ROUTES, 4),
    fleetMaintenanceBurden: valuesFor(FLEET_IDS, 6),
  },
  maintenance_reclassification: {
    maintenanceBacklog: 14,
    contractorDependence: 4,
    hubFragility: valuesFor(HUB_IDS, 2),
    fleetMaintenanceBurden: { narrowbody: 5 },
  },
  defer_the_red_tag_queue: {
    maintenanceBacklog: 18,
    contractorDependence: 5,
    routeFragility: valuesFor(CORE_ROUTES, 5),
    fleetMaintenanceBurden: valuesFor(FLEET_IDS, 5),
  },
  declare_the_parts_shortage_temporary: {
    maintenanceBacklog: 12,
    contractorDependence: 6,
    serviceDisruption: 3,
    fleetMaintenanceBurden: { narrowbody: 6, regional: 5 },
  },
  collapse_the_qc_layers: {
    maintenanceBacklog: 14,
    contractorDependence: 8,
    hubFragility: valuesFor(["ewr", "ord", "iah"], 5),
    fleetMaintenanceBurden: valuesFor(FLEET_IDS, 5),
  },
  borrow_from_training_hours: {
    crewFatigue: 6,
    serviceDisruption: 3,
    fleetMaintenanceBurden: { narrowbody: 3, regional: 4 },
  },
  auction_the_maintenance_base: {
    maintenanceBacklog: 10,
    contractorDependence: 12,
    hubFragility: valuesFor(["cle", "ewr", "ord"], 5),
  },
  sell_the_hangar_and_sublease_it: {
    maintenanceBacklog: 8,
    contractorDependence: 8,
    serviceDisruption: 3,
    hubFragility: valuesFor(["ewr", "ord"], 4),
  },
  harvest_the_spare_engines: {
    maintenanceBacklog: 8,
    serviceDisruption: 4,
    fleetAircraft: { narrowbody: -2, regional: -1 },
    fleetMaintenanceBurden: { narrowbody: 9, widebody: 6 },
  },
  outsourcing_blitz: {
    contractorDependence: 16,
    crewFatigue: 6,
    serviceDisruption: 5,
    routeFragility: valuesFor(REGIONAL_ROUTES, 5),
  },
  outsource_the_overhaul_night_shift: {
    maintenanceBacklog: 12,
    contractorDependence: 18,
    crewFatigue: 5,
    serviceDisruption: 4,
    fleetMaintenanceBurden: { narrowbody: 6, widebody: 8 },
  },
  wet_lease_the_growth: {
    contractorDependence: 12,
    crewFatigue: 5,
    serviceDisruption: 5,
    routeFragility: valuesFor(["ord-lax", "den-lax", "den-sfo"], 6),
  },
  headcount_bloodletting: {
    crewFatigue: 14,
    serviceDisruption: 6,
    hubFragility: valuesFor(["ewr", "ord", "cle"], 4),
    routeFragility: valuesFor(REGIONAL_ROUTES, 4),
  },
  replace_the_strike_map: {
    crewFatigue: 12,
    serviceDisruption: 4,
    routeFragility: valuesFor(["ewr-ord", "ord-den", "cle-ewr"], 4),
  },
  weaponize_the_scope_clause: {
    crewFatigue: 12,
    serviceDisruption: 3,
    routeFragility: valuesFor(["cle-ewr", "iah-mco", "ewr-den"], 5),
  },
  freeze_the_promise_book: {
    crewFatigue: 6,
    serviceDisruption: 2,
  },
  split_the_seniority_ladder: {
    crewFatigue: 9,
    serviceDisruption: 4,
    routeFragility: valuesFor(CORE_ROUTES, 3),
  },
  whipsaw_the_certificates: {
    crewFatigue: 10,
    contractorDependence: 6,
    serviceDisruption: 4,
    routeFragility: valuesFor(REGIONAL_ROUTES, 5),
  },
  regionalize_the_feed: {
    crewFatigue: 7,
    contractorDependence: 8,
    serviceDisruption: 5,
    routeFragility: valuesFor(REGIONAL_ROUTES, 7),
  },
  patch_the_crew_app_live: {
    crewFatigue: 10,
    serviceDisruption: 8,
    routeFragility: valuesFor(["ewr-ord", "ord-lax", "ord-sfo", "den-sfo"], 8),
  },
  close_the_hub: {
    serviceDisruption: 8,
    hubSlotCapacity: { cle: -16, ewr: -4 },
    hubFragility: { cle: 16, ewr: 8, ord: 4 },
    routeDemand: { "cle-ewr": -10, "ewr-ord": 4 },
    routeFragility: { "cle-ewr": 20, "ewr-ord": 6, "ewr-den": 5 },
  },
  route_purge: {
    serviceDisruption: 6,
    routeDemand: valuesFor(REGIONAL_ROUTES, -8),
    routeFragility: {
      ...valuesFor(REGIONAL_ROUTES, 12),
      "ewr-ord": 4,
      "ord-den": 4,
    },
  },
  cancel_the_spoke_bank: {
    serviceDisruption: 10,
    hubSlotCapacity: { mco: -6, cle: -8 },
    hubFragility: { mco: 8, cle: 10, iah: 4 },
    routeDemand: { "iah-mco": -10, "cle-ewr": -12 },
    routeFragility: { "iah-mco": 18, "cle-ewr": 18, "ewr-iah": 6 },
  },
  sell_the_gates_lease_the_story: {
    serviceDisruption: 5,
    hubSlotCapacity: { ewr: -8, ord: -6 },
    hubFragility: { ewr: 8, ord: 6 },
    routeFragility: valuesFor(["ewr-ord", "ord-lax", "ord-sfo"], 5),
  },
  carve_out_the_prize_slots: {
    serviceDisruption: 6,
    hubFragility: { ewr: 8, ord: 6, cle: 8 },
    routeDemand: { "cle-ewr": -8, "iah-mco": -6 },
    routeFragility: { "cle-ewr": 12, "iah-mco": 10, "ewr-ord": 5 },
  },
  trade_slots_for_goodwill: {
    serviceDisruption: 4,
    hubSlotCapacity: { ewr: -8, ord: -4 },
    hubFragility: { ewr: 6, ord: 4 },
    routeFragility: { "ewr-ord": 4, "ewr-iah": 4 },
  },
  blame_weather_then_trim_crews: {
    crewFatigue: 10,
    serviceDisruption: 6,
    routeFragility: valuesFor(CORE_ROUTES, 4),
  },
  safety_spending_surge: {
    maintenanceBacklog: -24,
    contractorDependence: -8,
    crewFatigue: -5,
    serviceDisruption: -6,
    hubFragility: valuesFor(HUB_IDS, -4),
    routeFragility: valuesFor(ROUTE_IDS, -4),
    fleetMaintenanceBurden: valuesFor(FLEET_IDS, -8),
  },
  buy_the_audit_weekend: {
    maintenanceBacklog: -14,
    contractorDependence: -4,
    serviceDisruption: -2,
    hubFragility: valuesFor(["ewr", "ord", "iah"], -3),
    fleetMaintenanceBurden: valuesFor(FLEET_IDS, -4),
  },
  sacrifice_on_time_to_hide_safety: {
    maintenanceBacklog: -12,
    serviceDisruption: 5,
    hubFragility: valuesFor(HUB_IDS, -2),
    routeFragility: valuesFor(ROUTE_IDS, -4),
    fleetMaintenanceBurden: valuesFor(FLEET_IDS, -5),
  },
  retention_for_loyal_captains: {
    crewFatigue: -14,
    serviceDisruption: -3,
    routeFragility: valuesFor(CORE_ROUTES, -2),
  },
  ground_the_oldest_tail_for_the_cameras: {
    maintenanceBacklog: -10,
    serviceDisruption: 3,
    fleetAircraft: { narrowbody: -1, regional: -1 },
    fleetMaintenanceBurden: valuesFor(FLEET_IDS, -8),
  },
};

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
  if (input.selectedDecisionIds.length === 0) {
    return network;
  }

  const effect = combineDecisionEffects(input.selectedDecisionIds);

  if (!hasNetworkEffect(effect)) {
    return network;
  }

  const maintenanceBacklog = clamp(
    network.maintenanceBacklog + (effect.maintenanceBacklog ?? 0),
    0,
    100,
  );
  const contractorDependence = clamp(
    network.contractorDependence + (effect.contractorDependence ?? 0),
    0,
    100,
  );
  const systemicMaintenanceDrift = Math.round(
    Math.max(0, effect.maintenanceBacklog ?? 0) / 16,
  );

  return {
    ...network,
    maintenanceBacklog,
    contractorDependence,
    serviceDisruption: clamp(
      network.serviceDisruption + (effect.serviceDisruption ?? 0),
      0,
      100,
    ),
    hubs: network.hubs.map((hub) => ({
      ...hub,
      slotCapacity: clamp(
        hub.slotCapacity + (effect.hubSlotCapacity?.[hub.id] ?? 0),
        0,
        120,
      ),
      fragility: clamp(
        hub.fragility +
          systemicMaintenanceDrift +
          (effect.hubFragility?.[hub.id] ?? 0),
        0,
        100,
      ),
    })),
    routes: network.routes.map((route) => ({
      ...route,
      demand: clamp(
        route.demand + (effect.routeDemand?.[route.id] ?? 0),
        0,
        120,
      ),
      fragility: clamp(
        route.fragility +
          systemicMaintenanceDrift +
          (effect.routeFragility?.[route.id] ?? 0),
        0,
        100,
      ),
    })),
    fleet: network.fleet.map((fleet) => ({
      ...fleet,
      aircraft: Math.max(
        0,
        fleet.aircraft + (effect.fleetAircraft?.[fleet.id] ?? 0),
      ),
      maintenanceBurden: clamp(
        fleet.maintenanceBurden +
          (effect.fleetMaintenanceBurden?.[fleet.id] ?? 0),
        0,
        100,
      ),
    })),
    crewPools: network.crewPools.map((pool) => ({
      ...pool,
      fatigue: clamp(pool.fatigue + (effect.crewFatigue ?? 0), 0, 100),
    })),
  };
}

export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function combineDecisionEffects(decisionIds: string[]): NetworkDecisionEffect {
  return decisionIds.reduce<NetworkDecisionEffect>((combined, decisionId) => {
    const effect = DECISION_OPERATION_EFFECTS[decisionId];

    if (!effect) {
      return combined;
    }

    return mergeEffects(combined, effect);
  }, {});
}

function mergeEffects(
  current: NetworkDecisionEffect,
  next: NetworkDecisionEffect,
): NetworkDecisionEffect {
  return {
    maintenanceBacklog:
      (current.maintenanceBacklog ?? 0) + (next.maintenanceBacklog ?? 0),
    contractorDependence:
      (current.contractorDependence ?? 0) + (next.contractorDependence ?? 0),
    crewFatigue: (current.crewFatigue ?? 0) + (next.crewFatigue ?? 0),
    serviceDisruption:
      (current.serviceDisruption ?? 0) + (next.serviceDisruption ?? 0),
    hubFragility: mergeRecordValues(current.hubFragility, next.hubFragility),
    hubSlotCapacity: mergeRecordValues(
      current.hubSlotCapacity,
      next.hubSlotCapacity,
    ),
    routeDemand: mergeRecordValues(current.routeDemand, next.routeDemand),
    routeFragility: mergeRecordValues(
      current.routeFragility,
      next.routeFragility,
    ),
    fleetAircraft: mergeRecordValues(current.fleetAircraft, next.fleetAircraft),
    fleetMaintenanceBurden: mergeRecordValues(
      current.fleetMaintenanceBurden,
      next.fleetMaintenanceBurden,
    ),
  };
}

function mergeRecordValues(
  current: Record<string, number> | undefined,
  next: Record<string, number> | undefined,
): Record<string, number> | undefined {
  if (!current && !next) {
    return undefined;
  }

  const merged: Record<string, number> = { ...(current ?? {}) };

  for (const [key, value] of Object.entries(next ?? {})) {
    merged[key] = (merged[key] ?? 0) + value;
  }

  return merged;
}

function hasNetworkEffect(effect: NetworkDecisionEffect): boolean {
  return (
    hasNonZeroValue(effect.maintenanceBacklog) ||
    hasNonZeroValue(effect.contractorDependence) ||
    hasNonZeroValue(effect.crewFatigue) ||
    hasNonZeroValue(effect.serviceDisruption) ||
    hasNonZeroRecordValue(effect.hubFragility) ||
    hasNonZeroRecordValue(effect.hubSlotCapacity) ||
    hasNonZeroRecordValue(effect.routeDemand) ||
    hasNonZeroRecordValue(effect.routeFragility) ||
    hasNonZeroRecordValue(effect.fleetAircraft) ||
    hasNonZeroRecordValue(effect.fleetMaintenanceBurden)
  );
}

function hasNonZeroValue(value: number | undefined): boolean {
  return value !== undefined && value !== 0;
}

function hasNonZeroRecordValue(
  record: Record<string, number> | undefined,
): boolean {
  return Object.values(record ?? {}).some((value) => value !== 0);
}

function valuesFor(ids: string[], value: number): Record<string, number> {
  return Object.fromEntries(ids.map((id) => [id, value]));
}
