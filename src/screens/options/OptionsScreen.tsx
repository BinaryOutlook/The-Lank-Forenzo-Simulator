import { motion } from "framer-motion";
import clsx from "clsx";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { InteractionFeedbackButton } from "../../components/interaction/InteractionFeedbackButton.js";
import { useGameStore } from "../../simulation/state/gameStore.js";
import type {
  FontPreset,
  UiDensity,
  WallpaperPreset,
} from "../../simulation/state/settings.js";
import type { ThemeName } from "../../simulation/state/types.js";
import styles from "./OptionsScreen.module.css";

interface ChoiceOption<TValue extends string> {
  id: TValue;
  label: string;
  description: string;
}

interface SettingsSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

interface ToggleRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

interface RangeRowProps {
  id: string;
  label: string;
  description: string;
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

const themeOptions: Array<ChoiceOption<ThemeName>> = [
  {
    id: "earth",
    label: "Earth",
    description:
      "Dark, predatory surfaces with restrained green signal accents.",
  },
  {
    id: "armonk-blue",
    label: "Armonk Blue",
    description: "Bright boardroom polish with procedural blue authority.",
  },
];

const wallpaperOptions: Array<ChoiceOption<WallpaperPreset>> = [
  {
    id: "executive-grid",
    label: "Executive Grid",
    description:
      "The default command-room grid for maximum board-packet menace.",
  },
  {
    id: "runway-night",
    label: "Runway Night",
    description: "Dark runway beams and terminal glow behind the simulation.",
  },
  {
    id: "audit-room",
    label: "Audit Room",
    description:
      "Paper trails, thin ruled lines, and the smell of bad discovery.",
  },
  {
    id: "clean-boardroom",
    label: "Clean Boardroom",
    description: "A calmer wall for lower visual noise and sharper reading.",
  },
];

const fontOptions: Array<ChoiceOption<FontPreset>> = [
  {
    id: "theme",
    label: "Theme Default",
    description:
      "Use the theme's intended voice with Windows and macOS fallbacks.",
  },
  {
    id: "system",
    label: "System UI",
    description:
      "Prefer native interface fonts for maximum cross-platform clarity.",
  },
  {
    id: "ledger",
    label: "Ledger Mono",
    description:
      "Use a restrained monospaced stack for dense audit-style reading.",
  },
];

const densityOptions: Array<ChoiceOption<UiDensity>> = [
  {
    id: "standard",
    label: "Standard",
    description: "Balanced spacing for the full boardroom presentation.",
  },
  {
    id: "compact",
    label: "Compact",
    description:
      "Tighter spacing for laptops, dense rounds, and small screens.",
  },
];

function SettingsSection({
  eyebrow,
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <p className={styles.sectionDescription}>{description}</p>
      </div>
      {children}
    </section>
  );
}

function ToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
}: ToggleRowProps) {
  return (
    <label className={styles.toggleRow} htmlFor={id}>
      <span>
        <span className={styles.controlTitle}>{label}</span>
        <span className={styles.controlDescription}>{description}</span>
      </span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
    </label>
  );
}

function RangeRow({
  id,
  label,
  description,
  value,
  disabled = false,
  onChange,
}: RangeRowProps) {
  return (
    <label
      className={clsx(styles.rangeRow, disabled && styles.controlMuted)}
      htmlFor={id}
    >
      <span className={styles.rangeHeader}>
        <span>
          <span className={styles.controlTitle}>{label}</span>
          <span className={styles.controlDescription}>{description}</span>
        </span>
        <output className={styles.output} aria-live="polite">
          {value}%
        </output>
      </span>
      <input
        id={id}
        type="range"
        min="0"
        max="100"
        step="5"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </label>
  );
}

