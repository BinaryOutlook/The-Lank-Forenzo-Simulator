import { describe, expect, it } from "vitest";
import {
  buildBalanceMatrixReport,
  formatBalanceMatrixReport,
} from "../../scripts/balance-matrix";
import { archetypePolicies } from "../../scripts/simulation-reporting";

describe("buildBalanceMatrixReport", () => {
  it("runs a deterministic archetype-aware matrix", () => {
    const options = {
      runs: 3,
      maxRounds: 5,
      seed: "matrix-unit-seed",
      archetypes: archetypePolicies,
    };

    const first = buildBalanceMatrixReport(options);
    const second = buildBalanceMatrixReport(options);

    expect(first).toEqual(second);
    expect(first.contentHash).toMatch(/^[0-9a-f]+$/);
    expect(first.archetypes.map((row) => row.archetypeId)).toEqual([
      "extraction",
      "merger",
      "offshore",
      "stabilizer",
    ]);
    expect(first.aggregate.runs).toBe(12);
    expect(first.aggregate.surfacedDecisionCoverage.total).toBeGreaterThan(0);
    expect(first.aggregate.selectedDecisionCoverage.seen).toBeGreaterThan(0);
    expect(first.aggregate.triggeredEventCoverage.total).toBeGreaterThan(0);
    expect(first.aggregate.repeatedTrayPressure.percentage).toBeGreaterThanOrEqual(0);
    expect(first.aggregate.repeatedTrayPressure.percentage).toBeLessThanOrEqual(1);
  });

  it("keeps the repaired low-reachability packs visible in scripted runs", () => {
    const report = buildBalanceMatrixReport({
      runs: 8,
      maxRounds: 8,
      seed: "issue-20-pack-matrix",
      archetypes: archetypePolicies,
    });

    expect(report.aggregate.packCoverage.safetyDenial.seen).toBeGreaterThanOrEqual(
      2,
    );
    expect(
      report.aggregate.packCoverage.shadowSubsidiaries.seen,
    ).toBeGreaterThanOrEqual(2);
    expect(report.aggregate.lowReachabilityPacks).not.toContain("safetyDenial");
    expect(report.aggregate.lowReachabilityPacks).not.toContain(
      "shadowSubsidiaries",
    );
  });

  it("formats a concise console report", () => {
    const report = buildBalanceMatrixReport({
      runs: 1,
      maxRounds: 3,
      seed: "matrix-format-seed",
      archetypes: archetypePolicies.slice(0, 1),
    });

    const output = formatBalanceMatrixReport(report);

    expect(output).toContain("V0.5 archetype balance matrix");
    expect(output).toContain("Content hash:");
    expect(output).toContain("Aggregate:");
    expect(output).toContain("Extraction bot");
    expect(output).toContain("Low-reachability packs:");
  });
});
