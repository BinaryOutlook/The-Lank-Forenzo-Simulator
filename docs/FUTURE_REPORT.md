# Future Report: The Lank Forenzo Simulator

Status: Forward-looking technical and product report  
Owner: BinaryOutlook  
Last updated: 2026-05-11  
Audience: future maintainers, designers, simulation engineers, and agents re-entering the project

## 1. Executive Thesis

**The Lank Forenzo Simulator** already has the rare part: a sharp product identity. The game is not a conventional airline management simulator. It is a deterministic, browser-native extraction game where the player manages the dangerous distance between two ledgers:

- the airline's public survivability
- the executive's private enrichment

That separation is the project's strongest design asset. The future of the game should not dilute it into generic route planning, generic tycoon growth, or a broad business dashboard. The future should deepen the consequences of that split until each run feels like a playable scandal biography.

The next major opportunity is to evolve the current authored card-driven macro sim into a deterministic systems platform. The current implementation already has validated content, a stable React/Vite shell, a local-first simulation loop, seeded tooling, save migration, faction memory primitives, an operational network model, a dossier layer, and post-run recap surfaces. The next step is not more random complexity. The next step is structured emergence.

The strategic formula is:

$$
\text{Replay Depth} =
\text{Reachable Choices}
\times
\text{Viable Endings}
\times
\text{World Memory}
\times
\text{Legible Feedback}
$$

Right now, the game is strongest in identity, authored voice, deterministic infrastructure, and maintainability. Its largest growth areas are content reachability, ending viability, deeper systemic pressure, and clearer strategic identity across runs.

## 2. Current Verified Baseline

This report is anchored to the repository state inspected on 2026-05-11.

### 2.1 Product Baseline

The current build includes:

- React, TypeScript, Vite, Zustand, Zod, CSS Modules, Framer Motion, Vitest, and Playwright.
- A deterministic local-first simulation loop.
- Local save persistence with migrations.
- A compiled content manifest with hash, direct lookup maps, pack and tag indexes, and flag diagnostics.
- A decision tray composer with diversity, follow-up, exit preservation, and repeat suppression.
- Strategic resource reserves for high-impact plays.
- Faction, operation, scheduler, and dossier primitives wired into active runs.
- Post-run recap sections for faction pressure, operational damage, dossier trail, missed windows, and critical chains.
- Two first-class themes: `Earth` and `Armonk Blue`.
- Responsive browser layouts with desktop, tablet, and mobile Playwright smoke coverage.

### 2.2 Content Baseline

`npm run content:validate` currently reports:

- `113` decisions
- `11` decision packs
- `165` events
- `74` ambient events
- `91` delayed events
- `5` endings

This is enough content for meaningful replay variety. The problem is not raw volume. The problem is whether the runtime reliably brings that content into play.

### 2.3 Balance And Reachability Baseline

`npm run balance:matrix` currently reports:

- Ending distribution:
  - `active`: `0/1600` runs, or `0.0%`
  - `bahamas`: `200/1600` runs, or `12.5%`
  - `extraction`: `200/1600` runs, or `12.5%`
  - `forcedRemoval`: `200/1600` runs, or `12.5%`
  - `merger`: `200/1600` runs, or `12.5%`
  - `prison`: `800/1600` runs, or `50.0%`
- Surfaced decisions: `61/113`, or `54.0%`
- Selected decisions: `43/113`, or `38.1%`
- Triggered events: `75/165`, or `45.5%`
- Delayed events: `34/91`, or `37.4%`
- Low-reachability packs: `marketTheater`

`npm run reachability:report` currently reports:

- Surfaced decisions: `64/113`, or `56.6%`
- Selected decisions: `64/113`, or `56.6%`
- Triggered events: `96/165`, or `58.2%`
- Delayed events: `31/91`, or `34.1%`
- Endings reached: `3/5`, or `60.0%` (`forcedRemoval`, `merger`, `prison`)
- Low-confidence packs: none

This is a healthier baseline than the earlier extraction-dominated state. The
default matrix now verifies all five endings, and the previously
low-reachability `safetyDenial` and `shadowSubsidiaries` packs now surface in
the primary diagnostics. The central work ahead remains making the
`marketTheater` lane more robust under scripted play while continuing to raise
authored decision and delayed-event coverage.

