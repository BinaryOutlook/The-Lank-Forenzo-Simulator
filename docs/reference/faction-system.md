# Faction System Reference

V0.5 introduces faction memory as an executive-level pressure system. Factions are persistent institutional actors, not negotiation screens.

## Required Factions

- `board`
- `creditors`
- `labor`
- `regulators`
- `press`

`politicians` is optional scaffolding and should stay inactive until authored content can make it distinct from regulators and press.

## Runtime Shape

Faction state may be stored as an array or keyed object. The UI reads either shape when present on `run.factions` or `run.factionState`.

```ts
interface FactionState {
  id: string;
  patience?: number;
  aggression?: number;
  trust?: number;
  cohesion?: number;
  leverage?: number;
  pressure?: number;
  dossierWeight?: number;
  recentGrievances?: string[];
  lastIntentId?: string;
  intentLabel?: string;
  summary?: string;
}
```

## Authoring Hooks

Faction updates should derive from selected decisions, emitted events, metric thresholds, flags, operations, and dossier state. Avoid hidden arbitrary movement.

### Explicit Content Metadata

Authored decisions and events may now carry `factionEffects`. The planner applies these deltas before clamping state back into the `0..100` range:

\[
s' = \operatorname{clamp}(s + \Delta_{\text{metrics}} + \Delta_{\text{evidence}} + \Delta_{\text{authored}}, 0, 100)
\]

Supported authored delta fields are:

- `patience`
- `aggression`
- `trust`
- `cohesion`
- `leverage`
- `dossierWeight`

Each delta must be an integer where \( -25 \le \Delta \le 25 \). The only valid faction IDs are `board`, `creditors`, `labor`, `regulators`, and `press`.

Example:

```json
"factionEffects": {
  "creditors": {
    "patience": -8,
    "aggression": 9,
    "leverage": 5,
    "grievance": "rushed amend-and-extend terms invited lender coordination"
  }
}
```

If a content item has explicit metadata, the planner prefers it and skips legacy ID-substring matching for that item. If content is still unannotated, the old fallback remains active so migration can proceed in small reviewable passes.

Good player-facing explanations include:

- why the faction escalated
- what repeated behavior it remembers
- which intent is live this round
- what the consequence might affect next

The board packet can render the highest-pressure faction as a `Pressure read` signal. The ending screen can summarize dominant faction adversaries when faction state or recap data exists.

## History Hooks

Consequence feed entries can include optional labels:

```ts
{
  source: "system",
  sourceKind: "faction_intent",
  factionId: "labor",
  cause: "Two workforce cuts landed before morale recovered."
}
```

These fields are additive. Older history entries remain valid.
