import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createInitialRunState } from "../../src/simulation/resolution/resolveRound.js";
import {
  GAME_SAVE_STORAGE_VERSION,
  migrateGameSavePayload,
  readGameSaveStorageValue,
} from "../../src/lib/storage/save.js";
import { defaultGameSettings } from "../../src/simulation/state/settings.js";

const storageKey = "the-lank-forenzo-simulator/v1";
const createMockStorage = () => {
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
};

beforeEach(() => {
  const storage = createMockStorage();
  vi.stubGlobal("localStorage", storage);
  storage.clear();
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("save storage", () => {
  it("parses a valid current save payload", () => {
    const run = createInitialRunState();
    const snapshot = {
      state: {
        theme: "armonk-blue" as const,
        settings: {
          ...defaultGameSettings,
          wallpaper: "runway-night" as const,
          musicEnabled: true,
          musicVolume: 55,
          soundEffectsEnabled: false,
          interactionEffectsEnabled: false,
          visualEffectIntensity: 40,
        },
        run,
      },
      version: GAME_SAVE_STORAGE_VERSION,
    };

    expect(readGameSaveStorageValue(JSON.stringify(snapshot))).toEqual(
      snapshot,
    );
    expect(migrateGameSavePayload(snapshot.state, snapshot.version)).toEqual(
      snapshot.state,
    );
  });

  it("migrates a legacy raw save payload", () => {
    const run = createInitialRunState();
    const legacyPayload = {
      theme: "earth" as const,
      run,
    };

    const storedValue = readGameSaveStorageValue(JSON.stringify(legacyPayload));

    expect(storedValue).not.toBeNull();
    expect(storedValue).toEqual({
      state: {
        ...legacyPayload,
        settings: defaultGameSettings,
      },
      version: 0,
    });
    expect(
      migrateGameSavePayload(storedValue!.state, storedValue!.version ?? 0),
    ).toEqual({
      ...legacyPayload,
      settings: defaultGameSettings,
    });
  });

  it("coerces invalid option values back to safe defaults", () => {
    const payload = migrateGameSavePayload(
      {
        theme: "armonk-blue",
        settings: {
          wallpaper: "unknown",
          musicEnabled: "yes",
          musicVolume: 250,
          visualEffectsEnabled: true,
          interactionEffectsEnabled: "no",
          visualEffectIntensity: -20,
          uiDensity: "massive",
        },
        run: null,
      },
      GAME_SAVE_STORAGE_VERSION,
    );

    expect(payload).toEqual({
      theme: "armonk-blue",
      settings: {
        ...defaultGameSettings,
        musicVolume: 100,
        visualEffectIntensity: 0,
      },
      run: null,
    });
  });

  it("falls back safely when hydration meets corrupt storage", async () => {
    localStorage.setItem(storageKey, "{not json");

    const { useGameStore } =
      await import("../../src/simulation/state/gameStore");

    expect(useGameStore.getState().theme).toBe("earth");
    expect(useGameStore.getState().run).toBeNull();
  });
});
