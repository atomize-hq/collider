---
slice_id: S1
seam_id: SEAM-9B
slice_kind: delivery
execution_horizon: next
status: decomposed
plan_version: v1
basis:
  currentness: provisional
  basis_ref: seam.md#basis
  stale_triggers:
    - Any change to `CT-9B` component identity fields or downstream hook semantics requires this slice to be revalidated before execution.
    - Any landed `CT-10B` field-set or URL-shape change may force the Storybook link fields in this slice to be renamed, narrowed, or kept nullable.
gates:
  pre_exec:
    review: inherited
    contract: inherited
    revalidation: inherited
  post_exec:
    landing: pending
    closeout: pending
threads:
  - THR-03
  - THR-04
  - THR-07
contracts_produced:
  - CT-11B
contracts_consumed:
  - CT-9B
  - CT-10B
open_remediations:
  - REM-003
candidate_subslices: []
---

### S1 - CT-11B Contract Baseline

- **User/system value**: downstream tooling can inspect one stable repo-owned mapping contract instead of reverse-engineering component identity from Storybook, Figma, or vendor-specific metadata.
- **Scope (in/out)**:
  - In: one authoritative field set for component identity, code entrypoint refs, variant and slot refs, example stories, Figma refs, and Storybook link provenance; nullable-versus-required field rules; repo-owned projection boundaries for Storybook and Figma outputs.
  - Out: emitting final pilot artifacts, consuming unpublished `CT-10B` URLs as current truth, or defining reusable-component promotion policy.
- **Acceptance criteria**:
  - `CT-11B` clearly states which fields come from published `CT-9B`, which are seam-owned additions, and which fields remain blocked on published `CT-10B`.
  - Storybook link fields are explicitly derived from repo-owned review artifacts, not hand-authored vendor URLs.
  - The contract distinguishes missing-but-allowed provisional fields from missing-and-invalid required fields.
  - One shared projection boundary can feed both `storybook/connect/**` and `figma/code-connect/**` without duplicating identity normalization rules.
- **Dependencies**: requires landed `CT-9B`; treats `CT-10B` as provisional input until `THR-03` is published.
- **Verification**: contract review against [review.md](./review.md#r1---repo-owned-mapping-projection-flow) and [review.md](./review.md#r2---storybook-link-resolution-and-provisional-handoff).
- **Rollout/safety**: keep Storybook link fields nullable or explicitly unresolved until `SEAM-8B` publishes the review artifact; fail closed on any attempt to treat vendor IDs as primary identity.
- **Review surface refs**: [review.md](./review.md#r1---repo-owned-mapping-projection-flow), [review.md](./review.md#r2---storybook-link-resolution-and-provisional-handoff)

#### S1.T1 - Freeze Repo-Owned Identity And Provenance Fields

- **Outcome**: the seam defines the exact `CT-11B` field set, including which values are copied from `CT-9B`, which are seam-owned, and which remain provisional until `CT-10B` lands.
- **Inputs/outputs**:
  - Inputs: `storybook/component-specs/*.json`, `storybook/story-inventory.json`, `artifacts/storybook/proof-coverage.json`, and the `CT-10B` contract assumptions in `threading.md`.
  - Outputs: repo-owned `CT-11B` contract documentation and field definitions for `storybook/connect/**` and `figma/code-connect/**`.
- **Thread/contract refs**: consumes `THR-04`; reserves `THR-03`; defines `CT-11B`.
- **Implementation notes**: mark `publishedStorybookUrl` or equivalent fields as derived from `CT-10B`; keep vendor-native identifiers secondary; preserve one repo-owned `componentId` as the binding key across all projections.
- **Acceptance criteria**: field ownership and provenance are explicit; no required field depends on unpublished provider state.
- **Test notes**: validate the proposed field set against the current `button` component spec and confirm every required field has a repo-owned source or an explicit provisional rule.
- **Risk/rollback notes**: if `CT-10B` lands with different URL semantics, narrow or rename the link fields rather than broadening vendor-specific truth inside `CT-11B`.

Checklist:

- Implement: write the contract field list and provenance rules.
- Test: compare the field list against existing pilot component metadata.
- Validate: confirm Storybook link fields are clearly provisional until `THR-03` is published.
- Cleanup: remove any field that only mirrors vendor UI or vendor IDs.

#### S1.T2 - Freeze Shared Projection Rules For Storybook And Figma Outputs

- **Outcome**: both output surfaces consume one shared repo-owned identity transform instead of drifting into two separate mapping systems.
- **Inputs/outputs**:
  - Inputs: `CT-11B` field definitions, current `downstreamHooks` in component specs, and expected output locations.
  - Outputs: projection rules for `storybook/connect/<component-id>.json` and `figma/code-connect/<component-id>.json`.
- **Thread/contract refs**: advances `THR-07`; supports `CT-11B`.
- **Implementation notes**: keep the shared projection centered on `componentId`, `exampleStoryIds`, `supportedVariantsSource`, `slotNamesSource`, `codeEntrypoint`, and `figmaComponentRef`; let output-specific adapters shape the final surface without changing identity semantics.
- **Acceptance criteria**: both projection surfaces can be generated from one repo-owned intermediate shape; output-specific fields do not redefine identity.
- **Test notes**: compare a Storybook output example and a Figma output example against the same pilot input record.
- **Risk/rollback notes**: do not let Figma-specific or Storybook-specific terminology leak back into the shared contract if it changes downstream consumer parsing.

Checklist:

- Implement: document the shared projection boundary and output-specific adapters.
- Test: map one pilot component through both outputs on paper or with fixtures.
- Validate: confirm both outputs preserve the same `componentId` and example references.
- Cleanup: remove any adapter rule that changes ownership or authority boundaries.
