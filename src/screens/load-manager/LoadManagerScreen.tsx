import { motion } from "framer-motion";
import type { ChangeEvent } from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InteractionFeedbackButton } from "../../components/interaction/InteractionFeedbackButton.js";
import {
  createGameSaveFileName,
  createLocalSaveSlot,
  parseGameSaveImport,
  readLocalSaveSlots,
  removeLocalSaveSlot,
  serializeGameSaveFile,
  type GameSavePayload,
  type GameSaveSlot,
} from "../../lib/storage/save.js";
import { useGameStore } from "../../simulation/state/gameStore.js";
import styles from "./LoadManagerScreen.module.css";

type ManagerMessage =
  | {
      tone: "success" | "error" | "info";
      body: string;
    }
  | null;

function formatSavedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getRunSummary(payload: GameSavePayload): string {
  if (!payload.run) {
    return "Options-only save. No active run is attached.";
  }

  return payload.run.status === "ended"
    ? `Ended run, round ${payload.run.round}.`
    : `Active run, round ${payload.run.round}.`;
}

function getRunMeta(payload: GameSavePayload): string[] {
  if (!payload.run) {
    return ["No run", payload.theme];
  }

  return [
    `${payload.run.selectedDecisionIds.length} queued`,
    `${payload.run.history.length} records`,
    payload.theme,
  ];
}

function downloadSaveFile(payload: GameSavePayload, label: string) {
  const now = new Date();
  const blob = new Blob([serializeGameSaveFile(payload, label, now)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = createGameSaveFileName(label, now);
  anchor.click();
  URL.revokeObjectURL(url);
}

function readTextFile(file: File): Promise<string> {
  if (typeof file.text === "function") {
    return file.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      resolve(typeof reader.result === "string" ? reader.result : "");
    });
    reader.addEventListener("error", () => {
      reject(reader.error);
    });
    reader.readAsText(file);
  });
}

