# The Lank Forenzo Simulator PRD

Status: Foundation reset
Owner: BinaryOutlook
Last updated: 2026-04-09
Project phase: Clean-slate browser reboot

## 1. Purpose

This PRD defines the stable product direction for the new browser-based version of **The Lank Forenzo Simulator**.

It exists to answer five questions:

- what the product is
- what the player is actually trying to do
- what is in scope for the first serious version
- which technical direction we are choosing on purpose
- which architectural mistakes we are refusing to repeat

This document is intentionally greenfield. It does not preserve old implementation choices out of sentiment.

It does not replace:

- `README.md` for repo overview and setup
- `docs/TECHNICAL_BRIEF.md` for deeper design and systems reasoning
- `PRDs/vX.Y/` for iteration-specific delivery packets

## 2. Product Summary

**The Lank Forenzo Simulator** is a single-player browser-based management and extraction game about running an airline badly on purpose, but intelligently.

The player is not trying to build the best airline.

The player is trying to:

- strip down the operation for liquidity
- manufacture just enough confidence to keep extracting value
- separate personal success from corporate survival
- avoid the legal chain that turns greed into prison
- decide whether to save the company, sell it, merge it, or flee to the Bahamas

The tone is darkly satirical, financially literate, and morally corrosive.

The game should feel like a board packet, a crisis room, and a slow-motion white-collar disaster at the same time.

## 3. Reset From Legacy

This project is a fresh start.

The existing Python CLI prototype served its purpose as a rough concept sketch, but it is not the foundation for the new product.

### 3.1 What we keep

We carry forward only the useful insights:

- the core triangle of staff, debt, and assets
- the round-based management rhythm
- the idea that shrinking the airline can be the correct move
- the dormant `suspicion` concept, evolved into a real legal-risk system
- the central asymmetry between company outcomes and player outcomes

### 3.2 What we do not keep

We do not preserve:

- the old Python file structure
- the CLI loop
- the current formulas as product truth
- the current state model
- the current UI assumptions
- any notion that "working before" means "worth keeping now"

### 3.3 Product rule

Legacy code may be referenced for historical understanding only.

It must not dictate:

- architecture
- framework choice
- naming
- module boundaries
- gameplay limitations

If the new product needs a system, we design it cleanly and implement it cleanly.

## 4. Product Thesis

Most management sims reward care, growth, and operational excellence.

This game should reward a different and much more unstable kind of intelligence:

- cut faster than is comfortable
- borrow harder than is sustainable
- keep appearances alive longer than truth allows
- extract personal upside before public failure becomes personal liability

The defining product insight is this:

**The company and the player are not the same entity.**

That split is the heart of the game and must be visible in every important screen and system.

## 5. Product Goals

For the first serious browser version, the product should:

- deliver a playable, stylish, browser-native management sim with a strong identity
- make personal wealth and corporate health visibly diverge
- turn each round into a meaningful set of ugly trade-offs
- present legal pressure as a playable system, not just flavor text
- support two complete visual themes without fragmenting the product
- remain local-first and easy to run during early development
- be maintainable enough for re-entry after long breaks

## 6. Non-Goals

The current phase is not trying to become:

- a simulation of real-world legal or financial advice
- a sprawling airline operations simulator with detailed route planning
- a multiplayer game
- a server-dependent live-service product
- a content-heavy narrative RPG
- a mobile-native app
- a hybrid legacy migration project

If a feature does not clearly strengthen the player fantasy, the browser experience, or the maintainability of the codebase, it should not be default scope.

## 7. Primary Users

### 7.1 Primary builder

The immediate primary user is the solo developer returning to the project after time away.

The repo, docs, structure, and scripts must support fast re-entry and low confusion.

### 7.2 Players

The player is someone who wants:

- a browser-based strategy game
- short to medium-length runs
- meaningful trade-offs with visible consequences
- a stylish, high-clarity interface instead of spreadsheet ugliness

### 7.3 Future contributors

Future collaborators should be able to understand:

- where simulation rules live
- where content lives
- where theme tokens live
- where UI composition lives
- which docs define stable product intent versus current iteration work

## 8. Experience Pillars

### 8.1 Two ledgers, two truths

The UI must constantly remind the player that:

