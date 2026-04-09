import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../../simulation/state/gameStore";
import styles from "./LandingScreen.module.css";

const pillars = [
  "Shrink first. Justify later.",
  "Separate your fortune from the airline's health.",
  "Keep lenders, unions, and regulators from aligning.",
];

export function LandingScreen() {
  const navigate = useNavigate();
  const startNewRun = useGameStore((state) => state.startNewRun);
  const run = useGameStore((state) => state.run);

  return (
    <section className={styles.page}>
      <motion.div
        className={styles.hero}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Browser reboot</p>
          <h1 className={styles.title}>Run the airline badly on purpose. <br /> <br /> Do it elegantly enough to leave rich.</h1>
          <p className={styles.summary}>
            This is a turn-based extraction game about labor cuts, leverage, stock exits, legal heat, and the precise
            moment when saving the company becomes less interesting than escaping it.
          </p>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryAction}
              onClick={() => {
                startNewRun();
                navigate("/run");
              }}
            >
              Start a new run
            </button>

            <button
              type="button"
              className={styles.secondaryAction}
              onClick={() => navigate("/run")}
              disabled={!run}
            >
              Resume local save
            </button>
          </div>
        </div>

        <div className={styles.poster}>
          <p className={styles.posterLabel}>Operating doctrine</p>
          <ul className={styles.pillars}>
            {pillars.map((pillar) => (
              <li key={pillar}>{pillar}</li>
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  );
}
