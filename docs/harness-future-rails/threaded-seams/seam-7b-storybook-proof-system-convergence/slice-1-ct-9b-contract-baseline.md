---
slice_id: S1
seam_id: SEAM-7B
execution_horizon: active
status: decomposed
plan_version: v1
basis_ref: seam.md#seam-brief-restated
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

### S1 — CT-9B Contract Baseline

- **Status**: decomposed into execution-sized sub-slices.
- **Why this was split**: `S1` bundled three separate contract-definition surfaces that would span the inventory contract, component-spec contract, and tier-policy entrypoint plus schema or validator examples across multiple modules. That exceeds the single-session budget even though the helper script marked the slice structurally small.
- **Basis / gate posture**:
  - Basis status remains `current` via [seam.md](./seam.md#seam-brief-restated).
  - Inherited seam gates remain unchanged: review `pending-human-review`, contract `pending`, revalidation `pending`, landing `pending`, closeout `pending`.
- **Review surface refs**: [review.md](./review.md#r1--proof-contract-authoring-and-review-flow), [review.md](./review.md#r2--proof-metadata-and-validator-data-flow)
- **Archived original**: [archive/slice-1-ct-9b-contract-baseline.md](./archive/slice-1-ct-9b-contract-baseline.md)
- **Sub-slice directory**: [slice-1-ct-9b-contract-baseline/](./slice-1-ct-9b-contract-baseline/)

#### Audit Result

- `S1`: oversized on touch-surface/file-count grounds; decomposed into `S1a`, `S1b`, `S1c`.
- `S2`: OK, unchanged.
- `S3`: OK, unchanged.

#### Sub-slices

- `S1a` → [subslice-1-inventory-contract.md](./slice-1-ct-9b-contract-baseline/subslice-1-inventory-contract.md): freeze `storybook/story-inventory.json` shape, vocabulary, and validation entrypoint boundaries.
- `S1b` → [subslice-2-component-spec-contract.md](./slice-1-ct-9b-contract-baseline/subslice-2-component-spec-contract.md): freeze `storybook/component-specs/<component-id>.json` identity, required-kind, and downstream-hook schema.
- `S1c` → [subslice-3-tier-policy.md](./slice-1-ct-9b-contract-baseline/subslice-3-tier-policy.md): publish the repo-owned tier enum and required-kind matrix that validators consume directly.
