---
slice_id: S1
seam_id: SEAM-10B
slice_kind: delivery
execution_horizon: next
status: decomposed
plan_version: v1
basis:
  currentness: provisional
  basis_ref: seam.md#basis
  stale_triggers:
    - Any change to `CT-8B`, `CT-9B`, or `CT-10B` field-consumption boundaries that would rename, narrow, or widen the evidence this slice is allowed to summarize.
    - Any `SEAM-9B` closeout or `CT-11B` field-set change that alters how mapping completeness may appear in the claim matrix.
gates:
  pre_exec:
    review: inherited
    contract: inherited
    revalidation: inherited
  post_exec:
    landing: pending
    closeout: pending
threads:
  - THR-05
  - THR-06
  - THR-07
  - THR-08
contracts_produced:
  - CT-12B
contracts_consumed:
  - CT-8B
  - CT-9B
  - CT-10B
  - CT-11B
open_remediations:
  - REM-004
candidate_subslices: []
---

### S1 - CT-12B Contract And Claim-Matrix Baseline

- **User/system value**: one repo-owned status contract makes reusable-component promotion inspectable without requiring maintainers or AI agents to reconstruct proof, review, mapping, and parity posture from separate artifacts.
- **Scope (in/out)**:
  - In: the `CT-12B` artifact shape at `artifacts/harness/reusable-component-status.json`; evidence provenance and freshness fields; claim profiles by change class; highest-earned-level semantics; refusal and deferral reasons; informational-versus-blocking mode flags.
  - Out: implementing upstream rails, broadening reusable-component rigor to unrelated changes, or activating mapping-dependent blocking policy before `S3` defines the consumer ratchet.
- **Acceptance criteria**:
  - `CT-12B` names which upstream contract revision and outcome each rail summary came from instead of duplicating upstream payloads.
  - The claim matrix distinguishes reusable-component advancement from narrower change classes and keeps the latter on smaller gate profiles.
  - Mapping-dependent claims consume published `CT-11B` basis without reinterpreting it, while blocking adoption stays deferred to `S3`.
  - Consumers can derive the highest earned claim and refusal reasons mechanically from the contract shape.
- **Dependencies**: published `CT-8B`, `CT-9B`, `CT-10B`, and `CT-11B`.
- **Verification**: review against [review.md](./review.md#r1---change-class-aware-promotion-decision-flow) and [review.md](./review.md#r2---upstream-status-aggregation-into-ct-12b).
- **Rollout/safety**: start additive and informational; keep stronger claim branches disabled or deferred until the active seam publishes mapping completeness.
- **Review surface refs**: [review.md](./review.md#r1---change-class-aware-promotion-decision-flow), [review.md](./review.md#r2---upstream-status-aggregation-into-ct-12b)

#### S1.T1 - Freeze The CT-12B Status Artifact Shape And Provenance Rules

- **Outcome**: the seam defines the exact `CT-12B` fields, including upstream revision references, freshness posture, per-rail summaries, and final claim output.
- **Inputs/outputs**:
  - Inputs: `threading.md`, `CT-8B`, `CT-9B`, `CT-10B`, and the planned `CT-11B` consumption boundary.
  - Outputs: repo-owned `CT-12B` schema and provenance rules for `artifacts/harness/reusable-component-status.json`.
- **Thread/contract refs**: consumes `THR-05`, `THR-06`, `THR-07`, and `THR-08`; defines `CT-12B`.
- **Implementation notes**: record upstream source refs, revision or freshness markers, and rail-level outcomes explicitly; keep vendor-native payloads and branch-only details outside the final contract unless they are already part of an upstream repo-owned contract.
- **Acceptance criteria**: no required `CT-12B` field depends on undocumented provider state or prose interpretation.
- **Test notes**: compare the proposed field set against the current `CT-8B`, `CT-9B`, and `CT-10B` outputs and the documented `CT-11B` plan to confirm every field has a clear source or deferral rule.
- **Risk/rollback notes**: if any upstream field boundary is unstable, narrow `CT-12B` rather than inventing a broader downstream summary.

Checklist:

- Implement: write the contract field list, provenance rules, and freshness posture.
- Test: map current upstream artifacts into the proposed field set.
- Validate: confirm no field bypasses repo-owned contract boundaries.
- Cleanup: remove any field that only mirrors vendor UI or vendor-native terminology.

#### S1.T2 - Freeze Claim Profiles And Change-Class Scoping

- **Outcome**: the seam defines which claims apply to reusable-component advancement versus narrower change classes, and which upstream rails each profile may require.
- **Inputs/outputs**:
  - Inputs: seam brief scope rules, `CT-8B` parity semantics, `CT-9B` proof coverage policy, `CT-10B` review optionality semantics, and provisional `CT-11B` completeness expectations.
  - Outputs: claim matrix and change-class policy for `CT-12B`.
- **Thread/contract refs**: consumes `THR-05`, `THR-06`, `THR-07`, and `THR-08`.
- **Implementation notes**: keep reusable-component advancement separate from token-only, docs-only, and proof-only changes; mark mapping-required claims as deferred until `CT-11B` is current.
- **Acceptance criteria**: the policy cannot accidentally apply full reusable-component rails to unrelated changes; claim escalation rules are explicit and mechanically testable.
- **Test notes**: sketch at least one reusable-component advancement case and one narrower change-class case and confirm they land on different allowed profiles.
- **Risk/rollback notes**: if a change class cannot be scoped cleanly, keep it informational until the consumer boundary is narrowed further.

Checklist:

- Implement: define the claim profiles and their required or informational rails.
- Test: compare reusable-component and non-reusable-component scenarios against the matrix.
- Validate: confirm mapping is treated as current published basis while blocking ratchets remain deferred to `S3`.
- Cleanup: remove any claim branch that cannot name its allowed upstream evidence surface.
