---
subslice_id: S1a
parent_slice: S1
seam_id: SEAM-8B
subslice_kind: delivery
execution_horizon: active
status: exec-ready
basis:
  currentness: current
  basis_ref: ../seam.md#basis
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
  - THR-03
contracts_touched:
  - CT-9B
  - CT-10B
open_remediations:
  - REM-002
subslice_layout: expanded
---

### S1a - Status Contract And Fixture Baseline

- **User/system value**: `CT-10B` starts with one reviewer-visible repo-owned payload contract and fixture set, so later workflow wiring and downstream consumers never need to infer semantics from raw provider output.
- **Scope (in/out)**:
  - In:
    - `storybook/chromatic-review-contract.md`
    - `scripts/fixtures/chromatic-status/**`
    - The exact root keys, enum values, and versioning expectations for `artifacts/chromatic/status.json`
  - Out:
    - Provider publish invocation
    - CI owner or credential wiring
    - Rollout policy or claim-level optionality ratchets
- **Acceptance criteria**:
  - The contract freezes the required `CT-10B` root keys: `statusVersion`, `branch`, `revision`, `proofInventory`, `build`, `review`, `check`, and `generatedAt`.
  - `proofInventory` explicitly carries the inventory path, inventory version, selected component IDs, and selected story IDs that the publish path reviewed.
  - Fixtures cover passed, changed, failed, and skipped or deferred outcomes without leaking raw provider payload shape into downstream contract fields.
  - Provider-response drift is handled through a backward-compatibility rule in the contract rather than by renaming downstream fields.
- **Dependencies**:
  - Landed `CT-9B` proof-scope field names and inventory semantics
  - [../review.md](../review.md#r1--branch-aware-review-publication-workflow)
  - [../review.md](../review.md#r2--ci-and-status-normalization-data-flow)
- **Verification**:
  - Review the contract against the current `CT-9B` field vocabulary line by line.
  - Review at least one valid and one intentionally invalid fixture against the planned validator expectations.
- **Rollout/safety**: keep this sub-slice contract-definition only. Do not let helper logic or workflow implementation become the source of truth for field semantics.
- **Review surface refs**:
  - [../review.md](../review.md#r1--branch-aware-review-publication-workflow)
  - [../review.md](../review.md#r2--ci-and-status-normalization-data-flow)
  - [../review.md](../review.md#r3--touch-surface-handoff-map)

#### S1a.T1 - Freeze The `CT-10B` Payload Contract And Fixture Set

- **Outcome**: the repo has one concrete payload contract and one canonical fixture set for `CT-10B` before any branch-review automation lands.
- **Files**:
  - `storybook/chromatic-review-contract.md`
  - `scripts/fixtures/chromatic-status/**`
- **Thread/contract refs**:
  - Consumes `CT-9B`
  - Advances `THR-03`
  - Defines `CT-10B`
- **Acceptance criteria**:
  - Every required `CT-10B` field traces back either to `CT-9B` or to normalized provider output.
  - Fixture examples cover pass, diff, failure, and deferred or skipped states.
  - No placeholder fields force downstream seams to parse vendor-specific payloads.
- **Test notes**:
  - Review one valid and one invalid fixture against the future validator contract.
  - Confirm the invalid example fails because of a missing or malformed repo-owned field, not because of omitted vendor-only detail.

Checklist:

- Implement: author the contract doc and checked-in fixture payloads.
- Test: review the valid and invalid fixture set against the frozen schema expectations.
- Validate: confirm the contract preserves stable downstream field names even if provider response shape changes.
