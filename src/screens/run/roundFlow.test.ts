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

  it("treats holding the line as a valid deterministic resolution", () => {
    expect(getRoundResolveLabel(0)).toBe("Hold the line");
    expect(
      validateRoundSelection({
        resources: initialConsumableResources,
        selectedCost: {},
        selectedDecisionCount: 0,
      }),
    ).toEqual({
      valid: true,
      statusLabel: "Hold posture ready",
      guidance:
        "No plays are queued. Resolution will pass the quarter without a new executive action.",
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
