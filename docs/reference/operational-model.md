# Operational Model Reference

V0.5 uses operations as a compact board-level substrate. It should explain how executive choices create network fragility without becoming a route planner.

## Scope

The operational model should summarize:

- maintenance backlog
- service disruption
- weather exposure
- network fragility
- route or hub stress when authored content needs it

It should not add dispatch controls, detailed fleet assignment, or a visual route-map requirement.

## Runtime Shape

The UI reads optional operational data from `run.operations` or `run.operationalState`.

```ts
interface OperationalState {
  title?: string;
  label?: string;
  summary?: string;
  body?: string;
  maintenanceBacklog?: number;
  serviceDisruption?: number;
  weatherExposure?: number;
  networkFragility?: number;
  cascade?: string;
  mostDamagingCascade?: string;
}
```

## Authoring Hooks

Operational changes should usually be indirect. Decisions and events can increase backlog, expose weather sensitivity, or make a route network brittle. Hazard events can then read the operational state and decide whether the problem becomes visible.

Good operational feedback:

- names the executive cause
- describes the board-level consequence
- avoids dispatch jargon
- distinguishes latent fragility from visible disruption

## UI Hooks

The board packet can render operational pressure in the `Pressure read` section when operational state exists. The ending screen can render the most damaging cascade in the run recap.

Consequence feed entries can include:

```ts
{
  source: "system",
  sourceKind: "operational_cascade",
  operationId: "maintenance_backlog",
  cause: "Heavy checks were outsourced while parts shortages stayed unresolved."
}
```
