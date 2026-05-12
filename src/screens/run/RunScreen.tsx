import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BoardPacket } from "../../components/board-packet/BoardPacket.js";
import {
  DecisionTray,
  QuarterControls,
} from "../../components/decision-tray/DecisionTray.js";
import { EventFeed } from "../../components/event-feed/EventFeed.js";
import { InteractionFeedbackButton } from "../../components/interaction/InteractionFeedbackButton.js";
import { useInteractionFeedback } from "../../components/interaction/useInteractionFeedback.js";
import { MetricRail } from "../../components/metrics/MetricRail.js";
import {
  formatResourceCostSummary,
  getDecisionResourceCosts,
  getDecisionSelectionCost,
} from "../../simulation/systems/consumables.js";
import { useGameStore } from "../../simulation/state/gameStore.js";
import type { DecisionDefinition } from "../../simulation/state/types.js";
import { EndingScreen } from "../ending/EndingScreen.js";
import styles from "./RunScreen.module.css";
import {
  getNextRoundPhase,
  getRoundPhaseIndex,
  getRoundResolveLabel,
  isRoundPhaseReachable,
  roundPhaseConfigs,
  validateRoundSelection,
} from "./roundFlow.js";
import type { RoundPhase, RoundSelectionValidation } from "./roundFlow.js";
import { useRunLayoutMode } from "./runLayoutMode.js";

interface PhaseNavButtonProps {
  active: boolean;
  disabled: boolean;
  furthestPhase: RoundPhase;
  interactionEffectsEnabled: boolean;
  phase: RoundPhase;
  onActivate: (phase: RoundPhase) => void;
}

interface RoundPhaseHeaderProps {
  activePhase: RoundPhase;
  furthestPhase: RoundPhase;
  interactionEffectsEnabled: boolean;
  round: number;
  selectedDecisionCount: number;
  selectionValidation: RoundSelectionValidation;
  onActivatePhase: (phase: RoundPhase) => void;
}

interface PhaseActionBarProps {
  body: string;
  interactionEffectsEnabled: boolean;
  primaryDisabled?: boolean;
  primaryLabel: string;
  secondaryLabel?: string;
  title: string;
  onPrimary: () => void;
  onSecondary?: () => void;
}

interface ResolveDocketProps {
  selectedCostSummary: string;
  selectedDecisions: DecisionDefinition[];
  selectionValidation: RoundSelectionValidation;
}

function getAdjacentReachablePhase(
  phase: RoundPhase,
  furthestPhase: RoundPhase,
  direction: "next" | "previous",
): RoundPhase {
  const reachablePhases = roundPhaseConfigs
    .map((config) => config.id)
    .filter((phaseId) => isRoundPhaseReachable(phaseId, furthestPhase));
  const currentIndex = reachablePhases.findIndex(
    (phaseId) => phaseId === phase,
  );
  const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;
  const offset = direction === "next" ? 1 : -1;
  const nextIndex =
    (safeCurrentIndex + offset + reachablePhases.length) %
    reachablePhases.length;

  return reachablePhases[nextIndex];
}

function focusPhaseTab(phase: RoundPhase) {
  window.requestAnimationFrame(() => {
    document.getElementById(`round-phase-tab-${phase}`)?.focus();
  });
}

