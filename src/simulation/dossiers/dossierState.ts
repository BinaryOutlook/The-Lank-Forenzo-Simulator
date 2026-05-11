import { dossierThemes } from "../content/metadata";
import type { FactionId } from "../factions/factionState";

export type DossierTheme = (typeof dossierThemes)[number];

export type DossierSeverityBand =
  | "dormant"
  | "light"
  | "medium"
  | "heavy"
  | "terminal";

export interface DossierThread {
  id: string;
  theme: DossierTheme;
  severity: number;
  evidenceWeight: number;
  severityBand: DossierSeverityBand;
  witnesses: string[];
  linkedDecisionIds: string[];
  linkedEventIds: string[];
  dormant: boolean;
  factionOwner: FactionId;
  nextStep: string;
}

export interface DossierSummary {
  theme: DossierTheme;
  severity: number;
  evidenceWeight: number;
  severityBand: DossierSeverityBand;
  likelyExposure: string;
  witnesses: string[];
  factionOwner: FactionId;
  nextStep: string;
  caseTheory: string;
}

export { dossierThemes };

export function createInitialDossierState(): DossierThread[] {
  return dossierThemes.map((theme) => ({
    id: `${theme}-thread`,
    theme,
    severity: 0,
    evidenceWeight: 0,
    severityBand: "dormant",
    witnesses: [],
    linkedDecisionIds: [],
    linkedEventIds: [],
    dormant: true,
    factionOwner: getDossierFactionOwner(theme),
    nextStep: getDossierNextStep(theme, "dormant"),
  }));
}

export function normalizeDossierState(
  dossiers: DossierThread[] | undefined,
): DossierThread[] {
  if (!dossiers) {
    return createInitialDossierState();
  }

  const currentByTheme = new Map(dossiers.map((thread) => [thread.theme, thread]));

  return createInitialDossierState().map((initialThread) => {
    const current = currentByTheme.get(initialThread.theme);

    if (!current) {
      return initialThread;
    }

    const severityBand =
      current.severityBand ?? getDossierSeverityBand(current.evidenceWeight);

    return {
      ...initialThread,
      ...current,
      severityBand,
      dormant: severityBand === "dormant",
      factionOwner: current.factionOwner ?? getDossierFactionOwner(current.theme),
      nextStep:
        current.nextStep ?? getDossierNextStep(current.theme, severityBand),
    };
  });
}

export function summarizeDossiers(
  dossiers: DossierThread[],
  limit = 3,
): DossierSummary[] {
  return dossiers
    .filter((thread) => thread.evidenceWeight > 0)
    .sort((left, right) => {
      if (right.evidenceWeight !== left.evidenceWeight) {
        return right.evidenceWeight - left.evidenceWeight;
      }

      return left.theme.localeCompare(right.theme);
    })
    .slice(0, limit)
    .map((thread) => ({
      theme: thread.theme,
      severity: thread.severity,
      evidenceWeight: thread.evidenceWeight,
      severityBand: getDossierSeverityBand(thread.evidenceWeight),
      likelyExposure:
        thread.linkedEventIds.at(-1) ??
        thread.linkedDecisionIds.at(-1) ??
        "unfiled evidence",
      witnesses: thread.witnesses,
      factionOwner: thread.factionOwner,
      nextStep: thread.nextStep,
      caseTheory: getDossierCaseTheory(thread.theme),
    }));
}

export function getDossierSeverityBand(weight: number): DossierSeverityBand {
  if (weight >= 70) {
    return "terminal";
  }

  if (weight >= 48) {
    return "heavy";
  }

  if (weight >= 30) {
    return "medium";
  }

  if (weight >= 12) {
    return "light";
  }

  return "dormant";
}

export function getDossierFactionOwner(theme: DossierTheme): FactionId {
  switch (theme) {
    case "labor_abuse":
      return "labor";
    case "maintenance_fraud":
    case "regulatory_capture":
      return "regulators";
    case "creditor_deception":
      return "creditors";
    case "board_self_dealing":
      return "board";
    case "insider_trading":
    case "offshore_evasion":
      return "press";
  }
}

export function getDossierNextStep(
  theme: DossierTheme,
  severityBand: DossierSeverityBand,
): string {
  if (severityBand === "dormant") {
    return "unopened file";
  }

  if (severityBand === "terminal") {
    return "criminal referral package";
  }

  if (severityBand === "heavy") {
    switch (theme) {
      case "creditor_deception":
        return "forced discovery fight";
      case "maintenance_fraud":
      case "regulatory_capture":
        return "forced oversight hearing";
      case "labor_abuse":
        return "class-action consolidation";
      case "board_self_dealing":
        return "special committee subpoena";
      case "insider_trading":
        return "subpoenaed trading chronology";
      case "offshore_evasion":
        return "cross-border asset freeze motion";
    }
  }

  if (severityBand === "medium") {
    switch (theme) {
      case "creditor_deception":
        return "creditor committee demand";
      case "maintenance_fraud":
      case "regulatory_capture":
        return "formal investigative demand";
      case "labor_abuse":
        return "union discovery request";
      case "board_self_dealing":
        return "board minutes preservation order";
      case "insider_trading":
        return "broker record hold";
      case "offshore_evasion":
        return "beneficial-owner query";
    }
  }

  return "board packet warning";
}

export function getDossierCaseTheory(theme: DossierTheme): string {
  switch (theme) {
    case "insider_trading":
      return "Investigators are tying market optimism and stock-sale timing into one trading chronology.";
    case "maintenance_fraud":
      return "The file argues that safety paperwork converted known maintenance risk into booked performance.";
    case "labor_abuse":
      return "The labor record links cuts, benefit pressure, and grievance tactics into a coercion pattern.";
    case "regulatory_capture":
      return "The case theory says oversight was managed through access, scope control, and procedural theater.";
    case "offshore_evasion":
      return "The offshore trail connects island retainers, nominees, and asset movement before exposure.";
    case "creditor_deception":
      return "The creditor case links ticket-float cash, venue games, and lender messaging into a deception theory.";
    case "board_self_dealing":
      return "The board file frames compensation, indemnity, and insider paperwork as self-protection over stewardship.";
  }
}