export function LoadManagerScreen() {
  const navigate = useNavigate();
  const theme = useGameStore((state) => state.theme);
  const settings = useGameStore((state) => state.settings);
  const run = useGameStore((state) => state.run);
  const loadSavePayload = useGameStore((state) => state.loadSavePayload);
  const [slots, setSlots] = useState<GameSaveSlot[]>(() =>
    readLocalSaveSlots(),
  );
  const [saveLabel, setSaveLabel] = useState("");
  const [message, setMessage] = useState<ManagerMessage>(null);
  const interactionEffectsEnabled =
    settings.visualEffectsEnabled && settings.interactionEffectsEnabled;
  const currentPayload = useMemo<GameSavePayload>(
    () => ({
      theme,
      settings,
      run,
    }),
    [run, settings, theme],
  );
  const currentLabel =
    saveLabel.trim() ||
    (run
      ? run.status === "ended"
        ? `Ended run, round ${run.round}`
        : `Run, round ${run.round}`
      : "Options snapshot");

  const refreshSlots = () => setSlots(readLocalSaveSlots());
  const openLoadedPayload = (payload: GameSavePayload) => {
    loadSavePayload(payload);
    navigate(payload.run ? "/run" : "/", { replace: true });
  };
  const handleLoadSlot = (slot: GameSaveSlot) => {
    openLoadedPayload(slot.payload);
    setMessage({
      tone: "success",
      body: `Loaded "${slot.label}".`,
    });
  };
  const handleDeleteSlot = (slot: GameSaveSlot) => {
    if (removeLocalSaveSlot(slot.id)) {
      refreshSlots();
      setMessage({
        tone: "info",
        body: `Deleted "${slot.label}".`,
      });
      return;
    }

    setMessage({
      tone: "error",
      body: `Could not delete "${slot.label}".`,
    });
  };
  const handleSaveSlot = () => {
    const slot = createLocalSaveSlot(currentPayload, currentLabel);

    if (!slot) {
      setMessage({
        tone: "error",
        body: "The browser refused the local save. Storage may be disabled or full.",
      });
      return;
    }

    refreshSlots();
    setSaveLabel("");
    setMessage({
      tone: "success",
      body: `Saved "${slot.label}" to browser storage.`,
    });
  };
  const handleExportFile = () => {
    downloadSaveFile(currentPayload, currentLabel);
    setMessage({
      tone: "success",
      body: `Exported "${currentLabel}" as a plain JSON save file.`,
    });
  };
  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    try {
      const result = parseGameSaveImport(await readTextFile(file));

      if (!result.ok) {
        setMessage({
          tone: "error",
          body: result.error,
        });
        return;
      }

      setMessage({
        tone: "success",
        body: `Loaded "${result.label}" from ${file.name}.`,
      });
      openLoadedPayload(result.payload);
    } catch {
      setMessage({
        tone: "error",
        body: "The selected file could not be read by the browser.",
      });
    } finally {
      input.value = "";
    }
  };

  return (
    <motion.section
      className={styles.page}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Load manager</p>
          <h1 className={styles.title}>Pick up the paper trail.</h1>
        </div>
        <p className={styles.summary}>
          Manage non-encrypted browser save slots, import plain local files, or
          export the current run for later. Future encrypted saves can bolt onto
          this boundary without changing the player flow.
        </p>
      </header>

      {message ? (
        <div
          className={styles.message}
          data-message-tone={message.tone}
          role={message.tone === "error" ? "alert" : "status"}
        >
          {message.body}
        </div>
      ) : null}

      <div className={styles.managerGrid}>
        <section
          className={styles.panel}
          aria-labelledby="load-saved-sessions-title"
        >
          <div className={styles.panelHeader}>
            <p className={styles.eyebrow}>Option 1</p>
            <h2 id="load-saved-sessions-title" className={styles.panelTitle}>
              Load saved sessions
            </h2>
            <p className={styles.panelDescription}>
              Browser slots stay on this device and store the current
              non-encrypted save payload.
            </p>
          </div>

          {slots.length > 0 ? (
            <ul className={styles.slotList}>
              {slots.map((slot) => (
                <li key={slot.id} className={styles.slotItem}>
                  <div className={styles.slotCopy}>
                    <h3>{slot.label}</h3>
                    <p>{getRunSummary(slot.payload)}</p>
                    <span>{formatSavedAt(slot.savedAt)}</span>
                  </div>
                  <div className={styles.metaRow}>
                    {getRunMeta(slot.payload).map((meta) => (
                      <span key={meta}>{meta}</span>
                    ))}
                  </div>
                  <div className={styles.slotActions}>
                    <InteractionFeedbackButton
                      feedbackEnabled={interactionEffectsEnabled}
                      className={styles.primaryAction}
                      aria-label={`Load saved session ${slot.label}`}
                      onClick={() => handleLoadSlot(slot)}
                    >
                      Load session
                    </InteractionFeedbackButton>
                    <InteractionFeedbackButton
                      feedbackEnabled={interactionEffectsEnabled}
                      className={styles.secondaryAction}
                      aria-label={`Delete saved session ${slot.label}`}
                      onClick={() => handleDeleteSlot(slot)}
                    >
                      Delete
                    </InteractionFeedbackButton>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <article className={styles.emptyState}>
              <h3>No browser slots yet.</h3>
              <p>
                Save the current session below to create a local slot on this
                device.
              </p>
            </article>
          )}
        </section>

        <section className={styles.panel} aria-labelledby="load-file-title">
          <div className={styles.panelHeader}>
            <p className={styles.eyebrow}>Option 2</p>
            <h2 id="load-file-title" className={styles.panelTitle}>
              Load from local files
            </h2>
            <p className={styles.panelDescription}>
              Import a `.tlfs-save.json` export, a current persisted record, or
              an older raw save payload.
            </p>
          </div>

          <label className={styles.fileDrop} htmlFor="save-file-import">
            <span>Choose save file</span>
            <small>Plain JSON only. Corrupt or future-version files fail safe.</small>
            <input
              id="save-file-import"
              type="file"
              accept="application/json,.json,.tlfs-save.json"
              onChange={handleImportFile}
            />
          </label>
        </section>

        <section className={styles.panel} aria-labelledby="save-actions-title">
          <div className={styles.panelHeader}>
            <p className={styles.eyebrow}>Option 3</p>
            <h2 id="save-actions-title" className={styles.panelTitle}>
              Save functionality
            </h2>
            <p className={styles.panelDescription}>
              Store a browser slot or export a local file from the same
              versioned save payload.
            </p>
          </div>

          <div className={styles.currentSave}>
            <div>
              <span>Current snapshot</span>
              <strong>{getRunSummary(currentPayload)}</strong>
            </div>
            <div>
              <span>Payload scope</span>
              <strong>Theme, settings, and run state</strong>
            </div>
          </div>

          <label className={styles.labelField} htmlFor="save-label">
            <span>Save label</span>
            <input
              id="save-label"
              type="text"
              value={saveLabel}
              placeholder={currentLabel}
              maxLength={80}
              onChange={(event) => setSaveLabel(event.currentTarget.value)}
            />
          </label>

          <div className={styles.saveActions}>
            <InteractionFeedbackButton
              feedbackEnabled={interactionEffectsEnabled}
              className={styles.primaryAction}
              onClick={handleSaveSlot}
            >
              Save browser session
            </InteractionFeedbackButton>
            <InteractionFeedbackButton
              feedbackEnabled={interactionEffectsEnabled}
              className={styles.secondaryAction}
              onClick={handleExportFile}
            >
              Export save file
            </InteractionFeedbackButton>
          </div>
        </section>
      </div>
    </motion.section>
  );
}
