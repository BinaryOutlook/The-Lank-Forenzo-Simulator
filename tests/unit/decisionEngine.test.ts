import { describe, expect, it } from "vitest";
import { createInitialRunState } from "../../src/simulation/resolution/resolveRound";
import type {
  DecisionDefinition,
  DecisionGroup,
  DecisionPackId,
  ImpactSet,
  RequirementSpec,
} from "../../src/simulation/state/types";
import {
  TRAY_COMPOSER_POLICY,
  composeDecisionTray,
  getAvailableDecisions,
} from "../../src/simulation/systems/decisionEngine";

function decision(
  id: string,
  group: DecisionGroup,
  pack: DecisionPackId,
  impacts: ImpactSet = {},
  options: {
    requirements?: RequirementSpec;
    setsFlags?: string[];
  } = {},
): DecisionDefinition {
  return {
    id,
    pack,
    title: id,
    summary: `${id} summary`,
    group,
    tags: [],
    impacts,
    requirements: options.requirements,
    setsFlags: options.setsFlags,
  };
}

describe("decision tray composer", () => {
  it("prefers group diversity when the eligible pool allows it", () => {
    const run = createInitialRunState();
    run.metrics.airlineCash = 80;

    const decisions: DecisionDefinition[] = [
      decision("finance-a", "finance", "core", { airlineCash: 30 }),
      decision("finance-b", "finance", "creditorWarfare", {
        airlineCash: 28,
      }),
      decision("finance-c", "finance", "assetHarvest", { airlineCash: 26 }),
      decision("labor-a", "labor", "laborShock", { workforceMorale: 4 }),
      decision("legal-a", "legal", "regulatoryTheater", { legalHeat: -5 }),
      decision("market-a", "market", "marketTheater", {
        marketConfidence: 5,
      }),
      decision("operations-a", "operations", "safetyDenial", {
        safetyIntegrity: 5,
      }),
    ];

    const tray = composeDecisionTray(decisions, run).decisions;
    const groups = new Set(tray.map((entry) => entry.group));

    expect(tray).toHaveLength(TRAY_COMPOSER_POLICY.mainTraySize);
    expect(groups.size).toBeGreaterThanOrEqual(
      TRAY_COMPOSER_POLICY.minDistinctGroups,
    );
  });

  it("surfaces live follow-up decisions even when basic utility is lower", () => {
    const run = createInitialRunState();
    run.flags = ["shellCarrierLive"];
    run.metrics.airlineCash = 70;

    const decisions: DecisionDefinition[] = [
      decision("cash-1", "finance", "core", { airlineCash: 40 }),
      decision("cash-2", "finance", "creditorWarfare", { airlineCash: 38 }),
      decision("cash-3", "finance", "assetHarvest", { airlineCash: 36 }),
      decision("labor-1", "labor", "laborShock", { workforceMorale: 2 }),
      decision("market-1", "market", "marketTheater", {
        marketConfidence: 2,
      }),
      decision(
        "shell-follow-up",
        "legal",
        "shadowSubsidiaries",
        { legalHeat: -1 },
        { requirements: { flagsAll: ["shellCarrierLive"] } },
      ),
    ];

    const tray = getAvailableDecisions(decisions, run);

    expect(tray.map((entry) => entry.id)).toContain("shell-follow-up");
  });

  it("preserves eligible exit cards outside the main tray", () => {
    const run = createInitialRunState();
    run.round = 7;
    run.metrics.airlineCash = 70;

    const decisions: DecisionDefinition[] = [
      decision("cash-1", "finance", "core", { airlineCash: 40 }),
      decision("cash-2", "finance", "creditorWarfare", { airlineCash: 38 }),
      decision("cash-3", "finance", "assetHarvest", { airlineCash: 36 }),
      decision("labor-1", "labor", "laborShock", { workforceMorale: 2 }),
      decision("market-1", "market", "marketTheater", {
        marketConfidence: 2,
      }),
      decision("legal-1", "legal", "regulatoryTheater", { legalHeat: -2 }),
      {
        ...decision("live-exit", "exit", "executiveEscape", {}),
        ending: "extraction",
        requirements: { roundAtLeast: 6 },
      },
    ];

    const tray = getAvailableDecisions(decisions, run);

    expect(tray).toHaveLength(TRAY_COMPOSER_POLICY.mainTraySize + 1);
    expect(tray.at(-1)?.id).toBe("live-exit");
  });

  it("suppresses exact previous-tray repeats when enough alternatives exist", () => {
    const run = createInitialRunState();
    run.metrics.airlineCash = 80;
    run.lastOfferedDecisionIds = [
      "repeat-1",
      "repeat-2",
      "repeat-3",
      "repeat-4",
      "repeat-5",
    ];

    const decisions: DecisionDefinition[] = [
      decision("repeat-1", "finance", "core", { airlineCash: 60 }),
      decision("repeat-2", "finance", "creditorWarfare", { airlineCash: 58 }),
      decision("repeat-3", "finance", "assetHarvest", { airlineCash: 56 }),
      decision("repeat-4", "market", "marketTheater", { airlineCash: 54 }),
      decision("repeat-5", "legal", "regulatoryTheater", { airlineCash: 52 }),
      decision("fresh-1", "labor", "laborShock", { workforceMorale: 2 }),
      decision("fresh-2", "operations", "safetyDenial", { safetyIntegrity: 2 }),
      decision("fresh-3", "extraction", "executiveEscape", {
        personalWealth: 2,
      }),
      decision("fresh-4", "market", "mergerBait", { marketConfidence: 2 }),
      decision("fresh-5", "legal", "shadowSubsidiaries", { legalHeat: -2 }),
    ];

    const tray = composeDecisionTray(decisions, run).decisions;

    expect(tray.map((entry) => entry.id)).toEqual(
      expect.arrayContaining([
        "fresh-1",
        "fresh-2",
        "fresh-3",
        "fresh-4",
        "fresh-5",
      ]),
    );
    expect(
      tray.some((entry) => run.lastOfferedDecisionIds.includes(entry.id)),
    ).toBe(false);
  });

  it("falls back gracefully when the eligible pool is smaller than a full tray", () => {
    const run = createInitialRunState();
    run.lastOfferedDecisionIds = ["only-a"];

    const decisions: DecisionDefinition[] = [
      decision("only-a", "finance", "core", { airlineCash: 10 }),
      decision("only-b", "labor", "laborShock", { workforceMorale: 2 }),
    ];

    const tray = getAvailableDecisions(decisions, run);

    expect(tray.map((entry) => entry.id).sort()).toEqual(["only-a", "only-b"]);
  });

  it("returns deterministic output for fixed state and inputs", () => {
    const run = createInitialRunState();
    run.round = 5;
    run.flags = ["shellCarrierLive"];
    run.lastOfferedDecisionIds = ["cash-2"];

    const decisions: DecisionDefinition[] = [
      decision("cash-1", "finance", "core", { airlineCash: 40 }),
      decision("cash-2", "finance", "creditorWarfare", { airlineCash: 38 }),
      decision("labor-1", "labor", "laborShock", { workforceMorale: 2 }),
      decision("market-1", "market", "marketTheater", {
        marketConfidence: 2,
      }),
      decision("legal-1", "legal", "regulatoryTheater", { legalHeat: -2 }),
      decision("ops-1", "operations", "safetyDenial", { safetyIntegrity: 2 }),
      decision(
        "shell-follow-up",
        "legal",
        "shadowSubsidiaries",
        { legalHeat: -1 },
        { requirements: { flagsAll: ["shellCarrierLive"] } },
      ),
    ];

    const first = getAvailableDecisions(decisions, run).map(
      (entry) => entry.id,
    );
    const second = getAvailableDecisions(decisions, run).map(
      (entry) => entry.id,
    );

    expect(second).toEqual(first);
  });
});