function PhaseNavButton({
  active,
  disabled,
  furthestPhase,
  interactionEffectsEnabled,
  phase,
  onActivate,
}: PhaseNavButtonProps) {
  const config = roundPhaseConfigs.find((entry) => entry.id === phase);
  const feedback = useInteractionFeedback<HTMLButtonElement>(
    interactionEffectsEnabled && !disabled,
  );
  const activate = (nextPhase: RoundPhase) => {
    onActivate(nextPhase);
    focusPhaseTab(nextPhase);
  };

  if (!config) {
    return null;
  }

  return (
    <button
      id={`round-phase-tab-${phase}`}
      type="button"
      role="tab"
      aria-controls={`round-phase-panel-${phase}`}
      aria-selected={active}
      className={clsx(
        "interaction-feedback-control",
        active ? styles.phaseTabActive : styles.phaseTab,
      )}
      data-interaction-feedback={feedback.feedbackState}
      disabled={disabled}
      tabIndex={active ? 0 : -1}
      onClick={() => activate(phase)}
      onKeyDown={(event) => {
        feedback.onFeedbackKeyDown(event);

        if (event.key === "ArrowRight") {
          event.preventDefault();
          activate(getAdjacentReachablePhase(phase, furthestPhase, "next"));
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          activate(getAdjacentReachablePhase(phase, furthestPhase, "previous"));
        }

        if (event.key === "Home") {
          event.preventDefault();
          activate("read");
        }

        if (
          event.key === "End" &&
          isRoundPhaseReachable("resolve", furthestPhase)
        ) {
          event.preventDefault();
          activate("resolve");
        }
      }}
      onPointerDown={feedback.onFeedbackPointerDown}
    >
      <span className={styles.phaseStep}>{config.step}</span>
      <span className={styles.phaseLabel}>{config.label}</span>
      <span className={styles.phaseDescription}>{config.description}</span>
    </button>
  );
}

function RoundPhaseHeader({
  activePhase,
  furthestPhase,
  interactionEffectsEnabled,
  round,
  selectedDecisionCount,
  selectionValidation,
  onActivatePhase,
}: RoundPhaseHeaderProps) {
  return (
    <header className={styles.flowHeader}>
      <div className={styles.flowTitleBlock}>
        <p className={styles.eyebrow}>Round {round} control flow</p>
        <p className={styles.flowTitle}>Read. Choose. Resolve.</p>
      </div>

      <nav className={styles.phaseNav} role="tablist" aria-label="Round phases">
        {roundPhaseConfigs.map((phase) => (
          <PhaseNavButton
            key={phase.id}
            active={activePhase === phase.id}
            disabled={!isRoundPhaseReachable(phase.id, furthestPhase)}
            furthestPhase={furthestPhase}
            interactionEffectsEnabled={interactionEffectsEnabled}
            phase={phase.id}
            onActivate={onActivatePhase}
          />
        ))}
      </nav>

      <aside className={styles.flowStatus} aria-label="Selection validity">
        <span className={styles.statusCount}>
          {selectedDecisionCount}/2 selected
        </span>
        <strong className={styles.statusLabel}>
          {selectionValidation.statusLabel}
        </strong>
        <span className={styles.statusGuidance}>
          {selectionValidation.guidance}
        </span>
      </aside>
    </header>
  );
}

function PhaseActionBar({
  body,
  interactionEffectsEnabled,
  primaryDisabled = false,
  primaryLabel,
  secondaryLabel,
  title,
  onPrimary,
  onSecondary,
}: PhaseActionBarProps) {
  return (
    <div className={styles.phaseActionBar}>
      <div className={styles.phaseActionCopy}>
        <p className={styles.eyebrow}>Phase order</p>
        <h2 className={styles.actionTitle}>{title}</h2>
        <p className={styles.actionBody}>{body}</p>
      </div>

      <div className={styles.phaseActionControls}>
        {secondaryLabel && onSecondary ? (
          <InteractionFeedbackButton
            feedbackEnabled={interactionEffectsEnabled}
            className={styles.secondaryAction}
            onClick={onSecondary}
          >
            {secondaryLabel}
          </InteractionFeedbackButton>
        ) : null}
        <InteractionFeedbackButton
          feedbackEnabled={interactionEffectsEnabled}
          className={styles.primaryAction}
          disabled={primaryDisabled}
          onClick={onPrimary}
        >
          {primaryLabel}
        </InteractionFeedbackButton>
      </div>
    </div>
  );
}

