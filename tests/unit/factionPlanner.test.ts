import { describe, expect, it } from "vitest";
import {
  createInitialFactionStates,
  type FactionIntent,
} from "../../src/simulation/factions/factionState";
import {
  planFactionIntents,
  updateFactionStates,
} from "../../src/simulation/factions/factionPlanner";
import { createInitialRunState } from "../../src/simulation/resolution/resolveRound";

describe("faction planner primitives", () => {
  it("creates all required factions with stable default state", () => {
    const factions = createInitialFactionStates();

    expect(Object.keys(factions)).toEqual([
      "board",
      "creditors",
      "labor",
      "regulators",
      "press",
    ]);
    expect(factions.board.trust).toBe(58);
    expect(factions.labor.recentGrievances).toEqual([]);
  });

  it("deterministically stores labor grievances and selects organize", () => {
    const run = createInitialRunState();
    const first = updateFactionStates(createInitialFactionStates(), {
      metrics: {
        ...run.metrics,
        workforceMorale: 34,
        publicAnger: 55,
      },
      selectedDecisionIds: [
        "weaponize_the_scope_clause",
        "freeze_the_promise_book",
      ],
      emittedEventIds: ["scope_clause_arbitration"],
      evidenceHints: { labor_abuse: 12 },
    });
    const second = updateFactionStates(createInitialFactionStates(), {
      metrics: {
        ...run.metrics,
        workforceMorale: 34,
        publicAnger: 55,
      },
      selectedDecisionIds: [
        "weaponize_the_scope_clause",
        "freeze_the_promise_book",
      ],
      emittedEventIds: ["scope_clause_arbitration"],
      evidenceHints: { labor_abuse: 12 },
    });

    expect(first).toEqual(second);
    expect(first.labor.recentGrievances).toEqual([
      "weaponize_the_scope_clause",
      "freeze_the_promise_book",
      "scope_clause_arbitration",
    ]);
    expect(first.labor.aggression).toBeGreaterThan(45);

    const intents = planFactionIntents(first, { metrics: run.metrics, round: 5 });

    expect(intents).toContainEqual(
      expect.objectContaining({
        factionId: "labor",
        family: "organize",
      }),
    );
  });

  it("selects pressure, leak, investigate, organize, and shield families when state supports them", () => {
    const run = createInitialRunState();
    const factions = createInitialFactionStates({
      board: { trust: 80, patience: 70, aggression: 14, leverage: 66 },
      creditors: { patience: 18, aggression: 72, leverage: 74 },
      labor: { patience: 20, aggression: 70, cohesion: 78 },
      regulators: { aggression: 62, dossierWeight: 58, leverage: 63 },
      press: { aggression: 64, leverage: 76, dossierWeight: 40 },
    });

    const intents = planFactionIntents(factions, {
      metrics: {
        ...run.metrics,
        legalHeat: 64,
        marketConfidence: 68,
        publicAnger: 62,
        creditorPatience: 22,
      },
      round: 8,
    });
    const familiesByFaction = new Map(
      intents.map((intent: FactionIntent) => [intent.factionId, intent.family]),
    );

    expect(familiesByFaction.get("board")).toBe("shield");
    expect(familiesByFaction.get("creditors")).toBe("pressure");
    expect(familiesByFaction.get("labor")).toBe("organize");
    expect(familiesByFaction.get("regulators")).toBe("investigate");
    expect(familiesByFaction.get("press")).toBe("leak");
  });
});
