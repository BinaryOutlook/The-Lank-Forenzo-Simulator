import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { RunState } from "../../simulation/state/types";
import { BoardPacket } from "./BoardPacket";

const baseRun: RunState = {
  status: "active",
  round: 4,
  metrics: {
    airlineCash: 150,
    personalWealth: 42,
    debt: 340,
    assetValue: 210,
    workforceSize: 80,
    workforceMorale: 48,
    marketConfidence: 55,
    creditorPatience: 45,
    legalHeat: 28,
    safetyIntegrity: 54,
    publicAnger: 34,
    stockPrice: 18,
    offshoreReadiness: 22,
  },
  selectedDecisionIds: [],
  lastOfferedDecisionIds: [],
  pendingEvents: [],
  flags: [],
  history: [],
  endingId: null,
  eventCounts: {},
};

describe("BoardPacket", () => {
  it("renders optional v0.5 system signals when present", () => {
    const run = {
      ...baseRun,
      factions: {
        labor: {
          id: "labor",
          lastIntentId: "organize",
          pressure: 72,
          recentGrievances: ["Two crew cuts made the contractor story visible"],
        },
      },
      operations: {
        maintenanceBacklog: 4,
        serviceDisruption: 2,
      },
      dossiers: {
        safety: {
          theme: "safety_theater",
          severity: 6,
          evidenceCount: 3,
        },
      },
    } as unknown as RunState;

    render(<BoardPacket run={run} />);

    expect(screen.getByRole("heading", { name: "System memory now has a shape." })).toBeInTheDocument();
    expect(screen.getByText("Labor: Organize")).toBeInTheDocument();
    expect(screen.getByText(/maintenance backlog 4/)).toBeInTheDocument();
    expect(screen.getByText("Safety Theater dossier")).toBeInTheDocument();
  });
});
