# ADR-001: Prepare Future Package Boundaries Without Migrating Yet

## Status
Accepted

## Date
2026-05-11

## Context

`docs/FUTURE_REPORT.md` recommends eventual boundaries for the web client, `sim-core`, `content-schema`, `content-compiler`, `sim-analysis`, optional `sim-worker`, and an `apps/web` destination for the browser app. Those names describe real seams already forming in the codebase: React presents the game, `src/simulation/` resolves deterministic rules, `content/` holds authored data, and `scripts/` run diagnostics.

The project is not ready for a monorepo migration yet. The current single-package layout is still productive, CI-friendly, and easy for agents to enter. A premature package split would create churn in imports, npm scripts, build wiring, and review focus before the simulation public API and content compiler contract have earned that structure.

This ADR records the target boundaries and the discipline to follow now. It does **not** authorize moving files, changing package managers, or altering build tooling for this issue.

## Decision

Keep the repository as one npm package for now, but treat the future package map as an architectural boundary plan. New work should make the seams clearer in place before any directory migration:

- Web/UI code may adapt simulation results for presentation, persistence, routing, audio, and browser interaction.
- Deterministic simulation rules should stay independent from React, routing, DOM APIs, Zustand stores, and browser storage.
- Content schemas and metadata should become the shared contract between authored content, runtime simulation, validation, and compiler diagnostics.
- Analysis scripts should consume simulation and content APIs; they should not become the place where game rules quietly diverge.
- Migration should be behavior-neutral and should happen only after the API seams are stable enough to test before and after the move.

Package vocabulary in this ADR:

- **web-client** means the future browser application package, represented in the file tree as `apps/web`.
- **sim-worker** remains an optional extension package, not part of the minimum package split.

## Current Folders To Future Packages

| Current location | Future home | Notes |
| --- | --- | --- |
| `src/app/` | `apps/web/src/app/` | Router, providers, app composition, and browser entry wiring stay web-owned. |
| `src/components/` | `apps/web/src/components/` | Presentation components should call web-facing adapters, not reimplement simulation logic. |
| `src/screens/` | `apps/web/src/screens/` | Route screens remain web-client code. |
| `src/theme/` | `apps/web/src/theme/` | Theme tokens and visual systems are app concerns. |
| `src/lib/random/` | likely `packages/sim-core/src/random/` | Seeded randomness is part of deterministic simulation and analysis. Keep it framework-free. |
| `src/lib/storage/` | `apps/web/src/storage/` | Save persistence is browser/app infrastructure, not core simulation. |
| `src/lib/schemas/contentSchemas.ts` | `packages/content-schema/src/schemas/` | Zod contracts should eventually live with content metadata and validation types. |
| `src/simulation/content/metadata.ts` | `packages/content-schema/src/metadata/` | Enumerations such as metric keys, packs, groups, and endings are shared content contracts. |
| `src/simulation/content/validation.ts` | `packages/content-schema/src/validation/` or `packages/content-compiler/src/diagnostics/` | Keep pure schema validation in `content-schema`; keep manifest or reachability diagnostics in `content-compiler`. |
| `src/simulation/content/index.ts` | web/content adapter plus `packages/content-compiler` | Today it loads JSON and compiles a manifest. Future code should separate runtime loading from compiler logic. |
| `src/simulation/content/manifest.ts` | `packages/content-compiler/src/` | Manifest creation, lookup indexes, hash generation, and content diagnostics belong in the compiler boundary. |
| `src/simulation/state/types.ts` | `packages/sim-core/src/state/` with imports from `content-schema` | Runtime state and content definition types should not depend on web-client code. |
| `src/simulation/state/settings.ts` | split between `packages/sim-core` and `apps/web` | Simulation-affecting settings can be core; wallpaper/audio/UI density remain web-owned. |
| `src/simulation/state/gameStore.ts` | `apps/web/src/state/` adapter | This file currently mixes Zustand, save persistence, content loading, and simulation calls. It should stay out of `sim-core` during extraction. |
| `src/simulation/resolution/` | `packages/sim-core/src/resolution/` | Round resolution and ending checks are core simulation rules. |
| `src/simulation/systems/` | `packages/sim-core/src/systems/` | Decision, requirement, metric, consumable, briefing, and ending rules are core. |
| `src/simulation/scheduler/` | `packages/sim-core/src/scheduler/` | Event scheduling is deterministic runtime behavior. |
| `src/simulation/factions/` | `packages/sim-core/src/factions/` | Faction memory and planning are core simulation systems. |
| `src/simulation/operations/` | `packages/sim-core/src/operations/` | Operational network state and resolution are core. |
| `src/simulation/dossiers/` | `packages/sim-core/src/dossiers/` | Dossier evidence and pressure are core systems. |
| `content/decisions/`, `content/events/`, `content/endings/` | top-level `content/` consumed by `content-schema` and `content-compiler` | Keep authored content outside package source so designers can see it plainly. |
| `scripts/compile-content.ts` | command wrapper over `packages/content-compiler` | The script can remain a CLI entry point after compiler extraction. |
| `scripts/validate-content.ts` | command wrapper over `packages/content-schema` and `packages/content-compiler` | Validation should share the same schema contracts used by runtime loading. |
| `scripts/simulate-runs.ts` | `packages/sim-analysis/src/` plus CLI wrapper | Simulation campaigns are analysis, not game runtime. |
| `scripts/balance-matrix.ts` | `packages/sim-analysis/src/` plus CLI wrapper | Balance matrix logic should consume public simulation APIs. |
| `scripts/reachability-report.ts` | `packages/sim-analysis/src/` plus CLI wrapper | Reachability exploration should not import web or store adapters. |
| `scripts/simulation-reporting.ts` | `packages/sim-analysis/src/` | Shared bot policies and reporting helpers belong with analysis. |
| `tests/unit/` | package-adjacent tests after extraction | Unit tests should track the package owning the behavior. |
| `tests/e2e/` | `apps/web/tests/e2e/` or top-level e2e | Browser smoke tests remain web-client verification. |
| `docs/`, `PRDs/`, `Themes/` | top-level docs | Documentation stays repository-wide. |

