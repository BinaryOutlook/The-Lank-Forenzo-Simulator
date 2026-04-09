import { motion } from "framer-motion";
import { NavLink, Outlet } from "react-router-dom";
import { useGameStore } from "../../simulation/state/gameStore";
import type { ThemeName } from "../../simulation/state/types";
import styles from "./AppShell.module.css";

const themes: Array<{ id: ThemeName; label: string }> = [
  { id: "earth", label: "Earth" },
  { id: "armonk-blue", label: "Armonk Blue" },
];

export function AppShell() {
  const theme = useGameStore((state) => state.theme);
  const setTheme = useGameStore((state) => state.setTheme);
  const run = useGameStore((state) => state.run);

  return (
    <div className={`app-frame ${styles.shell}`}>
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
          <span className={styles.subtitle}>Board packet for a morally bankrupt turnaround</span>
        </div>

        <div className={styles.headerControls}>
          {run?.status === "active" ? <span className={styles.roundBadge}>Round {run.round}</span> : null}

          <div className={styles.themeSwitch} aria-label="Theme selector">
            {themes.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className={entry.id === theme ? styles.themeButtonActive : styles.themeButton}
                onClick={() => setTheme(entry.id)}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </div>
      </motion.header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
