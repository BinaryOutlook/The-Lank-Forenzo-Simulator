import type { ImpactSet, RunMetrics } from "../state/types";
import { clamp, type NetworkState } from "./networkState";

export interface OperationalBriefingSignal {
  title: string;
  body: string;
  tone: "positive" | "negative" | "neutral";
}

export interface OperationalCascade {
  id: string;
  title: string;
  severity: number;
  body: string;
  cause: string;
}

export interface ResolveNetworkContext {
  round: number;
  metrics: RunMetrics;
}

export interface NetworkQuarterResult {
  network: NetworkState;
  impacts: ImpactSet;
  briefingSignals: OperationalBriefingSignal[];
  cascades: OperationalCascade[];
}

export function resolveNetworkQuarter(
  network: NetworkState,
  context: ResolveNetworkContext,
): NetworkQuarterResult {
  const weatherStress = getWeatherStress(network);
  const crewFatigue = average(network.crewPools.map((pool) => pool.fatigue));
  const maxCrewFatigue = maxValue(
    network.crewPools.map((pool) => pool.fatigue),
  );
  const routeFragility = average(
    network.routes.map((route) => route.fragility),
  );
  const maxRouteFragility = maxValue(
    network.routes.map((route) => route.fragility),
  );
  const hubFragility = average(
    network.hubs
      .filter((hub) =>
        network.weatherFronts.some((front) =>
          front.affectedHubIds.includes(hub.id),
        ),
      )
      .map((hub) => hub.fragility),
  );
  const maxHubFragility = maxValue(network.hubs.map((hub) => hub.fragility));
  const fleetMaintenanceBurden = average(
    network.fleet.map((fleet) => fleet.maintenanceBurden),
  );
  const backlogStress = network.maintenanceBacklog;
  const safetyStress =
    backlogStress * 0.45 +
    crewFatigue * 0.18 +
    weatherStress * 0.22 +
    network.contractorDependence * 0.12;
  const disruptionDelta = Math.max(
    0,
    Math.round(
      (weatherStress + backlogStress + crewFatigue + routeFragility) / 18,
    ),
  );
  const cascades = buildOperationalCascades(network, context, {
    weatherStress,
    crewFatigue,
    maxCrewFatigue,
    routeFragility,
    maxRouteFragility,
    hubFragility,
    maxHubFragility,
    fleetMaintenanceBurden,
    backlogStress,
  });
  const cascadeImpacts = getCascadeImpacts(cascades);

  const impacts: ImpactSet = {
    airlineCash:
      -Math.round(disruptionDelta / 2) + (cascadeImpacts.airlineCash ?? 0),
    safetyIntegrity:
      -Math.max(1, Math.round(safetyStress / 24)) +
      (cascadeImpacts.safetyIntegrity ?? 0),
    publicAnger:
      Math.max(0, Math.round(disruptionDelta / 2)) +
      (cascadeImpacts.publicAnger ?? 0),
    marketConfidence:
      -Math.max(1, Math.round(disruptionDelta / 3)) +
      (cascadeImpacts.marketConfidence ?? 0),
    legalHeat: cascadeImpacts.legalHeat ?? 0,
  };
  const cascadeStress = getCascadeStress(cascades);
  const weatherHitHubIds = new Set(getAffectedHubIds(network));

  const nextNetwork: NetworkState = {
    ...network,
    maintenanceBacklog: clamp(network.maintenanceBacklog + 2, 0, 100),
    serviceDisruption: clamp(
      network.serviceDisruption + disruptionDelta + cascades.length * 4,
      0,
      100,
    ),
    weatherFronts: network.weatherFronts
      .map((front) => ({
        ...front,
        roundsRemaining: front.roundsRemaining - 1,
      }))
      .filter((front) => front.roundsRemaining > 0),
    hubs: network.hubs.map((hub) => ({
      ...hub,
      fragility: clamp(
        hub.fragility +
          (cascadeStress.weather > 0 && weatherHitHubIds.has(hub.id)
            ? cascadeStress.weather
            : 0) +
          cascadeStress.route,
        0,
        100,
      ),
    })),
    routes: network.routes.map((route) => ({
      ...route,
      fragility: clamp(route.fragility + cascadeStress.route, 0, 100),
    })),
    fleet: network.fleet.map((fleet) => ({
      ...fleet,
      maintenanceBurden: clamp(
        fleet.maintenanceBurden + cascadeStress.contractor,
        0,
        100,
      ),
    })),
    crewPools: network.crewPools.map((pool) => ({
      ...pool,
      fatigue: clamp(pool.fatigue + cascadeStress.crew, 0, 100),
    })),
  };

  return {
    network: nextNetwork,
    impacts,
    cascades,
    briefingSignals: buildBriefingSignals(
      nextNetwork,
      cascades,
      disruptionDelta,
    ),
  };
}

