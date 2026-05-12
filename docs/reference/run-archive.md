# Local-First Run Archive Design

## Status

Design note for implementation planning. No runtime archive is implemented in
issue #31; the current local save behavior remains unchanged.

> Planning workflow note: future archive implementation work should enter
> [`Future Roadmap/`](../../Future%20Roadmap/) as a candidate brief before a
> new GitHub issue is opened.

## Why This Exists

The archive turns completed runs into a local scandal shelf: post-run recaps,
ending outcomes, replay seeds, and evidence summaries that make repeated play
feel cumulative without accounts or a backend. It follows the direction in
`docs/FUTURE_REPORT.md`:

- keep `localStorage` focused on the current run, theme, and lightweight
  settings
- move run archives, replay traces, scenario seeds, and post-run scandal records
  to IndexedDB later
- make the end screen and archive explain which evidence trail defined the run

## Current Baseline

The current app has these persistence and recap facts:

- `src/simulation/state/gameStore.ts` persists the active save under
  `the-lank-forenzo-simulator/v1`.
- `src/lib/storage/save.ts` owns the versioned `GameSavePayload`:
  `theme`, `settings`, and `run`.
- `RunState` already carries archive-ready fields such as `contentVersion`,
  `contentHash`, `metrics`, `history`, `endingId`, optional `recap`, factions,
  operations, and dossiers.
- `EndingScreen` renders recap sections from `run.recap`, legacy recap aliases,
  or live faction/operation/dossier state.
- Runtime play does not yet store a player-facing replay seed or a per-round
  decision trace. Diagnostic scripts use seeds, but active browser runs are only
  partially replayable from current persisted state.

The archive design must be additive. It must not change the current save key,
save schema version, hydrate path, or `clearRun()` semantics until a dedicated
implementation issue does that work with migration tests.

## Non-Goals

- No cloud sync, accounts, or shared profiles.
- No achievements or meta-progression beyond archive-derived summaries.
- No migration of the active run save from `localStorage` to IndexedDB.
- No replay guarantees until browser runs persist seeds and per-round decision
  traces.

## Storage Decision

### Keep In `localStorage`

Use `localStorage` only for small, immediately-hydrated state:

- active run save payload
- selected theme
- lightweight options and presentation settings
- a future one-record archive migration marker, if needed

Do not store the full archive in `localStorage`. Web Storage is synchronous,
string-only, and better suited to compact preferences than a growing library of
structured records. It also makes every archive write compete with UI work on
the main thread.

### Move To IndexedDB

Use IndexedDB for the durable archive because it is asynchronous, supports
indexed structured records, and can grow beyond the tiny current-save payload:

- completed run summary records
- normalized ending gallery stats
- replay seed metadata
- future per-round replay traces
- post-run scandal records and dossier evidence summaries
- optional JSON export/import staging records

IndexedDB should be wrapped behind a small storage adapter so UI screens never
call the raw browser API directly.

Suggested module boundary:

```text
src/lib/storage/runArchive.ts
  openRunArchiveDatabase()
  listRunArchiveSummaries()
  getRunArchiveEntry(id)
  archiveCompletedRun(input)
  deleteRunArchiveEntry(id)
  pruneRunArchive()
```

## Archive Schema

Archive records should be summaries, not full mutable save snapshots. The
current run save answers "can I resume?" while the archive answers "what
happened?".

```ts
type RunArchiveSchemaVersion = 1;

interface RunArchiveEntry {
  id: string;
  schemaVersion: RunArchiveSchemaVersion;
  createdAt: string;
  updatedAt: string;
  endedAt: string;
  pinned: boolean;
  source: "ending-screen" | "import" | "migration";
  status: "complete" | "summary-only" | "legacy";
  content: {
    version?: string;
    hash?: string;
  };
  replay: {
    seed?: string;
    traceCompleteness: "none" | "summary" | "full";
    decisionTrace?: ArchivedDecisionTurn[];
  };
  ending: {
    id: string;
    title: string;
    subtitle?: string;
  };
  metrics: ArchivedRunMetrics;
  recap: ArchivedRunRecap;
  scandal: ArchivedScandalRecord;
  historyExcerpt: ArchivedHistoryEntry[];
  flags: string[];
  privacy: {
    storage: "local-device";
    containsUserText: false;
    cloudSync: false;
  };
}

interface ArchivedDecisionTurn {
  round: number;
  decisionIds: string[];
}

interface ArchivedRunMetrics {
  roundsSurvived: number;
  personalWealth: number;
  legalHeat: number;
  marketConfidence: number;
  creditorPatience: number;
  safetyIntegrity: number;
  publicAnger: number;
  stockPrice: number;
  offshoreReadiness: number;
}

interface ArchivedRunRecap {
  headline: string;
  sections: {
    id:
      | "factions"
      | "operations"
      | "dossiers"
      | "missedExitWindows"
      | "criticalChains";
    title: string;
    items: { title: string; body: string }[];
  }[];
}

interface ArchivedScandalRecord {
  primaryTheme?: string;
  exposureCause?: string;
  records: {
    theme: string;
    label: string;
    severity?: number;
    evidenceCount?: number;
    summary: string;
  }[];
}

interface ArchivedHistoryEntry {
  round: number;
  source: "decision" | "event" | "system" | "faction" | "operation" | "dossier";
  title: string;
  body: string;
  tone: "positive" | "negative" | "neutral";
}
```

