import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../../simulation/state/gameStore.js";
import { defaultGameSettings } from "../../simulation/state/settings.js";
import { LandingScreen } from "./LandingScreen.js";

function renderLandingScreen() {
  return render(
    <MemoryRouter>
      <LandingScreen />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  if (typeof localStorage.clear === "function") {
    localStorage.clear();
  }

  useGameStore.setState({
    theme: "earth",
    settings: defaultGameSettings,
    run: null,
  });
});

afterEach(() => {
  cleanup();
  useGameStore.setState({
    theme: "earth",
    settings: defaultGameSettings,
    run: null,
  });
});

describe("LandingScreen", () => {
  it("renders the decorative poster artwork before operating doctrine copy", () => {
    renderLandingScreen();

    const artwork = screen.getByTestId("landing-poster-artwork");
    const doctrineLabel = screen.getByText("Operating doctrine");
    const artworkPosition = artwork.compareDocumentPosition(doctrineLabel);

    expect(artwork).toHaveAttribute("aria-hidden", "true");
    expect(artworkPosition & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("Shrink first. Justify later.")).toBeInTheDocument();
    expect(
      screen.getByText("Separate your fortune from the airline's health."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Keep lenders, unions, and regulators from aligning."),
    ).toBeInTheDocument();
  });
});
