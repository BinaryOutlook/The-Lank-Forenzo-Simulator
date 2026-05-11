import { z } from "zod";
import {
  consumableResourceKeys,
  decisionGroups,
  decisionPackIds,
  dossierThemes,
  endingIds,
  eventKinds,
  hazardSourceFamilies,
  metricKeys,
} from "../../simulation/content/metadata";
import {
  factionEffectDeltaBounds,
  factionEffectKeys,
  factionIds,
} from "../../simulation/factions/factionState.js";

export const metricKeySchema = z.enum(metricKeys);
export const decisionPackIdSchema = z.enum(decisionPackIds);
export const endingIdSchema = z.enum(endingIds);
export const factionIdSchema = z.enum(factionIds);
export const hazardSourceFamilySchema = z.enum(hazardSourceFamilies);

const metricShape = Object.fromEntries(
  metricKeys.map((metric) => [metric, z.number().optional()]),
) as Record<(typeof metricKeys)[number], z.ZodOptional<z.ZodNumber>>;

const metricRecordSchema = z.object(metricShape).strict();

const resourceShape = Object.fromEntries(
  consumableResourceKeys.map((resource) => [
    resource,
    z.number().int().nonnegative().optional(),
  ]),
) as Record<
  (typeof consumableResourceKeys)[number],
  z.ZodOptional<z.ZodNumber>
>;

const resourceCostSchema = z.object(resourceShape).strict();

const factionEffectShape = Object.fromEntries(
  factionEffectKeys.map((key) => [
    key,
    z
      .number()
      .int()
      .min(factionEffectDeltaBounds.min)
      .max(factionEffectDeltaBounds.max)
      .optional(),
  ]),
) as Record<
  (typeof factionEffectKeys)[number],
  z.ZodOptional<z.ZodNumber>
>;

export const factionEffectSchema = z
  .object({
    ...factionEffectShape,
    grievance: z.string().min(1).max(96).optional(),
  })
  .strict()
  .refine(
    (value) => factionEffectKeys.some((key) => value[key] !== undefined),
    {
      message: "Faction effects must include at least one numeric delta.",
    },
  );

const factionEffectSetShape = Object.fromEntries(
  factionIds.map((factionId) => [factionId, factionEffectSchema.optional()]),
) as Record<
  (typeof factionIds)[number],
  z.ZodOptional<typeof factionEffectSchema>
>;

export const factionEffectSetSchema = z
  .object(factionEffectSetShape)
  .strict()
  .refine((value) => Object.values(value).some(Boolean), {
    message: "Faction effect sets must include at least one faction.",
  });

const operationEffectSchema = z
  .object({
    maintenanceBacklog: z.number().int().optional(),
    contractorDependence: z.number().int().optional(),
    crewFatigue: z.number().int().optional(),
    serviceDisruption: z.number().int().optional(),
    hubFragility: z.record(z.string(), z.number().int()).optional(),
    routeFragility: z.record(z.string(), z.number().int()).optional(),
    weatherExposure: z.number().int().optional(),
  })
  .strict();

const requirementSchema = z
  .object({
    roundAtLeast: z.number().int().optional(),
    roundAtMost: z.number().int().optional(),
    metricMin: metricRecordSchema.optional(),
    metricMax: metricRecordSchema.optional(),
    flagsAll: z.array(z.string()).optional(),
    flagsNone: z.array(z.string()).optional(),
  })
  .strict();

const hazardRequirementSchema = requirementSchema.refine(
  (value) =>
    value.roundAtLeast !== undefined ||
    value.roundAtMost !== undefined ||
    Object.keys(value.metricMin ?? {}).length > 0 ||
    Object.keys(value.metricMax ?? {}).length > 0 ||
    (value.flagsAll?.length ?? 0) > 0 ||
    (value.flagsNone?.length ?? 0) > 0,
  {
    message: "Hazard requirements must include at least one gating field.",
  },
);

const delayedConsequenceSchema = z
  .object({
    delay: z.number().int().min(1),
    eventId: z.string().optional(),
    eventIds: z.array(z.string()).min(1).optional(),
  })
  .strict()
  .refine((value) => (value.eventId ? 1 : 0) + (value.eventIds ? 1 : 0) === 1, {
    message:
      "Delayed consequence entries must provide exactly one of eventId or eventIds.",
  });

const evidenceFragmentSchema = z
  .object({
    theme: z.enum(dossierThemes),
    weight: z.number().int().positive(),
    witness: z.string().optional(),
    detail: z.string().optional(),
  })
  .strict();

export const decisionSchema = z
  .object({
    id: z.string(),
    pack: decisionPackIdSchema,
    title: z.string(),
    summary: z.string(),
    group: z.enum(decisionGroups),
    tags: z.array(z.string()).min(1),
    impacts: metricRecordSchema,
    resourceCosts: resourceCostSchema.optional(),
    evidence: z.array(evidenceFragmentSchema).optional(),
    operationEffects: operationEffectSchema.optional(),
    requirements: requirementSchema.optional(),
    delayedConsequences: z.array(delayedConsequenceSchema).optional(),
    setsFlags: z.array(z.string()).optional(),
    factionEffects: factionEffectSetSchema.optional(),
    ending: endingIdSchema.optional(),
  })
  .strict();

export const eventSchema = z
  .object({
    id: z.string(),
    kind: z.enum(eventKinds),
    title: z.string(),
    body: z.string(),
    weight: z.number().int().positive(),
    tags: z.array(z.string()).min(1),
    impacts: metricRecordSchema,
    evidence: z.array(evidenceFragmentSchema).optional(),
    requirements: requirementSchema.optional(),
    setsFlags: z.array(z.string()).optional(),
    factionEffects: factionEffectSetSchema.optional(),
  })
  .strict();

export const endingSchema = z
  .object({
    id: endingIdSchema,
    title: z.string(),
    subtitle: z.string(),
    summary: z.string(),
  })
  .strict();

export const hazardSchema = z
  .object({
    id: z.string(),
    eventId: z.string(),
    baseWeight: z.number().int().positive(),
    cooldownRounds: z.number().int().min(1),
    requirements: hazardRequirementSchema,
    sourceFamily: hazardSourceFamilySchema,
    explanation: z.string().min(1),
  })
  .strict();

export const decisionsSchema = z.array(decisionSchema);
export const eventsSchema = z.array(eventSchema);
export const hazardsSchema = z.array(hazardSchema);
export const endingsSchema = z.array(endingSchema);
