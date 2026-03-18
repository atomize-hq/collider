# `SEAM-1` — Canonical Token Source

- Name: Canonical Token Source
- Type: domain
- Goal / user value: give designers and engineers one repo-owned source of scalar design values so runtime, Storybook, and Figma stop drifting.

## Scope

- In: DTCG-compatible token files for core, semantic, motion, and theme values; naming taxonomy; token IDs; migration map from the current CSS variable names.
- Out: component variants and states; generated artifacts; Figma sync transport; CI wiring.

## Primary Interfaces (Contracts)

- Inputs: the current hand-authored variables in `src/lib/tokens/tokens.css`; existing runtime consumers that already depend on those names; approved design values from Figma or design references.
- Outputs: canonical token source files under `design-tokens/src/tokens/**/*.tokens.json`; stable token IDs; theme definitions such as `themes/dark.tokens.json`; the single theme registry at `design-tokens/src/tokens/themes/registry.json`; the maintainer-facing authoring policy at `design-tokens/src/tokens/AUTHORING.md`.

## Key Invariants / Rules

- Scalar values only; component recipes do not live in token files.
- `design-tokens/src/tokens/AUTHORING.md` is the concrete file-backed policy for token-file ownership, allowed references, and authoring boundaries.
- Semantic tokens can reference base tokens, but runtime CSS is generated output, not canonical input.
- The current dark theme remains the minimum supported runtime theme through initial cutover.
- Omitted theme selection resolves to `dark`.
- An explicitly unknown theme ID is invalid and must fail validation rather than silently selecting a different additive theme.
- Additive themes may extend one another, but every fallback chain terminates at `dark`.

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
- Theme consumers can resolve omitted theme selection to `dark` and can reject explicitly unknown theme IDs without inventing fallback behavior.

## Risks / Unknowns

- Risk: a token taxonomy or theme model that is too generic or too Figma-shaped will become hard to use in code, recipes, and theme selection.
- De-risk plan: draft the token map from the existing CSS variables first, then normalize names only where the migration path is explicit.

## Rollout / Safety

- Keep the existing CSS import path stable during initial cutover.
- Treat token removals and renames as migration events rather than silent cleanup.
