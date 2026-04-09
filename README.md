# The Lank Forenzo Simulator

A browser-based management and extraction game about running an airline badly on purpose, converting temporary corporate credibility into personal wealth, and getting out before creditors, workers, regulators, and reality align.

## Current State

The repo is now clean-slate TypeScript.

Implemented in the current build:

- React + TypeScript + Vite app shell
- browser-native deterministic simulation loop
- local save persistence
- authored decision content plus a validated multi-pack event library with deterministic delayed-event pools
- personal wealth, legal heat, creditor patience, safety, market confidence, and workforce systems
- shared metric-semantics rules so inverse-pressure indicators such as `legalHeat`, `publicAnger`, and `debt` read correctly
- multiple endings, including merger, extraction, prison, and Bahamas escape
- two first-class themes: `Earth` and `Armonk Blue`
- unit tests, content validation, build checks, and a Playwright smoke test

## Product Shape

The game is built around one central split:

- the airline can be failing
- you can still be winning

Each round presents a board packet, a curated decision tray, and a consequence feed. The goal is not operational excellence. The goal is controlled demolition with enough plausible deniability to leave rich.

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

Event content is assembled from validated packs under `content/events/` through `content/events/index.ts`.

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
npm run content:validate
```

## Theme Direction

- `Earth`: dark, predatory, near-black surfaces with restrained green signal accents
- `Armonk Blue`: bright, procedural, boardroom-clean surfaces with IBM-style blue authority

Theme references live in [`Themes/Earth.md`](Themes/Earth.md) and [`Themes/Armonk-Blue.md`](Themes/Armonk-Blue.md).

## Project Layout

```text
src/
  app/
  components/
  screens/
  simulation/
  theme/
content/
  decisions/
  events/
    index.ts
    *.json
  endings/
docs/
  PRD.md
  TECHNICAL_BRIEF.md
PRDs/
  v0.1.1/
    v0.1.1.md
    v0.1.1-demo.html
  v0.2/
    v0.2.md
    v0.2-demo.html
tests/
  unit/
  e2e/
```

## Documentation

- Product requirements: [docs/PRD.md](docs/PRD.md)
- Systems and design brief: [docs/TECHNICAL_BRIEF.md](docs/TECHNICAL_BRIEF.md)
- Versioned iteration packets: [PRDs/v0.1.1/v0.1.1.md](PRDs/v0.1.1/v0.1.1.md), [PRDs/v0.2/v0.2.md](PRDs/v0.2/v0.2.md)
