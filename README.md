# The Lank Forenzo Simulator

A browser-based management and extraction game about running an airline badly on purpose, converting temporary corporate credibility into personal wealth, and getting out before creditors, workers, regulators, and reality align.

## Current State

The repo is now clean-slate TypeScript.

Implemented in the current build:

- React + TypeScript + Vite app shell
- browser-native deterministic simulation loop
- local save persistence
- authored decision and event content
- personal wealth, legal heat, creditor patience, safety, market confidence, and workforce systems
- multiple endings, including merger, extraction, prison, and Bahamas escape
- two first-class themes: `Earth` and `Armonk Blue`
- unit tests, content validation, build checks, and a Playwright smoke test

## Product Shape

The game is built around one central split:

- the airline can be failing
- you can still be winning

Each round presents a board packet, a curated decision tray, and a consequence feed. The goal is not operational excellence. The goal is controlled demolition with enough plausible deniability to leave rich.

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
  endings/
docs/
  PRD.md
  TECHNICAL_BRIEF.md
PRDs/
  v0.1.1/
    v0.1.1.md
    v0.1.1-demo.html
tests/
  unit/
  e2e/
```

## Documentation

- Product requirements: [docs/PRD.md](docs/PRD.md)
- Systems and design brief: [docs/TECHNICAL_BRIEF.md](docs/TECHNICAL_BRIEF.md)
- Versioned iteration packets: [PRDs/v0.1.1/v0.1.1.md](PRDs/v0.1.1/v0.1.1.md)
