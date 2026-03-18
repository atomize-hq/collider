### S3a — Pilot Button Recipe

- **User/system value**: the seam proves `CT-3` on one real component so downstream consumers inherit a normative recipe artifact instead of a purely theoretical contract.
- **Scope (in/out)**:
  - In: `design-tokens/src/recipes/button.recipe.json`; concrete encoding of pilot axes, defaults, slots, states, and fallback order; direct validation against the dedicated recipe validator.
  - Out: recipe discovery metadata; README migration notes; generated outputs; Storybook rendering; CI gating.
- **Acceptance criteria**:
  - `button.recipe.json` validates against the `CT-3` schema with no inline scalar token values.
  - The recipe models only the agreed pilot boundary: `button`, `intent`, `size`, `rest`, `hover`, `focus`, `disabled`, `root`, `label`, and `icon`.
  - Fallback precedence is explicit in the recipe so downstream seams do not infer ordering.
- **Dependencies**:
  - `SEAM-1`
  - `CT-1`
  - `S1`
  - `S2`
- **Verification**:
  - Run `node scripts/validate-component-recipe.mjs design-tokens/src/recipes/button.recipe.json`.
  - Review the recipe file alone and confirm it is sufficient to understand the pilot contract without sidecar config.
- **Rollout/safety**:
  - If the pilot needs a field not already defined in `S1`, stop and tighten `CT-3` first rather than introducing one-off shape here.
  - Keep the recipe additive and v1-scoped so downstream seams can adopt it incrementally.

#### S3.T1 — Author the pilot `button` recipe

- **Outcome**: `design-tokens/src/recipes/button.recipe.json` becomes the first real, validated instance of the recipe contract.
- **Files**:
  - `design-tokens/src/recipes/button.recipe.json`
  - `design-tokens/src/recipes/schema/recipe.schema.json`
  - `design-tokens/src/recipes/pilot-components.json`
  - `scripts/validate-component-recipe.mjs`

Checklist:

- Implement:
  - Author `button.recipe.json` for exactly one component: `button`.
  - Encode `intent` and `size` as the only variant axes.
  - Encode `rest`, `hover`, `focus`, and `disabled` as the only states.
  - Encode `root`, `label`, and `icon` as the only slots.
  - Encode fallback precedence explicitly inside the recipe payload.
- Test:
  - Validate the pilot file directly with `scripts/validate-component-recipe.mjs`.
  - Confirm the validator output is clean and deterministic for this file.
- Validate:
  - Confirm every token-bearing field is a `CT-1` reference string.
  - Confirm no extra config file is required to interpret the pilot recipe.
- Cleanup:
  - Remove any field that duplicates scalar token values.
  - Remove any Storybook-only labels or downstream-derived metadata from the recipe.
