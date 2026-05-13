# FR-0023: Full and Minimal Text Display Modes

## Final Status

Done.

## Category

Settings / accessibility / responsive UX.

## Summary

Completed the design-contract pass for full and minimal text display modes. The work defined the mode contract, inventoried high-pressure text surfaces, recommended a component-level text-density strategy, and documented settings, persistence, fallback, and implementation considerations.

## Value Delivered

- Clarified how the game can preserve detailed writing while supporting phone-friendly minimal text.
- Defined first-wave surfaces for text-density support.
- Captured tradeoffs between authored, derived, and component-level minimal text.
- Kept the contract useful whether the future layout uses tabs, routes, drawers, panels, or a hybrid model.

## Issue / PR / Merge

- Issue: [#99](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/99)
- PR: [#103](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/pull/103)
- Merge commit: `a97cb8b`
- Merge target: `main`

## Touched Areas

- `docs/reference/text-display-density-modes.md`

## Verification

- `npm run roadmap:check`
- `npm run typecheck`
- `npm run check`
- GitHub CI for PR #103:
  - Core checks
  - Playwright smoke
  - Balance and reachability diagnostics

## Conflict-Risk Notes

Low for the delivered documentation. Future implementation may touch settings persistence, Options UI, run surfaces, board packet text, decision cards, event feed, tutorial, and ending copy.

## Follow-Up Candidates

- Create a scoped implementation issue for adding the settings field and first-wave component support.
- Coordinate implementation with the sub-tab UI architecture from FR-0022.

## Archive Decision

Move this item out of the active generated roadmap table because the GitHub issue is closed and the text-density contract was merged to `main` in PR #103.