## Dependency Direction Rules

The future import graph should remain acyclic and point inward toward stable contracts:

```text
web-client/apps/web -> sim-core -> content-schema
content-compiler -> content-schema
sim-analysis -> sim-core + content-compiler
sim-worker -> sim-core + sim-analysis
```

Current work should preserve these rules even before directories move:

1. `src/simulation/resolution`, `src/simulation/systems`, `src/simulation/scheduler`, `src/simulation/factions`, `src/simulation/operations`, and `src/simulation/dossiers` must not import React, React Router, DOM APIs, Zustand, storage adapters, screen components, or CSS modules.
2. `src/simulation/state/gameStore.ts` is an application adapter despite its current path. Do not use it as evidence that `sim-core` may depend on Zustand or browser persistence.
3. Content schema code may define data shapes, metadata, and validation primitives. It should not import round resolution, faction planning, screens, or script-only reporters.
4. Content compiler code may build manifests, hashes, indexes, and diagnostics from content-schema contracts. It should not own gameplay resolution.
5. Analysis code may simulate runs and inspect coverage through simulation APIs. It may contain bot policies and report formatting, but not hidden production-only gameplay rules.
6. Web code may depend on public simulation APIs and compiled content artifacts. It should not require analysis scripts to run the game.
7. `sim-worker` remains optional. Do not introduce it until background analysis or long-running simulation creates a measurable browser responsiveness problem.

## Migration Triggers

A package migration becomes worthwhile when several of these are true:

- A small simulation public API has stabilized in the current layout, including initial run creation, decision tray composition, decision selection, round resolution, ending lookup, and content loading.
- `gameStore` has been split so browser persistence and Zustand are web-client adapters around pure simulation functions.
- Content schemas, metadata, and validation rules are shared cleanly by runtime loading, compiler diagnostics, and content validation scripts.
- Balance, reachability, and simulation scripts can consume the same public APIs as the app without deep imports into UI or store code.
- The import graph can be verified manually or with a lightweight check before changing package structure.
- A second consumer genuinely needs the boundary, such as a worker, richer offline analysis CLI, alternate client, or package-level tests.
- The team can make the migration behavior-neutral and prove it with `npm run typecheck`, `npm run lint`, `npm test`, and the relevant content or balance commands.

## Non-Triggers: When Not To Migrate

Do **not** migrate merely because:

- The folder tree looks large.
- A future report sketches package names.
- A single new content pack, script, screen, or system lands.
- The Vite bundle-size warning appears without an accompanying code-splitting plan.
- Agents want cleaner import paths for convenience.
- A monorepo feels more professional.
- A package manager change would be required to make the split comfortable.
- The simulation public API is still changing every iteration.
- `src/simulation/state/gameStore.ts` still owns both app persistence and gameplay orchestration.
- The move would compete with higher-value gameplay work such as reachability, endings, hazards, faction memory, operations, or dossier clarity.

## Recommended Migration Sequence

1. **Harden seams in place.** Keep the single-package layout, but introduce or refine a public simulation entry point and stop adding new deep imports from UI into internal simulation modules.
2. **Split the web adapter.** Move persistence, settings that are purely presentational, and Zustand orchestration out of the future `sim-core` candidate path.
3. **Extract shared content contracts.** Separate metadata and Zod schemas into the future `content-schema` boundary while keeping imports behavior-neutral.
4. **Extract compiler behavior.** Move manifest generation, content hashes, indexes, and diagnostics toward the future `content-compiler` boundary, with CLI scripts as thin wrappers.
5. **Extract deterministic simulation.** Move pure state, resolution, scheduler, faction, operations, dossier, and decision systems into `sim-core` only after they are free of browser/app dependencies.
6. **Extract analysis.** Move balance matrix, reachability, campaign simulation, bot policies, and report helpers into `sim-analysis` after they consume `sim-core` and `content-compiler` through public APIs.
7. **Rehome the web app.** Move React app folders under `apps/web` after the packages are usable and the app is primarily an adapter over their public APIs.
8. **Add `sim-worker` only if needed.** Create the worker package when background simulation, long balance runs, or browser responsiveness goals justify the extra deployment surface.

Each stage should be a small pull request when possible. The migration is successful only if game behavior, content validation, and analysis reports remain explainable before and after the move.

## Consequences

- Future contributors get a clear map without paying the migration cost today.
- New code has a vocabulary for where it will eventually live.
- The current app remains simple to run with the existing npm scripts.
- The project avoids package-manager churn and build-tool churn until there is a real consumer-driven reason.
- Some current paths remain imperfect, especially `src/simulation/state/gameStore.ts`; this ADR makes that imperfection explicit instead of normalizing it.

## References

- `docs/FUTURE_REPORT.md`, especially "Code Architecture Future" and "Risk: Package Migration Distracts From Gameplay".
- `docs/TECHNICAL_BRIEF.md` for the durable simulation responsibilities that should stay core.
- Roadmap parent issue #17 and implementation issue #33.