interface NetworkStressSnapshot {
  weatherStress: number;
  crewFatigue: number;
  maxCrewFatigue: number;
  routeFragility: number;
  maxRouteFragility: number;
  hubFragility: number;
  maxHubFragility: number;
  fleetMaintenanceBurden: number;
  backlogStress: number;
}

function buildOperationalCascades(
  network: NetworkState,
  context: ResolveNetworkContext,
  stress: NetworkStressSnapshot,
): OperationalCascade[] {
  const cascades: OperationalCascade[] = [];
  const affectedHubs = getAffectedHubIds(network);

  if (
    stress.weatherStress >= 60 &&
    stress.backlogStress >= 45 &&
    context.metrics.safetyIntegrity <= 48
  ) {
    cascades.push({
      id: "maintenance-weather-cascade",
      title: "Maintenance Weather Cascade",
      severity: clamp(
        stress.weatherStress * 0.4 +
          stress.hubFragility * 0.25 +
          stress.backlogStress * 0.3 +
          (100 - context.metrics.safetyIntegrity) * 0.15,
      ),
      body: `${formatHubList(affectedHubs)} loses recovery slack as inspection deferrals meet weather.`,
      cause:
        "Deferred maintenance left fragile hubs without enough slack to absorb the weather front.",
    });
  }

  if (
    network.contractorDependence >= 58 &&
    (stress.backlogStress >= 38 || stress.fleetMaintenanceBurden >= 58) &&
    context.metrics.safetyIntegrity <= 58
  ) {
    cascades.push({
      id: "contractor-control-cascade",
      title: "Contractor Control Cascade",
      severity: clamp(
        network.contractorDependence * 0.4 +
          stress.backlogStress * 0.25 +
          stress.fleetMaintenanceBurden * 0.25 +
          (100 - context.metrics.safetyIntegrity) * 0.1,
      ),
      body: "The outsourced maintenance chain becomes the operating bottleneck instead of a cost story.",
      cause:
        "Heavy checks were outsourced while backlog and vendor dependence made contractors the point of failure.",
    });
  }

  if (
    stress.crewFatigue >= 62 &&
    (context.metrics.workforceMorale <= 44 ||
      network.serviceDisruption >= 28) &&
    (stress.maxRouteFragility >= 50 || network.serviceDisruption >= 25)
  ) {
    cascades.push({
      id: "crew-availability-cascade",
      title: "Crew Availability Cascade",
      severity: clamp(
        stress.crewFatigue * 0.45 +
          stress.maxCrewFatigue * 0.15 +
          stress.maxRouteFragility * 0.15 +
          network.serviceDisruption * 0.15 +
          (100 - context.metrics.workforceMorale) * 0.1,
      ),
      body: "Crew coverage stops flexing and starts deciding which stations fail in public.",
      cause:
        "Crew cuts, scope pressure, and brittle recovery routes left too few legal crews in the right cities.",
    });
  }

  if (
    stress.maxRouteFragility >= 64 &&
    (context.metrics.publicAnger >= 38 ||
      context.metrics.marketConfidence <= 44 ||
      network.serviceDisruption >= 30)
  ) {
    cascades.push({
      id: "route-stranding-cascade",
      title: "Route Stranding Cascade",
      severity: clamp(
        stress.maxRouteFragility * 0.42 +
          stress.maxHubFragility * 0.22 +
          network.serviceDisruption * 0.18 +
          context.metrics.publicAnger * 0.18,
      ),
      body: "Thin-route cuts strand enough passengers that the network map reads like evidence.",
      cause:
        "Route purges and slot concessions concentrated disruption onto fragile spokes and exposed the retreat.",
    });
  }

  return cascades.sort((left, right) => right.severity - left.severity);
}

