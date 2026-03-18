### Seam Brief (Restated)

- **Seam ID**: `SEAM-2`
- **Name**: Component Recipe Manifest
- **Goal / value**: publish a repo-owned, versioned component-recipe contract that separates variant/state/slot behavior from scalar tokens so downstream build, docs, and governance seams consume one stable manifest shape.
- **Type**: capability
- **Slicing strategy**: contract-first
- **Scope**
  - In: recipe schema; recipe source file layout; pilot-component boundary; recipe-validation logic; pilot recipe source artifacts; downstream handoff metadata owned by the recipe source.
  - Out: token authoring in `SEAM-1`; build transforms and generated artifacts in `SEAM-3`; Storybook rendering in `SEAM-4`; CI wiring and hard merge gates in `SEAM-6`.
- **Touch surface**:
  - `design-tokens/src/recipes/**`
  - `scripts/validate-component-loop.mjs`
  - `scripts/validate-component-recipe.mjs`
  - `scripts/fixtures/component-recipes/**`
- **Verification**:
  - The `CT-3` schema is explicit, versioned, and limited to token references rather than inline scalar values.
  - A dedicated validator fails closed on malformed recipe files and missing token references from `CT-1`.
  - One pilot recipe can be described entirely from manifest metadata and handed to downstream seams without extra ad hoc config.
- **Threading constraints**
  - Upstream blockers: `SEAM-1`, specifically `CT-1` token IDs and naming stability.
  - Downstream blocked seams: `SEAM-3`, `SEAM-4`, `SEAM-6`.
  - Contracts produced (owned): `CT-3`.
  - Contracts consumed: `CT-1`.

### Slice index

- `S1` → `slice-1-manifest-contract-and-pilot-boundary.md`: define `CT-3`, file layout, and the smallest non-speculative pilot boundary.
- `S2` → `slice-2-reference-validation-conformance.md`: add fail-closed schema and token-reference validation around recipe inputs.
- `S3` → `slice-3-pilot-recipe-and-handoff.md`: land the validated pilot recipe and the source-owned handoff metadata downstream seams consume.

### Threading Alignment (mandatory)

- **Contracts produced (owned)**:
  - `CT-3`: versioned recipe source contract under `design-tokens/src/recipes/*.recipe.json`, with schema and authoring rules rooted in `design-tokens/src/recipes/schema/recipe.schema.json` and `design-tokens/src/recipes/README.md`; established in `S1`, enforced in `S2`, exercised in `S3`.
- **Contracts consumed**:
  - `CT-1`: required from `SEAM-1` before any recipe file can encode token references; consumed by `S1.T1` for reference syntax, by `S2.T2` for integrity checks, and by `S3.T1` for the pilot recipe.
- **Dependency edges honored**:
  - `SEAM-1 blocks SEAM-2`: no recipe schema, validator, or pilot artifact in this plan invents token IDs or fallback names before `CT-1` is stable.
  - `SEAM-2 blocks SEAM-3`: `S1` publishes the manifest shape early so build work can target a settled contract without waiting on broader recipe rollout.
  - `SEAM-2 blocks SEAM-4`: this plan emits only source-owned recipe artifacts; Storybook visibility stays in `SEAM-4` to avoid duplicating the docs surface.
  - `SEAM-2 blocks SEAM-6`: validator logic is produced here, but merge-gate wiring is deferred to `SEAM-6`.
- **Parallelization notes**:
  - What can proceed now: schema drafting, pilot-boundary decisions, and validator scaffolding inside `WS-A` once `SEAM-1` freezes token naming.
  - What must wait: token-reference integrity checks, the concrete pilot recipe, Storybook rendering, and CI gating all wait on `CT-1` plus the earlier slices in this seam.
