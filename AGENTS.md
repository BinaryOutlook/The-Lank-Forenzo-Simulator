# The Lank Forenzo Simulator Agent Notes

Please keep documentation up to date as part of normal code maintenance.

## Documentation Priority

When making meaningful changes, update the relevant documentation in the same pass whenever practical.

The main documentation layers are:

- `Future Roadmap/`: pre-GitHub-issue queue, candidate briefs, priority, and parallelism guidance
- `docs/PRD.md`: stable product foundation, scope, and maintainability rules
- `PRDs/`: version-scoped iteration packets
- `README.md`: current repo overview, setup, structure, and developer-facing orientation

## Future Roadmap Before Issues

Use `Future Roadmap/` as the controlled queue before GitHub issues.

- Before opening or implementing broad issues, check `Future Roadmap/MASTER_ROADMAP_TABLE.md`.
- Do not treat unpromoted candidate briefs as active tasks unless the user explicitly instructs you to work on that candidate.
- Do not independently promote high-risk or core-system work without review.
- When creating a new candidate, write a standalone brief under `Future Roadmap/issue-briefs/` using `Future Roadmap/ISSUE_BRIEF_TEMPLATE.md`.
- Update `Future Roadmap/MASTER_ROADMAP_TABLE.md` when adding, changing, promoting, blocking, completing, or archiving briefs.
- Respect the parallelism class in the master table.
- Avoid parallel mutation of red-zone systems.
- Include conflict-risk notes in PR summaries for promoted roadmap work.
- Prefer small, reviewable PRs.
- Merge in dependency order, not completion order.

## PRD Workflow For Major Iterations

For larger iterations, follow the versioned workflow taught in the vibecoding iteration tutorial:

```text
PRDs/
└── vX.Y/
    ├── vX.Y.md
    └── vX.Y-demo.html
```

Rules:

- Start from a promoted roadmap item or an explicit user request.
- Use one version folder per major iteration.
- Put the iteration PRD in `vX.Y.md`.
- Put the design/demo reference in `vX.Y-demo.html`.
- Read both files before implementing the iteration.
- After implementation, append a short build/change log to the bottom of the version PRD.

## When To Update Which File

Update `Future Roadmap/README.md` when:

- the planning workflow itself changes
- audit notes about roadmap-like docs change materially
- queue governance or promotion rules change

Update `Future Roadmap/MASTER_ROADMAP_TABLE.md` when:

- candidate work is added, re-prioritized, promoted, blocked, completed, or archived
- risk, dependency, status, decision, or parallelism class changes

Update `docs/PRD.md` when:

- product direction changes
- scope or non-goals change
- maintainability rules or architectural guardrails change

Update `PRDs/vX.Y/vX.Y.md` when:

- working on a major new iteration
- defining iteration-specific goals, deliverables, or acceptance criteria
- recording what changed during that iteration

Update `README.md` when:

- setup steps change
- commands change
- supported modes or major features change
- repo structure changes
- important documentation locations change

## Maintenance Expectations

- Do not let code structure drift away from the docs.
- If you add important files, folders, workflows, or commands, reflect that in `README.md`.
- If you change the product in a durable way, reflect that in the PRD layer.
- If you create candidate work, reflect it in `Future Roadmap/`.
- Prefer clear, short, maintainable documentation over long vague notes.
- For major work, keep the versioned PRD packet current so future agents can re-enter quickly.

## Small Change Vs Large Change

Small changes:

- minor copy edits
- small visual tweaks
- isolated fixes

These do not always need a new version folder.

Large changes:

- new pages
- major UI redesigns
- new gameplay systems
- structural refactors
- new modules or workflows

These should usually use or update a versioned `PRDs/vX.Y/` packet.
