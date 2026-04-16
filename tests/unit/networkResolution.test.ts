import { describe, expect, it } from "vitest";
import {
  applyNetworkDecisionEffects,
  createDefaultNetworkState,
} from "../../src/simulation/operations/networkState";
import { resolveNetworkQuarter } from "../../src/simulation/operations/networkResolution";
import { createInitialRunState } from "../../src/simulation/resolution/resolveRound";

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
      selectedDecisionIds: [
        "downgrade_the_inspection_memo",
        "vendor_swap_the_heavy_checks",
        "replace_the_strike_map",
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
      selectedDecisionIds: [
        "downgrade_the_inspection_memo",
        "stretch_the_mel_clock",
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
});
