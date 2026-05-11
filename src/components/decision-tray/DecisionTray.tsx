import { motion } from "framer-motion";
import clsx from "clsx";
import {
  formatDelta,
  getImpactPreview,
  metricLabels,
} from "../../lib/formatters.js";
import { useInteractionFeedback } from "../interaction/useInteractionFeedback.js";
import { getImpactTone } from "../../simulation/state/metricSemantics.js";
import type { DecisionDefinition } from "../../simulation/state/types.js";
import styles from "./DecisionTray.module.css";

interface DecisionTrayProps {
  decisions: DecisionDefinition[];
  selectedDecisionIds: string[];
  onToggle: (decisionId: string) => void;
  onEndTurn: () => void;
  interactionEffectsEnabled?: boolean;
}

interface DecisionCardProps {
  decision: DecisionDefinition;
  index: number;
  interactionEffectsEnabled: boolean;
  selected: boolean;
  onToggle: (decisionId: string) => void;
}

function DecisionCard({
  decision,
  index,
  interactionEffectsEnabled,
  selected,
  onToggle,
}: DecisionCardProps) {
  const feedback = useInteractionFeedback<HTMLButtonElement>(
    interactionEffectsEnabled,
  );
  const preview = getImpactPreview(decision.impacts);

  return (
    <motion.button
      type="button"
      className={clsx(
        "interaction-feedback-control",
        styles.card,
        selected && styles.cardSelected,
      )}
      data-interaction-feedback={feedback.feedbackState}
      aria-pressed={selected}
      onClick={() => onToggle(decision.id)}
      onKeyDown={feedback.onFeedbackKeyDown}
      onPointerDown={feedback.onFeedbackPointerDown}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.28 }}
    >
      <div className={styles.cardHeader}>
        <span className={styles.group}>{decision.group}</span>
        <span className={styles.tags}>
          {decision.tags.slice(0, 2).join(" / ")}
        </span>
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{decision.title}</h3>
        <p className={styles.cardSummary}>{decision.summary}</p>
      </div>

      <div className={styles.previewList}>
        {preview.map((entry) => (
          <span
            key={`${decision.id}-${entry.metric}`}
            className={clsx(
              getImpactTone(entry.metric, entry.delta) === "positive" &&
                styles.previewPositive,
              getImpactTone(entry.metric, entry.delta) === "negative" &&
                styles.previewNegative,
              getImpactTone(entry.metric, entry.delta) === "neutral" &&
                styles.previewNeutral,
            )}
          >
            {metricLabels[entry.metric]}{" "}
            {formatDelta(entry.metric, entry.delta)}
          </span>
        ))}
      </div>
    </motion.button>
  );
}

export function DecisionTray({
  decisions,
  selectedDecisionIds,
  onToggle,
  onEndTurn,
  interactionEffectsEnabled = true,
}: DecisionTrayProps) {
  const resolveFeedback = useInteractionFeedback<HTMLButtonElement>(
    interactionEffectsEnabled,
  );
  const resolveLabel =
    selectedDecisionIds.length > 0 ? "Resolve the quarter" : "Hold the line";

  return (
    <section className={styles.tray}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Decision tray</p>
        <h2 className={styles.title}>Choose where the pain goes next.</h2>
      </div>

      <div className={styles.controls} data-testid="quarter-controls">
        <p className={styles.selectionCount}>
          {selectedDecisionIds.length}/2 selected
        </p>
        <button
          type="button"
          className={clsx("interaction-feedback-control", styles.resolveButton)}
          data-interaction-feedback={resolveFeedback.feedbackState}
          onClick={onEndTurn}
          onKeyDown={resolveFeedback.onFeedbackKeyDown}
          onPointerDown={resolveFeedback.onFeedbackPointerDown}
        >
          {resolveLabel}
        </button>
      </div>

      <div className={styles.list}>
        {decisions.map((decision, index) => {
          const selected = selectedDecisionIds.includes(decision.id);

          return (
            <DecisionCard
              key={decision.id}
              decision={decision}
              index={index}
              interactionEffectsEnabled={interactionEffectsEnabled}
              selected={selected}
              onToggle={onToggle}
            />
          );
        })}
      </div>
    </section>
  );
}
