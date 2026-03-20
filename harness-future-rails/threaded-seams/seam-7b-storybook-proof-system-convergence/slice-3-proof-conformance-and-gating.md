---
slice_id: S3
seam_id: SEAM-7B
execution_horizon: active
status: decomposed
plan_version: v1
basis_ref: seam.md#seam-brief-restated
parent_slice_archive: archive/slice-3-proof-conformance-and-gating.md
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

### S3 — Proof Conformance And Gating

- **Decomposition status**: split into sub-slices because the original `S3` coupled three separate delivery surfaces in one session: structural validator mechanics, generated proof-coverage reporting, and the informational-to-required gate ratchet. That mix would span validator code, artifact output, and runner or CI surfaces plus passing and failing validation paths.
- **Inherited basis posture**:
  - Basis status remains `current` from [seam.md](./seam.md#seam-brief-restated).
  - Required threads remain `THR-02`, `THR-04`, and `THR-08`.
  - Contracts remain `CT-9B` produced and `CT-H1` / `CT-H2` consumed.
- **Inherited gate posture**:
  - Review: `pending-human-review`
  - Contract: `pending`
  - Revalidation: `pending`
  - Landing: `pending`
  - Closeout: `pending`
- **Review bundle**: [review.md](./review.md)
- **Archived original**: [archive/slice-3-proof-conformance-and-gating.md](./archive/slice-3-proof-conformance-and-gating.md)
- **Sub-slice directory**: [slice-3-proof-conformance-and-gating/](./slice-3-proof-conformance-and-gating/)

#### Audit Result

- `S1`: already decomposed into contract-baseline sub-slices.
- `S2`: already decomposed into pilot-adoption sub-slices.
- `S3`: oversized on touch-surface and test-layer grounds; decomposed into `S3a`, `S3b`, and `S3c`.

#### Sub-slices

- `S3a` → [subslice-1-structural-validator.md](./slice-3-proof-conformance-and-gating/subslice-1-structural-validator.md): implement the seam-local validator entrypoint and fixtures that prove `CT-9B` structure and referential integrity.
- `S3b` → [subslice-2-proof-coverage-report.md](./slice-3-proof-conformance-and-gating/subslice-2-proof-coverage-report.md): emit the machine-readable proof-coverage report and stabilize its field set for later rails.
- `S3c` → [subslice-3-required-gate-ratchet.md](./slice-3-proof-conformance-and-gating/subslice-3-required-gate-ratchet.md): ratchet the pilot scope from informational validation to a named required gate with explicit publication evidence for seam-owned threads.
