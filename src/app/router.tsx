import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "../components/shell/AppShell";
import { EndingScreen } from "../screens/ending/EndingScreen";
import { LandingScreen } from "../screens/landing/LandingScreen";
import { RunScreen } from "../screens/run/RunScreen";

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
        path: "ending",
        element: <EndingScreen />,
      },
    ],
  },
]);
