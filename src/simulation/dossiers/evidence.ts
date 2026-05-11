import type { FactionIntent } from "../factions/factionState";
import type { DossierTheme, DossierThread } from "./dossierState";
import {
  getDossierFactionOwner,
  getDossierNextStep,
  getDossierSeverityBand,
} from "./dossierState";

export type EvidenceSourceType = "decision" | "event" | "faction" | "operation";

export interface DossierEvidenceDefinition {
  theme: DossierTheme;
  weight: number;
  witness?: string;
  detail?: string;
}

export interface EvidenceFragment {
  id: string;
  theme: DossierTheme;
  sourceType: EvidenceSourceType;
  sourceId: string;
  weight: number;
  witness?: string;
  detail?: string;
}

export interface EvidenceCollectionInput {
  selectedDecisionIds: string[];
  emittedEventIds: string[];
  factionIntents: FactionIntent[];
  operationCascades?: Array<{ id: string; severity: number }>;
  decisionEvidenceById?: EvidenceSourceCatalog;
  eventEvidenceById?: EvidenceSourceCatalog;
}

export type EvidenceSourceCatalog = Record<string, DossierEvidenceDefinition[]>;

const DECISION_EVIDENCE: EvidenceSourceCatalog = {
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

const EVENT_EVIDENCE: EvidenceSourceCatalog = {
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

const OPERATION_EVIDENCE: Record<
  string,
  (cascade: { id: string; severity: number }) => DossierEvidenceDefinition[]
> = {
  "maintenance-weather-cascade": (cascade) => [
    {
      theme: "maintenance_fraud",
      weight: Math.max(10, Math.round(cascade.severity / 3)),
      witness: "irregular operations desk",
      detail: "Operational cascade tied deferred maintenance to a visible network failure.",
    },
  ],
};

export function collectEvidenceFragments(
  input: EvidenceCollectionInput,
): EvidenceFragment[] {
  const fragments: EvidenceFragment[] = [];

  for (const decisionId of input.selectedDecisionIds) {
    fragments.push(
      ...buildFragments(
        "decision",
        decisionId,
        input.decisionEvidenceById?.[decisionId] ?? DECISION_EVIDENCE[decisionId],
      ),
    );
  }

  for (const eventId of input.emittedEventIds) {
    fragments.push(
      ...buildFragments(
        "event",
        eventId,
        input.eventEvidenceById?.[eventId] ?? EVENT_EVIDENCE[eventId],
      ),
    );
  }

  for (const cascade of input.operationCascades ?? []) {
    fragments.push(
      ...buildFragments(
        "operation",
        cascade.id,
        OPERATION_EVIDENCE[cascade.id]?.(cascade),
      ),
    );
  }

  for (const intent of input.factionIntents) {
    if (intent.family === "investigate") {
      fragments.push({
        id: `faction-${intent.id}-regulatory_capture`,
        theme: "regulatory_capture",
        sourceType: "faction",
        sourceId: intent.id,
        weight: Math.max(8, Math.round(intent.urgency / 5)),
        witness: "agency staffer",
      });
    }

    if (intent.family === "leak") {
      fragments.push({
        id: `faction-${intent.id}-insider_trading`,
        theme: "insider_trading",
        sourceType: "faction",
        sourceId: intent.id,
        weight: Math.max(8, Math.round(intent.urgency / 6)),
        witness: "press source",
      });
    }

    if (intent.family === "organize") {
      fragments.push({
        id: `faction-${intent.id}-labor_abuse`,
        theme: "labor_abuse",
        sourceType: "faction",
        sourceId: intent.id,
        weight: Math.max(8, Math.round(intent.urgency / 6)),
        witness: "union researcher",
      });
    }

    if (intent.family === "pressure" && intent.factionId === "creditors") {
      fragments.push({
        id: `faction-${intent.id}-creditor_deception`,
        theme: "creditor_deception",
        sourceType: "faction",
        sourceId: intent.id,
        weight: Math.max(8, Math.round(intent.urgency / 6)),
        witness: "creditor committee analyst",
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
    const severityBand = getDossierSeverityBand(evidenceWeight);

    return {
      ...thread,
      evidenceWeight,
      severity: Math.min(100, Math.round(evidenceWeight * 1.25)),
      severityBand,
      dormant: severityBand === "dormant",
      factionOwner: getDossierFactionOwner(thread.theme),
      nextStep: getDossierNextStep(thread.theme, severityBand),
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
  entries: DossierEvidenceDefinition[] = [],
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
