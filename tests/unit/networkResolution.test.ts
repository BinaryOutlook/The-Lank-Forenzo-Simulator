import { describe, expect, it } from "vitest";
import {
  applyNetworkDecisionEffects,
  createDefaultNetworkState,
} from "../../src/simulation/operations/networkState";
import { resolveNetworkQuarter } from "../../src/simulation/operations/networkResolution";
import { createInitialRunState } from "../../src/simulation/resolution/resolveRound";
import type { DecisionDefinition } from "../../src/simulation/state/types";

const decisionWithOperationEffects = (
  id: string,
  operationEffects: DecisionDefinition["operationEffects"],
): DecisionDefinition => ({
  id,
  pack: "core",
  title: id,
  summary: "Fixture decision",
  group: "operations",
  tags: ["fixture"],
  impacts: {},
  operationEffects,
});

describe("network resolution primitives", () => {
  it("creates a compact default network with stable authored topology", () => {
    const network = createDefaultNetworkState();

    expect(network.hubs).toHaveLength(8);
    expect(network.routes.length).toBeGreaterThanOrEqual(12);
    expect(network.fleet).toHaveLength(3);
    expect(network.crewPools).toHaveLength(3);
    expect(network.weatherFronts).toHaveLength(1);
    expect(network.maintenanceBacklog).toBe(18);
  });

  it("converts maintenance deferral and crew stress into macro impacts", () => {
    const run = createInitialRunState();
    const stressed = applyNetworkDecisionEffects(createDefaultNetworkState(), {
      selectedDecisions: [
        decisionWithOperationEffects("downgrade_the_inspection_memo", {
          maintenanceBacklog: 16,
          contractorDependence: 6,
        }),
        decisionWithOperationEffects("vendor_swap_the_heavy_checks", {
          maintenanceBacklog: 16,
          contractorDependence: 14,
        }),
        decisionWithOperationEffects("replace_the_strike_map", {
          crewFatigue: 12,
        }),
      ],
    });

    const result = resolveNetworkQuarter(stressed, {
      round: 4,
      metrics: {
        ...run.metrics,
        workforceMorale: 36,
        safetyIntegrity: 45,
      },
    });

    expect(result.impacts.safetyIntegrity).toBeLessThan(0);
    expect(result.impacts.publicAnger).toBeGreaterThan(0);
    expect(result.impacts.marketConfidence).toBeLessThan(0);
    expect(result.briefingSignals[0]?.tone).toBe("negative");
  });

  it("traces a weather cascade when prior deferrals hit a fragile hub", () => {
    const run = createInitialRunState();
    const network = applyNetworkDecisionEffects(createDefaultNetworkState(), {
      selectedDecisions: [
        decisionWithOperationEffects("downgrade_the_inspection_memo", {
          maintenanceBacklog: 16,
          contractorDependence: 6,
        }),
        decisionWithOperationEffects("stretch_the_mel_clock", {
          maintenanceBacklog: 16,
          contractorDependence: 6,
        }),
      ],
    });
    network.weatherFronts = [
      {
        id: "front-ops-cascade",
        affectedHubIds: ["ewr", "ord"],
        severity: 82,
        roundsRemaining: 1,
      },
    ];

    const result = resolveNetworkQuarter(network, {
      round: 6,
      metrics: {
        ...run.metrics,
        workforceMorale: 39,
        safetyIntegrity: 41,
      },
    });

    expect(result.cascades).toContainEqual(
      expect.objectContaining({
        id: "maintenance-weather-cascade",
        severity: expect.any(Number),
        cause: expect.stringContaining("Deferred maintenance"),
      }),
    );
    expect(result.impacts.legalHeat).toBeGreaterThan(0);
    expect(result.network.serviceDisruption).toBeGreaterThan(
      network.serviceDisruption,
    );
  });

  it("traces a contractor-control cascade from authored outsourced-maintenance exposure", () => {
    const run = createInitialRunState();
    const network = applyNetworkDecisionEffects(createDefaultNetworkState(), {
      selectedDecisions: [
        decisionWithOperationEffects("metadata_contractor_shift", {
          contractorDependence: 16,
          crewFatigue: 6,
          serviceDisruption: 5,
        }),
        decisionWithOperationEffects("metadata_vendor_swap", {
          maintenanceBacklog: 16,
          contractorDependence: 14,
        }),
        decisionWithOperationEffects("metadata_overhaul_outsource", {
          maintenanceBacklog: 12,
          contractorDependence: 18,
          crewFatigue: 5,
          serviceDisruption: 4,
        }),
      ],
    });

    const result = resolveNetworkQuarter(network, {
      round: 5,
      metrics: {
        ...run.metrics,
        safetyIntegrity: 52,
      },
    });

    expect(result.cascades).toContainEqual(
      expect.objectContaining({
        id: "contractor-control-cascade",
        cause: expect.stringContaining("outsourced"),
      }),
    );
    expect(result.impacts.legalHeat).toBeGreaterThan(0);
    expect(
      result.briefingSignals.some((signal) =>
        signal.title.includes("Contractor"),
      ),
    ).toBe(true);
  });

  it("traces a crew-availability cascade when metadata leaves recovery crews brittle", () => {
    const run = createInitialRunState();
    const network = applyNetworkDecisionEffects(createDefaultNetworkState(), {
      selectedDecisions: [
        decisionWithOperationEffects("metadata_crew_cut", {
          crewFatigue: 32,
          serviceDisruption: 18,
          routeFragility: {
            "ewr-ord": 12,
            "ord-lax": 10,
          },
        }),
      ],
    });

    const result = resolveNetworkQuarter(network, {
      round: 6,
      metrics: {
        ...run.metrics,
        workforceMorale: 34,
        publicAnger: 42,
      },
    });

    expect(result.cascades).toContainEqual(
      expect.objectContaining({
        id: "crew-availability-cascade",
        cause: expect.stringContaining("Crew"),
      }),
    );
    expect(result.impacts.publicAnger).toBeGreaterThan(0);
    expect(result.impacts.marketConfidence).toBeLessThan(0);
  });

  it("traces a route-stranding cascade when metadata concentrates route failures", () => {
    const run = createInitialRunState();
    const network = applyNetworkDecisionEffects(createDefaultNetworkState(), {
      selectedDecisions: [
        decisionWithOperationEffects("metadata_route_retreat", {
          serviceDisruption: 22,
          hubFragility: {
            cle: 12,
            ewr: 8,
          },
          routeFragility: {
            "cle-ewr": 25,
            "iah-mco": 25,
            "ewr-den": 25,
          },
        }),
      ],
    });

    const result = resolveNetworkQuarter(network, {
      round: 7,
      metrics: {
        ...run.metrics,
        publicAnger: 46,
        marketConfidence: 42,
      },
    });

    expect(result.cascades).toContainEqual(
      expect.objectContaining({
        id: "route-stranding-cascade",
        cause: expect.stringContaining("Route"),
      }),
    );
    expect(result.impacts.publicAnger).toBeGreaterThan(0);
    expect(result.impacts.marketConfidence).toBeLessThan(0);
  });

  it("lets stabilizing metadata reduce cascade pressure before weather lands", () => {
    const run = createInitialRunState();
    const deferred = applyNetworkDecisionEffects(createDefaultNetworkState(), {
      selectedDecisions: [
        decisionWithOperationEffects("metadata_deferral_one", {
          maintenanceBacklog: 16,
          contractorDependence: 6,
        }),
        decisionWithOperationEffects("metadata_deferral_two", {
          maintenanceBacklog: 16,
          contractorDependence: 6,
        }),
      ],
    });
    deferred.weatherFronts = [
      {
        id: "front-pressure-test",
        affectedHubIds: ["ewr", "ord"],
        severity: 84,
        roundsRemaining: 1,
      },
    ];

    const stabilized = applyNetworkDecisionEffects(deferred, {
      selectedDecisions: [
        decisionWithOperationEffects("metadata_safety_repair", {
          maintenanceBacklog: -24,
          crewFatigue: -5,
          serviceDisruption: -6,
        }),
      ],
    });

    const deferredResult = resolveNetworkQuarter(deferred, {
      round: 6,
      metrics: {
        ...run.metrics,
        safetyIntegrity: 42,
      },
    });
    const stabilizedResult = resolveNetworkQuarter(stabilized, {
      round: 6,
      metrics: {
        ...run.metrics,
        safetyIntegrity: 42,
      },
    });

    expect(stabilized.maintenanceBacklog).toBeLessThan(
      deferred.maintenanceBacklog,
    );
    expect(
      deferredResult.cascades.some(
        (cascade) => cascade.id === "maintenance-weather-cascade",
      ),
    ).toBe(true);
    expect(
      stabilizedResult.cascades.some(
        (cascade) => cascade.id === "maintenance-weather-cascade",
      ),
    ).toBe(false);
    expect(stabilizedResult.network.serviceDisruption).toBeLessThan(
      deferredResult.network.serviceDisruption,
    );
  });

  it("applies authored maintenance backlog effects without decision-id fallbacks", () => {
    const network = applyNetworkDecisionEffects(createDefaultNetworkState(), {
      selectedDecisions: [
        decisionWithOperationEffects("metadata_only_deferral", {
          maintenanceBacklog: 11,
          contractorDependence: 4,
        }),
      ],
    });

    expect(network.maintenanceBacklog).toBe(29);
    expect(network.contractorDependence).toBe(26);
    expect(network.hubs[0]?.fragility).toBeGreaterThan(
      createDefaultNetworkState().hubs[0]?.fragility ?? 0,
    );
  });

  it("does not apply legacy operational effects when metadata is absent", () => {
    const network = applyNetworkDecisionEffects(createDefaultNetworkState(), {
      selectedDecisions: [
        decisionWithOperationEffects("downgrade_the_inspection_memo", undefined),
      ],
    });

    expect(network.maintenanceBacklog).toBe(18);
    expect(network.contractorDependence).toBe(22);
  });

  it("applies authored crew fatigue effects from labor metadata", () => {
    const network = applyNetworkDecisionEffects(createDefaultNetworkState(), {
      selectedDecisions: [
        decisionWithOperationEffects("metadata_only_labor_cut", {
          crewFatigue: 9,
        }),
      ],
    });

    expect(network.crewPools.map((pool) => pool.fatigue)).toEqual([37, 45, 51]);
  });
});
