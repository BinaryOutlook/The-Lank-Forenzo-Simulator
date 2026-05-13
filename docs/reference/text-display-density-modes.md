# Text Display Density Modes

Issue: [#99](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/99) / FR-0023

This document defines the implementation contract for **full** and **minimal** text display modes. It is intentionally a design contract, not a copy rewrite. The goal is to let the game keep its full boardroom voice while giving phone-sized and dense play surfaces a deliberately lean reading path.

## Design Goal

The app currently separates spatial density through `settings.uiDensity` (`standard` or `compact`). Text display density should be a separate setting because it changes which explanatory copy is shown, not merely how tightly controls are arranged.

Use this distinction:

| Concern              | Existing or proposed setting           | Primary effect                                                      |
| -------------------- | -------------------------------------- | ------------------------------------------------------------------- |
| Spatial density      | `uiDensity: "standard" \| "compact"`   | Padding, gaps, panel rhythm, card sizing.                           |
| Text display density | `textDisplayMode: "full" \| "minimal"` | Supporting paragraphs, descriptions, helper copy, and recap detail. |

The two settings may be used together. For example, `compact` + `full` should still show rich text in a tighter layout, while `standard` + `minimal` should keep generous spacing but reduce prose.

## Mode Definitions

### Full

Full mode is the default canonical reading mode. It should preserve the current authored tone and explanatory coverage:

- section descriptions and phase guidance stay visible
- decision summaries, feed bodies, dossier summaries, and recap sections remain expanded
- tutorial and options helper copy stays descriptive
- controls can rely on nearby explanatory text

Full mode is the accessibility baseline for players who need more context, not the "verbose extra" path. If a component cannot support both modes yet, it should continue rendering full text.

### Minimal

Minimal mode is a player-selected lean reading path. It should keep all gameplay-critical facts visible while reducing repeated flavor, explanatory paragraphs, and secondary prose:

- preserve labels, names, counts, costs, required selections, metric values, validation states, and available actions
- prefer titles, tags, chips, short status phrases, and stable affordances over paragraphs
- collapse or hide supporting descriptions when the same meaning is already available through nearby structure
- provide an expansion path for hidden detail on high-risk decisions, event entries, and recaps

Minimal mode must never change simulation rules, available choices, outcome calculation, or save compatibility. The invariant is:

$$
\text{playable facts}_{minimal} \supseteq \text{facts required to make a legal move}
$$

In plainer terms: minimal text can be terse, but it cannot make the player guess whether an action is legal, costly, selected, dangerous, or final.

## Settings Contract

Add a setting with this conceptual shape:

```ts
export const textDisplayModeIds = ["full", "minimal"] as const;
export type TextDisplayMode = (typeof textDisplayModeIds)[number];

export interface GameSettings {
  // existing fields...
  textDisplayMode: TextDisplayMode;
}

export const defaultGameSettings: GameSettings = {
  // existing defaults...
  textDisplayMode: "full",
};
```

Recommended Options copy:

- Label: `Text detail`
- Full option: `Full`
- Full description: `Show the full boardroom writing, guidance, and recap context.`
- Minimal option: `Minimal`
- Minimal description: `Show lean labels, facts, and expandable detail for tighter screens.`

### Persistence

`textDisplayMode` should persist in the same local-first settings payload as the existing presentation, audio, effect, and `uiDensity` settings:

- Store it inside `GameSettings`, not `RunState`, because it is player preference rather than simulation state.
- Normalize unknown, missing, or stale values to `"full"`.
- Existing saves should continue to load without manual migration because an additive optional setting can be defaulted by `normalizeGameSettings`.
- A storage version bump is not required for the additive default alone. Bump only if the storage shape or migration semantics change beyond adding the normalized field.
- Reset options should restore `textDisplayMode` to `"full"` along with the rest of `defaultGameSettings`.
- App providers may expose `data-text-display-mode="full|minimal"` on the root, but component props are preferred where copy selection is behavioral.

Minimal mode should not be automatically forced on mobile. A future onboarding prompt or responsive recommendation can suggest it, but the durable contract is explicit player choice with `"full"` as the default.

## Rendering Contract

Components should treat text density as a rendering input, not as a content deletion pass.

```ts
interface TextDensityProps {
  textDisplayMode: "full" | "minimal";
}
```

Use either a direct prop or a small selector hook near the component boundary. Avoid passing the whole settings object deep into leaf components when only text density is needed.

Recommended component behavior:

| Text unit                                        | Full mode | Minimal mode                                                |
| ------------------------------------------------ | --------- | ----------------------------------------------------------- |
| Primary title, label, metric, count, button text | Visible   | Visible                                                     |
| Required validation and blocking reason          | Visible   | Visible                                                     |
| Decision/resource costs and impacts              | Visible   | Visible                                                     |
| One-line status or tag metadata                  | Visible   | Visible                                                     |
| Long summary paragraph                           | Visible   | Hidden, clamped, or replaced by concise authored text       |
| Explanatory helper copy                          | Visible   | Hidden unless it prevents an invalid action                 |
| Recap/case-file detail                           | Visible   | Collapsed behind details or reduced to headline + key items |
| Tutorial teaching copy                           | Visible   | Condensed section summaries with an expand path             |

Minimal mode should generally remove whole secondary text units rather than shrinking type until it becomes harder to read.

## Text Source Strategy

Recommended path: **hybrid, led by component-level summaries first, then authored concise fields where the content model needs them**.

### Why Not Purely Authored First?

Authoring a minimal version for every decision, event, tutorial paragraph, and recap line would create a large copy-maintenance surface before the UI contract has proven itself. It would also make #99 too broad for a design/contract issue.

### Why Not Purely Derived?

Automatic truncation or first-sentence extraction is brittle in this game because punchlines, risks, and negations can appear late in the sentence. A derived summary can accidentally hide the part that matters.

### Recommended Hybrid

1. First wave uses component-level summarization:
   - show already-structured fields such as title, group, tags, costs, impacts, severity, source, round, status, and selected count
   - hide or collapse secondary paragraphs in minimal mode
   - keep full text reachable through existing navigation, accordions, `<details>`, or explicit "More" controls where needed
2. Add authored concise fields only to high-repeat content types after the UI proves which fields need them:
   - decisions: optional `shortSummary` or `minimalSummary`
   - events/history entries: optional `shortBody`
   - dossier and recap sections: optional `shortSummary`
3. If an authored concise field is absent, use component fallback:
   - prefer structured metadata over truncation
   - if no structured fallback exists, show the existing full text rather than hiding the only explanation
   - clamping is acceptable as a presentation fallback only when the full text is expandable nearby

This keeps the first implementation small while leaving a clear path for copy refinement.

## High-Pressure Text Surface Inventory

The first pass should focus where long text directly competes with critical gameplay state.

| Priority | Screen/component                                                  | Current pressure                                                                                                                 | Minimal-mode first behavior                                                                                                                                                                          |
| -------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0       | `src/screens/run/RunScreen.tsx` phase header and `PhaseActionBar` | Phase descriptions, validation copy, and action explanations repeat across already constrained run layouts.                      | Keep phase labels, step numbers, selected count, validation status, and action buttons. Hide phase descriptions and action body copy unless validation requires it.                                  |
| P0       | `src/components/board-packet/BoardPacket.tsx`                     | Board title, run summary, memo, briefing signals, and pressure-read bodies stack in the Read phase.                              | Keep board title or a shorter board status, metric summary, and signal titles. Collapse memo body and signal bodies behind expansion or omit when signal titles remain meaningful.                   |
| P0       | `src/components/decision-tray/DecisionTray.tsx`                   | Decision cards combine group, status, tags, title, summary, costs, impact chips, disabled reason, resource ledger, and controls. | Keep selection state, title, group/tags, costs, impact preview, disabled reason, and selected count. Hide card summaries by default unless an authored concise field exists or the card is expanded. |
| P0       | `src/screens/decision-selection/DecisionSelectionScreen.tsx`      | Dedicated choice view adds masthead copy and tray summary before the comparison workload.                                        | Keep round label, page title, return link, tray controls, and selection state. Hide masthead summary and tray summary in minimal mode.                                                               |
| P1       | `src/components/event-feed/EventFeed.tsx`                         | Each feed item can show source, tags, title, body, and cause across ten entries.                                                 | Keep round, source, tags, and title. Collapse body and cause unless expanded or the entry is a blocking/critical system warning.                                                                     |
| P1       | `src/screens/run/EndRoundDialog.tsx` and resolve docket           | Confirmation copy, recovery guidance, selected decisions, and reserve spend appear at the point of irreversible action.          | Preserve irreversible-action wording, selected decision titles, missing count, reserve spend, and action buttons. Shorten recovery prose but never hide why resolution is blocked.                   |
| P1       | `src/components/metrics/MetricRail.tsx`                           | Metric labels and supporting state compete with board/feed panels on narrow layouts.                                             | Keep metric names and values. Hide any descriptive helper copy if added later; use icons/chips only with accessible labels.                                                                          |
| P2       | `src/screens/ending/EndingScreen.tsx` and `endingRecap.ts`        | Case-file recap can become a long post-run document.                                                                             | Keep ending title, subtitle, top metrics, recap headline, and section titles. Collapse section item bodies behind details.                                                                           |
| P2       | `src/screens/tutorial/TutorialScreen.tsx`                         | Tutorial is intentionally explanatory and paragraph-heavy.                                                                       | Keep section titles and step labels, then allow expandable detail. Tutorial can remain mostly full-text until run-critical surfaces are stable.                                                      |
| P2       | `src/screens/options/OptionsScreen.tsx`                           | Option descriptions explain settings but can crowd small screens.                                                                | Keep setting labels and current values. Hide descriptions in minimal mode after the text-density setting itself is understandable.                                                                   |

First-wave implementation should cover the P0 surfaces before adding authored content fields. The rough impact score for sequencing can be:

$$
\text{priority} = \text{decision criticality} + \text{viewport pressure} + \text{copy repetition}
$$

By that measure, run phases, board packet, and decision cards outrank tutorial and post-run recap.

## Coordination With FR-0022 / Issue #98

FR-0022 owns the gameplay sub-tab or route/tab architecture. This contract should remain useful whether #98 lands as local tabs, nested routes, drawers, paged panels, or a hybrid.

Coordination rules:

- Text density belongs to components and content units; sub-tabs own placement and navigation.
- A tab/page should not assume minimal mode is active just because it has less space. It may recommend or render responsive layout changes, but the text mode stays an explicit setting.
- Minimal mode should reduce text inside a tab without changing which tab contains the gameplay fact.
- If #98 splits Read, State, Decisions, Feed, and Resolve into separate sub-tabs, each tab should still apply the same `textDisplayMode` contract to its owned components.
- If #98 changes labels or tab boundaries, this document's first-wave component inventory remains valid because it is organized around reusable surfaces rather than a fixed route tree.
- Shared global context from #98, such as phase status, selected count, and end-round affordances, must always render in both modes.

Implementation order can be independent:

1. #98 may define where panels live.
2. #99-derived work may define how much supporting text each panel renders.
3. The two streams meet at component props, root data attributes, and shared acceptance tests.

## Implementation Phases

### Phase 1: Settings and P0 Surfaces

- Add `textDisplayMode` to `GameSettings`, defaults, normalization, options UI, and provider root dataset.
- Add minimal-mode behavior to `RunScreen`, `BoardPacket`, `DecisionTray`, and `DecisionSelectionScreen`.
- Keep all gameplay-critical state visible.
- Add focused tests for settings persistence and at least one P0 component.

### Phase 2: Feed, Resolve, and Recap Collapsing

- Apply the contract to `EventFeed`, `EndRoundDialog`, resolve docket copy, and `EndingScreen`.
- Add accessible expansion affordances for feed causes and recap details.
- Verify keyboard access, focus order, and screen-reader labels in both modes.

### Phase 3: Optional Authored Concise Fields

- Add optional concise fields to content schemas only after Phase 1 reveals where component-level summaries are insufficient.
- Update validation so concise fields are strings when present, but never required globally.
- Prefer pack-by-pack copy updates rather than a sweeping rewrite.

## Acceptance Checklist For Future Implementation

- Full mode remains visually and semantically equivalent to the existing rich text path unless a separate copy edit is explicitly approved.
- Minimal mode preserves legal moves, costs, status, warnings, and irreversible-action confirmation.
- Existing saves load and default to full text if the new setting is missing.
- `uiDensity` and `textDisplayMode` can be changed independently.
- No AI summarization pipeline is introduced for runtime text.
- Minimal mode is tested on at least phone portrait, tablet portrait, and desktop layouts once implemented.

## Non-Goals

- This contract does not rewrite the whole content library.
- This contract does not replace the FR-0022 sub-tab architecture.
- This contract does not add responsive auto-switching.
- This contract does not remove full text mode.
