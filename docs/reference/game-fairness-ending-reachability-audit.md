# Game Fairness and Ending Reachability Audit

Audit date: 2026-05-13  
Scope: GitHub issue #97 / FR-0016  
Content hash: `4f1c83d2`

## Audit Scope

This is an evidence-backed documentation audit of current game fairness and
ending reachability. It does not change simulation rules, authored decisions,
authored events, ending thresholds, or balance logic.

The audit used two existing deterministic tools:

```bash
npm run balance:matrix
npm run reachability:report
```

The balance matrix gives seeded archetype evidence for likely player-policy
outcomes. The reachability explorer gives breadth-first, novelty-biased evidence
that authored outcomes and content lanes can be reached by some valid path.
Together they answer different questions:

$$
\text{balance confidence} \ne \text{formal proof of fairness}
$$

The reports should therefore be read as practical design telemetry, not a
mathematical guarantee that every reasonable human strategy has equal footing.

## Current Fairness Assumptions

The current simulation appears to define fairness as a blend of legibility,
path diversity, and consequence consistency:

- **Legible exits.** Three player-selected exit decisions set explicit endings:
  `accept_merger_offer` -> `merger`, `cash_out_and_resign` -> `extraction`,
  and `run_for_nassau` -> `bahamas`.
- **Deterministic collapse rules.** Automatic endings are threshold-based:
  `prison` fires at very high legal heat, or high legal heat paired with low
  safety integrity. `forcedRemoval` fires when creditor patience, airline cash,
  or market confidence collapses.
- **No hidden rescue roll.** Once selected decisions, operating drift, factions,
  operations, scheduled events, ambient events, and dossier thresholds resolve,
  the ending check is deterministic for the resulting state.
- **Tray diversity matters.** The decision tray favors multiple groups and packs,
  suppresses previous-round repeats, preserves exit opportunities, and applies a
  small repair bonus to historically low-reachability packs.
- **Pressure is allowed to punish greed.** The game is not trying to make every
  strategic fantasy equally safe. High legal heat, weak safety integrity,
  creditor collapse, cash collapse, and market collapse are supposed to close
  the walls in.

A useful working fairness standard is:

$$
\text{Fairness} =
\text{clear requirements} +
\text{multiple viable routes} +
\text{consistent consequences} -
\text{unexplained dead ends}
$$

By that standard, the current evidence is strongest for ending reachability and
weaker for broad strategic parity.

## Reachability Evidence

Default command:

```bash
npm run reachability:report
```

Run profile:

| Field | Value |
| --- | ---: |
| Seed | `v0.5-default` |
| Width | `48` |
| Depth | `24` |
| Explored states | `13,792` |
| Frontier states | `48` |
| Confidence | `high` |

Coverage summary:

| Coverage area | Result |
| --- | ---: |
| Endings reached | `5/5` (`100.0%`) |
| Surfaced decisions | `55/113` (`48.7%`) |
| Selected decisions | `55/113` (`48.7%`) |
| Triggered events | `111/165` (`67.3%`) |
| Delayed events | `43/91` (`47.3%`) |
| Hazard events | `4/5` (`80.0%`) |
| Flags reached | `32/42` (`76.2%`) |
| Repeated-tray pressure | `0/4,930` (`0.0%`) |
| Low-confidence packs | none |

Reached endings:

- `bahamas`
- `extraction`
- `forcedRemoval`
- `merger`
- `prison`

Interpretation:

- All authored endings are currently reachable under the default high-confidence
  exploration profile.
- No decision pack is completely absent from the reachability explorer.
- The explorer still reports `58` low-confidence decision IDs and `54`
  low-confidence event IDs. That means the search did not surface or trigger
  them, not necessarily that they are impossible.
- The zero repeated-tray pressure in this report supports the assumption that
  the current tray composer can keep novelty high when deliberately exploring.

## Balance Matrix Evidence

Default command:

```bash
npm run balance:matrix
```

Run profile:

| Field | Value |
| --- | ---: |
| Seed | `v0.5-matrix` |
| Runs per archetype | `200` |
| Archetypes | `8` |
| Total runs | `1,600` |
| Max rounds per run | `24` |
| Average run length | `7.8` rounds |

Aggregate ending distribution:

| Ending | Runs | Share |
| --- | ---: | ---: |
| `prison` | `922` | `57.6%` |
| `forcedRemoval` | `216` | `13.5%` |
| `merger` | `200` | `12.5%` |
| `extraction` | `200` | `12.5%` |
| `bahamas` | `62` | `3.9%` |
| `active` | `0` | `0.0%` |

Aggregate content coverage:

| Coverage area | Result |
| --- | ---: |
| Surfaced decisions | `53/113` (`46.9%`) |
| Selected decisions | `42/113` (`37.2%`) |
| Triggered events | `68/165` (`41.2%`) |
| Delayed events | `25/91` (`27.5%`) |
| Hazard events | `3/5` (`60.0%`) |
| Repeated-tray pressure | `2,199/66,011` (`3.3%`) |
| Aggregate low-reachability packs | `incidentVariants` |

Archetype outcomes:

| Archetype | Primary outcome evidence | Average length | Notable risk |
| --- | --- | ---: | --- |
| `extraction` | `200/200` `extraction` | `7.0` | Very narrow selected-decision coverage (`8/113`). |
| `merger` | `200/200` `merger` | `5.0` | Very narrow selected-decision coverage (`7/113`). |
| `offshore` | `62/200` `bahamas`, `138/200` `prison` | `5.3` | Escape route exists but is not dominant even for the matching bot. |
| `stabilizer` | `184/200` `prison`, `16/200` `forcedRemoval` | `12.0` | Stabilizing behavior currently struggles to avoid punitive endings. |
| `safety-denial` | `200/200` `prison` | `5.0` | Expectedly punitive, but very fast collapse reduces content exposure. |
| `shadow-subsidiary` | `200/200` `prison` | `8.0` | Shell strategy may overfeed legal/dossier pressure. |
| `creditor-trench` | `200/200` `forcedRemoval` | `6.5` | Creditor lane has a clean failure identity. |
| `regulatory-theatre` | `200/200` `prison` | `14.0` | Longest runs still converge to prison. |

