import rawDecisions from "../../../content/decisions/core.json";
import rawEndings from "../../../content/endings/core.json";
import rawEvents from "../../../content/events/core.json";
import { decisionsSchema, endingsSchema, eventsSchema } from "../../lib/schemas/contentSchemas";
import type { ContentBundle } from "../state/types";

let cachedContent: ContentBundle | null = null;

export function loadContent(): ContentBundle {
  if (cachedContent) {
    return cachedContent;
  }

  cachedContent = {
    decisions: decisionsSchema.parse(rawDecisions),
    events: eventsSchema.parse(rawEvents),
    endings: endingsSchema.parse(rawEndings),
  };

  return cachedContent;
}
