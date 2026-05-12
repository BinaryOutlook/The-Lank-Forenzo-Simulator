import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { InteractionFeedbackButton } from "../../components/interaction/InteractionFeedbackButton.js";
import { useInteractionFeedback } from "../../components/interaction/useInteractionFeedback.js";
import { useGameStore } from "../../simulation/state/gameStore.js";
import styles from "./TutorialScreen.module.css";

const runFlowSteps = [
  {
    title: "Read the board packet",
    body: "Start each round by checking the brief: it summarizes the current corporate story, where pressure is gathering, and which exit windows may be opening.",
  },
  {
    title: "Pick two decisions",
    body: "Choose the pair of cards that best fits your plan. A card can buy time, raise personal wealth, calm a faction, or quietly create tomorrow's scandal.",
  },
  {
    title: "Watch the state move",
    body: "After resolving the quarter, metrics, reserves, faction pressure, operational fragility, and dossier evidence all update from your choices and queued fallout.",
  },
  {
    title: "Handle delayed trouble",
    body: "Hazards, scandals, and faction responses can arrive later. Treat clean-looking quarters with suspicion; the world remembers your method.",
  },
  {
    title: "Take an exit before collapse",
    body: "A good run ends when you deliberately choose a viable exit. Waiting too long lets creditors, regulators, safety decay, or the market choose for you.",
  },
];

const keyConcepts = [
  {
    title: "Two ledgers",
    body: "The airline's health and your personal fortune are separate. The company can be bleeding while you are still closer to winning.",
  },
  {
    title: "Factions",
    body: "Labor, creditors, regulators, the press, and the board develop pressure and memory from repeated behavior, not just one bad quarter.",
  },
  {
    title: "Scandals and dossier proof",
    body: "Risky decisions can leave evidence. Dossier weight makes legal and reputational blowback more credible as the run continues.",
  },
  {
    title: "Hazards",
    body: "High heat, weak safety, angry workers, debt stress, and exposed evidence can schedule extra events that complicate your plan.",
  },
  {
    title: "Strategic reserves",
    body: "Some powerful plays spend strategic cash, personal assets, or public relations capital. If the reserve cannot cover the cost, the card is not truly available.",
  },
  {
    title: "Endings and recap",
    body: "Merger, extraction, and Bahamas are voluntary success lanes. Forced removal and prison are automatic failures. The recap explains why the ending happened.",
  },
];

const uiAreas = [
  {
    title: "Brief panel",
    body: "Your fast read on the quarter's story, urgent risks, and executive posture.",
  },
  {
    title: "State and metric rail",
    body: "The live scorecard for money, confidence, legal heat, safety, labor, creditors, and market credibility.",
  },
  {
    title: "Decision tray",
    body: "The actionable card set for the round. Check impacts, costs, requirements, and delayed consequences before selecting.",
  },
  {
    title: "Consequence feed",
    body: "The running log of events, faction responses, delayed fallout, and previous quarter results.",
  },
  {
    title: "Quarter controls",
    body: "Your selection counter and resolve button. On portrait layouts, controls stay reachable while panels move behind tabs.",
  },
  {
    title: "Ending recap",
    body: "The case summary after a run, including the trigger, dominant strategy, faction pressure, evidence, and missed windows.",
  },
];

const tips = [
  "Do not chase every green number. A stronger airline is useful only if it keeps your chosen exit alive.",
  "Legal heat and safety damage are inverse-pressure metrics: lower is usually healthier, even if the card impact uses a negative number.",
  "If an exit card appears, pause before taking one more quarter. Many failures arrive because the player waited for a slightly cleaner score.",
  "Use Options if motion, audio, wallpaper, or UI density distracts from reading the run.",
];

