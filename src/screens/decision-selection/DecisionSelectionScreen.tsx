import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { emitInteractionCue } from "../../components/audio/interactionAudioEvents.js";
import {
  DecisionTray,
  REQUIRED_ROUND_DECISION_COUNT,
} from "../../components/decision-tray/DecisionTray.js";
import { useInteractionFeedback } from "../../components/interaction/useInteractionFeedback.js";
import {
  canAffordResourceCosts,
  getDecisionSelectionCost,
} from "../../simulation/systems/consumables.js";
import { useGameStore } from "../../simulation/state/gameStore.js";
import { EndingScreen } from "../ending/EndingScreen.js";
import {
  EndRoundDialog,
  type EndRoundDialogMode,
} from "../run/EndRoundDialog.js";
import styles from "./DecisionSelectionScreen.module.css";

export function DecisionSelectionScreen() {
  const navigate = useNavigate();
  const run = useGameStore((state) => state.run);
  const settings = useGameStore((state) => state.settings);
  const availableDecisions = useGameStore((state) => state.availableDecisions);
  const toggleDecision = useGameStore((state) => state.toggleDecision);
  const endTurn = useGameStore((state) => state.endTurn);
  const [endRoundDialogMode, setEndRoundDialogMode] =
    useState<EndRoundDialogMode | null>(null);
  const interactionEffectsEnabled =
    settings.visualEffectsEnabled && settings.interactionEffectsEnabled;
  const backLinkFeedback = useInteractionFeedback<HTMLAnchorElement>(
    interactionEffectsEnabled,
  );
  const loadLinkFeedback = useInteractionFeedback<HTMLAnchorElement>(
    interactionEffectsEnabled,
  );

  useEffect(() => {
    if (!run) {
      navigate("/", { replace: true });
    }
  }, [navigate, run]);

  if (!run) {
    return null;
  }

  if (run.status === "ended") {
    return <EndingScreen />;
  }

  const decisions = availableDecisions();
  const selectedDecisions = decisions.filter((decision) =>
    run.selectedDecisionIds.includes(decision.id),
  );
  const selectedCost = getDecisionSelectionCost(selectedDecisions);
  const missingDecisionCount = Math.max(
    0,
    REQUIRED_ROUND_DECISION_COUNT - selectedDecisions.length,
  );
  const recoveryOptions = decisions
    .filter((decision) => {
      if (run.selectedDecisionIds.includes(decision.id)) {
        return false;
      }

      const candidateCost = getDecisionSelectionCost([
        ...selectedDecisions,
        decision,
      ]);

      return canAffordResourceCosts(run.resources, candidateCost);
    })
    .slice(0, 3);
  const restoreEndRoundControlFocus = () => {
    window.requestAnimationFrame(() => {
      document
        .querySelector<HTMLButtonElement>("[data-end-round-control='true']")
        ?.focus();
    });
  };
  const focusDecisionSelection = () => {
    setEndRoundDialogMode(null);

    window.requestAnimationFrame(() => {
      document
        .querySelector<HTMLButtonElement>(
          "button[aria-pressed='false']:not(:disabled)",
        )
        ?.focus();
    });
  };
  const closeEndRoundDialog = () => {
    setEndRoundDialogMode(null);
    restoreEndRoundControlFocus();
  };
  const handleEndRoundRequest = () => {
    setEndRoundDialogMode(
      selectedDecisions.length >= REQUIRED_ROUND_DECISION_COUNT
        ? "complete"
        : "incomplete",
    );
  };
  const handleConfirmEndTurn = () => {
    setEndRoundDialogMode(null);
    emitInteractionCue("quarter-resolve");
    endTurn();
    navigate("/run");
  };

  return (
    <section className={styles.page} aria-label="Decision selection phase">
      <motion.header
        className={styles.masthead}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Round {run.round} decision phase</p>
          <h1 className={styles.title}>Select the quarter's damage.</h1>
          <p className={styles.summary}>
            The board packet can wait. Compare all {decisions.length} available
            options with room for reserve costs, consequences, and the ugly
            arithmetic of choosing up to two.
          </p>
        </div>

        <div className={styles.mastheadActions}>
          <Link
            className={`interaction-feedback-control ${styles.backLink}`}
            data-interaction-feedback={backLinkFeedback.feedbackState}
            to="/run"
            onKeyDown={backLinkFeedback.onFeedbackKeyDown}
            onPointerDown={backLinkFeedback.onFeedbackPointerDown}
          >
            Return to board
          </Link>
          <Link
            className={`interaction-feedback-control ${styles.backLink}`}
            data-interaction-feedback={loadLinkFeedback.feedbackState}
            to="/load"
            onKeyDown={loadLinkFeedback.onFeedbackKeyDown}
            onPointerDown={loadLinkFeedback.onFeedbackPointerDown}
          >
            Load manager
          </Link>
        </div>
      </motion.header>

      <DecisionTray
        decisions={decisions}
        eyebrow="Decision ledger"
        interactionEffectsEnabled={interactionEffectsEnabled}
        resources={run.resources}
        selectedDecisionIds={run.selectedDecisionIds}
        summary="Select or deselect cards directly. The reserve ledger and selected count stay pinned while you inspect the consequences."
        surface="selection"
        title="Compare every option before the minutes harden."
        onToggle={toggleDecision}
        resolveCue={null}
        onEndTurn={handleEndRoundRequest}
      />

      {endRoundDialogMode ? (
        <EndRoundDialog
          interactionEffectsEnabled={interactionEffectsEnabled}
          missingDecisionCount={missingDecisionCount}
          mode={endRoundDialogMode}
          recoveryOptions={recoveryOptions}
          selectedCost={selectedCost}
          selectedDecisions={selectedDecisions}
          onConfirm={handleConfirmEndTurn}
          onDismiss={closeEndRoundDialog}
          onReviewChoices={focusDecisionSelection}
        />
      ) : null}
    </section>
  );
}
