import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { serializeGameSaveFile } from "../../lib/storage/save.js";
import { useGameStore } from "../../simulation/state/gameStore.js";
import { defaultGameSettings } from "../../simulation/state/settings.js";
import { LoadManagerScreen } from "./LoadManagerScreen.js";

function renderLoadManagerScreen() {
  return render(
    <MemoryRouter initialEntries={["/load"]}>
      <Routes>
        <Route path="/" element={<h1>Landing route</h1>} />
        <Route path="/run" element={<h1>Run route</h1>} />
        <Route path="/load" element={<LoadManagerScreen />} />
      </Routes>
    </MemoryRouter>,
  );
}

function createMockStorage() {
  const store = new Map<string, string>();

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
}

beforeEach(() => {
  vi.stubGlobal("localStorage", createMockStorage());
  useGameStore.setState({
    theme: "earth",
    settings: defaultGameSettings,
    run: null,
  });
  useGameStore.getState().startNewRun();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  useGameStore.setState({
    theme: "earth",
    settings: defaultGameSettings,
    run: null,
  });
});

describe("LoadManagerScreen", () => {
  it("creates and loads a non-encrypted browser save slot", async () => {
    const user = userEvent.setup();

    renderLoadManagerScreen();

    await user.clear(screen.getByLabelText(/save label/i));
    await user.type(screen.getByLabelText(/save label/i), "Quarter one exit");
    await user.click(
      screen.getByRole("button", { name: /save browser session/i }),
    );

    expect(screen.getByText("Quarter one exit")).toBeInTheDocument();

    useGameStore.setState({
      run: null,
    });

    await user.click(
      screen.getByRole("button", {
        name: /load saved session quarter one exit/i,
      }),
    );

    expect(
      screen.getByRole("heading", { name: /run route/i }),
    ).toBeInTheDocument();
    expect(useGameStore.getState().run?.round).toBe(1);
  }, 20_000);

  it("loads a plain local save file through the import control", async () => {
    const user = userEvent.setup();
    const payload = {
      theme: "highwire" as const,
      settings: defaultGameSettings,
      run: useGameStore.getState().run,
    };
    const file = new File(
      [serializeGameSaveFile(payload, "Imported quarter one")],
      "imported-quarter-one.tlfs-save.json",
      {
        type: "application/json",
      },
    );

    useGameStore.setState({
      theme: "earth",
      run: null,
    });

    renderLoadManagerScreen();

    await user.upload(screen.getByLabelText(/choose save file/i), file);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /run route/i }),
      ).toBeInTheDocument();
    });
    expect(useGameStore.getState().theme).toBe("highwire");
    expect(useGameStore.getState().run?.round).toBe(1);
  }, 20_000);
});
