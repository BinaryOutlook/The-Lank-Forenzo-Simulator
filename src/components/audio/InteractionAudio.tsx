import { useEffect, useRef } from "react";
import { useGameStore } from "../../simulation/state/gameStore.js";
import {
  createInteractionCuePlayer,
  canPlayInteractionCue,
} from "./interactionCueSynth.js";
import type {
  InteractionCuePlaybackSettings,
  InteractionCuePlayer,
} from "./interactionCueSynth.js";
import { subscribeToInteractionCues } from "./interactionAudioEvents.js";

export function InteractionAudio() {
  const musicEnabled = useGameStore((state) => state.settings.musicEnabled);
  const musicVolume = useGameStore((state) => state.settings.musicVolume);
  const soundEffectsEnabled = useGameStore(
    (state) => state.settings.soundEffectsEnabled,
  );
  const playerRef = useRef<InteractionCuePlayer | null>(null);
  const settingsRef = useRef<InteractionCuePlaybackSettings>({
    musicEnabled,
    musicVolume,
    soundEffectsEnabled,
  });

  if (!playerRef.current) {
    playerRef.current = createInteractionCuePlayer();
  }

  useEffect(() => {
    const nextSettings = {
      musicEnabled,
      musicVolume,
      soundEffectsEnabled,
    };

    settingsRef.current = nextSettings;

    if (!canPlayInteractionCue(nextSettings)) {
      playerRef.current?.dispose();
    }
  }, [musicEnabled, musicVolume, soundEffectsEnabled]);

  useEffect(() => {
    const unsubscribe = subscribeToInteractionCues((cue) => {
      playerRef.current?.play(cue, settingsRef.current);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(
    () => () => {
      playerRef.current?.dispose();
      playerRef.current = null;
    },
    [],
  );

  return null;
}
