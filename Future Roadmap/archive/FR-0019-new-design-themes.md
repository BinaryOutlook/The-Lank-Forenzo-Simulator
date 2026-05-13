# FR-0019: New Design Themes

## Final Status

Done.

## Category

UI / visual design.

## Summary

Added two new design themes, `Highwire` and `Civic Glass`, to complement the existing `Earth` and `Armonk Blue` themes. The work stayed scoped to visual theme tokens, theme selection, storage validation, tests, and theme documentation without adding new font choices or wallpaper systems.

## Value Delivered

- Expanded the player-facing theme set from two to four first-class themes.
- Added dedicated token files for `Highwire` and `Civic Glass`.
- Updated theme typing and save validation for the new theme IDs.
- Documented the new theme directions in README and `Themes/`.

## Issue / PR / Merge

- Issue: [#91](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/91)
- PR: [#94](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/pull/94)
- Merge commit: `1dd5919`
- Merge target: `main`

## Touched Areas

- `src/simulation/state/types.ts`
- `src/lib/storage/save.ts`
- `src/theme/tokens/global.css`
- `src/theme/highwire/tokens.css`
- `src/theme/civic-glass/tokens.css`
- `src/screens/options/OptionsScreen.tsx`
- `src/screens/options/OptionsScreen.test.tsx`
- `tests/unit/save.test.ts`
- `README.md`
- `Themes/Highwire.md`
- `Themes/Civic-Glass.md`

## Verification

- `npm run check`
- `npm run build`
- GitHub CI for PR #94:
  - Core checks
  - Playwright smoke
  - Balance and reachability diagnostics

## Conflict-Risk Notes

Medium. The main conflict surface was the Options screen, because settings organization work landed immediately before the new theme choices. The final integration kept the organized settings headings and the expanded theme choices.

## Follow-Up Candidates

None required for the completed scope. Future theme work should create new candidate briefs.

## Archive Decision

Move this item out of the active generated roadmap table because the GitHub issue is closed and the implementation was merged to `main` in PR #94.
