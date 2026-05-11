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
        cause: expect.stringContaining("Deferred maintenance"),
      }),
    );
    expect(result.impacts.legalHeat).toBeGreaterThan(0);
    expect(result.network.serviceDisruption).toBeGreaterThan(
      network.serviceDisruption,
    );
  });

  it("traces a contractor-control cascade from outsourced maintenance exposure", () => {
    const run = createInitialRunState();
    const network = applyNetworkDecisionEffects(createDefaultNetworkState(), {
      selectedDecisionIds: [
        "outsourcing_blitz",
        "vendor_swap_the_heavy_checks",
        "outsource_the_overhaul_night_shift",
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

  it("traces a crew-availability cascade when cuts leave recovery crews brittle", () => {
    const run = createInitialRunState();
    const network = applyNetworkDecisionEffects(createDefaultNetworkState(), {
      selectedDecisionIds: [
        "headcount_bloodletting",
        "replace_the_strike_map",
        "weaponize_the_scope_clause",
        "patch_the_crew_app_live",
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
        cause: expect.stringContaining("crew"),
      }),
    );
    expect(result.impacts.publicAnger).toBeGreaterThan(0);
    expect(result.impacts.marketConfidence).toBeLessThan(0);
  });

  it("traces a route-stranding cascade when network cuts concentrate failures", () => {
    const run = createInitialRunState();
    const network = applyNetworkDecisionEffects(createDefaultNetworkState(), {
      selectedDecisionIds: [
        "close_the_hub",
        "route_purge",
        "cancel_the_spoke_bank",
        "carve_out_the_prize_slots",
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
        cause: expect.stringContaining("Route purges"),
      }),
    );
    expect(result.impacts.publicAnger).toBeGreaterThan(0);
    expect(result.impacts.marketConfidence).toBeLessThan(0);
  });

  it("lets stabilizing choices reduce cascade pressure before weather lands", () => {
    const run = createInitialRunState();
    const deferred = applyNetworkDecisionEffects(createDefaultNetworkState(), {
      selectedDecisionIds: [
        "downgrade_the_inspection_memo",
        "vendor_swap_the_heavy_checks",
        "stretch_the_mel_clock",
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
      selectedDecisionIds: [
        "safety_spending_surge",
        "retention_for_loyal_captains",
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
});
