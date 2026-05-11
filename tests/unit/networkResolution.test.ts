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
      }),
    );
    expect(result.impacts.legalHeat).toBeGreaterThan(0);
    expect(result.network.serviceDisruption).toBeGreaterThan(
      network.serviceDisruption,
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
