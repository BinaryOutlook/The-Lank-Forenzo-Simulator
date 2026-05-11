# Local-First Run Archive Design

## Status

Proposed for issue #31. This note is implementation-ready, but it intentionally does **not** prototype persistence code yet so the current local save behavior stays untouched.

## Date

2026-05-11

## Design Inputs

- `docs/FUTURE_REPORT.md` calls for saved post-run recaps, ending galleries, personal records, scandal history, and replay seed copying while remaining local-first.
- `docs/PRD.md` requires local save/resume, versioned save snapshots, deterministic simulation, and no cloud saves for the MVP.
- `src/lib/storage/save.ts` currently owns the live save wrapper in `localStorage` with `GAME_SAVE_STORAGE_VERSION = 4`.
- `src/simulation/state/types.ts` already exposes the archive-worthy data: `endingId`, `metrics`, `contentVersion`, `contentHash`, `history`, `recap`, factions, operations, dossiers, and event counts.
- `src/screens/ending/EndingScreen.tsx` is the first natural capture point because it already normalizes recap sections for display.

## Goals

The run archive should make repeated play feel cumulative without accounts, a backend, or meta-progression pressure. It should preserve a compact local record of completed runs so a player can later answer questions such as:

- Which endings have I reached?
- Which run made me richest?
- Which scandal trail doomed or almost exposed me?
- Which seed should I replay?
- Which exit window did I miss?

## Non-Goals

- No cloud sync, shared accounts, remote telemetry, or leaderboard behavior.
- No migration of the active save system to IndexedDB in this issue.
- No achievements, unlock tracks, or durable stat bonuses beyond archive recall.
- No full replay trace until the simulation stores a stable seed and per-round decision sequence.

## Current Persistence Boundary

The current live save should remain a small `localStorage` payload:

```text
the-lank-forenzo-simulator/v1
└── Zustand persist wrapper
    ├── theme
    ├── settings
    └── run
```

That payload is synchronous, easy for Zustand to hydrate, and already guarded by Zod coercion and migration tests. The archive has a different profile: it is append-heavy, potentially prose-heavy, and useful after the live run is cleared. It should therefore live in a separate persistence tier.

## Storage Decision

### Keep in `localStorage`

Use `localStorage` only for fast boot and tiny pointers:

- active run save (`theme`, `settings`, `run`)
- lightweight settings and preferences
- optional archive affordance hints such as `lastArchivedRunId` or a cached archive count
- optional archive UI preferences such as the last selected filter

Do **not** store full run archive records in `localStorage` unless a deliberately tiny prototype is created with a hard cap and a clear migration path.

### Use IndexedDB for the Archive

Use IndexedDB for durable archive records once implementation begins:

- saved post-run recaps
- ending records and personal best summaries
- scandal records derived from dossier/history state
- scenario seeds and future replay metadata
- optional replay traces or per-round decision logs

Recommended database name: `tlfs-run-archive`.

Recommended initial object stores:

| Store | Key | Purpose |
| --- | --- | --- |
| `runs` | `archiveId` | Full `RunArchiveRecordV1` documents. |
| `runSummaries` | `archiveId` | Compact list-card entries for the archive index. |
| `metadata` | `key` | Archive schema version, retention settings, and last maintenance timestamp. |

Recommended indexes on `runs` and/or `runSummaries`:

- `endedAt`
- `endingId`
- `contentHash`
- `personalWealth`
- `legalHeat`
- `roundCount`

## Archive Schema V1

The archive record should be a derived snapshot, not a second copy of the whole mutable `RunState`.

```ts
export interface RunArchiveRecordV1 {
  schemaVersion: 1;
  archiveId: string;
  createdAt: string;
  endedAt: string;
  source: {
    appVersion?: string;
    contentVersion?: string;
    contentHash?: string;
    saveStorageVersion: number;
  };
  run: {
    seed?: string;
    roundCount: number;
    selectedDecisionIds: string[];
    selectedDecisionIdsByRound?: ArchivedDecisionRound[];
    eventCounts: Record<string, number>;
  };
  outcome: {
    endingId: EndingId;
    endingTitle: string;
    endingSubtitle: string;
    finalMetrics: RunMetrics;
  };
  recap: ArchivedRecap;
  scandalRecords: ArchivedScandalRecord[];
  highlights: RunArchiveHighlights;
  retention: {
    pinned: boolean;
    canPrune: boolean;
  };
}
```

