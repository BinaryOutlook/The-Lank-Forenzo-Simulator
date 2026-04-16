import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { formatMetricValue } from "../../lib/formatters";
import { useGameStore } from "../../simulation/state/gameStore";
import type { RunState } from "../../simulation/state/types";
import styles from "./EndingScreen.module.css";

interface RecapItem {
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
  summary?: string;
  exposureCause?: string;
}

interface V05RecapCarrier {
  recap?: {
    headline?: string;
    factions?: RecapItem[];
    operations?: RecapItem[];
    dossiers?: RecapItem[];
    missedExitWindows?: RecapItem[];
    criticalChains?: RecapItem[];
  };
  runSummary?: V05RecapCarrier["recap"];
  endingSummary?: V05RecapCarrier["recap"];
  factions?: FactionRecap[] | Record<string, FactionRecap>;
  factionState?: FactionRecap[] | Record<string, FactionRecap>;
  operations?: OperationalRecap;
  operationalState?: OperationalRecap;
  dossiers?: DossierRecap[] | Record<string, DossierRecap>;
  dossier?: DossierRecap[] | Record<string, DossierRecap>;
  missedExitWindows?: RecapItem[];
  criticalDecisionChains?: RecapItem[];
}

interface RecapSection {
  title: string;
  items: RecapItem[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function recordValues<T>(value: T[] | Record<string, T> | undefined): T[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : Object.values(value);
}

function formatLabel(value: string | undefined, fallback: string): string {
  if (!value) {
    return fallback;
  }

  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeRecapItem(item: RecapItem): RecapItem | null {
  const title = item.title ?? item.label;
  const body = item.body ?? item.summary ?? (item.value === undefined ? undefined : String(item.value));

  if (!title || !body) {
    return null;
  }

  return { title, body };
}

function normalizeRecapItems(items: RecapItem[] | undefined): RecapItem[] {
  return (items ?? [])
    .map(normalizeRecapItem)
    .filter((item): item is RecapItem => Boolean(item))
    .slice(0, 3);
}

function buildFactionItems(run: V05RecapCarrier): RecapItem[] {
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
      const label = faction.label ?? faction.name ?? formatLabel(faction.id, "Faction");
      const intent = formatLabel(faction.intentLabel ?? faction.lastIntentId, "Pressure");
      const pressure = faction.pressure ?? faction.aggression ?? faction.leverage;
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

function buildOperationItems(run: V05RecapCarrier): RecapItem[] {
  const operations = run.operations ?? run.operationalState;

  if (!operations) {
    return [];
  }

  const stressors = [
    typeof operations.maintenanceBacklog === "number" ? `maintenance backlog ${operations.maintenanceBacklog}` : null,
    typeof operations.serviceDisruption === "number" ? `service disruption ${operations.serviceDisruption}` : null,
    typeof operations.networkFragility === "number" ? `network fragility ${operations.networkFragility}` : null,
    typeof operations.weatherExposure === "number" ? `weather exposure ${operations.weatherExposure}` : null,
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

function buildDossierItems(run: V05RecapCarrier): RecapItem[] {
  return recordValues(run.dossiers ?? run.dossier)
    .filter(isRecord)
    .map((thread) => thread as DossierRecap)
    .sort(
      (left, right) =>
        (right.severity ?? right.evidenceCount ?? 0) - (left.severity ?? left.evidenceCount ?? 0),
    )
    .slice(0, 2)
    .map((thread) => {
      const title = thread.label ?? thread.title ?? formatLabel(thread.theme, "Dossier");
      const body =
        thread.summary ??
        [
          typeof thread.severity === "number" ? `severity ${thread.severity}` : null,
          typeof thread.evidenceCount === "number" ? `${thread.evidenceCount} evidence fragments` : null,
          thread.exposureCause,
        ]
          .filter(Boolean)
          .join(". ");

      return { title, body };
    });
}

function buildRecapSections(run: RunState): RecapSection[] {
  const recapRun = run as RunState & V05RecapCarrier;
  const recap = recapRun.recap ?? recapRun.runSummary ?? recapRun.endingSummary;

  return [
    {
      title: "Faction pressure",
      items: normalizeRecapItems(recap?.factions).concat(buildFactionItems(recapRun)).slice(0, 3),
    },
    {
      title: "Operational damage",
      items: normalizeRecapItems(recap?.operations).concat(buildOperationItems(recapRun)).slice(0, 3),
    },
    {
      title: "Dossier trail",
      items: normalizeRecapItems(recap?.dossiers).concat(buildDossierItems(recapRun)).slice(0, 3),
    },
    {
      title: "Missed windows",
      items: normalizeRecapItems(recap?.missedExitWindows ?? recapRun.missedExitWindows),
    },
    {
      title: "Critical chains",
      items: normalizeRecapItems(recap?.criticalChains ?? recapRun.criticalDecisionChains),
    },
  ].filter((section) => section.items.length > 0);
}

export function EndingScreen() {
  const navigate = useNavigate();
  const run = useGameStore((state) => state.run);
  const currentEnding = useGameStore((state) => state.currentEnding);
  const startNewRun = useGameStore((state) => state.startNewRun);
  const clearRun = useGameStore((state) => state.clearRun);

  const ending = currentEnding();

  if (!run || !ending) {
    return null;
  }

  const recapSections = buildRecapSections(run);
  const recapHeadline =
    ((run as RunState & V05RecapCarrier).recap ??
      (run as RunState & V05RecapCarrier).runSummary ??
      (run as RunState & V05RecapCarrier).endingSummary)?.headline;

  return (
    <motion.section
      className={styles.page}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className={styles.panel}>
        <p className={styles.eyebrow}>Outcome</p>
        <h1 className={styles.title}>{ending.title}</h1>
        <p className={styles.subtitle}>{ending.subtitle}</p>
        <p className={styles.summary}>{ending.summary}</p>

        <div className={styles.snapshot}>
          <div>
            <span>Personal wealth</span>
            <strong>{formatMetricValue("personalWealth", run.metrics.personalWealth)}</strong>
          </div>
          <div>
            <span>Legal heat</span>
            <strong>{formatMetricValue("legalHeat", run.metrics.legalHeat)}</strong>
          </div>
          <div>
            <span>Market confidence</span>
            <strong>{formatMetricValue("marketConfidence", run.metrics.marketConfidence)}</strong>
          </div>
        </div>

        {recapSections.length > 0 ? (
          <section className={styles.recap} aria-labelledby="run-recap-title">
            <div>
              <p className={styles.eyebrow}>Run recap</p>
              <h2 id="run-recap-title" className={styles.sectionTitle}>
                {recapHeadline ?? "What the record will remember."}
              </h2>
            </div>

            <div className={styles.recapGrid}>
              {recapSections.map((section) => (
                <section key={section.title} className={styles.recapSection} aria-label={section.title}>
                  <h3>{section.title}</h3>
                  <ul>
                    {section.items.map((item) => (
                      <li key={`${item.title}-${item.body}`}>
                        <span>{item.title}</span>
                        <p>{item.body}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </section>
        ) : null}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryAction}
            onClick={() => {
              startNewRun();
              navigate("/run");
            }}
          >
            Start another run
          </button>

          <button
            type="button"
            className={styles.secondaryAction}
            onClick={() => {
              clearRun();
              navigate("/");
            }}
          >
            Return to lobby
          </button>
        </div>
      </div>
    </motion.section>
  );
}
