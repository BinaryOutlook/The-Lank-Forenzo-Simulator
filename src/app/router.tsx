import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "../components/shell/AppShell.js";
import { DecisionSelectionScreen } from "../screens/decision-selection/DecisionSelectionScreen.js";
import { EndingScreen } from "../screens/ending/EndingScreen.js";
import { LandingScreen } from "../screens/landing/LandingScreen.js";
import { LoadManagerScreen } from "../screens/load-manager/LoadManagerScreen.js";
import { OptionsScreen } from "../screens/options/OptionsScreen.js";
import { AboutScreen } from "../screens/about/AboutScreen.js";
import { RunScreen } from "../screens/run/RunScreen.js";
import { TutorialScreen } from "../screens/tutorial/TutorialScreen.js";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <LandingScreen />,
      },
      {
        path: "run",
        element: <RunScreen />,
      },
      {
        path: "run/decisions",
        element: <DecisionSelectionScreen />,
      },
      {
        path: "options",
        element: <OptionsScreen />,
      },
      {
        path: "load",
        element: <LoadManagerScreen />,
      },
      {
        path: "about",
        element: <AboutScreen />,
      },
      {
        path: "tutorial",
        element: <TutorialScreen />,
      },
      {
        path: "ending",
        element: <EndingScreen />,
      },
    ],
  },
]);
