### S2b — Canonical Alias Map

- **User/system value**: downstream build work receives one unambiguous compatibility contract for mapping legacy runtime variables onto canonical token IDs.
- **Scope (in/out)**:
  - In: `design-tokens/src/tokens/migrations/runtime-variable-inventory.json`; canonical token IDs and theme registry from `S1`; compatibility action selection per legacy variable.
  - Out: generated CSS emission; alias implementation code; runtime cutover prose; Storybook adoption.
- **Acceptance criteria**:
  - `design-tokens/src/tokens/migrations/runtime-css-aliases.json` contains one record per legacy runtime variable.
  - Every record includes `legacyVar`, `canonicalTokenId`, `themeId`, and `action`.
  - Every `canonicalTokenId` resolves to a token published by `S1`, and every `action` is limited to `preserve`, `alias`, or `rename-with-migration`.
- **Dependencies**:
  - `S1.T1`
  - `S1.T2`
  - `S1.T3`
  - `S2.T1`
- **Verification**:
  - Sample-check at least one mapped variable from each current runtime category and confirm the canonical token exists.
  - Review the alias map for one-to-one mapping coverage and allowed action values only.
- **Rollout/safety**:
  - Prefer `preserve` or `alias` when renames would create cross-seam coupling during v1 cutover.
  - Keep overloaded or duplicate legacy variables explicit instead of collapsing them prematurely.

#### S2.T2 — Map legacy variables to canonical token IDs

- **Outcome**: `SEAM-3` can consume a machine-readable alias contract instead of reverse-engineering migration rules from source files.
- **Files**:
  - `design-tokens/src/tokens/migrations/runtime-variable-inventory.json`
  - `design-tokens/src/tokens/core.tokens.json`
  - `design-tokens/src/tokens/semantic.tokens.json`
  - `design-tokens/src/tokens/motion.tokens.json`
  - `design-tokens/src/tokens/themes/dark.tokens.json`
  - `design-tokens/src/tokens/themes/registry.json`
  - `design-tokens/src/tokens/migrations/runtime-css-aliases.json`

Checklist:

- Implement:
  - Create `runtime-css-aliases.json` with one record per inventory entry.
  - Populate each record with `legacyVar`, `canonicalTokenId`, `themeId`, and an allowed `action`.
  - Resolve ambiguous mappings by choosing one canonical token ID or marking the case as an explicit migration action.
- Test:
  - Verify each `canonicalTokenId` exists in the canonical source tree from `S1`.
  - Sample-check mappings across multiple runtime categories rather than only one happy-path variable class.
- Validate:
  - Confirm there are no one-to-many mappings or unsupported action values.
  - Confirm theme IDs align with `design-tokens/src/tokens/themes/registry.json`.