### Derived Fields

The implementation should derive archive fields from the ended `RunState`:

- `endedAt`: write time when the archive entry is created
- `ending`: `run.endingId` plus the current content ending title/subtitle
- `metrics.roundsSurvived`: `run.round`
- `recap.sections`: the same normalized recap shape used by `EndingScreen`
- `scandal.records`: top dossier threads by severity or evidence count
- `historyExcerpt`: the most recent high-signal entries, capped to avoid
  storing an entire feed forever
- `replay.traceCompleteness`: `summary` until browser runs persist per-round
  decision traces; `full` only after `ArchivedDecisionTurn[]` is available

Archive IDs can use `crypto.randomUUID()` when available. A fallback can combine
`endedAt`, `ending.id`, and `content.hash`; it only needs uniqueness, not
simulation determinism.

## Capture And Idempotency Notes

The future archive service should treat capture as a best-effort side effect of
an already-ended run:

1. `resolveRound` ends the run and produces `run.endingId` plus recap data.
2. The ending screen renders from the ended run, regardless of archive storage
   availability.
3. A small archive service derives the archive entry from `RunState` and the
   resolved ending definition.
4. Storage upserts the archive entry and any compact list data needed by the
   archive index.
5. The UI can then show a quiet "saved on this device" confirmation, with
   archive navigation or seed-copy actions only when those capabilities exist.

Archive writes must never block ending display, `clearRun()`, start-new-run
flows, or active-save hydration. IndexedDB quota errors, private-browser
limitations, and corrupt archive records should degrade into a non-blocking
archive warning rather than a failed game ending.

Duplicate records are the main capture risk because the ending screen can
rerender or hydrate after refresh. The preferred implementation is to generate
one `archiveId` when a run reaches `ended`, persist that id on the ended run, and
upsert the same archive record on repeated visits. If the active `RunState` does
not yet have stable run ids or replay seeds, an interim fingerprint can combine
`contentHash`, `endingId`, `round`, final metrics, selected decisions, and the
last history entry id. That fingerprint is less expressive than a true session
id, but it keeps duplicate capture bounded until replay metadata lands.

## IndexedDB Shape

Use one database so future local-only features have a clear home.

```text
Database: the-lank-forenzo-simulator
Version: 1

Object stores:
  runArchive
    keyPath: id
    indexes:
      endedAt
      ending.id
      content.hash
      metrics.personalWealth
      metrics.legalHeat
      metrics.roundsSurvived

  archiveMeta
    keyPath: key
    records:
      schemaVersion
      lastPrunedAt
      migratedLocalStorageArchiveAt
```

Do not add `runArchive` data to the existing Zustand save payload. The save
payload should stay small and quick to hydrate.

## UI Flow

### Entry Points

1. **Ending screen**
   When `run.status === "ended"`, offer a clear archive action:
   - primary next-run action stays "Start another run"
   - secondary archive action: "Save to archive" or "View archive"
   - if auto-save is enabled later, show "Saved to archive" with an undo/delete
     affordance rather than forcing a second decision
2. **Landing screen**
   Add an "Archive" entry beside resume/new-run once the route exists.
3. **App shell navigation**
   Add a low-noise Archive link after the feature has real content. It should not
   displace the active run path.

### Archive Route

Proposed route: `/archive`.

The route should have:

- empty state explaining that completed runs will appear on this device
- ending filters: all, merger, extraction, Bahamas, forced removal, prison
- summary stats:
  - best personal wealth by ending
  - fastest escape
  - worst legal heat survived
  - most common scandal theme
