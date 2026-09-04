# `SEAM-2` — Component Recipe Manifest

- Name: Component Recipe Manifest
- Type: capability
- Goal / user value: separate component-level variant and state contracts from scalar token values so component behavior can be documented, validated, and consumed consistently.

## Scope

- In: recipe schema; component IDs; variant axes; state mappings; slot token references; a minimal pilot set of component recipes.
- Out: the full component-library rollout; generated runtime CSS; Figma transport; CI orchestration.

## Primary Interfaces (Contracts)

- Inputs: stable token IDs from `SEAM-1`; component metadata from Storybook stories or design-system docs; validation precedent from `scripts/validate-component-loop.mjs`.
- Outputs: recipe files under `design-tokens/src/recipes/*.recipe.json`; schema validators for recipe shape and token references. Any later typed helper derived from recipes is a downstream `SEAM-3` build artifact, not a separate seam-owned output here.

## Key Invariants / Rules

- Recipes reference tokens; they do not redefine scalar values inline.
- The v1 recipe set is intentionally small and representative, not exhaustive.
- Slot and state names must be stable enough to survive Storybook and Figma documentation.

## Dependencies

- Blocks: `SEAM-3`, `SEAM-4`, `SEAM-6`
- Blocked by: `SEAM-1`

## Touch Surface

- `design-tokens/src/recipes/**`
- `scripts/validate-component-loop.mjs`
- `storybook/**`

## Verification

- Recipe files validate structurally and fail when they reference missing token IDs.
- At least one pilot component can be described entirely through recipe metadata without inventing extra ad hoc config.
- Storybook or another docs surface can render the pilot recipe shape for inspection by consuming the source contract directly or a downstream `SEAM-3` artifact, never a second seam-owned output from `SEAM-2`.

## Risks / Unknowns

- Risk: the repo does not yet expose an obvious mature component set, so recipe scope could overreach or become speculative.
- De-risk plan: pick a tiny pilot set and refuse to generalize beyond what the repo can currently verify.

## Rollout / Safety

- Keep recipes additive until the pilot model is stable.
- Avoid making recipe validation a hard merge gate until at least one runtime consumer or docs consumer exists.
