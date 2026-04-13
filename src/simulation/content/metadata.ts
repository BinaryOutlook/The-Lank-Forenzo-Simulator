export const metricKeys = [
  "airlineCash",
  "personalWealth",
  "debt",
  "assetValue",
  "workforceSize",
  "workforceMorale",
  "marketConfidence",
  "creditorPatience",
  "legalHeat",
  "safetyIntegrity",
  "publicAnger",
  "stockPrice",
  "offshoreReadiness",
] as const;

export const endingIds = [
  "prison",
  "forcedRemoval",
  "merger",
  "extraction",
  "bahamas",
] as const;

export const decisionGroups = [
  "labor",
  "finance",
  "operations",
  "market",
  "legal",
  "extraction",
  "exit",
] as const;

export const decisionPackIds = [
  "core",
  "mergerBait",
  "creditorWarfare",
  "laborShock",
  "assetHarvest",
  "safetyDenial",
  "shadowSubsidiaries",
  "marketTheater",
  "regulatoryTheater",
  "executiveEscape",
] as const;

export const eventKinds = ["ambient", "delayed"] as const;
