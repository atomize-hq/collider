---
slice_id: S1
seam_id: SEAM-8B
slice_kind: delivery
execution_horizon: active
status: exec-ready
plan_version: v2
basis:
  currentness: current
  basis_ref: seam.md#basis
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
  - THR-03
  - THR-06
contracts_produced:
  - CT-10B
contracts_consumed:
  - CT-9B
open_remediations:
  - REM-002
archived_original: archive/slice-1-ct-10b-contract-baseline.md
subslice_layout: expanded
---

### S1 — CT-10B Contract Baseline

- **Status**: decomposed into authoritative sub-slices.
- **Why this was split**: `S1` still exceeds a single-session execution budget even though the helper audit marked it `OK`; it spans three distinct contract-definition surfaces across the payload contract and fixtures, the publish owner and credential boundary, and the review-scope plus optionality policy. Those surfaces touch different files, threads, and downstream consumers, so they are now isolated into execution-sized sub-slices.
- **Basis / gate posture**:
  - Basis remains `current` through [seam.md](./seam.md#basis).
  - The seam itself is eligible for authoritative sub-slicing because it is `active`, the basis is `current`, and the seam-level pre-exec revalidation gate is `passed` in [seam.md](./seam.md#gates).
  - Slice-local gates remain inherited for review, contract, and revalidation; post-exec landing and closeout remain pending.
- **Review surface refs**: [review.md](./review.md#r1--branch-aware-review-publication-workflow), [review.md](./review.md#r2--ci-and-status-normalization-data-flow), [review.md](./review.md#r3--touch-surface-handoff-map), [review.md](./review.md#r4--sequence-for-optional-to-consumable-review-status)
- **Archived original**: [archive/slice-1-ct-10b-contract-baseline.md](./archive/slice-1-ct-10b-contract-baseline.md)
- **Sub-slice directory**: [slice-1-ct-10b-contract-baseline/](./slice-1-ct-10b-contract-baseline/)

#### Audit Result

- Helper recommendation: `OK`
- Decomposition decision: split anyway on touch-surface and downstream-boundary grounds, consistent with the prior `SEAM-7B` contract-baseline precedent.

#### Sub-slices

- `S1a` → [subslice-1-status-contract-and-fixtures.md](./slice-1-ct-10b-contract-baseline/subslice-1-status-contract-and-fixtures.md): freeze the `CT-10B` payload contract, versioning rules, and checked-in fixture set.
- `S1b` → [subslice-2-publish-owner-and-command.md](./slice-1-ct-10b-contract-baseline/subslice-2-publish-owner-and-command.md): freeze the branch-review command boundary, named CI owner, helper entrypoint, and approved credential surface.
- `S1c` → [subslice-3-review-scope-and-optionality-policy.md](./slice-1-ct-10b-contract-baseline/subslice-3-review-scope-and-optionality-policy.md): freeze the pilot review-scope mapping and the informational-versus-claim-required policy semantics.
