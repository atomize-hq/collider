---
subslice_id: S1b
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

### S1b — Component-Spec Contract Baseline

- **User/system value**: each reusable component gets one repo-owned spec record that makes identity, required proof kinds, and reserved downstream hooks explicit in one reviewer-visible place.
- **Scope (in/out)**:
  - **In**: `storybook/component-specs/<component-id>.json`; stable `componentId`; tier; required story kinds; owned story refs; generated artifact refs; reserved downstream mapping-hook fields; schema or typed validation shape for component specs.
  - **Out**: pilot-family spec backfill beyond one example record; inventory registration; validator gating or report emission.
- **Acceptance criteria**:
  - Each spec shape makes component identity explicit and independent of folder names or vendor metadata.
  - The spec binds required story coverage by kind instead of leaving coverage implied by prose.
  - Generated token docs, recipe docs, and runtime parity surfaces are referenced as upstream artifacts, not rewritten into the spec.
  - Downstream hooks stay repo-owned and explicit enough that `SEAM-9B` can project from them later without inventing new identity.
- **Dependencies**: `CT-H1`; `CT-H2`; `CT-9B`; `THR-04`; [../review.md](../review.md#r1--proof-contract-authoring-and-review-flow); [../review.md](../review.md#r3--touch-surface-handoff-map)
- **Verification**: validate one sample spec and one intentionally incomplete spec against the frozen schema; confirm a reviewer can answer required proof kinds from the single file without opening multiple stories.
- **Rollout/safety**: keep hook fields reserved and repo-owned. Do not let them become Storybook Connect or Code Connect descriptors in this sub-slice.
- **Basis / gate posture**:
  - Basis status remains `current` from [../seam.md](../seam.md#seam-brief-restated).
  - Inherited seam gates remain `pending-human-review` / `pending` / `pending` / `pending` / `pending` for review, contract, revalidation, landing, and closeout.
- **Primary thread focus**: advance `THR-04` by freezing reusable-component identity and downstream-hook shape inside repo-owned component specs.

#### S1.T2 — Freeze the reusable-component spec schema and identity hooks

- **Outcome**: each reusable component gets one repo-owned spec file that binds stable identity, tier, required proof coverage, and reserved downstream hooks without emitting downstream projections yet.
- **Files**:
  - `storybook/component-specs/<component-id>.json`
  - schema or typed validator definitions that keep the spec shape stable
  - `harness-future-rails/threading.md`

Checklist:

- Implement:
  - Define the component-spec schema and one example record.
  - Reserve repo-owned fields for `componentId`, tier, required story kinds, owned story refs, generated artifact refs, and downstream mapping hooks.
  - Document which fields are reserved for downstream projection work so later seams do not fork the schema.
- Test:
  - Run schema validation on the example record.
  - Run schema validation on an intentionally incomplete spec.
- Validate:
  - Confirm component identity, tier, and required kinds are reviewer-visible in one file.
  - Confirm generated token docs, recipe docs, and runtime parity surfaces stay as references to upstream artifacts.
  - Confirm the hook object names repo-owned entrypoints or references rather than vendor-shaped projection data.
