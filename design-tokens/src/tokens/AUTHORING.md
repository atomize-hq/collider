# Canonical Token Authoring Guide

`design-tokens/src/tokens/**` is the canonical authoring surface for scalar token data under `CT-1`. The files in this directory define the repo-owned token source consumed by downstream seams.

This guide is limited to token authoring boundaries:

- what belongs in each canonical token file,
- which cross-file references are allowed,
- which concerns are explicitly out of scope for token files.

This guide does not define validator behavior, CI enforcement, runtime traceability examples, or rename/removal policy. Use `design-tokens/src/tokens/CHANGE_POLICY.md` for public token-ID and theme-ID change rules. Runtime CSS such as `src/lib/tokens/tokens.css` is generated output, not canonical input. Component recipes belong under `design-tokens/src/recipes/**`, not under `design-tokens/src/tokens/**`.

## Canonical File Ownership

| File                      | Ownership                         | Allowed content                                                                          | Excluded content                                                                   |
| ------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `core.tokens.json`        | Raw scalar primitives             | Base color values and other primitive scalar values that can be reused without UI intent | Component meaning, runtime CSS variable names, theme-selection policy, recipe data |
| `semantic.tokens.json`    | Runtime-facing meaning and intent | Canonical semantic tokens that describe how the UI uses values                           | Raw-value ownership, runtime CSS variable names, recipe data                       |
| `motion.tokens.json`      | Motion primitives                 | Duration, easing, and other motion-specific scalar values                                | Color semantics, recipe/state data, runtime CSS references                         |
| `themes/registry.json`    | Theme registry contract           | Supported theme IDs, default theme, fallback semantics                                   | Theme-owned token values, public token IDs outside registry semantics              |
| `themes/dark.tokens.json` | Required v1 theme values          | Theme-specific values for existing canonical token paths under theme ID `dark`           | New public family prefixes, undeclared theme IDs, recipe data                      |

## File-Boundary Rules

### `core.tokens.json`

- Owns raw values only.
- Must not encode component meaning, runtime variable names, theme-selection policy, or recipe data.
- Must not reference `semantic`, `motion`, theme registry entries, runtime CSS, or recipes.

Example:

```json
{
  "color": {
    "neutral": {
      "950": {
        "$value": "#171717",
        "$type": "color"
      }
    }
  }
}
```

Canonical token ID: `core.color.neutral.950`

### `semantic.tokens.json`

- Owns runtime-facing meaning and intent.
- May reference `core` tokens by DTCG reference string.
- Must not reference runtime CSS variables or recipe manifests.
- Must not become a second source of raw scalar ownership.

Example:

```json
{
  "color": {
    "text": {
      "secondary": {
        "$value": "{core.color.neutral.500}",
        "$type": "color"
      }
    }
  }
}
```

Canonical token ID: `semantic.color.text.secondary`

Allowed reference: `{core.color.neutral.500}`

### `motion.tokens.json`

- Owns motion values only.
- Must not introduce color semantics, recipe/state data, or runtime CSS references.
- This guide does not use the current motion file to introduce fresh taxonomy decisions; it only establishes file ownership and scalar-only scope.

Example from the current file:

```json
{
  "placeholder": {
    "durationQuick": {
      "$value": "150ms",
      "$type": "duration"
    }
  }
}
```

This entry belongs in `motion.tokens.json` because it is a scalar motion value. It does not authorize new naming or taxonomy decisions beyond motion ownership.

### `themes/registry.json` and `themes/<theme>.tokens.json`

- `themes/registry.json` is the only source of truth for supported theme IDs, default theme selection, and fallback semantics.
- Theme files must use a registry-declared theme ID.
- Theme files must not create a fourth public family prefix. Public token IDs remain `core`, `semantic`, or `motion`.
- Theme files may publish theme-specific values for existing canonical token paths.
- Theme files must not invent new public IDs or declare theme IDs outside `themes/registry.json`.

Example from `themes/dark.tokens.json`:

```json
{
  "$extensions": {
    "com.atomizehq.collider": {
      "themeId": "dark"
    }
  },
  "semantic": {
    "color": {
      "text": {
        "secondary": {
          "$value": "{core.color.neutral.500}",
          "$type": "color"
        }
      }
    }
  }
}
```

This example is theme-owned because it publishes a theme-specific semantic value tied to theme ID `dark`, which must also exist in `themes/registry.json`.

## Reference Matrix

| Source file                  | Allowed references                                                    | Prohibited references                                              |
| ---------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `core.tokens.json`           | None                                                                  | `semantic`, `motion`, `themes/registry.json`, runtime CSS, recipes |
| `semantic.tokens.json`       | `core` via DTCG reference strings                                     | runtime CSS, recipes, theme registry declarations                  |
| `motion.tokens.json`         | None for v1 guidance beyond self-owned scalar motion values           | runtime CSS, recipes, color semantics                              |
| `themes/<theme>.tokens.json` | Existing canonical token paths and canonical core values where needed | new public IDs, undeclared theme IDs, recipe manifests             |

## Explicit Exclusions

Token files must not contain or define:

- component IDs,
- slot names,
- variant definitions,
- state matrices,
- recipe-only defaults or fallbacks,
- runtime CSS variable names as source identifiers,
- generated artifact paths as authoring inputs.

When a maintainer needs recipe modeling, runtime traceability, or change-control guidance, they should use the seam-owned docs for those concerns instead of expanding token files beyond scalar canonical data.
