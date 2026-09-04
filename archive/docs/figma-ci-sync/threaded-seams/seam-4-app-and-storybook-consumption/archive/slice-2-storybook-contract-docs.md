### S2 — Storybook Contract Docs

- **User/system value**: engineers can inspect generated token outputs and one approved recipe contract inside Storybook instead of relying on prose or copied JSON.
- **Scope (in/out)**:
  - In: token docs backed by generated artifacts; one pilot recipe docs surface backed by `CT-3` and `CT-5`; any local metadata needed to keep those docs discoverable.
  - Out: editing recipes in Storybook, inventing a broader component library, CI inventory gates.
- **Acceptance criteria**:
  - Storybook token docs render from generated artifacts rather than hand-maintained prose or copied token JSON.
  - One approved pilot recipe from `CT-3` is visible in Storybook with variant, state, slot, and fallback metadata traceable to repo artifacts.
  - Any local story metadata introduced for these docs remains derived from the new artifact-backed surfaces rather than becoming a separate truth source.
- **Dependencies**: `S1.T1`; `CT-3` from `SEAM-2`; `CT-5` and `CT-6` from `SEAM-3`
- **Verification**: render the docs surfaces in Storybook; run `pnpm test:storybook`; if story metadata is introduced locally, validate it with the existing inventory script without wiring a new gate yet.
- **Rollout/safety**: land token docs before making recipe docs mandatory for more than the first approved pilot component.

#### S2.T1 — Publish token docs from generated artifacts

- **Outcome**: Storybook exposes generated token categories and theme values from build outputs, not copied literals.
- **Inputs/outputs**:
  - Inputs: typed token output from `CT-5` and any CSS-variable metadata exposed alongside `CT-6`.
  - Outputs: a docs surface plus any thin loader or presenter module under `storybook/**` that reads generated artifacts.
- **Implementation notes**: if a Storybook addon is used, it must read generated artifacts directly or via a generated adapter checked into the repo; do not maintain a handwritten token table.
- **Acceptance criteria**: no separate static token catalog exists under `storybook/**`; the docs surface can be traced back to generated build output.
- **Test notes**: render the docs page locally and add a focused loader test if parsing or adaptation logic exists.
- **Risk/rollback notes**: keep the adapter shape thin so `SEAM-6` can later enforce freshness without custom reconciliation logic.

Checklist:

- Implement: add a Storybook docs surface that reads the generated token artifact shape from `SEAM-3`.
- Test: run Storybook and confirm token groups and values render from artifact-backed data.
- Validate: break the artifact path locally and confirm the docs surface fails clearly instead of silently serving stale copied data.
- Cleanup: avoid introducing hand-authored JSON mirrors or long prose lists of token values.

#### S2.T2 — Publish one pilot recipe docs surface

- **Outcome**: Storybook exposes one approved pilot recipe with its variant axes, states, slots, and fallback behavior.
- **Inputs/outputs**:
  - Inputs: the chosen pilot recipe manifest from `CT-3` in `SEAM-2`, plus any typed or transformed recipe output exposed by `CT-5`.
  - Outputs: one Storybook docs surface anchored to the approved pilot recipe ID and any thin presenter helper needed to render it.
- **Implementation notes**: do not invent the pilot component in `SEAM-4`; consume the first approved recipe ID that `SEAM-2` publishes as the v1 pilot set.
- **Acceptance criteria**: reviewers can inspect the pilot recipe contract in Storybook and trace it back to repo-authored recipe data.
- **Test notes**: render the recipe docs page locally; missing recipe inputs should fail loudly and locally rather than disappearing from Storybook.
- **Risk/rollback notes**: this task remains blocked until the thin contract-definition item in threading resolves the v1 pilot recipe set.

Checklist:

- Implement: wire one approved pilot recipe into a Storybook docs surface without copying recipe fields into local constants.
- Test: load the docs surface and verify variant, state, slot, and fallback metadata render correctly.
- Validate: confirm the page points back to the canonical recipe ID published by `SEAM-2`.
- Cleanup: keep the implementation scoped to one pilot recipe until the contract proves durable.