### 2.4 Verification Baseline

The following passed during inspection:

```bash
npm run content:validate
npm run check
npm run build
npm run test:e2e
```

The production build currently emits a Vite chunk-size warning because the main JavaScript bundle is about `574 kB` minified. This is not urgent, but it is a useful signal that future UI expansion should introduce code splitting before the app becomes heavy.

## 3. Design North Star

The game should continue to obey this product rule:

> The company and the player are not the same entity.

Every future system should strengthen that rule. A good feature makes the player ask one of these questions:

1. Can I enrich myself without making the airline collapse too soon?
2. Can I keep the market, board, creditors, workers, and regulators confused long enough to exit?
3. Which institution is learning my pattern fastest?
4. Which exit route am I accidentally closing by pursuing another?
5. Which evidence trail will explain this run after the ending fires?

The future game should feel less like:

- "I selected a strong card and watched some meters move."

And more like:

- "The way I keep winning is teaching the world how to come for me."

## 4. Product Future

### 4.1 Strategic Identities

The game should support distinct executive play styles without turning them into formal character classes too early. The systems should make these identities legible through choices, faction response, operational damage, and end-state pressure.

Recommended archetypes:

- **Extraction operator**: maximizes personal wealth while keeping legal heat barely below failure.
- **Merger groomer**: preserves enough institutional credibility to sell the company into a cleaner logo.
- **Offshore runner**: builds Nassau readiness while routing wealth out of reach.
- **Denial machine**: suppresses safety, labor, and legal signals through theatre.
- **Restructuring cannibal**: sells assets, closes hubs, and shrinks the airline into a liquidation story.
- **Creditor trench fighter**: manipulates debt, covenants, and lender patience.
- **Regulatory theatre specialist**: buys time with reform optics and managed compliance.
- **Reluctant stabilizer**: repairs enough of the airline to reopen more tempting extraction windows.

The goal is not symmetrical balance. The goal is viable tension. Each identity should have a clear temptation, a unique kind of damage, and at least one institution that learns to counter it.

### 4.2 Run Shape

Future runs should develop across four phases:

1. **Credibility phase**: the company still looks rescuable.
2. **Extraction phase**: the player starts converting corporate value into private wealth.
3. **Institutional learning phase**: factions, operations, and dossiers respond to the player's method.
4. **Exit or exposure phase**: the run becomes a race between intentional exit and automatic collapse.

This progression can be modeled as:

$$
\text{Run Pressure}_t =
\alpha \cdot \text{Financial Stress}_t
+ \beta \cdot \text{Legal Exposure}_t
+ \gamma \cdot \text{Faction Aggression}_t
+ \delta \cdot \text{Operational Fragility}_t
$$

The coefficients should not be universal constants forever. They should vary by scenario, difficulty, and possibly board environment. That gives future versions a clean way to create challenge modes without rewriting the core loop.

### 4.3 Endings As Strategic Commitments

Endings should be treated as strategic commitments, not just thresholds. Each successful ending should require:

- a setup move
- a survival interval
- a final decision
- a counter-pressure that can close the window

Recommended ending work:

- Make `Merger` easier to reach through a disciplined sequence but harder to keep clean.
- Make `Bahamas` depend on both wealth and offshore readiness, but create more mid-game tools to build readiness.
- Make `Extraction` remain powerful, but expose more insider-trading and board-retaliation pressure.
- Make `Prison` and `Forced Removal` fire often enough to keep greed from becoming an automatic solution.
- Add bitter-win endings later, especially "legally survived but personally trapped" and "saved the airline but lost the fantasy."

## 5. Technical Gameplay Roadmap

### 5.1 Reachability And Balance Repair

This is the highest-priority gameplay work.

The current content library is broad enough, but the runtime does not surface enough of it under normal or scripted play. Future work should treat reachability as a first-class quality gate.

#### Technical Instructions

1. Add report thresholds to `scripts/balance-matrix.ts`.
2. Track surfaced, selected, triggered, and delayed coverage by:
   - pack
   - group
   - tag
   - ending path
   - archetype bot
3. Add one or two new archetype bots specifically for low-reachability lanes:
   - `safety-denial`
   - `shadow-subsidiary`
