# Figma Variables Plan

**Status:** Stage 1 — plan locked, partial implementation (dark mode only)
**Date:** 2026-03-23
**Figma file:** `23PLdynlRYoBYQx9teoC8A`

---

## Current state

The design token pipeline (`design-tokens/src/tokens/`) currently produces a single `:root` block — dark mode only. The runtime CSS (`src/lib/tokens/tokens.css`) reflects this. Figma variables are not yet structured to mirror this system; this document defines the target structure.

---

## Token layer model

```
Core tokens (raw values)
    ↓  reference
Semantic tokens (design intent names)
    ↓  reference
Component / recipe tokens (optional, per-component overrides)
    ↓  outputs
CSS custom properties  ←→  Figma variables
```

Never use core token names in component code. Always reference semantic names. Component tokens are only introduced when a component genuinely needs a value that doesn't map cleanly to a semantic token.

---

## Variable collections

### 1. `Core/Color`

Raw palette values. These are not used directly in component code. They exist as the source-of-truth palette for aliasing.

| Group     | Values present today         |
| --------- | ---------------------------- |
| `neutral` | 300, 500, 800, 850, 900, 950 |
| `green`   | 500, 800                     |
| `red`     | 500, 800                     |
| `blue`    | 500, 800                     |
| `orange`  | 500                          |
| `amber`   | 300                          |
| `violet`  | 500                          |
| `white`   | base, alpha-10, alpha-30     |

**Figma collection name:** `Core/Color`
**Modes:** none (single mode — raw values do not vary by theme)
**CSS prefix:** `--core-color-*`

---

### 2. `Semantic/Color`

Design-intent aliases that reference `Core/Color` values. These are the tokens components use.

| Group         | Tokens                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------- |
| `Background`  | `base`, `surface`, `elevated`, `overlay`, `white-10`                                              |
| `Text`        | `primary`, `secondary`, `tertiary`, `dim`, `success`, `error`, `warning`, `caution`, `info`, `ai` |
| `StatusStrip` | `success`, `failure`, `info`, `running`, `neutral`, `ai`                                          |

**Figma collection name:** `Semantic/Color`
**Modes:** `dark` (current), `light` (planned — see below)
**CSS prefix:** `--semantic-color-*`

---

### 3. `Motion`

Duration and easing values for animations.

| Token            | Value |
| ---------------- | ----- |
| `duration.quick` | 150ms |

**Figma collection name:** `Motion`
**Modes:** single mode
**CSS prefix:** `--motion-*`

---

### 4. `Spacing` — planned, not yet authored

Spacing scale for layout, padding, and gap.

Proposed scale (8-point base):

| Token      | Value |
| ---------- | ----- |
| `space.0`  | 0     |
| `space.1`  | 4px   |
| `space.2`  | 8px   |
| `space.3`  | 12px  |
| `space.4`  | 16px  |
| `space.5`  | 20px  |
| `space.6`  | 24px  |
| `space.8`  | 32px  |
| `space.10` | 40px  |
| `space.12` | 48px  |

**Figma collection name:** `Spacing`
**CSS prefix:** `--space-*`

These should be authored in `design-tokens/src/tokens/spacing.tokens.json` and output as CSS custom properties.

---

### 5. `Radius` — planned, not yet authored

Border-radius scale.

| Token         | Value                               |
| ------------- | ----------------------------------- |
| `radius.none` | 0                                   |
| `radius.sm`   | 2px                                 |
| `radius.md`   | 4px (matches Figma atom radius=3–4) |
| `radius.lg`   | 8px                                 |
| `radius.full` | 9999px                              |

**Figma collection name:** `Radius`
**CSS prefix:** `--radius-*`

---

## Mode strategy

### Dark mode (current)

Single `:root` block. All `--semantic-color-*` vars defined directly. No `@media (prefers-color-scheme)` or `data-theme` switching yet in tokens — Storybook's `data-theme` wrapper is prep for it.

### Light mode (planned)

When light mode is added:

1. Author `design-tokens/src/tokens/themes/light.tokens.json` with light semantic overrides
2. Style Dictionary outputs both a `[data-theme="dark"]` and `[data-theme="light"]` block
3. Root layout sets `data-theme="dark"` by default
4. Storybook toolbar theme switcher toggles `data-theme` on the preview wrapper (already wired in `preview.ts`)
5. Figma variables: `Semantic/Color` collection gains a `light` mode column

---

## Alias strategy

All aliases flow in one direction: `Component → Semantic → Core`. No circular refs.

Good:

```
button.bg.primary  →  semantic.color.background.surface  →  core.color.neutral.900
```

Banned:

```
button.bg.primary  →  core.color.neutral.900  (skips semantic layer)
some.token  →  button.bg.primary  (component token used as semantic alias)
```

---

## Naming parity: CSS ↔ Figma ↔ Tailwind

| Semantic name       | CSS custom property           | Figma variable                       | Tailwind class           |
| ------------------- | ----------------------------- | ------------------------------------ | ------------------------ |
| Background/base     | `--color-background-base`     | `Semantic/Color/Background/base`     | `bg-background-base`     |
| Background/surface  | `--color-background-surface`  | `Semantic/Color/Background/surface`  | `bg-background-surface`  |
| Background/elevated | `--color-background-elevated` | `Semantic/Color/Background/elevated` | `bg-background-elevated` |
| Text/primary        | `--color-text-primary`        | `Semantic/Color/Text/primary`        | `text-text-primary`      |
| Text/secondary      | `--color-text-secondary`      | `Semantic/Color/Text/secondary`      | `text-text-secondary`    |
| Text/ai             | `--color-text-ai`             | `Semantic/Color/Text/ai`             | `text-text-ai`           |
| Text/success        | `--color-text-success`        | `Semantic/Color/Text/success`        | `text-text-success`      |
| Text/error          | `--color-text-error`          | `Semantic/Color/Text/error`          | `text-text-error`        |
| Text/warning        | `--color-text-warning`        | `Semantic/Color/Text/warning`        | `text-text-warning`      |

The `--color-*` surface in `tokens.css` is the legacy-compat alias layer bridging the old naming (`--color-background-base`) to the canonical semantic names (`--semantic-color-background-base`). When all consumers are migrated to the semantic names, the compat layer can be removed. Do not add new `--color-*` aliases — add `--semantic-color-*` instead.

---

## What to do before Wave 1 components

1. Confirm spacing and radius token files are authored (`design-tokens/src/tokens/spacing.tokens.json`, `radius.tokens.json`)
2. Run `pnpm build:tokens` to generate CSS output
3. Extend `tailwind.config.ts` to expose `space-*` and `radius-*` Tailwind utilities via CSS vars
4. Confirm the `Semantic/Color` Figma collection reflects the current dark-mode values
5. Tag Wave 1 component frames in Figma to use variable bindings (not raw hex)
