# Sub-Tab Gameplay UI Architecture

## Status

Design note for GitHub issue #98 / FR-0022. This document is
implementation-ready architecture, not a UI rewrite. It audits the current run
surface and defines the target tab/page model for a later implementation PR.

## Goals

The overhauled gameplay UI should reduce the pressure of the current dense
single-surface run view while preserving the critical context that makes every
round legible. The player should be able to move between focused gameplay
surfaces without losing the thread of the quarter.

The design must:

- keep the round rhythm of Read, Choose, and Resolve
- give major panels enough room to breathe
- keep high-risk state globally visible across tabs
- work across phone, tablet, laptop, and desktop layouts
- remain compatible with deterministic simulation and local-first state
- avoid making the player manage airline dispatch detail

## Current Baseline

The current run experience already has a useful skeleton:

- `src/screens/run/RunScreen.tsx` owns the active run workspace.
- `RoundPhaseHeader` renders three local tabs: Read, Choose, Resolve.
- `Read` contains `BoardPacket`, `MetricRail`, and `EventFeed` in one
  responsive grid.
- `Choose` embeds `DecisionTray` without end-round controls.
- `Resolve` renders a selected-decision docket and the only active
  `QuarterControls` end-round action.
- `src/screens/decision-selection/DecisionSelectionScreen.tsx` also exposes a
  dedicated `/run/decisions` route with a full `DecisionTray`.
- `src/screens/run/runLayoutMode.ts` maps viewport shape to
  `desktop-landscape`, `tablet-landscape`, or `portrait-panels`.
- `AppShell` keeps app-level navigation and the current round badge visible
  while `/run` is active.

The baseline is therefore phase-aware, but not yet fully page-aware. The Read
phase still asks the board packet, metrics, and consequence feed to share a
single surface. The separate decision-selection route gives choices more space,
but it creates a second navigation model beside the local phase tabs.

## Current Panel Inventory

| Current panel or control | Current owner | Current role | Proposed tab/page ownership |
| --- | --- | --- | --- |
| `RoundPhaseHeader` | `RunScreen.tsx` | Round flow navigation, selection status | Persistent run command bar |
| `BoardPacket` | `Read` phase | Round briefing, summary, pressure read | `Briefing` tab |
| `MetricRail` | `Read` phase | Full metric ledger | `Ledgers` tab, with compact global subset |
| `EventFeed` | `Read` phase | Recent consequence history | `Signals` tab |
| `DecisionTray` embedded | `Choose` phase | Decision card comparison and selection | `Decisions` tab |
| `DecisionSelectionScreen` | `/run/decisions` | Dedicated decision route | Transitional route or removed after tab parity |
| `ResourceLedger` | `DecisionTray` | Strategic reserve state and projections | Persistent in `Decisions`; compact global reserve strip |
| `QuarterControls` | `Resolve` phase | End-quarter action | `Review` tab only |
| `ResolveDocket` | `RunScreen.tsx` | Selected decisions and validation | `Review` tab |
| `EndRoundDialog` | `RunScreen.tsx` and decision route | Confirmation and incomplete-selection recovery | Shared modal over run surface |

## Target Information Architecture

Use one active run workspace with a persistent command region and focused local
tabs underneath it.

```text
/run
  Persistent run command bar
    Round, phase, selected-count, critical metrics, reserves, blockers

  Local gameplay tabs
    Briefing
    Ledgers
    Signals
    Decisions
    Review
```

The top-level mental model becomes:

1. **Briefing** explains what the board packet says this quarter.
2. **Ledgers** shows the full state of the two ledgers: company condition and
   executive upside.
3. **Signals** shows consequence history, faction/operation/dossier signals,
   and system memory.
4. **Decisions** is the comparison and selection workspace.
5. **Review** confirms selected plays and owns the final end-quarter action.

The phase language can remain in copy and validation, but the navigation label
should be concrete enough for repeated play. "Briefing", "Ledgers", and
"Signals" are easier to revisit than a single overloaded "Read" tab.

## Route Vs Local-Tab Tradeoffs

### Route-Based Gameplay Pages

Route-based pages such as `/run/decisions` provide browser history, deep links,
and page-level code splitting later. They also make each surface easy to test in
isolation.

The costs are significant for the active round:

- focus restoration and modal recovery need to cross route boundaries
- persistent context must move upward into `AppShell` or a new run layout route
- phase gating becomes partly router state and partly game state
- multiple route entries can represent the same active round state
- phone navigation can feel like leaving the run rather than changing surfaces

### Pure Local Tabs

Local tabs keep the active round inside one mounted workspace. This matches the
current `RunScreen` flow, keeps modal behavior simple, and avoids treating a
sub-panel change as a new app page.

The tradeoffs are:

- browser Back does not naturally return to the prior tab
- direct links to a specific gameplay surface need extra state
- a large `RunScreen.tsx` can become too broad unless tabs are extracted into
  focused child components

### Recommended Path

Prefer **local tabs inside `/run`**, backed by small, extracted run-surface
components. Keep route changes for screens that are meaningfully outside the
active run workspace, such as About, Tutorial, Options, Landing, and Ending.

