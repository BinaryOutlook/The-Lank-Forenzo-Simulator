import { loadContent } from "../src/simulation/content/index";
import {
  formatContentValidationReport,
  validateContentBundle,
} from "../src/simulation/content/validation";

const content = loadContent();
const report = validateContentBundle(content);

for (const line of formatContentValidationReport(report)) {
  console.log(line);
}

if (report.errors.length > 0) {
  throw new Error(report.errors.map((entry) => entry.message).join("\n"));
}
