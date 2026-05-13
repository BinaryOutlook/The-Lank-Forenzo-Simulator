# Local Save Manager

Status: implemented first pass
Last updated: 2026-05-13

## Summary

The Load Manager is the player-facing persistence surface for early local saves.
It deliberately starts with a non-encrypted format so the project can stabilize
the save boundary before adding tamper resistance.

The dedicated `/load` screen exposes three actions:

1. Load saved sessions from browser save slots.
2. Load from local files.
3. Save the current session to a browser slot or export it as a local file.

Entry points exist on the landing page, Options page, active run surface, and
dedicated decision-selection phase.

## Save Boundary

The durable payload boundary is `GameSavePayload`:

```ts
interface GameSavePayload {
  theme: ThemeName;
  settings: GameSettings;
  run: RunState | null;
}
```

This means a save captures presentation identity, player options, and the
current run state. It does not capture transient UI state such as the active run
phase, modal focus, or scroll position.

## Storage Targets

The game now uses two local storage layers:

- `the-lank-forenzo-simulator/v1`: the existing Zustand autosave record.
- `the-lank-forenzo-simulator/save-slots/v1`: manual browser save slots created
  by the Load Manager.

Browser slots are capped at `12` records. Each slot stores an ID, label, saved
timestamp, current game save version, and the payload.

Local file exports use plain JSON with this wrapper:

```json
{
  "format": "the-lank-forenzo-simulator.save",
  "fileVersion": 1,
  "storageVersion": 5,
  "createdAt": "2026-05-13T08:00:00.000Z",
  "label": "Run, round 1",
  "payload": {
    "theme": "earth",
    "settings": {},
    "run": null
  }
}
```

The example omits full settings and run details for readability. Real exports
include the normalized settings object and full run state when a run exists.

## Migration Assumptions

`GAME_SAVE_STORAGE_VERSION` remains the game-state migration gate. Imported
manager files, persisted Zustand records, and legacy raw payloads all pass
through the same coercion and migration path.

Current assumptions:

- Older payloads may be migrated or coerced into safe defaults.
- Corrupt JSON fails with a user-visible error and does not mutate the store.
- Future file-format versions are rejected.
- Future game-save versions are rejected during explicit file import.
- Browser slot records with incompatible payload versions are ignored rather
  than loaded unsafely.

This keeps explicit imports stricter than normal autosave hydration, which
helps avoid silently opening a save from a newer build.

## Tamper Policy

The first Load Manager pass is not encrypted and does not claim integrity
protection. Players can inspect or edit exported JSON files, and browser storage
can be modified through developer tools.

That is acceptable for the current local-first product stage because the game
has no cloud economy, multiplayer ladder, achievements, or competitive
anti-cheat surface.

Encrypted or tamper-resistant saves should be tracked as a separate roadmap
item. That follow-up should decide whether the goal is privacy, casual tamper
deterrence, or true integrity enforcement, because those are different
requirements with different trade-offs.
