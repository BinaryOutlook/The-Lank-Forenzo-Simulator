# Technical Brief: The Lank Forenzo Simulator

## High Concept

**The Lank Forenzo Simulator** is a turn-based management and extraction game about running an airline badly on purpose, but intelligently.

The player is not trying to build the most admired carrier. The player is trying to convert an operating company into:

- personal cash
- temporary market confidence
- enough plausible deniability to avoid prison

The essential fantasy is strategic predation under legal pressure.

## Design Thesis

Most business sims reward care, expansion, efficiency, and customer delight. This one should reward a colder and more unstable form of intelligence:

- cutting deeper than feels safe
- borrowing harder than feels sustainable
- preserving appearances longer than seems possible
- extracting personal upside before institutional collapse becomes personal liability

The game becomes interesting when the player keeps asking the same question in different forms:

> Is this move smart, or merely the kind of move that looks smart one quarter before disaster?

That is the emotional center of the design.

## What The Current Code Already Proves

The existing prototype is small, but it contains the seed of the full game.

### Existing simulation model

`airline.py` currently models an airline with:

- `cash`
- `debt`
- `asset`
- `staff`
- `rev`
- `exp`
- `profit`

The player can already perform three morally important actions:

- change staff count
- change debt
- change assets

This is enough to establish the game's core language: labor, leverage, and liquidation.

### Existing turn structure

`main.py` already provides:

- a `Background` object containing the round number and a `suspicion` value
- a round-advance method that resolves airline finances
- a loop that displays state, accepts input, and advances time

That means the prototype already knows what it is: a round-based balance-sheet pressure game.

### Existing UI direction

`cliui.py` presents airline state in a readable management table. Even this basic display supports the intended fantasy well because the game is fundamentally about scanning metrics and making ugly choices.

### Implementation direction

The prototype should be treated as concept evidence, not as the codebase to grow.

The real version should be implemented as a clean-slate browser application that carries forward the design insights without preserving the old runtime, module structure, or UI approach.

## Core Player Fantasy

The player fantasy should be framed around four escalating intentions:

1. Stabilize the company just enough to stay in the chair.
2. Strip it down to unlock liquidity and control.
3. Convert temporary corporate stability into personal wealth.
4. Decide whether to save the company, sell it, merge it, bankrupt it, or flee.

That sequence matters because it creates a disturbing but compelling structure:

- early game: rescue language
- mid game: restructuring language
- late game: extraction language
- end game: escape language

## Win, Loss, And Ambiguous Outcomes

This game should not have a single score-only victory condition.

### Hard losses

- jailed after investigations, hearings, or fraud exposure
- forced out too early with insufficient personal wealth
- operational collapse before extraction is complete
- creditor seizure that freezes your exit options
- catastrophic safety event that instantly spikes legal exposure

### Strong wins

- sell out at the top and leave with major personal wealth
- offshore enough wealth to trigger a successful Bahamas escape
- engineer a merger that lets you exit rich and formally clean

### Bitter wins

- survive legally but end the game notorious, broke relative to ambition, or dependent on immunity deals
- save the airline but fail personally because you played too ethically for the fantasy the game is actually about

The best ending structure is one where the player can "win" the company and lose the character, or lose the company and win the character.

## Primary Game Loop

Each round should represent a board period or reporting cycle.

### Proposed round structure

1. Review the board packet.
2. Make executive decisions.
3. Resolve the market, labor, creditor, and regulator response.
4. Convert some outcomes into personal wealth opportunities.
5. Check for investigations, insolvency, leadership challenge, and escape windows.
6. Advance to the next round.

### Board packet contents

At the start of each round, the player should see:

- airline cash
- personal wealth
- debt and debt service
- asset quality and asset liquidity
- staff count and morale
- revenue, operating margin, and cash burn
- creditor patience
- public anger
- legal heat
- stock price and narrative momentum
- safety integrity

This is the minimum readable dashboard for meaningful decision-making.

## Core Systems

### 1. Corporate Finance

This is the anchor system and should remain deterministic enough for the player to reason about.

Suggested variables:

- `airline_cash`
- `personal_cash`
- `debt_principal`
- `interest_rate`
- `asset_book_value`
- `asset_condition`
- `route_strength`
- `labor_count`
- `labor_morale`
- `market_confidence`
- `creditor_patience`

The current revenue and expense formulas in `airline.py` are a useful starting point, but the next version should split assets into categories:

- aircraft
- gates and slots
- route rights
- maintenance base
- brand equity

That makes stripping decisions more specific and interesting.

### 2. Legal Heat

The dormant `Background.suspicion` field in `main.py` should evolve into the central pressure mechanic.

Rename it conceptually to `heat`, `exposure`, or `legal_heat`.

It should increase from:

