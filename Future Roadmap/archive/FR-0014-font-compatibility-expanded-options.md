# FR-0014: Font Compatibility and Expanded Options

## Final Status

Done.

## Category

Frontend / platform compatibility.

## Summary

Added cross-platform typography fallbacks and player-facing font preset choices so the game remains legible and visually consistent across Windows 10, Windows 11, and modern macOS.

## Value Delivered

- Added system-safe fallback stacks for theme typography.
- Exposed font presets through Options.
- Preserved local settings persistence for font choice.
- Documented the supported typography baseline.

## Issue / PR / Merge

- Issue: [#86](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/86)
- PR: [#88](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/pull/88)
- Merge commit: `a06fe7a`
- Merge target: `main`

## Touched Areas

- `src/simulation/state/settings.ts`
- `src/simulation/state/gameStore.ts`
- `src/app/providers/AppProviders.tsx`
- `src/screens/options/OptionsScreen.tsx`
- `src/screens/options/OptionsScreen.test.tsx`
- `src/theme/earth/tokens.css`
- `src/theme/armonk-blue/tokens.css`
- `src/theme/tokens/app.css`
- `README.md`
- `docs/PRD.md`

## Verification

- `npm run check`
- GitHub CI for PR #88:
  - Core checks
  - Playwright smoke
  - Balance and reachability diagnostics

## Conflict-Risk Notes

Low. Most changes were centralized in settings, Options UI, and theme token files. Future theme work should continue to keep font presets separate from visual theme choices.

## Follow-Up Candidates

- FR-0019: New design themes.
- FR-0020: Settings organization update.

## Archive Decision

Move this item out of the active generated roadmap table because the GitHub issue is closed and the implementation was merged to `main` in PR #88.
