# Dossier System Reference

V0.5 dossiers turn run history into evidentiary memory. A dossier thread records the style of misconduct that made a run fragile, exposed, or unusually clean.

## Required Themes

- `labor_abuse`
- `maintenance_fraud`
- `insider_trading`
- `regulatory_capture`
- `offshore_evasion`
- `creditor_deception`
- `board_self_dealing`

Themes can stay dormant until authored decisions, events, or system incidents create evidence.

## Runtime Shape

The UI reads optional dossier data from `run.dossiers` or `run.dossier`.

```ts
interface DossierThread {
  theme: string;
  label?: string;
  title?: string;
  severity?: number;
  severityBand?: "dormant" | "light" | "medium" | "heavy" | "terminal";
  evidenceCount?: number;
  evidenceWeight?: number;
  summary?: string;
  status?: string;
  exposureCause?: string;
  factionOwner?: "board" | "creditors" | "labor" | "regulators" | "press";
  nextStep?: string;
}
```

## Evidence Rules

Evidence should accumulate from visible causes:

- authored decision metadata in `evidence`
- authored event metadata in `evidence`
- faction intents that leak, investigate, or organize
- operational incidents that reveal safety or service fragility
- scheduled or hazard events that confirm an earlier warning

Dossiers should not punish single isolated choices as harshly as repeated patterns. Severity should rise when evidence repeats, compounds, or intersects with low trust and high legal heat.

Content-authored evidence fragments use this shape on decisions and events:

```ts
interface DossierEvidenceDefinition {
  theme:
    | "labor_abuse"
    | "maintenance_fraud"
    | "insider_trading"
    | "regulatory_capture"
    | "offshore_evasion"
    | "creditor_deception"
    | "board_self_dealing";
  weight: number;
  witness?: string;
  detail?: string;
}
```

Representative mappings now live directly on authored content. For example,
maintenance-denial cards can create `maintenance_fraud` evidence, creditor hardball
can create `creditor_deception` evidence, and executive-pay or indemnity moves can
create `board_self_dealing` evidence.

## Severity Thresholds

| Band | Evidence weight | Runtime effect |
| --- | ---: | --- |
| `dormant` | `0-11` | File exists but does not surface. |
| `light` | `12-29` | Board packet and history warnings can surface. |
| `medium` | `30-47` | Crossing the band adds legal heat and flags the procedural step. |
| `heavy` | `48-69` | Crossing the band adds stronger legal heat before any ending check. |
| `terminal` | `70+` | Reserved for later plea/prison-style paths; currently adds the sharpest legal pressure. |

Thresholds fire only on escalation. A dossier that was already heavy does not keep
charging legal heat every quarter unless new evidence pushes it into a higher band.
If several dossiers cross thresholds in the same round, the resolver applies only
the strongest legal-heat impact while still recording each dossier flag and history
entry.

## Recap Hooks

The ending screen renders top dossier threads as case-theory summaries. Two runs
that share the same ending can now produce different recap language based on:

- dominant dossier theme
- likely exposure source
- witness list
- faction owner
- next procedural step

Consequence feed entries can include:

```ts
{
  source: "dossier",
  sourceKind: "dossier_threshold",
  dossierTheme: "maintenance_fraud",
  cause: "The reform office stayed live while inspection integrity kept falling."
}
```

These hooks are additive and keep older history entries compatible.
