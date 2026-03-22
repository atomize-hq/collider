---
seam_id: SEAM-13B
seam_slug: parity-ratchet-promotion
type: conformance
status: proposed
execution_horizon: next
plan_version: v1
basis:
  currentness: provisional
  source_scope_ref: scope_brief.md
  source_scope_version: v1
  upstream_closeouts:
    - seam: SEAM-12B
      pack: harness-completion
      contract: CT-14B
  required_threads:
    - THR-10
    - THR-11
  stale_triggers:
    - seam_12b_hardened_rail_state_change
    - ct_12b_reusable_component_status_change
gates:
  pre_exec:
    review: pending
    contract: pending
    revalidation: pending
  post_exec:
    landing: pending
    closeout: pending
seam_exit_gate:
  required: true
  planned_location: reserved_final_slice
  status: pending
open_remediations: []
---

# SEAM-13B — Required Parity Ratchet and Promotion Completion

- **Goal / value**: Move parity from deferred to required once the hardened rail is real and current, then let promotion actually reach Level E (`E-promotion-complete`).

- **Scope**
  - In:
    - Update sync-ledger.json `parityMode` from `deferred` to `required`
    - Clear `parityDeferredReason`
    - Wire release-governed parity enforcement to the current repo-owned hardened rail status
    - Update CT-12B consumption (reusable-component-status.json) so release can earn full reusable-component completion when parity is current
    - Advance `highestEarnedLevel` to `E-promotion-complete`
    - Ensure no blocking drift remains in the Figma ledger for required claims
  - Out:
    - Implementing new rails (that was SEAM-12B)
    - Changing the ledger schema shape
    - Modifying upstream contracts

- **Primary interfaces**
  - Inputs:
    - CT-14B hardened rail state from SEAM-12B (proof that the hardened rail is real)
    - CT-12B reusable-component promotion status (from harness-future-rails SEAM-10B)
    - `src/figma/sync-ledger.json` (current state with deferred parity)
  - Outputs:
    - Updated `src/figma/sync-ledger.json` with `parityMode: required` and `highestEarnedLevel: E-promotion-complete`
    - Updated `artifacts/harness/reusable-component-status.json` reflecting full completion
    - CT-15B: Parity enforcement state contract

- **Key invariants / rules**:
  - Parity must not be ratcheted to required until the hardened rail is landed and verified
  - The ratchet is one-way: once required, parity cannot be demoted back to deferred without explicit governance
  - Release claims must be machine-verifiable: no "trust me" completion states
  - All blocking exceptions in sync-ledger.json must be resolved before Level E

- **Dependencies**
  - Direct blockers: SEAM-12B (hardened rail must exist before requiring parity)
  - Transitive blockers: SEAM-11B (proof baseline)
  - Direct consumers: SEAM-14B (harness finalization)
  - Derived consumers: downstream release process

- **Touch surface**:
  - `src/figma/sync-ledger.json` (parity mode and promotion level)
  - `artifacts/harness/reusable-component-status.json` (completion state)
  - Governance enforcement scripts or CI checks that read parity mode

- **Verification**:
  - sync-ledger.json shows `parityMode: required` with no `parityDeferredReason`
  - `highestEarnedLevel` is `E-promotion-complete`
  - `exceptions` array is empty or contains only non-blocking items
  - reusable-component-status.json reflects full harness completion
  - CI or governance checks that enforce parity pass cleanly

- **Risks / unknowns**:
  - Risk: Ratcheting parity to required may surface previously hidden drift between repo tokens and Figma variables
  - De-risk plan: Run a full parity comparison before flipping the switch; document any delta as blocking remediations

- **Rollout / safety**:
  - The ratchet is a policy change backed by data — it should only happen after SEAM-12B proof is current
  - Rollback would require an explicit governance decision and remediation entry

- **Downstream decomposition context**:
  - This is a `future` seam because it depends on both SEAM-11B and SEAM-12B completing
  - THR-10 (hardened rail) and THR-11 (parity enforcement) matter most
  - First seam-local review should focus on: parity comparison procedure, enforcement wiring, and CT-12B update rules

- **Expected seam-exit concerns**:
  - Contracts likely to publish: CT-15B (parity enforcement state)
  - Threads likely to advance: THR-10 (hardened rail → revalidated), THR-11 (parity → published)
  - Review-surface areas likely to shift after landing: R3 state machine reaches Level E terminal state
  - Downstream seams most likely to require revalidation: SEAM-14B (attestation depends on Level E being real)
