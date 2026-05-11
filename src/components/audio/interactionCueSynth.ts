import type { GameSettings } from "../../simulation/state/settings.js";
import { createBrowserAudioContext } from "./webAudio.js";
import type { InteractionCueName } from "./interactionAudioEvents.js";

export type InteractionCuePlaybackSettings = Pick<
  GameSettings,
  "musicEnabled" | "musicVolume" | "soundEffectsEnabled"
>;

interface NoteShape {
  frequency: number;
  start: number;
  duration: number;
  gain: number;
  type: OscillatorType;
}

interface CueDefinition {
  filterFrequency: number;
  filterQ: number;
  minIntervalMs: number;
  notes: readonly NoteShape[];
}

interface InteractionCuePlayerOptions {
  createContext?: () => AudioContext | null;
  now?: () => number;
}

export interface InteractionCuePlayer {
  play: (
    cue: InteractionCueName,
    settings: InteractionCuePlaybackSettings,
  ) => boolean;
  dispose: () => void;
}

const cueDefinitions = {
  "decision-select": {
    filterFrequency: 1320,
    filterQ: 0.9,
    minIntervalMs: 70,
    notes: [
      {
        frequency: 164.81,
        start: 0,
        duration: 0.11,
        gain: 0.78,
        type: "triangle",
      },
      {
        frequency: 246.94,
        start: 0.055,
        duration: 0.12,
        gain: 0.58,
        type: "sine",
      },
    ],
  },
  "decision-deselect": {
    filterFrequency: 980,
    filterQ: 0.8,
    minIntervalMs: 70,
    notes: [
      {
        frequency: 246.94,
        start: 0,
        duration: 0.09,
        gain: 0.58,
        type: "sine",
      },
      {
        frequency: 146.83,
        start: 0.045,
        duration: 0.12,
        gain: 0.66,
        type: "triangle",
      },
    ],
  },
  "quarter-resolve": {
    filterFrequency: 760,
    filterQ: 1.1,
    minIntervalMs: 190,
    notes: [
      {
        frequency: 110,
        start: 0,
        duration: 0.21,
        gain: 0.92,
        type: "triangle",
      },
      {
        frequency: 164.81,
        start: 0.075,
        duration: 0.23,
        gain: 0.7,
        type: "sine",
      },
      {
        frequency: 220,
        start: 0.15,
        duration: 0.2,
        gain: 0.5,
        type: "sine",
      },
    ],
  },
  "panel-open": {
    filterFrequency: 1160,
    filterQ: 0.75,
    minIntervalMs: 120,
    notes: [
      {
        frequency: 123.47,
        start: 0,
        duration: 0.13,
        gain: 0.46,
        type: "triangle",
      },
      {
        frequency: 185,
        start: 0.045,
        duration: 0.12,
        gain: 0.42,
        type: "sine",
      },
    ],
  },
  "panel-close": {
    filterFrequency: 920,
    filterQ: 0.7,
    minIntervalMs: 120,
    notes: [
      {
        frequency: 185,
        start: 0,
        duration: 0.12,
        gain: 0.42,
        type: "sine",
      },
      {
        frequency: 123.47,
        start: 0.04,
        duration: 0.13,
        gain: 0.46,
        type: "triangle",
      },
    ],
  },
  "ending-reached": {
    filterFrequency: 700,
    filterQ: 1.2,
    minIntervalMs: 500,
    notes: [
      {
        frequency: 82.41,
        start: 0,
        duration: 0.32,
        gain: 0.82,
        type: "triangle",
      },
      {
        frequency: 123.47,
        start: 0.12,
        duration: 0.34,
        gain: 0.64,
        type: "sine",
      },
      {
        frequency: 185,
        start: 0.24,
        duration: 0.3,
        gain: 0.5,
        type: "sine",
      },
    ],
  },
} satisfies Record<InteractionCueName, CueDefinition>;

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function getCuePeakGain(volume: number): number {
  return (clampPercent(volume) / 100) * 0.065;
}

function getTimeMs(): number {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}

