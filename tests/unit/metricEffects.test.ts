import { describe, expect, it } from "vitest";
import { createInitialRunState } from "../../src/simulation/resolution/resolveRound";
import {
  applyImpactSet,
  clampRunMetrics,
} from "../../src/simulation/systems/metricEffects";

describe("metric effects", () => {
  it("clamps a raw metric snapshot to the authored bounds", () => {
    const run = createInitialRunState();

    const clamped = clampRunMetrics({
      ...run.metrics,
      airlineCash: 9999,
      personalWealth: -9,
      debt: -1,
      assetValue: 2000,
      workforceSize: 50,
      workforceMorale: -20,
      marketConfidence: 999,
      creditorPatience: -5,
      legalHeat: 123,
      safetyIntegrity: 250,
      publicAnger: -10,
      stockPrice: 1,
      offshoreReadiness: 140,
    });

    expect(clamped.airlineCash).toBe(900);
    expect(clamped.personalWealth).toBe(0);
    expect(clamped.debt).toBe(0);
    expect(clamped.assetValue).toBe(1500);
    expect(clamped.workforceSize).toBe(1200);
    expect(clamped.workforceMorale).toBe(0);
    expect(clamped.marketConfidence).toBe(100);
    expect(clamped.creditorPatience).toBe(0);
    expect(clamped.legalHeat).toBe(100);
    expect(clamped.safetyIntegrity).toBe(100);
    expect(clamped.publicAnger).toBe(0);
    expect(clamped.stockPrice).toBe(2);
    expect(clamped.offshoreReadiness).toBe(100);
  });

  it("applies impacts and clamps in one pass", () => {
    const run = createInitialRunState();

    const next = applyImpactSet(run.metrics, {
      airlineCash: -999,
      legalHeat: 999,
      stockPrice: 999,
    });

    expect(next.airlineCash).toBe(-280);
    expect(next.legalHeat).toBe(100);
    expect(next.stockPrice).toBe(120);
  });
});
