import { describe, expect, it } from "vitest";
import { resolveRunLayoutMode } from "./runLayoutMode.js";

describe("resolveRunLayoutMode", () => {
  it("keeps wide browser windows in the desktop command-center layout", () => {
    expect(resolveRunLayoutMode({ height: 900, width: 1440 })).toBe(
      "desktop-landscape",
    );
  });

  it("uses the dense tablet command-center layout for landscape tablets", () => {
    expect(resolveRunLayoutMode({ height: 768, width: 1024 })).toBe(
      "tablet-landscape",
    );
  });

  it("uses panel navigation for tablet portrait and phone portrait windows", () => {
    expect(resolveRunLayoutMode({ height: 1024, width: 768 })).toBe(
      "portrait-panels",
    );
    expect(resolveRunLayoutMode({ height: 844, width: 390 })).toBe(
      "portrait-panels",
    );
  });
});
