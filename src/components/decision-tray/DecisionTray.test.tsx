import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach } from "vitest";
import { describe, expect, it, vi } from "vitest";
import { initialConsumableResources } from "../../simulation/systems/consumables.js";
import type { DecisionDefinition } from "../../simulation/state/types.js";
import {
  subscribeToInteractionCues,
  type InteractionCueName,
} from "../audio/interactionAudioEvents.js";
import { DecisionTray } from "./DecisionTray.js";

const decisions: DecisionDefinition[] = [
  {
    id: "tighten-screws",
    pack: "core",
    title: "Tighten the screws",
    summary: "Push the workforce harder and hope the room blames the weather.",
    group: "operations",
    tags: ["labor", "risk"],
    impacts: {
      workforceMorale: -5,
      legalHeat: 3,
    },
  },
];

const costlyDecisions: DecisionDefinition[] = [
  {
    id: "committee-retainer",
    pack: "regulatoryTheater",
    title: "Committee Retainer",
    summary: "Buy enough procedural intimacy to slow the hearing calendar.",
    group: "legal",
    tags: ["regulators", "lobbying"],
    impacts: {
      legalHeat: -4,
    },
    resourceCosts: {
      inGameMoney: 7,
      personalAssets: 1,
      publicRelationsCapital: 2,
    },
  },
];

afterEach(() => {
  cleanup();
});

describe("DecisionTray", () => {
  it("exposes selection state through aria-pressed", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const onEndTurn = vi.fn();
    const { rerender } = render(
      <DecisionTray
        decisions={decisions}
        resources={initialConsumableResources}
        selectedDecisionIds={[]}
        onToggle={onToggle}
        onEndTurn={onEndTurn}
      />,
    );

    const decisionButton = screen.getByRole("button", {
      name: /tighten the screws/i,
    });
    expect(decisionButton).toHaveAttribute("aria-pressed", "false");

    await user.click(decisionButton);
    expect(onToggle).toHaveBeenCalledWith("tighten-screws");

    rerender(
      <DecisionTray
        decisions={decisions}
        resources={initialConsumableResources}
        selectedDecisionIds={["tighten-screws"]}
        onToggle={onToggle}
        onEndTurn={onEndTurn}
      />,
    );

    expect(
      screen.getByRole("button", { name: /tighten the screws/i }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("emits interaction cues for decision and quarter controls", async () => {
    const user = userEvent.setup();
    const cues: InteractionCueName[] = [];
    const unsubscribe = subscribeToInteractionCues((cue) => {
      cues.push(cue);
    });

    try {
      const onToggle = vi.fn();
      const onEndTurn = vi.fn();
      const { rerender } = render(
        <DecisionTray
          decisions={decisions}
          resources={initialConsumableResources}
          selectedDecisionIds={[]}
          onToggle={onToggle}
          onEndTurn={onEndTurn}
        />,
      );

      await user.click(
        screen.getByRole("button", {
          name: /tighten the screws/i,
        }),
      );

      rerender(
        <DecisionTray
          decisions={decisions}
          resources={initialConsumableResources}
          selectedDecisionIds={["tighten-screws"]}
          onToggle={onToggle}
          onEndTurn={onEndTurn}
        />,
      );

      await user.click(
        screen.getByRole("button", {
          name: /tighten the screws/i,
        }),
      );
      await user.click(
        screen.getByRole("button", {
          name: /resolve the quarter/i,
        }),
      );

      expect(cues).toEqual([
        "decision-select",
        "decision-deselect",
        "quarter-resolve",
      ]);
    } finally {
      unsubscribe();
    }
  });

  it("marks decision and resolve controls for interaction feedback when enabled", async () => {
    const onToggle = vi.fn();
    const onEndTurn = vi.fn();

    render(
      <DecisionTray
        decisions={decisions}
        resources={initialConsumableResources}
        selectedDecisionIds={[]}
        onToggle={onToggle}
        onEndTurn={onEndTurn}
        interactionEffectsEnabled
      />,
    );

    const decisionButton = screen.getByRole("button", {
      name: /tighten the screws/i,
    });
    fireEvent.pointerDown(decisionButton);

    await waitFor(() => {
      expect(decisionButton).toHaveAttribute(
        "data-interaction-feedback",
        "active",
      );
    });

    const resolveButton = screen.getByRole("button", {
      name: /hold the line/i,
    });
    fireEvent.pointerDown(resolveButton);

    await waitFor(() => {
      expect(resolveButton).toHaveAttribute(
        "data-interaction-feedback",
        "active",
      );
    });
  });

  it("does not mark extra interaction feedback when disabled", () => {
    const onToggle = vi.fn();
    const onEndTurn = vi.fn();

    render(
      <DecisionTray
        decisions={decisions}
        resources={initialConsumableResources}
        selectedDecisionIds={[]}
        onToggle={onToggle}
        onEndTurn={onEndTurn}
        interactionEffectsEnabled={false}
      />,
    );

    const decisionButton = screen.getByRole("button", {
      name: /tighten the screws/i,
    });
    fireEvent.pointerDown(decisionButton);

    expect(decisionButton).not.toHaveAttribute("data-interaction-feedback");
  });

  it("shows resources and disables actions the reserve ledger cannot cover", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(
      <DecisionTray
        decisions={costlyDecisions}
        resources={{
          inGameMoney: 2,
          personalAssets: 0,
          publicRelationsCapital: 1,
        }}
        selectedDecisionIds={[]}
        onToggle={onToggle}
        onEndTurn={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Strategic resources")).toBeInTheDocument();
    expect(screen.getByText("Strategic cash -$7M")).toBeInTheDocument();
    expect(screen.getByText(/Reserve shortfall/)).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /committee retainer/i }),
    );

    expect(onToggle).not.toHaveBeenCalled();
  });
});
