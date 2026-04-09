import { describe, expect, it } from "vitest";
import { loadContent } from "../../src/simulation/content";
import { createInitialRunState, resolveRound } from "../../src/simulation/resolution/resolveRound";
import { getAvailableDecisions } from "../../src/simulation/systems/decisionEngine";

describe("resolveRound", () => {
  it("offers a curated decision tray for a fresh run", () => {
    const run = createInitialRunState();
    const decisions = getAvailableDecisions(loadContent().decisions, run);
    const groups = new Map<string, number>();
    const packs = new Set(decisions.filter((decision) => decision.group !== "exit").map((decision) => decision.pack));

    for (const decision of decisions.filter((entry) => entry.group !== "exit")) {
      groups.set(decision.group, (groups.get(decision.group) ?? 0) + 1);
    }

    expect(decisions.length).toBeGreaterThanOrEqual(5);
    expect(packs.size).toBeGreaterThanOrEqual(3);
    expect([...groups.values()].every((count) => count <= 2)).toBe(true);
  });

  it("suppresses immediate tray repeats when the pool is large enough", () => {
    const content = loadContent();
    const run = createInitialRunState();
    const firstTrayIds = getAvailableDecisions(content.decisions, run)
      .filter((decision) => decision.group !== "exit")
      .map((decision) => decision.id);

    run.selectedDecisionIds = [firstTrayIds[0]];
    const next = resolveRound(run);
    const secondTrayIds = getAvailableDecisions(content.decisions, next)
      .filter((decision) => decision.group !== "exit")
      .map((decision) => decision.id);

    expect(firstTrayIds.length).toBeGreaterThan(0);
    expect(secondTrayIds.length).toBeGreaterThan(0);
    expect(firstTrayIds.some((id) => secondTrayIds.includes(id))).toBe(false);
  });

  it("surfaces flagged follow-up decisions once their playbook is live", () => {
    const run = createInitialRunState();
    run.round = 4;
    run.flags = ["shellCarrierLive"];

    const decisions = getAvailableDecisions(loadContent().decisions, run);

    expect(
      decisions.some((decision) => decision.requirements?.flagsAll?.includes("shellCarrierLive")),
    ).toBe(true);
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
