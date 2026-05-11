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

V0.9 decisions can now carry explicit `operationEffects` metadata. These effects
replace the earlier hardcoded decision-id lists in the network mutation layer, so
future operational tuning should happen in content JSON rather than in
`networkState.ts`.

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

Runtime application is deterministic:

- scalar fields are summed across executed decisions
- backlog, contractor dependence, crew fatigue, service disruption, weather
  exposure, and fragility values are clamped to `0..100`
- `hubFragility` and `routeFragility` use authored hub or route ids
- `weatherExposure` raises or lowers the severity of active weather fronts
- decisions with no `operationEffects` still run normally and simply add no
  direct operational delta

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
