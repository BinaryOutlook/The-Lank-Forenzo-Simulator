import { describe, expect, it } from "vitest";
import { loadContent } from "../../src/simulation/content";
import { createInitialRunState, resolveRound } from "../../src/simulation/resolution/resolveRound";
import { getAvailableDecisions } from "../../src/simulation/systems/decisionEngine";

describe("resolveRound", () => {
  it("offers a curated decision tray for a fresh run", () => {
    const run = createInitialRunState();
    const decisions = getAvailableDecisions(loadContent().decisions, run);

    expect(decisions.length).toBeGreaterThanOrEqual(5);
    expect(decisions.some((decision) => decision.group === "operations")).toBe(true);
    expect(decisions.some((decision) => decision.group === "finance" || decision.group === "market")).toBe(true);
  });

  it("applies decision impacts, advances the round, and clears selections", () => {
    const run = createInitialRunState();
    run.selectedDecisionIds = ["headcount_bloodletting"];

    const next = resolveRound(run);

    expect(next.round).toBe(2);
    expect(next.selectedDecisionIds).toEqual([]);
    expect(next.metrics.workforceSize).toBeLessThan(run.metrics.workforceSize);
    expect(next.pendingEvents.length).toBeGreaterThan(0);
    expect(["whistleblower_letter", "faa_exit_interviews", "severance_injunction"]).toContain(next.pendingEvents[0]?.eventId);
    expect(next.history[0]?.title).toBeTruthy();
  });

  it("supports authored exit endings", () => {
    const run = createInitialRunState();
    run.round = 7;
    run.metrics.marketConfidence = 72;
    run.metrics.stockPrice = 32;
    run.metrics.personalWealth = 48;
    run.metrics.legalHeat = 48;
    run.selectedDecisionIds = ["cash_out_and_resign"];

    const next = resolveRound(run);

    expect(next.status).toBe("ended");
    expect(next.endingId).toBe("extraction");
  });
});
