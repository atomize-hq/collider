### S3 — Conformance And Change Control

- **User/system value**: token authors can extend the canonical source without reintroducing drift, hidden coupling, or breaking downstream consumers by accident.
- **Scope (in/out)**:
  - In: authoring rules for scalar-only token files; traceability examples; rename/removal policy for token IDs and theme IDs.
  - Out: validator CLI implementation, CI enforcement, generated artifact freshness checks, or cross-seam migration execution.
- **Acceptance criteria**:
  - The seam publishes explicit authoring and change-control rules that align with `CT-1` and `CT-2`.
  - A maintainer can follow one worked example from runtime variable to canonical token ID and theme entry.
  - Rename/removal handling is documented as a migration event, not an implicit cleanup.
- **Dependencies**: `S1.T2`, `S1.T3`, `S2.T2`
- **Verification**: document review confirms there is exactly one authoring guide, one change-control policy, and one traceability example set for this seam.
- **Rollout/safety**: this slice prevents downstream churn by clarifying policy before validators or build pipelines hard-code assumptions.

#### S3.T1 — Publish the token authoring guide

- **Outcome**: maintainers have one seam-owned reference for what belongs in canonical token files and how references are allowed.
- **Inputs/outputs**:
  - Inputs: `design-tokens/src/tokens/README.md`, `figma-ci-sync/seam-1-canonical-token-source.md`
  - Outputs: `design-tokens/src/tokens/AUTHORING.md`
- **Implementation notes**: describe allowed token categories, when semantic tokens may reference core tokens, the prohibition on component recipe data, and the requirement that runtime CSS stays generated output.
- **Acceptance criteria**: the guide closes the ambiguity around "what goes in tokens versus recipes" and names the canonical files where each concern lives.
- **Test notes**: check the guide against one example each for a base color token, semantic text token, motion token, and theme token.
- **Risk/rollback notes**: if a rule still depends on later seam implementation, state the invariant only and avoid smuggling in build-specific behavior.

Checklist:

- Implement: add `design-tokens/src/tokens/AUTHORING.md`.
- Test: confirm the guide distinguishes scalar tokens from component recipes with concrete examples.
- Validate: ensure the guidance is compatible with the file layout from `S1`.
- Cleanup: collapse duplicate guidance already captured in `README.md` into one authoritative file if needed.

#### S3.T2 — Add traceability examples for current runtime variables

- **Outcome**: downstream maintainers can prove the canonical source is usable by tracing real app variables back to one token ID and theme.
- **Inputs/outputs**:
  - Inputs: `src/lib/tokens/tokens.css`, `design-tokens/src/tokens/migrations/runtime-css-aliases.json`
  - Outputs: `design-tokens/src/tokens/migrations/runtime-traceability.md`
- **Implementation notes**: include a small worked set spanning at least `background`, `text`, and `statusstrip` variables; show legacy variable, canonical token ID, theme, and intended compatibility action.
- **Acceptance criteria**: a reader can follow each example without needing to inspect later build code.
- **Test notes**: verify every worked example references an entry that exists in both the canonical source tree and the alias map.
- **Risk/rollback notes**: keep the example set concise so it demonstrates the contract without becoming a second inventory file.

Checklist:

- Implement: write `runtime-traceability.md` with worked examples from live runtime variables.
- Test: verify each example is backed by the inventory and alias map.
- Validate: confirm at least one example covers a semantic token referencing a base token.
- Cleanup: remove examples that duplicate each other without adding a new category or rule.

#### S3.T3 — Publish token and theme change policy

- **Outcome**: token-ID or theme-ID changes become explicit migrations, which protects downstream seams from silent breakage.
- **Inputs/outputs**:
  - Inputs: `figma-ci-sync/threading.md`, `design-tokens/src/tokens/themes/registry.json`, `design-tokens/src/tokens/migrations/runtime-css-aliases.json`
  - Outputs: `design-tokens/src/tokens/CHANGE_POLICY.md`
- **Implementation notes**: define additive versus breaking changes, rename/removal procedure, and the requirement to update migration artifacts when a public token or theme identifier changes.
- **Acceptance criteria**: the policy aligns with the versioning rules in `CT-1` and `CT-2` and tells later seams what counts as a migration event.
- **Test notes**: walk through one hypothetical token rename and one hypothetical new-theme addition and confirm the policy handles both without contradiction.
- **Risk/rollback notes**: do not prescribe CI commands here; this policy should remain valid even before `SEAM-6` wires enforcement.

Checklist:

- Implement: add `design-tokens/src/tokens/CHANGE_POLICY.md`.
- Test: verify the policy distinguishes additive and breaking changes.
- Validate: confirm the policy references the migration artifacts from `S2` rather than inventing a parallel process.
- Cleanup: remove any local notes that define conflicting rename/removal behavior.