- card list sorted by newest first
- delete controls per card
- optional "Export archive JSON" and "Import archive JSON" controls later

### Archive Detail

Each detail view should show:

- ending title, subtitle, and date
- metric snapshot
- recap sections
- scandal file / dossier evidence
- missed windows and critical chains
- replay seed copy button when a seed exists
- clear local-data reminder

The archive should read like a case file, not a second game board.

## Migration Strategy

### Phase 0: Design Only

Issue #31 lands this design. No save migration is required because no runtime
storage changes are made.

### Phase 1: Small Local Prototype, If Approved

If a later issue wants a minimal prototype before IndexedDB, it may store a tiny
summary-only archive under a separate key:

```text
the-lank-forenzo-simulator/archive/v1
```

Hard constraints for that prototype:

- maximum `10` records
- maximum serialized payload target of `250 KB`
- no full decision trace
- no change to `the-lank-forenzo-simulator/v1`
- unit tests proving current save migration behavior is unchanged

This prototype should be deleted or imported once IndexedDB lands.

### Phase 2: IndexedDB Archive

The first IndexedDB implementation should:

1. create `runArchive` and `archiveMeta`
2. read any prototype archive key once, import valid records, and mark the import
   in `archiveMeta`
3. leave the prototype key in place for one release as rollback insurance
4. write new archive entries only to IndexedDB
5. keep the current run save in `localStorage`

Archive schema migrations are separate from `GAME_SAVE_STORAGE_VERSION`. A
future `RUN_ARCHIVE_SCHEMA_VERSION` should migrate archive entries inside the
archive adapter, not in `src/lib/storage/save.ts`.

## Retention Limits

Default retention should be generous enough to feel cumulative while respecting
browser storage uncertainty:

- IndexedDB: keep the newest `100` unpinned entries by default
- pinned entries: never prune automatically
- per-entry summary target: under `30 KB` before replay traces
- full archive soft target: under `5 MB` before replay traces
- localStorage prototype, if approved: keep only `10` summary-only entries

When pruning is required, delete the lowest-value unpinned entry first. A simple
ranking can be:

$$
P = R + B + S
$$

where \(R\) is recency, \(B\) is whether the run sets a personal best for an
ending, and \(S\) is whether the run has a rare scandal theme. Lower \(P\) values
are pruned first. Pinned entries are excluded from this formula.

## Privacy Assumptions

- The archive is local to the browser origin and device profile.
- There are no accounts, cloud sync, analytics uploads, or cross-device merge
  semantics.
- The archive should not store player-authored names, emails, credentials, or
  free text.
- Browser "clear site data" actions may delete the archive.
- Private/incognito sessions should be treated as ephemeral.
- Export/import, if added, must be explicit and file-based.
- The UI should describe the archive as "saved on this device" rather than
  "permanent."

## Testing Requirements For Implementation

When runtime code is added, include tests for:

- archive schema coercion and rejection of corrupt records
- archiving an ended run without mutating the current save payload
- duplicate prevention if the same ended run is archived twice from the ending
  screen
- retention pruning, including pinned records
- localStorage prototype import into IndexedDB, if that prototype ever ships
- `tests/unit/save.test.ts` continuing to pass unchanged

Suggested verification for the first code-bearing archive issue:

```bash
npm run test -- tests/unit/save.test.ts
npm run typecheck
npm run lint
npm test
```

## Open Questions

- Should completed runs auto-archive by default, or should the ending screen ask
  the player to save each record?
- What is the canonical browser-run seed once active play exposes replay seeds?
- How much per-round trace is needed for useful replay without bloating the
  archive?
- Should archive detail be a full route (`/archive/:id`) or a modal on the
  archive list for the first implementation?
- Should export/import wait until after IndexedDB, or ship with the first
  archive UI?

## Implementation Checklist

- [ ] Add `RUN_ARCHIVE_SCHEMA_VERSION`.
- [ ] Add a `runArchive` storage adapter with typed return values and no `any`
      types.
- [ ] Normalize ended-run recap data through a shared helper so the archive and
      `EndingScreen` agree.
- [ ] Add `/archive` only after list and empty states are ready.
- [ ] Preserve existing save hydration and migration tests.
- [ ] Update README once a route or player workflow exists.

## Platform References

- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [MDN: Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [web.dev: Storage for the web](https://web.dev/articles/storage-for-the-web)
- [MDN: Browser storage limits and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