- aggressive layoffs
- pension raids or benefit cuts
- misleading investor messaging
- insider selling
- maintenance deferral
- sham consulting fees
- creditor deception
- whistleblower events

It should decrease through:

- settlements
- sacrificial firings of subordinates
- better disclosures
- genuine operational improvements
- political influence or public distraction events

The point is not simply to avoid a number reaching 100. The point is to create a meter that changes how every other system feels.

### 3. Personal Wealth Extraction

This is the defining system that separates the game from a normal tycoon sim.

The player should be able to enrich themselves through:

- salary and bonus packages
- executive retention payouts
- consulting contracts through shell entities
- stock grants and timed stock sales
- asset sale commissions
- merger bonuses
- quiet offshore transfers

This money should be meaningfully separate from company money. A dying airline should be able to coexist with a wealthy executive.

### 4. Workforce Blowback

Employees are not only a cost input. They are also the game's memory.

Cuts to labor should affect:

- service quality
- operational capacity
- union anger
- whistleblower probability
- sabotage risk
- media sympathy

Former employees can return as:

- strike organizers
- press sources
- committee witnesses
- plaintiffs
- anonymous tipsters

This makes layoffs tactically effective and strategically dangerous.

### 5. Creditor And Board Politics

Creditors and directors should each have separate tolerances.

Creditors care about recoverability:

- collateral quality
- truthful reporting
- refinancing probability
- asset sale proceeds

The board cares about survivability and deniability:

- whether the turnaround story still sounds plausible
- whether your actions are making them richer
- whether they can blame you later if needed

This creates rich decision space because the player is managing not just resources, but constituencies.

### 6. Safety Decay

Safety should be a hidden or semi-visible system tied to maintenance, staffing depth, and operational chaos.

Short-term savings can:

- improve profit optics now
- increase the chance of disruption later
- spike legal heat if an incident occurs

This is the best place to make greed feel mechanically dangerous rather than merely immoral in text.

## Unique Interaction Mechanics

These are the mechanics most likely to make the game stand out.

### 1. The Butcher's Ledger

Each round, the player gets a dedicated "where will the pain go?" choice screen.

Examples:

- cut pilots
- cut maintenance
- cut customer-facing staff
- close a hub
- sell aircraft
- lease back aircraft
- defer obligations

Every option provides immediate relief but damages a different long-term system.

This turns austerity into a signature mechanic instead of a generic slider.

### 2. Two Ledgers, Two Truths

Always display both:

- company wealth
- personal wealth

Many actions should improve one while damaging the other.

That single UI decision will teach the player what kind of game they are actually playing.

### 3. Stock Pump, Stock Dump

The player should be able to manufacture just enough optimism to sell into it.

Tools could include:

- announcing a turnaround initiative
- headline layoffs that excite markets
- promising future route discipline
- spinning off assets into a cleaner-looking vehicle
- selectively timing positive disclosures

This raises stock price temporarily, but misalignment between story and reality raises heat and whistleblower risk.

### 4. The Plausible Deniability Chain

Some decisions can be routed through intermediaries:

- outside consultants
- legal counsel
- aggressive CFOs
- hostile turnaround specialists

This lowers immediate personal exposure but creates more people who know what happened.

It is a beautiful mechanic because it trades direct culpability for leak surface area.

### 5. Bahamas Preparation

The endgame should be visible long before it is available.

The player slowly builds:

- offshore cash
- exit documents
- friendly intermediaries
- a window before subpoenas land

The player should feel the temptation to leave early versus greedily chase one more extraction cycle.

### 6. Human Event Echoes

Harsh decisions should not vanish after resolution.

A single choice can reappear rounds later:

- a fired mechanic becomes a witness
- a sold maintenance base causes delay cascades
- a pension freeze drives political hearings
- a misleading investor call resurfaces during discovery

This gives the world memory and makes the game feel authored rather than algebraic.

## Example High-Value Decision Cards

These are concrete mechanics worth building early.

### Sale-Leaseback Blitz

You can sell aircraft now and lease them back.

Option A:
- large immediate cash gain
- short-term stock boost
- long-term operating expense increase
- moderate creditor concern

Option B:
- no cash boost
- stronger long-run resilience
- weaker short-term optics

### The Heroic Turnaround Call

You go on television and promise a disciplined recovery.

Option A:
- boost stock narrative
- improve board support
- increase future penalty if reality deteriorates

Option B:
- tell the truth
- lower market excitement
- reduce future fraud exposure

### Maintenance Reclassification

You relabel urgent work as deferred capital planning.

Option A:
- improves this quarter's margin
- raises safety decay
- raises whistleblower probability

Option B:
- take the hit now
- preserve operational integrity

### Pension Firebreak

Freeze benefits and push retirees to the edge.

