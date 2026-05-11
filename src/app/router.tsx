import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "../components/shell/AppShell.js";
import { EndingScreen } from "../screens/ending/EndingScreen.js";
import { LandingScreen } from "../screens/landing/LandingScreen.js";
import { OptionsScreen } from "../screens/options/OptionsScreen.js";
import { AboutScreen } from "../screens/about/AboutScreen.js";
import { RunScreen } from "../screens/run/RunScreen.js";

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
        path: "options",
        element: <OptionsScreen />,
      },
      {
        path: "about",
        element: <AboutScreen />,
      },
      {
        path: "ending",
        element: <EndingScreen />,
      },
    ],
  },
]);
