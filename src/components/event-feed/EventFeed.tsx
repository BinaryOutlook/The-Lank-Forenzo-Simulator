import type { HistoryEntry } from "../../simulation/state/types";
import styles from "./EventFeed.module.css";

interface EventFeedProps {
  history: HistoryEntry[];
}

interface SignalHistoryEntry extends HistoryEntry {
  sourceLabel?: string;
  sourceKind?: string;
  systemKind?: string;
  factionId?: string;
  operationId?: string;
  dossierTheme?: string;
  scheduledEventId?: string;
  cause?: string;
}

function formatLabel(value: string): string {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getSourceLabel(entry: SignalHistoryEntry): string {
  const source = entry.sourceLabel ?? entry.sourceKind ?? entry.systemKind ?? entry.source;

  return formatLabel(source);
}

function getSignalTags(entry: SignalHistoryEntry): string[] {
  return [
    entry.factionId ? `Faction: ${formatLabel(entry.factionId)}` : null,
    entry.operationId ? `Operation: ${formatLabel(entry.operationId)}` : null,
    entry.dossierTheme ? `Dossier: ${formatLabel(entry.dossierTheme)}` : null,
    entry.scheduledEventId ? "Scheduled" : null,
  ].filter((tag): tag is string => Boolean(tag));
}

export function EventFeed({ history }: EventFeedProps) {
  const recentHistory = history.slice(0, 10) as SignalHistoryEntry[];

  return (
    <section className={styles.feed}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Consequence feed</p>
        <h2 className={styles.title}>The world answers back.</h2>
      </div>

      <div className={styles.list}>
        {recentHistory.map((entry) => (
          <article key={entry.id} className={styles.entry}>
            <div className={styles.meta}>
              <span className={styles.round}>R{entry.round}</span>
              <span className={styles.source}>{getSourceLabel(entry)}</span>
            </div>
            {getSignalTags(entry).length > 0 ? (
              <div className={styles.tags} aria-label="System signal sources">
                {getSignalTags(entry).map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
            <h3 className={styles.entryTitle}>{entry.title}</h3>
            <p className={styles.entryBody}>{entry.body}</p>
            {entry.cause ? <p className={styles.cause}>Cause: {entry.cause}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
