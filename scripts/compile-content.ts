import { pathToFileURL } from "node:url";
import { loadContentManifest } from "../src/simulation/content";

export function formatCompiledContentSummary(): string {
  const manifest = loadContentManifest();
  const warningCount = manifest.diagnostics.filter(
    (diagnostic) => diagnostic.severity === "warning",
  ).length;
  const errorCount = manifest.diagnostics.filter(
    (diagnostic) => diagnostic.severity === "error",
  ).length;

  return [
    "Compiled content manifest",
    `Version: ${manifest.version}`,
    `Content hash: ${manifest.contentHash}`,
    `Decisions: ${manifest.decisions.length}`,
    `Events: ${manifest.events.length}`,
    `Endings: ${manifest.endings.length}`,
    `Flags: ${manifest.flags.length}`,
    `Diagnostics: ${errorCount} errors, ${warningCount} warnings`,
  ].join("\n");
}

function main() {
  console.log(formatCompiledContentSummary());
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main();
}
