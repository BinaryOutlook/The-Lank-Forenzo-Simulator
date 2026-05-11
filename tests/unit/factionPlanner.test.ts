import { describe, expect, it } from "vitest";
import {
  createInitialFactionStates,
  type FactionIntent,
} from "../../src/simulation/factions/factionState";
import {
  planFactionIntents,
  rememberFactionIntents,
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
    expect(factions.labor.currentIntent).toBeNull();
    expect(factions.labor.intentMemory).toEqual({
      cooldowns: {},
      familyCounts: {},
      lastFamily: null,
      lastRound: null,
      consecutiveCount: 0,
    });
    expect(factions.labor.behaviorMemory).toEqual({});
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

    const intents = planFactionIntents(first, {
      metrics: run.metrics,
      round: 5,
    });

    expect(intents).toContainEqual(
      expect.objectContaining({
        factionId: "labor",
        family: "organize",
        score: expect.objectContaining({
          urgency: expect.any(Number),
          leverage: expect.any(Number),
          evidence: expect.any(Number),
          cooldown: expect.any(Number),
        }),
      }),
    );
  });

  it("prefers explicit faction metadata while preserving ID fallback", () => {
    const run = createInitialRunState();
    const explicit = updateFactionStates(createInitialFactionStates(), {
      metrics: run.metrics,
      selectedDecisionIds: ["creditor_metadata_override"],
      emittedEventIds: [],
      factionEffectSources: [
        {
          sourceId: "creditor_metadata_override",
          effects: {
            creditors: {
              patience: -5,
              aggression: 8,
              leverage: 3,
              grievance: "authored lender response",
            },
          },
        },
      ],
    });
    const fallback = updateFactionStates(createInitialFactionStates(), {
      metrics: run.metrics,
      selectedDecisionIds: ["creditor_unannotated_signal"],
      emittedEventIds: [],
    });

    expect(explicit.creditors.patience).toBe(51);
    expect(explicit.creditors.aggression).toBe(40);
    expect(explicit.creditors.leverage).toBe(61);
    expect(explicit.creditors.recentGrievances).toEqual([
      "creditor_metadata_override: authored lender response",
    ]);
    expect(fallback.creditors.patience).toBe(53);
    expect(fallback.creditors.aggression).toBe(36);
    expect(fallback.creditors.leverage).toBe(60);
    expect(fallback.creditors.recentGrievances).toEqual([
      "creditor_unannotated_signal",
    ]);
  });

  it("escalates repeated labor abuse from organizing into defection", () => {
    const run = createInitialRunState();
    const laborAbuseInput = {
      metrics: {
        ...run.metrics,
        workforceMorale: 31,
        publicAnger: 60,
      },
      selectedDecisionIds: [
        "weaponize_the_scope_clause",
        "freeze_the_promise_book",
      ],
      emittedEventIds: ["scope_clause_arbitration"],
      evidenceHints: { labor_abuse: 12 },
    };
    const firstUpdate = updateFactionStates(
      createInitialFactionStates(),
      laborAbuseInput,
    );
    const firstLaborIntent = planFactionIntents(firstUpdate, {
      metrics: laborAbuseInput.metrics,
      round: 2,
    }).find((intent) => intent.factionId === "labor");
    const remembered = rememberFactionIntents(firstUpdate, {
      intents: firstLaborIntent ? [firstLaborIntent] : [],
      round: 2,
    });
    const secondUpdate = updateFactionStates(remembered, laborAbuseInput);
    const secondLaborIntent = planFactionIntents(secondUpdate, {
      metrics: laborAbuseInput.metrics,
      round: 3,
    }).find((intent) => intent.factionId === "labor");

    expect(firstLaborIntent?.family).toBe("organize");
    expect(remembered.labor.currentIntent?.family).toBe("organize");
    expect(
      secondUpdate.labor.behaviorMemory.labor_abuse,
    ).toBeGreaterThanOrEqual(2);
    expect(secondLaborIntent).toEqual(
      expect.objectContaining({
        factionId: "labor",
        family: "defect",
        rationale: expect.stringContaining("repeated labor abuse"),
      }),
    );
  });

  it("turns repeated safety denial into regulator pressure with explainable scoring", () => {
    const run = createInitialRunState();
    const safetyDenialInput = {
      metrics: {
        ...run.metrics,
        legalHeat: 64,
        safetyIntegrity: 38,
      },
      selectedDecisionIds: [
        "downgrade_the_inspection_memo",
        "vendor_swap_the_heavy_checks",
      ],
      emittedEventIds: ["inspection_memo_leak"],
      evidenceHints: { maintenance_fraud: 18, regulatory_capture: 6 },
    };
    const firstUpdate = updateFactionStates(
      createInitialFactionStates(),
      safetyDenialInput,
    );
    const firstRegulatorIntent = planFactionIntents(firstUpdate, {
      metrics: safetyDenialInput.metrics,
      round: 2,
    }).find((intent) => intent.factionId === "regulators");
    const remembered = rememberFactionIntents(firstUpdate, {
      intents: firstRegulatorIntent ? [firstRegulatorIntent] : [],
      round: 2,
    });
    const secondUpdate = updateFactionStates(remembered, safetyDenialInput);
    const secondRegulatorIntent = planFactionIntents(secondUpdate, {
      metrics: safetyDenialInput.metrics,
      round: 3,
    }).find((intent) => intent.factionId === "regulators");

    expect(firstRegulatorIntent?.family).toBe("investigate");
    expect(
      secondUpdate.regulators.behaviorMemory.safety_denial,
    ).toBeGreaterThanOrEqual(2);
    expect(secondRegulatorIntent).toEqual(
      expect.objectContaining({
        factionId: "regulators",
        family: "pressure",
        score: expect.objectContaining({
          evidence: expect.any(Number),
          cooldown: expect.any(Number),
        }),
        rationale: expect.stringContaining("repeated safety denial"),
      }),
    );
  });

  it("makes offshore behavior provoke press leaks and board replacement threats", () => {
    const run = createInitialRunState();
    const offshoreInput = {
      metrics: {
        ...run.metrics,
        marketConfidence: 62,
        legalHeat: 58,
        offshoreReadiness: 48,
        stockPrice: 31,
      },
      selectedDecisionIds: ["offshore_transfer_network", "run_for_nassau"],
      emittedEventIds: ["customs_broker_ping"],
      evidenceHints: { offshore_evasion: 18, insider_trading: 8 },
    };
    const firstUpdate = updateFactionStates(
      createInitialFactionStates({
        board: { trust: 68, leverage: 66 },
        press: { aggression: 58, leverage: 66 },
      }),
      offshoreInput,
    );
    const remembered = rememberFactionIntents(firstUpdate, {
      intents: planFactionIntents(firstUpdate, {
        metrics: offshoreInput.metrics,
        round: 2,
      }),
      round: 2,
    });
    const secondUpdate = updateFactionStates(remembered, offshoreInput);
    const intents = planFactionIntents(secondUpdate, {
      metrics: offshoreInput.metrics,
      round: 3,
    });
    const familyByFaction = new Map(
      intents.map((intent) => [intent.factionId, intent.family]),
    );

    expect(
      secondUpdate.press.behaviorMemory.offshore_behavior,
    ).toBeGreaterThanOrEqual(2);
    expect(familyByFaction.get("press")).toBe("leak");
    expect(familyByFaction.get("board")).toBe("replace");
  });

  it("suppresses repeated board shields while keeping the intent deterministic", () => {
    const run = createInitialRunState();
    const factions = createInitialFactionStates({
      board: {
        trust: 80,
        leverage: 70,
        intentMemory: {
          cooldowns: { shield: 5 },
          familyCounts: { shield: 1 },
          lastFamily: "shield",
          lastRound: 3,
          consecutiveCount: 1,
        },
      },
    });
    const intents = planFactionIntents(factions, {
      metrics: {
        ...run.metrics,
        marketConfidence: 62,
        legalHeat: 40,
        stockPrice: 30,
      },
      round: 4,
    });

    expect(intents.some((intent) => intent.family === "shield")).toBe(false);
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
