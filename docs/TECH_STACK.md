# Tech Stack And Repository Operations

This page holds the implementation details that used to dominate the README.
The README should stay focused on the player pitch, gameplay loop, and quick
start. Use this document for stack, commands, CI, content pipeline, and project
layout details.

## Stack

- React
- TypeScript
- Vite
- Zustand
- Zod
- CSS Modules with semantic theme tokens
- Framer Motion
- Vitest
- Playwright

## Implementation Snapshot

The current build is a clean-slate browser application. It includes:

- a React, TypeScript, and Vite app shell
- browser-native deterministic simulation runtime
- local save persistence with a Load Manager for browser slots and plain JSON import/export
- expanded multi-pack decision and event libraries with deterministic
  delayed-event pools
- authored hazard rules that turn accumulated state into scheduler pressure
- compiled content manifest with direct lookup maps, content hash, flag
  diagnostics, pack/tag indexes, and hazard indexes
- set-aware decision tray composition with diversity, follow-up, exit, and
  repeat-suppression rules
- dedicated decision-selection view for roomy round-option comparison
- scheduler, faction memory, operational network, and dossier primitives wired
  into active runs
- consumable strategic reserves for high-impact political, labor, regulatory,
  and executive-network actions
- structured post-run case summaries for outcome causes, dominant strategy,
  faction pressure, operational cascades, dossier files, missed windows, and
  final decision chains
- personal wealth, legal heat, creditor patience, safety, market confidence,
  and workforce systems
- shared metric-semantics rules so inverse-pressure indicators such as
  `legalHeat`, `publicAnger`, and `debt` read correctly
- local-first options for theme, font, wallpaper, audio, UI density, animation,
  graphical effects, interaction feedback, and interaction sound cues
- unit tests, content validation, build checks, seeded balance tooling, nightly
  report artifacts, reachability tooling, and Playwright smoke tests

