import {
  cleanup,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../../simulation/state/gameStore.js";
import { defaultGameSettings } from "../../simulation/state/settings.js";
import { RunScreen } from "./RunScreen.js";

function renderRunScreen() {
  return render(
    <MemoryRouter initialEntries={["/run"]}>
      <Routes>
        <Route path="/" element={<h1>Landing</h1>} />
        <Route path="/run" element={<RunScreen />} />
      </Routes>
    </MemoryRouter>,
  );
}

function getDecisionButtons(): HTMLButtonElement[] {
  return screen
    .getAllByRole("button")
    .filter((button): button is HTMLButtonElement =>
      button.hasAttribute("aria-pressed"),
    );
}

beforeEach(() => {
  useGameStore.setState({
    theme: "earth",
    settings: defaultGameSettings,
    run: null,
  });
  useGameStore.getState().startNewRun();
});

afterEach(() => {
  cleanup();
  useGameStore.setState({
    theme: "earth",
    settings: defaultGameSettings,
    run: null,
  });
});

describe("RunScreen end-round confirmation", () => {
  it("recovers incomplete selections and confirms complete quarter resolution", async () => {
    const user = userEvent.setup();

    renderRunScreen();

    await user.click(screen.getByRole("tab", { name: /choose plays/i }));

    const firstDecision = getDecisionButtons()[0];

    if (!firstDecision) {
      throw new Error("Expected at least one decision card.");
    }

    await user.click(firstDecision);
    await user.click(screen.getByRole("button", { name: /review resolution/i }));

    await user.click(screen.getByRole("button", { name: /end quarter/i }));

    expect(
      screen.getByRole("dialog", { name: /the tray is not locked yet/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/1 choice still required/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /back to decision tray/i }),
    ).toHaveFocus();

    await user.keyboard("{Enter}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(firstDecision).toHaveAttribute("aria-pressed", "true");
    expect(useGameStore.getState().run?.round).toBe(1);

    const secondDecision = getDecisionButtons().find(
      (button) =>
        button.getAttribute("aria-pressed") === "false" && !button.disabled,
    );

    if (!secondDecision) {
      throw new Error("Expected a second selectable decision card.");
    }

    await user.click(secondDecision);
    await user.click(screen.getByRole("button", { name: /review resolution/i }));

    await user.click(screen.getByRole("button", { name: /end quarter/i }));

    expect(
      screen.getByRole("dialog", { name: /seal the quarter/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/selected decisions/i)).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(useGameStore.getState().run?.selectedDecisionIds).toHaveLength(2);
    expect(useGameStore.getState().run?.round).toBe(1);

    await user.click(screen.getByRole("button", { name: /end quarter/i }));
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(useGameStore.getState().run?.round).toBe(2);
    });
  });
});
