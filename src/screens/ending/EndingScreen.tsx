import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { formatMetricValue } from "../../lib/formatters";
import { useGameStore } from "../../simulation/state/gameStore";
import styles from "./EndingScreen.module.css";

export function EndingScreen() {
  const navigate = useNavigate();
  const run = useGameStore((state) => state.run);
  const currentEnding = useGameStore((state) => state.currentEnding);
  const startNewRun = useGameStore((state) => state.startNewRun);
  const clearRun = useGameStore((state) => state.clearRun);

  const ending = currentEnding();

  if (!run || !ending) {
    return null;
  }

  return (
    <motion.section
      className={styles.page}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className={styles.panel}>
        <p className={styles.eyebrow}>Outcome</p>
        <h1 className={styles.title}>{ending.title}</h1>
        <p className={styles.subtitle}>{ending.subtitle}</p>
        <p className={styles.summary}>{ending.summary}</p>

        <div className={styles.snapshot}>
          <div>
            <span>Personal wealth</span>
            <strong>{formatMetricValue("personalWealth", run.metrics.personalWealth)}</strong>
          </div>
          <div>
            <span>Legal heat</span>
            <strong>{formatMetricValue("legalHeat", run.metrics.legalHeat)}</strong>
          </div>
          <div>
            <span>Market confidence</span>
            <strong>{formatMetricValue("marketConfidence", run.metrics.marketConfidence)}</strong>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryAction}
            onClick={() => {
              startNewRun();
              navigate("/run");
            }}
          >
            Start another run
          </button>

          <button
            type="button"
            className={styles.secondaryAction}
            onClick={() => {
              clearRun();
              navigate("/");
            }}
          >
            Return to lobby
          </button>
        </div>
      </div>
    </motion.section>
  );
}