- the airline can be suffering
- the executive can still be winning

This is the game's signature perspective.

### 8.2 Every gain has a victim

The most profitable move should often create damage elsewhere:

- labor anger
- safety decay
- creditor hostility
- political scrutiny
- investor fraud exposure

The player should feel clever first and uneasy second.

### 8.3 Pressure must stay legible

The player should always understand the major sources of risk:

- cash pressure
- debt pressure
- market pressure
- legal heat
- social blowback

Indicator semantics must respect metric direction.

For example:

- lower `legalHeat` is an improvement
- lower `publicAnger` is an improvement
- lower `debt` is an improvement
- not every raw negative number should be presented as bad if the underlying metric is healthier when it falls

Complexity is welcome. Obscurity is not.

### 8.4 The interface should feel like power under glass

The GUI should feel sharp, deliberate, and premium.

It must not look like:

- a generic admin dashboard
- a stack of cards pretending to be a strategy game
- a dev tool with a few buttons glued on

## 9. Product Format

The first serious version is a **browser-based single-page application** with a local-first simulation engine.

This product format is deliberate.

It gives us:

- fast iteration
- no mandatory backend for early milestones
- immediate playability in a browser
- deterministic local testing
- easy deployment once the prototype earns it

## 10. Theme Strategy

The product will ship with two named themes from the start, both treated as first-class design systems rather than optional skins.

Theme references:

- [Earth](../Themes/Earth.md)
- [Armonk Blue](../Themes/Armonk-Blue.md)

### 10.1 Earth

`Earth` is the darker, more predatory theme.

It should feel like:

- near-black surfaces
- restrained green signal accents
- dense, severe presentation
- quiet menace
- high-value terminal-era executive mood

This is the preferred default theme for the game's satirical tone.

### 10.2 Armonk Blue

`Armonk Blue` is the sterile boardroom theme.

It should feel like:

- white and gray corporate surfaces
- rigid spacing
- disciplined information layout
- IBM/Carbon-style enterprise authority
- procedural respectability hiding ugly decisions

This theme should make the same game feel like it is being committed inside a polished board presentation.

### 10.3 Theme requirements

Both themes must:

- use the same semantic token map
- cover every major screen and component
- be switchable without layout breakage
- preserve readability, hierarchy, and accessibility
- feel intentionally authored, not simply dark mode versus light mode

## 11. Core Product Surface

The first release should include the following screens or panels.

### 11.1 Landing screen

The landing screen should:

- introduce the game premise quickly
- allow theme selection
- allow starting a new run or resuming a local save
- set the emotional tone immediately

### 11.2 Main run screen

This is the primary game surface and should hold most session time.

It should contain:

- a board-packet summary header
- a central decision workspace
- visible company and personal metrics
- a current narrative panel or event stack
- an end-turn control

### 11.3 Decision tray

This surface should present the player's actionable choices for the round.

It must prioritize:

- clarity
- consequence preview
- hierarchy of importance
- fast scanning

### 11.4 Event and consequence feed

The player needs a place where the world answers back.

This surface should display:

- labor consequences
- creditor responses
- press backlash
- safety warnings
- board reactions
- legal escalations

### 11.5 Endgame and outcome screens

The game must make final outcomes feel authored and consequential, not like score dialogs.

The first version should support endings for:

- prison
- forced removal
- merger exit
- stock-based extraction win
- Bahamas escape

## 12. MVP Scope

The MVP should be intentionally compact but unmistakably this game.

### 12.1 In scope

- one playable campaign structure
- one airline under player control
- one executive identity
- browser-only local play
- two complete themes
- manual theme switching
- local save and resume
- board packet UI
- personal wealth tracking
- legal heat tracking
- creditor patience tracking
- workforce morale tracking
- market confidence tracking
- 20 to 30 authored decisions
- 15 to 20 authored events and consequences
- multiple endings

### 12.2 Out of scope for MVP

- multiple airlines in a shared empire
- multiplayer or leaderboards
- online accounts
- cloud saves
- procedural story generation via LLM
- voice acting
- mobile-first support beyond responsive usability

## 13. Functional Requirements

### 13.1 Run lifecycle

