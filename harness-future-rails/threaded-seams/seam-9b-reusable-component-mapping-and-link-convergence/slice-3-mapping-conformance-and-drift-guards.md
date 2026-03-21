---
slice_id: S3
seam_id: SEAM-9B
slice_kind: delivery
execution_horizon: active
status: decomposed
plan_version: v2
basis:
  currentness: current
  basis_ref: seam.md#basis
  stale_triggers:
    - Any drift between the shared `CT-11B` intermediate shape and the emitted Storybook or Figma outputs.
    - Any downstream promotion consumer expecting mapping completeness fields not frozen by `S1`.
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

### S3 - Mapping Conformance And Drift Guards

- **User/system value**: later seams can trust mapping completeness because the repo enforces one structural contract and fails closed when required fields, provenance, or freshness drift.
- **Scope (in/out)**:
  - In: structural validation for `CT-11B`, completeness reporting, provenance or freshness checks for Storybook links, and drift guards that keep Storybook and Figma projections aligned.
  - Out: promotion policy decisions, final closeout realization, or widening the mapping contract beyond the pilot and shared projection boundary.
- **Acceptance criteria**:
  - A validator can prove whether a `CT-11B` record is structurally complete, provisionally incomplete, or invalid.
  - The repo can distinguish missing pilot metadata from a stale or mismatched published Storybook link.
  - Drift between `storybook/connect/**` and `figma/code-connect/**` is inspectable from one shared contract, not by comparing vendor outputs manually.
  - `SEAM-10B` can identify which mapping fields are authoritative and which stale triggers require revalidation.
- **Dependencies**: requires `S1` contract rules, `S2` pilot output shape, and the revalidated `THR-03` boundary that defines current Storybook-link provenance.
- **Verification**: validator and reporting review against [review.md](./review.md#r1---repo-owned-mapping-projection-flow) and [review.md](./review.md#r3---pilot-component-mapping-surface).
- **Rollout/safety**: keep the first validator focused on repo-owned contract semantics and unresolved-versus-invalid distinctions; avoid parsing raw vendor payloads directly.
- **Review surface refs**: [review.md](./review.md#r1---repo-owned-mapping-projection-flow), [review.md](./review.md#r3---pilot-component-mapping-surface)

#### S3.T1 - Add Structural Validation And Completeness States

- **Outcome**: the seam has one validator that classifies pilot mapping records as ready, incomplete, or invalid based on repo-owned contract rules.
- **Inputs/outputs**:
  - Inputs: `CT-11B` field rules, pilot projection outputs, and the current `CT-10B` contract boundary.
  - Outputs: validator expectations, fixture matrix, and machine-readable completeness states.
- **Thread/contract refs**: advances `THR-07`; inspects revalidated `THR-03`.
- **Implementation notes**: the old unpublished-thread exception is gone; missing `publishedStorybookUrl` values must now surface as explicit incomplete or invalid states under `CT-11B`, depending on the record's claimed completeness.
- **Acceptance criteria**: the validator distinguishes structural failure from incomplete repo-owned mapping work; field-level failures identify the missing or stale contract fact directly.
- **Test notes**: define at least one valid pilot case, one incomplete link case, and one invalid-provenance case.
- **Risk/rollback notes**: do not mix promotion semantics into this validator; it should prove mapping contract health, not decide reusable-component advancement.

Checklist:

- Implement: define validator expectations and completeness-state semantics.
- Test: cover valid, incomplete, and invalid pilot cases.
- Validate: confirm missing links are never excused by unpublished-thread logic once `THR-03` is revalidated.
- Cleanup: remove any check that depends on undocumented vendor response fields.

#### S3.T2 - Freeze Drift Guards For Shared Projection Outputs

- **Outcome**: Storybook and Figma outputs stay aligned because both are checked against the same repo-owned intermediate shape and provenance rules.
- **Inputs/outputs**:
  - Inputs: shared `CT-11B` intermediate record, emitted Storybook and Figma outputs, and downstream consumer expectations from `threading.md`.
  - Outputs: drift-guard rules and reporting that name mismatched identity, variants, slots, example stories, or provenance fields.
- **Thread/contract refs**: supports `CT-11B`; prepares `THR-07` for publication.
- **Implementation notes**: check for mismatched `componentId`, inconsistent example stories, missing Figma references, and Storybook link fields that bypass the shared contract.
- **Acceptance criteria**: drift can be reported without reading prose or vendor UIs; downstream consumers can point to one shared contract when a mapping record is rejected.
- **Test notes**: compare one aligned pilot output pair and one intentionally divergent pair.
- **Risk/rollback notes**: if downstream consumers need more fields, add them to `CT-11B` first instead of encoding consumer-specific checks in one output only.

Checklist:

- Implement: define drift-guard comparisons across both output surfaces.
- Test: review aligned and divergent pilot examples.
- Validate: confirm all reported drift maps back to the shared contract.
- Cleanup: remove any output-only rule that lacks a shared-contract justification.
