# `SEAM-1` — Canonical Token Source

- Name: Canonical Token Source
- Type: domain
- Goal / user value: give designers and engineers one repo-owned source of scalar design values so runtime, Storybook, and Figma stop drifting.

## Scope

- In: DTCG-compatible token files for core, semantic, motion, and theme values; naming taxonomy; token IDs; migration map from the current CSS variable names.
- Out: component variants and states; generated artifacts; Figma sync transport; CI wiring.

## Primary Interfaces (Contracts)

- Inputs: the current hand-authored variables in `src/lib/tokens/tokens.css`; existing runtime consumers that already depend on those names; approved design values from Figma or design references.
- Outputs: canonical token source files under `design-tokens/src/tokens/**/*.tokens.json`; stable token IDs; theme definitions such as `themes/dark.tokens.json`.

## Key Invariants / Rules

- Scalar values only; component recipes do not live in token files.
- Semantic tokens can reference base tokens, but runtime CSS is generated output, not canonical input.
- The current dark theme remains the minimum supported runtime theme through initial cutover.

## Dependencies

- Blocks: `SEAM-2`, `SEAM-3`, `SEAM-5`
- Blocked by: none

## Touch Surface

- `design-tokens/src/tokens/**`
- `src/lib/tokens/tokens.css`
- `src/app/globals.css`

## Verification

- Token files validate against the chosen schema and naming rules.
- Generated CSS covers the currently consumed variables or supplies an explicit migration alias map.
- A maintainer can trace any runtime variable back to one canonical token ID.

## Risks / Unknowns

- Risk: a token taxonomy that is too generic or too Figma-shaped will become hard to use in code and recipes.
- De-risk plan: draft the token map from the existing CSS variables first, then normalize names only where the migration path is explicit.

## Rollout / Safety

- Keep the existing CSS import path stable during initial cutover.
- Treat token removals and renames as migration events rather than silent cleanup.
