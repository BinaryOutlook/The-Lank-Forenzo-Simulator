import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BoardPacket } from "../../components/board-packet/BoardPacket";
import { DecisionTray } from "../../components/decision-tray/DecisionTray";
import { EventFeed } from "../../components/event-feed/EventFeed";
import { MetricRail } from "../../components/metrics/MetricRail";
import { useGameStore } from "../../simulation/state/gameStore";
import { EndingScreen } from "../ending/EndingScreen";
import styles from "./RunScreen.module.css";

export function RunScreen() {
  const navigate = useNavigate();
  const run = useGameStore((state) => state.run);
  const availableDecisions = useGameStore((state) => state.availableDecisions);
  const toggleDecision = useGameStore((state) => state.toggleDecision);
  const endTurn = useGameStore((state) => state.endTurn);

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
        <a href="#board-packet">Brief</a>
        <a href="#run-state">State</a>
        <a href="#decision-tray">Decisions</a>
        <a href="#consequence-feed">Feed</a>
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
        />
      </div>

      <div id="consequence-feed" className={styles.feedArea}>
        <EventFeed history={run.history} />
      </div>
    </section>
  );
}
