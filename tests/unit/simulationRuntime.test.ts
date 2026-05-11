import { describe, expect, it } from "vitest";
import {
  createInitialRun,
  getAvailableDecisions,
  getEnding,
  resolveRound,
  simulationRuntime,
  toggleDecision,
  type RunState,
} from "../../src/simulation/index.js";
import { loadContentManifest } from "../../src/simulation/content/index.js";
import { createInitialRunState } from "../../src/simulation/resolution/resolveRound.js";
import { composeDecisionTray } from "../../src/simulation/systems/decisionEngine.js";

function firstAvailableDecisionId(run: RunState): string {
  const [decision] = getAvailableDecisions(run).decisions;

  if (!decision) {
    throw new Error("Expected at least one available decision.");
  }

  return decision.id;
}

describe("simulation runtime facade", () => {
  it("creates the canonical initial run state", () => {
    expect(createInitialRun()).toEqual(createInitialRunState());
    expect(simulationRuntime.createInitialRun()).toEqual(createInitialRun());
  });

  it("returns the composed decision tray with diagnostics", () => {
    const run = createInitialRun();
    const tray = getAvailableDecisions(run);

    expect(tray).toEqual(
      composeDecisionTray(loadContentManifest().decisions, run),
    );
    expect(tray.decisions.length).toBeGreaterThanOrEqual(5);
    expect(tray.diagnostics.distinctPacks).toBeGreaterThanOrEqual(3);
  });

  it("toggles decision selection using the same two-card reserve rules as the store", () => {
    const run = createInitialRun();
    const firstDecisionId = firstAvailableDecisionId(run);
    const selectedRun = toggleDecision(run, firstDecisionId);

    expect(selectedRun.selectedDecisionIds).toEqual([firstDecisionId]);

    const clearedRun = simulationRuntime.toggleDecision(
      selectedRun,
      firstDecisionId,
    );

    expect(clearedRun.selectedDecisionIds).toEqual([]);
  });

  it("keeps the prior selection when resources cannot cover the selected tray", () => {
    const run: RunState = {
      ...createInitialRun(),
      resources: {
        inGameMoney: 0,
        personalAssets: 0,
        publicRelationsCapital: 0,
      },
      selectedDecisionIds: [],
    };

    const next = toggleDecision(run, "hire_the_former_regulator");

    expect(next.selectedDecisionIds).toEqual([]);
    expect(next.resources).toEqual({
      inGameMoney: 0,
      personalAssets: 0,
      publicRelationsCapital: 0,
    });
  });

  it("resolves active rounds and leaves ended runs inert at the public boundary", () => {
    const activeRun = createInitialRun();
    const next = resolveRound({
      ...activeRun,
      selectedDecisionIds: [firstAvailableDecisionId(activeRun)],
    });
    const endedRun: RunState = {
      ...next,
      status: "ended",
      endingId: "extraction",
    };

    expect(next.round).toBe(activeRun.round + 1);
    expect(resolveRound(endedRun)).toBe(endedRun);
    expect(getAvailableDecisions(endedRun).decisions).toEqual([]);
  });

  it("looks up endings from run state", () => {
    const run = createInitialRun();

    expect(getEnding(run)).toBeNull();
    expect(
      getEnding({
        ...run,
        status: "ended",
        endingId: "extraction",
      })?.id,
    ).toBe("extraction");
  });
});
