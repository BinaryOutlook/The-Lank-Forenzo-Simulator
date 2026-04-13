import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach } from "vitest";
import { describe, expect, it, vi } from "vitest";
import { DecisionTray } from "./DecisionTray";
import type { DecisionDefinition } from "../../simulation/state/types";

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

afterEach(() => {
  document.body.innerHTML = "";
});

describe("DecisionTray", () => {
  it("exposes selection state through aria-pressed", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const onEndTurn = vi.fn();
    const { rerender } = render(
      <DecisionTray
        decisions={decisions}
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
        selectedDecisionIds={["tighten-screws"]}
        onToggle={onToggle}
        onEndTurn={onEndTurn}
      />,
    );

    expect(
      screen.getByRole("button", { name: /tighten the screws/i }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
