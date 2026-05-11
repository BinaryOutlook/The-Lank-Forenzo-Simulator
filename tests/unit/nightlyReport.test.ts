import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildNightlySimulationReport,
  formatNightlySimulationReport,
  writeNightlySimulationArtifacts,
} from "../../scripts/nightly-report";
import { getArchetypePolicy } from "../../scripts/simulation-reporting";

const unitOptions = {
  runsPerArchetype: 2,
  maxRounds: 6,
  seed: "nightly-unit-seed",
  archetypes: [getArchetypePolicy("extraction"), getArchetypePolicy("merger")],
  generatedAt: "2026-05-11T00:00:00.000Z",
  dominantSequencePrefixLengths: [2],
  dominantSequenceLimit: 5,
  dominantSequenceMinimumCount: 1,
  lowConfidencePackMinimumArchetypes: 1,
};

describe("buildNightlySimulationReport", () => {
  it("builds a deterministic long-run artifact model", () => {
    const first = buildNightlySimulationReport(unitOptions);
    const second = buildNightlySimulationReport(unitOptions);

    expect(first).toEqual(second);
    expect(first.contentHash).toMatch(/^[0-9a-f]+$/);
    expect(first.runProfile.totalRuns).toBe(4);
    expect(first.matrix.aggregate.runs).toBe(4);
    expect(first.lowConfidenceContent.trend.totalRuns).toBe(4);
    expect(first.lowConfidenceContent.decisionsNeverSurfaced.length).toBeGreaterThan(
      0,
    );
    expect(first.lowConfidenceContent.eventsNeverTriggered.length).toBeGreaterThan(
      0,
    );
    expect(first.dominantSequences.length).toBeGreaterThan(0);
    expect(first.dominantSequences[0]?.frequency).toBeGreaterThan(0);
  });

  it("formats artifact interpretation notes for humans", () => {
    const report = buildNightlySimulationReport(unitOptions);
    const output = formatNightlySimulationReport(report);

    expect(output).toContain("Nightly long-run simulation report");
    expect(output).toContain("Low-confidence content");
    expect(output).toContain("Dominant sequence candidates");
    expect(output).toContain("\\text{Dominance}(q)");
    expect(output).toContain("Soft warnings");
  });

  it("writes markdown, JSON, low-confidence, trend, and sequence artifacts", async () => {
    const outputDir = await mkdtemp(join(tmpdir(), "tlfs-nightly-report-"));

    try {
      const report = buildNightlySimulationReport(unitOptions);
      const artifactPaths = await writeNightlySimulationArtifacts(report, outputDir);

      expect(artifactPaths.map((path) => path.split("/").at(-1)).sort()).toEqual([
        "dominant-sequences.json",
        "low-confidence-content.json",
        "low-confidence-trend.json",
        "nightly-report.json",
        "nightly-report.md",
      ]);

      const markdown = await readFile(join(outputDir, "nightly-report.md"), "utf8");
      const trend = await readFile(
        join(outputDir, "low-confidence-trend.json"),
        "utf8",
      );

      expect(markdown).toContain("# Nightly long-run simulation report");
      expect(trend).toContain('"totalRuns": 4');
    } finally {
      await rm(outputDir, { force: true, recursive: true });
    }
  });
});