4. Add regression assertions in `tests/unit/balanceMatrix.test.ts` for:
   - no single successful ending dominating the matrix
   - every major pack surfacing above a minimum threshold
   - at least one non-extraction successful ending reachable by a scripted archetype
5. Make balance reports preserve enough detail to answer why a path failed:
   - missing requirement
   - card never offered
   - offered but bot did not prefer it
   - selected but delayed chain did not resolve
   - resolved but ending threshold was still missed

#### Acceptance Targets

- No single ending exceeds `60%` across the default archetype matrix.
- At least `55%` of authored decisions surface across the default matrix.
- At least `35%` of authored events trigger across the default matrix.
- `Bahamas`, `Merger`, `Extraction`, `Forced Removal`, and `Prison` are all reachable in either matrix or bounded reachability runs.
- No pack remains low-reachability for two consecutive major iterations without a documented reason.

### 5.2 Decision Tray As Set Optimizer

The current tray composer is deterministic and readable. It scores individual cards, then layers diversity and repeat suppression. That is a good first-generation system, but the future tray should optimize the whole tray as a strategic object.

The next model should evaluate:

$$
F(T \mid s) =
\sum_{d \in T} U(d \mid s)
+ \lambda D(T)
+ \mu C(T \mid s)
- \nu R(T, H)
$$

Where:

- \(T\) is the candidate tray.
- \(s\) is the current run state.
- \(U(d \mid s)\) is state-conditioned card utility.
- \(D(T)\) rewards pack, group, and tactic diversity.
- \(C(T \mid s)\) rewards live chain continuation and strategic window surfacing.
- \(R(T, H)\) penalizes repetition against recent history \(H\).

#### Technical Instructions

1. Keep the public caller `getAvailableDecisions(decisions, run)` stable at first.
2. Extract the current scorer into smaller functions:
   - `scoreReliefUtility`
   - `scoreTemptationUtility`
   - `scoreExitUtility`
   - `scoreFollowUpUtility`
   - `scoreRiskPenalty`
3. Replace repeated greedy picking with a bounded deterministic beam search.
4. Add diagnostics that explain why each card was chosen:
   - `relief`
   - `temptation`
   - `exit-window`
   - `chain-continuation`
   - `pack-diversity`
   - `low-reachability-repair`
5. Add tests that prove:
   - exit cards are preserved when eligible
   - exact previous trays do not repeat when alternatives exist
   - low-reachability packs can receive controlled surfacing pressure
   - the composer remains deterministic for the same run state and content hash

#### Implementation Sketch

```ts
interface TrayPickReason {
  decisionId: string;
  score: number;
  reasons: string[];
}

interface TrayCandidate {
  decisions: DecisionDefinition[];
  score: number;
  reasons: TrayPickReason[];
}

function composeDecisionTrayV2(
  decisions: DecisionDefinition[],
  run: RunState,
  diagnostics: CoveragePressure,
): TrayCompositionResult {
  const eligible = decisions.filter((decision) =>
    isDecisionEligible(decision, run),
  );

  return searchBestTray({
    eligible,
    run,
    diagnostics,
    beamWidth: 24,
    traySize: 5,
  });
}
```

### 5.3 Event Scheduler And Hazard System

The scheduler already supports guaranteed and hazard event concepts, but active run resolution currently passes no hazard rules. This makes the scheduler a strong foundation that has not yet become a full gameplay engine.

Future event timing should include:

- guaranteed delayed consequences from selected decisions
- hazard events generated by worsening state
- faction-authored incidents
- operational cascade events
- hearing and investigation calendars
- stale windows that expire if the player changes the situation

#### Technical Instructions

1. Introduce authored hazard rules under `content/hazards/` or a typed source file under `src/simulation/scheduler/`.
2. Compile hazard rules into the content manifest.
3. Give each hazard rule:
   - `id`
   - `eventId`
   - `baseWeight`
   - `cooldownRounds`
   - `requirements`
   - `sourceFamily`
   - `explanation`
