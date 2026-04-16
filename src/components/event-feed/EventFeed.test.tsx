import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { HistoryEntry } from "../../simulation/state/types";
import { EventFeed } from "./EventFeed";

describe("EventFeed", () => {
  it("shows only the 10 most recent history entries", () => {
    const history = Array.from({ length: 12 }, (_, index) => ({
      id: `entry-${index}`,
      round: 12 - index,
      source: "event" as const,
      title: `Entry ${index}`,
      body: `Body ${index}`,
      tone: "neutral" as const,
    }));

    render(<EventFeed history={history} />);

    expect(screen.getByText("Entry 0")).toBeInTheDocument();
    expect(screen.getByText("Entry 9")).toBeInTheDocument();
    expect(screen.queryByText("Entry 10")).not.toBeInTheDocument();
    expect(screen.queryByText("Entry 11")).not.toBeInTheDocument();
  });

  it("renders optional v0.5 source tags and causes", () => {
    const history = [
      {
        id: "entry-signal",
        round: 5,
        source: "system",
        sourceKind: "hazard_event",
        factionId: "regulators",
        dossierTheme: "safety_theater",
        title: "Inspection Memo Reopened",
        body: "The reform office became evidence instead of cover.",
        cause: "Safety integrity kept falling while reform office theater stayed live.",
        tone: "negative",
      },
    ] satisfies Array<
      HistoryEntry & {
        sourceKind: string;
        factionId: string;
        dossierTheme: string;
        cause: string;
      }
    >;

    render(<EventFeed history={history} />);

    expect(screen.getByText("Hazard Event")).toBeInTheDocument();
    expect(screen.getByText("Faction: Regulators")).toBeInTheDocument();
    expect(screen.getByText("Dossier: Safety Theater")).toBeInTheDocument();
    expect(screen.getByText(/Cause: Safety integrity kept falling/)).toBeInTheDocument();
  });
});
