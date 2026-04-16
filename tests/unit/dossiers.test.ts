import { describe, expect, it } from "vitest";
import {
  createInitialDossierState,
  summarizeDossiers,
} from "../../src/simulation/dossiers/dossierState";
import {
  applyEvidenceFragments,
  collectEvidenceFragments,
} from "../../src/simulation/dossiers/evidence";

describe("dossier primitives", () => {
  it("creates required dossier themes in dormant state", () => {
    const dossiers = createInitialDossierState();

    expect(dossiers.map((thread) => thread.theme)).toEqual([
      "insider_trading",
      "maintenance_fraud",
      "labor_abuse",
      "regulatory_capture",
      "offshore_evasion",
    ]);
    expect(dossiers.every((thread) => thread.dormant)).toBe(true);
  });

  it("collects and applies evidence from decisions, events, and faction intents", () => {
    const fragments = collectEvidenceFragments({
      selectedDecisionIds: [
        "downgrade_the_inspection_memo",
        "freeze_the_promise_book",
        "run_for_nassau",
      ],
      emittedEventIds: ["inspection_memo_leak", "compensation_deck_leak"],
      factionIntents: [
        {
          id: "regulators-investigate-6",
          factionId: "regulators",
          family: "investigate",
          urgency: 78,
          rationale: "Dossier threshold crossed.",
        },
        {
          id: "press-leak-6",
          factionId: "press",
          family: "leak",
          urgency: 72,
          rationale: "Source quality improved.",
        },
      ],
    });
    const dossiers = applyEvidenceFragments(
      createInitialDossierState(),
      fragments,
    );

    expect(
      dossiers.find((thread) => thread.theme === "maintenance_fraud")
        ?.evidenceWeight,
    ).toBeGreaterThan(20);
    expect(
      dossiers.find((thread) => thread.theme === "labor_abuse")?.dormant,
    ).toBe(false);
    expect(
      dossiers.find((thread) => thread.theme === "offshore_evasion")
        ?.linkedDecisionIds,
    ).toContain("run_for_nassau");
  });

  it("summarizes the strongest active scandal threads", () => {
    const dossiers = applyEvidenceFragments(createInitialDossierState(), [
      {
        id: "ev-maintenance",
        theme: "maintenance_fraud",
        sourceType: "decision",
        sourceId: "downgrade_the_inspection_memo",
        weight: 16,
        witness: "line mechanic",
      },
      {
        id: "ev-labor",
        theme: "labor_abuse",
        sourceType: "event",
        sourceId: "scope_clause_arbitration",
        weight: 11,
      },
      {
        id: "ev-maintenance-leak",
        theme: "maintenance_fraud",
        sourceType: "event",
        sourceId: "inspection_memo_leak",
        weight: 12,
      },
    ]);

    const summary = summarizeDossiers(dossiers, 2);

    expect(summary).toEqual([
      expect.objectContaining({
        theme: "maintenance_fraud",
        evidenceWeight: 28,
        likelyExposure: "inspection_memo_leak",
      }),
      expect.objectContaining({
        theme: "labor_abuse",
        evidenceWeight: 11,
      }),
    ]);
  });
});
