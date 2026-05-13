import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  coerceGameSavePayload,
  createGameSaveStorage,
  GAME_SAVE_STORAGE_KEY,
  GAME_SAVE_STORAGE_VERSION,
  migrateGameSavePayload,
} from "../../lib/storage/save.js";
import type { GameSavePayload } from "../../lib/storage/save.js";
import { simulationRuntime } from "../runtime.js";
import { defaultGameSettings, normalizeGameSettings } from "./settings.js";
import type {
  FontPreset,
  GameSettings,
  UiDensity,
  WallpaperPreset,
} from "./settings.js";
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
  setFontPreset: (fontPreset: FontPreset) => void;
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
  loadSavePayload: (payload: GameSavePayload) => void;
  toggleDecision: (decisionId: string) => void;
  endTurn: () => void;
  clearRun: () => void;
  availableDecisions: () => DecisionDefinition[];
  currentEnding: () => EndingDefinition | null;
}

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
      setFontPreset: (fontPreset) =>
        set((state) => ({
          settings: normalizeGameSettings({
            ...state.settings,
            fontPreset,
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
      startNewRun: () => set({ run: simulationRuntime.createInitialRun() }),
      loadSavePayload: (payload) => set(coerceGameSavePayload(payload)),
      toggleDecision: (decisionId) =>
        set((state) => {
          if (!state.run) {
            return state;
          }

          const run = simulationRuntime.toggleDecision(state.run, decisionId);

          if (run === state.run) {
            return state;
          }

          return {
            run,
          };
        }),
      endTurn: () =>
        set((state) => {
          if (!state.run) {
            return state;
          }

          const run = simulationRuntime.resolveRound(state.run);

          if (run === state.run) {
            return state;
          }

          return {
            run,
          };
        }),
      clearRun: () => set({ run: null }),
      availableDecisions: () => {
        const run = get().run;

        if (!run) {
          return [];
        }

        return simulationRuntime.getAvailableDecisions(run).decisions;
      },
      currentEnding: () => {
        const run = get().run;

        return run ? simulationRuntime.getEnding(run) : null;
      },
    }),
    {
      name: GAME_SAVE_STORAGE_KEY,
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
