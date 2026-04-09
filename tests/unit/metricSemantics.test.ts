import { describe, expect, it } from "vitest";
import {
  getImpactSetScore,
  getImpactTone,
  getMetricMeterTone,
} from "../../src/simulation/state/metricSemantics";

describe("metric semantics", () => {
  it("treats inverse-pressure metrics as positive when they fall", () => {
    expect(getImpactTone("legalHeat", -6)).toBe("positive");
    expect(getImpactTone("publicAnger", -4)).toBe("positive");
    expect(getImpactTone("debt", -20)).toBe("positive");
  });

  it("marks contextual metrics as neutral instead of forcing a green or red reading", () => {
    expect(getImpactTone("workforceSize", -500)).toBe("neutral");
    expect(getMetricMeterTone("workforceSize")).toBe("neutral");
  });

  it("scores cleanup actions as favorable when they reduce pressure", () => {
    expect(
      getImpactSetScore({
        airlineCash: -18,
        legalHeat: -12,
        publicAnger: -6,
      }),
    ).toBeGreaterThan(0);
  });
});