export function canPlayInteractionCue(
  settings: InteractionCuePlaybackSettings,
): boolean {
  return (
    settings.musicEnabled &&
    settings.soundEffectsEnabled &&
    clampPercent(settings.musicVolume) > 0
  );
}

function disconnectSafely(node: { disconnect: () => void }): void {
  try {
    node.disconnect();
  } catch {
    return undefined;
  }
}

function resumeContext(context: AudioContext): void {
  if (context.state === "suspended") {
    void context.resume().catch(() => undefined);
  }
}

function scheduleCue(
  context: AudioContext,
  masterGain: GainNode,
  definition: CueDefinition,
  volume: number,
): void {
  const cueStart = context.currentTime + 0.004;
  const peakGain = getCuePeakGain(volume);
  const filter = context.createBiquadFilter();
  const longestNote = Math.max(
    ...definition.notes.map((note) => note.start + note.duration),
  );

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(definition.filterFrequency, cueStart);
  filter.Q.setValueAtTime(definition.filterQ, cueStart);
  filter.connect(masterGain);

  definition.notes.forEach((note) => {
    const oscillator = context.createOscillator();
    const noteGain = context.createGain();
    const noteStart = cueStart + note.start;
    const attackEnd = noteStart + 0.012;
    const releaseEnd = noteStart + note.duration;

    oscillator.type = note.type;
    oscillator.frequency.setValueAtTime(note.frequency, noteStart);
    noteGain.gain.setValueAtTime(0.0001, noteStart);
    noteGain.gain.linearRampToValueAtTime(peakGain * note.gain, attackEnd);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, releaseEnd);
    oscillator.connect(noteGain);
    noteGain.connect(filter);
    oscillator.start(noteStart);
    oscillator.stop(releaseEnd + 0.025);
    oscillator.onended = () => {
      disconnectSafely(oscillator);
      disconnectSafely(noteGain);
    };
  });

  globalThis.setTimeout(() => {
    disconnectSafely(filter);
  }, Math.ceil((longestNote + 0.08) * 1000));
}

export function createInteractionCuePlayer(
  options: InteractionCuePlayerOptions = {},
): InteractionCuePlayer {
  const createContext = options.createContext ?? createBrowserAudioContext;
  const getNow = options.now ?? getTimeMs;
  const lastPlayTimes = new Map<InteractionCueName, number>();
  let context: AudioContext | null = null;
  let masterGain: GainNode | null = null;

  function ensureGraph(): { context: AudioContext; masterGain: GainNode } | null {
    if (context && masterGain && context.state !== "closed") {
      resumeContext(context);

      return { context, masterGain };
    }

    const nextContext = createContext();

    if (!nextContext) {
      return null;
    }

    const nextMasterGain = nextContext.createGain();
    nextMasterGain.gain.value = 1;
    nextMasterGain.connect(nextContext.destination);
    resumeContext(nextContext);
    context = nextContext;
    masterGain = nextMasterGain;

    return { context, masterGain };
  }

  return {
    play: (cue, settings) => {
      if (!canPlayInteractionCue(settings)) {
        return false;
      }

      const definition = cueDefinitions[cue];
      const currentTime = getNow();
      const lastPlayedAt = lastPlayTimes.get(cue) ?? Number.NEGATIVE_INFINITY;

      if (currentTime - lastPlayedAt < definition.minIntervalMs) {
        return false;
      }

      const graph = ensureGraph();

      if (!graph) {
        return false;
      }

      lastPlayTimes.set(cue, currentTime);
      scheduleCue(
        graph.context,
        graph.masterGain,
        definition,
        settings.musicVolume,
      );

      return true;
    },
    dispose: () => {
      const contextToClose = context;
      const gainToDisconnect = masterGain;

      context = null;
      masterGain = null;
      lastPlayTimes.clear();

      if (gainToDisconnect) {
        disconnectSafely(gainToDisconnect);
      }

      if (contextToClose && contextToClose.state !== "closed") {
        void contextToClose.close().catch(() => undefined);
      }
    },
  };
}