## Commands

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run check
npm run roadmap:generate
npm run roadmap:check
npm run content:compile
npm run content:validate
npm run simulate:runs
npm run balance:report
npm run balance:matrix
npm run report:nightly
npm run reachability:report
```

Common development checks:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Vite dev server. |
| `npm run check` | Run lint, typecheck, and unit tests. |
| `npm run build` | Produce a production build. |
| `npm run test:e2e` | Run the Playwright smoke suite. |
| `npm run roadmap:check` | Verify the generated roadmap table is current. |
| `npm run content:validate` | Validate authored decision, event, hazard, and ending content. |

## Content And Simulation Tooling

Decision, event, and hazard content are assembled from validated packs under
`content/decisions/`, `content/events/`, and `content/hazards/` through their
`index.ts` files.

`npm run content:compile` prints the compiled manifest summary and content hash.

`npm run simulate:runs` and `npm run balance:report` run deterministic seeded
campaign reports without opening the browser. The report summarizes ending
distribution, average run length, surfaced decision coverage, triggered event
coverage, and repeated-tray pressure using the documented greedy
pressure-relief bot.

`npm run balance:matrix` runs the archetype matrix across extraction, merger,
offshore, stabilizer, safety-denial, shadow-subsidiary, creditor-trench, and
regulatory-theatre bots. Each archetype section includes surfaced and selected
decision IDs for lane diagnostics.

`npm run reachability:report` runs the bounded reachability explorer with state
abstraction and low-confidence content reporting.

`npm run report:nightly` generates the deep seeded simulation artifact set under
`artifacts/nightly-simulation-report/` by default. The nightly profile runs
`750` simulations per archetype, `6,000` total across the current eight bots,
tracks ending distribution and low-confidence content, and ranks dominant
decision-sequence prefixes. The generated warnings are intentionally soft: use
them for balance review, not as automatic PR blockers.

## Simulation Entry Point

`src/simulation/index.ts` is the public simulation entry point. It exposes
`simulationRuntime` plus named helpers for creating runs, composing available
decision trays, toggling selections, resolving rounds, and looking up endings.

React, scripts, replay tooling, and high-level tests should prefer that facade
unless they are intentionally testing lower-level systems.

## Continuous Integration

GitHub Actions runs `.github/workflows/ci.yml` on pull requests targeting
`main`, pushes to `main`, and manual dispatches.

The core gate uses Node.js `22` with npm dependency caching, then runs:

- `npm run check`
- `npm run roadmap:check`
- `npm run content:validate`
- `npm run content:compile`
- `npm run build`

After the core gate passes, CI runs lightweight balance and reachability
diagnostics with `npm run balance:matrix` and `npm run reachability:report`,
then uploads their console output as the `simulation-diagnostics` artifact.

The Playwright smoke suite runs on normal PRs across the configured Chromium
viewport projects. Long nightly-style simulation sweeps are intentionally out of
scope for standard PR CI.

## Responsive Browser Play

The run experience is designed as a fitted app surface across desktop
landscape, tablet landscape, tablet portrait, and mobile portrait browser
viewports.

- Desktop and tablet landscape use dense command-center grids with internal
  panel scrolling instead of document scrolling.
- Very wide desktop windows may promote decisions into a full-width lower deck
  or a dedicated Choose Plays phase so actionable choices use extra horizontal
  space.
- The dedicated `/run/decisions` phase relaxes fitted-board compression with a
  responsive card grid and persistent selection controls.
- Tablet and phone portrait use explicit Brief, State, Decisions, and Feed
  panels with a segmented tab bar.
- Portrait quarter controls live in a persistent bottom control surface, so
  resolving a quarter stays reachable while inspecting any panel.
- Decision-selection views may use vertical breathing room or internal scrolling
  on narrow screens as long as selection count, selected state, and recovery
  paths stay obvious.
- Viewport safe-area and dynamic-height CSS are used so browser chrome and
  virtual keyboards are less likely to cover critical controls.
- `npm run test:e2e` runs smoke flow and document-overflow assertions across
  desktop landscape, tablet landscape, tablet portrait, and mobile portrait
  Chromium projects.

## Theme And Typography

First-class themes:

- `Earth`: dark, predatory, near-black surfaces with restrained green signal
  accents
- `Armonk Blue`: bright, procedural, boardroom-clean surfaces with IBM-style
  blue authority
- `Highwire`: dark graphite command surfaces with taut cyan signal accents
- `Civic Glass`: bright civic-record surfaces with tempered teal control accents

Theme references live in:

- [Themes/Earth.md](../Themes/Earth.md)
- [Themes/Armonk-Blue.md](../Themes/Armonk-Blue.md)
- [Themes/Highwire.md](../Themes/Highwire.md)
- [Themes/Civic-Glass.md](../Themes/Civic-Glass.md)

Typography uses system-safe fallback stacks for Windows 10, Windows 11, and
modern macOS. The Options page exposes `Theme Default`, `System UI`, and
`Ledger Mono` font presets without runtime web-font downloads.

Landing poster art uses a lightweight two-tone dotted composition rather than a
raster image export. Keep the treatment driven by `--landing-poster-*` theme
tokens for its two display colors and surface so Earth, Armonk Blue, Highwire,
and Civic Glass stay on the same path without per-theme image exports. Visual
changes to the poster must follow the screenshot gate in
[`docs/reference/landing-poster-visual-qa.md`](reference/landing-poster-visual-qa.md).

## Project Layout

```text
.github/
  workflows/
    ci.yml
    nightly-simulation-report.yml
Future Roadmap/
  README.md
  MASTER_ROADMAP_TABLE.md
  ISSUE_BRIEF_TEMPLATE.md
  archive/
  issue-briefs/
content/
  decisions/
    index.ts
    *.json
  events/
    index.ts
    *.json
  hazards/
    index.ts
    *.json
  endings/
docs/
  PRD.md
  TECHNICAL_BRIEF.md
  TECH_STACK.md
  FUTURE_REPORT.md
  FUTURE_REPORT_IMPLEMENTATION_PLAN.md
  decisions/
  reference/
PRDs/
  v0.1.1/
  v0.2/
  v0.3/
  v0.3.1/
  v0.4/
  v0.5/
  v0.6/
  v0.7/
  v0.8/
public/
  brand/
scripts/
  balance-matrix.ts
  compile-content.ts
  generate-roadmap-table.ts
  nightly-report.ts
  reachability-report.ts
  simulate-runs.ts
  validate-content.ts
src/
  app/
  components/
  screens/
    about/
    decision-selection/
    ending/
    load-manager/
    options/
    run/
    tutorial/
  simulation/
    content/
    dossiers/
    factions/
    operations/
    resolution/
    runtime.ts
    scheduler/
    state/
    systems/
  theme/
tests/
  e2e/
  unit/
```