export function TutorialScreen() {
  const navigate = useNavigate();
  const run = useGameStore((state) => state.run);
  const settings = useGameStore((state) => state.settings);
  const startNewRun = useGameStore((state) => state.startNewRun);
  const interactionEffectsEnabled =
    settings.visualEffectsEnabled && settings.interactionEffectsEnabled;
  const linkFeedback = useInteractionFeedback<HTMLAnchorElement>(
    interactionEffectsEnabled,
  );
  const hasActiveRun = run?.status === "active";

  const handlePrimaryAction = () => {
    if (!hasActiveRun) {
      startNewRun();
    }

    navigate("/run");
  };

  return (
    <motion.section
      className={styles.page}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Tutorial</p>
          <h1 className={styles.title}>
            Learn the loop before the creditors do.
          </h1>
        </div>
        <div className={styles.heroCopy}>
          <p className={styles.summary}>
            This guide gives new players the practical shape of a run: what you
            are trying to accomplish, how decisions work, where to read the UI,
            and why a polished quarter can still be a trap.
          </p>
          <div className={styles.actions}>
            <InteractionFeedbackButton
              feedbackEnabled={interactionEffectsEnabled}
              className={styles.primaryAction}
              onClick={handlePrimaryAction}
            >
              {hasActiveRun ? "Return to active run" : "Start a new run"}
            </InteractionFeedbackButton>
            <Link
              className={`interaction-feedback-control ${styles.secondaryAction}`}
              data-interaction-feedback={linkFeedback.feedbackState}
              onKeyDown={linkFeedback.onFeedbackKeyDown}
              onPointerDown={linkFeedback.onFeedbackPointerDown}
              to="/"
            >
              Return home
            </Link>
          </div>
        </div>
      </header>

      <div className={styles.layout}>
        <div className={styles.mainColumn}>
          <section className={styles.panel} aria-labelledby="objective-title">
            <p className={styles.eyebrow}>Objective</p>
            <h2 id="objective-title" className={styles.sectionTitle}>
              Leave rich before the bill comes due.
            </h2>
            <p className={styles.bodyCopy}>
              The Lank Forenzo Simulator is not asking you to save the airline
              at all costs. A successful run means reaching a voluntary exit—
              merger, personal extraction, or Bahamas escape—before automatic
              failures such as forced removal or prison take over.
            </p>
            <p className={styles.bodyCopy}>
              Your job is to keep the company credible enough to keep operating
              while converting that temporary credibility into your own exit
              position. The dangerous part is that every shortcut teaches the
              world how to come after you.
            </p>
          </section>

          <section className={styles.panel} aria-labelledby="controls-title">
            <p className={styles.eyebrow}>Controls</p>
            <h2 id="controls-title" className={styles.sectionTitle}>
              Click two decisions, then review the quarter.
            </h2>
            <ul className={styles.bulletList}>
              <li>
                Use the top navigation for Tutorial, About, and Options without
                losing an active local run.
              </li>
              <li>
                Start or resume from the landing screen, then use the run screen
                as the main board packet.
              </li>
              <li>
                Select two decision cards per round. Selected cards show a
                pressed state before you commit.
              </li>
              <li>
                End the quarter when ready. The review dialog catches missing
                choices or confirms the pair before the feed reports fallout.
              </li>
            </ul>
          </section>

          <section className={styles.panel} aria-labelledby="run-flow-title">
            <p className={styles.eyebrow}>Run flow</p>
            <h2 id="run-flow-title" className={styles.sectionTitle}>
              One ugly quarter at a time.
            </h2>
            <ol className={styles.stepList}>
              {runFlowSteps.map((step, index) => (
                <li key={step.title} className={styles.step}>
                  <span className={styles.stepNumber}>{index + 1}</span>
                  <span>
                    <strong>{step.title}</strong>
                    <span>{step.body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.panel} aria-labelledby="concepts-title">
            <p className={styles.eyebrow}>Key concepts</p>
            <h2 id="concepts-title" className={styles.sectionTitle}>
              What the simulation is tracking.
            </h2>
            <div className={styles.conceptGrid}>
              {keyConcepts.map((concept) => (
                <article key={concept.title} className={styles.conceptCard}>
                  <h3>{concept.title}</h3>
                  <p>{concept.body}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className={styles.sideColumn}>
          <section className={styles.panel} aria-labelledby="ui-title">
            <p className={styles.eyebrow}>Run UI</p>
            <h2 id="ui-title" className={styles.sideTitle}>
              Where to look during play.
            </h2>
            <dl className={styles.uiList}>
              {uiAreas.map((area) => (
                <div key={area.title} className={styles.uiItem}>
                  <dt>{area.title}</dt>
                  <dd>{area.body}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={styles.callout} aria-labelledby="tips-title">
            <p className={styles.eyebrow}>Tips</p>
            <h2 id="tips-title" className={styles.sideTitle}>
              First-run instincts worth keeping.
            </h2>
            <ul className={styles.tipList}>
              {tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </motion.section>
  );
}
