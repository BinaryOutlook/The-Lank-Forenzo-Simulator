import { z } from "zod";
import type {
  PersistStorage,
  StateStorage,
  StorageValue,
} from "zustand/middleware";
import {
  defaultGameSettings,
  normalizeGameSettings,
} from "../../simulation/state/settings.js";
import { coerceFactionStates } from "../../simulation/factions/factionState.js";
import { coerceConsumableResources } from "../../simulation/systems/consumables.js";
import type { GameSettings } from "../../simulation/state/settings.js";
import type { RunState, ThemeName } from "../../simulation/state/types.js";

export interface GameSavePayload {
  theme: ThemeName;
  settings: GameSettings;
  run: RunState | null;
}

export interface GameSaveSlot {
  id: string;
  label: string;
  savedAt: string;
  storageVersion: number;
  payload: GameSavePayload;
}

export type GameSaveImportSource =
  | "manager-file"
  | "persisted-storage"
  | "raw-payload";

export type GameSaveImportResult =
  | {
      ok: true;
      label: string;
      payload: GameSavePayload;
      source: GameSaveImportSource;
      storageVersion: number;
    }
  | {
      ok: false;
      error: string;
    };

interface SyncStringStorage {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
}

export const GAME_SAVE_STORAGE_KEY = "the-lank-forenzo-simulator/v1";
export const LOCAL_SAVE_SLOT_STORAGE_KEY =
  "the-lank-forenzo-simulator/save-slots/v1";
export const GAME_SAVE_FILE_FORMAT = "the-lank-forenzo-simulator.save";
export const GAME_SAVE_FILE_VERSION = 1;
export const GAME_SAVE_STORAGE_VERSION = 5;
export const LOCAL_SAVE_SLOT_LIMIT = 12;
const LEGACY_SAVE_VERSION = 0;
export const SAVE_MIGRATIONS: Record<number, (state: unknown) => unknown> = {
  [LEGACY_SAVE_VERSION]: (state) => state,
  1: (state) => state,
  2: (state) => state,
  3: (state) => state,
  4: (state) => state,
};

const themeSchema = z.enum(["earth", "armonk-blue", "highwire", "civic-glass"]);
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
    source: z.enum([
      "decision",
      "event",
      "system",
      "faction",
      "operation",
      "dossier",
    ]),
    title: z.string(),
    body: z.string(),
    tone: z.enum(["positive", "negative", "neutral"]),
  })
  .passthrough();

const runStateSchema = z
  .object({
    status: z.enum(["active", "ended"]),
    round: z.number().int(),
    metrics: runMetricsSchema,
    resources: z.unknown().optional(),
    selectedDecisionIds: z.array(z.string()),
    lastOfferedDecisionIds: z.array(z.string()),
    pendingEvents: z.array(pendingEventSchema),
    flags: z.array(z.string()),
    history: z.array(historyEntrySchema),
    endingId: endingIdSchema.nullable(),
    eventCounts: z.record(z.number()),
  })
  .passthrough();

const gameSavePayloadSchema = z
  .object({
    theme: themeSchema,
    settings: z.unknown().optional(),
    run: runStateSchema.nullable(),
  })
  .strict();

const storageRecordSchema = z
  .object({
    state: z.unknown(),
    version: z.number().int().nonnegative(),
  })
  .strict();

const gameSaveFileSchema = z
  .object({
    format: z.literal(GAME_SAVE_FILE_FORMAT),
    fileVersion: z.number().int().positive(),
    storageVersion: z.number().int().nonnegative(),
    createdAt: z.string().optional(),
    label: z.string().optional(),
    payload: z.unknown(),
  })
  .passthrough();

const localSaveSlotSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1),
    savedAt: z.string().min(1),
    storageVersion: z.number().int().nonnegative(),
    payload: z.unknown(),
  })
  .strict();

