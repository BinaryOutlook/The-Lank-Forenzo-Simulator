import { pathToFileURL } from "node:url";
import { loadContent } from "../src/simulation/content";
import { getImpactSetScore } from "../src/simulation/state/metricSemantics";
import { hashNumber, hashString } from "../src/lib/random/seeded";
import {
  createInitialRunState,
  resolveRound,
} from "../src/simulation/resolution/resolveRound";
import { getAvailableDecisions } from "../src/simulation/systems/decisionEngine";
import type {
  DecisionDefinition,
  RunState,
} from "../src/simulation/state/types";

const DEFAULT_RUNS = 100;
const DEFAULT_MAX_ROUNDS = 24;
const DEFAULT_SEED = "v0.4-balance";
const BOT_POLICY =
  "Greedy pressure-relief bot: score the tray against current pressure, prefer exit decisions when their ending is plausibly live, and take a second supporting card only if it still scores positive and comes from a different group.";

interface SimulationOptions {
  runs: number;
  maxRounds: number;
  seed: string;
}

interface CoverageStat {
  seen: number;
  total: number;
  percentage: number;
}

interface CampaignReport {
  runs: number;
  maxRounds: number;
  seed: string;
  botPolicy: string;
  endingOrder: string[];
  endingCounts: Record<string, number>;
  averageRunLength: number;
  surfacedDecisionCoverage: CoverageStat;
  triggeredEventCoverage: CoverageStat;
  repeatedTrayPressure: {
    overlapSlots: number;
    totalSlots: number;
    percentage: number;
  };
}

interface RunSummary {
  endingId: string;
  roundsPlayed: number;
  surfacedDecisionIds: Set<string>;
  triggeredEventIds: Set<string>;
  repeatedTrayOverlap: number;
  repeatedTraySlots: number;
}

export function simulateCampaignReport(
  options: SimulationOptions,
): CampaignReport {
  const content = loadContent();
  const seedValue = hashString(options.seed);
  const endingOrder = ["active", ...content.endings.map((ending) => ending.id)];
  const endingCounts = Object.fromEntries(
    endingOrder.map((endingId) => [endingId, 0]),
  ) as Record<string, number>;
  const surfacedDecisionIds = new Set<string>();
  const triggeredEventIds = new Set<string>();
  let totalRounds = 0;
  let totalRepeatedTrayOverlap = 0;
  let totalRepeatedTraySlots = 0;

  for (let runIndex = 0; runIndex < options.runs; runIndex += 1) {
    const summary = simulateSingleRun(
      content.decisions,
      seedValue,
      runIndex,
      options.maxRounds,
    );
    endingCounts[summary.endingId] = (endingCounts[summary.endingId] ?? 0) + 1;
    totalRounds += summary.roundsPlayed;
    totalRepeatedTrayOverlap += summary.repeatedTrayOverlap;
    totalRepeatedTraySlots += summary.repeatedTraySlots;

    for (const decisionId of summary.surfacedDecisionIds) {
      surfacedDecisionIds.add(decisionId);
    }

    for (const eventId of summary.triggeredEventIds) {
      triggeredEventIds.add(eventId);
    }
  }

  return {
    runs: options.runs,
    maxRounds: options.maxRounds,
    seed: options.seed,
    botPolicy: BOT_POLICY,
    endingOrder,
    endingCounts,
    averageRunLength: options.runs === 0 ? 0 : totalRounds / options.runs,
    surfacedDecisionCoverage: buildCoverageStat(
      surfacedDecisionIds.size,
      content.decisions.length,
    ),
    triggeredEventCoverage: buildCoverageStat(
      triggeredEventIds.size,
      content.events.length,
    ),
    repeatedTrayPressure: {
      overlapSlots: totalRepeatedTrayOverlap,
      totalSlots: totalRepeatedTraySlots,
      percentage:
        totalRepeatedTraySlots === 0
          ? 0
          : totalRepeatedTrayOverlap / totalRepeatedTraySlots,
    },
  };
}

export function formatCampaignReport(report: CampaignReport): string {
  const lines = [
    "Seeded campaign report",
    `Runs: ${report.runs} | Max rounds/run: ${report.maxRounds} | Seed: ${report.seed}`,
    `Bot policy: ${report.botPolicy}`,
    "",
    "Ending distribution:",
  ];

  for (const endingId of report.endingOrder) {
    const count = report.endingCounts[endingId] ?? 0;
    lines.push(
      `- ${endingId}: ${count} (${formatPercentage(count / Math.max(1, report.runs))})`,
    );
  }

  lines.push(
    "",
    `Average run length: ${report.averageRunLength.toFixed(1)} rounds`,
    `Surfaced decision coverage: ${report.surfacedDecisionCoverage.seen}/${report.surfacedDecisionCoverage.total} (${formatPercentage(report.surfacedDecisionCoverage.percentage)})`,
    `Triggered event coverage: ${report.triggeredEventCoverage.seen}/${report.triggeredEventCoverage.total} (${formatPercentage(report.triggeredEventCoverage.percentage)})`,
    `Repeated-tray pressure: ${report.repeatedTrayPressure.overlapSlots}/${report.repeatedTrayPressure.totalSlots} main-tray slots repeated (${formatPercentage(report.repeatedTrayPressure.percentage)})`,
  );

  return lines.join("\n");
}

