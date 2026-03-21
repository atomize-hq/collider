---
subslice_id: S1c
parent_slice: S1
seam_id: SEAM-8B
subslice_kind: delivery
execution_horizon: active
status: exec-ready
basis:
  currentness: current
  basis_ref: ../seam.md#basis
  stale_triggers:
    - Any change to landed `CT-9B` field names, proof-scope selection, or component-tier policy must be reflected here before execution starts.
gates:
  pre_exec:
    review: inherited
    contract: inherited
    revalidation: inherited
  post_exec:
    landing: pending
    closeout: pending
threads:
  - THR-02
  - THR-06
contracts_touched:
  - CT-9B
  - CT-10B
open_remediations:
  - REM-002
subslice_layout: expanded
---

### S1c - Review-Scope And Optionality Policy

- **User/system value**: the repo publishes one explicit review-scope and optionality policy, so downstream promotion work reads repo-owned semantics from `CT-10B` instead of inferring them from GitHub checks or vendor UI.
- **Scope (in/out)**:
  - In:
    - `storybook/chromatic-review-policy.md`
    - `review.mode`, `review.scope`, and `review.requiredForClaim` contract fields
    - Mapping from landed `CT-9B` proof scope into branch-review scope and claim relevance
  - Out:
    - Provider publish mechanics
    - Final promotion gating or merge blocking
    - Downstream Storybook link generation
- **Acceptance criteria**:
  - The policy ties review scope to repo-owned component tiers and selected component IDs from `CT-9B`.
  - Initial review modes are limited to `informational` and `claim-required`.
  - Deferred or skipped runs explain why the rail did not execute for the branch or claim type.
  - No policy statement requires vendor UI inspection or overloads GitHub check conclusions with claim-level semantics.
- **Dependencies**:
  - Landed `CT-9B` inventory and component-tier policy semantics
  - `THR-06` downstream review-mode consumer expectations
  - [../review.md](../review.md#r1--branch-aware-review-publication-workflow)
  - [../review.md](../review.md#r4--sequence-for-optional-to-consumable-review-status)
- **Verification**:
  - Review one intentionally deferred example and one claim-relevant example against the proposed policy text.
  - Confirm the selected proof scope comes only from `CT-9B`.
- **Rollout/safety**: keep visual review non-universal and non-blocking in this seam. Claim-level ratcheting stays owned by `SEAM-10B`.
- **Review surface refs**:
  - [../review.md](../review.md#r1--branch-aware-review-publication-workflow)
  - [../review.md](../review.md#r4--sequence-for-optional-to-consumable-review-status)

#### S1c.T1 - Freeze Review Scope, Modes, And Claim-Relevance Policy

- **Outcome**: the seam has one concrete policy entrypoint that explains exactly when branch review is informational, claim-required, deferred, or out of scope for the pilot.
- **Files**:
  - `storybook/chromatic-review-policy.md`
  - `storybook/chromatic-review-contract.md`
- **Thread/contract refs**:
  - Consumes `CT-9B`
  - Advances `THR-02`
  - Advances `THR-06`
  - Defines `CT-10B`
- **Acceptance criteria**:
  - Policy text names the pilot proof scope and initial rollout mode explicitly.
  - The contract exposes the exact artifact fields downstream promotion work may consume.
  - The named check does not imply mandatory approval semantics before `SEAM-10B` promotes the rail.
- **Test notes**:
  - Draft one deferred payload and one claim-required payload against the contract fields.
  - Confirm both examples stay understandable without GitHub- or vendor-specific interpretation.

Checklist:

- Implement: author the policy doc and align the related `CT-10B` contract fields.
- Test: draft deferred and claim-required payload examples against the frozen semantics.
- Validate: confirm review scope is derived from `CT-9B` only and that claim-level enforcement stays out of `SEAM-8B`.