4. Update `resolveScheduledEventsStep` to pass real hazard rules and a nonzero hazard budget.
5. Add scheduler diagnostics to history or developer reports when events are deferred, stale, or blocked by requirements.
6. Add tests for:
   - cooldown enforcement
   - deterministic hazard selection
   - stale scheduled events
   - requirement-blocked events that later become valid

#### Design Rule

Hazards should not feel like random punishment. A good hazard reads as the world noticing an accumulated pattern.

### 5.4 Faction Political Economy

Factions should become medium-horizon strategic actors. They should not merely convert metrics into extra flavor. They should remember how the player has been winning.

Recommended factions:

- board
- creditors
- labor
- regulators
- press
- politicians, later and only if distinct from regulators and press

Each faction should track:

- patience
- aggression
- leverage
- trust or cohesion, depending on faction type
- dossier weight
- recent grievances
- current intent
- last concession received
- preferred counter-strategy

#### Technical Instructions

1. Replace ID-substring grievance matching with authored faction effect metadata.
2. Add optional fields to decisions and events:

```ts
interface FactionEffectSet {
  board?: PartialFactionImpact;
  creditors?: PartialFactionImpact;
  labor?: PartialFactionImpact;
  regulators?: PartialFactionImpact;
  press?: PartialFactionImpact;
}

interface PartialFactionImpact {
  patience?: number;
  aggression?: number;
  leverage?: number;
  trust?: number;
  cohesion?: number;
  dossierWeight?: number;
  grievance?: string;
}
```

3. Let factions propose intents after direct decision impact but before ambient events.
4. Let faction intents feed:
   - event hazards
   - board packet pressure read
   - decision requirements
   - post-run recap
5. Add faction-specific tests for repeated behavior:
   - repeated labor abuse increases labor organization
   - repeated safety denial increases regulatory investigation
   - repeated offshore extraction increases press leverage
   - board support can shield the player only while trust remains high

#### Planning Model

The planner should remain deterministic:

$$
\text{IntentScore}_{f,a} =
w_1 \cdot \text{Urgency}_f
+ w_2 \cdot \text{Leverage}_f
+ w_3 \cdot \text{Evidence}_f
- w_4 \cdot \text{RecentCooldown}_{f,a}
$$

The highest valid intent wins, with seeded tie-breaking only where necessary.

### 5.5 Operational Network Simulation

The operational model should stay executive-level. The player should not become a dispatcher. Still, the airline needs an internal world that can break in traceable ways.

Future operations should model:

- hubs
- routes
- fleets
- crew pools
- maintenance backlog
- contractor dependence
- service disruption
- weather fronts
- route and hub fragility

The current network layer is a good seed. It should now become more causal and more content-aware.

#### Technical Instructions

1. Convert hardcoded decision ID sets into content-authored operational effects.
2. Add `operationEffects` to decision schemas:

```ts
interface OperationEffectSet {
  maintenanceBacklog?: number;
  contractorDependence?: number;
  crewFatigue?: number;
  serviceDisruption?: number;
  hubFragility?: Record<string, number>;
  routeFragility?: Record<string, number>;
  weatherExposure?: number;
}
```

3. Add deterministic weather fronts as scheduled or hazard-generated state.
4. Make route and hub fragility affect:
   - cash drag
   - safety decay
   - public anger
   - market confidence
   - legal heat when cascades become visible
5. Add a small board-level operations panel only when it improves decision clarity.
6. Add tests for:
   - maintenance deferral leading to backlog
   - backlog plus weather causing a cascade
   - stabilizing actions reducing future cascade probability
   - operational cascades feeding dossier evidence

#### Design Rule

Operational detail should appear as board intelligence, not dispatch management.

### 5.6 Dossier And Scandal Machine

The dossier system is the bridge between run history and narrative memory. It should answer the question: "What can the world prove?"

Recommended dossier themes:

- maintenance fraud
- insider trading
- offshore evasion
- labor abuse
- regulatory capture
- creditor deception
- board self-dealing

Each dossier should track:

- evidence weight
- severity
- linked decisions
- linked events
- witnesses
- likely exposure
- faction owner
- next procedural step

#### Technical Instructions

