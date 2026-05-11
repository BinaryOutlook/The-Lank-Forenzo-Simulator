import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEventHandler, PointerEventHandler } from "react";

const INTERACTION_FEEDBACK_DURATION_MS = 420;

type InteractionFeedbackState = "active" | undefined;

interface InteractionFeedbackBinding<TElement extends HTMLElement> {
  feedbackState: InteractionFeedbackState;
  onFeedbackKeyDown: KeyboardEventHandler<TElement>;
  onFeedbackPointerDown: PointerEventHandler<TElement>;
}

function isFeedbackKey(key: string): boolean {
  return key === "Enter" || key === " " || key === "Spacebar";
}

function requestFeedbackFrame(callback: FrameRequestCallback): number {
  if (typeof window.requestAnimationFrame === "function") {
    return window.requestAnimationFrame(callback);
  }

  return window.setTimeout(() => callback(performance.now()), 16);
}

function cancelFeedbackFrame(frameId: number): void {
  if (typeof window.cancelAnimationFrame === "function") {
    window.cancelAnimationFrame(frameId);
    return;
  }

  window.clearTimeout(frameId);
}

export function useInteractionFeedback<TElement extends HTMLElement>(
  enabled: boolean,
): InteractionFeedbackBinding<TElement> {
  const [isActive, setIsActive] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const clearFeedbackTimeout = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelFeedbackFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const triggerFeedback = useCallback(() => {
    if (!enabled) {
      return;
    }

    clearFeedbackTimeout();
    setIsActive(false);

    animationFrameRef.current = requestFeedbackFrame(() => {
      animationFrameRef.current = null;
      setIsActive(true);
      timeoutRef.current = window.setTimeout(() => {
        setIsActive(false);
        timeoutRef.current = null;
      }, INTERACTION_FEEDBACK_DURATION_MS);
    });
  }, [clearFeedbackTimeout, enabled]);

  const onFeedbackKeyDown = useCallback<KeyboardEventHandler<TElement>>(
    (event) => {
      if (isFeedbackKey(event.key)) {
        triggerFeedback();
      }
    },
    [triggerFeedback],
  );

  useEffect(() => {
    if (!enabled) {
      clearFeedbackTimeout();
      setIsActive(false);
    }
  }, [clearFeedbackTimeout, enabled]);

  useEffect(() => clearFeedbackTimeout, [clearFeedbackTimeout]);

  return {
    feedbackState: enabled && isActive ? "active" : undefined,
    onFeedbackKeyDown,
    onFeedbackPointerDown: triggerFeedback,
  };
}
