---
slice_id: S2
seam_id: SEAM-10B
slice_kind: delivery
execution_horizon: next
status: decomposed
plan_version: v1
basis:
  currentness: provisional
  basis_ref: seam.md#basis
  stale_triggers:
    - Any change to proof-tier policy, visual-review requiredness semantics, or parity claim semantics that alters how the evaluator computes the highest earned claim.
    - Any newly published `CT-11B` completeness field or stale-trigger branch that changes mapping refusal behavior.
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

### S2 - Informational Status Evaluator And Refusal Semantics

- **User/system value**: the repo can explain the highest currently earned reusable-component claim and the exact missing or stale rail without conflating advisory status with blocking policy.
- **Scope (in/out)**:
  - In: rail aggregation rules across `CT-8B`, `CT-9B`, `CT-10B`, and `CT-11B`; highest-earned-claim evaluation; refusal, deferral, and stale taxonomy; informational fixture or report examples; mixed-state handling when some rails are current and others are not.
  - Out: declaring a blocking consumer authoritative before `THR-07` is published or changing upstream contract semantics to fit the evaluator.
- **Acceptance criteria**:
  - The evaluator can report the highest earned claim from current upstream status without overclaiming.
  - Refusal reasons name the exact missing, stale, deferred, or out-of-scope rail rather than collapsing everything into one generic failure.
  - Informational mode is explicit and distinguishable from blocking mode in the final status surface.
  - Mixed states remain inspectable when proof and review are current but mapping or parity is not.
- **Dependencies**: requires `S1` contract baseline plus current `CT-8B`, `CT-9B`, and `CT-10B`; mapping completeness remains provisional until `THR-07` publishes.
- **Verification**: review against [review.md](./review.md#r2---upstream-status-aggregation-into-ct-12b) and [review.md](./review.md#r3---informational-versus-blocking-ratchet).
- **Rollout/safety**: keep the first evaluator informational and fail closed on missing or stale upstream evidence rather than guessing a stronger claim.
- **Review surface refs**: [review.md](./review.md#r2---upstream-status-aggregation-into-ct-12b), [review.md](./review.md#r3---informational-versus-blocking-ratchet)

#### S2.T1 - Define Rail Aggregation And Highest-Earned-Claim Semantics

- **Outcome**: the seam defines how upstream rail outcomes combine into one highest-earned reusable-component claim without redefining upstream contracts.
- **Inputs/outputs**:
  - Inputs: `CT-8B`, `CT-9B`, `CT-10B`, and planned `CT-11B` rail summaries from `S1`.
  - Outputs: aggregation rules and earned-claim semantics for `CT-12B`.
- **Thread/contract refs**: consumes `THR-05`, `THR-06`, `THR-07`, and `THR-08`; supports `CT-12B`.
- **Implementation notes**: separate `missing`, `stale`, `deferred`, and `not_applicable` outcomes; never let an unpublished or stale rail masquerade as passing merely because another rail is current.
- **Acceptance criteria**: the same upstream inputs always resolve to the same earned claim and refusal reasons; change-class scoping from `S1` is honored.
- **Test notes**: define at least one current-enough advisory case, one mapping-deferred case, and one stale-parity or stale-review case.
- **Risk/rollback notes**: if the aggregation logic starts implying new upstream meanings, narrow the downstream evaluator and defer the claim branch instead.

Checklist:

- Implement: write the aggregation table and earned-claim rules.
- Test: walk multiple upstream-state combinations through the table.
- Validate: confirm the evaluator never upgrades a claim beyond the published evidence.
- Cleanup: remove any branch that depends on undocumented upstream nuances.

#### S2.T2 - Define Refusal Taxonomy, Freshness Handling, And Fixture Examples

- **Outcome**: downstream consumers can understand why a claim is blocked, deferred, or only informational without reading prose or diffing multiple source artifacts manually.
- **Inputs/outputs**:
  - Inputs: aggregation rules, stale triggers, and expected consumer questions from merge or handoff or release policy.
  - Outputs: refusal taxonomy, freshness semantics, and example outputs or fixtures for `CT-12B`.
- **Thread/contract refs**: supports `CT-12B`; reflects `THR-05`, `THR-06`, `THR-07`, and `THR-08`.
- **Implementation notes**: encode whether a refusal came from stale evidence, unpublished mapping completeness, missing proof coverage, out-of-scope change class, or a consumer-policy deferral; keep refusal reasons additive and machine-readable.
- **Acceptance criteria**: a reviewer can identify the exact blocking or deferred rail from the status artifact alone.
- **Test notes**: include examples for advisory success, blocking review failure, mapping deferral, and non-reusable-component scope.
- **Risk/rollback notes**: do not collapse refusal reasons into prose summaries that later consumers cannot parse deterministically.

Checklist:

- Implement: define refusal codes, freshness posture, and example statuses.
- Test: compare example outputs against the claim matrix and aggregation rules.
- Validate: confirm every refusal code maps back to a single repo-owned upstream rail or scope decision.
- Cleanup: remove any refusal code that depends on manual judgment outside the contract.
