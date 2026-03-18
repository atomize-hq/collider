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

## Artifact Lifecycle (v1)

- `design-tokens/src/**` is the only editable source of truth for tokens and recipes.
- `design-tokens/dist/**` and `src/lib/tokens/tokens.css` are generated, committed artifacts produced by `pnpm build:tokens`.
- Local work runs `pnpm validate:tokens` before `pnpm build:tokens`; a successful build refreshes committed artifacts in place.
- Governance and CI rerun validation and build, then fail if committed generated artifacts are missing, stale, or hand-edited outside the build path.

## Key Invariants / Rules

- Build outputs are deterministic and reproducible locally and in CI.
- Generated files are not hand-edited.
- Runtime CSS remains the lowest-friction consumption artifact for the current Next.js and Storybook setup.
- The committed artifact set is reviewable in git; artifact freshness is enforced by rebuilding, not by treating `dist/**` as an ignored cache.

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
- Re-running validation and build in CI surfaces missing or stale committed artifacts as failures before downstream consumption seams proceed.

## Risks / Unknowns

- Risk: output layout becomes awkward if the repo later adopts workspaces or publishes a package.
- De-risk plan: keep build entry points stable and isolate path decisions behind commands rather than hard-coding them across the app.

## Rollout / Safety

- Land the build behind additive scripts first.
- Switch the runtime CSS file to generated mode only after parity with the current tokens is proven.
- Treat committed artifact diffs as normal review surface, not as optional byproducts.
