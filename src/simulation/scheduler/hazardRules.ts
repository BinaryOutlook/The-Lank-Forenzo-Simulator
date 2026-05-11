import type { HazardRule } from "./eventScheduler.js";

export const activeHazardRules: HazardRule[] = [
  {
    id: "hazard-creditor-liquidity",
    eventId: "vendor_prepay_demand",
    baseWeight: 5,
    cooldownRounds: 3,
    tags: ["creditors", "finance"],
    sourceFamily: "creditors",
    explanation:
      "Creditor patience has thinned enough for suppliers to demand cash before trust.",
    requirements: {
      roundAtLeast: 5,
      metricMax: {
        creditorPatience: 32,
      },
    },
  },
  {
    id: "hazard-labor-morale",
    eventId: "flight_attendant_sickout",
    baseWeight: 5,
    cooldownRounds: 3,
    tags: ["labor", "operations"],
    sourceFamily: "labor",
    explanation:
      "Workforce morale has fallen into organized-disruption territory.",
    requirements: {
      roundAtLeast: 4,
      metricMax: {
        workforceMorale: 36,
      },
    },
  },
  {
    id: "hazard-legal-pressure",
    eventId: "ethics_hotline_spike",
    baseWeight: 4,
    cooldownRounds: 3,
    tags: ["legal", "personal"],
    sourceFamily: "legal",
    explanation:
      "Legal heat is high enough that internal complaints start finding outside readers.",
    requirements: {
      roundAtLeast: 4,
      metricMin: {
        legalHeat: 68,
      },
    },
  },
  {
    id: "hazard-public-service-anger",
    eventId: "stranded_passenger_clip",
    baseWeight: 4,
    cooldownRounds: 3,
    tags: ["service", "press"],
    sourceFamily: "service",
    explanation:
      "Public anger and weak market confidence made another service failure newsworthy.",
    requirements: {
      roundAtLeast: 5,
      metricMin: {
        publicAnger: 62,
      },
      metricMax: {
        marketConfidence: 42,
      },
    },
  },
  {
    id: "hazard-safety-integrity",
    eventId: "dispatcher_fatigue_warning",
    baseWeight: 6,
    cooldownRounds: 3,
    tags: ["safety", "operations"],
    sourceFamily: "safety",
    explanation:
      "Safety integrity has weakened enough for fatigue warnings to become operational hazards.",
    requirements: {
      roundAtLeast: 4,
      metricMax: {
        safetyIntegrity: 44,
      },
    },
  },
];
