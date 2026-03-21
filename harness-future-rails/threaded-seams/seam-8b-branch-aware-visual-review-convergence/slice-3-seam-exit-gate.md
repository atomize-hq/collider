---
slice_id: S3
seam_id: SEAM-8B
slice_kind: seam_exit_gate
execution_horizon: active
status: exec-ready
plan_version: v2
basis:
  currentness: current
  basis_ref: seam.md#basis
  stale_triggers:
    - Any provider transport, URL-shape, or artifact-freshness change that broadens `CT-10B` beyond the repo-owned contract must be revalidated here before closeout.
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
  - THR-06
contracts_produced:
  - CT-10B
contracts_consumed:
  - CT-9B
open_remediations:
  - REM-002
---

### S3 — Seam-Exit Gate

- **User/system value**: `CT-10B` becomes inspectable and safe for future seams to consume because closeout evidence, freshness rules, and handoff boundaries are captured explicitly instead of implied.
- **Scope (in/out)**:
  - In: status validation, fixtures for stale and malformed payloads, named-check conclusion semantics, and the downstream handoff conditions that move `THR-03` and `THR-06` toward published.
  - Out: broad visual-review enforcement for all changes, Storybook link generation, or final reusable-component promotion policy.
- **Acceptance criteria**:
  - A local or CI validator fails missing, stale, or malformed `CT-10B` payloads.
  - The `chromatic-review` check semantics are explicit about execution health versus claim-level policy.
  - The seam records exactly what evidence downstream seams may consume and what must be revalidated before they do.
  - The slice makes upstream handoff completeness explicit by consuming the recorded `SEAM-7B` seam-exit record alongside the landed `CT-9B` contract.
- **Dependencies**: requires `S2` pilot artifact emission, the landed `CT-9B` contract, and the recorded `SEAM-7B` seam-exit handoff during downstream readiness and closeout.
- **Verification**: validator and fixture review against [review.md](./review.md#r2--ci-and-status-normalization-data-flow) and [review.md](./review.md#r4--sequence-for-optional-to-consumable-review-status).
- **Rollout/safety**: start with validator-enforced freshness and artifact presence; keep claim-level blocking behavior deferred until `SEAM-10B` consumes the published evidence.
- **Review surface refs**: [review.md](./review.md#r2--ci-and-status-normalization-data-flow), [review.md](./review.md#r3--touch-surface-handoff-map), [review.md](./review.md#r4--sequence-for-optional-to-consumable-review-status)

#### S3.T1 — Add Status Validation And Failure Fixtures

- **Outcome**: the repo has one validator entrypoint that proves `CT-10B` is present, current, and structurally correct.
- **Inputs/outputs**:
  - Inputs: `storybook/chromatic-review-contract.md`, generated and fixture status payloads.
  - Outputs: `scripts/validate-chromatic-status.mjs`, `scripts/fixtures/chromatic-status/**`, and an optional `package.json` validation script.
- **Thread/contract refs**: defines `CT-10B`; advances `THR-03`.
- **Implementation notes**: validate version, branch, git SHA, proof-scope linkage, build URL presence, diff-outcome enum, review mode, and freshness expectations; include invalid fixtures for stale timestamps, mismatched revisions, missing proof-scope refs, and malformed URL or conclusion fields.
- **Acceptance criteria**: valid fixtures pass; malformed, stale, or mismatched fixtures fail with machine-readable reasons; the validator can run locally without the provider.
- **Test notes**: run the validator against every fixture and review the failure text for downstream usefulness.
- **Risk/rollback notes**: keep the validator focused on repo-owned contract semantics; do not couple it directly to raw provider payload shape.

Checklist:

- Implement: add the validator entrypoint and fixtures.
- Test: execute the validator across valid and invalid payloads.
- Validate: confirm failures identify the missing or stale contract fact directly.
- Cleanup: remove any fixture field not backed by the contract document.

#### S3.T2 — Freeze Named-Check Conclusions And Rollout Ratchet

- **Outcome**: the named `chromatic-review` check reports execution health consistently while the artifact carries the claim-level policy semantics.
- **Inputs/outputs**:
  - Inputs: `storybook/chromatic-review-policy.md`, CI workflow plan, `THR-06` notes.
  - Outputs: explicit check-conclusion rules in `.github/workflows/ci.yml` and rollout guidance in `storybook/chromatic-review-policy.md`.
- **Thread/contract refs**: advances `THR-06`; supports `CT-10B`.
- **Implementation notes**: treat the named check as the health signal for whether the review rail ran and emitted a current artifact; encode whether review is informational or claim-relevant in `review.mode` and related artifact fields instead of overloading the check name or conclusion.
- **Acceptance criteria**: the plan distinguishes execution failure from "review not yet required for this claim"; downstream promotion work can consume the artifact without inferring policy from GitHub check behavior.
- **Test notes**: review at least one healthy informational run and one unhealthy execution failure case to confirm the distinction is obvious.
- **Risk/rollback notes**: do not mark claim-level policy as blocking in `SEAM-8B`; that ownership remains with `SEAM-10B`.

Checklist:

- Implement: document the `chromatic-review` conclusion rules and artifact-mode semantics.
- Test: compare one informational and one failed case against the policy text.
- Validate: confirm downstream consumers can ignore GitHub-specific semantics and read `CT-10B` directly.
- Cleanup: remove any wording that implies visual approval is already a merge gate.

#### S3.T3 — Publish Downstream Handoff Evidence

- **Outcome**: `SEAM-9B` and `SEAM-10B` know exactly when they may consume `CT-10B` and which fields or revalidation triggers matter.
- **Inputs/outputs**:
  - Inputs: pilot artifact evidence, validator output, `threading.md`, and `harness-future-rails/governance/seam-8b-closeout.md`.
  - Outputs: closeout-ready evidence notes in `harness-future-rails/governance/seam-8b-closeout.md` and downstream-boundary language in `storybook/chromatic-review-contract.md`.
- **Thread/contract refs**: advances `THR-03` and `THR-06`; closes the seam-local `CT-10B` handoff.
- **Implementation notes**: record which fields `SEAM-9B` may consume for published Storybook URLs and which fields `SEAM-10B` may consume for review-mode semantics; name the revalidation triggers for provider changes, build URL shape changes, proof-scope drift, and artifact freshness windows.
- **Acceptance criteria**: downstream seams can point to one closeout record and one contract document instead of reverse-engineering pilot CI runs; revalidation triggers are explicit.
- **Test notes**: review the closeout draft against the contract and validator so field names and evidence references stay aligned.
- **Risk/rollback notes**: if the pilot URL shape or provider behavior changes before landing, keep the thread open and mark the plan stale rather than silently broadening the contract.

Checklist:

- Implement: prefill the seam closeout evidence expectations and downstream boundary notes.
- Test: compare the closeout draft against the pilot artifact and validator output.
- Validate: confirm `THR-03` and `THR-06` advancement criteria are explicit.
- Cleanup: remove any downstream guidance that depends on vendor-only behavior or undocumented manual steps.
