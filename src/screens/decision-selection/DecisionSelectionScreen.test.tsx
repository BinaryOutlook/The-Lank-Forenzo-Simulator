import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createInitialRun } from "../../simulation/index.js";
import { useGameStore } from "../../simulation/state/gameStore.js";
import { defaultGameSettings } from "../../simulation/state/settings.js";
import { DecisionSelectionScreen } from "./DecisionSelectionScreen.js";

function renderDecisionSelectionScreen() {
  return render(
    <MemoryRouter initialEntries={["/run/decisions"]}>
      <DecisionSelectionScreen />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useGameStore.setState({
    theme: "earth",
    settings: defaultGameSettings,
    run: createInitialRun(),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("DecisionSelectionScreen", () => {
  it("presents all round decisions in a dedicated selection phase", () => {
    renderDecisionSelectionScreen();

    expect(
      screen.getByRole("heading", { name: /select the quarter's damage/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /return to board/i }),
    ).toHaveAttribute("href", "/run");
    expect(screen.getByText("0/2 selected")).toBeInTheDocument();
    expect(screen.getByLabelText("Strategic resources")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { pressed: false })).toHaveLength(5);
  });

  it("selects and deselects cards from the full decision view", async () => {
    const user = userEvent.setup();

    renderDecisionSelectionScreen();

    const decisionButtons = screen.getAllByRole("button", { pressed: false });
    await user.click(decisionButtons[0]);

    expect(screen.getByText("1/2 selected")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { pressed: true })).toHaveLength(1);

    await user.click(screen.getAllByRole("button", { pressed: true })[0]);

    expect(screen.getByText("0/2 selected")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { pressed: false })).toHaveLength(5);
  });
});
