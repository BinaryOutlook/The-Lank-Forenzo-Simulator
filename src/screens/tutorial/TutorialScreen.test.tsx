import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createInitialRun } from "../../simulation/index.js";
import { useGameStore } from "../../simulation/state/gameStore.js";
import { defaultGameSettings } from "../../simulation/state/settings.js";
import { TutorialScreen } from "./TutorialScreen.js";

function renderTutorialScreen() {
  return render(
    <MemoryRouter>
      <TutorialScreen />
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

describe("TutorialScreen", () => {
  it("teaches the objective, interaction model, run flow, concepts, UI areas, and tips", () => {
    renderTutorialScreen();

    expect(
      screen.getByRole("heading", {
        name: /learn the loop before the creditors do/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /leave rich before the bill comes due/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /read, choose, then resolve the quarter/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /one ugly quarter at a time/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /what the simulation is tracking/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /where to look during play/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /first-run instincts worth keeping/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/merger, personal extraction, or Bahamas escape/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/select up to two decision cards per round/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/dossier weight makes legal/i)).toBeInTheDocument();
    expect(
      screen.getByText(/end-round control lives in the resolve phase/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /start a new run/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /return home/i })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("returns to an active run when one already exists", () => {
    useGameStore.setState({
      run: createInitialRun(),
    });

    renderTutorialScreen();

    expect(
      screen.getByRole("button", { name: /return to active run/i }),
    ).toBeInTheDocument();
  });
});
