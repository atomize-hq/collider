### S1b — Token ID And Family Rules

- **User/system value**: maintainers get one explicit naming and ownership contract for token IDs before downstream seams begin referencing canonical values.
- **Scope (in/out)**:
  - In: publish token-ID grammar, family ownership rules, semantic-to-core reference rules, and worked mappings from current CSS variables into canonical IDs.
  - Out: new token-family files, theme-registry entries, generated artifacts, or recipe-schema concerns.
- **Acceptance criteria**:
  - `design-tokens/src/tokens/README.md` defines canonical ID grammar for base, semantic, and motion tokens.
  - The README states that runtime CSS is derived output, not canonical input.
  - The README makes component recipes explicitly out of scope for the token tree.
  - At least three current CSS variables are traced into their proposed canonical token IDs without leaving naming gaps for `SEAM-2` or `SEAM-3`.
- **Dependencies**:
  - `S1a` so the README points at an already-published file tree
  - `src/lib/tokens/tokens.css`
- **Verification**:
  - Review three examples from the current CSS variable surface and confirm each lands in one family with one canonical token ID.
  - Check that the README is sufficient for `SEAM-2` to reference token IDs without inventing extra conventions.
- **Rollout/safety**:
  - If a naming decision remains disputed, record the alternative briefly but keep one canonical name in the published contract.
  - Avoid restating seam-level threading prose unless it adds file-level guidance.

#### S1.T2 — Publish stable token IDs and family-level naming rules

- **Outcome**: maintainers know how token IDs are formed and which family owns each value class before other seams begin referencing them.
- **Files**:
  - `design-tokens/src/tokens/README.md`
  - `src/lib/tokens/tokens.css`

Checklist:

- Implement:
  - Write the canonical token-ID grammar and family ownership rules in `design-tokens/src/tokens/README.md`.
  - Document semantic-to-core reference rules and the boundary that keeps component recipes out of `CT-1`.
  - Trace at least three existing CSS variables into their proposed canonical token IDs.
- Test:
  - Review the three worked examples against the live variable names in `src/lib/tokens/tokens.css`.
  - Confirm the chosen canonical IDs match the family layout introduced in `S1a`.
- Validate:
  - Verify the README makes runtime CSS an output concern rather than a source-of-truth file.
  - Verify the naming rules are concrete enough for downstream seams to consume without guessing.
