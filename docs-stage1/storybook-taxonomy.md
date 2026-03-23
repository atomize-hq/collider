# Storybook Story Taxonomy

**Status:** Stage 1 — taxonomy locked
**Date:** 2026-03-23

This document defines what each story kind means, when it is required, and what it must demonstrate. It supplements `storybook/component-tier-policy.json`, which specifies required kinds per tier.

---

## Story kind reference

### `default`

**Required for:** all tiers (primitive, interactive, workflow)

The canonical happy-path rendering of the component. Shows the most common usage with representative props. This is the story Chromatic snapshots as the baseline and the one Sync QG checks first.

Rules:

- Must render without errors in the Storybook browser environment
- Must pass a11y scan with zero violations (or violations explicitly disabled with reason)
- Must have a Figma design link in `parameters.design` when the component is in the design system
- Args must represent the real default prop values (no workarounds or overrides to make it "look good")

---

### `variant-matrix`

**Required for:** components with more than one public variant axis

Renders all meaningful combinations of variant props in a single story, usually in a grid layout. Lets reviewers see the full variant surface at once.

Rules:

- Cover all public variant props, not internal/implementation props
- Group by primary axis, secondary axis as columns
- Each cell must be individually readable (sufficient spacing)
- Chromatic snapshots this story for visual regression on the full variant surface

---

### `state-matrix`

**Required for:** interactive and workflow tiers; optional for primitive

Renders all meaningful interactive states: default, hover, focus, active, disabled, error, loading, etc. May use static prop overrides to force states that are normally interaction-driven.

Rules:

- Label each state clearly (either as story name or as a visual label in the story)
- Include both keyboard-focus and pointer-hover states where CSS distinction exists
- Disabled states must visually distinguish from default

---

### `actions`

**Required for:** components that emit events (onClick, onChange, onSubmit, etc.)

Demonstrates that events are wired correctly. Uses the `fn()` utility from `storybook/test` to capture and display calls in the Actions panel.

Rules:

- Every public callback prop must be represented
- The story must make it easy to trigger each callback (e.g., a button to click, a field to type in)
- Use `argTypes.onXxx.action` or explicit `fn()` assignment

---

### `controlled`

**Required for:** components that can be used in controlled mode (value + onChange pair)

Shows a parent-controlled usage where the story manages the state and passes it down. Demonstrates that the component works as a controlled input.

Rules:

- Use a `useArgs` hook or a story wrapper component to hold the controlled state
- Show the current value in the story so reviewers can confirm the control loop works

---

### `keyboard`

**Required for:** interactive and workflow tiers

Demonstrates keyboard accessibility — focus, navigation, activation, and escape paths.

Rules:

- Use a `play` function to drive keyboard interactions
- Assert that focus moves as expected
- Assert that Enter/Space activates the component where applicable
- Assert that Escape dismisses or returns focus where applicable

---

### `focus`

**Required for:** interactive and workflow tiers

Demonstrates the focus ring visual — that a meaningful focus indicator is present and visible.

Rules:

- Use a `play` function to programmatically focus the component
- Snapshot this state via Chromatic (do not disable snapshot on this story)
- The focus ring must be visible against both dark and light backgrounds

---

### `workflow`

**Required for:** workflow tier; optional but valuable for interactive tier

A multi-step user flow that exercises the component's complete behavior arc. Think of it as a mini acceptance test embedded in Storybook.

Rules:

- Use a `play` function to simulate user actions step by step
- Include at least one assertion between steps to verify intermediate state
- The story name should describe the flow, not the component (e.g., `SendMessageFlow`, not `Workflow`)

---

### `motion`

**Required for:** components where animation or transition materially affects UX

Demonstrates the animated transition in isolation so it can be reviewed without the surrounding app context.

Rules:

- Use `play` to trigger the animation
- Use `chromatic: { pauseAnimationAtEnd: true }` so the snapshot captures the final state
- Name the story to describe the transition (e.g., `AppearAnimation`, `CollapseTransition`)

---

### `async`

**Required for:** components that render different UI while waiting for data or a bridge response

Demonstrates loading, error, and settled states driven by mocked async behavior.

Rules:

- Use mock data providers or `parameters.bridgeMocks` to simulate async states
- Cover: loading/pending, success/settled, error/failed
- No story should actually make network or Tauri calls

---

### `responsive`

**Optional for:** components with meaningful breakpoint or container-query behavior

Demonstrates layout changes at different viewport widths.

Rules:

- Use Storybook viewport addon or explicit container sizing in the story
- Name viewports clearly (e.g., `NarrowViewport`, `WideViewport`)

---

### `composition`

**Optional for:** components that are commonly composed with other components

Shows the component in a realistic composed context — e.g., a MessageRow inside a thread list, a CodeBlock inside a MessageRow.

Rules:

- Composition stories are illustrative, not the canonical story surface
- Do not use them as substitutes for required story kinds — they are additive
- Components used in the composition must already have their own stories

---

### `docs`

**Required for:** all tiers

The autodocs-powered documentation page. Not a hand-authored MDX page — this is the `autodocs` tag enabling automatic prop table + story embeds.

Rules:

- `tags: ['autodocs']` must be in the component's `Meta`
- Props must have meaningful TypeScript types (no `any`)
- Key props should have JSDoc descriptions
- At least the `default` story must be embeddable in the docs page

---

## Tier requirements summary

| Kind             | primitive | interactive | workflow |
| ---------------- | --------- | ----------- | -------- |
| `default`        | required  | required    | required |
| `docs`           | required  | required    | required |
| `state-matrix`   | optional  | required    | required |
| `focus`          | optional  | required    | required |
| `keyboard`       | optional  | required    | required |
| `workflow`       | optional  | optional    | required |
| `variant-matrix` | optional  | optional    | optional |
| `actions`        | optional  | optional    | optional |
| `controlled`     | optional  | optional    | optional |
| `motion`         | optional  | optional    | optional |
| `async`          | optional  | optional    | optional |
| `responsive`     | optional  | optional    | optional |
| `composition`    | optional  | optional    | optional |

Source of truth: `storybook/component-tier-policy.json` (machine-readable version of the above).

---

## Story ID and inventory registration

Every story must be registered in `storybook/story-inventory.json` before a component is considered proof-complete. The story inventory is validated by `pnpm validate:storybook-story-inventory`. Format:

```json
{
  "componentId": "message-row",
  "validatorKinds": ["default", "variant-matrix", "docs"],
  "implementedStoryRefs": [
    { "kind": "default", "storyId": "ai-elements-message-row--default" },
    { "kind": "variant-matrix", "storyId": "ai-elements-message-row--variant-matrix" },
    { "kind": "docs", "storyId": "ai-elements-message-row--docs" }
  ]
}
```
