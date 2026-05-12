import { describe, expect, it } from "vitest";
import { initialConsumableResources } from "../../simulation/systems/consumables.js";
import {
  getNextRoundPhase,
  getRoundResolveLabel,
  isRoundPhaseReachable,
  validateRoundSelection,
} from "./roundFlow.js";

describe("round flow helpers", () => {
  it("walks the explicit read to choose to resolve sequence", () => {
    expect(getNextRoundPhase("read")).toBe("choose");
    expect(getNextRoundPhase("choose")).toBe("resolve");
    expect(getNextRoundPhase("resolve")).toBe("resolve");
  });

  it("keeps resolve gated until the choose phase has been reached", () => {
    expect(isRoundPhaseReachable("read", "read")).toBe(true);
    expect(isRoundPhaseReachable("choose", "read")).toBe(true);
    expect(isRoundPhaseReachable("resolve", "read")).toBe(false);
    expect(isRoundPhaseReachable("resolve", "choose")).toBe(true);
  });

  it("tracks incomplete selections without blocking review", () => {
    expect(getRoundResolveLabel()).toBe("End quarter");
    expect(
      validateRoundSelection({
        resources: initialConsumableResources,
        selectedCost: {},
        selectedDecisionCount: 0,
      }),
    ).toEqual({
      valid: true,
      statusLabel: "2 choices pending",
      guidance: "2 more choices required before the quarter can resolve.",
    });
  });

  it("rejects overloaded or unaffordable dockets before resolution", () => {
    expect(
      validateRoundSelection({
        resources: initialConsumableResources,
        selectedCost: {},
        selectedDecisionCount: 3,
      }).valid,
    ).toBe(false);

    expect(
      validateRoundSelection({
        resources: {
          inGameMoney: 0,
          personalAssets: 0,
          publicRelationsCapital: 0,
        },
        selectedCost: {
          inGameMoney: 1,
        },
        selectedDecisionCount: 1,
      }),
    ).toMatchObject({
      valid: false,
      statusLabel: "Reserve shortfall",
    });
  });
});
