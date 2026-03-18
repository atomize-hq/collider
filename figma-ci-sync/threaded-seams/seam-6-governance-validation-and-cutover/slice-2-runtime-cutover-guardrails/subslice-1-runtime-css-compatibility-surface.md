### S2a — Runtime CSS Compatibility Surface

- **User/system value**: the repo gets one explicit, versioned definition of the legacy runtime CSS surface that generated artifacts must preserve before manual editing is retired.
- **Scope (in/out)**:
  - In: the required legacy custom properties exposed through `src/lib/tokens/tokens.css`; a seam-owned validation script under `scripts/**`; the compatibility manifest or fixture that lists the names still needed during transition.
  - Out: cutover policy documentation; rollback commands; `justfile` or CI promotion; broad runtime or Storybook consumer rewiring already owned by `SEAM-4`.
- **Acceptance criteria**:
  - A dedicated compatibility command fails when a required legacy custom property is missing from the generated runtime CSS artifact.
  - The compatibility surface is explicit and small enough to review file-by-file rather than inferred from generator internals.
  - The compatibility check runs alongside the freshness path from `S1` without redefining what counts as a generated artifact.
- **Dependencies**:
  - `S1`
  - `CT-5`
  - `CT-6`
  - `figma-ci-sync/threaded-seams/seam-1-canonical-token-source/slice-2-runtime-coverage-and-migration-map/subslice-1-runtime-variable-inventory.md`
  - `figma-ci-sync/threaded-seams/seam-4-app-and-storybook-consumption/slice-3-adoption-and-conformance/subslice-1-runtime-and-preview-cutover.md`
- **Verification**:
  - Run `pnpm build:tokens`.
  - Run `node scripts/validate-token-runtime-compatibility.mjs`.
  - Remove one required legacy custom property from a generated fixture or temporary working copy and rerun the checker to confirm the failure names the missing property precisely.
- **Rollout/safety**:
  - Keep the compatibility surface limited to names still required by current runtime and Storybook consumers; do not turn historical leftovers into permanent obligations.
  - Keep this slice purely additive so cutover policy and enforcement can still change without reworking the checker contract.

#### S2.T1 — Define and automate CSS compatibility checks

- **Outcome**: the seam owns one deterministic proof that generated runtime CSS still satisfies the legacy variable coverage required during the migration window.
- **Files**:
  - `scripts/validate-token-runtime-compatibility.mjs`
  - `scripts/token-runtime-compatibility-surface.json`
  - `src/lib/tokens/tokens.css`
  - `src/app/globals.css`

Checklist:

- Implement:
  - Add `scripts/validate-token-runtime-compatibility.mjs` as the seam-owned checker for required legacy custom properties.
  - Store the compatibility surface in `scripts/token-runtime-compatibility-surface.json` so required names are explicit and versionable.
  - Read the generated runtime artifact at `src/lib/tokens/tokens.css` through the same import path the app already uses.
- Test:
  - Run the checker against the known-good generated CSS artifact after `pnpm build:tokens`.
  - Remove one required property from a test fixture or temporary working copy and confirm the checker fails with the missing property name.
- Validate:
  - Confirm the manifest only contains variables still required by `SEAM-4` consumers.
  - Confirm the checker does not duplicate the freshness responsibilities already introduced in `S1`.