The migration can keep `/run/decisions` as a temporary compatibility route that
redirects or links to `/run` with the Decisions tab active once the tabbed run
workspace reaches parity.

If deep linking becomes important, add a query parameter after the local-tab
model is stable:

```text
/run?tab=decisions
/run?tab=signals
```

Query-backed local tabs give enough shareability without forcing each gameplay
panel into a separate route. The canonical state remains the active `RunState`;
the URL only remembers presentation intent.

## Persistent Global Context

Every tab should preserve a compact global context band. It should be visible
without scrolling on desktop and laptop, and available as a sticky compact bar
on phone and tablet.

Always visible:

- current round
- active tab or phase
- selected decision count, using
  \[
  \text{selection progress} = \frac{\text{selected decisions}}{2}
  \]
- selection validity label and the next required action
- strategic reserves relevant to decision affordability
- a compact critical metric set: airline cash, debt, legal heat, safety
  integrity, public anger, and personal wealth
- end-round availability state, but not the active end-round button outside
  `Review`

Visible within its owning tab but summarized globally:

- full metric ledger
- event and signal history
- detailed board packet narrative
- selected-decision summaries
- projected reserve spend by resource

Never hidden behind a tab without a global cue:

- invalid or incomplete decision selection
- resource shortfall blocking review
- active end-round confirmation dialog
- run-ended state
- navigation away from an active run

The compact context band should use derived view data rather than mutating
simulation state. A good future boundary is:

```text
src/screens/run/runViewModel.ts
  buildRunContextSummary(run, decisions, selectedDecisions)
```

## Responsive Behavior

The current layout resolver already gives useful thresholds:

\[
\text{portrait-panels} =
  (\text{width} \le 860) \lor (\text{height} > \text{width})
\]

\[
\text{tablet-landscape} =
  (860 < \text{width} \le 1180) \land (\text{height} \le \text{width})
\]

\[
\text{desktop-landscape} =
  (\text{width} > 1180) \land (\text{height} \le \text{width})
\]

The target model should keep those concepts but name the player-facing behavior
more clearly.

### Phone

Phone should use one visible gameplay tab at a time. The command bar becomes a
two-row sticky header: row one for round, selected count, and tab switcher; row
two for compact reserves and the highest-risk blockers. Tab labels should be
short: Brief, Ledger, Signals, Plays, Review.

Content scrolls inside the page, not inside nested panel wells. `Review`
keeps the confirmation controls sticky at the bottom, but the actual end-round
button remains unavailable until the Review tab is active.

### Tablet

Tablet portrait follows the phone model with more generous density. Tablet
landscape may show the active tab plus a narrow context rail. For example,
`Decisions` can show decision cards as the main column and reserves/selection
summary as the side rail.

Do not require a two-column read dashboard on tablet portrait. It recreates the
current compression problem.

### Laptop

Laptop should prioritize a stable command bar and a focused active tab. The
layout can use a main content column plus a compact right rail for global
context. `Briefing`, `Signals`, and `Ledgers` should each be full enough to
justify a tab, rather than squeezed into one read dashboard.

### Desktop And Wide Desktop

Desktop can add companion panels without changing tab ownership. For example:

- `Briefing` may show a compact metric strip beside the board packet.
- `Ledgers` may show full metrics plus reserve state.
- `Signals` may show consequence feed plus system memory filters later.
- `Decisions` may show a selected-play summary beside cards.
- `Review` may show selected plays and final controls side by side.

At wide widths, add columns inside the active tab. Do not reassemble all tabs
into one omnibus dashboard.

## Component Architecture

The later implementation should split `RunScreen.tsx` into orchestration and
tab content. A likely shape:

```text
src/screens/run/
  RunScreen.tsx
  RunScreen.module.css
  runLayoutMode.ts
  runTabs.ts
  runViewModel.ts
  components/
    RunCommandBar.tsx
    RunTabList.tsx
    BriefingTab.tsx
    LedgersTab.tsx
    SignalsTab.tsx
    DecisionsTab.tsx
    ReviewTab.tsx
```

`RunScreen.tsx` should continue to own:

- redirecting when no run exists
- ended-run handoff to `EndingScreen`
- active tab state
- end-round dialog state
- high-level action handlers

Child tab components should receive stable props and callbacks. They should not
read directly from `useGameStore` unless a future performance issue justifies
selector-local subscriptions.

## State Model

Keep tab state presentational:

```ts
type RunGameplayTab =
  | "briefing"
  | "ledgers"
  | "signals"
  | "decisions"
  | "review";
```

The active tab can live in `RunScreen` local state at first. Reset it to
`briefing` when `run.round` changes, unless a user action explicitly navigates
elsewhere after the round starts.

Derived state should be centralized so every tab and the command bar agree on
selection validity:

- selected decisions
- selected cost
- missing decision count
- recovery options
- review availability
- resource shortfall messaging
- resolve label

Simulation state should remain untouched. The UI architecture changes how state
is viewed, not how the round resolves.

## Accessibility And Interaction

Use a proper tablist for local tab navigation:

- `role="tablist"` on the tab row
- `role="tab"` with `aria-selected`
- `role="tabpanel"` with `aria-labelledby`
- roving `tabIndex`
- ArrowLeft and ArrowRight between tabs
- Home and End to jump to first and last tab

Focus rules:

- switching tabs should focus the activated tab, not arbitrary content
- action buttons that advance to another tab should move focus to the new tab
- dismissing `EndRoundDialog` should restore focus to the invoking control
- incomplete-selection recovery should focus the first actionable decision card

Motion and audio should continue to respect current settings from
`useGameStore`.

## Implementation Phases

### Phase 1: Extract Without Redesign

- Add `runTabs.ts` with tab ids, labels, and accessibility helpers.
- Add `runViewModel.ts` for shared derived state.
- Extract `RunCommandBar` from `RoundPhaseHeader`.
- Preserve the current three visible phases while tests stay green.

Likely touched files:

- `src/screens/run/RunScreen.tsx`
- `src/screens/run/RunScreen.module.css`
- `src/screens/run/runLayoutMode.ts`
- `src/screens/run/RunScreen.test.tsx`

### Phase 2: Split Read Into Focused Tabs

- Convert Read into `Briefing`, `Ledgers`, and `Signals`.
- Keep `Decisions` and `Review` behavior equivalent to current Choose and
  Resolve.
- Move `MetricRail` and `EventFeed` to their own tab panels.
- Add compact summaries to the command bar.

Likely touched files:

- `src/components/board-packet/BoardPacket.tsx`
- `src/components/metrics/MetricRail.tsx`
- `src/components/event-feed/EventFeed.tsx`
- `src/screens/run/components/*`
- `src/screens/run/RunScreen.module.css`

### Phase 3: Reconcile `/run/decisions`

- Decide whether `/run/decisions` redirects to `/run?tab=decisions` or remains
  a legacy convenience page.
- If redirected, preserve accessibility expectations and focus the Decisions
  tab after navigation.
- Remove duplicate end-round dialog handling only after parity tests pass.

Likely touched files:

- `src/app/router.tsx`
- `src/screens/decision-selection/DecisionSelectionScreen.tsx`
- `src/screens/decision-selection/DecisionSelectionScreen.test.tsx`
- `src/screens/run/RunScreen.test.tsx`

### Phase 4: Responsive Polish

- Tune phone sticky command behavior.
- Add laptop and desktop companion rails inside active tabs.
- Confirm wide desktop does not collapse back into an omnibus dashboard.
- Verify text density work, if present, composes with the tab model.

Likely touched files:

- `src/screens/run/RunScreen.module.css`
- `src/screens/run/runLayoutMode.ts`
- component CSS modules for any promoted reusable panels

## Testing Strategy

Documentation-only work should validate with:

```text
npm run roadmap:check
npm run typecheck
```

Implementation work should add or update:

- unit tests for `resolveRunLayoutMode`
- unit tests for `runViewModel` derived selection and blocker state
- interaction tests for tab keyboard navigation
- interaction tests for moving from Decisions to Review
- regression tests for incomplete and complete end-round confirmation
- route tests for `/run/decisions` compatibility or redirect behavior
- phone and desktop visual smoke checks through Playwright once the layout
  changes are real

`npm run check` should be the normal implementation gate because the future
change will touch shared UI behavior.

## Rollback Plan

Keep the migration reversible by shipping in narrow phases:

1. Extract helpers and components while preserving the existing visual output.
2. Add new tabs behind the same `RunScreen` route.
3. Keep `/run/decisions` available until the Decisions tab has equivalent tests.
4. Avoid save-schema changes, content migrations, and simulation changes.
5. If the new tabs create unacceptable regressions, revert the tab expansion
   while keeping any harmless view-model extraction that tests prove equivalent.

Because active run state stays in the existing store, rollback should not
invalidate local saves.

## Conflict-Risk Notes

This issue is architecture-only and should not edit shared runtime UI files.
Future implementation work will be an Orange parallelism risk because it is
likely to touch `RunScreen.tsx`, `RunScreen.module.css`,
`DecisionTray.tsx`, `MetricRail.tsx`, `EventFeed.tsx`, and the decision route.

Known nearby work:

- Issue #97 focuses on fairness and reachability. It should mostly touch
  simulation, content, and reporting tests, so this design document should not
  conflict.
- Issue #99 focuses on text display density modes. Future sub-tab
  implementation must coordinate with that work before changing panel density,
  sticky controls, or text-heavy card layouts.

For the eventual UI implementation, merge in dependency order:

1. shared density or presentation settings
2. low-risk run component extraction
3. sub-tab expansion
4. route cleanup

## Open Decisions For The Implementation PR

- Should the query parameter be added in the first tab implementation or after
  local tabs stabilize?
- Which metrics belong in the compact global context by default if text-density
  settings introduce multiple display modes?
- Should `MetricRail` become a generic ledger component with compact and full
  variants, or should the command bar own a separate compact metric strip?
- Should the current three-step Read, Choose, Resolve copy remain as visible
  secondary language after the five-tab model ships?
