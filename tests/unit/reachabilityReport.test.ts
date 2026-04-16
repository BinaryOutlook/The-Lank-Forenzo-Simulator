import { describe, expect, it } from "vitest";
import { createInitialRunState } from "../../src/simulation/resolution/resolveRound";
import {
  abstractRunState,
  abstractRunStateKey,
  exploreReachabilityReport,
  formatReachabilityReport,
  scoreNovelty,
  type NoveltyContext,
} from "../../scripts/reachability-report";

describe("reachability report helpers", () => {
  it("abstracts run state into stable buckets instead of exact metric values", () => {
    const baseRun = createInitialRunState();
    const nearbyRun = {
      ...baseRun,
      metrics: {
        ...baseRun.metrics,
        airlineCash: baseRun.metrics.airlineCash + 8,
        legalHeat: baseRun.metrics.legalHeat + 2,
      },
    };

    expect(abstractRunState(baseRun).roundBucket).toBe("early");
    expect(abstractRunStateKey(baseRun)).toBe(abstractRunStateKey(nearbyRun));
  });

  it("scores unseen states, ids, flags, packs, and endings as novel", () => {
    const context: NoveltyContext = {
      knownStateKeys: new Set(["known"]),
      surfacedDecisionIds: new Set(["seen_surface"]),
      selectedDecisionIds: new Set(["seen_selected"]),
      triggeredEventIds: new Set(["seen_event"]),
      endingIds: new Set(["prison"]),
      packIds: new Set(["core"]),
      flagIds: new Set(["flag_seen"]),
    };

    const score = scoreNovelty(context, {
      stateKey: "new-state",
      surfacedDecisionIds: ["seen_surface", "new_surface"],
      selectedDecisionIds: ["seen_selected", "new_selected"],
      triggeredEventIds: ["seen_event", "new_event"],
      endingId: "extraction",
      packIds: ["core", "mergerBait"],
      flagIds: ["flag_seen", "flag_new"],
    });

    expect(score).toBe(68);
  });
});

describe("exploreReachabilityReport", () => {
  it("explores deterministically and reports coverage", () => {
    const options = {
      width: 6,
      depth: 4,
      seed: "reachability-unit-seed",
    };

    const first = exploreReachabilityReport(options);
    const second = exploreReachabilityReport(options);

    expect(first).toEqual(second);
    expect(first.contentHash).toMatch(/^[0-9a-f]+$/);
    expect(first.exploredStates).toBeGreaterThan(0);
    expect(first.surfacedDecisionCoverage.total).toBeGreaterThan(0);
    expect(first.selectedDecisionCoverage.seen).toBeGreaterThan(0);
    expect(first.triggeredEventCoverage.total).toBeGreaterThan(0);
    expect(first.repeatedTrayPressure.percentage).toBeGreaterThanOrEqual(0);
    expect(first.repeatedTrayPressure.percentage).toBeLessThanOrEqual(1);
  });

  it("formats a concise console report", () => {
    const report = exploreReachabilityReport({
      width: 4,
      depth: 3,
      seed: "reachability-format-seed",
    });

    const output = formatReachabilityReport(report);

    expect(output).toContain("V0.5 reachability explorer");
    expect(output).toContain("Content hash:");
    expect(output).toContain("Surfaced decisions:");
    expect(output).toContain("Low-confidence decision ids:");
    expect(output).toContain("Top frontier abstractions:");
  });
});
