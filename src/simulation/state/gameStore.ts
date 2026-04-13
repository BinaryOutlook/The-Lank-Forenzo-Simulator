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
import type {
  DecisionDefinition,
  EndingDefinition,
  RunState,
  ThemeName,
} from "./types";

interface GameStoreState {
  theme: ThemeName;
  run: RunState | null;
  setTheme: (theme: ThemeName) => void;
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
      run: null,
      setTheme: (theme) => set({ theme }),
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
        run: state.run,
      }),
    },
  ),
);
