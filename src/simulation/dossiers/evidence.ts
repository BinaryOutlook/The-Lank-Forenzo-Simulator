import type { FactionIntent } from "../factions/factionState";
import type { DossierTheme, DossierThread } from "./dossierState";

export type EvidenceSourceType = "decision" | "event" | "faction";

export interface EvidenceFragment {
  id: string;
  theme: DossierTheme;
  sourceType: EvidenceSourceType;
  sourceId: string;
  weight: number;
  witness?: string;
}

export interface EvidenceCollectionInput {
  selectedDecisionIds: string[];
  emittedEventIds: string[];
  factionIntents: FactionIntent[];
}

const DECISION_EVIDENCE: Record<string, Array<Omit<EvidenceFragment, "id" | "sourceType" | "sourceId">>> = {
  downgrade_the_inspection_memo: [
    { theme: "maintenance_fraud", weight: 14, witness: "line mechanic" },
  ],
  vendor_swap_the_heavy_checks: [
    { theme: "maintenance_fraud", weight: 12, witness: "contractor auditor" },
  ],
  stretch_the_mel_clock: [
    { theme: "maintenance_fraud", weight: 10, witness: "maintenance planner" },
  ],
  freeze_the_promise_book: [
    { theme: "labor_abuse", weight: 12, witness: "benefits analyst" },
  ],
  weaponize_the_scope_clause: [
    { theme: "labor_abuse", weight: 11, witness: "union researcher" },
  ],
  run_for_nassau: [
    { theme: "offshore_evasion", weight: 18, witness: "customs broker" },
  ],
  cash_out_and_resign: [
    { theme: "insider_trading", weight: 18, witness: "compensation adviser" },
  ],
  rehearse_the_consent_order: [
    { theme: "regulatory_capture", weight: 12, witness: "compliance counsel" },
  ],
};

const EVENT_EVIDENCE: Record<string, Array<Omit<EvidenceFragment, "id" | "sourceType" | "sourceId">>> = {
  inspection_memo_leak: [
    { theme: "maintenance_fraud", weight: 12, witness: "line mechanic" },
  ],
  compensation_deck_leak: [
    { theme: "insider_trading", weight: 12, witness: "board analyst" },
  ],
  scope_clause_arbitration: [
    { theme: "labor_abuse", weight: 11, witness: "arbitration clerk" },
  ],
  customs_broker_ping: [
    { theme: "offshore_evasion", weight: 10, witness: "customs broker" },
  ],
};

export function collectEvidenceFragments(
  input: EvidenceCollectionInput,
): EvidenceFragment[] {
  const fragments: EvidenceFragment[] = [];

  for (const decisionId of input.selectedDecisionIds) {
    fragments.push(
      ...buildFragments("decision", decisionId, DECISION_EVIDENCE[decisionId]),
    );
  }

  for (const eventId of input.emittedEventIds) {
    fragments.push(...buildFragments("event", eventId, EVENT_EVIDENCE[eventId]));
  }

  for (const intent of input.factionIntents) {
    if (intent.family === "investigate") {
      fragments.push({
        id: `faction-${intent.id}-regulatory_capture`,
        theme: "regulatory_capture",
        sourceType: "faction",
        sourceId: intent.id,
        weight: Math.max(8, Math.round(intent.urgency / 5)),
      });
    }

    if (intent.family === "leak") {
      fragments.push({
        id: `faction-${intent.id}-insider_trading`,
        theme: "insider_trading",
        sourceType: "faction",
        sourceId: intent.id,
        weight: Math.max(8, Math.round(intent.urgency / 6)),
      });
    }
  }

  return fragments;
}

export function applyEvidenceFragments(
  dossiers: DossierThread[],
  fragments: EvidenceFragment[],
): DossierThread[] {
  return dossiers.map((thread) => {
    const relevant = fragments.filter((fragment) => fragment.theme === thread.theme);
    if (relevant.length === 0) {
      return thread;
    }

    const evidenceWeight =
      thread.evidenceWeight +
      relevant.reduce((sum, fragment) => sum + fragment.weight, 0);

    return {
      ...thread,
      evidenceWeight,
      severity: Math.min(100, Math.round(evidenceWeight * 1.25)),
      dormant: evidenceWeight < 8,
      witnesses: mergeUnique(
        thread.witnesses,
        relevant
          .map((fragment) => fragment.witness)
          .filter((witness): witness is string => Boolean(witness)),
      ),
      linkedDecisionIds: mergeUnique(
        thread.linkedDecisionIds,
        relevant
          .filter((fragment) => fragment.sourceType === "decision")
          .map((fragment) => fragment.sourceId),
      ),
      linkedEventIds: mergeUnique(
        thread.linkedEventIds,
        relevant
          .filter((fragment) => fragment.sourceType !== "decision")
          .map((fragment) => fragment.sourceId),
      ),
    };
  });
}

function buildFragments(
  sourceType: EvidenceSourceType,
  sourceId: string,
  entries: Array<Omit<EvidenceFragment, "id" | "sourceType" | "sourceId">> = [],
): EvidenceFragment[] {
  return entries.map((entry) => ({
    ...entry,
    id: `${sourceType}-${sourceId}-${entry.theme}`,
    sourceType,
    sourceId,
  }));
}

function mergeUnique(current: string[], next: string[]): string[] {
  return [...new Set([...current, ...next])];
}
