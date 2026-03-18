# `SEAM-3` — Token Build and Distribution

- Name: Token Build and Distribution
- Type: integration
- Goal / user value: turn canonical token and recipe JSON into deterministic artifacts that the app, Storybook, and Figma can consume without manual copying.

## Scope

- In: Style Dictionary configuration; `@tokens-studio/sd-transforms`; build and validate commands; output path definitions; freshness checks for generated artifacts.
- Out: runtime adoption details inside app components; Figma workflow policy; merge-gate policy.

## Primary Interfaces (Contracts)

- Inputs: `design-tokens/src/tokens/**/*.tokens.json`; `design-tokens/src/recipes/*.recipe.json`.
- Outputs: `pnpm validate:tokens`; `pnpm build:tokens`; generated runtime CSS at `src/lib/tokens/tokens.css`; generated typed output under `design-tokens/dist/tokens.ts`; generated Figma export under `design-tokens/dist/figma/tokens.json`.

## Key Invariants / Rules

- Build outputs are deterministic and reproducible locally and in CI.
- Generated files are not hand-edited.
- Runtime CSS remains the lowest-friction consumption artifact for the current Next.js and Storybook setup.

## Dependencies

- Blocks: `SEAM-4`, `SEAM-5`, `SEAM-6`
- Blocked by: `SEAM-1`, `SEAM-2`

## Touch Surface

- `design-tokens/build/**`
- `design-tokens/dist/**`
- `src/lib/tokens/tokens.css`
- `package.json`
- `scripts/**`

## Verification

- Running the token build twice without source changes yields no diff.
- The generated CSS can replace the current hand-authored file without breaking existing imports.
- The Figma export artifact is stable enough for the chosen sync transport.

## Risks / Unknowns

- Risk: output layout becomes awkward if the repo later adopts workspaces or publishes a package.
- De-risk plan: keep build entry points stable and isolate path decisions behind commands rather than hard-coding them across the app.

## Rollout / Safety

- Land the build behind additive scripts first.
- Switch the runtime CSS file to generated mode only after parity with the current tokens is proven.
