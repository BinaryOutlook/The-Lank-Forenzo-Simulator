import { z } from "zod";

const metricKeys = [
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

const decisionPackIds = [
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

export const metricKeySchema = z.enum(metricKeys);
export const decisionPackIdSchema = z.enum(decisionPackIds);
export const endingIdSchema = z.enum(["prison", "forcedRemoval", "merger", "extraction", "bahamas"]);

const metricShape = Object.fromEntries(metricKeys.map((metric) => [metric, z.number().optional()])) as Record<
  (typeof metricKeys)[number],
  z.ZodOptional<z.ZodNumber>
>;

const metricRecordSchema = z.object(metricShape).strict();

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

const delayedConsequenceSchema = z
  .object({
    delay: z.number().int().min(1),
    eventId: z.string().optional(),
    eventIds: z.array(z.string()).min(1).optional(),
  })
  .strict()
  .refine((value) => (value.eventId ? 1 : 0) + (value.eventIds ? 1 : 0) === 1, {
    message: "Delayed consequence entries must provide exactly one of eventId or eventIds.",
  });

export const decisionSchema = z
  .object({
    id: z.string(),
    pack: decisionPackIdSchema,
    title: z.string(),
    summary: z.string(),
    group: z.enum(["labor", "finance", "operations", "market", "legal", "extraction", "exit"]),
    tags: z.array(z.string()).min(1),
    impacts: metricRecordSchema,
    requirements: requirementSchema.optional(),
    delayedConsequences: z.array(delayedConsequenceSchema).optional(),
    setsFlags: z.array(z.string()).optional(),
    ending: endingIdSchema.optional(),
  })
  .strict();

export const eventSchema = z
  .object({
    id: z.string(),
    kind: z.enum(["ambient", "delayed"]),
    title: z.string(),
    body: z.string(),
    weight: z.number().int().positive(),
    tags: z.array(z.string()).min(1),
    impacts: metricRecordSchema,
    requirements: requirementSchema.optional(),
    setsFlags: z.array(z.string()).optional(),
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

export const decisionsSchema = z.array(decisionSchema);
export const eventsSchema = z.array(eventSchema);
export const endingsSchema = z.array(endingSchema);
