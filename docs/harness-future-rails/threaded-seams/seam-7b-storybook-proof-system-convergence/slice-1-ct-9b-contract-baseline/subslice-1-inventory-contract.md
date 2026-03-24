---
subslice_id: S1a
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

### S1a — Inventory Contract Baseline

- **User/system value**: downstream review and promotion rails get one stable, repo-owned inventory contract for proof coverage instead of inferring it from stories or runtime output.
- **Scope (in/out)**:
  - **In**: `storybook/story-inventory.json`; its versioning rule; stable component references; validator-kind vocabulary; the schema or typed validator entrypoint that freezes those rules.
  - **Out**: component-spec schema authoring; tier-policy publication; pilot-family backfill; required-gate ratcheting.
- **Acceptance criteria**:
  - `CT-9B` names the validator kind set exactly as listed in `harness-future-rails/threading.md`: `default`, `variant-matrix`, `state-matrix`, `actions`, `controlled`, `keyboard`, `focus`, `workflow`, `motion`, `async`, `docs`, `responsive`, `composition`.
  - The inventory contract defines a version field, stable component identity, and pointers to proof-story coverage without storing token or recipe truth locally.
  - Breaking changes to the inventory shape require an explicit version bump rule in the contract.
  - Story refs remain stable enough for later visual-review selection without inventing new identity rules.
- **Dependencies**: inherited `SEAM-4`; `CT-H1`; `CT-H2`; `THR-01`; [../review.md](../review.md#r1--proof-contract-authoring-and-review-flow); [../review.md](../review.md#r2--proof-metadata-and-validator-data-flow)
- **Verification**: compare the frozen vocabulary and versioning rules line-by-line against `harness-future-rails/threading.md`; dry-run one valid sample entry and one invalid unknown-kind entry through the schema or typed validator entrypoint.
- **Rollout/safety**: keep this sub-slice contract-definition only. Do not backfill component data here, and keep generated token or recipe surfaces as references rather than copied truth.
- **Basis / gate posture**:
  - Basis status remains `current` from [../seam.md](../seam.md#seam-brief-restated).
  - Inherited seam gates remain `pending-human-review` / `pending` / `pending` / `pending` / `pending` for review, contract, revalidation, landing, and closeout.
- **Primary thread focus**: revalidate `THR-01` and advance `THR-02` plus `THR-08` by freezing the inventory’s owned vocabulary and coverage facts.

#### S1.T1 — Freeze the proof inventory schema and vocabulary

- **Outcome**: `storybook/story-inventory.json` becomes a repo-owned contract with explicit versioning, stable component references, and the exact validator kind vocabulary downstream seams must consume.
- **Files**:
  - `storybook/story-inventory.json`
  - `storybook/story-inventory.schema.json` or `scripts/storybook/validate-story-inventory.ts`
  - `harness-future-rails/threading.md`

Checklist:

- Implement:
  - Author the inventory contract and its schema or typed validator entrypoint.
  - Freeze one root version field, one stable component identifier field, one owned list of implemented proof story refs, and one owned list of validator kinds per component.
  - Add cross-links back to `harness-future-rails/threading.md` so later seams reuse the same vocabulary.
- Test:
  - Validate one sample component entry against the schema.
  - Validate an intentionally invalid validator kind and a missing component ID.
- Validate:
  - Confirm generated token docs and recipe docs are referenced, never duplicated.
  - Confirm no validator kind outside the `threading.md` vocabulary is accepted.
  - Confirm the contract remains repo-authored and reviewable rather than runtime-generated.