Option A:
- strong immediate cash relief
- severe labor anger
- political and media blowback

Option B:
- negotiate partial concessions
- smaller savings
- lower blowback

### Golden Parachute Window

The stock briefly spikes on restructuring headlines.

Option A:
- sell part of your stake
- grow personal wealth
- raise insider-trading exposure

Option B:
- hold for a bigger exit later
- keep exposure lower for now
- risk missing the peak

## Suggested Technical Stack

The right stack for the actual product is a browser-native TypeScript stack.

### Recommended implementation stack

- React
- TypeScript
- Vite
- Zustand for app and run state
- pure TypeScript simulation modules
- Zod for content and save validation
- CSS Modules with semantic design tokens
- Framer Motion for deliberate motion and state transitions
- Vitest, React Testing Library, and Playwright
- localStorage or IndexedDB for local persistence

Why this stack is best:

- the target product is explicitly browser-based
- the game is interface-heavy and choice-heavy
- simulation can run locally in the browser without backend latency
- one language across UI, simulation, content tooling, and tests keeps the project simpler
- token-driven theming is easier to execute cleanly in a modern web stack

### Optional later additions

If the project later needs services beyond local play, add them only for concrete reasons such as:

- cloud saves
- analytics
- account-linked progression
- external content pipelines

Those needs do not justify a backend in the initial build.

## Proposed Code Architecture

The new version should separate simulation, content, theming, and UI from the start.

### Suggested layout

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
  theme/
    tokens/
    earth/
    armonk-blue/
  lib/
    storage/
    random/
    schemas/
content/
  decisions/
  events/
  endings/
tests/
  unit/
  component/
  e2e/
```

### Module responsibilities

- `simulation/state`: canonical game state and serialization
- `simulation/systems`: economy, legal, labor, market, and extraction rules
- `simulation/resolution`: end-of-round order of operations
- `components/*`: reusable UI surfaces driven by state, not gameplay logic
- `theme/*`: semantic tokens and theme mappings
- `content/*`: decision, event, and ending data
- `lib/storage`: save persistence and migration helpers

This structure keeps the simulation testable and the browser UI clean.

## Resolution Order

One of the most important technical decisions is deterministic order.

Recommended resolution sequence:

1. Apply player decisions.
2. Recalculate capacity and workforce effects.
3. Compute revenue.
4. Compute expenses and debt service.
5. Apply asset condition and safety effects.
6. Update creditor patience and board confidence.
7. Update market confidence and stock price.
8. Roll legal heat events, leaks, and investigation progress.
9. Offer extraction or exit opportunities.
10. Check fail and end states.

This order matters because it keeps outcomes legible.

## Data Model Recommendations

The game should be content-driven wherever possible.

### Action card schema

Each action card should define:

- id
- title
- description
- eligibility rules
- immediate effects
- delayed effects
- heat modifiers
- board response modifiers
- creditor response modifiers
- narrative tags

### Event schema

Each event should define:

- id
- trigger conditions
- weight
- one-time or repeatable behavior
- response options
- outcome effects

This allows tuning the game without rewriting core logic.

## MVP Scope

The smallest genuinely exciting version of this game is not large.

### MVP features

- one airline
- one executive character
- one market confidence meter
- one legal heat meter
- one workforce morale meter
- one creditor patience meter
- personal wealth tracking
- 20 to 30 authored decision cards
- 15 to 20 authored consequence events
- 4 endings: prison, merger exit, ruined survival, Bahamas escape

This is enough to prove the identity of the game.

## Development Roadmap

### Milestone 1: Establish the browser shell

- scaffold the app
- implement routing and base layout
- implement the `Earth` and `Armonk Blue` token systems
- build the landing screen and run shell

### Milestone 2: Implement the deterministic core loop

- model canonical game state
- implement round resolution
- implement visible metrics and decision flow
- add local save and resume

### Milestone 3: Add asymmetry and consequence

- separate personal wealth from airline wealth
- wire `suspicion` into real legal heat
- make layoffs and asset sales create delayed fallout

### Milestone 4: Add authored content and endings

- create decision cards
- create delayed consequence events
- add prison, merger, extraction, and Bahamas endings

### Milestone 5: Polish and validate

- improve motion and transitions
- verify theme parity
- complete end-to-end coverage

## Final Recommendation

This project's most original idea is not "airline tycoon with satire." It is the split between corporate outcomes and personal victory.

That split should govern every design and engineering decision:

- the model should track who benefits, not only whether the airline survives
- the UI should constantly show the tension between public collapse and private gain
- the event system should remember harm and bring it back later
- the legal system should make greed feel like a timed puzzle, not a flavor text warning

If the next version commits to that structure, this abandoned prototype stops being a curiosity and starts becoming a genuinely distinctive management sim.
