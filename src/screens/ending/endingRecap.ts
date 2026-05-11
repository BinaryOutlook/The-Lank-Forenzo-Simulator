import type { RunState } from "../../simulation/state/types.js";

interface FlexibleRecapItem {
  label?: string;
  title?: string;
  body?: string;
  summary?: string;
  value?: string | number;
}

interface FactionRecap {
  id?: string;
  label?: string;
  name?: string;
  pressure?: number;
  aggression?: number;
  leverage?: number;
  lastIntentId?: string;
  intentLabel?: string;
  summary?: string;
  recentGrievances?: string[];
}

interface OperationalRecap {
  label?: string;
  title?: string;
  summary?: string;
  body?: string;
  cascade?: string;
  mostDamagingCascade?: string;
  maintenanceBacklog?: number;
  serviceDisruption?: number;
  networkFragility?: number;
  weatherExposure?: number;
}

interface DossierRecap {
  theme?: string;
  label?: string;
  title?: string;
  severity?: number;
  evidenceCount?: number;
  evidenceWeight?: number;
  summary?: string;
  exposureCause?: string;
  likelyExposure?: string;
}

interface FlexibleRunRecap {
  headline?: string;
  outcome?: FlexibleRecapItem[];
  dominantStrategy?: FlexibleRecapItem[];
  factions?: FlexibleRecapItem[];
  operations?: FlexibleRecapItem[];
  dossiers?: FlexibleRecapItem[];
  missedExitWindows?: FlexibleRecapItem[];
  criticalChains?: FlexibleRecapItem[];
}

interface RecapCarrier {
  recap?: FlexibleRunRecap | null;
  runSummary?: FlexibleRunRecap | null;
  endingSummary?: FlexibleRunRecap | null;
  factions?: FactionRecap[] | Record<string, FactionRecap>;
  factionState?: FactionRecap[] | Record<string, FactionRecap>;
  operations?: OperationalRecap;
  operationalState?: OperationalRecap;
  dossiers?: DossierRecap[] | Record<string, DossierRecap>;
  dossier?: DossierRecap[] | Record<string, DossierRecap>;
  missedExitWindows?: FlexibleRecapItem[];
  criticalDecisionChains?: FlexibleRecapItem[];
}

export type EndingRecapSectionKind =
  | "outcome"
  | "strategy"
  | "factions"
  | "operations"
  | "dossiers"
  | "windows"
  | "chains";

export interface EndingRecapItem {
  title: string;
  body: string;
}

export interface EndingRecapSection {
  kind: EndingRecapSectionKind;
  kicker: string;
  title: string;
  summary: string;
  items: EndingRecapItem[];
}

export interface EndingRecapModel {
  headline: string;
  summary: string;
  sections: EndingRecapSection[];
}

interface SectionDefinition {
  kind: EndingRecapSectionKind;
  kicker: string;
  title: string;
  summary: string;
}

