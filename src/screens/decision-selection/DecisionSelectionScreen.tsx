import { motion } from "framer-motion";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DecisionTray } from "../../components/decision-tray/DecisionTray.js";
import { useInteractionFeedback } from "../../components/interaction/useInteractionFeedback.js";
import { useGameStore } from "../../simulation/state/gameStore.js";
import { EndingScreen } from "../ending/EndingScreen.js";
import styles from "./DecisionSelectionScreen.module.css";

export function DecisionSelectionScreen() {
  const navigate = useNavigate();
  const run = useGameStore((state) => state.run);
  const settings = useGameStore((state) => state.settings);
  const availableDecisions = useGameStore((state) => state.availableDecisions);
  const toggleDecision = useGameStore((state) => state.toggleDecision);
  const endTurn = useGameStore((state) => state.endTurn);
  const interactionEffectsEnabled =
    settings.visualEffectsEnabled && settings.interactionEffectsEnabled;
  const backLinkFeedback = useInteractionFeedback<HTMLAnchorElement>(
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
  const handleEndTurn = () => {
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

        <Link
          className={`interaction-feedback-control ${styles.backLink}`}
          data-interaction-feedback={backLinkFeedback.feedbackState}
          to="/run"
          onKeyDown={backLinkFeedback.onFeedbackKeyDown}
          onPointerDown={backLinkFeedback.onFeedbackPointerDown}
        >
          Return to board
        </Link>
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
        onEndTurn={handleEndTurn}
      />
    </section>
  );
}
