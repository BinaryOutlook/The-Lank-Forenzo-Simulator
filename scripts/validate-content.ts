import {
  loadContent,
  loadContentManifest,
} from "../src/simulation/content/index";
import {
  formatContentValidationReport,
  validateContentBundle,
} from "../src/simulation/content/validation";

const content = loadContent();
const report = validateContentBundle(content);
const manifest = loadContentManifest();
const manifestErrors = manifest.diagnostics.filter(
  (diagnostic) => diagnostic.severity === "error",
);

for (const line of formatContentValidationReport(report)) {
  console.log(line);
}

console.log(`Hazard rules: ${manifest.hazardRules.length}`);

if (manifestErrors.length > 0) {
  console.log("Manifest errors:");
  for (const diagnostic of manifestErrors) {
    console.log(`- ${diagnostic.message}`);
  }
}

if (report.errors.length > 0 || manifestErrors.length > 0) {
  throw new Error(
    [
      ...report.errors.map((entry) => entry.message),
      ...manifestErrors.map((diagnostic) => diagnostic.message),
    ].join("\n"),
  );
}
