import type { DecisionDefinition, DecisionPackId } from "../../src/simulation/state/types";
import assetHarvest from "./asset_harvest.json";
import core from "./core.json";
import creditorWarfare from "./creditor_warfare.json";
import executiveEscape from "./executive_escape.json";
import laborShock from "./labor_shock.json";
import marketTheater from "./market_theater.json";
import mergerBait from "./merger_bait.json";
import regulatoryTheater from "./regulatory_theater.json";
import safetyDenial from "./safety_denial.json";
import shadowSubsidiaries from "./shadow_subsidiaries.json";

type RawDecisionDefinition = Omit<DecisionDefinition, "pack">;

export const decisionPacks = {
  core: core as RawDecisionDefinition[],
  mergerBait: mergerBait as RawDecisionDefinition[],
  creditorWarfare: creditorWarfare as RawDecisionDefinition[],
  laborShock: laborShock as RawDecisionDefinition[],
  assetHarvest: assetHarvest as RawDecisionDefinition[],
  safetyDenial: safetyDenial as RawDecisionDefinition[],
  shadowSubsidiaries: shadowSubsidiaries as RawDecisionDefinition[],
  marketTheater: marketTheater as RawDecisionDefinition[],
  regulatoryTheater: regulatoryTheater as RawDecisionDefinition[],
  executiveEscape: executiveEscape as RawDecisionDefinition[],
};

export const allDecisions = (Object.entries(decisionPacks) as [DecisionPackId, RawDecisionDefinition[]][])
  .flatMap(([pack, decisions]) => decisions.map((decision) => ({ ...decision, pack })));
