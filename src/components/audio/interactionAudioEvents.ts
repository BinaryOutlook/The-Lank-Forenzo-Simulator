export const interactionCueNames = [
  "decision-select",
  "decision-deselect",
  "quarter-resolve",
  "panel-open",
  "panel-close",
  "ending-reached",
] as const;

export type InteractionCueName = (typeof interactionCueNames)[number];

export type InteractionCueListener = (cue: InteractionCueName) => void;

export interface InteractionCueBus {
  emit: (cue: InteractionCueName) => void;
  subscribe: (listener: InteractionCueListener) => () => void;
}

export function createInteractionCueBus(): InteractionCueBus {
  const listeners = new Set<InteractionCueListener>();

  return {
    emit: (cue) => {
      [...listeners].forEach((listener) => {
        try {
          listener(cue);
        } catch {
          return undefined;
        }
      });
    },
    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export const interactionCueBus = createInteractionCueBus();

export function emitInteractionCue(cue: InteractionCueName): void {
  interactionCueBus.emit(cue);
}

export function subscribeToInteractionCues(
  listener: InteractionCueListener,
): () => void {
  return interactionCueBus.subscribe(listener);
}