const SECTION_DEFINITIONS: Record<EndingRecapSectionKind, SectionDefinition> = {
  outcome: {
    kind: "outcome",
    kicker: "Outcome trigger",
    title: "Why the run ended",
    summary:
      "The immediate cause that closed the simulation instead of letting the room keep bargaining.",
  },
  strategy: {
    kind: "strategy",
    kicker: "Dominant strategy",
    title: "The method you taught the world",
    summary:
      "The repeated pattern that made the scandal readable after the fact.",
  },
  factions: {
    kind: "factions",
    kicker: "Faction pressure",
    title: "Who broke first",
    summary:
      "The institution with enough leverage, anger, or evidence to stop playing along.",
  },
  operations: {
    kind: "operations",
    kicker: "Operational cascade",
    title: "How the airline carried the damage",
    summary:
      "The network failure or accumulated drag that made the story visible to passengers and crews.",
  },
  dossiers: {
    kind: "dossiers",
    kicker: "Dossier file",
    title: "What the world could prove",
    summary:
      "The evidence thread most capable of turning bad management into a case theory.",
  },
  windows: {
    kind: "windows",
    kicker: "Missed windows",
    title: "The exits left on the table",
    summary:
      "Viable or near-viable escape routes that closed before they became your ending.",
  },
  chains: {
    kind: "chains",
    kicker: "Final chain",
    title: "The last moves in the record",
    summary:
      "Decision links that made the ending feel authored rather than accidental.",
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function recordValues<T>(value: T[] | Record<string, T> | undefined): T[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : Object.values(value);
}

function formatLabel(
  value: string | undefined | null,
  fallback: string,
): string {
  if (!value) {
    return fallback;
  }

  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeRecapItem(item: FlexibleRecapItem): EndingRecapItem | null {
  const title = item.title ?? item.label;
  const body =
    item.body ??
    item.summary ??
    (item.value === undefined ? undefined : String(item.value));

  if (!title || !body) {
    return null;
  }

  return { title, body };
}

function normalizeRecapItems(
  items: FlexibleRecapItem[] | undefined,
): EndingRecapItem[] {
  return (items ?? [])
    .map(normalizeRecapItem)
    .filter((item): item is EndingRecapItem => Boolean(item))
    .slice(0, 3);
}

function buildOutcomeFallback(run: RunState): EndingRecapItem[] {
  if (!run.endingId) {
    return [];
  }

  if (run.endingId === "prison") {
    return [
      {
        title: "Why it ended",
        body: `Legal heat ended at ${run.metrics.legalHeat}. The scandal had enough paper, pressure, and timing to become a prosecution story.`,
      },
    ];
  }

  if (run.endingId === "forcedRemoval") {
    return [
      {
        title: "Why it ended",
        body: `Cash ${run.metrics.airlineCash}, creditor patience ${run.metrics.creditorPatience}, and market confidence ${run.metrics.marketConfidence} left the board with removal as the cleanest lie.`,
      },
    ];
  }

  return [
    {
      title: "Why it ended",
      body: `${formatLabel(run.endingId, "Exit")} fired before the pressure systems could force a worse ending.`,
    },
  ];
}

function buildStrategyFallback(
  recap: FlexibleRunRecap | null | undefined,
): EndingRecapItem[] {
  const chainItems = normalizeRecapItems(recap?.criticalChains);
  const [chainItem] = chainItems;

  if (!chainItem) {
    return [];
  }

  return [
    {
      title: "Final-quarter pattern",
      body: `${chainItem.title} became the clearest surviving clue. ${chainItem.body}`,
    },
  ];
}

function buildFactionItems(run: RecapCarrier): EndingRecapItem[] {
  return recordValues(run.factions ?? run.factionState)
    .filter(isRecord)
    .map((faction) => faction as FactionRecap)
    .sort(
      (left, right) =>
        (right.pressure ?? right.aggression ?? right.leverage ?? 0) -
        (left.pressure ?? left.aggression ?? left.leverage ?? 0),
    )
    .slice(0, 2)
    .map((faction) => {
      const label =
        faction.label ?? faction.name ?? formatLabel(faction.id, "Faction");
      const intent = formatLabel(
        faction.intentLabel ?? faction.lastIntentId,
        "Pressure",
      );
      const pressure =
        faction.pressure ?? faction.aggression ?? faction.leverage;
      const body =
        faction.summary ??
        [
          intent,
          typeof pressure === "number" ? `pressure ${pressure}` : null,
          faction.recentGrievances?.[0],
        ]
          .filter(Boolean)
          .join(". ");

      return { title: label, body };
    });
}

function buildOperationItems(run: RecapCarrier): EndingRecapItem[] {
  const operations = run.operations ?? run.operationalState;

  if (!operations) {
    return [];
  }

  const stressors = [
    typeof operations.maintenanceBacklog === "number"
      ? `maintenance backlog ${operations.maintenanceBacklog}`
      : null,
    typeof operations.serviceDisruption === "number"
      ? `service disruption ${operations.serviceDisruption}`
      : null,
    typeof operations.networkFragility === "number"
      ? `network fragility ${operations.networkFragility}`
      : null,
    typeof operations.weatherExposure === "number"
      ? `weather exposure ${operations.weatherExposure}`
      : null,
  ].filter(Boolean);

  const body =
    operations.summary ??
    operations.body ??
    operations.mostDamagingCascade ??
    operations.cascade ??
    (stressors.length > 0 ? stressors.join(", ") : undefined);

  return body
    ? [
        {
          title: operations.title ?? operations.label ?? "Operational cascade",
          body,
        },
      ]
    : [];
}

function buildDossierItems(run: RecapCarrier): EndingRecapItem[] {
  return recordValues(run.dossiers ?? run.dossier)
    .filter(isRecord)
    .map((thread) => thread as DossierRecap)
    .sort(
      (left, right) =>
        (right.severity ?? right.evidenceWeight ?? right.evidenceCount ?? 0) -
        (left.severity ?? left.evidenceWeight ?? left.evidenceCount ?? 0),
    )
    .slice(0, 2)
    .map((thread) => {
      const title =
        thread.label ??
        thread.title ??
        `${formatLabel(thread.theme, "Dossier")} file`;
      const evidence = thread.evidenceWeight ?? thread.evidenceCount;
      const body =
        thread.summary ??
        [
          typeof thread.severity === "number"
            ? `severity ${thread.severity}`
            : null,
          typeof evidence === "number" ? `evidence weight ${evidence}` : null,
          thread.likelyExposure
            ? `likely exposure ${formatLabel(thread.likelyExposure, "Exposure")}`
            : null,
          thread.exposureCause,
        ]
          .filter(Boolean)
          .join(". ");

      return { title, body };
    });
}

function withFallback(
  primary: EndingRecapItem[],
  fallback: EndingRecapItem[],
): EndingRecapItem[] {
  return (primary.length > 0 ? primary : fallback).slice(0, 3);
}

function createSection(
  kind: EndingRecapSectionKind,
  items: EndingRecapItem[],
): EndingRecapSection | null {
  if (items.length === 0) {
    return null;
  }

  return {
    ...SECTION_DEFINITIONS[kind],
    items,
  };
}

function isSection(
  section: EndingRecapSection | null,
): section is EndingRecapSection {
  return section !== null;
}

export function buildEndingRecapModel(run: RunState): EndingRecapModel {
  const recapRun = run as RunState & RecapCarrier;
  const recap = recapRun.recap ?? recapRun.runSummary ?? recapRun.endingSummary;
  const headline =
    recap?.headline ??
    (run.endingId
      ? `The ${formatLabel(run.endingId, "ending")} record is now legible.`
      : "The case file is still forming.");
  const sections = [
    createSection(
      "outcome",
      withFallback(
        normalizeRecapItems(recap?.outcome),
        buildOutcomeFallback(run),
      ),
    ),
    createSection(
      "strategy",
      withFallback(
        normalizeRecapItems(recap?.dominantStrategy),
        buildStrategyFallback(recap),
      ),
    ),
    createSection(
      "factions",
      withFallback(
        normalizeRecapItems(recap?.factions),
        buildFactionItems(recapRun),
      ),
    ),
    createSection(
      "operations",
      withFallback(
        normalizeRecapItems(recap?.operations),
        buildOperationItems(recapRun),
      ),
    ),
    createSection(
      "dossiers",
      withFallback(
        normalizeRecapItems(recap?.dossiers),
        buildDossierItems(recapRun),
      ),
    ),
    createSection(
      "windows",
      normalizeRecapItems(
        recap?.missedExitWindows ?? recapRun.missedExitWindows,
      ),
    ),
    createSection(
      "chains",
      normalizeRecapItems(
        recap?.criticalChains ?? recapRun.criticalDecisionChains,
      ),
    ),
  ].filter(isSection);

  return {
    headline,
    summary:
      "A concise case summary of the strategy, pressure, proof, operational damage, and exit windows that shaped this ending.",
    sections,
  };
}
