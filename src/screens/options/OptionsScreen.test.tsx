import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../../simulation/state/gameStore.js";
import { defaultGameSettings } from "../../simulation/state/settings.js";
import { OptionsScreen } from "./OptionsScreen.js";

function renderOptionsScreen() {
  return render(
    <MemoryRouter>
      <OptionsScreen />
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
});

describe("OptionsScreen", () => {
  it("organizes presentation controls and exposes every design theme choice", () => {
    renderOptionsScreen();

    expect(
      screen.getByRole("heading", {
        name: /^theme$/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /^font$/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /ui density and design/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        name: /boardroom presentation/i,
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /earth/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /armonk blue/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /highwire/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /civic glass/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /ledger mono/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /compact/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", {
        name: /interface animation/i,
      }),
    ).toBeInTheDocument();
  });

  it("updates persisted presentation, audio, and effect settings", async () => {
    const user = userEvent.setup();

    renderOptionsScreen();

    await user.click(
      screen.getByRole("button", {
        name: /runway night/i,
      }),
    );
    await user.click(
      screen.getByRole("button", {
        name: /compact/i,
      }),
    );
    await user.click(
      screen.getByRole("button", {
        name: /ledger mono/i,
      }),
    );
    await user.click(
      screen.getByRole("checkbox", {
        name: /^music\b/i,
      }),
    );
    fireEvent.change(screen.getByRole("slider", { name: /music volume/i }), {
      target: { value: "65" },
    });
    await user.click(
      screen.getByRole("checkbox", {
        name: /visual effects/i,
      }),
    );
    await user.click(
      screen.getByRole("checkbox", {
        name: /sound effects/i,
      }),
    );
    await user.click(
      screen.getByRole("checkbox", {
        name: /interaction feedback/i,
      }),
    );

    expect(useGameStore.getState().settings).toMatchObject({
      wallpaper: "runway-night",
      fontPreset: "ledger",
      uiDensity: "compact",
      musicEnabled: true,
      musicVolume: 65,
      soundEffectsEnabled: false,
      visualEffectsEnabled: false,
      interactionEffectsEnabled: false,
    });
    expect(screen.getByText("Enabled at 65%")).toBeInTheDocument();
    expect(screen.getAllByText("Disabled")).toHaveLength(2);
    expect(
      screen.getByText("Paused while visual effects are off"),
    ).toBeInTheDocument();
  }, 20_000);

  it("resets options to the default room tone", async () => {
    const user = userEvent.setup();

    useGameStore.setState({
      theme: "armonk-blue",
      settings: {
        ...defaultGameSettings,
        wallpaper: "audit-room",
        musicEnabled: true,
      },
    });

    renderOptionsScreen();

    await user.click(
      screen.getByRole("button", {
        name: /reset options/i,
      }),
    );

    expect(useGameStore.getState().theme).toBe("earth");
    expect(useGameStore.getState().settings).toEqual(defaultGameSettings);
  }, 20_000);
});
