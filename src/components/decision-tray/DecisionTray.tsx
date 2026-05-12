import { motion } from "framer-motion";
import clsx from "clsx";
import { Link } from "react-router-dom";
import {
  formatDelta,
  getImpactPreview,
  metricLabels,
} from "../../lib/formatters.js";
import { consumableResourceKeys } from "../../simulation/content/metadata.js";
import { getImpactTone } from "../../simulation/state/metricSemantics.js";
import {
  canAffordResourceCosts,
  consumableResourceLabels,
  formatResourceCost,
  formatResourceCostSummary,
  formatResourceValue,
  getDecisionResourceCosts,
  getDecisionSelectionCost,
  getInsufficientResourceKeys,
  hasResourceCosts,
  projectResourceSpend,
} from "../../simulation/systems/consumables.js";
import type {
  ConsumableResourceKey,
  ConsumableResources,
  DecisionDefinition,
  ResourceCostSet,
} from "../../simulation/state/types.js";
import { emitInteractionCue } from "../audio/interactionAudioEvents.js";
import type { InteractionCueName } from "../audio/interactionAudioEvents.js";
import { useInteractionFeedback } from "../interaction/useInteractionFeedback.js";
import styles from "./DecisionTray.module.css";

interface DecisionTrayProps {
  decisionSelectionHref?: string;
  decisionSelectionLabel?: string;
  decisions: DecisionDefinition[];
  eyebrow?: string;
  interactionEffectsEnabled?: boolean;
  resources: ConsumableResources;
  selectedDecisionIds: string[];
  showControls?: boolean;
  summary?: string;
  surface?: "embedded" | "selection";
  title?: string;
  onToggle: (decisionId: string) => void;
  onEndTurn: () => void;
}

interface QuarterControlsProps {
  disabled?: boolean;
  helperText?: string;
  interactionEffectsEnabled: boolean;
  resolveLabel: string;
  selectedCost: ResourceCostSet;
  selectedDecisionCount: number;
  surface?: "inline" | "docked";
  onEndTurn: () => void;
}

interface DecisionCardProps {
  decision: DecisionDefinition;
  disabled: boolean;
  disabledReason: string | null;
  index: number;
  interactionEffectsEnabled: boolean;
  selected: boolean;
  selectedDecisionCount: number;
  onToggle: (decisionId: string) => void;
}

function DecisionCard({
  decision,
  disabled,
  disabledReason,
  index,
  interactionEffectsEnabled,
  selected,
  selectedDecisionCount,
  onToggle,
}: DecisionCardProps) {
  const feedback = useInteractionFeedback<HTMLButtonElement>(
    interactionEffectsEnabled,
  );
  const preview = getImpactPreview(decision.impacts);
  const handleToggle = () => {
    const cue: InteractionCueName | null = selected
      ? "decision-deselect"
      : selectedDecisionCount < 2
        ? "decision-select"
        : null;

    if (cue) {
      emitInteractionCue(cue);
    }

    onToggle(decision.id);
  };

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
      disabled={disabled}
      onClick={handleToggle}
      onKeyDown={feedback.onFeedbackKeyDown}
      onPointerDown={feedback.onFeedbackPointerDown}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.28 }}
    >
      <div className={styles.cardHeader}>
        <span className={styles.group}>{decision.group}</span>
        <span
          className={clsx(
            styles.selectionBadge,
            selected && styles.selectionBadgeSelected,
          )}
        >
          {selected ? "Queued" : disabled ? "Unavailable" : "Available"}
        </span>
      </div>
      <p className={styles.tags}>{decision.tags.slice(0, 2).join(" / ")}</p>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{decision.title}</h3>
        <p className={styles.cardSummary}>{decision.summary}</p>
      </div>

      <CostPreview costs={getDecisionResourceCosts(decision)} />

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

      {disabledReason ? (
        <p className={styles.disabledReason}>{disabledReason}</p>
      ) : null}
    </motion.button>
  );
}

export function DecisionTray({
  decisionSelectionHref,
  decisionSelectionLabel = "Open dedicated decision view",
  decisions,
  eyebrow = "Decision tray",
  interactionEffectsEnabled = true,
  resources,
  selectedDecisionIds,
  showControls = true,
  summary,
  surface = "embedded",
  title = "Choose where the pain goes next.",
  onToggle,
  onEndTurn,
}: DecisionTrayProps) {
  const detailFeedback = useInteractionFeedback<HTMLAnchorElement>(
    interactionEffectsEnabled && Boolean(decisionSelectionHref),
  );
  const resolveLabel =
    selectedDecisionIds.length > 0 ? "Resolve the quarter" : "Hold the line";
  const selectedDecisions = decisions.filter((decision) =>
    selectedDecisionIds.includes(decision.id),
  );
  const selectedCost = getDecisionSelectionCost(selectedDecisions);
  const projectedResources = projectResourceSpend(resources, selectedCost);

  return (
    <section
      className={clsx(
        styles.tray,
        surface === "selection" && styles.traySelectionView,
        !showControls && styles.trayWithoutControls,
      )}
    >
      <div className={styles.header}>
        <div className={styles.headerCopy}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2 className={styles.title}>{title}</h2>
          {summary ? <p className={styles.summary}>{summary}</p> : null}
        </div>
        {decisionSelectionHref ? (
          <Link
            className={clsx("interaction-feedback-control", styles.phaseLink)}
            data-interaction-feedback={detailFeedback.feedbackState}
            to={decisionSelectionHref}
            onKeyDown={detailFeedback.onFeedbackKeyDown}
            onPointerDown={detailFeedback.onFeedbackPointerDown}
          >
            {decisionSelectionLabel}
          </Link>
        ) : null}
      </div>

      <ResourceLedger
        resources={resources}
        projectedResources={projectedResources}
        selectedCost={selectedCost}
      />

      {showControls ? (
        <QuarterControls
          interactionEffectsEnabled={interactionEffectsEnabled}
          resolveLabel={resolveLabel}
          selectedCost={selectedCost}
          selectedDecisionCount={selectedDecisionIds.length}
          onEndTurn={onEndTurn}
        />
      ) : null}

      <div className={styles.list}>
        {decisions.map((decision, index) => {
          const selected = selectedDecisionIds.includes(decision.id);
          const candidateSelection = selected
            ? selectedDecisions
            : [...selectedDecisions, decision];
          const candidateCost = getDecisionSelectionCost(candidateSelection);
          const insufficientResources = getInsufficientResourceKeys(
            resources,
            candidateCost,
          );
          const selectionLimitReached =
            !selected && selectedDecisionIds.length >= 2;
          const disabled =
            selectionLimitReached ||
            (!selected && !canAffordResourceCosts(resources, candidateCost));
          const disabledReason = getDisabledReason(
            selectionLimitReached,
            insufficientResources,
          );

          return (
            <DecisionCard
              key={decision.id}
              decision={decision}
              disabled={disabled}
              disabledReason={disabledReason}
              index={index}
              interactionEffectsEnabled={interactionEffectsEnabled}
              selected={selected}
              selectedDecisionCount={selectedDecisionIds.length}
              onToggle={onToggle}
            />
          );
        })}
      </div>
    </section>
  );
}

