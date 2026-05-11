import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BoardPacket } from "../../components/board-packet/BoardPacket.js";
import { DecisionTray } from "../../components/decision-tray/DecisionTray.js";
import { EventFeed } from "../../components/event-feed/EventFeed.js";
import { useInteractionFeedback } from "../../components/interaction/useInteractionFeedback.js";
import { MetricRail } from "../../components/metrics/MetricRail.js";
import { useGameStore } from "../../simulation/state/gameStore.js";
import { EndingScreen } from "../ending/EndingScreen.js";
import styles from "./RunScreen.module.css";

interface SectionNavLinkProps {
  href: string;
  interactionEffectsEnabled: boolean;
  label: string;
}

function SectionNavLink({
  href,
  interactionEffectsEnabled,
  label,
}: SectionNavLinkProps) {
  const feedback = useInteractionFeedback<HTMLAnchorElement>(
    interactionEffectsEnabled,
  );

  return (
    <a
      href={href}
      className="interaction-feedback-control"
      data-interaction-feedback={feedback.feedbackState}
      onKeyDown={feedback.onFeedbackKeyDown}
      onPointerDown={feedback.onFeedbackPointerDown}
    >
      {label}
    </a>
  );
}

export function RunScreen() {
  const navigate = useNavigate();
  const run = useGameStore((state) => state.run);
  const settings = useGameStore((state) => state.settings);
  const availableDecisions = useGameStore((state) => state.availableDecisions);
  const toggleDecision = useGameStore((state) => state.toggleDecision);
  const endTurn = useGameStore((state) => state.endTurn);
  const interactionEffectsEnabled =
    settings.visualEffectsEnabled && settings.interactionEffectsEnabled;

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

  return (
    <section className={styles.layout} aria-label="Active run workspace">
      <nav className={styles.sectionNav} aria-label="Run sections">
        <SectionNavLink
          href="#board-packet"
          interactionEffectsEnabled={interactionEffectsEnabled}
          label="Brief"
        />
        <SectionNavLink
          href="#run-state"
          interactionEffectsEnabled={interactionEffectsEnabled}
          label="State"
        />
        <SectionNavLink
          href="#decision-tray"
          interactionEffectsEnabled={interactionEffectsEnabled}
          label="Decisions"
        />
        <SectionNavLink
          href="#consequence-feed"
          interactionEffectsEnabled={interactionEffectsEnabled}
          label="Feed"
        />
      </nav>

      <div id="run-state" className={styles.metricsArea}>
        <MetricRail metrics={run.metrics} />
      </div>

      <div id="board-packet" className={styles.boardArea}>
        <BoardPacket run={run} />
      </div>

      <div id="decision-tray" className={styles.decisionArea}>
        <DecisionTray
          decisions={availableDecisions()}
          selectedDecisionIds={run.selectedDecisionIds}
          onToggle={toggleDecision}
          onEndTurn={endTurn}
          interactionEffectsEnabled={interactionEffectsEnabled}
        />
      </div>

      <div id="consequence-feed" className={styles.feedArea}>
        <EventFeed history={run.history} />
      </div>
    </section>
  );
}
