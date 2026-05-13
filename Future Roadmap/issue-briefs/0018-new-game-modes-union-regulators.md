---
id: FR-0018
title: New game modes: union and regulators
status: Needs Architecture Review
category: Gameplay modes / expansion
reward: Expands replayability with reverse-play perspectives where players use labor or regulatory power while facing the same institutional temptations, legitimacy problems, and extraction risks as Executive mode.
effort: L
technical_difficulty: High
conflict_risk: High
core_system_risk: High
dependencies: [Upstreaming mode completion, FR-0017 unionization mechanics direction, role-specific victory conditions, event and ending model]
parallelism_class: Orange
priority: P2
github_issue: null
owner: null
last_decision: Preserve the familiar Read / Choose / Resolve quarter loop. Union and Regulators modes should model power clinically: unions can protect or exploit members, while regulators can protect public order or perform oversight under political, legal, and capture pressure.
---

# Candidate Issue: New Game Modes: Union and Regulators

## Summary

The existing Executive / Upstreaming mode is the baseline: players already know how to read the quarter, choose two ugly plays, and resolve the consequences. The next gameplay expansion should keep that familiar ritual while changing the institutional seat.

This candidate considers two reverse-play modes:

- **Union mode**: a labor-side institution that can build worker power, bargain, expose safety abuse, or upstream from member grievance through dues, side letters, administrative bloat, and leadership self-protection.
- **Regulators mode**: a public authority that begins in the cartel-era logic of route, fare, and service order, pivots through deregulation, then hunts executive and union infringement while managing evidence, mandate, capacity, public reaction, and capture risk.

These modes should be treated as game-mode design work first. They may require different victory conditions, player resources, event framing, and endings from the current experience, but they should not become a different genre in the vertical slice.

The shared design thesis is:

\[
\text{power} \ne \text{virtue}
\]

The player changes seats, not moral alignment.

## User / Project Value

Players get fresh replay value by engaging the same world from opposing institutional perspectives. The project also gains a design path for "reverse play" without immediately committing to a large rewrite.

The larger value is tonal consistency. Executive mode already shows how corporate stewardship can become personal extraction. Union and Regulators modes should show the same pattern in different uniforms:

| Mode | Claimed Purpose | How It Goes Wrong |
| --- | --- | --- |
| Executive | Save or stabilize the airline | Strip it for personal exit |
| Union | Protect workers | Monetize worker grievance |
| Regulators | Protect public order | Perform oversight while power leaks away |

This keeps the game cynical without becoming simplistic. It is not pro-union, anti-union, pro-executive, anti-regulator, or anti-commerce. It is about institutional power under pressure.

## Why Now?

Once the current Upstreaming mode is stable, new modes are a natural next layer. Planning the mode architecture early helps avoid hard-coding assumptions that only support the current player role.

The agreed vertical-slice principle is to reuse the current gameplay grammar:

\[
\text{Read} \rightarrow \text{Choose two plays} \rightarrow \text{Resolve quarter}
\]

The UI can change nouns by mode, but the player should immediately understand the process.

## Scope

In scope:

- Explore Union mode as a labor-side player role.
- Explore Regulators mode as an enforcement-side player role.
- Preserve the familiar Read / Choose / Resolve quarter flow as the vertical-slice baseline.
- Define role-specific packet names, decision labels, resource labels, and consequence framing while reusing the same basic player ritual.
- Treat both modes as institutional-power simulations, not heroic reversals of Executive mode.
- Define how Union mode can include both worker protection and union leadership extraction.
- Define how Regulators mode changes across cartel-era administration, deregulation pivot, and post-deregulation enforcement.
- Define how reverse-play victory, failure, and ending conditions might work.
- Identify which systems would need to become mode-aware.
- Recommend whether these should split into separate roadmap items.

## Out of Scope

Not included:

- Immediate full implementation of either mode.
- Replacing the current Upstreaming mode.
- Building a multiplayer or online competitive structure.
- Final historical event writing for either mode.
- A full legal procedure simulator or detailed labor-relations simulator in the first slice.
- Treating the Airline Deregulation Act era as a simple good/bad moral answer.

## Expected Touched Areas