Pack coverage across archetypes:

| Pack | Archetypes surfaced | Share |
| --- | ---: | ---: |
| `core` | `8/8` | `100.0%` |
| `mergerBait` | `8/8` | `100.0%` |
| `creditorWarfare` | `8/8` | `100.0%` |
| `assetHarvest` | `8/8` | `100.0%` |
| `safetyDenial` | `8/8` | `100.0%` |
| `regulatoryTheater` | `8/8` | `100.0%` |
| `executiveEscape` | `8/8` | `100.0%` |
| `marketTheater` | `7/8` | `87.5%` |
| `laborShock` | `2/8` | `25.0%` |
| `shadowSubsidiaries` | `2/8` | `25.0%` |
| `incidentVariants` | `1/8` | `12.5%` |

Interpretation:

- Ending reachability is healthy, but the balance matrix has a strong punitive
  center of gravity: `prison` is the aggregate majority at `57.6%`.
- The matching extraction and merger archetypes cleanly reach their preferred
  endings in all default runs. That is good evidence for those exit lanes.
- The matching offshore archetype reaches `bahamas` in only `31.0%` of runs.
  Because `prison` takes the remaining `69.0%`, the escape route is reachable
  but may be brittle.
- Stabilizer, shadow-subsidiary, regulatory-theatre, and safety-denial runs are
  prison-dominant. Some of that is thematically appropriate, but the audit cannot
  distinguish intended genre pressure from over-tuned legal/dossier escalation.
- `incidentVariants` is the only aggregate low-reachability pack in the balance
  matrix. `laborShock` and `shadowSubsidiaries` also have thin archetype spread.

## Suspected Risks and Open Questions

### Risk: prison may be too dominant

The default balance matrix has:

$$
P(\text{prison}) = \frac{922}{1600} = 57.6\%
$$

That is just under the `60%` watch line documented for nightly reports, but the
distribution is close enough to merit monitoring. The concern is not that
`prison` exists or is common; it is that several distinct archetypes arrive there
with different stated intentions.

Open question: is `prison` meant to be the principal genre gravity well, or
should more non-exit strategies fail through `forcedRemoval`, prolonged active
runs, or other future non-victory endings?

### Risk: stabilizing play may lack a satisfying non-greedy arc

The stabilizer bot keeps the run alive longer than most archetypes, but still
ends in `prison` for `184/200` runs and `forcedRemoval` for `16/200` runs.

Open question: should "trying to repair the airline" remain a tragic route, or
does the product need a deliberately difficult but legible reform/stewardship
outcome in a later iteration?

### Risk: Bahamas ending may be brittle

The reachability explorer reaches `bahamas`, and the offshore bot reaches it in
`62/200` runs. However, a matching bot still goes to `prison` in `138/200` runs.

Open question: are the `run_for_nassau` prerequisites intentionally narrow, or
is legal heat/dossier pressure overtaking the offshore-readiness route before the
player can act?

### Risk: low-reachability packs may have low human visibility

The reachability explorer has no low-confidence packs, which proves every pack
can appear under exploration. The balance matrix still flags `incidentVariants`
as low reachability, with `laborShock` and `shadowSubsidiaries` only surfacing
for `2/8` archetypes.

Open question: should these packs remain situational spice, or should future
tray tuning and content requirements make them more visible across ordinary
strategies?

### Risk: report coverage can hide path quality

Coverage metrics answer "was this seen?" They do not answer whether a path felt
fair, whether the player had enough warning, or whether a recovery decision
appeared before collapse.

Open question: should future tooling track warning windows such as:

$$
\Delta r =
r_{\text{ending}} - r_{\text{first visible rescue option}}
$$

That would make fairness audits more precise than raw coverage alone.

## Follow-Up Implementation Candidates

These are proposed implementation issues, not changes made by this audit.

1. **Add a warning-window balance report.** Track how many rounds elapse between
   first severe pressure signals, first available relief decisions, and final
   automatic endings.
2. **Review offshore route brittleness.** Audit `run_for_nassau` requirements,
   offshore-readiness pacing, legal heat growth, and dossier escalation to decide
   whether the current `31.0%` offshore success rate is intended.
3. **Review stabilizer end-state design.** Decide whether stabilizer play should
   remain tragic or should unlock a rare reform/stewardship ending in a future
   product iteration.
4. **Investigate low-reachability packs.** Compare `incidentVariants`,
   `laborShock`, and `shadowSubsidiaries` requirements against ordinary player
   routes, then adjust content or tray policy only if their low exposure is not
   intentional.
5. **Add longitudinal balance baselines.** Preserve selected report snapshots by
   content hash so future balance changes can be compared against known ending
   and coverage distributions.

## Audit Conclusion

Current evidence supports this conclusion:

$$
\text{All authored endings are reachable under existing tools.}
$$

The stronger unresolved question is not reachability; it is fairness texture.
The game currently has a coherent punitive model, clear deterministic collapse
rules, and reachable authored exits. At the same time, the default archetype
matrix suggests prison-heavy convergence, a brittle offshore escape, and thin
visibility for a few content packs. Those are good candidates for follow-up
design review, but this audit does not recommend changing balance in the #97
branch.
