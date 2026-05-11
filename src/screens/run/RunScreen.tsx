import clsx from "clsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BoardPacket } from "../../components/board-packet/BoardPacket.js";
import {
  DecisionTray,
  QuarterControls,
} from "../../components/decision-tray/DecisionTray.js";
import { EventFeed } from "../../components/event-feed/EventFeed.js";
import { useInteractionFeedback } from "../../components/interaction/useInteractionFeedback.js";
import { MetricRail } from "../../components/metrics/MetricRail.js";
import { getDecisionSelectionCost } from "../../simulation/systems/consumables.js";
import { useGameStore } from "../../simulation/state/gameStore.js";
import { EndingScreen } from "../ending/EndingScreen.js";
import styles from "./RunScreen.module.css";
import { useRunLayoutMode } from "./runLayoutMode.js";

type RunPanelId = "brief" | "state" | "decisions" | "feed";

interface RunPanelConfig {
  id: RunPanelId;
  label: string;
}

const runPanels: RunPanelConfig[] = [
  { id: "brief", label: "Brief" },
  { id: "state", label: "State" },
  { id: "decisions", label: "Decisions" },
  { id: "feed", label: "Feed" },
];

interface PanelNavButtonProps {
  active: boolean;
  interactionEffectsEnabled: boolean;
  label: string;
  panelId: RunPanelId;
  onActivate: (panelId: RunPanelId) => void;
}

function getAdjacentPanelId(
  panelId: RunPanelId,
  direction: "next" | "previous",
): RunPanelId {
  const currentIndex = runPanels.findIndex((panel) => panel.id === panelId);
  const offset = direction === "next" ? 1 : -1;
  const nextIndex = (currentIndex + offset + runPanels.length) % runPanels.length;

  return runPanels[nextIndex].id;
}

function PanelNavButton({
  active,
  interactionEffectsEnabled,
  label,
  panelId,
  onActivate,
}: PanelNavButtonProps) {
  const feedback = useInteractionFeedback<HTMLButtonElement>(
    interactionEffectsEnabled,
  );
  const activate = (nextPanelId: RunPanelId) => {
    onActivate(nextPanelId);
    window.requestAnimationFrame(() => {
      document.getElementById(`run-tab-${nextPanelId}`)?.focus();
    });
  };

  return (
    <button
      id={`run-tab-${panelId}`}
      type="button"
      role="tab"
      aria-controls={`run-panel-${panelId}`}
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      className={clsx(
        "interaction-feedback-control",
        active ? styles.panelTabActive : styles.panelTab,
      )}
      data-interaction-feedback={feedback.feedbackState}
      onClick={() => activate(panelId)}
      onKeyDown={(event) => {
        feedback.onFeedbackKeyDown(event);

        if (event.key === "ArrowRight") {
          event.preventDefault();
          activate(getAdjacentPanelId(panelId, "next"));
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          activate(getAdjacentPanelId(panelId, "previous"));
        }

        if (event.key === "Home") {
          event.preventDefault();
          activate(runPanels[0].id);
        }

        if (event.key === "End") {
          event.preventDefault();
          activate(runPanels[runPanels.length - 1].id);
        }
      }}
      onPointerDown={feedback.onFeedbackPointerDown}
    >
      {label}
    </button>
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
  const [activePanel, setActivePanel] = useState<RunPanelId>("brief");
  const interactionEffectsEnabled =
    settings.visualEffectsEnabled && settings.interactionEffectsEnabled;
  const isPortraitLayout = layoutMode === "portrait-panels";

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
  const selectedDecisions = decisions.filter((decision) =>
    run.selectedDecisionIds.includes(decision.id),
  );
  const selectedCost = getDecisionSelectionCost(selectedDecisions);
  const resolveLabel =
    run.selectedDecisionIds.length > 0 ? "Resolve the quarter" : "Hold the line";
  const handleEndTurn = () => {
    endTurn();

    if (isPortraitLayout) {
      setActivePanel("feed");
    }
  };
  const panelVisibility = runPanels.reduce<Record<RunPanelId, boolean>>(
    (visibility, panel) => ({
      ...visibility,
      [panel.id]: !isPortraitLayout || activePanel === panel.id,
    }),
    {
      brief: false,
      decisions: false,
      feed: false,
      state: false,
    },
  );

  return (
    <section
      className={styles.layout}
      data-run-layout-mode={layoutMode}
      aria-label="Active run workspace"
    >
      {isPortraitLayout ? (
        <nav
          className={styles.panelNav}
          role="tablist"
          aria-label="Run panels"
        >
          {runPanels.map((panel) => (
            <PanelNavButton
              key={panel.id}
              active={activePanel === panel.id}
              interactionEffectsEnabled={interactionEffectsEnabled}
              label={panel.label}
              panelId={panel.id}
              onActivate={setActivePanel}
            />
          ))}
        </nav>
      ) : null}

      <div
        id="run-panel-state"
        className={clsx(styles.panel, styles.metricsArea)}
        role={isPortraitLayout ? "tabpanel" : undefined}
        aria-labelledby={isPortraitLayout ? "run-tab-state" : undefined}
        data-testid="run-panel-state"
        hidden={!panelVisibility.state}
        tabIndex={isPortraitLayout ? 0 : undefined}
      >
        <MetricRail metrics={run.metrics} />
      </div>

      <div
        id="run-panel-brief"
        className={clsx(styles.panel, styles.boardArea)}
        role={isPortraitLayout ? "tabpanel" : undefined}
        aria-labelledby={isPortraitLayout ? "run-tab-brief" : undefined}
        data-testid="run-panel-brief"
        hidden={!panelVisibility.brief}
        tabIndex={isPortraitLayout ? 0 : undefined}
      >
        <BoardPacket run={run} />
      </div>

      <div
        id="run-panel-decisions"
        className={clsx(styles.panel, styles.decisionArea)}
        role={isPortraitLayout ? "tabpanel" : undefined}
        aria-labelledby={isPortraitLayout ? "run-tab-decisions" : undefined}
        data-testid="run-panel-decisions"
        hidden={!panelVisibility.decisions}
        tabIndex={isPortraitLayout ? 0 : undefined}
      >
        <DecisionTray
          decisions={decisions}
          interactionEffectsEnabled={interactionEffectsEnabled}
          resources={run.resources}
          selectedDecisionIds={run.selectedDecisionIds}
          showControls={!isPortraitLayout}
          onToggle={toggleDecision}
          onEndTurn={handleEndTurn}
        />
      </div>

      <div
        id="run-panel-feed"
        className={clsx(styles.panel, styles.feedArea)}
        role={isPortraitLayout ? "tabpanel" : undefined}
        aria-labelledby={isPortraitLayout ? "run-tab-feed" : undefined}
        data-testid="run-panel-feed"
        hidden={!panelVisibility.feed}
        tabIndex={isPortraitLayout ? 0 : undefined}
      >
        <EventFeed history={run.history} />
      </div>

      {isPortraitLayout ? (
        <div className={styles.persistentControls}>
          <QuarterControls
            interactionEffectsEnabled={interactionEffectsEnabled}
            resolveLabel={resolveLabel}
            selectedCost={selectedCost}
            selectedDecisionCount={run.selectedDecisionIds.length}
            surface="docked"
            onEndTurn={handleEndTurn}
          />
        </div>
      ) : null}
    </section>
  );
}
