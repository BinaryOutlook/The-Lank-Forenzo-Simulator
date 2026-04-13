import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInitialRunState } from "../../src/simulation/resolution/resolveRound";
import {
  GAME_SAVE_STORAGE_VERSION,
  migrateGameSavePayload,
  readGameSaveStorageValue,
} from "../../src/lib/storage/save";

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

describe("save storage", () => {
  it("parses a valid current save payload", () => {
    const run = createInitialRunState();
    const snapshot = {
      state: {
        theme: "armonk-blue" as const,
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
      state: legacyPayload,
      version: 0,
    });
    expect(
      migrateGameSavePayload(storedValue!.state, storedValue!.version ?? 0),
    ).toEqual(legacyPayload);
  });

  it("falls back safely when hydration meets corrupt storage", async () => {
    localStorage.setItem(storageKey, "{not json");

    const { useGameStore } =
      await import("../../src/simulation/state/gameStore");

    expect(useGameStore.getState().theme).toBe("earth");
    expect(useGameStore.getState().run).toBeNull();
  });
});
