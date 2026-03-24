### S3b — Runtime Traceability Examples

- **User/system value**: downstream maintainers can prove that the canonical source is usable by tracing live runtime variables back to one token ID and one theme without depending on later build code.
- **Scope (in/out)**:
  - In: `design-tokens/src/tokens/migrations/runtime-traceability.md`; worked examples for `background`, `text`, and `statusstrip` runtime variables; compatibility action notes tied to the alias map.
  - Out: the full alias inventory; generated CSS behavior; token rename/removal policy; validator or CI implementation.
- **Acceptance criteria**:
  - The traceability doc includes worked examples spanning `background`, `text`, and `statusstrip`.
  - Each example identifies the legacy runtime variable, canonical token ID, theme, and intended compatibility action.
  - At least one example shows a semantic token that resolves through a base token.
- **Dependencies**:
  - `S2.T2`
  - `CT-1`
  - `CT-2`
- **Verification**:
  - Cross-check every worked example against both the canonical source tree and `design-tokens/src/tokens/migrations/runtime-css-aliases.json`.
  - Verify the example set stays concise and does not become a duplicate inventory file.
- **Rollout/safety**:
  - Keep the example set small and contract-focused so later seams can rely on it as proof of traceability rather than as a mutable source of truth.

#### S3.T2 — Add traceability examples for current runtime variables

- **Outcome**: `runtime-traceability.md` demonstrates how real app variables map to canonical token IDs and theme entries.
- **Files**:
  - `design-tokens/src/tokens/migrations/runtime-traceability.md`
  - `design-tokens/src/tokens/migrations/runtime-css-aliases.json`
  - `src/lib/tokens/tokens.css`

Checklist:

- Implement:
  - Add `design-tokens/src/tokens/migrations/runtime-traceability.md`.
  - Document worked examples for `background`, `text`, and `statusstrip` variables.
  - Show the intended compatibility action for each example alongside the canonical token ID and theme.
- Test:
  - Verify each example is backed by both the live runtime variable inventory and the alias map.
  - Confirm at least one example covers a semantic token referencing a base token.
- Validate:
  - Ensure a reader can follow each example without later build-code context.
  - Remove examples that duplicate each other without adding a new category or rule.
