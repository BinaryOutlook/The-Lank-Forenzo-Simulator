# Dossier System Reference

V0.5 dossiers turn run history into evidentiary memory. A dossier thread records the style of misconduct that made a run fragile, exposed, or unusually clean.

## Required Themes

- `labor_abuse`
- `maintenance_fraud`
- `insider_trading`
- `regulatory_capture`
- `offshore_evasion`

Themes can stay dormant until authored decisions, events, or system incidents create evidence.

## Runtime Shape

The UI reads optional dossier data from `run.dossiers` or `run.dossier`.

```ts
interface DossierThread {
  theme: string;
  label?: string;
  title?: string;
  severity?: number;
  evidenceCount?: number;
  summary?: string;
  status?: string;
  exposureCause?: string;
}
```

## Evidence Rules

Evidence should accumulate from visible causes:

- repeated decisions in the same misconduct theme
- faction intents that leak, investigate, or organize
- operational incidents that reveal safety or service fragility
- scheduled or hazard events that confirm an earlier warning

Dossiers should not punish single isolated choices as harshly as repeated patterns. Severity should rise when evidence repeats, compounds, or intersects with low trust and high legal heat.

## Recap Hooks

The ending screen can render top dossier threads when state or recap data exists. Two runs that share the same ending should be able to produce different recap language based on their dominant dossier themes.

Consequence feed entries can include:

```ts
{
  source: "dossier",
  sourceKind: "dossier_escalation",
  dossierTheme: "maintenance_fraud",
  cause: "The reform office stayed live while inspection integrity kept falling."
}
```

These hooks are additive and keep older history entries compatible.
