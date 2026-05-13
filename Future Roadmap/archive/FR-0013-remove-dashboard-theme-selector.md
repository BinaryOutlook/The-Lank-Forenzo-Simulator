# FR-0013: Remove Dashboard Theme Selector

## Final Status

Done.

## Category

UI / settings.

## Summary

Removed the dashboard-level theme selector from the main shell so compact screens have less persistent chrome. Theme selection remains available through the Options page, preserving player control without occupying top-level dashboard space.

## Value Delivered

- Reduced duplicated theme controls.
- Freed space in the dashboard/header area.
- Preserved theme selection and local persistence through Options.
- Added coverage to confirm the shell no longer exposes the dashboard theme selector.

## Issue / PR / Merge

- Issue: [#85](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/85)
- PR: [#88](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/pull/88)
- Merge commit: `a06fe7a`
- Merge target: `main`

## Touched Areas

- `src/components/shell/AppShell.tsx`
- `src/components/shell/AppShell.module.css`
- `src/components/shell/AppShell.test.tsx`
- `src/screens/options/OptionsScreen.tsx`
- `src/simulation/state/gameStore.ts`
- `README.md`
- `docs/PRD.md`

## Verification

- `npm run check`
- GitHub CI for PR #88:
  - Core checks
  - Playwright smoke
  - Balance and reachability diagnostics

## Conflict-Risk Notes

Low. The main implementation was a localized shell/settings cleanup, with the primary conflict surface around shared navigation and Options UI files.

## Follow-Up Candidates

- FR-0019: New design themes.
- FR-0020: Settings organization update.

## Archive Decision

Move this item out of the active generated roadmap table because the GitHub issue is closed and the implementation was merged to `main` in PR #88.
