export type DossierTheme =
  | "insider_trading"
  | "maintenance_fraud"
  | "labor_abuse"
  | "regulatory_capture"
  | "offshore_evasion";

export interface DossierThread {
  id: string;
  theme: DossierTheme;
  severity: number;
  evidenceWeight: number;
  witnesses: string[];
  linkedDecisionIds: string[];
  linkedEventIds: string[];
  dormant: boolean;
}

export interface DossierSummary {
  theme: DossierTheme;
  severity: number;
  evidenceWeight: number;
  likelyExposure: string;
  witnesses: string[];
}

export const dossierThemes: DossierTheme[] = [
  "insider_trading",
  "maintenance_fraud",
  "labor_abuse",
  "regulatory_capture",
  "offshore_evasion",
];

export function createInitialDossierState(): DossierThread[] {
  return dossierThemes.map((theme) => ({
    id: `${theme}-thread`,
    theme,
    severity: 0,
    evidenceWeight: 0,
    witnesses: [],
    linkedDecisionIds: [],
    linkedEventIds: [],
    dormant: true,
  }));
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
      likelyExposure:
        thread.linkedEventIds.at(-1) ??
        thread.linkedDecisionIds.at(-1) ??
        "unfiled evidence",
      witnesses: thread.witnesses,
    }));
}
