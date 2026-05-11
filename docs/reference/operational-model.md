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

## Decision Pressure Model

The current implementation keeps the player at executive altitude by applying
authored `operationEffects` from executed decisions:

- maintenance denial increases `maintenanceBacklog` and can add hub/route
  fragility through authored metadata
- contractor and outsourcing plays increase `contractorDependence`
- labor cuts, scope pressure, and live crew-system changes increase crew fatigue
  and recovery brittleness
- route, hub, gate, and slot decisions can reshape hub and route fragility when
  their content JSON includes those effects
- stabilizers such as `safety_spending_surge` and
  `sacrifice_on_time_to_hide_safety` reduce future cascade pressure instead of
  merely granting metric relief when their metadata lowers operational stress

These effects are still deterministic and board-level. They should not expose
dispatch controls or require players to manage individual aircraft.

## Named Cascade Families

`resolveNetworkQuarter` can now surface several traceable cascade families:

| Cascade                       | Trigger pressure                                                                           | Primary consequences                                              | Dossier hook                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | ----------------------------------------------- |
| `maintenance-weather-cascade` | weather severity + high maintenance backlog + weak safety integrity                        | safety decay, public anger, market confidence loss, legal heat    | `maintenance_fraud`                             |
| `contractor-control-cascade`  | high contractor dependence + backlog or fleet burden + weak safety integrity               | legal heat, safety decay, market confidence loss                  | `maintenance_fraud`, light `regulatory_capture` |
| `crew-availability-cascade`   | high crew fatigue + low morale or service disruption + brittle recovery routes             | public anger, cash drag, market confidence loss                   | `labor_abuse`                                   |
| `route-stranding-cascade`     | high route fragility + visible public anger, weak market confidence, or service disruption | public anger, cash drag, market confidence loss, light legal heat | `regulatory_capture`                            |

Each cascade carries a `cause` string. Operation history entries include that
cause and switch `sourceKind` to `operational_cascade` when a named cascade
fires. Major cascades also create board-level briefing signals whose body pairs
the visible failure with its executive cause.

Operational cascade ids can feed dossier evidence. This keeps the scandal layer
answering “what can the world prove?” rather than merely restating current
metrics.

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
