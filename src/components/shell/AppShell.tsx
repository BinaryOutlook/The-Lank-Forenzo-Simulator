import clsx from "clsx";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useInteractionFeedback } from "../interaction/useInteractionFeedback.js";
import { useGameStore } from "../../simulation/state/gameStore.js";
import styles from "./AppShell.module.css";

const primaryNavItems: Array<{ label: string; to: string }> = [
  { label: "Run", to: "/run" },
  { label: "About", to: "/about" },
  { label: "Tutorial", to: "/tutorial" },
  { label: "Options", to: "/options" },
];

interface HeaderNavLinkProps {
  interactionEffectsEnabled: boolean;
  label: string;
  to: string;
}

function HeaderNavLink({
  interactionEffectsEnabled,
  label,
  to,
}: HeaderNavLinkProps) {
  const feedback = useInteractionFeedback<HTMLAnchorElement>(
    interactionEffectsEnabled,
  );

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          "interaction-feedback-control",
          isActive ? styles.navLinkActive : styles.navLink,
        )
      }
      data-interaction-feedback={feedback.feedbackState}
      onKeyDown={feedback.onFeedbackKeyDown}
      onPointerDown={feedback.onFeedbackPointerDown}
    >
      {label}
    </NavLink>
  );
}

export function AppShell() {
  const location = useLocation();
  const settings = useGameStore((state) => state.settings);
  const run = useGameStore((state) => state.run);
  const isRunSurface = location.pathname === "/run" && run?.status === "active";
  const interactionEffectsEnabled =
    settings.visualEffectsEnabled && settings.interactionEffectsEnabled;

  useEffect(() => {
    window.scrollTo({ behavior: "auto", left: 0, top: 0 });
  }, [location.pathname]);

  return (
    <div
      className={clsx(
        "app-frame",
        styles.shell,
        isRunSurface && styles.shellRunSurface,
      )}
    >
      <motion.header
        className={styles.header}
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.brandBlock}>
          <NavLink to="/" className={styles.brand}>
            The Lank Forenzo Simulator
          </NavLink>
          <span className={styles.subtitle}>
            Board packet for a morally bankrupt turnaround
          </span>
        </div>

        <div className={styles.headerControls}>
          {run?.status === "active" ? (
            <span className={styles.roundBadge}>Round {run.round}</span>
          ) : null}

          <nav className={styles.nav} aria-label="Primary">
            {primaryNavItems.map((item) => (
              <HeaderNavLink
                key={item.to}
                to={item.to}
                label={item.label}
                interactionEffectsEnabled={interactionEffectsEnabled}
              />
            ))}
          </nav>
        </div>
      </motion.header>

      <main
        className={clsx(styles.main, isRunSurface && styles.mainRunSurface)}
      >
        <Outlet />
      </main>
    </div>
  );
}
