import { describe, expect, it } from "vitest";
import { loadContentManifest } from "../../src/simulation/content";
import {
  createInitialDossierState,
  getDossierSeverityBand,
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
      "creditor_deception",
      "board_self_dealing",
    ]);
    expect(dossiers.every((thread) => thread.dormant)).toBe(true);
  });

  it("collects content-authored evidence metadata across expanded themes", () => {
    const content = loadContentManifest();
    const fragments = collectEvidenceFragments({
      selectedDecisionIds: [
        "sweep_the_ticket_float",
        "backdate_the_retention_bonus",
        "sell_before_the_reprice",
      ],
      emittedEventIds: [
        "forum_shopping_challenge",
        "director_indemnity_alarm",
        "broker_chat_subpoena",
      ],
      factionIntents: [],
      decisionEvidenceById: content.decisionEvidenceById,
      eventEvidenceById: content.eventEvidenceById,
    });
    const totals = fragments.reduce<Record<string, number>>((acc, fragment) => {
      acc[fragment.theme] = (acc[fragment.theme] ?? 0) + fragment.weight;
      return acc;
    }, {});

    expect(totals.creditor_deception).toBeGreaterThanOrEqual(26);
    expect(totals.board_self_dealing).toBeGreaterThanOrEqual(26);
    expect(totals.insider_trading).toBeGreaterThanOrEqual(30);
  });

  it("collects and applies evidence from decisions, events, and faction intents", () => {
    const fragments = collectEvidenceFragments({
      selectedDecisionIds: [
        "downgrade_the_inspection_memo",
        "freeze_the_promise_book",
        "run_for_nassau",
      ],
      emittedEventIds: ["inspection_memo_leak", "compensation_deck_leak"],
      operationCascades: [{ id: "maintenance-weather-cascade", severity: 60 }],
      factionIntents: [
        {
          id: "regulators-investigate-6",
          factionId: "regulators",
          family: "investigate",
          urgency: 78,
          rationale: "Dossier threshold crossed.",
          score: {
            urgency: 78,
            leverage: 0,
            evidence: 0,
            cooldown: 0,
            total: 78,
          },
        },
        {
          id: "press-leak-6",
          factionId: "press",
          family: "leak",
          urgency: 72,
          rationale: "Source quality improved.",
          score: {
            urgency: 72,
            leverage: 0,
            evidence: 0,
            cooldown: 0,
            total: 72,
          },
        },
        {
          id: "labor-organize-6",
          factionId: "labor",
          family: "organize",
          urgency: 66,
          rationale: "The organizing file is thick enough.",
          score: {
            urgency: 66,
            leverage: 0,
            evidence: 0,
            cooldown: 0,
            total: 66,
          },
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
    ).toBeGreaterThan(40);
    expect(
      dossiers.find((thread) => thread.theme === "labor_abuse")?.dormant,
    ).toBe(false);
    expect(
      dossiers.find((thread) => thread.theme === "offshore_evasion")
        ?.linkedDecisionIds,
    ).toContain("run_for_nassau");
    expect(
      dossiers.find((thread) => thread.theme === "labor_abuse")?.linkedEventIds,
    ).toContain("labor-organize-6");
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
        severityBand: "light",
        likelyExposure: "inspection_memo_leak",
      }),
      expect.objectContaining({
        theme: "labor_abuse",
        evidenceWeight: 11,
      }),
    ]);
  });

  it("classifies medium and heavy dossier thresholds for gameplay pressure", () => {
    expect(getDossierSeverityBand(0)).toBe("dormant");
    expect(getDossierSeverityBand(12)).toBe("light");
    expect(getDossierSeverityBand(30)).toBe("medium");
    expect(getDossierSeverityBand(48)).toBe("heavy");

    const dossiers = applyEvidenceFragments(createInitialDossierState(), [
      {
        id: "ev-creditor-float",
        theme: "creditor_deception",
        sourceType: "decision",
        sourceId: "sweep_the_ticket_float",
        weight: 50,
        witness: "card processor analyst",
      },
    ]);

    expect(
      dossiers.find((thread) => thread.theme === "creditor_deception"),
    ).toEqual(
      expect.objectContaining({
        dormant: false,
        severityBand: "heavy",
        factionOwner: "creditors",
        nextStep: "forced discovery fight",
      }),
    );
    expect(summarizeDossiers(dossiers, 1)[0]).toEqual(
      expect.objectContaining({
        caseTheory: expect.stringContaining("ticket-float"),
      }),
    );
  });
});
