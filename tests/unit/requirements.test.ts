import { describe, expect, it } from "vitest";
import { createInitialRunState } from "../../src/simulation/resolution/resolveRound";
import {
  hasRequirementConstraints,
  meetsRequirements,
} from "../../src/simulation/systems/requirements";

describe("requirement evaluation", () => {
  it("recognizes when a spec actually carries constraints", () => {
    expect(hasRequirementConstraints(undefined)).toBe(false);
    expect(hasRequirementConstraints({})).toBe(false);
    expect(hasRequirementConstraints({ roundAtLeast: 3 })).toBe(true);
  });

  it("accepts runs that satisfy round, metric, and flag filters", () => {
    const run = createInitialRunState();
    run.round = 6;
    run.flags = ["shellCarrierLive", "bankruptcyPlaybookLive"];

    expect(
      meetsRequirements(
        {
          roundAtLeast: 5,
          roundAtMost: 7,
          metricMin: { marketConfidence: 40, legalHeat: 10 },
          metricMax: { publicAnger: 40 },
          flagsAll: ["shellCarrierLive"],
          flagsNone: ["blocked"],
        },
        run,
      ),
    ).toBe(true);
  });

  it("rejects runs that miss any part of the spec", () => {
    const run = createInitialRunState();
    run.round = 3;
    run.flags = ["shellCarrierLive"];

    expect(meetsRequirements({ roundAtLeast: 5 }, run)).toBe(false);
    expect(meetsRequirements({ metricMin: { legalHeat: 40 } }, run)).toBe(
      false,
    );
    expect(
      meetsRequirements({ metricMax: { marketConfidence: 40 } }, run),
    ).toBe(false);
    expect(meetsRequirements({ flagsAll: ["missing"] }, run)).toBe(false);
    expect(meetsRequirements({ flagsNone: ["shellCarrierLive"] }, run)).toBe(
      false,
    );
  });
});
