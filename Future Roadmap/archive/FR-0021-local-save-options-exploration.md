---
id: FR-0021
title: Local save options exploration
status: Done
category: Persistence / player experience
reward: Lets players resume sessions while creating a path toward future save integrity protections.
effort: L
technical_difficulty: High
conflict_risk: Medium
core_system_risk: High
dependencies: [State serialization inventory, save versioning decision, storage target decision, tamper policy]
parallelism_class: Orange
priority: P1
github_issue: https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/106
owner: tlfs-orchestrator
last_decision: Completed by PR #107 as a non-encrypted Load Manager. Encrypted or tamper-resistant saves are tracked separately in FR-0024.
---

# Candidate Issue: Local Save Options Exploration

## Summary

Explore local save support so users can resume sessions. The first pass should use a non-encrypted save structure for design and implementation learning, with a later path toward encrypted or tamper-resistant saves if the project needs to prevent manual alteration.

This is persistence work, so the main goal is to define the save boundary carefully before wiring it into player-facing flows.

## User / Project Value

Players can leave and return to longer sessions without losing progress. Maintainers get a deliberate save format instead of ad hoc persistence that becomes difficult to migrate later.

## Why Now?

As the game grows in depth and mode variety, resuming sessions becomes more valuable. Planning saves before adding more modes also helps keep state serialization stable.

## Scope

In scope:

- Explore local save format and storage location.
- Define which game state must be serialized.
- Consider save versioning and migration needs.
- Prototype or recommend a non-encrypted local-save path.
- Identify follow-up requirements for encrypted or tamper-resistant saves.

## Out of Scope

Not included:

- Cloud saves.
- Account systems.
- Multiplayer synchronization.
- Encrypted saves in the first exploration pass.
- Anti-cheat guarantees.

## Expected Touched Areas

Likely files, folders, systems, or docs:

- Game state store.
- Session start and resume flow.
- Persistence utilities.
- Save/load UI.
- PRD or versioned PRD packet for persistence behavior.

## Technical Difficulty

High. Saves need stable state boundaries, migration thinking, and careful handling of partial or stale data.

## Conflict Risk

Medium. This may overlap with mode work, state refactors, and settings persistence.

## Core-System Risk

High. Local saves touch persistence, state serialization, and potentially future content/schema compatibility.

## Dependencies

- State serialization inventory.
- Decision on storage target, such as browser local storage or file-based export.
- Save schema versioning plan.
- Product decision on when tamper resistance matters.

## Suggested Parallelism Class

Orange. One owner should control the persistence boundary. Helpers can audit state shape or research save-format options.

## Suggested Agent Assignment

Research first, implementation later.

## Acceptance Criteria

- [x] Observable outcome: the project has a recommended local-save approach and save schema boundary.
- [x] Required behavior: the first pass remains non-encrypted and clearly separates future encrypted-save work.
- [x] Required documentation: save format, migration assumptions, and tamper-policy notes are recorded before implementation.

## Test Plan

- Inventory current state and identify required fields for resume.
- Test any prototype with fresh saves, resumed saves, stale saves, and corrupted saves.
- Verify saved sessions do not break current settings or mode flows.

## Documentation Impact

Which docs need updates if this lands?

- [x] `README.md`
- [ ] `AGENTS.md`
- [x] `docs/PRD.md`
- [x] `PRDs/vX.Y/vX.Y.md`
- [x] `docs/reference/`
- [ ] Other:

## Rollback / Revert Plan

Keep save/load code behind a narrow entry point. If the feature misfires, remove the save UI and persistence hook while leaving the state store behavior intact.

## Implementation Record

- GitHub issue: https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/106
- Pull request: https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/pull/107
- Follow-up ticket: `Future Roadmap/issue-briefs/0024-encrypted-local-save-integrity.md`

## Open Questions

- [x] Should local saves use browser storage, explicit import/export files, or both? Both: browser slots plus explicit plain JSON import/export.
- [x] What minimum state is needed to resume a session reliably? `theme`, `settings`, and `run`.
- [x] How should stale or incompatible saves be handled? Corrupt files fail visibly; future explicit imports are rejected; incompatible slots are ignored.
- [x] When should encrypted or tamper-resistant saves become necessary? Only after FR-0024 clarifies the threat model.

## Promotion Decision

- [ ] Keep in roadmap
- [ ] Needs clarification
- [ ] Needs architecture review
- [x] Ready to promote to GitHub issue
- [x] Reject / archive
