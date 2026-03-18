### S2b — Pilot Recipe Docs Surface

- **User/system value**: reviewers can inspect one approved recipe contract in Storybook with variant, state, slot, and fallback metadata still anchored to repo-authored artifacts.
- **Scope (in/out)**:
  - In: one Storybook docs surface for the approved pilot recipe ID, plus any thin presenter helper needed to render artifact-backed recipe metadata.
  - Out: token docs, recipe editing workflows, expansion to multiple pilot recipes, or repo-wide gate wiring.
- **Acceptance criteria**:
  - One approved pilot recipe from `CT-3` is visible in Storybook with variant, state, slot, and fallback metadata traceable to `CT-3` and `CT-5`.
  - The docs surface does not copy recipe fields into local constants.
  - Missing recipe inputs fail loudly and locally rather than disappearing from Storybook.
- **Dependencies**:
  - `S2a`
  - `CT-3` from `SEAM-2`
  - `CT-5` from `SEAM-3`
- **Verification**:
  - Render the pilot recipe docs surface in Storybook locally.
  - Run `pnpm test:storybook`.
  - Validate that the page points back to the canonical pilot recipe ID published by `SEAM-2`.
- **Rollout/safety**:
  - Keep the work scoped to one approved pilot recipe until the contract and docs pattern prove durable.

#### S2.T2 — Publish one pilot recipe docs surface

- **Outcome**: Storybook exposes one approved pilot recipe with its variant axes, states, slots, and fallback behavior.
- **Files**:
  - `storybook/**`
  - `.storybook/**` only if discoverability metadata or docs registration needs a thin update

Checklist:

- Implement:
  - Wire one approved pilot recipe into a Storybook docs surface without copying recipe fields into local constants.
  - Reuse the artifact-backed loading pattern established in `S2a`.
- Test:
  - Load the docs surface and verify variant, state, slot, and fallback metadata render correctly.
  - Confirm missing recipe data fails loudly and locally.
- Validate:
  - Confirm the page references the canonical recipe ID published by `SEAM-2`.
  - Keep the implementation scoped to one pilot recipe until the contract proves durable.
