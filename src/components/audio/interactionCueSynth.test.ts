import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createInteractionCuePlayer } from "./interactionCueSynth.js";
import type { InteractionCuePlaybackSettings } from "./interactionCueSynth.js";

interface AudioParamEvent {
  method: string;
  value: number;
  time: number;
}

const enabledSettings: InteractionCuePlaybackSettings = {
  musicEnabled: true,
  musicVolume: 50,
  soundEffectsEnabled: true,
};

class FakeAudioParam {
  value: number;
  events: AudioParamEvent[] = [];

  constructor(value = 0) {
    this.value = value;
  }

  setValueAtTime(value: number, time: number): FakeAudioParam {
    this.value = value;
    this.events.push({ method: "set", value, time });

    return this;
  }

  linearRampToValueAtTime(value: number, time: number): FakeAudioParam {
    this.value = value;
    this.events.push({ method: "linear", value, time });

    return this;
  }

  exponentialRampToValueAtTime(value: number, time: number): FakeAudioParam {
    this.value = value;
    this.events.push({ method: "exponential", value, time });

    return this;
  }
}

class FakeAudioNode {
  disconnectCount = 0;

  connect(): FakeAudioNode {
    return this;
  }

  disconnect(): void {
    this.disconnectCount += 1;
  }
}

class FakeGainNode extends FakeAudioNode {
  gain = new FakeAudioParam(1);
}

class FakeBiquadFilterNode extends FakeAudioNode {
  type: BiquadFilterType = "lowpass";
  frequency = new FakeAudioParam();
  Q = new FakeAudioParam();
}

class FakeOscillatorNode extends FakeAudioNode {
  type: OscillatorType = "sine";
  frequency = new FakeAudioParam();
  starts: number[] = [];
  stops: number[] = [];
  onended: (() => void) | null = null;

  start(time?: number): void {
    this.starts.push(time ?? 0);
  }

  stop(time?: number): void {
    this.stops.push(time ?? 0);
  }
}

class FakeAudioContext {
  currentTime = 2;
  state: AudioContextState = "running";
  destination = new FakeAudioNode();
  oscillators: FakeOscillatorNode[] = [];
  gainNodes: FakeGainNode[] = [];
  filters: FakeBiquadFilterNode[] = [];

  createGain(): GainNode {
    const node = new FakeGainNode();
    this.gainNodes.push(node);

    return node as unknown as GainNode;
  }

  createBiquadFilter(): BiquadFilterNode {
    const node = new FakeBiquadFilterNode();
    this.filters.push(node);

    return node as unknown as BiquadFilterNode;
  }

  createOscillator(): OscillatorNode {
    const node = new FakeOscillatorNode();
    this.oscillators.push(node);

    return node as unknown as OscillatorNode;
  }

  resume(): Promise<void> {
    this.state = "running";

    return Promise.resolve();
  }

  close(): Promise<void> {
    this.state = "closed";

    return Promise.resolve();
  }
}

function readFirstFrequency(oscillator: FakeOscillatorNode): number {
  const frequencyEvent = oscillator.frequency.events.find(
    (event) => event.method === "set",
  );

  if (!frequencyEvent) {
    throw new Error("Expected oscillator frequency to be scheduled");
  }

  return frequencyEvent.value;
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe("interaction cue synthesis", () => {
  it("does not create an audio context when music is disabled", () => {
    let createdContexts = 0;
    const player = createInteractionCuePlayer({
      createContext: () => {
        createdContexts += 1;

        return new FakeAudioContext() as unknown as AudioContext;
      },
    });

    expect(
      player.play("decision-select", {
        ...enabledSettings,
        musicEnabled: false,
      }),
    ).toBe(false);
    expect(createdContexts).toBe(0);
  });

  it("does not create an audio context when sound effects are disabled", () => {
    let createdContexts = 0;
    const player = createInteractionCuePlayer({
      createContext: () => {
        createdContexts += 1;

        return new FakeAudioContext() as unknown as AudioContext;
      },
    });

    expect(
      player.play("quarter-resolve", {
        ...enabledSettings,
        soundEffectsEnabled: false,
      }),
    ).toBe(false);
    expect(createdContexts).toBe(0);
  });

  it("schedules distinct motifs for decision selection and quarter resolution", () => {
    const context = new FakeAudioContext();
    const player = createInteractionCuePlayer({
      createContext: () => context as unknown as AudioContext,
    });

    expect(player.play("decision-select", enabledSettings)).toBe(true);
    const decisionFrequencies = context.oscillators.map(readFirstFrequency);

    expect(player.play("quarter-resolve", enabledSettings)).toBe(true);
    const quarterFrequencies = context.oscillators
      .slice(decisionFrequencies.length)
      .map(readFirstFrequency);

    expect(decisionFrequencies).toEqual([164.81, 246.94]);
    expect(quarterFrequencies).toEqual([110, 164.81, 220]);
  });

  it("throttles repeated cues so rapid clicks do not stack endlessly", () => {
    let now = 1_000;
    const context = new FakeAudioContext();
    const player = createInteractionCuePlayer({
      createContext: () => context as unknown as AudioContext,
      now: () => now,
    });

    expect(player.play("decision-select", enabledSettings)).toBe(true);
    expect(player.play("decision-select", enabledSettings)).toBe(false);
    expect(context.oscillators).toHaveLength(2);

    now += 75;

    expect(player.play("decision-select", enabledSettings)).toBe(true);
    expect(context.oscillators).toHaveLength(4);
  });
});
