import { describe, expect, it } from "vitest";
import {
  formatCampaignReport,
  simulateCampaignReport,
} from "../../scripts/simulate-runs";

describe("simulateCampaignReport", () => {
  it("produces a deterministic seeded summary", () => {
    const first = simulateCampaignReport({
      runs: 12,
      maxRounds: 10,
      seed: "unit-test-seed",
    });

    const second = simulateCampaignReport({
      runs: 12,
      maxRounds: 10,
      seed: "unit-test-seed",
    });

    expect(first).toEqual(second);
    expect(first.runs).toBe(12);
    expect(first.averageRunLength).toBeGreaterThan(0);
    expect(first.surfacedDecisionCoverage.total).toBeGreaterThan(0);
    expect(first.triggeredEventCoverage.total).toBeGreaterThan(0);
    expect(first.repeatedTrayPressure.percentage).toBeGreaterThanOrEqual(0);
    expect(first.repeatedTrayPressure.percentage).toBeLessThanOrEqual(1);
    expect(
      Object.values(first.endingCounts).reduce((sum, count) => sum + count, 0),
    ).toBe(12);
  });

  it("formats a concise report", () => {
    const report = simulateCampaignReport({
      runs: 4,
      maxRounds: 6,
      seed: "format-check",
    });

    const output = formatCampaignReport(report);

    expect(output).toContain("Seeded campaign report");
    expect(output).toContain("Ending distribution:");
    expect(output).toContain("Surfaced decision coverage:");
    expect(output).toContain("Triggered event coverage:");
    expect(output).toContain("Repeated-tray pressure:");
  });
});
