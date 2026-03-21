---
slice_id: S3
seam_id: SEAM-10B
slice_kind: delivery
execution_horizon: next
status: decomposed
plan_version: v1
basis:
  currentness: provisional
  basis_ref: seam.md#basis
  stale_triggers:
    - Any merge, handoff, or release consumer adopting a stronger reusable-component claim surface outside the planned `CT-12B` contract.
    - Any `SEAM-9B` closeout result that changes whether mapping completeness is current enough to move from informational to blocking policy.
gates:
  pre_exec:
    review: inherited
    contract: inherited
    revalidation: inherited
  post_exec:
    landing: pending
    closeout: pending
threads:
  - THR-06
  - THR-07
  - THR-08
contracts_produced:
  - CT-12B
contracts_consumed:
  - CT-9B
  - CT-10B
  - CT-11B
open_remediations:
  - REM-004
candidate_subslices: []
---

### S3 - Consumer Gating And Ratchet Boundaries

- **User/system value**: merge, handoff, and release consumers can adopt `CT-12B` safely because they know which claims are informational, which may block, and which must stay deferred until the upstream mapping handoff is real.
- **Scope (in/out)**:
  - In: consumer entrypoints for local, CI, PR or handoff, and release policy; allowed enforcement boundaries by change class; ratchet rules for moving from informational to blocking claims; stale-trigger and revalidation behavior when upstream rails drift.
  - Out: implementing net-new upstream status rails, forcing reusable-component requirements onto narrower change classes, or declaring mapping-dependent blocking policy current before `THR-07` is published.
- **Acceptance criteria**:
  - Every consumer can point to one allowed `CT-12B` claim surface and one fallback posture when the claim is advisory or deferred.
  - Blocking policy is scoped to reusable-component advancement and cannot silently spread to unrelated changes.
  - Mapping-dependent blocking rules stay disabled until the active seam handoff makes `CT-11B` current basis.
  - Revalidation and stale-trigger behavior is explicit when upstream proof, review, parity, or mapping semantics drift.
- **Dependencies**: requires `S1` and `S2`, published review optionality semantics from `THR-06`, published proof coverage from `THR-08`, and the future `THR-07` handoff before mapping-complete blocking is legal.
- **Verification**: review against [review.md](./review.md#r1---change-class-aware-promotion-decision-flow) and [review.md](./review.md#r3---informational-versus-blocking-ratchet).
- **Rollout/safety**: stage consumers from advisory to blocking deliberately; prefer explicit deferral over broad fail-open or fail-closed behavior when upstream mapping evidence is not yet current.
- **Review surface refs**: [review.md](./review.md#r1---change-class-aware-promotion-decision-flow), [review.md](./review.md#r3---informational-versus-blocking-ratchet)

#### S3.T1 - Freeze Consumer Entry Points And Allowed Claim Surfaces

- **Outcome**: each consumer knows which `CT-12B` fields it may read, which claims it may act on, and which outcomes remain informational only.
- **Inputs/outputs**:
  - Inputs: `CT-12B` contract baseline, current consumer list from the seam brief, and `CT-10B` optionality semantics.
  - Outputs: consumer-boundary plan for local, CI, PR or handoff, and release policy surfaces.
- **Thread/contract refs**: consumes `THR-06` and `THR-08`; supports `CT-12B`.
- **Implementation notes**: keep advisory reporting available early; restrict blocking decisions to explicitly named claim branches and change classes.
- **Acceptance criteria**: no consumer needs to scrape upstream artifacts directly once `CT-12B` is published; no consumer receives a stronger claim than the matrix allows.
- **Test notes**: walk at least one consumer from each class through an advisory case and a blocked case.
- **Risk/rollback notes**: if a consumer cannot be scoped to one claim surface cleanly, leave it advisory until the boundary is narrower.

Checklist:

- Implement: define the allowed consumer reads and actions.
- Test: compare consumer behaviors for advisory and blocked outcomes.
- Validate: confirm consumer boundaries do not bypass `CT-12B`.
- Cleanup: remove any consumer rule that assumes unpublished mapping truth.

#### S3.T2 - Freeze Ratchet Preconditions, Stale Triggers, And Revalidation Rules

- **Outcome**: the seam defines exactly when a claim branch may move from informational to blocking and what upstream changes force the branch back into revalidation.
- **Inputs/outputs**:
  - Inputs: `SEAM-9B` dependency posture, stale triggers from `seam.md`, and the current upstream contract boundaries.
  - Outputs: ratchet policy and revalidation rules for `CT-12B`.
- **Thread/contract refs**: consumes `THR-07`; supports `CT-12B`.
- **Implementation notes**: require a published `THR-07` handoff plus stable `CT-11B` fields before any mapping-complete blocking claim activates; treat stale upstream semantics as a demotion back to informational or blocked, not as silent carry-forward.
- **Acceptance criteria**: the ratchet cannot activate early, and stale-trigger behavior is explicit for proof, review, mapping, and parity drift.
- **Test notes**: compare a ready-to-ratchet case against a `THR-07`-still-identified case and a stale-upstream case.
- **Risk/rollback notes**: never let pack-closeout or release pressure turn provisional mapping semantics into current blocking policy.

Checklist:

- Implement: define the ratchet prerequisites and revalidation branches.
- Test: model ready, deferred, and stale cases.
- Validate: confirm `THR-07` publication is required before mapping-complete blocking activates.
- Cleanup: remove any ratchet rule that depends on unrecorded post-exec truth.