function getCascadeImpacts(cascades: OperationalCascade[]): ImpactSet {
  let airlineCash = 0;
  let safetyIntegrity = 0;
  let publicAnger = 0;
  let marketConfidence = 0;
  let legalHeat = 0;

  for (const cascade of cascades) {
    const intensity = Math.max(1, Math.round(cascade.severity / 24));

    if (cascade.id === "maintenance-weather-cascade") {
      airlineCash -= intensity;
      safetyIntegrity -= intensity;
      publicAnger += intensity;
      marketConfidence -= intensity;
      legalHeat += intensity + 1;
    }

    if (cascade.id === "contractor-control-cascade") {
      airlineCash -= intensity;
      safetyIntegrity -= intensity;
      publicAnger += Math.max(1, intensity - 1);
      marketConfidence -= intensity;
      legalHeat += intensity + 1;
    }

    if (cascade.id === "crew-availability-cascade") {
      airlineCash -= intensity + 1;
      safetyIntegrity -= Math.max(1, intensity - 1);
      publicAnger += intensity + 2;
      marketConfidence -= intensity;
      legalHeat += Math.max(1, intensity - 1);
    }

    if (cascade.id === "route-stranding-cascade") {
      airlineCash -= intensity + 1;
      publicAnger += intensity + 2;
      marketConfidence -= intensity + 1;
      legalHeat += Math.max(1, intensity - 1);
    }
  }

  return {
    airlineCash,
    safetyIntegrity,
    publicAnger,
    marketConfidence,
    legalHeat,
  };
}

function getCascadeStress(cascades: OperationalCascade[]): {
  weather: number;
  contractor: number;
  crew: number;
  route: number;
} {
  return {
    weather: cascades.some(
      (cascade) => cascade.id === "maintenance-weather-cascade",
    )
      ? 3
      : 0,
    contractor: cascades.some(
      (cascade) => cascade.id === "contractor-control-cascade",
    )
      ? 3
      : 0,
    crew: cascades.some((cascade) => cascade.id === "crew-availability-cascade")
      ? 4
      : 0,
    route: cascades.some((cascade) => cascade.id === "route-stranding-cascade")
      ? 3
      : 0,
  };
}

function buildBriefingSignals(
  network: NetworkState,
  cascades: OperationalCascade[],
  disruptionDelta: number,
): OperationalBriefingSignal[] {
  if (cascades.length > 0) {
    return cascades.slice(0, 2).map((cascade) => ({
      title: cascade.title,
      body: `${cascade.body} Cause: ${cascade.cause}`,
      tone: "negative",
    }));
  }

  if (disruptionDelta > 4 || network.maintenanceBacklog >= 45) {
    return [
      {
        title: "Operations are absorbing too much stress",
        body: "Maintenance backlog and thin crews are converting savings into public failure risk.",
        tone: "negative",
      },
    ];
  }

  return [
    {
      title: "Network stress is contained",
      body: "The operation still has enough slack to keep disruptions mostly internal.",
      tone: "neutral",
    },
  ];
}

function getWeatherStress(network: NetworkState): number {
  return Math.max(0, ...network.weatherFronts.map((front) => front.severity));
}

function getAffectedHubIds(network: NetworkState): string[] {
  return [
    ...new Set(network.weatherFronts.flatMap((front) => front.affectedHubIds)),
  ];
}

function formatHubList(hubIds: string[]): string {
  if (hubIds.length === 0) {
    return "The network";
  }

  return hubIds.map((hubId) => hubId.toUpperCase()).join("/");
}

function maxValue(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return Math.max(...values);
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
