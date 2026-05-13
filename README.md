# The Lank Forenzo Simulator

**Aviation management, viewed from the executive escape hatch.**

The Lank Forenzo Simulator is a browser-based strategy game about running an
airline badly on purpose, and discovering how long polished boardroom language
can keep reality below cruising altitude.

Most airline games reward careful scheduling, clean operations, and patient
growth. This one looks at the uglier executive layer: debt theater, labor cuts,
safety shortcuts, market confidence, and the private fortune being assembled
while the company loses altitude.

The goal is not to celebrate the behavior. The goal is to make the incentives
visible, turn them into tense player choices, and let the systems show how
quickly clever extraction becomes institutional blowback.

## Play The Game

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## The Hook

Keep the airline credible just long enough to leave rich.

Each run asks whether you can sell confidence, delay consequences, and reach an
exit before creditors, workers, regulators, and the market finally compare
notes. The airline can be failing while you are still winning, and that split is
the product's core lens for every system, screen, and decision.

## What You Manage

You are not playing as a meticulous operator trying to build the best airline.
You are managing the distance between two ledgers: the company and yourself.

- Corporate health: cash, debt, creditor patience, market confidence, safety,
  workforce pressure, and route fragility
- Personal position: wealth, offshore readiness, legal exposure, executive
  options, and exit timing
- Public pressure: labor anger, regulatory attention, investor confidence,
  media blowback, and the dossier forming around repeated misconduct
- Strategic reserves: cash, personal assets, and public-relations capital spent
  on high-impact political, labor, regulatory, and executive-network actions

## How A Run Flows

Each quarter moves through a clear rhythm:

1. **Read the board packet**: inspect the quarter, pressure reads, state,
   reserves, and consequence feed.
2. **Choose plays**: compare available decisions in a dedicated selection
   surface with readable costs, consequences, and selected state.
3. **Resolve the quarter**: confirm complete selections, watch the systems
   react, and see which future exits or disasters moved closer.

The question is not how to optimize routes or tune fleet utilization. The
question is how long you can keep the company just credible enough to extract
value before the people around it compare notes.

## Design Intent

- **Aviation at board altitude**: the airline matters through fleet
  credibility, maintenance pressure, labor stress, route fragility, and safety
  integrity, not micromanaged dispatch screens.
- **Two ledgers in conflict**: a good quarter for the executive can still be
  terrible for the airline.
- **Satire that plays fair**: pressure should be darkly funny, but legible.
  Creditors remember, workers organize, regulators circle, and a dossier forms
  from repeated misconduct.

## Endings

This is not a conventional "save the airline" game. The practical win condition
is reaching an intentional exit before the simulation hits an automatic failure
state.

Successful end states include:

- `Merger`: engineer a formal escape through a buyer.
- `Extraction`: cash out while confidence is still high enough to sell the
  story.
- `Bahamas`: convert corporate value into offshore readiness and leave before
  the heat catches up.

Automatic failures include:

- `Forced Removal`: creditors, cash collapse, or market confidence end your
  tenure.
- `Prison`: legal heat and safety shortcuts finally become personal liability.

When a run ends, the ending screen reads like a concise scandal case file: it
calls out why the ending fired, what strategy the record reveals, what the
world could prove, and which exit windows slipped away.

## Current Build

The current browser build includes:

- deterministic round resolution and local save persistence
- a Load Manager for non-encrypted browser save slots and local JSON import/export
- board packet, decision selection, consequence feed, and ending case summary
- decision, event, hazard, faction, operation, and dossier systems
- multiple visual themes, font presets, wallpapers, audio, and feedback options
- a theme-adaptive LFS halftone landing poster driven by shared filter tokens
- responsive browser play across desktop, tablet, and phone layouts
- About, Tutorial, Run, Options, and ending screens
- deterministic balance, content validation, and reachability tooling

## Player-Facing Pages

- `Run`: the active gameplay surface.
- `Choose Plays`: a dedicated decision-comparison phase entered from a run.
- `Load Manager`: saved sessions, local-file imports, and save exports.
- `Tutorial`: first-run guidance for objectives, concepts, flow, and controls.
- `About`: the in-game statement of motivation and design intent.
- `Options`: local-first presentation, audio, theme, font, density, wallpaper,
  animation, graphical-effect, and interaction-feedback settings.

## Developer Essentials

```bash
npm run dev
npm run check
npm run build
```

For the full stack, scripts, CI, content pipeline, responsive layout notes, and
project map, see [docs/TECH_STACK.md](docs/TECH_STACK.md).

## Planning And Issue Workflow

Project planning flows through [Future Roadmap/](Future%20Roadmap/README.md)
before it becomes active GitHub work. Individual issue briefs are the roadmap
source of truth, while
[Future Roadmap/MASTER_ROADMAP_TABLE.md](Future%20Roadmap/MASTER_ROADMAP_TABLE.md)
is a generated index.

Do not manually edit the master table. Update issue brief frontmatter, then run:

```bash
npm run roadmap:generate
npm run roadmap:check
```

When a PR fully fixes a promoted roadmap issue, move the completed brief to
[Future Roadmap/archive/](Future%20Roadmap/archive/) and regenerate the table on
that PR branch before merge.

## Documentation

- Product requirements: [docs/PRD.md](docs/PRD.md)
- Systems and design brief: [docs/TECHNICAL_BRIEF.md](docs/TECHNICAL_BRIEF.md)
- Tech stack and repo operations: [docs/TECH_STACK.md](docs/TECH_STACK.md)
- Future Roadmap workflow: [Future Roadmap/README.md](Future%20Roadmap/README.md)
- Reference docs: [docs/reference/](docs/reference/)
- Versioned iteration packets: [PRDs/](PRDs/)
- Architecture decisions: [docs/decisions/](docs/decisions/)