1. Move decision and event evidence mappings toward content metadata.
2. Let factions add evidence fragments when they investigate, leak, organize, or pressure.
3. Let operational cascades create evidence when they expose prior decisions.
4. Add thresholds that affect gameplay:
   - light dossier: board packet warning
   - medium dossier: faction leverage increase
   - heavy dossier: legal heat pressure, decision locks, or forced hearings
   - terminal dossier: prison or plea-style ending paths
5. Expand end recaps into "case theory" summaries:
   - what the player did
   - who noticed first
   - what evidence linked the pattern
   - which exit windows were missed

#### Dossier Pressure Formula

$$
\text{ExposureRisk} =
\text{EvidenceWeight}
\times
(1 + \text{WitnessQuality})
\times
\text{FactionLeverage}
- \text{SuppressionSpend}
$$

This gives future design a clean way to make suppression tactics useful but not magical.

## 6. Code Architecture Future

### 6.1 Preserve The Current Strength

The current architecture is worth preserving in spirit:

- React owns presentation.
- `src/simulation/` owns deterministic rules.
- `content/` owns authored decisions and events.
- `scripts/` owns diagnostics and reports.
- Docs explain product intent and iteration history.

The future should make these boundaries more explicit, not blur them.

### 6.2 Recommended Package Structure

When the project grows beyond the single-app layout, move toward:

```text
apps/
  web/
    src/
      app/
      components/
      screens/
      theme/
packages/
  sim-core/
    src/
      state/
      resolution/
      systems/
      scheduler/
      factions/
      operations/
      dossiers/
  content-schema/
    src/
      schemas/
      metadata/
      validation/
  content-compiler/
    src/
      compileManifest.ts
      diagnostics.ts
      reachabilityHints.ts
  sim-analysis/
    src/
      balanceMatrix.ts
      reachabilityReport.ts
      simulatedBots.ts
  sim-worker/
    src/
      workerEntrypoint.ts
content/
  decisions/
  events/
  endings/
  hazards/
docs/
  PRD.md
  TECHNICAL_BRIEF.md
  FUTURE_REPORT.md
  reference/
PRDs/
```

### 6.3 Dependency Direction

Use this dependency rule:

```text
apps/web -> sim-core -> content-schema
content-compiler -> content-schema
sim-analysis -> sim-core + content-compiler
sim-worker -> sim-core + sim-analysis
```

The web app should consume simulation APIs. It should not own simulation rules.

### 6.4 Simulation Public API

Create a small public API for the simulation core:

```ts
interface SimulationRuntime {
  createInitialRun(input?: InitialRunInput): RunState;
  getAvailableDecisions(run: RunState): TrayCompositionResult;
  toggleDecision(run: RunState, decisionId: string): RunState;
  resolveRound(run: RunState): RunState;
  getEnding(run: RunState): EndingDefinition | null;
}
```

This API should be usable by:

- React screens
- unit tests
- balance scripts
- reachability explorer
- future web workers
- future replay tools

### 6.5 Content As Compiled Assets

Raw JSON should remain easy to author. Runtime content should become compiled.

The compiled manifest should include:

- direct `decisionById`, `eventById`, and `endingById` maps
- pack indexes
- tag indexes
- flag producer and consumer maps
- faction effect indexes
- operational effect indexes
- dossier evidence indexes
- hazard rule indexes
- content hash
- schema version
- balance metadata
- reachability hints

This converts content from "files the app reads" into "assets the simulation can reason over."

### 6.6 Persistence Future

Keep `localStorage` for:

- current run
- theme
- lightweight settings

Use `IndexedDB` later for:

- run archives
- replay traces
- balance snapshots
- content manifest cache
- scenario seeds
- post-run scandal records

Save payloads should pin:

- save schema version
- content hash
- content version
- selected decisions per round, if replay is enabled
- seed
- ending id

## 7. UI And Experience Future

### 7.1 Board Packet

The board packet should become the place where the game tells the player what matters this round.

Future sections:

- executive summary
- faction pressure read
- operational read
- dossier read
- exit window read
- board confidence or scapegoat risk

Keep the board packet concise. It should sharpen the decision, not become a spreadsheet.

### 7.2 Decision Tray

Each decision card should eventually explain:

- immediate metric impact
- strategic reserve cost
- delayed consequence risk
- faction reaction risk
- dossier evidence risk
- operational effect, when relevant
- exit path relevance

