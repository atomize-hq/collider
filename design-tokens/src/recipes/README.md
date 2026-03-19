# Component Recipe Source Contract

`design-tokens/src/recipes/**` is the repo-owned source surface for `CT-3` component recipe manifests. Canonical recipe files use the glob `design-tokens/src/recipes/*.recipe.json`.

This directory is limited to source contract publication:

- recipe schema and authoring rules live here,
- validator implementation is added in `S2`,
- generated outputs and typed helpers belong to `SEAM-3`,
- Storybook and app/docs consumption belong to `SEAM-4`.

`CT-3` is versioned independently from `CT-1` tokens. Breaking shape changes require migration notes and downstream validator/consumer updates rather than silent contract drift.

## Ownership Boundary

Keep these concerns in `design-tokens/src/recipes/**`:

- versioned source contract shape,
- component IDs,
- variant axis declarations,
- default selections,
- slot and state naming,
- fallback rules,
- pilot-boundary metadata.

Do not put these concerns in this directory during `S1`:

- validator scripts,
- generated artifacts,
- typed projections,
- Storybook presenters or docs pages,
- runtime CSS or app wiring,
- CI or merge-gate policy.

## Reference Rules

Recipe manifests reference canonical `CT-1` token IDs; they do not redefine scalar values inline.

Token-bearing leaves must be brace-wrapped DTCG-style reference strings:

- Allowed: `{semantic.color.text.primary}`
- Allowed: `{core.color.neutral.500}`
- Disallowed: `#ffffff`
- Disallowed: `rgba(255, 255, 255, 0.1)`
- Disallowed: `var(--token-name)`

`S1` documents only the reference-string shape. Actual token-existence checks and fail-closed validation are added in `S2`.

## Top-Level Contract

The v1 source contract is defined structurally in [schema/recipe.schema.json](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/design-tokens/src/recipes/schema/recipe.schema.json).

| Field           | Required | JSON type | v1 rule                                                                                  |
| --------------- | -------- | --------- | ---------------------------------------------------------------------------------------- |
| `recipeVersion` | yes      | `string`  | Fixed to `"1"`                                                                           |
| `componentId`   | yes      | `string`  | Lowercase kebab-case and filename-stem aligned                                           |
| `variantAxes`   | yes      | `array`   | Array of `{ "name": string, "values": string[] }`                                        |
| `defaults`      | yes      | `object`  | `{ "variants": Record<string, string>, "state": string }`                                |
| `slots`         | yes      | `object`  | Object keyed by slot name; token-bearing leaves are `CT-1` references                    |
| `states`        | yes      | `object`  | Object keyed by state name; token-bearing leaves are `CT-1` references                   |
| `fallbacks`     | yes      | `object`  | `{ "missingVariantBehavior": "use-defaults", "stateFallbacks": Record<string, string> }` |

Additional top-level fields are not allowed in v1.

## V1 Pilot Boundary

The current repo does not yet expose verified primitives under `src/components/system`, so the v1 pilot stays intentionally narrow.

Normative v1 pilot:

- `componentId`: `button`
- Variant axes:
  - `intent=["primary","secondary"]`
  - `size=["sm","md"]`
- Defaults:
  - `intent=primary`
  - `size=md`
  - `state=rest`
- Slots: `root`, `label`, `icon`
- States: `rest`, `hover`, `focus`, `disabled`
- State fallbacks:
  - `hover -> rest`
  - `focus -> rest`
  - `disabled -> rest`
- `missingVariantBehavior`: `use-defaults`

Deferred, non-normative examples:

- `input`
- `card`

These deferred examples must not be treated as committed v1 scope until the repo has concrete primitive surfaces to validate against.

## Valid Review Example

This example is a review aid only. It documents the intended source shape without acting as a fixture or claiming token-existence validation.

```json
{
  "recipeVersion": "1",
  "componentId": "button",
  "variantAxes": [
    {
      "name": "intent",
      "values": ["primary", "secondary"]
    },
    {
      "name": "size",
      "values": ["sm", "md"]
    }
  ],
  "defaults": {
    "variants": {
      "intent": "primary",
      "size": "md"
    },
    "state": "rest"
  },
  "slots": {
    "root": {
      "background": "{semantic.color.background.surface}"
    },
    "label": {
      "text": "{semantic.color.text.primary}"
    },
    "icon": {
      "color": "{semantic.color.text.primary}"
    }
  },
  "states": {
    "rest": {
      "root": {
        "background": "{semantic.color.background.surface}"
      }
    },
    "hover": {
      "root": {
        "background": "{semantic.color.background.elevated}"
      }
    },
    "focus": {
      "root": {
        "background": "{semantic.color.background.overlay}"
      }
    },
    "disabled": {
      "label": {
        "text": "{semantic.color.text.secondary}"
      }
    }
  },
  "fallbacks": {
    "missingVariantBehavior": "use-defaults",
    "stateFallbacks": {
      "hover": "rest",
      "focus": "rest",
      "disabled": "rest"
    }
  }
}
```

## Invalid Review Example

This example is intentionally wrong and exists only to make the boundary explicit during schema review.

```json
{
  "componentId": "Button",
  "variantAxes": [
    {
      "name": "intent",
      "values": ["primary", "secondary"]
    }
  ],
  "defaults": {
    "variants": {
      "intent": "primary"
    },
    "state": "rest"
  },
  "slots": {
    "root": {
      "background": "#ffffff"
    }
  },
  "states": {},
  "fallbacks": {
    "missingVariantBehavior": "guess",
    "stateFallbacks": {}
  },
  "notes": "extra top-level field"
}
```

Why it is invalid:

- `recipeVersion` is missing.
- `componentId` is not lowercase kebab-case.
- `slots.root.background` uses an inline scalar value instead of a `CT-1` reference string.
- `missingVariantBehavior` uses a value outside the v1 contract.
- `notes` is an undocumented extra top-level field.

## Pilot Boundary Registry

[pilot-components.json](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/design-tokens/src/recipes/pilot-components.json) is the machine-readable registry for the v1 pilot boundary. It is not a recipe discovery index and it must not duplicate token-bearing recipe payload data.

## Discovery Index and Downstream Handoff

[index.json](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/design-tokens/src/recipes/index.json) is the canonical discovery entrypoint for normative recipe source files in this directory. It is metadata-only and must stay limited to `schemaVersion`, `recipes`, `componentId`, `sourceFile`, and discovery `status`.

`SEAM-2` owns the recipe source files and this discovery metadata only. `SEAM-3` consumes the source recipe files and may derive typed or generated build artifacts from them. `SEAM-4` renders downstream docs and artifacts from upstream contracts and must not become a second source of recipe truth.

Breaking `CT-3` contract changes require validator updates plus downstream consumer migration work. Do not silently change the source recipe shape or move discovery responsibilities into build or Storybook surfaces.
