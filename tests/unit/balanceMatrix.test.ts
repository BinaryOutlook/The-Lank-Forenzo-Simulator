import { describe, expect, it } from "vitest";
import {
  buildBalanceMatrixReport,
  formatBalanceMatrixReport,
} from "../../scripts/balance-matrix";
import {
  archetypePolicies,
  chooseArchetypeDecisions,
  getArchetypePolicy,
} from "../../scripts/simulation-reporting";
import { loadContent } from "../../src/simulation/content/index.js";
import { createInitialRunState } from "../../src/simulation/resolution/resolveRound.js";
import type { DecisionDefinition } from "../../src/simulation/state/types.js";

function getDecision(id: string): DecisionDefinition {
  const decision = loadContent().decisions.find((entry) => entry.id === id);

  if (!decision) {
    throw new Error(`Expected decision "${id}" to exist.`);
  }

  return decision;
}

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
      "safety-denial",
      "shadow-subsidiary",
      "creditor-trench",
      "regulatory-theatre",
    ]);
    expect(first.aggregate.runs).toBe(24);
    expect(first.aggregate.surfacedDecisionCoverage.total).toBeGreaterThan(0);
    expect(first.aggregate.selectedDecisionCoverage.seen).toBeGreaterThan(0);
    expect(first.aggregate.triggeredEventCoverage.total).toBeGreaterThan(0);
    expect(
      first.aggregate.repeatedTrayPressure.percentage,
    ).toBeGreaterThanOrEqual(0);
    expect(first.aggregate.repeatedTrayPressure.percentage).toBeLessThanOrEqual(
      1,
    );
  });

  it("reaches multiple successful exits in the default balance matrix", () => {
    const report = buildBalanceMatrixReport({
      runs: 5,
      maxRounds: 24,
      seed: "v0.5-matrix",
    });
    const successfulEndings = ["bahamas", "extraction", "merger"].filter(
      (endingId) => (report.aggregate.endingCounts[endingId] ?? 0) > 0,
    );

    expect(successfulEndings.length).toBeGreaterThanOrEqual(2);
    expect(report.aggregate.endingCounts.extraction).toBeGreaterThan(0);
    expect(
      (report.aggregate.endingCounts.bahamas ?? 0) +
        (report.aggregate.endingCounts.merger ?? 0),
    ).toBeGreaterThan(0);
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

    expect(output).toContain("V0.6 archetype balance matrix");
    expect(output).toContain("Content hash:");
    expect(output).toContain("Aggregate:");
    expect(output).toContain("Extraction bot");
    expect(output).toContain("Low-reachability packs:");
    expect(output).toContain("Surfaced decision IDs:");
    expect(output).toContain("Selected decision IDs:");
  });

  it("prefers safety-denial lane cards when they are available", () => {
    const chosen = chooseArchetypeDecisions(
      [
        getDecision("collapse_the_qc_layers"),
        getDecision("safety_spending_surge"),
      ],
      createInitialRunState(),
      getArchetypePolicy("safety-denial"),
      0,
      0,
    );

    expect(chosen).toContain("collapse_the_qc_layers");
    expect(chosen).not.toContain("safety_spending_surge");
  });

  it("prefers shadow-subsidiary setup cards when they are available", () => {
    const chosen = chooseArchetypeDecisions(
      [
        getDecision("launch_a_leisure_shell"),
        getDecision("safety_spending_surge"),
      ],
      createInitialRunState(),
      getArchetypePolicy("shadow-subsidiary"),
      0,
      0,
    );

    expect(chosen).toContain("launch_a_leisure_shell");
  });

  it("uses the new archetypes to select low-reachability lane packs", () => {
    const safetyDecisionIds = new Set(
      loadContent()
        .decisions.filter((decision) => decision.pack === "safetyDenial")
        .map((decision) => decision.id),
    );
    const shellDecisionIds = new Set(
      loadContent()
        .decisions.filter((decision) => decision.pack === "shadowSubsidiaries")
        .map((decision) => decision.id),
    );
    const report = buildBalanceMatrixReport({
      runs: 3,
      maxRounds: 8,
      seed: "matrix-lane-seed",
      archetypes: [
        getArchetypePolicy("safety-denial"),
        getArchetypePolicy("shadow-subsidiary"),
      ],
    });

    const safetyRow = report.archetypes.find(
      (row) => row.archetypeId === "safety-denial",
    );
    const shellRow = report.archetypes.find(
      (row) => row.archetypeId === "shadow-subsidiary",
    );

    expect(safetyRow?.packCoverage.safetyDenial.seen).toBeGreaterThan(0);
    expect(shellRow?.packCoverage.shadowSubsidiaries.seen).toBeGreaterThan(0);
    expect(
      safetyRow?.selectedDecisionIds.some((decisionId) =>
        safetyDecisionIds.has(decisionId),
      ),
    ).toBe(true);
    expect(
      shellRow?.selectedDecisionIds.some((decisionId) =>
        shellDecisionIds.has(decisionId),
      ),
    ).toBe(true);
  });
});
