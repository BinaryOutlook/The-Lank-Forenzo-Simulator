import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { InteractionFeedbackButton } from "../../components/interaction/InteractionFeedbackButton.js";
import { useGameStore } from "../../simulation/state/gameStore.js";
import styles from "./LandingScreen.module.css";

const pillars = [
  "Shrink first. Justify later.",
  "Separate your fortune from the airline's health.",
  "Keep lenders, unions, and regulators from aligning.",
];

function LandingPosterArt() {
  return (
    <svg
      className={styles.posterArtSvg}
      viewBox="0 0 420 620"
      role="presentation"
      focusable="false"
    >
      <defs>
        <pattern
          id="landing-poster-primary-dots"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          <circle
            className={styles.posterPrimaryDot}
            cx="2.5"
            cy="2.5"
            r="1.55"
          />
        </pattern>
        <pattern
          id="landing-poster-secondary-dots"
          width="12"
          height="12"
          patternUnits="userSpaceOnUse"
        >
          <circle className={styles.posterSecondaryDot} cx="3" cy="3" r="1.7" />
        </pattern>
      </defs>

      <rect
        className={styles.posterField}
        width="420"
        height="620"
        fill="url(#landing-poster-secondary-dots)"
      />
      <path
        className={styles.aircraftBody}
        d="M12 265 C96 218 229 193 407 205 L407 250 C234 260 103 287 12 335 Z"
        fill="url(#landing-poster-primary-dots)"
      />
      <path
        className={styles.aircraftWing}
        d="M132 246 L340 104 L390 118 L207 284 Z"
        fill="url(#landing-poster-secondary-dots)"
      />
      <path
        className={styles.aircraftTail}
        d="M262 44 L407 76 L407 229 L232 192 Z"
        fill="url(#landing-poster-primary-dots)"
      />
      <path
        className={styles.aircraftStripe}
        d="M232 191 L407 142 L407 169 L252 220 Z"
        fill="url(#landing-poster-secondary-dots)"
      />
      <text
        className={styles.aircraftMark}
        x="295"
        y="134"
        fill="url(#landing-poster-secondary-dots)"
      >
        LFS
      </text>

      <path
        className={styles.figureBust}
        d="M77 612 C90 497 143 436 225 430 C305 436 357 500 372 612 Z"
        fill="url(#landing-poster-primary-dots)"
      />
      <path
        className={styles.figureCollar}
        d="M154 464 L206 532 L254 462 C236 451 176 451 154 464 Z"
        fill="url(#landing-poster-secondary-dots)"
      />
      <path
        className={styles.figureTie}
        d="M206 522 L235 612 L184 612 Z"
        fill="url(#landing-poster-secondary-dots)"
      />
      <ellipse
        className={styles.figureHead}
        cx="216"
        cy="349"
        rx="86"
        ry="104"
        fill="url(#landing-poster-primary-dots)"
      />
      <path
        className={styles.figureHair}
        d="M126 337 C131 269 182 227 248 247 C286 258 306 287 306 327 C270 298 211 297 170 328 C153 341 139 344 126 337 Z"
        fill="url(#landing-poster-secondary-dots)"
      />
      <path
        className={styles.figureProfile}
        d="M238 333 C278 350 303 383 300 407 C271 400 246 388 223 368 C231 357 236 346 238 333 Z"
        fill="url(#landing-poster-secondary-dots)"
      />
    </svg>
  );
}

export function LandingScreen() {
  const navigate = useNavigate();
  const startNewRun = useGameStore((state) => state.startNewRun);
  const run = useGameStore((state) => state.run);
  const settings = useGameStore((state) => state.settings);
  const interactionEffectsEnabled =
    settings.visualEffectsEnabled && settings.interactionEffectsEnabled;

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
          <h1 className={styles.title}>
            Run the airline badly on purpose. <br /> <br /> Do it elegantly
            enough to leave rich.
          </h1>
          <p className={styles.summary}>
            This is a turn-based extraction game about labor cuts, leverage,
            stock exits, legal heat, and the precise moment when saving the
            company becomes less interesting than escaping it.
          </p>

          <div className={styles.actions}>
            <InteractionFeedbackButton
              feedbackEnabled={interactionEffectsEnabled}
              className={styles.primaryAction}
              onClick={() => {
                startNewRun();
                navigate("/run");
              }}
            >
              Start a new run
            </InteractionFeedbackButton>

            <InteractionFeedbackButton
              feedbackEnabled={interactionEffectsEnabled}
              className={styles.secondaryAction}
              onClick={() => navigate("/run")}
              disabled={!run}
            >
              Resume local save
            </InteractionFeedbackButton>

            <InteractionFeedbackButton
              feedbackEnabled={interactionEffectsEnabled}
              className={styles.secondaryAction}
              onClick={() => navigate("/load")}
            >
              Open load manager
            </InteractionFeedbackButton>
          </div>
        </div>

        <div className={styles.poster}>
          <div
            className={styles.posterArt}
            data-testid="landing-poster-art"
            aria-hidden="true"
          >
            <LandingPosterArt />
          </div>
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
