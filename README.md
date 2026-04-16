# The Lank Forenzo Simulator

A browser-based management and extraction game about running an airline badly on purpose, converting temporary corporate credibility into personal wealth, and getting out before creditors, workers, regulators, and reality align.

## Current State

The repo is now clean-slate TypeScript.

Implemented in the current build:

- React + TypeScript + Vite app shell
- browser-native deterministic simulation loop
- local save persistence
- expanded multi-pack decision and event libraries with deterministic delayed-event pools
- compiled content manifest with direct lookup maps, content hash, flag diagnostics, and pack/tag indexes
- set-aware decision tray composition with diversity, follow-up, exit, and repeat-suppression rules
- v0.5 scheduler, faction memory, operational network, and dossier primitives wired into active runs
- post-run recap surfaces for faction pressure, operational damage, dossier trails, missed windows, and critical chains
- personal wealth, legal heat, creditor patience, safety, market confidence, and workforce systems
- shared metric-semantics rules so inverse-pressure indicators such as `legalHeat`, `publicAnger`, and `debt` read correctly
- multiple endings, including merger, extraction, prison, and Bahamas escape
- two first-class themes: `Earth` and `Armonk Blue`
- unit tests, content validation, build checks, seeded balance tooling, reachability tooling, and a Playwright smoke test

## Product Shape

There have been decades of airline and air-management games, but most define management through operational control: route planning, fleet allocation, scheduling, and granular efficiency. This game claims a different space. Its defining idea is the separation of personal wealth from corporate health.

You are not playing as a meticulous operator trying to build the best airline. You are playing from the macro level, managing the distance between two ledgers: the company and yourself. The airline can be failing while you are still winning, and that split is the product's core lens for every system, screen, and decision.

Each round presents a board packet, a curated decision tray, and a consequence feed. The question is not how to optimize routes or tune fleet utilization. The question is how long you can keep the company just credible enough to keep extracting value before creditors, regulators, workers, and the market close in.

## Winning, Losing, and End States

This is not a conventional "save the airline" game. The practical win condition is reaching an intentional exit before the simulation hits an automatic failure state.

Successful end states:

- `Merger`: start `Merger Backchannel` from round 4 onward, survive long enough for the delayed merger interest to become a real offer, then take `Accept the Merger`.
- `Extraction`: from round 7 onward, hit at least `65` market confidence, `28` stock price, and `35` personal wealth while keeping legal heat at `74` or lower, then choose `Cash Out and Resign`.
- `Bahamas`: from round 6 onward, reach at least `60` offshore readiness and `55` personal wealth, then choose `Run for Nassau`.

Automatic losing end states:

- `Forced Removal`: triggered if creditor patience falls to `0`, airline cash falls to `-140`, or market confidence falls to `6`.
- `Prison`: triggered if legal heat reaches `95`, or if legal heat reaches `86` while safety integrity is `35` or lower.

Strategy framing:

- If you want `Merger`, preserve enough board confidence and creditor patience to stay governable while you set up the offer.
- If you want `Extraction`, keep the market story alive long enough to sell optimism into strength without letting legal heat spike into a collapse.
- If you want `Bahamas`, convert corporate value into personal wealth and offshore readiness early, because the escape route is a race against accumulating heat.
- If you ignore the end states, the game will usually choose one for you, and those are the bad ones.

## Stack

- React
- TypeScript
- Vite
- Zustand
- Zod
- CSS Modules + semantic theme tokens
- Framer Motion
- Vitest
- Playwright

## Getting Started

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

Decision and event content are assembled from validated packs under `content/decisions/` and `content/events/` through their `index.ts` files.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run check
npm run content:compile
npm run content:validate
npm run simulate:runs
npm run balance:report
npm run balance:matrix
npm run reachability:report
```

`npm run simulate:runs` and `npm run balance:report` run a deterministic seeded campaign report without opening the browser. The report summarizes ending distribution, average run length, surfaced decision coverage, triggered event coverage, and repeated-tray pressure using the documented greedy pressure-relief bot.

`npm run content:compile` prints the compiled manifest summary and content hash. `npm run balance:matrix` runs the v0.5 archetype matrix across extraction, merger, offshore, and stabilizer bots. `npm run reachability:report` runs the bounded reachability explorer with state abstraction and low-confidence content reporting.

## Theme Direction

- `Earth`: dark, predatory, near-black surfaces with restrained green signal accents
- `Armonk Blue`: bright, procedural, boardroom-clean surfaces with IBM-style blue authority

Theme references live in [`Themes/Earth.md`](Themes/Earth.md) and [`Themes/Armonk-Blue.md`](Themes/Armonk-Blue.md).

## Project Layout

```text
idea.md
src/
  app/
  components/
  screens/
  simulation/
    content/
    dossiers/
    factions/
    operations/
    scheduler/
    systems/
    resolution/
    state/
  theme/
scripts/
  balance-matrix.ts
  compile-content.ts
  reachability-report.ts
  simulate-runs.ts
  validate-content.ts
content/
  decisions/
    index.ts
    *.json
  events/
    index.ts
    *.json
  endings/
docs/
  PRD.md
  TECHNICAL_BRIEF.md
  reference/
    decision-library.md
    dossier-system.md
    event-library.md
    faction-system.md
    operational-model.md
PRDs/
  v0.1.1/
    v0.1.1.md
    v0.1.1-demo.html
  v0.2/
    v0.2.md
    v0.2-demo.html
  v0.3/
    v0.3.md
    v0.3-demo.html
  v0.3.1/
    v0.3.1.md
    v0.3.1-demo.html
  v0.4/
    v0.4.md
    v0.4-demo.html
  v0.5/
    v0.5.md
tests/
  unit/
  e2e/
```

## Documentation

- Product requirements: [docs/PRD.md](docs/PRD.md)
- Systems and design brief: [docs/TECHNICAL_BRIEF.md](docs/TECHNICAL_BRIEF.md)
- Expansion and systems roadmap: [idea.md](idea.md)
- Decision library and historical parallels: [docs/reference/decision-library.md](docs/reference/decision-library.md)
- Event library and historical parallels: [docs/reference/event-library.md](docs/reference/event-library.md)
- V0.5 faction hooks: [docs/reference/faction-system.md](docs/reference/faction-system.md)
- V0.5 operational hooks: [docs/reference/operational-model.md](docs/reference/operational-model.md)
- V0.5 dossier hooks: [docs/reference/dossier-system.md](docs/reference/dossier-system.md)
- Versioned iteration packets: [PRDs/v0.1.1/v0.1.1.md](PRDs/v0.1.1/v0.1.1.md), [PRDs/v0.2/v0.2.md](PRDs/v0.2/v0.2.md), [PRDs/v0.3/v0.3.md](PRDs/v0.3/v0.3.md), [PRDs/v0.3.1/v0.3.1.md](PRDs/v0.3.1/v0.3.1.md), [PRDs/v0.4/v0.4.md](PRDs/v0.4/v0.4.md), [PRDs/v0.5/v0.5.md](PRDs/v0.5/v0.5.md)
