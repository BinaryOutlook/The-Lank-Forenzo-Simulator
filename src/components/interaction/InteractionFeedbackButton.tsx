import clsx from "clsx";
import type {
  ButtonHTMLAttributes,
  KeyboardEventHandler,
  PointerEventHandler,
} from "react";
import { useInteractionFeedback } from "./useInteractionFeedback.js";

interface InteractionFeedbackButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  feedbackEnabled: boolean;
}

export function InteractionFeedbackButton({
  children,
  className,
  disabled = false,
  feedbackEnabled,
  onKeyDown,
  onPointerDown,
  type = "button",
  ...props
}: InteractionFeedbackButtonProps) {
  const feedback = useInteractionFeedback<HTMLButtonElement>(
    feedbackEnabled && !disabled,
  );

  const handlePointerDown: PointerEventHandler<HTMLButtonElement> = (event) => {
    feedback.onFeedbackPointerDown(event);
    onPointerDown?.(event);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLButtonElement> = (event) => {
    feedback.onFeedbackKeyDown(event);
    onKeyDown?.(event);
  };

  return (
    <button
      {...props}
      type={type}
      className={clsx("interaction-feedback-control", className)}
      data-interaction-feedback={feedback.feedbackState}
      disabled={disabled}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
    >
      {children}
    </button>
  );
}
