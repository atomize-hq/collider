# Code Connect Bootstrap

## Status

`toolchain-installed, thinking-indicator-mapped`

This file is the Stage 1 Code Connect bootstrap readiness artifact. It declares the strategy and conventions that Stage 1, Stage 2, and Sync QG follow when creating and maintaining Code Connect mappings.

---

## Strategy: Repo-Managed Mapping and Figma Surfaces

**Approach:** repo-managed mapping files plus the repo-owned Figma plugin, figma-use, and Figma MCP. External Code Connect UI/CLI is optional and account-tier dependent, not the baseline operational path.

Mapping files (`.figma.tsx`) live alongside React components in `src/components/` and are committed to the repo. Changes are reviewed in PRs; rollbacks are git operations.

**Why this approach:** The CT-11B JSON system already version-controls `figma/code-connect/<component>.json` alongside code. The `.figma.tsx` files extend this pattern naturally.

**Config:** `figma.config.json` at repo root is the toolchain declaration (includes glob, Storybook URL, parser).

---

## CT-11B JSON vs Native `.figma.tsx`

These are complementary, not duplicates:

| File           | Location                                   | Purpose                                                                                          |
| -------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| CT-11B record  | `figma/code-connect/<name>.json`           | Repo governance record: Figma component ref, supported variants, story links, promotion tracking |
| Native mapping | `src/components/<subdir>/<name>.figma.tsx` | What `figma connect publish` pushes to Figma Dev Mode (code snippet previews for designers)      |

**The relationship:** CT-11B drives governance and Sync QG drift detection. `.figma.tsx` drives what Figma shows in Dev Mode. Both are required for a complete component.

---

## Canonical Figma File Key

**`SVcsU6gVvpezsJYrvBsS3V`** is the authoritative Figma file key for this project.

This key is already used consistently in `src/figma/sync-ledger.json`, `figma/code-connect/button.json`, and `storybook/component-specs/button.json`. All `.figma.tsx` node URLs must use this key. The format for Figma node URLs in `.figma.tsx` files is:

```
https://www.figma.com/design/SVcsU6gVvpezsJYrvBsS3V?node-id=<nodeId>
```

---

## Component Priority

Map in this order:

1. **thinking-indicator** (tier: primitive) — the first component with a complete CT-11B record and live Storybook contract. `.figma.tsx` lives at `src/components/ai-elements/ThinkingIndicator.figma.tsx`.

Follow the same pattern for all subsequent components, in tier order: primitives → interactive → workflow.

---

## Pattern for Creating `.figma.tsx` Files

Create a `.figma.tsx` file alongside each React component when it is implemented:

```
src/components/<subdir>/<Name>.tsx         ← React component
src/components/<subdir>/<name>.figma.tsx   ← Code Connect mapping
```

Each `.figma.tsx` file must:

- Import `figma` from `@figma/code-connect`
- Import the React component from its local path
- Call `figma.connect(<Component>, '<figma-node-url>', { props: { ... } })`
- Map props to Figma variant property names declared in the CT-11B record's `supportedVariants`
- Stay under the 200-line TSX LOC limit (typical mapping: 30–60 lines)

**Example shape:**

```tsx
import figma from '@figma/code-connect';
import { Button } from './Button';

figma.connect(Button, 'https://www.figma.com/design/<fileKey>?node-id=<nodeId>', {
  props: {
    variant: figma.enum('Variant', {
      primary: 'primary',
      secondary: 'secondary',
    }),
    disabled: figma.boolean('Disabled'),
    label: figma.string('Label'),
  },
  example: ({ variant, disabled, label }) => (
    <Button variant={variant} disabled={disabled}>
      {label}
    </Button>
  ),
});
```

---

## Auth Requirements

- `FIGMA_ACCESS_TOKEN` is required for `figma:connect:publish` when using the external Code Connect publish CLI. Obtain from Figma → Account Settings → Personal Access Tokens (scopes: `File content: read`, `Code Connect: write`). Never commit.
- `figma:connect:validate` is optional and environment-dependent. Do not make it a baseline gate for plugin-rail workflows.

---

## npm Script Reference

| Script                        | Network | Token Required | Purpose                                                                      |
| ----------------------------- | ------- | -------------- | ---------------------------------------------------------------------------- |
| `pnpm figma:connect:validate` | Depends | Optional       | Optional Code Connect CLI check; do not require it for plugin-rail workflows |
| `pnpm figma:connect:publish`  | Yes     | Yes            | Publish code snippet previews to Figma Dev Mode                              |

Neither script is wired into `just check` or `just preflight`. Treat `figma:connect:validate` as an optional local check, not a required gate.

---

## Sync QG Checklist

For each component with a React implementation, Sync QG checks:

1. CT-11B record exists at `figma/code-connect/<name>.json`
2. `.figma.tsx` file exists at `src/components/<subdir>/<name>.figma.tsx`
3. Props and variant names in `.figma.tsx` match `supportedVariants` in the CT-11B record
4. Figma node URL in `.figma.tsx` is still valid and matches CT-11B `figmaComponentRef`
