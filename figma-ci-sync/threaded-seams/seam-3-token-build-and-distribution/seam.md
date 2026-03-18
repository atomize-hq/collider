### Seam Brief (Restated)

- **Seam ID**: `SEAM-3`
- **Name**: Token Build and Distribution
- **Goal / value**: turn canonical token and recipe JSON into deterministic artifacts that the app, Storybook, and Figma can consume without manual copying or hand-maintained drift.
- **Type**: integration
- **Scope**
  - In: `design-tokens/build/**`; seam-owned validation and build CLIs; stable output path definitions; generated artifacts under `design-tokens/dist/**`; generated runtime CSS at `src/lib/tokens/tokens.css`; additive `package.json` command exposure for `pnpm validate:tokens` and `pnpm build:tokens`.
  - Out: token taxonomy decisions in `SEAM-1`; recipe authoring/modeling in `SEAM-2`; runtime and Storybook adoption details in `SEAM-4`; Figma sync policy in `SEAM-5`; `justfile`, CI, and merge-gate enforcement in `SEAM-6`.
- **Touch surface**: `design-tokens/build/**`, `design-tokens/dist/**`, `src/lib/tokens/tokens.css`, `package.json`, `scripts/**`
- **Verification**: `pnpm validate:tokens` fails closed on malformed tokens/recipes; `pnpm build:tokens` produces stable outputs with no diff on a second run; generated `src/lib/tokens/tokens.css` preserves the current runtime import path; `design-tokens/dist/figma/tokens.json` is stable enough for downstream sync validation.
- **Threading constraints**
  - Upstream blockers: `SEAM-1` via `CT-1` and `CT-2`; `SEAM-2` via `CT-3`
  - Downstream blocked seams: `SEAM-4`, `SEAM-5`, `SEAM-6`
  - Contracts produced (owned): `CT-4`, `CT-5`, `CT-6`
  - Contracts consumed: `CT-1`, `CT-2`, `CT-3`

### Slice index

- `S1` → `slice-1-cli-contract-and-build-scaffold.md`: publish the seam-owned command and path contracts without pulling downstream adoption work into this seam.
- `S2` → `slice-2-deterministic-artifact-generation.md`: implement deterministic generation for runtime, typed, and Figma-facing artifacts.
- `S3` → `slice-3-runtime-css-conformance-and-freshness.md`: publish the generated runtime CSS contract at the existing import path and prove artifact freshness/idempotence.

### Threading Alignment (mandatory)

- **Contracts produced (owned)**:
  - `CT-4`: `pnpm validate:tokens` validates DTCG token structure, theme registry conformance, recipe shape, and token-reference integrity; lives in `design-tokens/build/validate-tokens.mjs` plus any seam-local helpers under `scripts/`; produced in `S1`.
  - `CT-5`: `pnpm build:tokens` runs Style Dictionary plus recipe-aware transforms and emits the stable artifact set; lives in `design-tokens/build/build-tokens.mjs`, `design-tokens/build/style-dictionary.config.mjs`, and shared build-path helpers; produced in `S1` and completed in `S2`.
  - `CT-6`: `src/lib/tokens/tokens.css` becomes generated, import-compatible runtime CSS; lives at the existing runtime path and is published by the build pipeline in `S3`.
- **Contracts consumed**:
  - `CT-1`: required from `SEAM-1`; consumed by `S1.T2` for schema/reference validation and by `S2.T1` for Style Dictionary input.
  - `CT-2`: required from `SEAM-1`; consumed by `S1.T2` for theme validation and by `S2.T1`/`S2.T3` for theme-aware artifact generation.
  - `CT-3`: required from `SEAM-2`; consumed by `S1.T2` for recipe validation and by `S2.T2` for typed output generation.
- **Dependency edges honored**:
  - `SEAM-1 blocks SEAM-3`: no slice starts until canonical token source files and theme IDs are available at the agreed `design-tokens/` root.
  - `SEAM-2 blocks SEAM-3`: recipe-aware validation and typed outputs are deferred until the manifest contract exists; this plan does not invent or redefine recipe ownership.
  - `SEAM-3 blocks SEAM-4`: `S3` publishes the stable runtime CSS contract before any app or Storybook adoption work proceeds.
  - `SEAM-3 blocks SEAM-5`: `S2.T3` emits the stable Figma export artifact before sync-policy validation begins.
  - `SEAM-3 blocks SEAM-6`: `S1` and `S3` create the seam-owned commands and local freshness checks that `SEAM-6` later wires into `justfile` and CI.
- **Parallelization notes**:
  - What can proceed now: once `S1` lands, downstream seams can code against stable command names and artifact paths without changing ownership. `SEAM-5` planning can also finalize around `design-tokens/dist/figma/tokens.json` while waiting for full policy validation.
  - What must wait: `SEAM-4` runtime/Storybook adoption waits for `S3`; `SEAM-5` execution waits for `S2.T3`; `SEAM-6` merge-gate wiring waits for `CT-4`, `CT-5`, and the freshness checker from `S3.T2`.
