import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../../simulation/state/gameStore.js";
import { defaultGameSettings } from "../../simulation/state/settings.js";
import { AboutScreen } from "./AboutScreen.js";

function renderAboutScreen() {
  return render(
    <MemoryRouter>
      <AboutScreen />
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

describe("AboutScreen", () => {
  it("explains the simulator motivation and provides lightweight navigation back", () => {
    renderAboutScreen();

    expect(
      screen.getByRole("heading", {
        name: /aviation management, viewed from the executive escape hatch/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/most airline games reward careful scheduling/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/the central tension is the split/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /return to main game/i }),
    ).toHaveAttribute("href", "/");
  });
});
