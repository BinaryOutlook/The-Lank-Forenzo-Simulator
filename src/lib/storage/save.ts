import { z } from "zod";
import type {
  PersistStorage,
  StateStorage,
  StorageValue,
} from "zustand/middleware";
import type { RunState, ThemeName } from "../../simulation/state/types";

export interface GameSavePayload {
  theme: ThemeName;
  run: RunState | null;
}

export const GAME_SAVE_STORAGE_VERSION = 1;
const LEGACY_SAVE_VERSION = 0;
export const SAVE_MIGRATIONS: Record<number, (state: unknown) => unknown> = {
  [LEGACY_SAVE_VERSION]: (state) => state,
};

const themeSchema = z.enum(["earth", "armonk-blue"]);
const endingIdSchema = z.enum([
  "prison",
  "forcedRemoval",
  "merger",
  "extraction",
  "bahamas",
]);

const runMetricsSchema = z
  .object({
    airlineCash: z.number(),
    personalWealth: z.number(),
    debt: z.number(),
    assetValue: z.number(),
    workforceSize: z.number(),
    workforceMorale: z.number(),
    marketConfidence: z.number(),
    creditorPatience: z.number(),
    legalHeat: z.number(),
    safetyIntegrity: z.number(),
    publicAnger: z.number(),
    stockPrice: z.number(),
    offshoreReadiness: z.number(),
  })
  .strict();

const pendingEventSchema = z
  .object({
    eventId: z.string(),
    triggerRound: z.number().int(),
  })
  .strict();

const historyEntrySchema = z
  .object({
    id: z.string(),
    round: z.number().int(),
    source: z.enum(["decision", "event", "system"]),
    title: z.string(),
    body: z.string(),
    tone: z.enum(["positive", "negative", "neutral"]),
  })
  .strict();

const runStateSchema = z
  .object({
    status: z.enum(["active", "ended"]),
    round: z.number().int(),
    metrics: runMetricsSchema,
    selectedDecisionIds: z.array(z.string()),
    lastOfferedDecisionIds: z.array(z.string()),
    pendingEvents: z.array(pendingEventSchema),
    flags: z.array(z.string()),
    history: z.array(historyEntrySchema),
    endingId: endingIdSchema.nullable(),
    eventCounts: z.record(z.number()),
  })
  .strict();

const gameSavePayloadSchema = z
  .object({
    theme: themeSchema,
    run: runStateSchema.nullable(),
  })
  .strict();

const storageRecordSchema = z
  .object({
    state: z.unknown(),
    version: z.number().int().nonnegative(),
  })
  .strict();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseTheme(value: unknown): ThemeName {
  const parsed = themeSchema.safeParse(value);
  return parsed.success ? parsed.data : "earth";
}

function parseRun(value: unknown): RunState | null {
  const parsed = runStateSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function coerceGameSavePayload(value: unknown): GameSavePayload {
  const parsed = gameSavePayloadSchema.safeParse(value);
  if (parsed.success) {
    return parsed.data;
  }

  if (!isRecord(value)) {
    return {
      theme: "earth",
      run: null,
    };
  }

  return {
    theme: parseTheme(value.theme),
    run: parseRun(value.run),
  };
}

function parseStoredRecord(raw: unknown): StorageValue<GameSavePayload> | null {
  if (!isRecord(raw)) {
    return null;
  }

  const record = storageRecordSchema.safeParse(raw);
  if (record.success) {
    return {
      state: coerceGameSavePayload(record.data.state),
      version: record.data.version,
    };
  }

  if ("theme" in raw || "run" in raw) {
    return {
      state: coerceGameSavePayload(raw),
      version: LEGACY_SAVE_VERSION,
    };
  }

  return null;
}

function safeParseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function applySaveMigrations(
  persistedState: unknown,
  version: number,
): unknown {
  let currentState = persistedState;

  for (
    let currentVersion = version;
    currentVersion < GAME_SAVE_STORAGE_VERSION;
    currentVersion += 1
  ) {
    const migration = SAVE_MIGRATIONS[currentVersion];
    if (!migration) {
      break;
    }

    currentState = migration(currentState);
  }

  return currentState;
}

export function readGameSaveStorageValue(
  raw: string | null,
): StorageValue<GameSavePayload> | null {
  if (raw === null) {
    return null;
  }

  return parseStoredRecord(safeParseJson(raw));
}

export function migrateGameSavePayload(
  persistedState: unknown,
  version: number,
): GameSavePayload {
  return coerceGameSavePayload(applySaveMigrations(persistedState, version));
}

export function createGameSaveStorage(
  getStorage: () => StateStorage | undefined,
): PersistStorage<GameSavePayload> | undefined {
  let storage: StateStorage | undefined;

  try {
    storage = getStorage();
  } catch {
    return undefined;
  }

  if (!storage) {
    return undefined;
  }

  return {
    getItem: (name) => {
      try {
        const raw = storage.getItem(name);

        if (typeof raw === "string" || raw === null) {
          return readGameSaveStorageValue(raw);
        }

        return raw
          .then((value) => readGameSaveStorageValue(value))
          .catch(() => null);
      } catch {
        return null;
      }
    },
    setItem: (name, value) => {
      try {
        storage.setItem(name, JSON.stringify(value));
      } catch {
        return undefined;
      }
    },
    removeItem: (name) => {
      try {
        storage.removeItem(name);
      } catch {
        return undefined;
      }
    },
  };
}
