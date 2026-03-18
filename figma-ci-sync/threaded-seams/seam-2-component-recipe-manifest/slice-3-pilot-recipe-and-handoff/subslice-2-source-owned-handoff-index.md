### S3b — Source-Owned Handoff Index

- **User/system value**: downstream seams get one stable discovery entrypoint for the pilot recipe set without re-scanning the repo or inventing parallel metadata.
- **Scope (in/out)**:
  - In: `design-tokens/src/recipes/index.json`; README handoff and migration notes; canonical discovery metadata for the pilot recipe set.
  - Out: authoring the recipe payload itself; generated build outputs; Storybook docs pages; CI or merge-gate wiring.
- **Acceptance criteria**:
  - `design-tokens/src/recipes/index.json` contains only discovery metadata: `schemaVersion`, `recipes`, `componentId`, `sourceFile`, and `status`.
  - The index points to the same normative file set produced by `S3a` and does not duplicate contract payload from `button.recipe.json`.
  - README handoff notes make the ownership boundary explicit: `SEAM-3` consumes source recipe files, and `SEAM-4` renders downstream artifacts.
- **Dependencies**:
  - `S1.T2`
  - `S3.T1`
  - `CT-3`
- **Verification**:
  - Compare the indexed file list to the canonical recipe glob under `design-tokens/src/recipes/*.recipe.json`.
  - Review `design-tokens/src/recipes/README.md` to confirm the handoff notes do not redefine recipe data already owned by `button.recipe.json`.
- **Rollout/safety**:
  - Keep the index metadata-only; any derived build output belongs to `SEAM-3`.
  - Call out breaking contract changes as validator and downstream-consumer follow-up work instead of mutating the handoff surface silently.

#### S3.T2 — Publish a source-owned handoff index for downstream seams

- **Outcome**: the source tree exposes one canonical discovery surface for downstream consumers and migration notes.
- **Files**:
  - `design-tokens/src/recipes/index.json`
  - `design-tokens/src/recipes/README.md`
  - `design-tokens/src/recipes/button.recipe.json`

Checklist:

- Implement:
  - Add `design-tokens/src/recipes/index.json` as the canonical recipe discovery index.
  - Include `schemaVersion`, `recipes`, `componentId`, `sourceFile`, and `status`.
  - Mark the `button` recipe as `pilot`.
  - Update `design-tokens/src/recipes/README.md` with downstream handoff and migration notes.
- Test:
  - Compare the indexed recipe list to the actual `design-tokens/src/recipes/*.recipe.json` file set.
  - Verify the README handoff notes align with the pilot boundary and downstream ownership.
- Validate:
  - Confirm the index contains only discovery metadata and does not restate recipe payload data.
  - Confirm migration notes call out that breaking contract changes require validator and downstream consumer updates.
- Cleanup:
  - Remove any field that belongs to build generation rather than source discovery.
  - Remove any README wording that implies Storybook or CI ownership inside this seam.
