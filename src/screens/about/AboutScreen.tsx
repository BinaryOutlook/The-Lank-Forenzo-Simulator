import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useInteractionFeedback } from "../../components/interaction/useInteractionFeedback.js";
import { useGameStore } from "../../simulation/state/gameStore.js";
import styles from "./AboutScreen.module.css";

const designIntents = [
  {
    title: "Aviation at board altitude",
    body: "The airline matters through fleet credibility, maintenance pressure, labor stress, route fragility, and safety integrity—not through micromanaged dispatch screens.",
  },
  {
    title: "Two ledgers in conflict",
    body: "The central tension is the split between corporate survival and personal escape. A good quarter for the executive can still be terrible for the airline.",
  },
  {
    title: "Satire that plays fair",
    body: "Pressure should be darkly funny, but legible: creditors remember, workers organize, regulators circle, and a dossier forms from repeated misconduct.",
  },
];

export function AboutScreen() {
  const run = useGameStore((state) => state.run);
  const settings = useGameStore((state) => state.settings);
  const interactionEffectsEnabled =
    settings.visualEffectsEnabled && settings.interactionEffectsEnabled;
  const feedback = useInteractionFeedback<HTMLAnchorElement>(
    interactionEffectsEnabled,
  );
  const returnPath = run?.status === "active" ? "/run" : "/";
  const returnLabel =
    run?.status === "active" ? "Return to active run" : "Return to main game";

  return (
    <motion.section
      className={styles.page}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>About the simulator</p>
          <h1 className={styles.title}>
            Aviation management, viewed from the executive escape hatch.
          </h1>
        </div>
        <p className={styles.summary}>
          The Lank Forenzo Simulator is a browser-based strategy game about
          running an airline badly on purpose—and discovering how long polished
          boardroom language can keep reality below cruising altitude.
        </p>
      </header>

      <div className={styles.layout}>
        <section className={styles.panel} aria-labelledby="about-why-title">
          <p className={styles.eyebrow}>Motivation</p>
          <h2 id="about-why-title" className={styles.sectionTitle}>
            Why this game exists
          </h2>
          <p className={styles.bodyCopy}>
            Most airline games reward careful scheduling, clean operations, and
            patient growth. This one looks at the uglier executive layer: debt
            theater, labor cuts, safety shortcuts, market confidence, and the
            private fortune being assembled while the company loses altitude.
          </p>
          <p className={styles.bodyCopy}>
            The goal is not to celebrate the behavior. The goal is to make the
            incentives visible, turn them into tense player choices, and let the
            systems show how quickly clever extraction becomes institutional
            blowback.
          </p>
        </section>

        <aside
          className={styles.callout}
          aria-labelledby="about-flight-plan-title"
        >
          <p className={styles.eyebrow}>Flight plan</p>
          <h2 id="about-flight-plan-title" className={styles.calloutTitle}>
            Keep the airline credible just long enough to leave rich.
          </h2>
          <p className={styles.calloutCopy}>
            Each run asks whether you can sell confidence, delay consequences,
            and reach an exit before creditors, workers, regulators, and the
            market finally compare notes.
          </p>
          <Link
            className={`interaction-feedback-control ${styles.primaryAction}`}
            data-interaction-feedback={feedback.feedbackState}
            onKeyDown={feedback.onFeedbackKeyDown}
            onPointerDown={feedback.onFeedbackPointerDown}
            to={returnPath}
          >
            {returnLabel}
          </Link>
        </aside>
      </div>

      <section
        className={styles.intentGrid}
        aria-labelledby="about-design-title"
      >
        <div className={styles.intentIntro}>
          <p className={styles.eyebrow}>Design intent</p>
          <h2 id="about-design-title" className={styles.sectionTitle}>
            What the experience is trying to create
          </h2>
        </div>

        <div className={styles.cards}>
          {designIntents.map((intent) => (
            <article key={intent.title} className={styles.card}>
              <h3>{intent.title}</h3>
              <p>{intent.body}</p>
            </article>
          ))}
        </div>
      </section>
    </motion.section>
  );
}