- A player can start a new run from the landing screen.
- A player can resume a saved local run.
- A run progresses in discrete rounds.
- Each round begins with an updated board packet and available decisions.
- Each round ends with consequences, metric changes, and new pressure states.

### 13.2 Core visible metrics

The main run screen must show:

- airline cash
- personal wealth
- debt
- asset value
- workforce size
- workforce morale
- market confidence
- creditor patience
- legal heat
- safety integrity

The player should not need secondary screens to understand the state of the run.

### 13.3 Decision system

- The player receives a curated set of decisions each round.
- Decisions may have immediate and delayed consequences.
- Decisions should preview the likely direction of impact before confirmation.
- Some decisions should be locked behind prior conditions.
- Some decisions should create future event hooks rather than immediate numeric rewards.

### 13.4 Consequence system

- The game must resolve consequences after player decisions.
- Consequences can affect multiple systems at once.
- Consequences should be capable of returning in later rounds.
- The game should support authored delayed fallout tied to past decisions.

### 13.5 Personal extraction

- The player must have ways to increase personal wealth separate from airline wealth.
- The player must be able to profit from stock exits, executive compensation, or side-channel extraction.
- Personal enrichment must carry legal and reputational risk when appropriate.

### 13.6 Legal pressure

- Legal heat must be an explicit meter or status system.
- Heat should rise from aggressive, deceptive, or reckless behavior.
- Heat should influence events, investigations, and end states.
- High heat must create real pressure, not cosmetic warnings.

### 13.7 Endgame behavior

- The game must support voluntary exit attempts before total collapse.
- Exit opportunities should depend on the current state of wealth, heat, and market conditions.
- The player should sometimes have to decide between one more profitable turn and immediate escape.

### 13.8 Theme behavior

- Theme switching must be available from the product shell.
- Theme switching must persist across sessions.
- Theme changes must not alter gameplay behavior.
- Both themes must remain fully usable across the whole app.

### 13.9 Save behavior

- The product must autosave after major state changes or at end of round.
- The player must be able to abandon a run and return later.
- Save format must be versioned so future migrations are possible.

## 14. Non-Functional Requirements

### 14.1 Maintainability

- The product must be organized so that simulation, content, and UI are clearly separated.
- New features should strengthen boundaries rather than blur them.
- The codebase should remain understandable after months away from the project.

### 14.2 Responsiveness

- Turn resolution should feel immediate on normal hardware.
- Common UI interactions should feel fast and deliberate.
- Animations should support hierarchy and feedback, not slow the game down.

### 14.3 Determinism

- Simulation rules should be deterministic given the same state and seeded randomness.
- Game state should be serializable and inspectable.
- Tests should be able to validate runs without driving the full UI.

### 14.4 Accessibility

- The interface must remain keyboard-usable.
- Color choices in both themes must preserve contrast and legibility.
- Critical information must not rely on color alone.

### 14.5 Testability

- Core simulation logic must be testable outside React components.
- Content data should be schema-validated.
- End-to-end coverage should exist for the main run lifecycle.

## 15. Technical Strategy

### 15.1 Chosen direction

The new product should be built in **TypeScript** as a browser-native application.

This is the recommended choice over Python for the fresh start.

### 15.2 Why TypeScript is the right choice

- the target experience is explicitly browser-based
- the game is UI-heavy and choice-heavy
- the simulation can run entirely in-browser without server round-trips
- one language across UI, content tooling, and simulation lowers cognitive load
- typed contracts improve maintainability for a stateful strategy game
- modern frontend tooling makes theming, animation, and test automation much cleaner

### 15.3 Why not Python for the reboot

Python was good for a throwaway CLI sketch.

It is not the best primary foundation for this specific product reset because:

- a browser GUI would still require a frontend layer anyway
- split-language development would slow iteration early
- local-first browser simulation is simpler if the simulation already lives in the browser
- we are intentionally discarding legacy implementation constraints

Python remains acceptable later for offline balancing tools if needed, but not as the core runtime.

## 16. Recommended Stack

### 16.1 Application

- React
- TypeScript
- Vite

### 16.2 State and simulation

- Zustand for app and run state
- pure TypeScript simulation modules for deterministic gameplay logic
- Zod for validating content and save payloads

### 16.3 Styling and theming

