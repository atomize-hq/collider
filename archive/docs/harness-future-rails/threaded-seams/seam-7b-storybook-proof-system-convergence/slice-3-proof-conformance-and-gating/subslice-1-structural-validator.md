---
subslice_id: S3a
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

### S3a — Structural Validator

- **User/system value**: downstream rails can trust `CT-9B` only if one seam-local validator proves the inventory and component-spec surfaces are structurally valid before any coverage report or required gate consumes them.
- **Scope (in/out)**:
  - **In**: validator entrypoint ownership under `scripts/**` or `storybook/**`; schema-shape checks for `storybook/story-inventory.json` and `storybook/component-specs/**`; validator-kind vocabulary enforcement; spec-to-inventory referential integrity; fixtures that exercise broken refs and unknown kinds.
  - **Out**: generated report publication, required-gate ratcheting, downstream visual-review or mapping policy, broad story backfill beyond the pilot.
- **Acceptance criteria**:
  - The validator fails cleanly on schema drift, unknown validator kinds, duplicate component IDs, missing spec files, broken story refs, and generated artifact refs that no longer resolve to upstream-owned surfaces.
  - Structural failures are distinguishable from missing-coverage failures so `S3b` can build a stable report on top of this entrypoint.
  - Referential integrity across inventory entries, component specs, and generated artifact refs is enforced without depending on downstream seam code.
  - Passing and failing fixtures exist for the pilot contract boundary, including duplicate-ID, unknown-kind, and missing-ref examples.
- **Dependencies**:
  - `S1a`, `S1b`, `S1c`
  - `S2a`, `S2b`
  - `CT-9B`
  - `CT-H1`
  - `CT-H2`
  - `THR-02`
  - `THR-04`
  - `THR-08`
  - [../review.md](../review.md#r2--proof-metadata-and-validator-data-flow)
  - [../review.md](../review.md#r3--touch-surface-handoff-map)
- **Verification**:
  - Run the validator once on valid pilot data and once each on duplicate-ID, unknown-kind, missing-spec, and broken-ref fixtures.
  - Confirm failure output names the broken contract field or unresolved reference directly.
  - Confirm the validator runs without any `SEAM-8B`, `SEAM-9B`, or `SEAM-10B` code present.
- **Rollout/safety**:
  - Keep this sub-slice informational-only. It defines the validator contract and failure taxonomy but does not yet publish the machine-readable report or make the gate required.
  - Preserve upstream ownership by validating generated token docs and recipe docs as references, never as copied truth.
- **Basis / gate posture**:
  - Basis status remains `current` from [../seam.md](../seam.md#seam-brief-restated).
  - Inherited seam gates remain `pending-human-review` / `pending` / `pending` / `pending` / `pending` for review, contract, revalidation, landing, and closeout.
- **Primary thread focus**: advance `THR-02`, `THR-04`, and `THR-08` by making `CT-9B` structurally inspectable before any required enforcement.

#### S3.T1 — Implement structural validation for inventory and component specs

- **Outcome**: one validator entrypoint proves that inventory and component-spec inputs are structurally sound and correctly linked before any coverage report or gate consumes them.
- **Files**:
  - `scripts/**` or `storybook/**`
  - `storybook/story-inventory.json`
  - `storybook/component-specs/**`
  - validator fixtures under `storybook/**` or `artifacts/**`
- **Thread/contract refs**: consumes `CT-9B`, `CT-H1`, and `CT-H2`; advances `THR-02`, `THR-04`, and `THR-08`.

Checklist:

- Implement:
  - Add one seam-local validator entrypoint that owns structural checks for inventory, component specs, and referential integrity.
  - Freeze the validator-kind vocabulary to the `harness-future-rails/threading.md` control plane and reject unknown kinds.
  - Validate generated artifact refs as pointers to upstream-owned surfaces rather than freeform strings.
- Test:
  - Run the validator on one valid pilot sample.
  - Add intentionally broken cases for duplicate IDs, unknown kinds, missing spec files, broken story refs, and unresolved generated artifact refs.
- Validate:
  - Confirm structural failures are reported separately from missing-coverage failures.
  - Confirm no downstream seam policy leaks into this validator.
  - Confirm the validator stays runnable locally without downstream rails.