This does not require showing every number. It requires showing the right kind of consequence.

### 7.3 End Screen

The ending screen should become one of the game's retention engines.

Recommended recap panels:

- outcome
- personal wealth and legal exposure
- dominant strategy
- faction that broke first
- scandal file
- missed exit windows
- operational cascade
- "what would have saved you"
- "what would have made you richer"

### 7.4 Run Archive

A future run archive would support:

- saved post-run recaps
- ending gallery
- best personal wealth by ending
- fastest escape
- worst legal heat survived
- scandal map history
- replay seed copying

This should remain local-first unless the project deliberately adds cloud features later.

## 8. Tooling And CI Future

### 8.1 Required Local Commands

Keep these commands healthy:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run content:validate
npm run balance:matrix
npm run reachability:report
```

### 8.2 Future CI Gates

Recommended CI stages:

1. Install and cache dependencies.
2. Run lint.
3. Run typecheck.
4. Run unit and component tests.
5. Validate content.
6. Compile content manifest.
7. Run fast balance matrix.
8. Run reachability report with thresholds.
9. Build production app.
10. Run Playwright smoke tests.
11. Upload balance and reachability artifacts.

### 8.3 Nightly Simulation Job

An initial nightly reporting path now exists through `npm run report:nightly`
and `.github/workflows/nightly-simulation-report.yml`. The default profile runs
`750` seeded simulations per archetype, or `6,000` total runs across the current
eight scripted bots, with a `30` round cap. It uploads artifacts instead of
failing on soft balance warnings, keeping deep diagnostics separate from fast PR
checks.

The current artifact set includes:

- ending distribution report
- low-confidence content report
- low-confidence trend point
- dominant sequence report

Future extensions can still add:

- seeded random bot
- high-risk bot
- underused-pack bot
- larger `10,000` to `20,000` run profiles when runtime is known

Dominant sequences can be scored as:

$$
\text{Dominance}(q) =
\text{WinRate}(q)
\times
\text{Frequency}(q)
\times
\text{AverageWealth}(q)
$$

Where \(q\) is a decision sequence prefix.

## 9. Versioned Implementation Plan

### 9.1 V0.6: Balance And Reachability Repair

Goal: make the current game space broader before adding much more content.

Work:

- Improve archetype bots.
- Add underused-pack diagnostics.
- Tune ending thresholds and decision requirements.
- Surface `safetyDenial` and `shadowSubsidiaries`.
- Activate at least one non-extraction success path in the matrix.
- Add tests around balance report thresholds.

Exit criteria:

- `npm run check` passes.
- `npm run content:validate` passes.
- `npm run balance:matrix` shows at least two successful ending paths.
- `npm run reachability:report` reaches at least `4/5` endings.

### 9.2 V0.7: Tray Composer V2

Goal: make the decision tray intentionally support strategic variety.

Work:

- Split current scoring into named utility functions.
- Implement deterministic beam-search tray composition.
- Add pick reasons and diagnostics.
- Add low-reachability pressure as a controlled input.
- Preserve exit card behavior.

Exit criteria:

- Tray tests prove determinism and diversity.
- Repeated-tray pressure remains low.
- Decision surfacing improves without making trays feel random.

### 9.3 V0.8: Hazard Scheduler

Goal: turn scheduler infrastructure into active systemic pressure.

Work:

- Add hazard content.
- Compile hazard rules into manifest.
- Feed faction and operation state into hazard eligibility.
- Add cooldowns and stale windows.
- Add diagnostics for blocked and deferred events.

Exit criteria:

- Hazard events trigger in scripted simulations.
- Hazard events are explainable from recent run state.
- No hazard family dominates the event feed.

### 9.4 V0.9: Faction Planner V2

Goal: make institutions remember and counter the player's method.

Work:

- Add explicit faction effects to content schemas.
- Replace substring matching with authored faction metadata.
- Add current intent to faction state.
- Let faction intents create hazards, decision modifiers, and recap entries.

Exit criteria:

- Repeated labor abuse creates a distinct labor response.
- Repeated safety denial creates regulatory escalation.
- Repeated offshore behavior creates press and board consequences.

### 9.5 V1.0: Scandal And Legacy Layer

Goal: make run endings memorable and replayable.

Work:

- Expand dossier themes.
- Add scandal case summaries.
- Add run archive.
- Add ending gallery.
- Add local replay seeds.
- Add richer missed-window analysis.

Exit criteria:

- End screen explains why the run ended, not merely what ending fired.
- Run archive makes repeated play feel cumulative.
- Dossier evidence has gameplay effects before the end screen.

## 10. Engineering Rules For Future Work

### 10.1 Preserve Determinism

Every simulation result should remain reproducible from:

- content hash
- seed
- initial state
- selected decision sequence

Randomness should be seeded, named, and isolated.

### 10.2 Keep React Out Of Simulation Rules

Simulation modules should not import React, DOM APIs, or CSS. React should ask the simulation for state, decisions, and outcomes.

### 10.3 Prefer Content Metadata Over ID Matching

ID substring checks are useful scaffolding, but they should not become the long-term domain model. Future systems should read explicit metadata:

- faction effects
- operation effects
- dossier evidence
- hazard families
- ending path relevance

### 10.4 Expand Tests With Blast Radius

Use this testing scale:

- Small content change: content validation and focused unit tests.
- Simulation rule change: unit tests plus balance or reachability report.
- UI workflow change: component test plus Playwright smoke.
- Save shape change: migration tests.
- Major systems change: versioned PRD packet plus changelog.

### 10.5 Documentation Stays In The Loop

Update:

- `docs/PRD.md` for durable product direction changes.
- `PRDs/vX.Y/vX.Y.md` for major iteration work.
- `README.md` for setup, commands, structure, and important docs.
- `docs/reference/` for system-specific design references.
- `docs/FUTURE_REPORT.md` when the long-term roadmap changes materially.

## 11. Risks

### 11.1 Risk: The Game Becomes Too Much Like Work

Adding operations, factions, and dossiers could make the interface feel like an enterprise dashboard.

Mitigation:

- Keep decisions executive-level.
- Show board intelligence, not raw operational plumbing.
- Keep the primary loop fast.
- Put detail behind recaps, reports, or optional panels.

### 11.2 Risk: Systems Hide Causality

More systemic depth can make outcomes feel unfair if the player cannot infer why they happened.

Mitigation:

- Every faction intent needs a rationale.
- Every hazard needs an explainable source.
- Every dossier needs linked evidence.
- Every operational cascade needs a traceable cause.

### 11.3 Risk: Balance Tooling Becomes Decorative

Reports are only useful if they influence decisions.

Mitigation:

- Add thresholds.
- Fail tests on severe regressions.
- Track low-confidence content across versions.
- Require major PRDs to include before and after balance notes.

### 11.4 Risk: Package Migration Distracts From Gameplay

A monorepo migration could absorb energy before the game needs it.

Mitigation:

- Do V0.6 and V0.7 in the current layout.
- Extract packages only when simulation APIs and content compiler boundaries are stable.
- Keep migration behavior-neutral.

## 12. Highest-Value Next Steps

The best immediate sequence is:

1. Create a `PRDs/v0.6/` packet focused on balance and reachability.
2. Add stronger balance matrix assertions and underused-pack bot strategies.
3. Repair Bahamas and merger viability before adding large new systems.
4. Prototype tray composer V2 behind the current `getAvailableDecisions` API.
5. Add real hazard rules to the scheduler.
6. Replace faction ID-substring matching with explicit authored metadata.
7. Expand operational effects in content data.
8. Make dossier evidence more visible before the end screen.

This sequence respects the current product. It does not throw away the working game. It widens the possibility space, then deepens the machinery, then improves the architecture once the new boundaries have earned themselves.

## 13. Closing View

The project has real upside because its central fantasy is precise. It is not trying to be every airline game. It is trying to be a boardroom extraction simulator where temporary credibility, public damage, private wealth, and institutional memory collide.

The future should make that collision sharper.

The technical path is clear:

- keep determinism
- expand reachability
- make trays strategy-aware
- activate hazards
- make factions remember
- make operations break causally
- make dossiers explain the scandal
- package the simulation core when the boundaries are ready

If those steps land, the game can grow from a stylish local-first prototype into a deep replayable system where every successful run leaves behind a different kind of evidence.