function ResolveDocket({
  selectedCostSummary,
  selectedDecisions,
  selectionValidation,
}: ResolveDocketProps) {
  return (
    <section
      className={styles.resolveDocket}
      aria-labelledby="resolve-docket-title"
    >
      <div className={styles.resolveHeader}>
        <p className={styles.eyebrow}>Resolve / End Round</p>
        <h2 id="resolve-docket-title" className={styles.resolveTitle}>
          Confirm the paper trail before it becomes history.
        </h2>
        <p className={styles.resolveSummary}>{selectionValidation.guidance}</p>
      </div>

      <div className={styles.resolveMetaGrid}>
        <div className={styles.resolveMetaItem}>
          <span>Queued plays</span>
          <strong>{selectedDecisions.length}/2</strong>
        </div>
        <div className={styles.resolveMetaItem}>
          <span>Reserve impact</span>
          <strong>{selectedCostSummary}</strong>
        </div>
        <div className={styles.resolveMetaItem}>
          <span>Validation</span>
          <strong>{selectionValidation.statusLabel}</strong>
        </div>
      </div>

      {selectedDecisions.length > 0 ? (
        <div className={styles.resolveList}>
          {selectedDecisions.map((decision) => (
            <article key={decision.id} className={styles.resolveCard}>
              <div className={styles.resolveCardHeader}>
                <span>{decision.group}</span>
                <span>{decision.tags.slice(0, 2).join(" / ")}</span>
              </div>
              <h3>{decision.title}</h3>
              <p>{decision.summary}</p>
              <span className={styles.resolveCost}>
                {formatResourceCostSummary(getDecisionResourceCosts(decision))}
              </span>
            </article>
          ))}
        </div>
      ) : (
        <article className={styles.emptyDocket}>
          <h3>No executive plays queued.</h3>
          <p>
            Holding the line still advances the quarter. The simulation will
            resolve background pressure, scheduled events, and state drift with
            the same deterministic rules.
          </p>
        </article>
      )}
    </section>
  );
}

