### S2 — Reference Validation Conformance

- **User/system value**: malformed recipes and broken token references fail before build integration, so `SEAM-3` and `SEAM-6` inherit deterministic source validation instead of heuristics.
- **Scope (in/out)**:
  - In: dedicated recipe validator logic, schema loading, token-reference integrity checks, deterministic fixtures.
  - Out: `package.json` commands, `justfile` wiring, CI policy, and generated artifact freshness checks.
- **Acceptance criteria**:
  - A dedicated validator can evaluate the recipe glob without relying on Storybook or build transforms.
  - Validation fails on missing required fields, unknown token references, inline scalar values, and unknown pilot states/slots/axis values.
  - Fixture coverage includes at least one valid sample and at least two invalid samples with different failure modes.
- **Dependencies**: `SEAM-1`, `CT-1`, `S1`
- **Verification**: `node scripts/validate-component-recipe.mjs <recipe-or-glob>` succeeds on valid fixtures and exits non-zero on invalid fixtures.
- **Rollout/safety**: keep validator wiring local to `scripts/` until `SEAM-6` is ready to promote it into hard gates.

#### S2.T1 — Add a dedicated recipe-validator entrypoint

- **Outcome**: recipe validation becomes its own deterministic script instead of being implied by the existing component-loop precedent.
- **Inputs/outputs**:
  - Inputs: `scripts/validate-component-loop.mjs`, `design-tokens/src/recipes/schema/recipe.schema.json`.
  - Outputs: `scripts/validate-component-recipe.mjs`, optional shared helper extraction if both scripts benefit from common assertions.
- **Implementation notes**:
  - Keep the existing `validate-component-loop` contract intact unless helper extraction is purely internal.
  - Support validating one recipe file or the canonical recipe glob.
  - Load the schema from the recipe source tree instead of duplicating shape checks inline.
  - Exit non-zero on the first invalid file and print the failing field/path deterministically.
- **Acceptance criteria**:
  - The new script validates exactly the recipe input surface owned by `SEAM-2`.
  - The script is deterministic across local runs and CI environments.
  - No `package.json` or `justfile` changes are required in this slice.
- **Test notes**: run the validator against fixture files and the eventual pilot recipe from `S3`.
- **Risk/rollback notes**: do not overload this script with build or output concerns that belong to `SEAM-3`.

Checklist:

- Implement: add the validator entrypoint and any shared assertion helpers.
- Test: run the script once against a valid fixture and once against a known-invalid fixture.
- Validate: confirm the script can run in the single-package repo without workspace assumptions.
- Cleanup: remove duplicated structural checks if helpers are extracted from the existing loop validator.

#### S2.T2 — Enforce token-reference integrity with deterministic fixtures

- **Outcome**: the seam proves that recipes stay tied to `CT-1` and reject malformed references before downstream seams consume them.
- **Inputs/outputs**:
  - Inputs: `CT-1` token files from `SEAM-1`, schema and pilot boundary from `S1`.
  - Outputs: `scripts/fixtures/component-recipes/button.valid.recipe.json`, `scripts/fixtures/component-recipes/button.invalid-missing-token.recipe.json`, `scripts/fixtures/component-recipes/button.invalid-inline-value.recipe.json`.
- **Implementation notes**:
  - Build or derive a token-ID inventory from the `CT-1` source tree.
  - Fail if a token-bearing field contains a raw scalar value instead of a DTCG-style reference.
  - Fail if a recipe names an axis, state, or slot outside the pilot contract defined in `S1.T2`.
  - Keep fixture names descriptive so `SEAM-6` can later promote them into hard validation with minimal translation.
- **Acceptance criteria**:
  - Missing token IDs are rejected.
  - Inline literals in token-bearing fields are rejected.
  - Unknown pilot names are rejected.
- **Test notes**: record the expected pass/fail output for each fixture in the slice PR description or adjacent README notes.
- **Risk/rollback notes**: if `CT-1` is still moving, keep the inventory lookup thin and data-driven rather than hard-coding token names in the validator.

Checklist:

- Implement: add the valid and invalid fixtures plus token-reference checks.
- Test: run the new validator against all fixtures and confirm distinct failure modes.
- Validate: confirm every failing fixture is tied to a documented seam invariant.
- Cleanup: drop any fixture that tests behavior outside the agreed pilot boundary.
