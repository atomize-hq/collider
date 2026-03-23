# Storybook Baseline

**Status:** Stage 1 — baseline locked
**Date:** 2026-03-23

See also: `.storybook/storybook-version-policy.json` for the machine-readable version pin.

---

## Version policy

| Concern                | Decision                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Framework              | `@storybook/nextjs-vite`                                                                                           |
| Locked version         | `10.2.19`                                                                                                          |
| Upgrade policy         | Explicit version bump + `pnpm validate:storybook-policy` re-run; never implicit                                    |
| Legacy packages banned | `@storybook/addon-interactions`, `@storybook/experimental-addon-test`, `@storybook/test-runner`, `@storybook/test` |
| Modern import paths    | `storybook/test`, `storybook/preview-api`, `storybook/actions`                                                     |

Do not add Storybook packages from outside the locked version line without a deliberate upgrade decision documented in this file.

---

## Required addons

| Addon                      | Purpose                                        |
| -------------------------- | ---------------------------------------------- |
| `@storybook/addon-vitest`  | Browser-mode story tests via Vitest            |
| `@storybook/addon-a11y`    | Accessibility panel + WCAG violation reporting |
| `@storybook/addon-designs` | Figma frame embeds per story                   |
| `@chromatic-com/storybook` | Visual snapshot review + Chromatic integration |

---

## Story file conventions

| Concern                                | Convention                                                   |
| -------------------------------------- | ------------------------------------------------------------ |
| File extension                         | `.stories.tsx` only (never `.js`, `.jsx`)                    |
| Location (component stories)           | `src/components/<subdir>/<Name>.stories.tsx`                 |
| Location (foundation/contract stories) | `storybook/stories/**/*.stories.tsx`                         |
| Default export                         | `Meta` typed with the component                              |
| Story exports                          | Named exports typed as `StoryObj`                            |
| Story naming                           | PascalCase names (`Default`, `WithStreaming`, `StateMatrix`) |
| Tags                                   | Use `tags: ['autodocs']` on `Meta` for public components     |

---

## Provider / decorator strategy

### Current global decorator (`.storybook/preview.ts`)

Wraps every story in a `data-theme` div with background color set to `--color-background-base`. Theme is driven by the Storybook toolbar `theme` global.

```ts
// pattern already in preview.ts
decorators: [
  (Story, context) => {
    const theme = context.globals['theme'] ?? storybookDefaultThemeId;
    return <div data-theme={theme} style={{ background: 'var(--color-background-base)' }}>
      <Story />
    </div>;
  }
]
```

Do not remove this decorator. All components must be visually correct within it.

### Tauri bridge mock decorator

Add a `withBridgeMock` decorator to `preview.ts` when the first bridge-dependent component is added. Pattern:

```ts
// src/bridge/__mocks__/index.ts  ← mock module
// .storybook/preview.ts          ← import and register

decorators: [withBridgeMock, withTheme],
```

The mock module should export all bridge functions as vi.fn() stubs with sensible defaults. Stories can override per-story with `parameters.bridgeMocks`.

---

## Tauri bridge mock strategy

- Every story that involves a component calling a Tauri command must use the bridge mock.
- Use `vi.mock('@/bridge/...')` or a `parameters.bridgeMocks` pattern — decide on one convention when the first bridge component lands and document it here.
- No story should fail with "Tauri not available" — that is a test environment error, not a UI state.

---

## Async / network mock strategy

- Use `msw` (Mock Service Worker) if HTTP mocking is needed. Add `msw-storybook-addon` only if HTTP-based stories are genuinely required.
- Prefer passing data via story args/props over network mocking where possible.
- For streaming states (e.g., `ThinkingIndicator`, `MessageRow` in streaming mode): use story-level `play` functions with Vitest's fake timers, or drive state via a controlled arg.

---

## Interaction / workflow story strategy

Workflow stories use the `play` function (Storybook/Vitest interaction testing):

```ts
export const SendMessage: StoryObj<typeof Composer> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox'), 'Hello');
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByText('Hello')).toBeInTheDocument();
  },
};
```

Use `play` for workflow-tier components and for verifying interactive behavior. Do not use `play` for purely visual state verification — use variant/state matrix stories instead.

---

## Accessibility gate

Every interactive or workflow-tier component must:

1. Have an `@storybook/addon-a11y` panel that shows zero violations on the `default` story.
2. If violations exist, they must be explicitly disabled with a documented reason in story parameters.

Run a11y checks as part of `pnpm test:storybook`.

---

## Visual review / Chromatic policy

- Chromatic is configured via `@chromatic-com/storybook`. App ID: `69b96940ff7216b1df881d31`.
- Snapshots are taken for all stories without `chromatic: { disableSnapshot: true }`.
- Chromatic CI runs on PR. Unreviewed visual changes block merge.
- Chromatic review artifacts live in `artifacts/chromatic/`.

---

## Docs / autodocs policy

- Use `tags: ['autodocs']` on Meta for all design-system components.
- Autodocs generates the API table from controls/props. Keep prop types clean and documented with JSDoc.
- Do not write manual MDX docs unless there is a compelling reason — autodocs is the baseline.

---

## Controls policy

- All meaningful public props should appear as controls.
- Use `argTypes` to provide explicit labels, descriptions, or constrained options where TypeScript inference is insufficient.
- Sort controls: `sort: 'requiredFirst'` in `preview.ts`.

---

## Figma design link policy

Every design-system component story must embed a Figma link via `@storybook/addon-designs`:

```ts
parameters: {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/design/23PLdynlRYoBYQx9teoC8A?node-id=<nodeId>',
  },
},
```

This is the durable link between the Storybook story and the Figma library component. It is required before a component can be considered Code Connect-ready.

---

## Motion story policy

Add a motion story when:

- The component has an animation or transition that materially affects perceived UX
- The transition has a duration > 0ms or involves layout shifts

Motion stories should:

- Use the `play` function to trigger the transition
- Disable Chromatic snapshot on the in-flight frame (`chromatic: { pauseAnimationAtEnd: true }`)
- Verify the end state with assertions

Motion is optional for Wave 1 components except `ThinkingIndicator` (which is entirely about motion).