Supporting shapes:

```ts
export interface ArchivedDecisionRound {
  round: number;
  decisionIds: string[];
}

export interface ArchivedRecap {
  headline: string;
  sections: ArchivedRecapSection[];
  historyRefs: string[];
}

export interface ArchivedRecapSection {
  id: "factions" | "operations" | "dossiers" | "missedExitWindows" | "criticalChains";
  title: string;
  items: Array<{
    title: string;
    body: string;
  }>;
}

export interface ArchivedScandalRecord {
  id: string;
  theme: string;
  severity?: number;
  evidenceCount?: number;
  summary: string;
  exposureCause?: string;
  supportingHistoryIds: string[];
}

export interface RunArchiveHighlights {
  personalWealth: number;
  legalHeat: number;
  airlineCash: number;
  marketConfidence: number;
  strongestDossierTheme?: string;
  dominantFactionId?: string;
  mostDamagingOperation?: string;
}
```

### Compact Index Entry

Archive list screens should not need to read every full record just to render cards.

```ts
export interface RunArchiveSummaryV1 {
  schemaVersion: 1;
  archiveId: string;
  endedAt: string;
  endingId: EndingId;
  endingTitle: string;
  headline: string;
  roundCount: number;
  personalWealth: number;
  legalHeat: number;
  contentHash?: string;
  seed?: string;
  pinned: boolean;
}
```

## Capture Flow

1. `resolveRound` ends a run and sets `run.status = "ended"`, `run.endingId`, and `run.recap`.
2. The ending route renders the completed run.
3. An archive service derives `RunArchiveRecordV1` from the ended run plus the resolved `EndingDefinition`.
4. The service writes the full record and compact summary to IndexedDB.
5. The UI shows a quiet confirmation such as “Saved to this browser” and offers `View archive` and `Copy seed` when seed data exists.
6. The existing live save remains intact until the player starts another run or returns to the lobby.

Archive writes must be best-effort. A failed archive write should never prevent ending display, run clearing, or local save hydration.

## Idempotency Strategy

Duplicate records are the main capture risk because the ending screen can re-render or hydrate after refresh.

Preferred future approach:

- Add optional `startedAt`, `endedAt`, `seed`, and `archiveId` fields to `RunState` when replay seeds stabilize.
- Generate `archiveId` once when the run reaches `ended`.
- Store that `archiveId` in the live save so repeated ending-screen visits upsert the same archive record.

Interim approach if no `RunState` field is added:

- Compute a deterministic fingerprint from `contentHash`, `endingId`, `round`, final metrics, selected decisions, and the final history entry id.
- Use that fingerprint as the IndexedDB key.
- Accept that two identical deterministic runs may collapse into one record until true run ids exist.

The preferred approach is better because the archive represents a player session, not just a state vector.

## Migration Strategy

### Active Save

Do not change `GAME_SAVE_STORAGE_VERSION` only to add the archive. The archive should have an independent schema version.

Increment the active save version only when live `RunState` needs new persisted fields with defaults or migrations, such as `seed`, `startedAt`, `endedAt`, or `archiveId`.

### Archive Database

Use independent archive migrations:

```text
archive schema 0: no archive database
archive schema 1: run records + summaries + metadata
archive schema 2+: replay traces, richer scandal graph, or export metadata
```

Migration rules:

- Unknown future archive records should be ignored, not coerced into the active save.
- Corrupt archive records should be skipped and counted for a non-blocking maintenance warning.
- Full record migrations should rebuild `runSummaries` so list screens stay fast.
- Clearing the archive must not clear the active run, theme, or settings.

## UI Flow

### Entry Points

- **Ending screen:** Show archive status after the recap. Primary action remains `Start another run`; archive actions stay secondary.
- **Landing screen:** Add `Run archive` as a secondary action when at least one archived run exists.
- **App shell:** Consider a header-level `Archive` link after the route exists and has useful empty-state handling.
- **Options screen:** Add a privacy/storage section with `Clear run archive` once archive persistence ships.

