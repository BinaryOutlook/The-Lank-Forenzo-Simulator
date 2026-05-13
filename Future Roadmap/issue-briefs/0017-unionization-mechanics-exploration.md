---
id: FR-0017
title: Unionization mechanics exploration
status: Needs Architecture Review
category: Gameplay systems / historical texture
reward: Adds historically grounded labor pressure that can represent worker protection, strike leverage, and union leadership self-dealing without turning labor into a one-note moral faction.
effort: L
technical_difficulty: High
conflict_risk: High
core_system_risk: High
dependencies: [Product scope decision, faction/global-state design, event authoring model, balance review]
parallelism_class: Orange
priority: P2
github_issue: null
owner: null
last_decision: Clarify design first. Unionization should be modeled clinically as a power system with legitimate worker protection, member trust, strike leverage, public sympathy, and possible leadership extraction before any implementation issue is opened.
---

# Candidate Issue: Unionization Mechanics Exploration

## Summary

Frank Lorenzo's anti-union posture and the role of unionization in aviation history are central to the era the game evokes. This candidate explores adding union participation or labor pressure as a mechanic through events, global state, factions, or some combination of those systems.

The goal is not to bolt on a one-off theme, nor to frame unions as automatically heroic or automatically obstructive. Unionization should be treated as institutional power: it can protect workers from executive extraction, but it can also become a dues-funded machine that converts member anger into leadership security.

The design lens should stay clinical:

\[
\text{union legitimacy} =
\text{member trust} + \text{material wins} - \text{leadership extraction}
\]

Labor pressure should therefore create useful friction in Executive mode while also laying the groundwork for any later Union mode where the player can either build worker power or upstream from the union itself.

## User / Project Value

Players get a richer aviation-management simulation with historically grounded labor tension. The mechanic could make decisions feel sharper by connecting operational moves, public pressure, workforce morale, strike leverage, member trust, and long-run consequences.

The project also gains a cleaner bridge between the current Executive mode and future reverse-play modes. A union should not merely be a punishment generator for executives. It should be a living institution with its own mandate, incentives, public image, and capacity to fail its members.

## Why Now?

The theme is historically important and naturally tied to existing event and global-state systems. It should be designed before related content expansions make labor mechanics harder to integrate coherently.

This is also the right moment to prevent the labor layer from becoming too flat. If the game only says "union good" or "union bad," it loses the same institutional bite that makes Executive mode work. The more durable target is how systems go wrong over time.

## Scope

In scope:

- Explore whether unionization should be modeled through events, global state, factions, or another existing system.
- Define possible player-facing effects, failure modes, and legitimacy trade-offs.
- Explore member trust, strike readiness, public sympathy, dues treasury, and leadership extraction as candidate concepts.
- Define how union pressure appears in Executive mode without making labor a purely heroic or purely antagonistic force.
- Identify IRL-inspired failure patterns such as symbolic victories, two-tier sellouts, strike theater, administrative bloat, side letters, and leadership self-protection.
- Identify content needs and balance risks.
- Recommend whether to promote a scoped implementation issue.

## Out of Scope

Not included:

- Immediate implementation of a full labor simulation.
- Rewriting the entire faction or event system.
- Adding online, multiplayer, or external-data labor mechanics.
- Turning labor into a one-sided moral scorecard.
- Final Union mode implementation, though this work should inform it.

## Expected Touched Areas

Likely files, folders, systems, or docs:

- Event content and authoring rules.
- Global state or faction mechanics.
- Balance reports.
- Decision, event, and ending semantics if labor pressure becomes a durable state.
- PRD or versioned PRD packet for any major gameplay iteration.
- Historical/reference documentation if the mechanic is accepted.

## Technical Difficulty

High. The mechanic could span content, state, balance, and user-facing explanation, even if the first implementation is modest. It also carries tone risk: the system needs to show both worker protection and union self-dealing without collapsing into bland both-sides language.

## Conflict Risk

High. This may overlap with event expansion, faction work, and global-state changes.

## Core-System Risk

High. If implemented through global state or event routing, this becomes core gameplay-system work.

## Dependencies

