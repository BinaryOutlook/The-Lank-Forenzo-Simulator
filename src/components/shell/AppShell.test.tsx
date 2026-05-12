import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGameStore } from "../../simulation/state/gameStore.js";
import { defaultGameSettings } from "../../simulation/state/settings.js";
import { AppShell } from "./AppShell.js";

function renderAppShell(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<h1>Landing route</h1>} />
          <Route path="run" element={<h1>Primary run workspace</h1>} />
          <Route path="about" element={<h1>About route</h1>} />
          <Route path="tutorial" element={<h1>Tutorial route</h1>} />
          <Route path="options" element={<h1>Options route</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  useGameStore.setState({
    theme: "earth",
    settings: defaultGameSettings,
    run: null,
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("AppShell", () => {
  it("keeps the fixed Run destination before About, Tutorial, and Options", () => {
    renderAppShell("/options");

    const primaryNavigation = screen.getByRole("navigation", {
      name: /primary/i,
    });
    const primaryLinks = within(primaryNavigation).getAllByRole("link");

    expect(primaryLinks.map((link) => link.textContent)).toEqual([
      "Run",
      "About",
      "Tutorial",
      "Options",
    ]);
    expect(primaryLinks.map((link) => link.getAttribute("href"))).toEqual([
      "/run",
      "/about",
      "/tutorial",
      "/options",
    ]);
    expect(screen.queryByLabelText(/theme selector/i)).not.toBeInTheDocument();
  });

  it("returns players to the run route from secondary pages", async () => {
    const user = userEvent.setup();

    useGameStore.getState().startNewRun();
    renderAppShell("/tutorial");

    const primaryNavigation = screen.getByRole("navigation", {
      name: /primary/i,
    });

    await user.click(
      within(primaryNavigation).getByRole("link", { name: "Run" }),
    );

    expect(
      screen.getByRole("heading", { name: /primary run workspace/i }),
    ).toBeInTheDocument();
  });
});
