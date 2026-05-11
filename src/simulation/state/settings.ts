export const wallpaperPresetIds = [
  "executive-grid",
  "runway-night",
  "audit-room",
  "clean-boardroom",
] as const;

export type WallpaperPreset = (typeof wallpaperPresetIds)[number];

export const uiDensityIds = ["standard", "compact"] as const;

export type UiDensity = (typeof uiDensityIds)[number];

export interface GameSettings {
  wallpaper: WallpaperPreset;
  musicEnabled: boolean;
  musicVolume: number;
  soundEffectsEnabled: boolean;
  animationsEnabled: boolean;
  visualEffectsEnabled: boolean;
  interactionEffectsEnabled: boolean;
  visualEffectIntensity: number;
  uiDensity: UiDensity;
}

export const defaultGameSettings: GameSettings = {
  wallpaper: "executive-grid",
  musicEnabled: false,
  musicVolume: 35,
  soundEffectsEnabled: true,
  animationsEnabled: true,
  visualEffectsEnabled: true,
  interactionEffectsEnabled: true,
  visualEffectIntensity: 70,
  uiDensity: "standard",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isWallpaperPreset(value: unknown): value is WallpaperPreset {
  return (
    typeof value === "string" &&
    wallpaperPresetIds.includes(value as WallpaperPreset)
  );
}

function isUiDensity(value: unknown): value is UiDensity {
  return typeof value === "string" && uiDensityIds.includes(value as UiDensity);
}

function parseBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function parsePercent(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

export function normalizeGameSettings(value: unknown): GameSettings {
  if (!isRecord(value)) {
    return defaultGameSettings;
  }

  return {
    wallpaper: isWallpaperPreset(value.wallpaper)
      ? value.wallpaper
      : defaultGameSettings.wallpaper,
    musicEnabled: parseBoolean(
      value.musicEnabled,
      defaultGameSettings.musicEnabled,
    ),
    musicVolume: parsePercent(
      value.musicVolume,
      defaultGameSettings.musicVolume,
    ),
    soundEffectsEnabled: parseBoolean(
      value.soundEffectsEnabled,
      defaultGameSettings.soundEffectsEnabled,
    ),
    animationsEnabled: parseBoolean(
      value.animationsEnabled,
      defaultGameSettings.animationsEnabled,
    ),
    visualEffectsEnabled: parseBoolean(
      value.visualEffectsEnabled,
      defaultGameSettings.visualEffectsEnabled,
    ),
    interactionEffectsEnabled: parseBoolean(
      value.interactionEffectsEnabled,
      defaultGameSettings.interactionEffectsEnabled,
    ),
    visualEffectIntensity: parsePercent(
      value.visualEffectIntensity,
      defaultGameSettings.visualEffectIntensity,
    ),
    uiDensity: isUiDensity(value.uiDensity)
      ? value.uiDensity
      : defaultGameSettings.uiDensity,
  };
}