- CSS Modules plus global design-token layers
- CSS custom properties for theme tokens
- a shared semantic token system mapped to `Earth` and `Armonk Blue`
- Framer Motion for purposeful transitions and presence effects

### 16.4 Testing and quality

- Vitest
- React Testing Library
- Playwright
- ESLint
- Prettier

### 16.5 Persistence

- localStorage or IndexedDB for save persistence
- versioned save snapshots

## 17. Required Scripts

The initial browser project should expose, at minimum, the following scripts:

- `npm run dev`: start the local Vite development server
- `npm run build`: produce a production build
- `npm run preview`: preview the production build locally
- `npm run lint`: run lint checks
- `npm run typecheck`: run TypeScript checking without emitting files
- `npm run test`: run unit and component tests
- `npm run test:e2e`: run end-to-end browser tests
- `npm run format`: format source files
- `npm run check`: run lint, typecheck, and test in one command
- `npm run content:validate`: validate authored game content and theme token data

## 18. Proposed Repo Shape

The repo should be reorganized around the new browser product rather than the old prototype.

```text
src/
  app/
    App.tsx
    router.tsx
    providers/
  screens/
    landing/
    run/
    ending/
  components/
    shell/
    board-packet/
    decision-tray/
    event-feed/
    metrics/
  simulation/
    state/
    systems/
    resolution/
    content/
  theme/
    tokens/
    earth/
    armonk-blue/
  lib/
    storage/
    random/
    schemas/
tests/
  unit/
  component/
  e2e/
content/
  decisions/
  events/
  endings/
docs/
  PRD.md
  TECHNICAL_BRIEF.md
PRDs/
  v0.1/
```

## 19. Engineering Guardrails

This section is the anti-spaghetti contract for the reboot.

### 19.1 No legacy dependency mindset

- Do not preserve old files just because they exist.
- Do not recreate the CLI architecture in browser clothing.
- Do not use the old formulas as hidden truth.

### 19.2 Simulation first, UI second

- React components must not own gameplay rules.
- Simulation logic belongs in pure TypeScript modules.
- UI should render state and dispatch decisions, not calculate game truth.

### 19.3 Content is data

- Decisions, events, and endings should be authored as content, not hardcoded in component files.
- Content should be schema-validated.
- Large authored content pools should be split into maintainable packs instead of one monolithic file when scale demands it.
- Delayed consequence hooks should be explicit in data or clear system modules.

### 19.4 Theme system is foundational

- Theme tokens must be semantic, not component-specific hacks.
- Components should consume shared tokens, not theme-specific literals.
- `Earth` and `Armonk Blue` must remain equally supported.

### 19.5 Avoid generic dashboard composition

- The game UI should not degrade into card mosaics and small metric tiles everywhere.
- Information hierarchy must feel like an authored strategy game, not a SaaS analytics page.
- Motion should be restrained, meaningful, and removable when it adds no value.

### 19.6 Backend is optional, not default

- The first serious version should run without a mandatory server backend.
- Add backend services only when a real need emerges, such as cloud saves or shared accounts.

## 20. Initial Delivery Order

### 20.1 Milestone 1: Product shell

- scaffold browser app
- implement routing and app shell
- implement theme tokens and theme switching
- build the landing screen and base run layout

### 20.2 Milestone 2: Deterministic core loop

- implement state model
- implement round flow
- implement visible metrics
- implement decision application and consequence resolution
- implement local save and resume

### 20.3 Milestone 3: Signature identity

- implement personal wealth extraction
- implement legal heat
- implement authored event echoes
- implement multiple endings

### 20.4 Milestone 4: Quality pass

- improve motion and transition quality
- complete tests
- verify theme parity
- prepare versioned iteration PRD packet

## 21. Success Criteria

The reboot is on track if:

- the product can be played in a browser without touching legacy Python code
- both themes feel complete and intentional
- players immediately understand the split between airline health and personal gain
- legal heat creates real strategic tension
- each round presents meaningful choices instead of simple stat nudges
- the codebase feels cleaner after growth, not messier

## 22. Final Product Rule

This project is not a rescue operation for an old codebase.

It is a new product informed by an old experiment.

Every meaningful decision should serve that reality.
