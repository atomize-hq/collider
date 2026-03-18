### S3 — Pilot Recipe and Handoff

- **User/system value**: `SEAM-3` and `SEAM-4` receive a real, validated pilot recipe plus minimal source-owned metadata, proving the manifest can describe one component end to end without ad hoc side channels.
- **Scope (in/out)**:
  - In: pilot recipe source, source-owned recipe index, migration notes for downstream consumers.
  - Out: build transforms, generated typed outputs, Storybook docs pages, and CI gating.
- **Acceptance criteria**:
  - `button.recipe.json` is valid against the schema and uses only `CT-1` references.
  - The pilot recipe fully expresses axes, defaults, slots, states, and fallback order without extra bespoke config files.
  - Downstream seams have one stable source-owned index that points at the normative pilot recipe set.
- **Dependencies**: `SEAM-1`, `S1`, `S2`
- **Verification**: run the dedicated validator against the pilot recipe and confirm the source index resolves to the same file set.
- **Rollout/safety**: keep the pilot additive and clearly marked as `v1` source data so downstream consumers can adopt it incrementally.

#### S3.T1 — Author the pilot `button` recipe

- **Outcome**: the seam proves the contract on a real component instead of leaving `CT-3` theoretical.
- **Inputs/outputs**:
  - Inputs: `CT-1` token IDs, schema from `S1`, validator from `S2`.
  - Outputs: `design-tokens/src/recipes/button.recipe.json`.
- **Implementation notes**:
  - Model exactly one component: `button`.
  - Encode `intent` and `size` as the only variant axes.
  - Encode `rest`, `hover`, `focus`, and `disabled` as the only states.
  - Encode `root`, `label`, and `icon` as the only slots.
  - Encode fallback precedence so downstream seams do not infer ordering on their own.
- **Acceptance criteria**:
  - The recipe passes validation with no inline scalar values.
  - A reviewer can understand the component contract from the recipe file alone.
  - No extra config file is required to interpret the pilot recipe.
- **Test notes**: validate the pilot file directly with `scripts/validate-component-recipe.mjs`.
- **Risk/rollback notes**: if the recipe needs a field not already defined in `S1`, stop and tighten the contract first rather than sneaking in one-off shape.

Checklist:

- Implement: write the pilot recipe file.
- Test: run the dedicated validator on the pilot recipe.
- Validate: confirm each token-bearing field points at a `CT-1` token reference.
- Cleanup: remove any field that duplicates scalar token values or Storybook-only labels.

#### S3.T2 — Publish a source-owned handoff index for downstream seams

- **Outcome**: downstream seams get a stable manifest entrypoint without re-scanning the repo or inventing parallel metadata.
- **Inputs/outputs**:
  - Inputs: validated pilot recipe from `S3.T1`, pilot boundary from `S1.T2`.
  - Outputs: `design-tokens/src/recipes/index.json`, updates to `design-tokens/src/recipes/README.md`.
- **Implementation notes**:
  - Keep the index minimal and source-owned.
  - Include `schemaVersion`, `recipes`, `componentId`, `sourceFile`, and `status`.
  - Mark the `button` recipe as `pilot`.
  - Document that `SEAM-3` consumes the source recipe files and `SEAM-4` renders via downstream artifacts, not duplicated hand-authored docs.
- **Acceptance criteria**:
  - There is one canonical index for recipe discovery inside the source tree.
  - The index does not redefine recipe data already present in `button.recipe.json`.
  - Migration notes call out that breaking contract changes require validator and downstream consumer updates.
- **Test notes**: confirm the index and the recipe glob resolve to the same normative file set.
- **Risk/rollback notes**: keep the index as metadata only; if it starts accumulating derived build output, push that work to `SEAM-3`.

Checklist:

- Implement: add the source index and handoff notes.
- Test: compare the indexed file list to the actual recipe glob.
- Validate: confirm the index contains only discovery metadata, not duplicated contract payloads.
- Cleanup: remove any field that is really owned by Storybook or build output generation.
