import clsx from "clsx";
import { useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import { useInteractionFeedback } from "../../components/interaction/useInteractionFeedback.js";
import { formatResourceCostSummary } from "../../simulation/systems/consumables.js";
import type {
  DecisionDefinition,
  ResourceCostSet,
} from "../../simulation/state/types.js";
import styles from "./EndRoundDialog.module.css";

export type EndRoundDialogMode = "incomplete" | "complete";

const dialogFocusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

interface EndRoundDialogProps {
  interactionEffectsEnabled: boolean;
  missingDecisionCount: number;
  mode: EndRoundDialogMode;
  recoveryOptions: DecisionDefinition[];
  selectedCost: ResourceCostSet;
  selectedDecisions: DecisionDefinition[];
  onConfirm: () => void;
  onDismiss: () => void;
  onReviewChoices: () => void;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(dialogFocusableSelector),
  ).filter((element) => !element.hasAttribute("disabled"));
}

function formatChoiceCount(count: number): string {
  return `${count} ${count === 1 ? "choice" : "choices"}`;
}

export function EndRoundDialog({
  interactionEffectsEnabled,
  missingDecisionCount,
  mode,
  recoveryOptions,
  selectedCost,
  selectedDecisions,
  onConfirm,
  onDismiss,
  onReviewChoices,
}: EndRoundDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const primaryActionRef = useRef<HTMLButtonElement>(null);
  const primaryFeedback = useInteractionFeedback<HTMLButtonElement>(
    interactionEffectsEnabled,
  );
  const secondaryFeedback = useInteractionFeedback<HTMLButtonElement>(
    interactionEffectsEnabled,
  );
  const closeFeedback = useInteractionFeedback<HTMLButtonElement>(
    interactionEffectsEnabled,
  );
  const titleId = "end-round-dialog-title";
  const descriptionId = "end-round-dialog-description";
  const isComplete = mode === "complete";

  useEffect(() => {
    primaryActionRef.current?.focus();
  }, []);

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onDismiss();
      return;
    }

    if (event.key !== "Tab" || !dialogRef.current) {
      return;
    }

    const focusableElements = getFocusableElements(dialogRef.current);

    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  return (
    <div className={styles.dialogBackdrop}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={styles.dialog}
        onKeyDown={handleDialogKeyDown}
      >
        <div className={styles.dialogHeader}>
          <p className={styles.dialogEyebrow}>Quarter review</p>
          <button
            type="button"
            className={clsx(
              "interaction-feedback-control",
              styles.dialogClose,
            )}
            data-interaction-feedback={closeFeedback.feedbackState}
            aria-label="Dismiss quarter review"
            onClick={onDismiss}
            onKeyDown={closeFeedback.onFeedbackKeyDown}
            onPointerDown={closeFeedback.onFeedbackPointerDown}
          >
            ×
          </button>
        </div>

        <h2 id={titleId} className={styles.dialogTitle}>
          {isComplete ? "Seal the quarter?" : "The tray is not locked yet."}
        </h2>

        <p id={descriptionId} className={styles.dialogCopy}>
          {isComplete
            ? "Advancing resolves these decisions and moves the board clock forward."
            : `${formatChoiceCount(
                missingDecisionCount,
              )} still required before the quarter can resolve.`}
        </p>

        {isComplete ? (
          <section
            className={styles.dialogSection}
            aria-labelledby="end-round-summary-title"
          >
            <h3
              id="end-round-summary-title"
              className={styles.dialogSectionTitle}
            >
              Selected decisions
            </h3>
            <ol className={styles.dialogDecisionList}>
              {selectedDecisions.map((decision) => (
                <li key={decision.id} className={styles.dialogDecisionItem}>
                  <strong>{decision.title}</strong>
                  <span>{decision.group}</span>
                </li>
              ))}
            </ol>
            <p className={styles.dialogCost}>
              Reserve spend: {formatResourceCostSummary(selectedCost)}.
            </p>
          </section>
        ) : (
          <section
            className={styles.dialogSection}
            aria-labelledby="end-round-recovery-title"
          >
            <h3
              id="end-round-recovery-title"
              className={styles.dialogSectionTitle}
            >
              Recovery path
            </h3>
            <p className={styles.dialogCopy}>
              Your current selection stays queued. Return to the decision tray
              and pick the remaining {formatChoiceCount(missingDecisionCount)}
              before closing the quarter.
            </p>
            {recoveryOptions.length > 0 ? (
              <ul
                className={styles.dialogOptionList}
                aria-label="Available unselected decisions"
              >
                {recoveryOptions.map((decision) => (
                  <li key={decision.id}>{decision.title}</li>
                ))}
              </ul>
            ) : null}
          </section>
        )}

        <div className={styles.dialogActions}>
          <button
            ref={primaryActionRef}
            type="button"
            className={clsx(
              "interaction-feedback-control",
              styles.dialogPrimaryAction,
            )}
            data-interaction-feedback={primaryFeedback.feedbackState}
            onClick={isComplete ? onConfirm : onReviewChoices}
            onKeyDown={primaryFeedback.onFeedbackKeyDown}
            onPointerDown={primaryFeedback.onFeedbackPointerDown}
          >
            {isComplete ? "Resolve quarter" : "Back to decision tray"}
          </button>
          <button
            type="button"
            className={clsx(
              "interaction-feedback-control",
              styles.dialogSecondaryAction,
            )}
            data-interaction-feedback={secondaryFeedback.feedbackState}
            onClick={onDismiss}
            onKeyDown={secondaryFeedback.onFeedbackKeyDown}
            onPointerDown={secondaryFeedback.onFeedbackPointerDown}
          >
            Keep reviewing
          </button>
        </div>
      </div>
    </div>
  );
}
