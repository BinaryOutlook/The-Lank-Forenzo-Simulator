import type { HistoryEntry } from "../../simulation/state/types";
import styles from "./EventFeed.module.css";

interface EventFeedProps {
  history: HistoryEntry[];
}

export function EventFeed({ history }: EventFeedProps) {
  return (
    <section className={styles.feed}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Consequence feed</p>
        <h2 className={styles.title}>The world answers back.</h2>
      </div>

      <div className={styles.list}>
        {history.map((entry) => (
          <article key={entry.id} className={styles.entry}>
            <div className={styles.meta}>
              <span className={styles.round}>R{entry.round}</span>
              <span className={styles.source}>{entry.source}</span>
            </div>
            <h3 className={styles.entryTitle}>{entry.title}</h3>
            <p className={styles.entryBody}>{entry.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
