# `SEAM-4` — App and Storybook Consumption

## Seam Brief (Restated)

- **Seam ID**: `SEAM-4`
- **Name**: App and Storybook Consumption
- **Goal / value**: prove the generated token artifacts are real by making the Next.js app and Storybook consume the same runtime CSS and artifact-backed docs surfaces.
- **Type**: platform
- **Scope**
  - In: stable generated-artifact imports in runtime and Storybook; Storybook token visibility backed by generated artifacts; one pilot recipe docs surface; removal of hand-maintained token duplication inside the seam touch surface.
  - Out: token authoring; recipe-schema design; Figma sync transport; CI or merge-gate wiring.
- **Touch surface**: `src/app/globals.css`, `src/app/page.tsx`, `.storybook/preview.ts`, `.storybook/main.ts`, `storybook/**`
- **Verification**: the app boots with generated tokens through the existing CSS import path; Storybook renders the same baseline theme values as the app; a pilot docs surface exposes at least one recipe contract for review.
- **Threading constraints**
  - Upstream blockers: `SEAM-3` must publish `CT-5` and `CT-6`; `CT-2` must keep theme IDs and fallback behavior stable; recipe-visible Storybook work waits on `CT-3`.
  - Downstream blocked seams: `SEAM-6`
  - Contracts produced (owned): none in the threading registry; this seam produces adoption proof surfaces, not a new shared contract.
  - Contracts consumed: `CT-2`, `CT-3`, `CT-5`, `CT-6`

## Slicing Strategy

- **Dependency-first**: `SEAM-4` blocks governance work in `SEAM-6`, so the first slice establishes the smallest stable app and Storybook consumption path that later drift gates can guard.

## Slice Index

- `S1` -> `slice-1-shared-artifact-ingestion.md`: align app and Storybook around the same generated CSS artifact and prove it renders.
- `S2` -> `slice-2-storybook-contract-docs.md`: expose generated token outputs and one approved pilot recipe inside Storybook without introducing a second truth source.
- `S3` -> `slice-3-adoption-and-conformance.md`: remove seam-local duplication and add local verification that later governance can promote into gates.

## Threading Alignment

- **Contracts produced (owned)**:
  - None. `SEAM-4` publishes stable consumption surfaces in app and Storybook, but ownership of shared contracts remains with `SEAM-1`, `SEAM-2`, and `SEAM-3`.
- **Contracts consumed**:
  - `CT-2`: theme IDs and fallback behavior from `SEAM-1`; consumed by `S1.T1` for Storybook defaults and by `S3.T1` when removing hard-coded theme literals.
  - `CT-3`: pilot recipe manifest from `SEAM-2`; consumed by `S2.T2` for the first recipe-visible Storybook surface.
  - `CT-5`: build outputs from `SEAM-3`; consumed by `S2.T1`, `S2.T2`, and `S3.T2` for typed token or recipe-backed docs and loader verification.
  - `CT-6`: generated runtime CSS artifact from `SEAM-3`; consumed by `S1.T1`, `S1.T2`, and `S3.T1` as the single runtime CSS source for both app and Storybook.
- **Dependency edges honored**:
  - `SEAM-3 blocks SEAM-4`: every slice consumes generated outputs only; no task reaches back into provisional token JSON or hand-maintained docs data.
  - `SEAM-4 blocks SEAM-6`: `S1` creates the shared consumption baseline, `S2` creates inspectable Storybook contract surfaces, and `S3` creates local verification that `SEAM-6` can later wire into repo-wide gates.
- **Parallelization notes**:
  - What can proceed now: `S1` can start as soon as `CT-6` exists; `S2.T1` can start once `CT-5` exposes a consumable token artifact shape.
  - What must wait: `S2.T2` waits on `SEAM-2` to publish the v1 pilot recipe set through `CT-3`; `S3.T2` waits on the loaders and docs surfaces from `S1` and `S2`; all CI and preflight enforcement stays in `SEAM-6`.