Likely files, folders, systems, or docs:

- Game mode routing and start flow.
- Round-flow labels and mode-specific copy.
- Scenario and event selection.
- Decision pack and resource label selection by mode.
- Victory, failure, and ending logic.
- State model for player role and available actions.
- Faction, dossier, and event semantics for role-specific evidence and legitimacy.
- PRD or versioned PRD packet for any major mode iteration.

## Technical Difficulty

High. New modes can change the player objective, available choices, event graph, resource labels, ending logic, and the meaning of existing metrics. The vertical slice should therefore prove mode asymmetry with minimal new architecture before committing to full campaigns.

## Conflict Risk

High. This may overlap with ongoing work on events, endings, fairness, and unionization mechanics.

## Core-System Risk

High. Mode selection and reverse-play rules could affect simulation architecture, event content, resource semantics, faction interpretation, dossier interpretation, and ending reachability.

## Dependencies

- Upstreaming mode completion or stabilization.
- FR-0017 unionization mechanics direction for Union mode.
- Product decision on the smallest shared mode framework needed for packet labels, decision labels, resources, and endings.
- Product decision on whether Union and Regulators modes share a framework.
- A clear model for mode-specific endings.

## Suggested Parallelism Class

Orange. One design owner should control the mode architecture. Helpers can research role concepts, draft event ideas, or review existing state assumptions.

## Suggested Agent Assignment

Research first, implementation later.

## Shared Vertical Slice Loop

The first slice should feel familiar to existing players. Keep the phase structure and change the institutional vocabulary:

| Executive | Union | Regulators |
| --- | --- | --- |
| Board Packet | Membership Packet | Agency Docket |
| Choose Plays | Table Motions | Docket Actions |
| Strategic Cash | Dues Treasury | Agency Budget |
| Personal Assets | Leadership Security | Career / Capture Risk |
| PR Capital | Public Sympathy | Public Mandate |
| Dossier | Grievance File | Evidence File |
| End Quarter | Close Quarter | Close Docket |

The goal is:

\[
\text{same world} + \text{same ritual} + \text{different power seat}
= \text{different moral failure mode}
\]

## Union Mode Direction

Union mode should start from legitimate worker protection. Members are responding to executive abuse: pension cuts, maintenance shortcuts, outsourcing, crew fatigue, and public-facing safety risk. The temptation is that the representative institution can become its own extraction machine.

Candidate resources and pressure states:

- **Dues Treasury**: funds organizing, legal pressure, strike support, and administrative machinery.
- **Member Trust**: the rank-and-file mandate. It falls when members see sellouts, symbolic wins, or leadership self-protection.
- **Strike Readiness**: the ability to disrupt operations. Powerful, but dangerous if public sympathy collapses.
- **Public Sympathy**: whether labor action reads as necessary protection or self-serving disruption.
- **Leadership Security**: union-side upstreaming. Leadership comfort, office protection, side benefits, and internal control can rise while member trust falls.

Candidate plays:

- Rank-and-file organizing.
- Strike authorization vote.
- Safety whistleblower campaign.
- Two-tier contract sellout.
- Administrative budget expansion.
- Side letter with management.
- Symbolic victory tour.
- Purge dissident local.

The uncomfortable design equation:

\[
\text{worker anger} \rightarrow \text{union leverage} \rightarrow
\left\{\text{member gains},\ \text{leadership security}\right\}
\]

## Regulators Mode Direction

Regulators mode should treat the Airline Deregulation Act as the pivotal aviation-era rupture, not a simple ideological answer. The first rounds can use cartel-era tools: route approvals, fare controls, service obligations, and managed stability. Deregulation then changes the mandate. Later rounds become about investigating harm, policing executive and union infringement, and deciding whether tighter rules can be justified under government approval and public reaction.

Candidate resources and pressure states:

- **Agency Budget**: investigation and enforcement capacity.
- **Political Capital**: permission to block, tighten, sanction, or escalate.
- **Public Mandate**: whether the public accepts intervention or sees overreach.
- **Evidence File**: proof strong enough to survive process, courts, and political scrutiny.
- **Capture Risk**: revolving-door incentives, industry lobbying, selective enforcement, and career laundering.

