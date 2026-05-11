# Faction System Reference

Faction planner V2 turns factions into deterministic medium-horizon actors. They still derive from metrics, decisions, events, flags, and dossier evidence, but each faction now carries explicit intent memory so repeated executive behavior can be answered differently over time.

## Required Factions

- `board`
- `creditors`
- `labor`
- `regulators`
- `press`

`politicians` is optional scaffolding and should stay inactive until authored content can make it distinct from regulators and press.

## Runtime Shape

Faction state is stored as a keyed object on `run.factions`. Save hydration also accepts legacy array-shaped factions and the older `run.factionState` key, then normalizes them into the V2 shape.

```ts
interface FactionState {
  id: FactionId;
  patience: number;
  aggression: number;
  trust: number;
  cohesion: number;
  leverage: number;
  dossierWeight: number;
  recentGrievances: string[];
  currentIntent: FactionCurrentIntent | null;
  intentMemory: FactionIntentMemory;
  behaviorMemory: Partial<Record<FactionBehaviorPattern, number>>;
  lastIntentId?: string;
}

interface FactionCurrentIntent {
  id: string;
  family: FactionIntentFamily;
  round: number;
  urgency: number;
  rationale: string;
  score: FactionIntentScore;
}

interface FactionIntentScore {
  urgency: number;
  leverage: number;
  evidence: number;
  cooldown: number;
  total: number;
}
```

Legacy saves that lack `currentIntent`, `intentMemory`, or `behaviorMemory` are upgraded to safe defaults during save parsing and round resolution.

## Intent Families

Active intent families are:

- `shield` — supportive board cover that can soften heat and steady the market.
- `replace` — succession or removal pressure, usually after offshore/self-protective behavior.
- `pressure` — creditor or regulator escalation with direct operational or legal consequences.
- `negotiate` — creditor accommodation while trust and patience remain usable.
- `organize` — labor coordination before disruption becomes open defection.
- `defect` — repeated labor abuse producing strikes, refusals, or operational drag.
- `investigate` — regulator file-building from safety, maintenance, or capture evidence.
- `leak` — press publication pressure from offshore, insider, labor, or safety trails.

## Deterministic Scoring

Each candidate intent is scored with the same explainable components:

```text
total = urgency + leverage + evidence - cooldown
```

Where:

- `urgency` comes from current metrics and faction posture.
- `leverage` comes from the faction's stored leverage, cohesion, or trust.
- `evidence` comes from dossier weight plus repeated behavior memory.
- `cooldown` suppresses immediate repeat use of the same family unless the new evidence is strong enough to overcome it.

The planner chooses the highest scoring candidate above the intent threshold, with a fixed tie-break order. No runtime LLM agent participates in faction planning.

## Behavior Memory

V2 tracks repeated behavior patterns separately from the short grievance list:

- `labor_abuse`
- `safety_denial`
- `offshore_behavior`
- `board_shielding`
- `creditor_stress`

Examples:

- Repeated labor abuse can move labor from `organize` to `defect`.
- Repeated safety denial can move regulators from `investigate` to `pressure`.
- Repeated offshore behavior can make the press `leak` while the board threatens `replace` instead of offering `shield`.
- Strong market confidence and board leverage can still create a positive `shield`, but shield repeats are cooldown-suppressed.

## Round Integration

Faction intents feed three player-facing surfaces:

1. **Board signals** — the highest-urgency intents appear with rationale and score components.
2. **Hazard pressure** — urgent intents can apply small deterministic metric impacts such as legal heat, public anger, morale, or market confidence movement.
3. **Recaps** — ending recaps summarize active intent, aggression/leverage, and remembered behavior patterns for the top factions.

History entries use additive metadata:

```ts
{
  source: "faction",
  sourceKind: "faction_intent",
  factionId: "labor",
  cause: "Two workforce cuts landed before morale recovered."
}
```

Older history entries remain valid.

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
- how urgency, leverage, evidence, and cooldown shaped the score
- what the consequence might affect next
