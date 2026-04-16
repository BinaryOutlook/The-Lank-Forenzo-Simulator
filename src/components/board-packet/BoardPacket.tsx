import { motion } from "framer-motion";
import { summarizeRun } from "../../lib/formatters";
import { buildBriefingSignals } from "../../simulation/systems/briefing";
import type { RunState } from "../../simulation/state/types";
import styles from "./BoardPacket.module.css";

interface BoardPacketProps {
  run: RunState;
}

interface SignalItem {
  title: string;
  body: string;
}

interface FactionSignal {
  id?: string;
  label?: string;
  name?: string;
  intentLabel?: string;
  lastIntentId?: string;
  pressure?: number;
  aggression?: number;
  leverage?: number;
  recentGrievances?: string[];
  summary?: string;
}

interface OperationalSignal {
  label?: string;
  title?: string;
  summary?: string;
  body?: string;
  maintenanceBacklog?: number;
  serviceDisruption?: number;
  weatherExposure?: number;
  networkFragility?: number;
}

interface DossierSignal {
  theme?: string;
  label?: string;
  title?: string;
  severity?: number;
  evidenceCount?: number;
  summary?: string;
  status?: string;
}

interface V05SignalCarrier {
  pressureRead?: SignalItem[];
  boardSignals?: SignalItem[];
  systemSignals?: SignalItem[];
  factions?: FactionSignal[] | Record<string, FactionSignal>;
  factionState?: FactionSignal[] | Record<string, FactionSignal>;
  operations?: OperationalSignal;
  operationalState?: OperationalSignal;
  dossier?: DossierSignal[] | Record<string, DossierSignal>;
  dossiers?: DossierSignal[] | Record<string, DossierSignal>;
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

function formatPressure(value: number | undefined): string {
  if (typeof value !== "number") {
    return "Pressure building";
  }

  if (value >= 80) {
    return "Critical pressure";
  }

  if (value >= 55) {
    return "Escalating pressure";
  }

  if (value >= 30) {
    return "Watchlist pressure";
  }

  return "Contained pressure";
}

function hasOperationalSignal(signal: OperationalSignal | undefined): signal is OperationalSignal {
  if (!signal) {
    return false;
  }

  return Boolean(
    signal.summary ??
      signal.body ??
      signal.title ??
      signal.label ??
      signal.maintenanceBacklog ??
      signal.serviceDisruption ??
      signal.weatherExposure ??
      signal.networkFragility,
  );
}

function buildFactionSignal(run: V05SignalCarrier): SignalItem | null {
  const factions = recordValues(run.factions ?? run.factionState)
    .filter(isRecord)
    .map((faction) => faction as FactionSignal)
    .sort(
      (left, right) =>
        (right.pressure ?? right.aggression ?? right.leverage ?? 0) -
        (left.pressure ?? left.aggression ?? left.leverage ?? 0),
    );

  const faction = factions[0];

  if (!faction) {
    return null;
  }

  const label = faction.label ?? faction.name ?? formatLabel(faction.id, "Faction");
  const intent = formatLabel(faction.intentLabel ?? faction.lastIntentId, "Monitoring");
  const grievance = faction.recentGrievances?.[0];
  const pressure = formatPressure(faction.pressure ?? faction.aggression ?? faction.leverage);

  return {
    title: `${label}: ${intent}`,
    body: faction.summary ?? [pressure, grievance].filter(Boolean).join(". "),
  };
}

function buildOperationalSignal(run: V05SignalCarrier): SignalItem | null {
  const operations = run.operations ?? run.operationalState;

  if (!hasOperationalSignal(operations)) {
    return null;
  }

  const stressors = [
    typeof operations.maintenanceBacklog === "number" && operations.maintenanceBacklog > 0
      ? `maintenance backlog ${operations.maintenanceBacklog}`
      : null,
    typeof operations.serviceDisruption === "number" && operations.serviceDisruption > 0
      ? `service disruption ${operations.serviceDisruption}`
      : null,
    typeof operations.weatherExposure === "number" && operations.weatherExposure > 0
      ? `weather exposure ${operations.weatherExposure}`
      : null,
    typeof operations.networkFragility === "number" && operations.networkFragility > 0
      ? `network fragility ${operations.networkFragility}`
      : null,
  ].filter(Boolean);

  return {
    title: operations.title ?? operations.label ?? "Operational read",
    body:
      operations.summary ??
      operations.body ??
      (stressors.length > 0
        ? `Network risk is visible in ${stressors.join(", ")}.`
        : "Operations has no single failure yet, but the margin for surprise is narrowing."),
  };
}

function buildDossierSignal(run: V05SignalCarrier): SignalItem | null {
  const dossiers = recordValues(run.dossiers ?? run.dossier)
    .filter(isRecord)
    .map((thread) => thread as DossierSignal)
    .sort(
      (left, right) =>
        (right.severity ?? right.evidenceCount ?? 0) - (left.severity ?? left.evidenceCount ?? 0),
    );

  const dossier = dossiers[0];

  if (!dossier) {
    return null;
  }

  const label = dossier.label ?? dossier.title ?? formatLabel(dossier.theme, "Dossier");
  const evidence =
    typeof dossier.evidenceCount === "number" ? `${dossier.evidenceCount} evidence fragments` : dossier.status;

  return {
    title: `${label} dossier`,
    body:
      dossier.summary ??
      [typeof dossier.severity === "number" ? `Severity ${dossier.severity}` : null, evidence]
        .filter(Boolean)
        .join(". "),
  };
}

function buildV05Signals(run: RunState): SignalItem[] {
  const signalRun = run as RunState & V05SignalCarrier;
  const authoredSignals = [
    ...(signalRun.pressureRead ?? []),
    ...(signalRun.boardSignals ?? []),
    ...(signalRun.systemSignals ?? []),
  ].filter((signal) => signal.title && signal.body);

  const inferredSignals = [
    buildFactionSignal(signalRun),
    buildOperationalSignal(signalRun),
    buildDossierSignal(signalRun),
  ].filter((signal): signal is SignalItem => Boolean(signal));

  return [...authoredSignals, ...inferredSignals].slice(0, 4);
}

export function BoardPacket({ run }: BoardPacketProps) {
  const signals = buildBriefingSignals(run);
  const v05Signals = buildV05Signals(run);

  return (
    <section className={styles.packet}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Board packet</p>
        <h1 className={styles.title}>Temporary credibility is still the most valuable asset on the table.</h1>
        <p className={styles.summary}>{summarizeRun(run.metrics)}</p>
      </div>

      <div className={styles.columns}>
        <div className={styles.memo}>
          <p className={styles.memoLabel}>This round</p>
          <p className={styles.memoBody}>
            Strip value without letting the room agree that this is what you are doing. Keep lenders, analysts,
            and regulators from arriving at the same conclusion at the same time.
          </p>
        </div>

        <div className={styles.signals}>
          {signals.map((signal, index) => (
            <motion.article
              key={signal.title}
              className={styles.signal}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.35 }}
            >
              <p className={styles.signalTitle}>{signal.title}</p>
              <p className={styles.signalBody}>{signal.body}</p>
            </motion.article>
          ))}
        </div>
      </div>

      {v05Signals.length > 0 ? (
        <section className={styles.pressureRead} aria-labelledby="pressure-read-title">
          <div>
            <p className={styles.eyebrow}>Pressure read</p>
            <h2 id="pressure-read-title" className={styles.sectionTitle}>
              System memory now has a shape.
            </h2>
          </div>

          <div className={styles.pressureGrid}>
            {v05Signals.map((signal) => (
              <article key={signal.title} className={styles.pressureSignal}>
                <p className={styles.signalTitle}>{signal.title}</p>
                <p className={styles.signalBody}>{signal.body}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
