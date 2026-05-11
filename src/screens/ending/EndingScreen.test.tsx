import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { initialConsumableResources } from "../../simulation/systems/consumables.js";
import { useGameStore } from "../../simulation/state/gameStore.js";
import type { RunState } from "../../simulation/state/types.js";
import { EndingScreen } from "./EndingScreen.js";

const endedRun: RunState = {
  status: "ended",
  round: 8,
  metrics: {
    airlineCash: -120,
    personalWealth: 42,
    debt: 720,
    assetValue: 520,
    workforceSize: 6400,
    workforceMorale: 24,
    marketConfidence: 66,
    creditorPatience: 12,
    legalHeat: 96,
    safetyIntegrity: 31,
    publicAnger: 78,
    stockPrice: 29,
    offshoreReadiness: 38,
  },
  resources: initialConsumableResources,
  selectedDecisionIds: [],
  lastOfferedDecisionIds: [],
  pendingEvents: [],
  flags: ["mergerNarrative"],
  history: [],
  endingId: "prison",
  eventCounts: {},
  recap: {
    headline: "The prison record is now legible.",
    outcome: [
      {
        title: "Why it ended",
        body: "Legal heat reached 96 and the safety file gave investigators the connective tissue.",
      },
    ],
    dominantStrategy: [
      {
        title: "Operational denial",
        body: "The run repeatedly asked the network to absorb damage while the executive ledger stayed mobile.",
      },
    ],
    factions: [
      {
        title: "Regulators pressure",
        body: "Aggression 88, leverage 74. The consent-order story stopped buying time.",
      },
    ],
    operations: [
      {
        title: "Maintenance weather cascade",
        body: "Deferred maintenance turned a weather front into a visible network failure.",
      },
    ],
    dossiers: [
      {
        title: "Maintenance Fraud file",
        body: "The case file can tie evidence weight 52 and severity 7 to the inspection memo.",
      },
    ],
    missedExitWindows: [
      {
        title: "Extraction window",
        body: "Market belief was available, but personal exposure made the cash-out unsafe.",
      },
    ],
    criticalChains: [
      {
        title: "Downgrade the Inspection Memo",
        body: "A final-quarter operations move made the safety narrative harder to defend.",
      },
    ],
  },
};

afterEach(() => {
  cleanup();
  useGameStore.setState({ run: null });
});

describe("EndingScreen", () => {
  it("renders a structured scandal case summary from recap data", () => {
    useGameStore.setState({ run: endedRun });

    render(
      <MemoryRouter>
        <EndingScreen />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Federal Gray" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "The prison record is now legible.",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(7);
    expect(screen.getByText("Dominant strategy")).toBeInTheDocument();
    expect(screen.getByText("Faction pressure")).toBeInTheDocument();
    expect(screen.getByText("Operational cascade")).toBeInTheDocument();
    expect(screen.getByText("Dossier file")).toBeInTheDocument();
    expect(screen.getByText("Missed windows")).toBeInTheDocument();
    expect(screen.getByText("Operational denial")).toBeInTheDocument();
    expect(screen.getByText("Maintenance Fraud file")).toBeInTheDocument();
    expect(screen.getByText("Extraction window")).toBeInTheDocument();
  });
});