function simulateSingleRun(
  decisions: DecisionDefinition[],
  seedValue: number,
  runIndex: number,
  maxRounds: number,
): RunSummary {
  let run: RunState = createInitialRunState();
  const surfacedDecisionIds = new Set<string>();
  let repeatedTrayOverlap = 0;
  let repeatedTraySlots = 0;
  let previousMainTrayIds = new Set<string>();
  let roundsPlayed = 0;

  while (run.status === "active" && roundsPlayed < maxRounds) {
    const tray = getAvailableDecisions(decisions, run);
    const mainTray = tray.filter((decision) => decision.group !== "exit");
    const mainTrayIds = new Set(mainTray.map((decision) => decision.id));

    for (const decision of tray) {
      surfacedDecisionIds.add(decision.id);
    }

    for (const decision of mainTray) {
      if (previousMainTrayIds.has(decision.id)) {
        repeatedTrayOverlap += 1;
      }
    }

    repeatedTraySlots += mainTray.length;
    previousMainTrayIds = mainTrayIds;

    const selectedDecisionIds = chooseBotDecisions(
      tray,
      run,
      seedValue,
      runIndex,
    );
    run = resolveRound({
      ...run,
      selectedDecisionIds,
    });
    roundsPlayed += 1;
  }

  const triggeredEventIds = new Set(
    Object.entries(run.eventCounts)
      .filter(([, count]) => count > 0)
      .map(([eventId]) => eventId),
  );

  return {
    endingId: run.endingId ?? "active",
    roundsPlayed,
    surfacedDecisionIds,
    triggeredEventIds,
    repeatedTrayOverlap,
    repeatedTraySlots,
  };
}

function chooseBotDecisions(
  tray: DecisionDefinition[],
  run: RunState,
  seedValue: number,
  runIndex: number,
): string[] {
  const scored = tray
    .map((decision) => ({
      decision,
      score: scoreDecision(decision, run, seedValue, runIndex),
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.decision.id.localeCompare(right.decision.id);
    });

  if (scored.length === 0) {
    return [];
  }

  const chosen: DecisionDefinition[] = [scored[0].decision];
  const primary = scored[0];

  for (const entry of scored.slice(1)) {
    if (chosen.length >= 2) {
      break;
    }

    const differentGroup = entry.decision.group !== primary.decision.group;
    const worthwhileFollowUp =
      entry.score >= 8 || Boolean(entry.decision.ending);

    if (differentGroup && worthwhileFollowUp) {
      chosen.push(entry.decision);
      break;
    }
  }

  return chosen.map((decision) => decision.id);
}

function scoreDecision(
  decision: DecisionDefinition,
  run: RunState,
  seedValue: number,
  runIndex: number,
): number {
  const score = getImpactSetScore(decision.impacts) * 10;
  const { metrics } = run;
  const impacts = decision.impacts;
  let bonus = 0;

  if (metrics.airlineCash < 200 && (impacts.airlineCash ?? 0) > 0) {
    bonus += 14;
  }

  if (metrics.debt > 600 && (impacts.debt ?? 0) < 0) {
    bonus += 12;
  }

  if (metrics.marketConfidence < 50 && (impacts.marketConfidence ?? 0) > 0) {
    bonus += 10;
  }

  if (metrics.creditorPatience < 45 && (impacts.creditorPatience ?? 0) > 0) {
    bonus += 12;
  }

  if (metrics.workforceMorale < 50 && (impacts.workforceMorale ?? 0) > 0) {
    bonus += 8;
  }

  if (metrics.legalHeat > 55 && (impacts.legalHeat ?? 0) < 0) {
    bonus += 16;
  }

  if (metrics.publicAnger > 50 && (impacts.publicAnger ?? 0) < 0) {
    bonus += 14;
  }

  if (metrics.offshoreReadiness < 45 && (impacts.offshoreReadiness ?? 0) > 0) {
    bonus += 8;
  }

  if (decision.group === "exit") {
    bonus += 40;
  }

  if (decision.ending) {
    bonus += 24;
  }

  if (decision.group === "finance" && metrics.debt > 650) {
    bonus += 4;
  }

  if (decision.group === "legal" && metrics.legalHeat > 35) {
    bonus += 4;
  }

  if (decision.group === "extraction" && metrics.personalWealth < 60) {
    bonus += 6;
  }

  const jitter =
    hashNumber(seedValue, runIndex, run.round, hashString(decision.id)) % 997;

  return score + bonus + jitter / 1000;
}

function buildCoverageStat(seen: number, total: number): CoverageStat {
  return {
    seen,
    total,
    percentage: total === 0 ? 0 : seen / total,
  };
}

function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function parseArgs(argv: string[]): SimulationOptions {
  const options: SimulationOptions = {
    runs: DEFAULT_RUNS,
    maxRounds: DEFAULT_MAX_ROUNDS,
    seed: DEFAULT_SEED,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--runs" && argv[index + 1]) {
      options.runs = parsePositiveInteger(argv[index + 1], "runs");
      index += 1;
      continue;
    }

    if (arg.startsWith("--runs=")) {
      options.runs = parsePositiveInteger(arg.slice("--runs=".length), "runs");
      continue;
    }

    if (arg === "--max-rounds" && argv[index + 1]) {
      options.maxRounds = parsePositiveInteger(argv[index + 1], "max-rounds");
      index += 1;
      continue;
    }

    if (arg.startsWith("--max-rounds=")) {
      options.maxRounds = parsePositiveInteger(
        arg.slice("--max-rounds=".length),
        "max-rounds",
      );
      continue;
    }

    if (arg === "--seed" && argv[index + 1]) {
      options.seed = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg.startsWith("--seed=")) {
      options.seed = arg.slice("--seed=".length);
    }
  }

  return options;
}

function parsePositiveInteger(raw: string, label: string): number {
  const value = Number.parseInt(raw, 10);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(
      `Expected ${label} to be a positive integer, received "${raw}".`,
    );
  }

  return value;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const report = simulateCampaignReport(options);
  console.log(formatCampaignReport(report));
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main();
}
