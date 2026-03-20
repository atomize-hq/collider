---
subslice_id: S3b
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

### S3b — Proof Coverage Report

- **User/system value**: maintainers and later rails need one generated, machine-readable proof-coverage surface so they can inspect readiness without reading prose or scraping Storybook state.
- **Scope (in/out)**:
  - **In**: generating `artifacts/storybook/proof-coverage.json` or the equivalent repo-owned report path; normalizing validator output into stable fields; optional concise human-readable summary emitted from the same run; passing and failing report snapshots for the pilot family.
  - **Out**: structural validator authoring, broad story backfill, vendor-shaped review URLs, mapping descriptors, or the required-gate ratchet itself.
- **Acceptance criteria**:
  - The report identifies component ID, tier, required kinds, implemented kinds, missing kinds, and referenced generated artifacts for the pilot scope.
  - The report is generated directly from validator output so it cannot drift from `CT-9B`.
  - Passing and failing pilot snapshots make report drift easy to review.
  - The report field set is stable enough for `SEAM-8B`, `SEAM-9B`, and `SEAM-10B` to consume later without prose scraping.
- **Dependencies**:
  - `S3a`
  - `S2b`
  - `CT-9B`
  - `CT-H1`
  - `CT-H2`
  - `THR-02`
  - `THR-04`
  - `THR-08`
  - [../review.md](../review.md#r2--proof-metadata-and-validator-data-flow)
  - [../review.md](../review.md#r4--sequence-for-informational-to-required-gating)
- **Verification**:
  - Generate one passing pilot report and one failing report with an intentionally missing required kind.
  - Confirm reviewers can tell which components are ready and which kinds are missing without opening story files manually.
  - Confirm the report contains proof facts only and no downstream vendor-specific projections.
- **Rollout/safety**:
  - Keep the report generated from the validator and scoped to proof-coverage facts only.
  - Freeze the path and field names once downstream seams begin consuming the report, and defer any shape expansion until a later seam explicitly owns it.
- **Basis / gate posture**:
  - Basis status remains `current` from [../seam.md](../seam.md#seam-brief-restated).
  - Inherited seam gates remain `pending-human-review` / `pending` / `pending` / `pending` / `pending` for review, contract, revalidation, landing, and closeout.
- **Primary thread focus**: advance `THR-08` and support `THR-02` plus `THR-04` by publishing one stable coverage-report surface derived from `CT-9B`.

#### S3.T2 — Emit a machine-readable proof coverage report

- **Outcome**: the validator produces one repo-owned proof-coverage artifact that later seams can consume directly instead of inferring readiness from prose or Storybook structure.
- **Files**:
  - `artifacts/storybook/proof-coverage.json`
  - validator report code under `scripts/**` or `storybook/**`
  - optional human-readable summary under `artifacts/storybook/**` or repo docs
- **Thread/contract refs**: consumes `CT-9B`, `CT-H1`, and `CT-H2`; advances `THR-08`; supports `THR-02` and `THR-04`.

Checklist:

- Implement:
  - Generate a machine-readable proof-coverage report from validator output.
  - Include stable fields for component identity, tier, required kinds, implemented kinds, missing kinds, and referenced generated artifacts.
  - Keep the report free of vendor-specific review URLs or mapping descriptors.
- Test:
  - Snapshot one passing pilot report.
  - Snapshot one failing report with a deliberately missing required kind or broken artifact ref.
- Validate:
  - Confirm every report field maps back to `CT-9B` data rather than hand-authored prose.
  - Confirm reviewers can identify pilot readiness from the generated surface alone.
  - Confirm the artifact path and field names are stable enough for later rail consumption.
