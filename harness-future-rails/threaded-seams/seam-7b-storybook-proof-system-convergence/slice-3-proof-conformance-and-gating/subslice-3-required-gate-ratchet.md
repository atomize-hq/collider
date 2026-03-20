---
subslice_id: S3c
parent_slice_id: S3
seam_id: SEAM-7B
execution_horizon: active
status: exec-ready
plan_version: v1
basis_ref: ../seam.md#seam-brief-restated
threads:
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

### S3c — Required Gate Ratchet

- **User/system value**: `SEAM-8B` and later rails need an explicit point where `CT-9B` moves from informational validation to a required pilot-scope gate, with clear evidence rules for when seam-owned outbound threads may be treated as published.
- **Scope (in/out)**:
  - **In**: one named repo-owned gate or task-runner entrypoint; explicit publication criteria for `THR-02`, `THR-04`, and `THR-08`; the dedicated pilot-scope ratchet from informational mode to required mode; closure evidence for `REM-001`.
  - **Out**: broad design-system backfill, non-pilot enforcement, Chromatic policy, mapping or link projection behavior, or downstream seam implementation.
- **Acceptance criteria**:
  - The repo exposes one named command or gate that asserts `CT-9B` validity for the pilot scope.
  - Gate conditions for publishing `THR-02`, `THR-04`, and `THR-08` are explicit and reviewable.
  - The required gate depends on green structural validation plus the pilot proof-coverage report, not on ambiguous prose.
  - Any remaining broad backfill work is explicitly separated from the first publication event.
- **Dependencies**:
  - `S3a`
  - `S3b`
  - `S2b`
  - `REM-001`
  - `CT-9B`
  - `THR-02`
  - `THR-04`
  - `THR-08`
  - [../review.md](../review.md#r3--touch-surface-handoff-map)
  - [../review.md](../review.md#r4--sequence-for-informational-to-required-gating)
- **Verification**:
  - Run the named gate once on complete pilot data and once with an intentionally removed required kind.
  - Confirm failure output is actionable and points maintainers to the missing proof fact rather than generic CI noise.
  - Confirm seam closeout can cite specific report and gate evidence when marking outbound threads published.
- **Rollout/safety**:
  - Land the ratchet in a dedicated change after `S3a` and `S3b` are green so failures are attributable to required coverage, not schema churn.
  - Limit the first required scope to the pilot family and defer broader rollout to later work.
- **Basis / gate posture**:
  - Basis status remains `current` from [../seam.md](../seam.md#seam-brief-restated).
  - Inherited seam gates remain `pending-human-review` / `pending` / `pending` / `pending` / `pending` for review, contract, revalidation, landing, and closeout until the named required gate evidence lands.
- **Primary thread focus**: advance `THR-02`, `THR-04`, and `THR-08` from identified to publishable by defining the evidence and ratchet that turns `CT-9B` into a required pilot contract.

#### S3.T3 — Ratchet CT-9B from informational mode to required gate

- **Outcome**: one named pilot-scope gate moves `CT-9B` from informational validation to a required prerequisite for downstream seam consumption.
- **Files**:
  - task-runner or CI entrypoints under `package.json`, `scripts/**`, or repo automation config
  - `artifacts/storybook/proof-coverage.json`
  - seam closeout or implementation-note surfaces under `harness-future-rails/**`
- **Thread/contract refs**: consumes `CT-9B`; advances `THR-02`, `THR-04`, and `THR-08`; closes `REM-001` once evidence lands.

Checklist:

- Implement:
  - Add one named required gate that depends on green pilot structural validation and proof-coverage output.
  - Document the exact publication evidence for `THR-02`, `THR-04`, and `THR-08`.
  - Keep non-pilot rollout explicitly out of the first required gate.
- Test:
  - Run the gate on complete pilot data.
  - Re-run with an intentionally removed required kind to prove the failure mode is actionable.
- Validate:
  - Confirm the gate gives `SEAM-8B` a concrete publication basis instead of prose.
  - Confirm the ratchet is isolated enough that coverage failures are attributable and reviewable.
  - Confirm remaining broad backfill work stays clearly separated from contract publication.