export function QuarterControls({
  disabled = false,
  helperText,
  interactionEffectsEnabled,
  resolveLabel,
  selectedCost,
  selectedDecisionCount,
  surface = "inline",
  onEndTurn,
}: QuarterControlsProps) {
  const resolveFeedback = useInteractionFeedback<HTMLButtonElement>(
    interactionEffectsEnabled && !disabled,
  );
  const handleEndTurn = () => {
    if (disabled) {
      return;
    }

    emitInteractionCue("quarter-resolve");
    onEndTurn();
  };

  return (
    <div
      className={clsx(
        styles.controls,
        surface === "docked" && styles.controlsDocked,
      )}
      data-testid="quarter-controls"
    >
      <p className={styles.selectionCount}>
        {selectedDecisionCount}/2 selected
      </p>
      <p className={styles.selectionCost}>
        {formatResourceCostSummary(selectedCost)}
      </p>
      {helperText ? (
        <p className={styles.selectionHelper}>{helperText}</p>
      ) : null}
      <button
        type="button"
        className={clsx("interaction-feedback-control", styles.resolveButton)}
        data-interaction-feedback={resolveFeedback.feedbackState}
        disabled={disabled}
        onClick={handleEndTurn}
        onKeyDown={resolveFeedback.onFeedbackKeyDown}
        onPointerDown={resolveFeedback.onFeedbackPointerDown}
      >
        {resolveLabel}
      </button>
    </div>
  );
}

function ResourceLedger({
  resources,
  projectedResources,
  selectedCost,
}: {
  resources: ConsumableResources;
  projectedResources: ConsumableResources;
  selectedCost: ResourceCostSet;
}) {
  return (
    <section className={styles.resourceLedger} aria-label="Strategic resources">
      <div>
        <p className={styles.eyebrow}>Strategic reserves</p>
        <h3 className={styles.resourceTitle}>
          Limited resources for heavy plays.
        </h3>
      </div>

      <div className={styles.resourceGrid}>
        {consumableResourceKeys.map((resource) => (
          <ResourceMeter
            key={resource}
            resource={resource}
            value={resources[resource]}
            projectedValue={projectedResources[resource]}
            hasSelectedSpend={(selectedCost[resource] ?? 0) > 0}
          />
        ))}
      </div>
    </section>
  );
}

function ResourceMeter({
  resource,
  value,
  projectedValue,
  hasSelectedSpend,
}: {
  resource: ConsumableResourceKey;
  value: number;
  projectedValue: number;
  hasSelectedSpend: boolean;
}) {
  return (
    <div className={styles.resourceItem}>
      <span className={styles.resourceLabel}>
        {consumableResourceLabels[resource]}
      </span>
      <strong className={styles.resourceValue}>
        {formatResourceValue(resource, value)}
      </strong>
      {hasSelectedSpend ? (
        <span className={styles.resourceProjected}>
          after {formatResourceValue(resource, projectedValue)}
        </span>
      ) : null}
    </div>
  );
}

function CostPreview({ costs }: { costs: ResourceCostSet }) {
  if (!hasResourceCosts(costs)) {
    return <p className={styles.noCost}>No strategic reserve cost</p>;
  }

  return (
    <div
      className={styles.costList}
      aria-label={`Action cost: ${formatResourceCostSummary(costs)}`}
    >
      {consumableResourceKeys.map((resource) => {
        const value = costs[resource] ?? 0;

        return value > 0 ? (
          <span key={resource} className={styles.costPill}>
            {consumableResourceLabels[resource]}{" "}
            {formatResourceCost(resource, value)}
          </span>
        ) : null;
      })}
    </div>
  );
}

function getDisabledReason(
  selectionLimitReached: boolean,
  insufficientResources: ConsumableResourceKey[],
): string | null {
  if (selectionLimitReached) {
    return "Two decisions are already queued.";
  }

  if (insufficientResources.length === 0) {
    return null;
  }

  return `Reserve shortfall: ${insufficientResources
    .map((resource) => consumableResourceLabels[resource])
    .join(", ")}.`;
}
