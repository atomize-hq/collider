---
slice_id: S2
seam_id: SEAM-9B
slice_kind: delivery
execution_horizon: active
status: decomposed
plan_version: v2
basis:
  currentness: current
  basis_ref: seam.md#basis
  stale_triggers:
    - Any pilot component-spec change that renames `exampleStoryIds`, `supportedVariantsSource`, or `slotNamesSource`.
    - Any `CT-10B` publication that changes how Storybook links should be resolved for the pilot component family.
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

### S2 - Pilot Component Mapping Adoption

- **User/system value**: one real reusable component family proves that the repo-owned mapping contract can bind Storybook proof, code entrypoint metadata, and Figma references without vendor-authored truth.
- **Scope (in/out)**:
  - In: pilot component-spec completion, pilot mapping projections for Storybook and Figma outputs, explicit handling for published-link completeness rules, and one inspectable completeness result for the pilot family.
  - Out: broad rollout to the full reusable-component catalog or final claim-level gating.
- **Acceptance criteria**:
  - The pilot component family has repo-owned values for `codeEntrypoint`, `figmaComponentRef`, supported variants, slot refs, and example stories.
  - Storybook and Figma projection outputs can be derived from the same pilot metadata without separate hand-authored edits.
  - Any Storybook link field is either resolved from published `CT-10B` evidence or explicitly marked unresolved and non-consumable.
  - The pilot output makes it obvious which missing fields still block mapping completeness.
- **Dependencies**: requires `S1` contract baseline plus revalidated `THR-03` and `THR-04`; link completeness now depends on deriving current values from repo-owned inputs, not on waiting for a missing upstream publication.
- **Verification**: pilot walkthrough against [review.md](./review.md#r2---storybook-link-resolution-and-published-handoff) and [review.md](./review.md#r3---pilot-component-mapping-surface).
- **Rollout/safety**: constrain execution to the current pilot family first; prefer unresolved placeholders over guessed Storybook URLs or guessed Figma references.
- **Review surface refs**: [review.md](./review.md#r2---storybook-link-resolution-and-published-handoff), [review.md](./review.md#r3---pilot-component-mapping-surface)

#### S2.T1 - Complete Pilot Metadata At The Component-Spec Source

- **Outcome**: the pilot component spec carries the repo-owned mapping fields that downstream projections need, instead of leaving them to vendor adapters.
- **Inputs/outputs**:
  - Inputs: `storybook/component-specs/button.json`, current proof coverage, and the `CT-11B` field rules from `S1`.
  - Outputs: completed pilot metadata for code entrypoint, Figma reference, variants, slots, and example stories at the repo-owned source.
- **Thread/contract refs**: consumes `THR-04`; supports `CT-11B`.
- **Implementation notes**: treat `storybook/component-specs/button.json` as the source of pilot mapping truth; populate missing fields without weakening the proof-contract ownership boundary.
- **Acceptance criteria**: no required pilot mapping field remains `null` unless `S1` explicitly marks it provisional; output-specific adapters no longer need to guess the missing metadata.
- **Test notes**: compare the updated pilot metadata against the current proof inventory and generated artifacts to confirm every mapping field points at a real repo surface.
- **Risk/rollback notes**: do not widen the pilot scope if the first family still has unresolved identity or ownership questions.

Checklist:

- Implement: complete the pilot component-spec metadata at the repo-owned source.
- Test: compare the planned fields with the pilot proof inventory and artifact refs.
- Validate: confirm the pilot spec can drive both Storybook and Figma projections without extra identity inputs.
- Cleanup: remove any redundant field duplicated from generated outputs.

#### S2.T2 - Generate Pilot Storybook And Figma Projection Outputs

- **Outcome**: the pilot family produces one Storybook projection output and one Figma projection output from the same repo-owned metadata.
- **Inputs/outputs**:
  - Inputs: completed pilot component spec, proof inventory, proof coverage, and published review-contract data.
  - Outputs: pilot `storybook/connect/<component-id>.json` and `figma/code-connect/<component-id>.json` records plus a completeness report.
- **Thread/contract refs**: advances `THR-07`; consumes revalidated `THR-03`.
- **Implementation notes**: emit an explicit incomplete or invalid state when the published Storybook URL cannot be derived from repo-owned inputs; do not invent a fallback URL shape or host convention.
- **Acceptance criteria**: the pilot records show identical component identity across both outputs; unresolved Storybook links are clearly non-consumable; published links only appear from repo-owned review artifacts.
- **Test notes**: inspect the pilot outputs side by side and confirm the same `componentId`, example stories, variants, and slot refs drive both records.
- **Risk/rollback notes**: if the current `CT-10B` contract does not match the planned link field semantics, keep the output incomplete and reopen revalidation instead of broadening the contract ad hoc.

Checklist:

- Implement: define the pilot output shape and completeness report expectations.
- Test: compare the planned Storybook and Figma outputs for one pilot component.
- Validate: confirm link resolution stays bound to the published `CT-10B` contract and does not rely on guessed URLs.
- Cleanup: remove any output field that only exists to mirror vendor-native payloads.