### Routes

Recommended route shape for the first implementation:

```text
/archive
/archive/:archiveId
```

Do not add these routes until the archive can render useful data and fail gracefully when IndexedDB is unavailable.

### Archive List

The list should be glanceable rather than diagnostic-heavy:

- sort newest first by default
- filter by ending
- show ending title, round count, personal wealth, legal heat, and recap headline
- mark content hash mismatches when old records came from older content
- include empty states for “no archived runs” and “archive unavailable”

### Archive Detail

The detail view should reuse ending-screen language where possible:

- outcome panel
- final metric snapshot
- recap sections
- scandal file panel
- seed copy affordance when available
- future “replay from seed” affordance only after deterministic seed replay is implemented

## Retention Limits

The archive should feel durable, but it should not become an unbounded prose dump.

Recommended first limits:

- keep the newest `50` unpinned records
- allow optional pinned records later, capped separately at `25`
- keep each full record under roughly `100 KB`
- prune oldest unpinned records after successful writes
- expose `Clear archive` before exposing fine-grained export/import

A simple maintenance rule is enough:

\[
S_{\text{archive}} = \sum_{i=1}^{n} \operatorname{bytes}(record_i) \leq B_{\text{soft}}
\]

Start with \(B_{\text{soft}} = 5\,\text{MiB}\) for full records. IndexedDB can often hold more, but a soft cap keeps implementation honest and avoids surprising players on constrained devices.

## Privacy Assumptions

- Archive data remains in the browser profile and is erased by browser site-data clearing.
- No archive data is sent to a server.
- Export, seed copy, or future share actions require explicit user action.
- Future custom executive names or imported seeds should be treated as private local data.
- The app should explain that the archive is local to the current browser/device.

## Prototype Guidance

A prototype is acceptable only if it is deliberately small:

- derive one compact `RunArchiveSummaryV1` on the ending screen
- store at most `10` summaries under a separate `localStorage` key
- include a one-way migration note to IndexedDB
- do not touch the existing active save key or migration path

However, the preferred next implementation is to skip the localStorage prototype and build the IndexedDB adapter directly. The current recap shape is stable enough to design against, while seed and replay shape still need runtime fields before a useful replay prototype exists.

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Duplicate archive records | Persist a generated `archiveId` on ended runs before writing records. |
| IndexedDB unavailable or quota-limited | Treat archive writes as optional; keep the ending screen usable. |
| Records become too large | Archive summaries and bounded recap sections, not full run prose. |
| Content changes make old records confusing | Store `contentHash` and show “from older content” markers. |
| Archive migrations destabilize saves | Version archive records separately from `GAME_SAVE_STORAGE_VERSION`. |
| Privacy expectations are unclear | State “saved only in this browser” near archive entry points and clear controls. |

## Implementation Plan

1. Add `src/lib/archive/types.ts` with `RunArchiveRecordV1`, `RunArchiveSummaryV1`, and parse helpers.
2. Add `src/lib/archive/createRunArchiveRecord.ts` to derive an archive record from `RunState` and `EndingDefinition`.
3. Add unit tests for record derivation, recap normalization, and malformed input guards.
4. Add a small IndexedDB adapter behind an interface such as `RunArchiveStorage`.
5. Integrate archive capture after run completion with idempotent upsert behavior.
6. Add `/archive` and `/archive/:archiveId` screens using summary-first loading.
7. Add clear/delete flows and tests before enabling archive entry points broadly.
8. Run existing save migration tests after any active save shape change.

## Acceptance Checklist for the Future Implementation

- Existing active saves still hydrate through `src/lib/storage/save.ts`.
- Archive failures never block run endings, `clearRun`, or `startNewRun`.
- A completed run creates or upserts one archive record.
- Archive list renders from compact summaries.
- Archive detail can reconstruct the recap and scandal record without live `RunState`.
- Clear archive does not clear theme, settings, or active run.
- Tests cover archive schema parsing, duplicate capture, retention pruning, and active save migration safety.