export function RunScreen() {
  const navigate = useNavigate();
  const run = useGameStore((state) => state.run);
  const settings = useGameStore((state) => state.settings);
  const availableDecisions = useGameStore((state) => state.availableDecisions);
  const toggleDecision = useGameStore((state) => state.toggleDecision);
  const endTurn = useGameStore((state) => state.endTurn);
  const layoutMode = useRunLayoutMode();
  const [activePhase, setActivePhase] = useState<RoundPhase>("read");
  const [furthestPhase, setFurthestPhase] = useState<RoundPhase>("read");
  const interactionEffectsEnabled =
    settings.visualEffectsEnabled && settings.interactionEffectsEnabled;

  useEffect(() => {
    if (!run) {
      navigate("/", { replace: true });
    }
  }, [navigate, run]);

  useEffect(() => {
    setActivePhase("read");
    setFurthestPhase("read");
  }, [run?.round]);

  const decisions = availableDecisions();
  const selectedDecisions = useMemo(
    () =>
      decisions.filter((decision) =>
        run?.selectedDecisionIds.includes(decision.id),
      ),
    [decisions, run?.selectedDecisionIds],
  );

  if (!run) {
    return null;
  }

  if (run.status === "ended") {
    return <EndingScreen />;
  }

  const selectedCost = getDecisionSelectionCost(selectedDecisions);
  const selectionValidation = validateRoundSelection({
    resources: run.resources,
    selectedCost,
    selectedDecisionCount: run.selectedDecisionIds.length,
  });
  const resolveLabel = getRoundResolveLabel(run.selectedDecisionIds.length);
  const selectedCostSummary = formatResourceCostSummary(selectedCost);
  const activatePhase = (nextPhase: RoundPhase) => {
    if (!isRoundPhaseReachable(nextPhase, furthestPhase)) {
      return;
    }

    setActivePhase(nextPhase);
    setFurthestPhase((currentPhase) =>
      getRoundPhaseIndex(nextPhase) > getRoundPhaseIndex(currentPhase)
        ? nextPhase
        : currentPhase,
    );
  };
  const advancePhase = () => activatePhase(getNextRoundPhase(activePhase));
  const handleEndTurn = () => {
    if (activePhase !== "resolve") {
      activatePhase(activePhase === "read" ? "choose" : "resolve");
      return;
    }

    if (!selectionValidation.valid) {
      return;
    }

    endTurn();
  };

  return (
    <section
      className={styles.layout}
      data-run-layout-mode={layoutMode}
      data-round-phase={activePhase}
      aria-label="Active run workspace"
    >
      <RoundPhaseHeader
        activePhase={activePhase}
        furthestPhase={furthestPhase}
        interactionEffectsEnabled={interactionEffectsEnabled}
        round={run.round}
        selectedDecisionCount={run.selectedDecisionIds.length}
        selectionValidation={selectionValidation}
        onActivatePhase={activatePhase}
      />

      <div className={styles.phaseBody}>
        <div
          id="round-phase-panel-read"
          className={styles.phasePanel}
          role="tabpanel"
          aria-labelledby="round-phase-tab-read"
          hidden={activePhase !== "read"}
        >
          <div className={styles.readPhase}>
            <div className={styles.readGrid}>
              <div
                id="run-panel-brief"
                className={clsx(styles.panel, styles.boardArea)}
                data-testid="run-panel-brief"
              >
                <BoardPacket run={run} />
              </div>

              <div
                id="run-panel-state"
                className={clsx(styles.panel, styles.metricsArea)}
                data-testid="run-panel-state"
              >
                <MetricRail metrics={run.metrics} />
              </div>

              <div
                id="run-panel-feed"
                className={clsx(styles.panel, styles.feedArea)}
                data-testid="run-panel-feed"
              >
                <EventFeed history={run.history} />
              </div>
            </div>

            <PhaseActionBar
              body="The board packet is the read phase: inspect the current ledger, pressure signals, and recent consequences before opening the decision docket."
              interactionEffectsEnabled={interactionEffectsEnabled}
              primaryLabel="Choose plays"
              title="Move from reading into decision selection."
              onPrimary={advancePhase}
            />
          </div>
        </div>

        <div
          id="round-phase-panel-choose"
          className={styles.phasePanel}
          role="tabpanel"
          aria-labelledby="round-phase-tab-choose"
          hidden={activePhase !== "choose"}
        >
          <div className={styles.choosePhase}>
            <div
              id="run-panel-decisions"
              className={clsx(styles.panel, styles.decisionArea)}
              data-testid="run-panel-decisions"
            >
              <DecisionTray
                decisionSelectionHref="/run/decisions"
                decisions={decisions}
                interactionEffectsEnabled={interactionEffectsEnabled}
                resources={run.resources}
                selectedDecisionIds={run.selectedDecisionIds}
                showControls={false}
                onToggle={toggleDecision}
                onEndTurn={handleEndTurn}
              />
            </div>

            <PhaseActionBar
              body="Use the full docket surface to queue no more than two plays. End-round resolution stays locked behind the review phase."
              interactionEffectsEnabled={interactionEffectsEnabled}
              primaryDisabled={!selectionValidation.valid}
              primaryLabel="Review resolution"
              secondaryLabel="Back to board packet"
              title={selectionValidation.statusLabel}
              onPrimary={advancePhase}
              onSecondary={() => activatePhase("read")}
            />
          </div>
        </div>

        <div
          id="round-phase-panel-resolve"
          className={styles.phasePanel}
          role="tabpanel"
          aria-labelledby="round-phase-tab-resolve"
          hidden={activePhase !== "resolve"}
        >
          <div className={styles.resolvePhase}>
            <ResolveDocket
              selectedCostSummary={selectedCostSummary}
              selectedDecisions={selectedDecisions}
              selectionValidation={selectionValidation}
            />

            <aside className={styles.resolveControls}>
              <div className={styles.resolveControlCopy}>
                <p className={styles.eyebrow}>Final control</p>
                <h2>End-round is live only here.</h2>
                <p>
                  Resolve advances the same simulation path as before; this
                  phase only makes the confirmation explicit.
                </p>
              </div>

              <QuarterControls
                disabled={
                  !selectionValidation.valid || activePhase !== "resolve"
                }
                helperText={selectionValidation.guidance}
                interactionEffectsEnabled={interactionEffectsEnabled}
                resolveLabel={resolveLabel}
                selectedCost={selectedCost}
                selectedDecisionCount={run.selectedDecisionIds.length}
                surface="docked"
                onEndTurn={handleEndTurn}
              />

              <InteractionFeedbackButton
                feedbackEnabled={interactionEffectsEnabled}
                className={styles.secondaryAction}
                onClick={() => activatePhase("choose")}
              >
                Amend selected plays
              </InteractionFeedbackButton>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
