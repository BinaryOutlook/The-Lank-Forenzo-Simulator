import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createGameSaveStorage,
  GAME_SAVE_STORAGE_VERSION,
  migrateGameSavePayload,
} from "../../lib/storage/save";
import { loadContent } from "../content";
import { getAvailableDecisions } from "../systems/decisionEngine";
import {
  createInitialRunState,
  resolveRound,
} from "../resolution/resolveRound";
import { defaultGameSettings, normalizeGameSettings } from "./settings.js";
import type { GameSettings, UiDensity, WallpaperPreset } from "./settings.js";
import type {
  DecisionDefinition,
  EndingDefinition,
  RunState,
  ThemeName,
} from "./types.js";

interface GameStoreState {
  theme: ThemeName;
  settings: GameSettings;
  run: RunState | null;
  setTheme: (theme: ThemeName) => void;
  setWallpaper: (wallpaper: WallpaperPreset) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setMusicVolume: (volume: number) => void;
  setSoundEffectsEnabled: (enabled: boolean) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setVisualEffectsEnabled: (enabled: boolean) => void;
  setInteractionEffectsEnabled: (enabled: boolean) => void;
  setVisualEffectIntensity: (intensity: number) => void;
  setUiDensity: (density: UiDensity) => void;
  resetSettings: () => void;
  startNewRun: () => void;
  toggleDecision: (decisionId: string) => void;
  endTurn: () => void;
  clearRun: () => void;
  availableDecisions: () => DecisionDefinition[];
  currentEnding: () => EndingDefinition | null;
}

const storageKey = "the-lank-forenzo-simulator/v1";

export const useGameStore = create<GameStoreState>()(
  persist(
    (set, get) => ({
      theme: "earth",
      settings: defaultGameSettings,
      run: null,
      setTheme: (theme) => set({ theme }),
      setWallpaper: (wallpaper) =>
        set((state) => ({
          settings: normalizeGameSettings({
            ...state.settings,
            wallpaper,
          }),
        })),
      setMusicEnabled: (enabled) =>
        set((state) => ({
          settings: normalizeGameSettings({
            ...state.settings,
            musicEnabled: enabled,
          }),
        })),
      setMusicVolume: (volume) =>
        set((state) => ({
          settings: normalizeGameSettings({
            ...state.settings,
            musicVolume: volume,
          }),
        })),
      setSoundEffectsEnabled: (enabled) =>
        set((state) => ({
          settings: normalizeGameSettings({
            ...state.settings,
            soundEffectsEnabled: enabled,
          }),
        })),
      setAnimationsEnabled: (enabled) =>
        set((state) => ({
          settings: normalizeGameSettings({
            ...state.settings,
            animationsEnabled: enabled,
          }),
        })),
      setVisualEffectsEnabled: (enabled) =>
        set((state) => ({
          settings: normalizeGameSettings({
            ...state.settings,
            visualEffectsEnabled: enabled,
          }),
        })),
      setInteractionEffectsEnabled: (enabled) =>
        set((state) => ({
          settings: normalizeGameSettings({
            ...state.settings,
            interactionEffectsEnabled: enabled,
          }),
        })),
      setVisualEffectIntensity: (intensity) =>
        set((state) => ({
          settings: normalizeGameSettings({
            ...state.settings,
            visualEffectIntensity: intensity,
          }),
        })),
      setUiDensity: (density) =>
        set((state) => ({
          settings: normalizeGameSettings({
            ...state.settings,
            uiDensity: density,
          }),
        })),
      resetSettings: () =>
        set({
          theme: "earth",
          settings: defaultGameSettings,
        }),
      startNewRun: () => set({ run: createInitialRunState() }),
      toggleDecision: (decisionId) =>
        set((state) => {
          if (!state.run || state.run.status !== "active") {
            return state;
          }

          const selected = state.run.selectedDecisionIds.includes(decisionId)
            ? state.run.selectedDecisionIds.filter((id) => id !== decisionId)
            : [...state.run.selectedDecisionIds, decisionId].slice(0, 2);

          return {
            run: {
              ...state.run,
              selectedDecisionIds: selected,
            },
          };
        }),
      endTurn: () =>
        set((state) => {
          if (!state.run || state.run.status !== "active") {
            return state;
          }

          return {
            run: resolveRound(state.run),
          };
        }),
      clearRun: () => set({ run: null }),
      availableDecisions: () => {
        const run = get().run;
        if (!run || run.status !== "active") {
          return [];
        }

        return getAvailableDecisions(loadContent().decisions, run);
      },
      currentEnding: () => {
        const run = get().run;
        if (!run?.endingId) {
          return null;
        }

        return (
          loadContent().endings.find((ending) => ending.id === run.endingId) ??
          null
        );
      },
    }),
    {
      name: storageKey,
      storage: createGameSaveStorage(() => localStorage),
      version: GAME_SAVE_STORAGE_VERSION,
      migrate: migrateGameSavePayload,
      partialize: (state) => ({
        theme: state.theme,
        settings: state.settings,
        run: state.run,
      }),
    },
  ),
);