- Product decision on how prominent labor mechanics should be.
- Existing event and faction system constraints.
- FR-0018 direction for whether Union mode reuses the same institutional-power concepts.
- Fairness and reachability considerations for endings affected by labor state.

## Suggested Parallelism Class

Orange. A design owner should control the mechanic shape; helpers can research history, draft content, or prototype bounded UI only after the model is chosen.

## Suggested Agent Assignment

Research first, implementation later.

Suggested research framing:

- Map how the current Executive mode already pressures workforce morale, public anger, safety integrity, legal heat, and labor faction behavior.
- Identify the smallest state additions needed to make labor pressure legible without building a full labor simulator.
- Separate "union as pressure on executives" from "union as playable institution" so the first implementation does not accidentally hard-code the later mode into a corner.

## Candidate Mechanical Concepts

These concepts are not yet accepted implementation scope, but they capture the design intent discussed for the vertical slice.

- **Member Trust**: the union's real mandate. Falls when members perceive sellouts, symbolic wins, corrupt administration, or leadership self-preservation.
- **Strike Readiness**: labor's ability to disrupt operations. It grows through organizing and anger, but can damage public sympathy when used carelessly.
- **Public Sympathy**: the public-facing legitimacy of labor action. Safety exposure may raise it; repeated disruption or visible corruption may lower it.
- **Dues Treasury**: organizational fuel for strike funds, legal action, organizing, and administration.
- **Leadership Extraction**: the union-side mirror of executive upstreaming. Dues, grievance machinery, side letters, and internal bureaucracy can be converted into leadership comfort or security.

The design should preserve a cynical but balanced equation:

\[
\text{worker anger} \rightarrow \text{union leverage} \rightarrow
\left\{\text{member gains},\ \text{leadership security}\right\}
\]

## Content Tone Notes

Unionization content should be written as institutional anatomy, not sermonizing.

Good pressure examples:

- workers organize after pension cuts, maintenance shortcuts, outsourcing, or crew fatigue
- safety whistleblowers turn labor conflict into a public-interest problem
- strike threats force management to bargain, but also expose workers to retaliation and public blame

Good failure examples:

- a two-tier deal protects current members while sacrificing future hires
- a side letter gives leadership quiet benefits while members receive weak terms
- a symbolic victory tour converts a thin contract into public theater
- administrative budgets swell while the strike fund stays thin
- dissident locals are disciplined to protect leadership control.

## Acceptance Criteria

- [ ] Observable outcome: the project has a clear recommendation for whether and how to add unionization mechanics.
- [ ] Required behavior: proposed mechanics identify their effects on state, events, choices, endings, and faction behavior.
- [ ] Required behavior: the proposal explains how unionization can create legitimate worker protection and union-side extraction risk.
- [ ] Required documentation: accepted direction is recorded before implementation begins.

## Test Plan

- Review existing event and global-state systems.
- Review current labor decisions, labor faction behavior, and workforce/public/safety metric interactions.
- Run balance/reachability checks for any prototype or future implementation.
- Manually inspect player-facing copy for clarity and historical fit.

## Documentation Impact

Which docs need updates if this lands?

- [ ] `README.md`
- [ ] `AGENTS.md`
- [x] `docs/PRD.md`
- [x] `PRDs/vX.Y/vX.Y.md`
- [x] `docs/reference/`
- [ ] Other: historical content notes if introduced.

## Rollback / Revert Plan

Keep exploration separate from implementation. If a prototype is later rejected, revert the mechanic and preserve the design notes as an archive record or superseded brief.

## Open Questions

- [ ] Should unionization be a global pressure meter, event family, faction layer, or ending modifier?
- [ ] Which minimum concepts are needed first: member trust, strike readiness, public sympathy, dues treasury, or leadership extraction?
- [ ] Which parts belong in Executive mode now, and which should be reserved for future Union mode?
- [ ] How much historical specificity should the game expose directly?
- [ ] How will the mechanic avoid making one strategy path obviously dominant?
- [ ] How can the tone stay cynical about institutional failure without flattening real labor protections into cheap equivalence?

## Promotion Decision

- [ ] Keep in roadmap
- [ ] Needs clarification
- [x] Needs architecture review
- [ ] Ready to promote to GitHub issue
- [ ] Reject / archive
