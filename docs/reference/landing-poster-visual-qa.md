# Landing Poster Visual QA

The landing poster is decorative, but it still has a concrete visual job. It
should read as a fictional LFS airline turnaround poster: aircraft tail in the
upper right, aircraft body cutting behind the subject, and a polished executive
figure in the lower center. The two-tone dotted treatment is a simplification of
that composition, not a license to replace it with an unrelated symbol.

## Intentional Effect

- The poster uses only theme-driven dotted ink colors on a theme surface.
- The figure and aircraft should remain recognizably similar to the reference
  composition at desktop and phone widths.
- `LFS` may appear as fictional airline lettering; no real airline marks or real
  person likeness claims should be introduced.
- The poster must remain decorative with `aria-hidden="true"`.
- The `Operating doctrine` copy must remain legible and visually separate from
  the art.

## Screenshot Gate

Before submitting landing poster visual changes, capture screenshots for:

- Earth desktop
- Armonk Blue desktop
- Highwire desktop
- Civic Glass desktop
- Earth mobile portrait

Reject the change if the screenshots do not clearly show the same basic
aircraft-tail-plus-executive composition, even if the implementation is faster
or technically cleaner. The acceptable tradeoff is lower visual resolution, not
loss of subject identity.

## Technical Gate

- The landing page should make no raster poster image request.
- Theme adaptation should use `--landing-poster-*` tokens.
- Avoid `filter`, `mix-blend-mode`, or multi-step color inversion for the poster.
- Run `npm run check`, `npm run build`, and `npm run test:e2e` before merge.
