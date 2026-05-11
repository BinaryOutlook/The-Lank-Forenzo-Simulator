import { useEffect, useRef } from "react";
import { useGameStore } from "../../simulation/state/gameStore.js";

interface AmbientMusicGraph {
  context: AudioContext;
  filter: BiquadFilterNode;
  gain: GainNode;
  oscillators: OscillatorNode[];
}

type AudioContextConstructor = new () => AudioContext;

interface WebAudioWindow extends Window {
  AudioContext?: AudioContextConstructor;
  webkitAudioContext?: AudioContextConstructor;
}

function getAudioContextConstructor(): AudioContextConstructor | null {
  if (typeof window === "undefined") {
    return null;
  }

  const audioWindow = window as WebAudioWindow;

  return audioWindow.AudioContext ?? audioWindow.webkitAudioContext ?? null;
}

function getMusicGain(volume: number): number {
  return Math.min(1, Math.max(0, volume / 100)) * 0.045;
}

function setGraphVolume(graph: AmbientMusicGraph, volume: number): void {
  const nextGain = getMusicGain(volume);

  graph.gain.gain.setTargetAtTime(
    nextGain,
    graph.context.currentTime,
    0.12,
  );
}

function createAmbientGraph(volume: number): AmbientMusicGraph | null {
  const AudioContextConstructor = getAudioContextConstructor();

  if (!AudioContextConstructor) {
    return null;
  }

  try {
    const context = new AudioContextConstructor();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const frequencies = [82.41, 123.47, 164.81];
    const oscillators = frequencies.map((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.frequency.value = frequency;
      oscillator.type = index === 0 ? "sine" : "triangle";
      oscillator.connect(filter);
      oscillator.start();

      return oscillator;
    });

    filter.type = "lowpass";
    filter.frequency.value = 560;
    filter.Q.value = 0.8;
    filter.connect(gain);
    gain.gain.value = getMusicGain(volume);
    gain.connect(context.destination);

    if (context.state === "suspended") {
      void context.resume().catch(() => undefined);
    }

    return {
      context,
      filter,
      gain,
      oscillators,
    };
  } catch {
    return null;
  }
}

function stopAmbientGraph(graph: AmbientMusicGraph | null): void {
  if (!graph) {
    return;
  }

  graph.oscillators.forEach((oscillator) => {
    try {
      oscillator.stop();
      oscillator.disconnect();
    } catch {
      return undefined;
    }
  });

  try {
    graph.filter.disconnect();
    graph.gain.disconnect();
  } catch {
    return undefined;
  }

  void graph.context.close().catch(() => undefined);
}

export function AmbientMusic() {
  const musicEnabled = useGameStore((state) => state.settings.musicEnabled);
  const musicVolume = useGameStore((state) => state.settings.musicVolume);
  const graphRef = useRef<AmbientMusicGraph | null>(null);
  const volumeRef = useRef(musicVolume);

  useEffect(() => {
    if (!musicEnabled) {
      stopAmbientGraph(graphRef.current);
      graphRef.current = null;

      return undefined;
    }

    const graph = createAmbientGraph(volumeRef.current);
    graphRef.current = graph;

    return () => {
      stopAmbientGraph(graphRef.current);
      graphRef.current = null;
    };
  }, [musicEnabled]);

  useEffect(() => {
    volumeRef.current = musicVolume;

    if (graphRef.current) {
      setGraphVolume(graphRef.current, musicVolume);
    }
  }, [musicVolume]);

  return null;
}
