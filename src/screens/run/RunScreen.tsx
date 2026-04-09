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
    <section className={styles.layout}>
      <MetricRail metrics={run.metrics} />

      <div className={styles.centerColumn}>
        <BoardPacket run={run} />
        <DecisionTray
          decisions={availableDecisions()}
          selectedDecisionIds={run.selectedDecisionIds}
          onToggle={toggleDecision}
          onEndTurn={endTurn}
        />
      </div>

      <EventFeed history={run.history} />
    </section>
  );
}
