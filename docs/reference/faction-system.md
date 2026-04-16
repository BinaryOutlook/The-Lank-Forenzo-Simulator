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
