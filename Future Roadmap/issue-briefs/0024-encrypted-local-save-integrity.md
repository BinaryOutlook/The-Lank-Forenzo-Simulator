---
id: FR-0024
title: Encrypted local save integrity follow-up
status: Needs Architecture Review
category: Persistence / save integrity
reward: Adds a reviewed path toward private or tamper-resistant local saves after the non-encrypted Load Manager boundary stabilizes.
effort: L
technical_difficulty: High
conflict_risk: Medium
core_system_risk: High
dependencies: [FR-0021 local save manager, save threat model, key-management decision, browser crypto compatibility review]
parallelism_class: Orange
priority: P2
github_issue: null
owner: null
last_decision: Created as a follow-up to the non-encrypted Load Manager pass. Do not implement until the save-integrity goal is clarified.
---

# Candidate Issue: Encrypted Local Save Integrity Follow-Up

## Summary

Add a follow-up track for encrypted or tamper-resistant local saves after the
plain JSON Load Manager stabilizes. This should not be treated as a quick
wrapper around the current export format; the project first needs to decide
whether the desired outcome is privacy, casual tamper deterrence, or stronger
integrity guarantees.

The non-encrypted save boundary from FR-0021 should remain the foundation. This
candidate decides how much cryptographic protection belongs around that
boundary, how keys are derived or stored, and what failure modes players see.

## User / Project Value

Players get a clearer sense that save files are not casual editable ledgers if
the product later needs that property. Maintainers get a deliberate security
model instead of brittle homemade obfuscation.

## Why Now?

FR-0021 explicitly leaves encryption out of the first pass. Recording this
follow-up keeps that split visible while preventing save-integrity work from
being smuggled into the plain JSON implementation.

## Scope

In scope:

- Define the save-integrity goal: privacy, tamper deterrence, or stronger
  authenticity.
- Compare browser-native Web Crypto options for local-only saves.
- Decide whether encryption is password-derived, device-bound, or app-managed.
- Define failure behavior for bad passwords, corrupted payloads, and incompatible
  encrypted versions.
- Prototype or implement the selected encrypted wrapper only after architecture
  review.
- Preserve migration from non-encrypted exports where practical.

## Out of Scope

Not included:

- Cloud saves.
- Account-backed keys.
- Multiplayer anti-cheat.
- DRM-style guarantees.
- Replacing the existing non-encrypted Load Manager flow before the threat model
  is settled.

## Expected Touched Areas

Likely files, folders, systems, or docs:

- `src/lib/storage/save.ts`
- Load Manager screen and tests
- Store load/import boundary
- `docs/reference/local-save-manager.md`
- `docs/PRD.md`
- A new or updated versioned PRD packet

## Technical Difficulty

High. Browser crypto can be implemented safely, but the product decision matters
as much as the code. Password-derived encryption, device-local keys, and signed
payloads all imply different UX, migration, and support trade-offs.

## Conflict Risk

Medium. This work will likely touch the same Load Manager UI, save utilities,
and persistence tests as local-save improvements.

## Core-System Risk

High. The change wraps save serialization and import. Mistakes can strand
players with unreadable saves or imply security guarantees the project does not
actually provide.

## Dependencies

Upstream work, decisions, docs, data, or issues:

- FR-0021 non-encrypted Load Manager merged.
- Save threat model documented.
- Key-management decision.
- Browser compatibility review for the selected Web Crypto approach.

## Suggested Parallelism Class

Orange. One owner should control the persistence boundary. A helper can research
Web Crypto options or draft threat-model notes without editing the core save
path in parallel.

## Suggested Agent Assignment

Research first, implementation later.

## Acceptance Criteria

- [ ] Observable outcome: encrypted or tamper-resistant save behavior has a
      documented threat model and reviewed design.
- [ ] Required behavior: the implementation clearly distinguishes protected
      saves from the existing plain JSON format.
- [ ] Required documentation: key-management, migration, corruption handling,
      and tamper-policy notes are recorded before implementation merges.

## Test Plan

- Unit-test successful protected save export and import.
- Test wrong-password or invalid-key behavior if password-derived encryption is
  selected.
- Test corrupted encrypted payloads.
- Test migration or explicit rejection of non-encrypted legacy files.
- Run standard typecheck, lint, unit, and build checks.

## Documentation Impact

Which docs need updates if this lands?

- [x] `README.md`
- [ ] `AGENTS.md`
- [x] `docs/PRD.md`
- [x] `PRDs/vX.Y/vX.Y.md`
- [x] `docs/reference/`
- [ ] Other:

## Rollback / Revert Plan

Keep encrypted save handling behind a wrapper around the existing plain payload
boundary. If the feature misfires, disable protected export/import while keeping
the non-encrypted Load Manager intact.

## Open Questions

- [ ] Is the goal privacy, casual tamper deterrence, or stronger authenticity?
- [ ] Should keys be password-derived, browser/device-bound, or app-managed?
- [ ] Should plain JSON export remain available after encrypted saves land?
- [ ] How should users recover from forgotten passwords or unreadable protected
      saves?

## Promotion Decision

- [x] Keep in roadmap
- [ ] Needs clarification
- [x] Needs architecture review
- [ ] Ready to promote to GitHub issue
- [ ] Reject / archive
