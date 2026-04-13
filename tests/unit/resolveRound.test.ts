import { describe, expect, it } from "vitest";
import { loadContent } from "../../src/simulation/content";
import { getAutomaticEndingId } from "../../src/simulation/systems/endingRules";
import {
  createInitialRunState,
  resolveRound,
} from "../../src/simulation/resolution/resolveRound";
import { getAvailableDecisions } from "../../src/simulation/systems/decisionEngine";
import { applyImpactSet } from "../../src/simulation/systems/metricEffects";
import { meetsRequirements } from "../../src/simulation/systems/requirements";

describe("resolveRound", () => {
  it("offers a curated decision tray for a fresh run", () => {
    const run = createInitialRunState();
    const decisions = getAvailableDecisions(loadContent().decisions, run);
    const groups = new Map<string, number>();
    const packs = new Set(
      decisions
        .filter((decision) => decision.group !== "exit")
        .map((decision) => decision.pack),
    );

    for (const decision of decisions.filter(
      (entry) => entry.group !== "exit",
    )) {
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
      decisions.some((decision) =>
        decision.requirements?.flagsAll?.includes("shellCarrierLive"),
      ),
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
    expect([
      "whistleblower_letter",
      "faa_exit_interviews",
      "severance_injunction",
    ]).toContain(next.pendingEvents[0]?.eventId);
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

  it("uses the shared requirement evaluator for both decisions and events", () => {
    const run = createInitialRunState();
    run.round = 6;
    run.flags = ["shellCarrierLive"];

    expect(
      meetsRequirements(
        {
          roundAtLeast: 5,
          roundAtMost: 8,
          metricMin: { legalHeat: 20 },
          metricMax: { marketConfidence: 60 },
          flagsAll: ["shellCarrierLive"],
          flagsNone: ["blocked"],
        },
        run,
      ),
    ).toBe(true);
  });

  it("clamps metric effects through the shared impact helper", () => {
    const run = createInitialRunState();
    const nextMetrics = applyImpactSet(run.metrics, {
      airlineCash: 1_000,
      personalWealth: -20,
      debt: -999,
      assetValue: 999,
      workforceSize: 9_999,
      workforceMorale: 99,
      marketConfidence: 99,
      creditorPatience: 99,
      legalHeat: 99,
      safetyIntegrity: 99,
      publicAnger: 99,
      stockPrice: 99,
      offshoreReadiness: 99,
    });

    expect(nextMetrics.airlineCash).toBe(900);
    expect(nextMetrics.personalWealth).toBe(0);
    expect(nextMetrics.debt).toBe(0);
    expect(nextMetrics.assetValue).toBe(1500);
    expect(nextMetrics.workforceSize).toBe(12000);
    expect(nextMetrics.stockPrice).toBe(117);
  });

  it("detects automatic endings from the shared ending rules", () => {
    const prisonRun = createInitialRunState();
    prisonRun.metrics.legalHeat = 95;

    const forcedRun = createInitialRunState();
    forcedRun.metrics.airlineCash = -140;

    expect(getAutomaticEndingId(prisonRun.metrics)).toBe("prison");
    expect(getAutomaticEndingId(forcedRun.metrics)).toBe("forcedRemoval");
  });

  it("supports all authored exit endings", () => {
    const mergerRun = createInitialRunState();
    mergerRun.round = 6;
    mergerRun.flags = ["mergerOffer"];
    mergerRun.selectedDecisionIds = ["accept_merger_offer"];

    const extractionRun = createInitialRunState();
    extractionRun.round = 7;
    extractionRun.metrics.marketConfidence = 72;
    extractionRun.metrics.stockPrice = 32;
    extractionRun.metrics.personalWealth = 48;
    extractionRun.metrics.legalHeat = 48;
    extractionRun.selectedDecisionIds = ["cash_out_and_resign"];

    const bahamasRun = createInitialRunState();
    bahamasRun.round = 6;
    bahamasRun.metrics.offshoreReadiness = 72;
    bahamasRun.metrics.personalWealth = 64;
    bahamasRun.selectedDecisionIds = ["run_for_nassau"];

    expect(resolveRound(mergerRun).endingId).toBe("merger");
    expect(resolveRound(extractionRun).endingId).toBe("extraction");
    expect(resolveRound(bahamasRun).endingId).toBe("bahamas");
  });
});
