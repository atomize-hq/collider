### S2 — Runtime Coverage And Migration Map

- **User/system value**: the current app surface can migrate to generated artifacts without losing existing variable coverage or silently renaming public runtime inputs.
- **Scope (in/out)**:
  - In: inventory of the current `src/lib/tokens/tokens.css` variables; mapping from each legacy runtime variable to one canonical token ID or explicit alias; capture of runtime compatibility expectations for `src/app/globals.css`.
  - Out: generated CSS emission, alias implementation in build scripts, Storybook adoption, CI freshness checks.
- **Acceptance criteria**:
  - Every runtime CSS variable currently defined in `src/lib/tokens/tokens.css` appears in a machine-readable migration map.
  - The migration map records the canonical token ID, owning theme, and compatibility action for each legacy variable.
  - `SEAM-3` can consume the map without having to infer rename/removal policy.
- **Dependencies**: `S1.T1`, `S1.T2`, `S1.T3`
- **Verification**: review the current CSS file against the migration map and confirm there are no unmapped variables.
- **Rollout/safety**: preserve the current `@import '../lib/tokens/tokens.css';` path in `src/app/globals.css` until `SEAM-3` replaces the file with generated output behind the same stable import.

#### S2.T1 — Inventory the legacy runtime variable surface

- **Outcome**: the seam has a complete list of runtime variables that must be preserved or deliberately migrated during cutover.
- **Inputs/outputs**:
  - Inputs: `src/lib/tokens/tokens.css`, `src/app/globals.css`
  - Outputs: `design-tokens/src/tokens/migrations/runtime-variable-inventory.json`
- **Implementation notes**: record each CSS variable name, its current value, and its category guess (`background`, `text`, `statusstrip`, or similar) based on the existing file.
- **Acceptance criteria**: the inventory includes every variable currently defined in `src/lib/tokens/tokens.css` and notes that `src/app/globals.css` imports the runtime token file directly.
- **Test notes**: diff the inventory entries against the live CSS file to confirm zero omissions.
- **Risk/rollback notes**: if a variable looks unused, keep it in the inventory anyway and let later seams decide retirement through explicit cutover policy.

Checklist:

- Implement: extract every custom property from `src/lib/tokens/tokens.css` into `runtime-variable-inventory.json`.
- Test: compare the count and names against the source CSS file.
- Validate: confirm the inventory captures the stable runtime import path dependency from `src/app/globals.css`.
- Cleanup: normalize category labels so they align with the naming rules from `S1`.

#### S2.T2 — Map legacy variables to canonical token IDs

- **Outcome**: `SEAM-3` receives an unambiguous alias/migration contract instead of having to reverse-engineer runtime compatibility from source files.
- **Inputs/outputs**:
  - Inputs: `design-tokens/src/tokens/migrations/runtime-variable-inventory.json`, canonical token IDs from `S1`
  - Outputs: `design-tokens/src/tokens/migrations/runtime-css-aliases.json`
- **Implementation notes**: each entry should include `legacyVar`, `canonicalTokenId`, `themeId`, and `action` where `action` is one of `preserve`, `alias`, or `rename-with-migration`.
- **Acceptance criteria**: every legacy variable maps to exactly one canonical token ID or explicit migration action, with no ambiguous one-to-many mappings.
- **Test notes**: sample-check at least one variable from each current category and verify the canonical token ID exists in the source tree from `S1`.
- **Risk/rollback notes**: prefer `preserve` or `alias` for v1 if a rename would force a simultaneous runtime and recipe update across seams.

Checklist:

- Implement: create `runtime-css-aliases.json` with one record per legacy variable.
- Test: verify each `canonicalTokenId` exists in the `design-tokens/src/tokens/` tree.
- Validate: confirm `action` values are limited to the allowed compatibility set.
- Cleanup: remove duplicate alias entries or split overloaded variables before downstream seams consume the file.

#### S2.T3 — Record cutover assumptions for runtime compatibility

- **Outcome**: later seams can preserve behavior during build and app adoption without reopening the token-source seam for policy decisions.
- **Inputs/outputs**:
  - Inputs: `design-tokens/src/tokens/migrations/runtime-css-aliases.json`, `figma-ci-sync/scope_brief.md`
  - Outputs: `design-tokens/src/tokens/migrations/runtime-cutover-notes.md`
- **Implementation notes**: keep this file policy-focused: stable import path, no silent removals, and the rule that token renames are migration events.
- **Acceptance criteria**: the notes explicitly state what `SEAM-3`, `SEAM-4`, and `SEAM-6` must preserve during initial cutover.
- **Test notes**: review the notes alongside the alias map and ensure there is no contradiction about whether legacy names survive v1.
- **Risk/rollback notes**: do not include CI enforcement details here; those belong to `SEAM-6`.

Checklist:

- Implement: document runtime compatibility expectations in `runtime-cutover-notes.md`.
- Test: confirm the notes align with the `CT-1` and `CT-2` compatibility language in `threading.md`.
- Validate: verify the notes avoid prescribing build implementation details owned by `SEAM-3`.
- Cleanup: remove guidance that duplicates governance work owned by `SEAM-6`.
