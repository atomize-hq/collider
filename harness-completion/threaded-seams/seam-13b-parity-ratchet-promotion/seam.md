---
seam_id: SEAM-13B
seam_slug: parity-ratchet-promotion
status: exec-ready
execution_horizon: active
plan_version: v2
basis:
  currentness: current
  source_seam_brief: ../../seam-13b-parity-ratchet-promotion.md
  source_scope_ref: ../../scope_brief.md
  upstream_closeouts:
    - seam: SEAM-12B
      pack: harness-completion
      contract: CT-14B
      status: landed
      closeout_ref: ../../governance/seam-12b-closeout.md
  required_threads:
    - THR-10
    - THR-11
  stale_triggers:
    - seam_12b_hardened_rail_state_change
    - ct_12b_reusable_component_status_change
gates:
  pre_exec:
    review: passed
    contract: passed
    revalidation: passed
  post_exec:
    landing: pending
    closeout: pending
seam_exit_gate:
  required: true
  planned_location: S3
  status: pending
open_remediations: []
---

# SEAM-13B - Required Parity Ratchet and Promotion Completion

## Seam Brief (Restated)

- **Goal / value**: Move parity from `deferred` to `required` once the hardened rail is landed and verified, then advance `highestEarnedLevel` to `E-promotion-complete`. This is the conformance gate that makes promotion machine-verifiable and unlocks final harness attestation.

- **Type**: conformance

- **Scope**
  - In:
    - Update `src/figma/sync-ledger.json` `parityMode` from `deferred` to `required`
    - Clear `parityDeferredReason`
    - Wire release-governed parity enforcement to the current repo-owned hardened rail status
    - Update CT-12B consumption (`artifacts/harness/reusable-component-status.json`) so release can earn full reusable-component completion when parity is current
    - Advance `highestEarnedLevel` to `E-promotion-complete`
    - Ensure no blocking drift remains in the Figma ledger for required claims
    - Define CT-15B (parity enforcement state contract)
  - Out:
    - Implementing new rails (SEAM-12B scope)
    - Changing the ledger schema shape (CT-7B is consumed, not modified)
    - Modifying upstream contracts (CT-12B, CT-14B are consumed, not modified)

- **Touch surface**:
  - Modified: `src/figma/sync-ledger.json` (parityMode, parityDeferredReason, highestEarnedLevel, exceptions)
  - Modified: `artifacts/harness/reusable-component-status.json` (completion state reflecting full harness)
  - New: CT-15B contract definition artifact
  - Reads: CT-14B hardened rail state (from SEAM-12B), CT-12B reusable-component promotion status (from SEAM-10B)
  - Governance enforcement scripts or CI checks that read parity mode

- **Verification**:
  - sync-ledger.json shows `parityMode: required` with no `parityDeferredReason`
  - `highestEarnedLevel` is `E-promotion-complete`
  - `exceptions` array is empty or contains only non-blocking items
  - reusable-component-status.json reflects full harness completion
  - CI or governance checks that enforce parity pass cleanly
  - CT-15B is defined with explicit satisfaction criteria consumable by SEAM-14B

- **Basis posture**:
  - Currentness: `current` — SEAM-12B landed 2026-03-22 with all 5 CT-14B satisfaction criteria met. CT-14B is published at `artifacts/harness/ct-14b-hardened-figma-rail-state.md`. THR-10 advanced from `identified` to `defined` at SEAM-12B closeout, and to `revalidated` upon SEAM-13B promotion to active/exec-ready 2026-03-22.
  - Upstream closeouts consumed: SEAM-12B/CT-14B — landed and current; plugin rail executed at revision `2ee89e27306a1caa846d904ad6229370f371b1b3`, 40 variables materialized, 5/5 CT-14B criteria met.
  - Required threads: THR-10 (consumed — hardened rail readiness from SEAM-12B, state: `revalidated`), THR-11 (produced — parity enforcement state for SEAM-14B, state: `identified`)
  - Stale triggers: SEAM-12B hardened rail state change, CT-12B reusable-component status change. Note: `seam_12b_hardened_rail_state_change` fired in confirming direction at SEAM-12B landing — plan validated, no invalidation.
  - Revalidation note (v1→v2): S2.T1 comparison procedure updated — the OAuth/Variables API rail remains blocked as planned; comparison will use figma-use approach (the plan's explicit fallback). No plan invalidation.

- **Threading constraints**
  - Upstream blockers: None — SEAM-12B has landed, CT-14B is published, THR-10 is revalidated.
  - Downstream blocked seams: SEAM-14B (needs CT-15B / THR-11 for harness attestation)
  - Contracts produced: CT-15B (parity enforcement state — parityMode transition, enforcement wiring, Level E claim)
  - Contracts consumed: CT-14B (hardened rail state from SEAM-12B — landed), CT-12B (reusable-component promotion status from SEAM-10B — landed)

## Review bundle

- `review.md` is the authoritative artifact for `gates.pre_exec.review`

## Seam-exit gate plan

- **Planned location**: S3 (`slice-3-seam-exit-gate.md`)
- **Why this seam needs an explicit exit gate**: SEAM-14B (harness finalization) depends on Level E being real and machine-verifiable. The exit gate must confirm that parity is required, the promotion level is earned, CT-15B is published, and THR-11 is advanced so SEAM-14B can attest without ambiguity. The one-way ratchet nature of the parity change makes explicit exit accounting critical — there is no rollback without governance action.
- **Expected contracts to publish**: CT-15B (parity enforcement state — parityMode=required, enforcement wiring, Level E promotion claim, satisfaction criteria for SEAM-14B consumption)
- **Expected threads to publish / advance**: THR-10 (hardened rail readiness) consumed and confirmed current; THR-11 (parity enforcement) from `identified` to `defined`
- **Likely downstream stale triggers**: parity enforcement rule change or CT-12B status change would stale THR-11 for SEAM-14B
- **Expected closeout evidence**: sync-ledger.json diff showing parityMode=required + highestEarnedLevel=E-promotion-complete, reusable-component-status.json diff showing full completion, CT-15B definition artifact, parity comparison results confirming no blocking drift, enforcement check passing

## Slice index

- `S1` -> `slice-1-contract-definition-ct-15b.md` — define CT-15B contract shape before parity ratchet
- `S2` -> `slice-2-parity-ratchet-and-promotion.md` — execute parity ratchet, clear exceptions, earn Level E
- `S3` -> `slice-3-seam-exit-gate.md` — seam-exit gate (closeout, thread/contract publication, promotion readiness)

## Governance pointers

- Pack remediation log: `../../governance/remediation-log.md`
- Seam closeout: `../../governance/seam-13b-closeout.md`
