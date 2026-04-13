import { describe, expect, it } from "vitest";
import { createInitialRunState } from "../../src/simulation/resolution/resolveRound";
import { getAutomaticEndingId } from "../../src/simulation/systems/endingRules";

describe("automatic ending rules", () => {
  it("fires the prison ending for severe legal exposure", () => {
    const run = createInitialRunState();
    run.metrics.legalHeat = 95;

    expect(getAutomaticEndingId(run.metrics)).toBe("prison");
  });

  it("fires the forced removal ending when the board can no longer tolerate the run", () => {
    const run = createInitialRunState();
    run.metrics.creditorPatience = 0;

    expect(getAutomaticEndingId(run.metrics)).toBe("forcedRemoval");
  });

  it("stays null when the run has not crossed an automatic threshold", () => {
    const run = createInitialRunState();

    expect(getAutomaticEndingId(run.metrics)).toBeNull();
  });
});
