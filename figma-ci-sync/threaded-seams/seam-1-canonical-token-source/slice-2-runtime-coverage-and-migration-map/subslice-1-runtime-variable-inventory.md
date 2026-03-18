### S2a — Runtime Variable Inventory

- **User/system value**: the seam gets one exhaustive, machine-readable inventory of the live runtime CSS surface before any aliasing or cutover policy is layered on top.
- **Scope (in/out)**:
  - In: `src/lib/tokens/tokens.css`; the stable runtime import in `src/app/globals.css`; category normalization needed to align inventory entries with `S1` naming rules.
  - Out: canonical token selection; alias action policy; build-script behavior; Storybook or CI adoption.
- **Acceptance criteria**:
  - `design-tokens/src/tokens/migrations/runtime-variable-inventory.json` lists every custom property defined in `src/lib/tokens/tokens.css`.
  - Each inventory record captures the legacy variable name, current value, and a normalized category guess.
  - The inventory explicitly records that `src/app/globals.css` preserves the stable runtime import path during v1 cutover.
- **Dependencies**:
  - `S1.T1`
  - `S1.T2`
- **Verification**:
  - Diff inventory entry names against `src/lib/tokens/tokens.css` and confirm zero omissions.
  - Review the recorded import-path dependency against `src/app/globals.css`.
- **Rollout/safety**:
  - Keep possibly unused variables in the inventory; retirement decisions stay out of this sub-slice.
  - Treat category guesses as normalization metadata, not as rename approval.

#### S2.T1 — Inventory the legacy runtime variable surface

- **Outcome**: the seam has a complete list of runtime variables that later sub-slices must preserve or explicitly migrate.
- **Files**:
  - `src/lib/tokens/tokens.css`
  - `src/app/globals.css`
  - `design-tokens/src/tokens/migrations/runtime-variable-inventory.json`

Checklist:

- Implement:
  - Extract every custom property from `src/lib/tokens/tokens.css` into `runtime-variable-inventory.json`.
  - Record each variable's current value and a normalized category label that aligns with `S1` naming guidance.
  - Note in the inventory metadata that `src/app/globals.css` imports the runtime token file directly.
- Test:
  - Compare inventory count and variable names against the source CSS file.
  - Confirm the recorded import dependency matches the live `@import '../lib/tokens/tokens.css';` usage.
- Validate:
  - Verify no runtime variable from the current CSS file is omitted, even if it appears stale.
  - Verify the inventory stays descriptive and does not pre-commit later alias or removal policy.
