import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { formatMetricValue } from "../../lib/formatters.js";
import { useGameStore } from "../../simulation/state/gameStore.js";
import { buildEndingRecapModel } from "./endingRecap.js";
import styles from "./EndingScreen.module.css";

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

  const recapModel = buildEndingRecapModel(run);

  return (
    <motion.section
      className={styles.page}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className={styles.panel}>
        <div className={styles.outcomeHeader}>
          <p className={styles.eyebrow}>Outcome</p>
          <h1 className={styles.title}>{ending.title}</h1>
          <p className={styles.subtitle}>{ending.subtitle}</p>
          <p className={styles.summary}>{ending.summary}</p>
        </div>

        <div className={styles.snapshot} aria-label="Final run metrics">
          <div>
            <span>Personal wealth</span>
            <strong>
              {formatMetricValue("personalWealth", run.metrics.personalWealth)}
            </strong>
          </div>
          <div>
            <span>Legal heat</span>
            <strong>
              {formatMetricValue("legalHeat", run.metrics.legalHeat)}
            </strong>
          </div>
          <div>
            <span>Market confidence</span>
            <strong>
              {formatMetricValue(
                "marketConfidence",
                run.metrics.marketConfidence,
              )}
            </strong>
          </div>
        </div>

        {recapModel.sections.length > 0 ? (
          <section
            className={styles.caseFile}
            aria-labelledby="run-recap-title"
          >
            <div className={styles.recapIntro}>
              <p className={styles.eyebrow}>Case file</p>
              <h2 id="run-recap-title" className={styles.sectionTitle}>
                {recapModel.headline}
              </h2>
              <p className={styles.recapSummary}>{recapModel.summary}</p>
            </div>

            <div className={styles.recapGrid}>
              {recapModel.sections.map((section, index) => (
                <article
                  key={section.kind}
                  className={styles.recapSection}
                  data-section-kind={section.kind}
                >
                  <div className={styles.sectionHeading}>
                    <span className={styles.sectionIndex}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className={styles.sectionKicker}>{section.kicker}</p>
                      <h3>{section.title}</h3>
                    </div>
                  </div>
                  <p className={styles.sectionSummary}>{section.summary}</p>
                  <ul className={styles.recapItems}>
                    {section.items.map((item) => (
                      <li key={`${item.title}-${item.body}`}>
                        <strong>{item.title}</strong>
                        <p>{item.body}</p>
                      </li>
                    ))}
                  </ul>
                </article>
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
