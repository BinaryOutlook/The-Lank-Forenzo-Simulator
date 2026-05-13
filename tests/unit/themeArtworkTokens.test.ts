import { describe, expect, it } from "vitest";
import armonkBlueTokens from "../../src/theme/armonk-blue/tokens.css?raw";
import civicGlassTokens from "../../src/theme/civic-glass/tokens.css?raw";
import earthTokens from "../../src/theme/earth/tokens.css?raw";
import highwireTokens from "../../src/theme/highwire/tokens.css?raw";

const themeTokenSources = [
  { id: "earth", css: earthTokens },
  { id: "armonk-blue", css: armonkBlueTokens },
  { id: "highwire", css: highwireTokens },
  { id: "civic-glass", css: civicGlassTokens },
] as const;

const halftoneArtworkTokens = [
  "--halftone-artwork-surface",
  "--halftone-artwork-ink",
  "--halftone-artwork-tint",
  "--halftone-artwork-outline",
  "--halftone-artwork-shadow",
  "--halftone-artwork-filter",
  "--halftone-artwork-opacity",
  "--halftone-artwork-blend-mode",
] as const;

type HalftoneArtworkToken = (typeof halftoneArtworkTokens)[number];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getDeclaration(css: string, token: HalftoneArtworkToken): string {
  const declaration = css.match(
    new RegExp(`${escapeRegExp(token)}\\s*:\\s*([^;]+);`, "m"),
  )?.[1];

  if (!declaration) {
    throw new Error(`Missing ${token}.`);
  }

  return declaration.replace(/\s+/g, " ").trim();
}

describe("theme halftone artwork tokens", () => {
  it("defines the same artwork translation contract for every first-class theme", () => {
    for (const source of themeTokenSources) {
      const missingTokens = halftoneArtworkTokens.filter(
        (token) => !source.css.includes(`${token}:`),
      );

      expect(missingTokens, source.id).toEqual([]);
    }
  });

  it("uses per-theme filters so a neutral halftone asset can shift palettes", () => {
    const filters = themeTokenSources.map((source) =>
      getDeclaration(source.css, "--halftone-artwork-filter"),
    );

    expect(new Set(filters).size).toBe(themeTokenSources.length);

    for (const filter of filters) {
      expect(filter).toContain("saturate(");
      expect(filter).toContain("hue-rotate(");
      expect(filter).toContain("contrast(");
    }
  });

  it("keeps blend modes and opacity values safe for image-layer CSS", () => {
    const supportedBlendModes = new Set(["multiply", "screen", "normal"]);

    for (const source of themeTokenSources) {
      const blendMode = getDeclaration(
        source.css,
        "--halftone-artwork-blend-mode",
      );
      const opacity = Number(
        getDeclaration(source.css, "--halftone-artwork-opacity"),
      );

      expect(supportedBlendModes.has(blendMode)).toBe(true);
      expect(opacity).toBeGreaterThan(0);
      expect(opacity).toBeLessThanOrEqual(1);
    }
  });
});