Candidate plays:

- Open safety investigation.
- Approve or revise route / fare controls in cartel-era rounds.
- Authorize deregulation push.
- Block merger.
- Investigate union corruption.
- Negotiate consent order.
- Stage public hearing.
- Issue emergency rulemaking.
- Quietly close file.
- Accept industry advisory role.

The regulator equation:

\[
\text{enforcement power} =
\text{evidence} \times \text{legal mandate} \times \text{political permission}
\]

Regulators should sometimes oppose executives, sometimes oppose unions, and sometimes be trapped by statute, budget, public opinion, courts, or Congress. They should not be written as secret protagonists.

## Shared Scenario Recommendation

The first vertical slice should use one fictional airline crisis across all three seats:

- an executive cuts labor and defers maintenance
- union leadership can organize members, bargain, expose safety risk, or extract from the grievance machine
- regulators move from controlled aviation order toward deregulated enforcement constraints
- public anger rises if service disruption, safety fear, strikes, or visible corruption spread

Each mode asks a different question:

\[
\begin{aligned}
\text{Executive} &: \text{Can I extract before collapse?} \\
\text{Union} &: \text{Do I build worker power or monetize grievance?} \\
\text{Regulators} &: \text{Do I preserve public order or perform control?}
\end{aligned}
\]

## Content Tone Notes

The modes should keep the same bleak institutional wit as Executive mode. Good IRL-inspired failure patterns include:

- unions converting dues and grievance inventory into leadership comfort
- two-tier agreements that protect incumbents while sacrificing future workers
- public hearings that substitute visibility for remedy
- consent orders that launder reputation without changing incentives
- underfunded agencies blamed for failures they were not equipped to prevent
- deregulation producing competition, consolidation, route abandonment, labor pressure, and lower public patience in the same system
- revolving-door restraint where today's public caution becomes tomorrow's private advisory role

## Acceptance Criteria

- [ ] Observable outcome: the project has a recommended shape for Union mode and Regulators mode.
- [ ] Required behavior: the proposal identifies mode-specific resources, actions, endings, and failure states.
- [ ] Required behavior: the proposal preserves a familiar Read / Choose / Resolve flow for the vertical slice.
- [ ] Required behavior: the proposal explains how Union mode and Regulators mode can each go wrong institutionally without becoming one-sided moral lectures.
- [ ] Required documentation: follow-up implementation candidates are split if the modes are too large for one issue.

## Test Plan

- Review current game mode and scenario assumptions.
- Map existing events and endings against possible reverse-play roles.
- Review which UI labels and resource semantics can become mode-aware without broad rewrites.
- Review whether current faction and dossier systems can support member trust, public mandate, evidence files, and capture risk.
- Run reachability reports for any future prototype that changes ending paths.

## Documentation Impact

Which docs need updates if this lands?

- [ ] `README.md`
- [ ] `AGENTS.md`
- [x] `docs/PRD.md`
- [x] `PRDs/vX.Y/vX.Y.md`
- [x] `docs/reference/`
- [ ] Other: mode-design notes if introduced.

## Rollback / Revert Plan

Keep design exploration separate from implementation. If a future prototype misfires, revert the mode entry points and preserve design notes as a superseded roadmap record.

## Open Questions

- [ ] Should Union mode and Regulators mode be separate roadmap items before promotion?
- [ ] Does reverse play reuse the same event engine or need a mode-specific layer?
- [ ] What does regulator enforcement mean mechanically: ending condition, evidence threshold, consent order, sanction, public hearing, or courtroom phase?
- [ ] What are the minimum mode-aware labels and resources needed for the first vertical slice?
- [ ] Does Regulators mode need a formal era state for cartel-era administration, deregulation pivot, and post-deregulation enforcement?
- [ ] Should Union mode's leadership extraction use a new metric, a resource, an ending path, or dossier/faction evidence?
- [ ] How much of the current state model assumes the player is on the management side?

## Promotion Decision

- [ ] Keep in roadmap
- [ ] Needs clarification
- [x] Needs architecture review
- [ ] Ready to promote to GitHub issue
- [ ] Reject / archive
