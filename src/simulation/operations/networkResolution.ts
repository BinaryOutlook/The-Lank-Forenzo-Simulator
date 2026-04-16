import type { ImpactSet, RunMetrics } from "../state/types";
import { clamp, type NetworkState } from "./networkState";

export interface OperationalBriefingSignal {
  title: string;
  body: string;
  tone: "positive" | "negative" | "neutral";
}

export interface OperationalCascade {
  id: string;
  severity: number;
  body: string;
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
  const routeFragility = average(network.routes.map((route) => route.fragility));
  const hubFragility = average(
    network.hubs
      .filter((hub) =>
        network.weatherFronts.some((front) =>
          front.affectedHubIds.includes(hub.id),
        ),
      )
      .map((hub) => hub.fragility),
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
  const cascadeSeverity = Math.round(
    weatherStress * 0.45 + hubFragility * 0.3 + backlogStress * 0.35,
  );
  const cascades: OperationalCascade[] = [];

  if (
    weatherStress >= 60 &&
    backlogStress >= 45 &&
    context.metrics.safetyIntegrity <= 48
  ) {
    cascades.push({
      id: "maintenance-weather-cascade",
      severity: cascadeSeverity,
      body: "Deferred maintenance turned a weather front into a visible network failure.",
    });
  }

  const impacts: ImpactSet = {
    airlineCash: -Math.round(disruptionDelta / 2),
    safetyIntegrity: -Math.max(1, Math.round(safetyStress / 24)),
    publicAnger: Math.max(0, Math.round(disruptionDelta / 2)),
    marketConfidence: -Math.max(1, Math.round(disruptionDelta / 3)),
    legalHeat: cascades.length > 0 ? Math.max(1, Math.round(cascadeSeverity / 24)) : 0,
  };

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

function buildBriefingSignals(
  network: NetworkState,
  cascades: OperationalCascade[],
  disruptionDelta: number,
): OperationalBriefingSignal[] {
  if (cascades.length > 0) {
    return [
      {
        title: "Network fragility is now visible",
        body: cascades[0].body,
        tone: "negative",
      },
    ];
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

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
