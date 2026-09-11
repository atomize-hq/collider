# Canonical Token Authoring Guide

`design-tokens/src/tokens/**` is the canonical scalar-token source. The source loader
reads every `<family>.tokens.json` file, validates its filename-derived family, and
builds canonical IDs from that family plus the nested object path. This guide records
the current file contract; it does not replace the validator or authorize a taxonomy
change.

## Current file ownership

| Family file                                                                                                     | Current domain                                      |
| --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `accent.tokens.json`, `core.tokens.json`, `semantic.tokens.json`                                                | Color primitives, accents, and runtime-facing roles |
| `type.tokens.json`, `font.tokens.json`                                                                          | Typography families and font declarations           |
| `spacing.tokens.json`, `radius.tokens.json`, `shape.tokens.json`, `layout.tokens.json`, `elevation.tokens.json` | Space, geometry, layout, and elevation values/roles |
| `motion.tokens.json`                                                                                            | Duration, easing, and motion roles                  |
| `tailwind-colors.tokens.json`, `tailwind-variables.tokens.json`                                                 | Tailwind compatibility inputs                       |

`themes/registry.json` is the theme registry contract. A theme file can override an
existing canonical path for its declared theme; it does not create a new unreviewed
family. Use `CHANGE_POLICY.md` for rename/removal and theme-ID changes.

## Placement and references

- Put scalar data in the existing filename-derived family that owns its domain. Do
  not collapse valid files into `core`, `semantic`, or `motion` solely to satisfy
  historical documentation.
- Every leaf needs the DTCG type/value shape accepted by the source validator. Use
  the existing family style as the local example.
- A `{family.path}` reference must resolve to a declared canonical token ID. The
  validator checks declared references, including references retained by theme
  overrides; do not substitute runtime CSS variables or guessed paths.
- Runtime CSS names, generated artifact paths, component recipes, slot names,
  variants, and state matrices are not token-source identifiers.

## Current motion examples

`motion.tokens.json` currently owns real duration, easing, and role data:

```json
{
  "duration": { "instant": { "$value": "80ms", "$type": "duration" } },
  "role": {
    "hover": {
      "duration": { "$value": "{motion.duration.instant}", "$type": "duration" },
      "easing": { "$value": "{motion.easing.out}", "$type": "string" }
    }
  }
}
```

These are current examples, not a new naming decision. The canonical IDs include
`motion.duration.instant`, `motion.easing.out`, and `motion.role.hover.duration`.

## Exclusions

Token files must not become source for component IDs, slot names, variant definitions,
state matrices, recipe-only defaults/fallbacks, runtime CSS variable names, or
generated artifact paths. Put recipe modeling under `design-tokens/src/recipes/**` and
consult seam-owned docs for runtime traceability.
