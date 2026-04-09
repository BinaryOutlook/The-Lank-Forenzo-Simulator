import { loadContent } from "../src/simulation/content/index";

const content = loadContent();

console.log(
  [
    "Content validation passed.",
    `Decisions: ${content.decisions.length}`,
    `Events: ${content.events.length}`,
    `Endings: ${content.endings.length}`,
  ].join("\n"),
);
