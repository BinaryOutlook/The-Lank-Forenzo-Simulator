import { useEffect } from "react";
import type { PropsWithChildren } from "react";
import { MotionConfig } from "framer-motion";
import { AmbientMusic } from "../../components/audio/AmbientMusic.js";
import { InteractionAudio } from "../../components/audio/InteractionAudio.js";
import { useGameStore } from "../../simulation/state/gameStore.js";

export function AppProviders({ children }: PropsWithChildren) {
  const theme = useGameStore((state) => state.theme);
  const settings = useGameStore((state) => state.settings);

  useEffect(() => {
    const root = document.documentElement;
    const visualEffectIntensity = settings.visualEffectsEnabled
      ? settings.visualEffectIntensity / 100
      : 0;
    const interactionEffectsEnabled =
      settings.visualEffectsEnabled && settings.interactionEffectsEnabled;

    root.dataset.theme = theme;
    root.dataset.wallpaper = settings.wallpaper;
    root.dataset.fontPreset = settings.fontPreset;
    root.dataset.music = settings.musicEnabled ? "on" : "off";
    root.dataset.soundEffects = settings.soundEffectsEnabled ? "on" : "off";
    root.dataset.animations = settings.animationsEnabled ? "on" : "off";
    root.dataset.visualEffects = settings.visualEffectsEnabled ? "on" : "off";
    root.dataset.interactionEffects = interactionEffectsEnabled ? "on" : "off";
    root.dataset.uiDensity = settings.uiDensity;
    root.style.setProperty(
      "--visual-effect-intensity",
      String(visualEffectIntensity),
    );
    root.style.setProperty(
      "--music-volume",
      String(settings.musicVolume / 100),
    );

    return () => {
      delete root.dataset.wallpaper;
      delete root.dataset.fontPreset;
      delete root.dataset.music;
      delete root.dataset.soundEffects;
      delete root.dataset.animations;
      delete root.dataset.visualEffects;
      delete root.dataset.interactionEffects;
      delete root.dataset.uiDensity;
      root.style.removeProperty("--visual-effect-intensity");
      root.style.removeProperty("--music-volume");
    };
  }, [settings, theme]);

  return (
    <MotionConfig
      reducedMotion={settings.animationsEnabled ? "user" : "always"}
    >
      <AmbientMusic />
      <InteractionAudio />
      {children}
    </MotionConfig>
  );
}