export function OptionsScreen() {
  const navigate = useNavigate();
  const theme = useGameStore((state) => state.theme);
  const settings = useGameStore((state) => state.settings);
  const run = useGameStore((state) => state.run);
  const setTheme = useGameStore((state) => state.setTheme);
  const setWallpaper = useGameStore((state) => state.setWallpaper);
  const setFontPreset = useGameStore((state) => state.setFontPreset);
  const setMusicEnabled = useGameStore((state) => state.setMusicEnabled);
  const setMusicVolume = useGameStore((state) => state.setMusicVolume);
  const setSoundEffectsEnabled = useGameStore(
    (state) => state.setSoundEffectsEnabled,
  );
  const setAnimationsEnabled = useGameStore(
    (state) => state.setAnimationsEnabled,
  );
  const setVisualEffectsEnabled = useGameStore(
    (state) => state.setVisualEffectsEnabled,
  );
  const setInteractionEffectsEnabled = useGameStore(
    (state) => state.setInteractionEffectsEnabled,
  );
  const setVisualEffectIntensity = useGameStore(
    (state) => state.setVisualEffectIntensity,
  );
  const setUiDensity = useGameStore((state) => state.setUiDensity);
  const resetSettings = useGameStore((state) => state.resetSettings);
  const interactionEffectsEnabled =
    settings.visualEffectsEnabled && settings.interactionEffectsEnabled;

  return (
    <motion.section
      className={styles.page}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Options</p>
          <h1 className={styles.title}>
            Tune the room before it turns on you.
          </h1>
        </div>
        <p className={styles.summary}>
          Settings are saved locally. Start with preset wallpapers now; richer
          file-based customization can land later without replacing this
          foundation.
        </p>
      </header>

      <div className={styles.layout}>
        <div className={styles.sections}>
          <SettingsSection
            eyebrow="Presentation"
            title="Theme"
            description="Choose the main visual identity that frames the simulation."
          >
            <div className={styles.choiceGrid} aria-label="Theme selector">
              {themeOptions.map((option) => (
                <InteractionFeedbackButton
                  key={option.id}
                  feedbackEnabled={interactionEffectsEnabled}
                  className={clsx(
                    styles.choiceCard,
                    option.id === theme && styles.choiceCardActive,
                  )}
                  aria-pressed={option.id === theme}
                  onClick={() => setTheme(option.id)}
                >
                  <span className={styles.choiceLabel}>{option.label}</span>
                  <span className={styles.choiceDescription}>
                    {option.description}
                  </span>
                </InteractionFeedbackButton>
              ))}
            </div>
          </SettingsSection>

          <SettingsSection
            eyebrow="Presentation"
            title="Font"
            description="Set the reading voice for menus, reports, and dense audit text."
          >
            <div className={styles.choiceGrid} aria-label="Font selector">
              {fontOptions.map((option) => (
                <InteractionFeedbackButton
                  key={option.id}
                  feedbackEnabled={interactionEffectsEnabled}
                  className={clsx(
                    styles.choiceCard,
                    option.id === settings.fontPreset &&
                      styles.choiceCardActive,
                  )}
                  aria-pressed={option.id === settings.fontPreset}
                  onClick={() => setFontPreset(option.id)}
                >
                  <span className={styles.choiceLabel}>{option.label}</span>
                  <span className={styles.choiceDescription}>
                    {option.description}
                  </span>
                </InteractionFeedbackButton>
              ))}
            </div>
          </SettingsSection>

          <SettingsSection
            eyebrow="Presentation"
            title="UI density and design"
            description="Control spacing and interface motion without changing the simulation state."
          >
            <div className={styles.choiceGrid} aria-label="UI density selector">
              {densityOptions.map((option) => (
                <InteractionFeedbackButton
                  key={option.id}
                  feedbackEnabled={interactionEffectsEnabled}
                  className={clsx(
                    styles.choiceCard,
                    option.id === settings.uiDensity && styles.choiceCardActive,
                  )}
                  aria-pressed={option.id === settings.uiDensity}
                  onClick={() => setUiDensity(option.id)}
                >
                  <span className={styles.choiceLabel}>{option.label}</span>
                  <span className={styles.choiceDescription}>
                    {option.description}
                  </span>
                </InteractionFeedbackButton>
              ))}
            </div>

            <ToggleRow
              id="animations-enabled"
              label="Interface animation"
              description="Keep motion on for the full cinematic cadence, or disable it for calmer play."
              checked={settings.animationsEnabled}
              onChange={setAnimationsEnabled}
            />
          </SettingsSection>

          <SettingsSection
            eyebrow="Wallpaper"
            title="Background preset"
            description="Pick a custom wallpaper preset that immediately changes the game shell."
          >
            <div className={styles.wallpaperGrid}>
              {wallpaperOptions.map((option) => (
                <InteractionFeedbackButton
                  key={option.id}
                  feedbackEnabled={interactionEffectsEnabled}
                  className={clsx(
                    styles.wallpaperCard,
                    option.id === settings.wallpaper &&
                      styles.wallpaperCardActive,
                  )}
                  aria-pressed={option.id === settings.wallpaper}
                  onClick={() => setWallpaper(option.id)}
                >
                  <span
                    className={styles.wallpaperSwatch}
                    data-wallpaper-preview={option.id}
                    aria-hidden="true"
                  />
                  <span className={styles.choiceLabel}>{option.label}</span>
                  <span className={styles.choiceDescription}>
                    {option.description}
                  </span>
                </InteractionFeedbackButton>
              ))}
            </div>
          </SettingsSection>

          <SettingsSection
            eyebrow="Audio"
            title="Music and sound"
            description="A restrained Web Audio drone and short interaction motifs can be enabled for the browser session."
          >
            <ToggleRow
              id="music-enabled"
              label="Music"
              description="Enable or mute the ambient score without touching the rest of the interface."
              checked={settings.musicEnabled}
              onChange={setMusicEnabled}
            />
            <RangeRow
              id="music-volume"
              label="Music volume"
              description="Keep it low enough that quarterly disaster remains readable."
              value={settings.musicVolume}
              disabled={!settings.musicEnabled}
              onChange={setMusicVolume}
            />
            <ToggleRow
              id="sound-effects-enabled"
              label="Sound effects"
              description="Let decision picks and quarter resolution add precise tonal cues when music is also enabled."
              checked={settings.soundEffectsEnabled}
              onChange={setSoundEffectsEnabled}
            />
          </SettingsSection>

          <SettingsSection
            eyebrow="Effects"
            title="Graphical load"
            description="Reduce ornamental overlays for lower-end devices while keeping the core simulation readable."
          >
            <ToggleRow
              id="visual-effects-enabled"
              label="Visual effects"
              description="Enable the ambient glow and wallpaper treatment around the shell."
              checked={settings.visualEffectsEnabled}
              onChange={setVisualEffectsEnabled}
            />
            <ToggleRow
              id="interaction-effects-enabled"
              label="Interaction feedback"
              description="Show quick card pulses and button flashes when decisions, options, or run controls are pressed."
              checked={settings.interactionEffectsEnabled}
              onChange={setInteractionEffectsEnabled}
            />
            <RangeRow
              id="visual-effect-intensity"
              label="Effect intensity"
              description="Scale the decorative layer from barely-there to full menace."
              value={settings.visualEffectIntensity}
              disabled={!settings.visualEffectsEnabled}
              onChange={setVisualEffectIntensity}
            />
          </SettingsSection>
        </div>

        <aside
          className={styles.preview}
          aria-labelledby="options-preview-title"
        >
          <p className={styles.eyebrow}>Live preview</p>
          <h2 id="options-preview-title" className={styles.previewTitle}>
            Current room tone
          </h2>
          <dl className={styles.previewList}>
            <div>
              <dt>Theme</dt>
              <dd>
                {themeOptions.find((option) => option.id === theme)?.label}
              </dd>
            </div>
            <div>
              <dt>Wallpaper</dt>
              <dd>
                {
                  wallpaperOptions.find(
                    (option) => option.id === settings.wallpaper,
                  )?.label
                }
              </dd>
            </div>
            <div>
              <dt>Font</dt>
              <dd>
                {
                  fontOptions.find(
                    (option) => option.id === settings.fontPreset,
                  )?.label
                }
              </dd>
            </div>
            <div>
              <dt>Music</dt>
              <dd>
                {settings.musicEnabled
                  ? `Enabled at ${settings.musicVolume}%`
                  : "Muted"}
              </dd>
            </div>
            <div>
              <dt>Sound effects</dt>
              <dd>{settings.soundEffectsEnabled ? "Enabled" : "Disabled"}</dd>
            </div>
            <div>
              <dt>Effects</dt>
              <dd>
                {settings.visualEffectsEnabled
                  ? `${settings.visualEffectIntensity}% intensity`
                  : "Disabled"}
              </dd>
            </div>
            <div>
              <dt>Interaction feedback</dt>
              <dd>
                {settings.visualEffectsEnabled
                  ? settings.interactionEffectsEnabled
                    ? "Enabled"
                    : "Disabled"
                  : "Paused while visual effects are off"}
              </dd>
            </div>
          </dl>

          <div className={styles.previewActions}>
            <InteractionFeedbackButton
              feedbackEnabled={interactionEffectsEnabled}
              className={styles.primaryAction}
              onClick={() => navigate(run?.status === "active" ? "/run" : "/")}
            >
              {run?.status === "active" ? "Return to run" : "Return home"}
            </InteractionFeedbackButton>
            <InteractionFeedbackButton
              feedbackEnabled={interactionEffectsEnabled}
              className={styles.secondaryAction}
              onClick={resetSettings}
            >
              Reset options
            </InteractionFeedbackButton>
          </div>
        </aside>
      </div>
    </motion.section>
  );
}
