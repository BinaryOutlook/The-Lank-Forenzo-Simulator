import { motion } from "framer-motion";
import clsx from "clsx";
import { formatDelta, getImpactPreview, metricLabels } from "../../lib/formatters";
import type { DecisionDefinition } from "../../simulation/state/types";
import styles from "./DecisionTray.module.css";

interface DecisionTrayProps {
  decisions: DecisionDefinition[];
  selectedDecisionIds: string[];
  onToggle: (decisionId: string) => void;
  onEndTurn: () => void;
}

export function DecisionTray({
  decisions,
  selectedDecisionIds,
  onToggle,
  onEndTurn,
}: DecisionTrayProps) {
  return (
    <section className={styles.tray}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Decision tray</p>
          <h2 className={styles.title}>Choose where the pain goes next.</h2>
        </div>

        <div className={styles.controls}>
          <p className={styles.selectionCount}>{selectedDecisionIds.length}/2 selected</p>
          <button type="button" className={styles.resolveButton} onClick={onEndTurn}>
            {selectedDecisionIds.length > 0 ? "Resolve the quarter" : "Hold the line"}
          </button>
        </div>
      </div>

      <div className={styles.list}>
        {decisions.map((decision, index) => {
          const selected = selectedDecisionIds.includes(decision.id);
          const preview = getImpactPreview(decision.impacts);

          return (
            <motion.button
              key={decision.id}
              type="button"
              className={clsx(styles.card, selected && styles.cardSelected)}
              onClick={() => onToggle(decision.id)}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.28 }}
            >
              <div className={styles.cardHeader}>
                <span className={styles.group}>{decision.group}</span>
                <span className={styles.tags}>{decision.tags.slice(0, 2).join(" / ")}</span>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{decision.title}</h3>
                <p className={styles.cardSummary}>{decision.summary}</p>
              </div>

              <div className={styles.previewList}>
                {preview.map((entry) => (
                  <span
                    key={`${decision.id}-${entry.metric}`}
                    className={clsx(entry.delta > 0 ? styles.previewPositive : styles.previewNegative)}
                  >
                    {metricLabels[entry.metric]} {formatDelta(entry.metric, entry.delta)}
                  </span>
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
