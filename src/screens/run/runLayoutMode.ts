import { useEffect, useState } from "react";

export type RunLayoutMode =
  | "desktop-landscape"
  | "tablet-landscape"
  | "portrait-panels";

interface ViewportSize {
  height: number;
  width: number;
}

const portraitPanelMaxWidth = 860;
const tabletLandscapeMaxWidth = 1180;

export function resolveRunLayoutMode({
  height,
  width,
}: ViewportSize): RunLayoutMode {
  if (width <= portraitPanelMaxWidth || height > width) {
    return "portrait-panels";
  }

  if (width <= tabletLandscapeMaxWidth) {
    return "tablet-landscape";
  }

  return "desktop-landscape";
}

function readRunLayoutMode(): RunLayoutMode {
  if (typeof window === "undefined") {
    return "desktop-landscape";
  }

  return resolveRunLayoutMode({
    height: window.innerHeight,
    width: window.innerWidth,
  });
}

export function useRunLayoutMode(): RunLayoutMode {
  const [layoutMode, setLayoutMode] = useState(readRunLayoutMode);

  useEffect(() => {
    const updateLayoutMode = () => setLayoutMode(readRunLayoutMode());

    updateLayoutMode();
    window.addEventListener("resize", updateLayoutMode);
    window.visualViewport?.addEventListener("resize", updateLayoutMode);

    return () => {
      window.removeEventListener("resize", updateLayoutMode);
      window.visualViewport?.removeEventListener("resize", updateLayoutMode);
    };
  }, []);

  return layoutMode;
}
