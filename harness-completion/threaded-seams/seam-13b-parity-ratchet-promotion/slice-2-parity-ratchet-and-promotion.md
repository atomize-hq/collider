---
slice_id: S2
seam_id: SEAM-13B
slice_kind: delivery
execution_horizon: next
status: decomposed
plan_version: v1
basis:
  currentness: provisional
  basis_ref: seam.md#basis
  stale_triggers:
    - seam_12b_hardened_rail_state_change
    - ct_12b_reusable_component_status_change
    - parity_comparison_result_change
gates:
  pre_exec:
    review: inherited
    contract: inherited
    revalidation: pending
  post_exec:
    landing: pending
    closeout: pending
threads:
  - THR-10
  - THR-11
contracts_produced: []
contracts_consumed:
  - CT-14B
  - CT-12B
  - CT-15B
open_remediations: []
candidate_subslices: []
---

### S2 - Parity ratchet and promotion to Level E

- **User/system value**: Execute the one-way ratchet from `parityMode: deferred` to `parityMode: required`, clear all blocking exceptions, update reusable-component completion, and earn `highestEarnedLevel: E-promotion-complete`. This is the core conformance work that makes the harness machine-verifiable.

- **Scope (in/out)**:
  - In:
    - Run full parity comparison (repo tokens vs Figma variables via hardened rail)
    - Resolve any blocking drift found during comparison
    - Update `src/figma/sync-ledger.json`: set `parityMode: required`, clear `parityDeferredReason`, set `highestEarnedLevel: E-promotion-complete`, ensure `exceptions` is empty or non-blocking
    - Update `artifacts/harness/reusable-component-status.json` to reflect full harness completion
    - Wire or verify parity enforcement in governance/CI checks
  - Out:
    - Defining CT-15B (S1 scope)
    - Modifying the hardened rail implementation (SEAM-12B scope)
    - Modifying the ledger schema shape (CT-7B is consumed, not modified)

- **Acceptance criteria**:
  - Parity comparison runs cleanly with no blocking drift (or drift is remediated first)
  - sync-ledger.json shows `parityMode: required`, no `parityDeferredReason`, `highestEarnedLevel: E-promotion-complete`
  - `exceptions` array is empty or contains only non-blocking items
  - reusable-component-status.json reflects full harness completion
  - CI or governance checks that read `parityMode` pass cleanly
  - All CT-15B satisfaction criteria (from S1) are met

- **Dependencies**:
  - S1 (CT-15B must be defined so the ratchet has explicit success criteria)
  - CT-14B published (SEAM-12B must have landed — hardened rail must be real)
  - CT-12B current (reusable-component status from SEAM-10B)
  - THR-10 must be at least `defined` (proof that SEAM-12B handed off successfully)

- **Verification**:
  - Parity comparison results documented (token-by-token or summary with pass/fail)
  - sync-ledger.json diff confirms all field changes
  - reusable-component-status.json diff confirms completion
  - Enforcement check runs and passes

- **Rollout/safety**: The ratchet is one-way. Once `parityMode: required`, demotion requires explicit governance action and a remediation entry. Run the full parity comparison before flipping the switch. Document any delta as a blocking remediation if drift is found.

- **Review surface refs**: R1 (publish workflow), R2 (ledger state transitions), R3 (contract/thread flow)

#### S2.T1 - Run full parity comparison

- **Outcome**: Documented comparison between repo token values and Figma variable values via the hardened rail
- **Inputs/outputs**:
  - Inputs: `design-tokens/dist/figma/tokens.json`, Figma file variables (via hardened rail from SEAM-12B)
  - Outputs: Parity comparison result (pass/fail per token, summary)
- **Thread/contract refs**: Depends on CT-14B (hardened rail provides the comparison mechanism)
- **Implementation notes**: The comparison procedure depends on what SEAM-12B actually ships. If the hardened rail includes a compare mode, use it. If not, use the same `figma-use` comparison approach from SEAM-11B but against the Variables API surface. Document the procedure chosen.
- **Acceptance criteria**: Every token in the repo artifact has a verified match in the Figma file, or discrepancies are documented as blocking remediations
- **Test notes**: Comparison should cover all token categories (solid colors, RGBA, semantic aliases)
- **Risk/rollback notes**: If drift is found, remediate before proceeding to T2. Do not ratchet on top of known divergence.

Checklist:

- Implement: Run parity comparison using hardened rail or equivalent
- Test: Verify all token categories are covered
- Validate: Document results with pass/fail per token or category
- Cleanup: File remediations for any blocking drift

#### S2.T2 - Execute parity ratchet and promotion

- **Outcome**: sync-ledger.json and reusable-component-status.json updated to reflect required parity and Level E
- **Inputs/outputs**:
  - Inputs: Clean parity comparison from T1, CT-15B satisfaction criteria from S1
  - Outputs: Updated `src/figma/sync-ledger.json`, updated `artifacts/harness/reusable-component-status.json`
- **Thread/contract refs**: Satisfies CT-15B criteria, advances THR-11 basis
- **Implementation notes**:
  - Set `parityMode: "required"` in sync-ledger.json
  - Remove or null `parityDeferredReason`
  - Set `highestEarnedLevel: "E-promotion-complete"`
  - Confirm `exceptions` is empty or non-blocking
  - Update reusable-component-status.json to reflect full completion per CT-12B consumption rules
- **Acceptance criteria**: All CT-15B satisfaction criteria pass
- **Test notes**: Read back both files and verify all fields. Run any existing governance checks.
- **Risk/rollback notes**: One-way ratchet. If errors are discovered after landing, a remediation entry and governance action are required to undo.

Checklist:

- Implement: Update sync-ledger.json fields and reusable-component-status.json
- Test: Verify all CT-15B satisfaction criteria
- Validate: Run governance/CI enforcement checks
- Cleanup: Document any enforcement wiring added or verified

#### S2.T3 - Verify or wire parity enforcement

- **Outcome**: CI or governance checks that read `parityMode` function correctly with the new `required` value
- **Inputs/outputs**:
  - Inputs: Updated sync-ledger.json with `parityMode: required`
  - Outputs: Passing enforcement check, documentation of enforcement mechanism
- **Thread/contract refs**: Supports CT-15B enforcement wiring claim
- **Implementation notes**: Check if existing governance scripts or `just preflight`/`just check` already read `parityMode`. If yes, verify they pass. If no, scope is ambiguous — see review finding F3. Clarify during revalidation.
- **Acceptance criteria**: At least one automated check verifies `parityMode: required` and would fail if parity drifted
- **Test notes**: Toggle `parityMode` back to `deferred` temporarily to confirm the check catches it, then restore
- **Risk/rollback notes**: Low risk — enforcement is additive, not destructive

Checklist:

- Implement: Verify or create enforcement check
- Test: Confirm check passes with required, fails with deferred
- Validate: Document enforcement mechanism location and behavior
- Cleanup: None expected

**Candidate subslice evaluation**: Not eligible. This slice changes rollout/promotion policy (`parityMode: deferred` → `required`) — automatic disqualifier per provisional-subslice-matrix.md.
