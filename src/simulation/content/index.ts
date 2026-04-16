import { allDecisions } from "../../../content/decisions";
import rawEndings from "../../../content/endings/core.json";
import { allEvents } from "../../../content/events";
import {
  decisionsSchema,
  endingsSchema,
  eventsSchema,
} from "../../lib/schemas/contentSchemas";
import type { ContentBundle } from "../state/types";
import {
  compileContentManifest,
  type CompiledContentManifest,
} from "./manifest";

let cachedContent: ContentBundle | null = null;
let cachedManifest: CompiledContentManifest | null = null;

export function loadContent(): ContentBundle {
  if (cachedContent) {
    return cachedContent;
  }

  cachedContent = {
    decisions: decisionsSchema.parse(allDecisions),
    events: eventsSchema.parse(allEvents),
    endings: endingsSchema.parse(rawEndings),
  };

  return cachedContent;
}

export function loadContentManifest(): CompiledContentManifest {
  if (cachedManifest) {
    return cachedManifest;
  }

  cachedManifest = compileContentManifest(loadContent());

  return cachedManifest;
}

export {
  compileContentManifest,
  type CompiledContentManifest,
  type ContentDiagnostic,
} from "./manifest";
