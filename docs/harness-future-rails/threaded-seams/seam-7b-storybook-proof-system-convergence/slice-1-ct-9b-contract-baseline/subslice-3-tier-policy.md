---
subslice_id: S1c
parent_slice_id: S1
seam_id: SEAM-7B
execution_horizon: active
status: exec-ready
plan_version: v1
basis_ref: ../seam.md#seam-brief-restated
threads:
  - THR-01
  - THR-02
  - THR-04
  - THR-08
contracts_produced:
  - CT-9B
contracts_consumed:
  - CT-H1
  - CT-H2
open_remediations:
  - REM-001
---

### S1c — Tier Policy Baseline

- **User/system value**: reviewers and validators get one concrete tier enum and required-kind matrix, so proof coverage stops depending on folder names or maintainer memory.
- **Scope (in/out)**:
  - **In**: the repo-owned component-tier policy entrypoint; the exact tier enum; the minimum required-kind matrix per tier; brief consumer rationale for each required kind so validators can use the matrix without extra prose.
  - **Out**: validator implementation details; machine-readable report generation; pilot-family story backfill; broad design-system rollout.
- **Acceptance criteria**:
  - The exact tier enum is frozen in the contract rather than inferred from folder structure.
  - Each required kind has a stated downstream consumer or review purpose.
  - The policy can be consumed by a validator without additional prose translation.
  - Non-required kinds are explicit and do not read as blockers.
- **Dependencies**: `CT-9B`; `THR-02`; `THR-08`; downstream needs from `SEAM-8B`, `SEAM-9B`, and `SEAM-10B`; [../review.md](../review.md#r2--proof-metadata-and-validator-data-flow); [../review.md](../review.md#r4--sequence-for-informational-to-required-gating)
- **Verification**: validate that each tier resolves to a finite required-kind set; walk the matrix against one pilot reusable component and confirm the minimum proof set is clear without additional prose.
- **Rollout/safety**: keep the first matrix minimal and tie every required kind to a concrete consumer or review need. Leave optional kinds optional until a later seam proves they must ratchet upward.
- **Basis / gate posture**:
  - Basis status remains `current` from [../seam.md](../seam.md#seam-brief-restated).
  - Inherited seam gates remain `pending-human-review` / `pending` / `pending` / `pending` / `pending` for review, contract, revalidation, landing, and closeout.
- **Primary thread focus**: advance `THR-02` and `THR-08` by publishing the required-coverage matrix that later validators and promotion rails consume directly.

#### S1.T3 — Publish the component-tier required-coverage policy

- **Outcome**: the repo has one concrete matrix that names the exact tier enum and the minimum proof kinds required per tier.
- **Files**:
  - `storybook/component-tier-policy.json` or an equivalent checked-in policy module consumed by validators
  - `harness-future-rails/threading.md`
  - seam-local notes describing concrete downstream consumers or review purposes per required kind

Checklist:

- Implement:
  - Add the tier-policy entrypoint that the validator can consume directly.
  - Freeze the exact tier enum and the finite required-kind set per tier.
  - Mark non-required kinds as optional so future rails do not mistake them for blockers.
- Test:
  - Validate that each tier resolves to a finite required-kind set.
  - Walk one pilot reusable component through the matrix and confirm the minimum proof coverage is unambiguous.
- Validate:
  - Confirm every required kind has a concrete downstream consumer or review purpose.
  - Confirm the policy does not require future seams to invent new proof kinds to explain coverage gaps.
  - Confirm the matrix stays minimal enough not to stall initial pilot adoption.
