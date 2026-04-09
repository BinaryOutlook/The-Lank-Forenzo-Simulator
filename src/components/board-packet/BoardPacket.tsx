import { motion } from "framer-motion";
import { summarizeRun } from "../../lib/formatters";
import { buildBriefingSignals } from "../../simulation/systems/briefing";
import type { RunState } from "../../simulation/state/types";
import styles from "./BoardPacket.module.css";

interface BoardPacketProps {
  run: RunState;
}

export function BoardPacket({ run }: BoardPacketProps) {
  const signals = buildBriefingSignals(run);

  return (
    <section className={styles.packet}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Board packet</p>
        <h1 className={styles.title}>Temporary credibility is still the most valuable asset on the table.</h1>
        <p className={styles.summary}>{summarizeRun(run.metrics)}</p>
      </div>

      <div className={styles.columns}>
        <div className={styles.memo}>
          <p className={styles.memoLabel}>This round</p>
          <p className={styles.memoBody}>
            Strip value without letting the room agree that this is what you are doing. Keep lenders, analysts,
            and regulators from arriving at the same conclusion at the same time.
          </p>
        </div>

        <div className={styles.signals}>
          {signals.map((signal, index) => (
            <motion.article
              key={signal.title}
              className={styles.signal}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.35 }}
            >
              <p className={styles.signalTitle}>{signal.title}</p>
              <p className={styles.signalBody}>{signal.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
