import { useEffect } from "react";
import type { PropsWithChildren } from "react";
import { useGameStore } from "../../simulation/state/gameStore";

export function AppProviders({ children }: PropsWithChildren) {
  const theme = useGameStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return children;
}
