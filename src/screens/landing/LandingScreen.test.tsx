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
  useGameStore.setState({
    theme: "earth",
    settings: defaultGameSettings,
    run: null,
  });
});

afterEach(() => {
  cleanup();
});

describe("LandingScreen", () => {
  it("places decorative token-driven poster art above the operating doctrine", () => {
    const { getByTestId } = renderLandingScreen();

    expect(getByTestId("landing-poster-art")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(screen.getByText(/operating doctrine/i)).toBeInTheDocument();
    expect(
      screen.getByText(/separate your fortune from the airline's health/i),
    ).toBeInTheDocument();
  });
});