const localSaveSlotRecordSchema = z
  .object({
    version: z.literal(1),
    slots: z.array(localSaveSlotSchema),
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
  if (!parsed.success) {
    return null;
  }

  const { resources, factions, factionState, ...run } = parsed.data;

  return {
    ...run,
    resources: coerceConsumableResources(resources),
    factions: coerceFactionStates(factions ?? factionState),
  };
}

export function coerceGameSavePayload(value: unknown): GameSavePayload {
  const parsed = gameSavePayloadSchema.safeParse(value);
  if (parsed.success) {
    return {
      theme: parsed.data.theme,
      settings: normalizeGameSettings(parsed.data.settings),
      run: parseRun(parsed.data.run),
    };
  }

  if (!isRecord(value)) {
    return {
      theme: "earth",
      settings: defaultGameSettings,
      run: null,
    };
  }

  return {
    theme: parseTheme(value.theme),
    settings: normalizeGameSettings(value.settings),
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

  if ("theme" in raw || "settings" in raw || "run" in raw) {
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

function getBrowserStringStorage(): SyncStringStorage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

function normalizeSaveLabel(label: string | undefined, fallback: string): string {
  const trimmed = label?.trim();

  return (trimmed && trimmed.length > 0 ? trimmed : fallback).slice(0, 80);
}

function createSaveSlotId(now: Date): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${now.getTime()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getDefaultSaveLabel(payload: GameSavePayload): string {
  if (!payload.run) {
    return "Options snapshot";
  }

  return payload.run.status === "ended"
    ? `Ended run, round ${payload.run.round}`
    : `Run, round ${payload.run.round}`;
}

function parseCompatiblePayload(
  payload: unknown,
  storageVersion: number,
): GameSavePayload | null {
  if (storageVersion > GAME_SAVE_STORAGE_VERSION) {
    return null;
  }

  return migrateGameSavePayload(payload, storageVersion);
}

function normalizeLocalSaveSlot(
  slot: z.infer<typeof localSaveSlotSchema>,
): GameSaveSlot | null {
  const payload = parseCompatiblePayload(slot.payload, slot.storageVersion);

  if (!payload) {
    return null;
  }

  return {
    id: slot.id,
    label: normalizeSaveLabel(slot.label, getDefaultSaveLabel(payload)),
    savedAt: slot.savedAt,
    storageVersion: GAME_SAVE_STORAGE_VERSION,
    payload,
  };
}

export function readLocalSaveSlots(
  storage: SyncStringStorage | null = getBrowserStringStorage(),
): GameSaveSlot[] {
  if (!storage) {
    return [];
  }

  try {
    const raw = storage.getItem(LOCAL_SAVE_SLOT_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = localSaveSlotRecordSchema.safeParse(safeParseJson(raw));

    if (!parsed.success) {
      return [];
    }

    return parsed.data.slots
      .map((slot) => normalizeLocalSaveSlot(slot))
      .filter((slot): slot is GameSaveSlot => Boolean(slot));
  } catch {
    return [];
  }
}

function writeLocalSaveSlots(
  slots: GameSaveSlot[],
  storage: SyncStringStorage | null = getBrowserStringStorage(),
) {
  if (!storage) {
    return false;
  }

  try {
    storage.setItem(
      LOCAL_SAVE_SLOT_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        slots,
      }),
    );
    return true;
  } catch {
    return false;
  }
}

export function createLocalSaveSlot(
  payload: GameSavePayload,
  label?: string,
  storage: SyncStringStorage | null = getBrowserStringStorage(),
  now = new Date(),
): GameSaveSlot | null {
  const normalizedPayload = coerceGameSavePayload(payload);
  const slot: GameSaveSlot = {
    id: createSaveSlotId(now),
    label: normalizeSaveLabel(label, getDefaultSaveLabel(normalizedPayload)),
    savedAt: now.toISOString(),
    storageVersion: GAME_SAVE_STORAGE_VERSION,
    payload: normalizedPayload,
  };
  const slots = [
    slot,
    ...readLocalSaveSlots(storage).filter(
      (currentSlot) => currentSlot.id !== slot.id,
    ),
  ].slice(0, LOCAL_SAVE_SLOT_LIMIT);

  return writeLocalSaveSlots(slots, storage) ? slot : null;
}

export function removeLocalSaveSlot(
  slotId: string,
  storage: SyncStringStorage | null = getBrowserStringStorage(),
): boolean {
  const nextSlots = readLocalSaveSlots(storage).filter(
    (slot) => slot.id !== slotId,
  );

  return writeLocalSaveSlots(nextSlots, storage);
}

function slugifySaveLabel(label: string): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return slug || "lank-forenzo-save";
}

export function createGameSaveFileName(label: string, now = new Date()): string {
  const timestamp = now.toISOString().slice(0, 19).replace(/[:T]/g, "-");

  return `${slugifySaveLabel(label)}-${timestamp}.tlfs-save.json`;
}

export function serializeGameSaveFile(
  payload: GameSavePayload,
  label?: string,
  now = new Date(),
): string {
  const normalizedPayload = coerceGameSavePayload(payload);

  return JSON.stringify(
    {
      format: GAME_SAVE_FILE_FORMAT,
      fileVersion: GAME_SAVE_FILE_VERSION,
      storageVersion: GAME_SAVE_STORAGE_VERSION,
      createdAt: now.toISOString(),
      label: normalizeSaveLabel(label, getDefaultSaveLabel(normalizedPayload)),
      payload: normalizedPayload,
    },
    null,
    2,
  );
}

export function parseGameSaveImport(raw: string): GameSaveImportResult {
  const parsedJson = safeParseJson(raw);

  if (!parsedJson) {
    return {
      ok: false,
      error: "That save file is not valid JSON.",
    };
  }

  const file = gameSaveFileSchema.safeParse(parsedJson);

  if (file.success) {
    if (file.data.fileVersion > GAME_SAVE_FILE_VERSION) {
      return {
        ok: false,
        error: `This save file uses file format ${file.data.fileVersion}, but this build only supports ${GAME_SAVE_FILE_VERSION}.`,
      };
    }

    const payload = parseCompatiblePayload(
      file.data.payload,
      file.data.storageVersion,
    );

    if (!payload) {
      return {
        ok: false,
        error: `This save file uses game save version ${file.data.storageVersion}, but this build only supports ${GAME_SAVE_STORAGE_VERSION}.`,
      };
    }

    return {
      ok: true,
      label: normalizeSaveLabel(file.data.label, getDefaultSaveLabel(payload)),
      payload,
      source: "manager-file",
      storageVersion: GAME_SAVE_STORAGE_VERSION,
    };
  }

  const storedRecord = parseStoredRecord(parsedJson);

  if (storedRecord) {
    const payload = parseCompatiblePayload(
      storedRecord.state,
      storedRecord.version ?? LEGACY_SAVE_VERSION,
    );

    if (!payload) {
      return {
        ok: false,
        error: `This persisted save uses game save version ${
          storedRecord.version ?? LEGACY_SAVE_VERSION
        }, but this build only supports ${GAME_SAVE_STORAGE_VERSION}.`,
      };
    }

    return {
      ok: true,
      label: getDefaultSaveLabel(payload),
      payload,
      source:
        storedRecord.version === LEGACY_SAVE_VERSION
          ? "raw-payload"
          : "persisted-storage",
      storageVersion: GAME_SAVE_STORAGE_VERSION,
    };
  }

  return {
    ok: false,
    error:
      "That JSON does not look like a Lank Forenzo save file or persisted save record.",
  };
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
