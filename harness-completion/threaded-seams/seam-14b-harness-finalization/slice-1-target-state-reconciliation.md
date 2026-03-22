---
slice_id: S1
seam_id: SEAM-14B
slice_kind: delivery
execution_horizon: active
status: exec-ready
plan_version: v1
basis:
  currentness: current
  basis_ref: seam.md#basis
  stale_triggers:
    - seam_13b_parity_enforcement_change
    - target_state_harness_document_change
gates:
  pre_exec:
    review: inherited
    contract: inherited
    revalidation: inherited
  post_exec:
    landing: pending
    closeout: pending
threads: []
contracts_produced: []
contracts_consumed:
  - CT-15B
open_remediations: []
candidate_subslices: []
---

### S1 — Target-State Reconciliation

- **Purpose**: Verify that the actual repo surfaces satisfy every required invariant in `figma-ci-sync/target-state-harness.md`, then update the "Current Repo Position Versus Target State" section to reflect repo truth as of SEAM-13B landing. Also determines the canonical attestation artifact location (was TBD in seam brief).

- **Scope (in/out)**:
  - In:
    - Read `figma-ci-sync/target-state-harness.md` in full
    - Enumerate all required invariants in the five categories (canonical-source, projection, publish-rail, verification, promotion)
    - Verify each invariant against actual artifacts: `src/figma/sync-ledger.json`, `design-tokens/dist/figma/tokens.json`, `artifacts/harness/reusable-component-status.json`, `artifacts/harness/ct-15b-parity-enforcement-state.md`
    - Confirm optional rails (Chromatic, Code Connect, Storybook Connect) are explicitly documented as optional, not silently absent
    - Determine canonical attestation artifact location (resolve "TBD" → recommended: `artifacts/harness/harness-attestation.json`)
    - Update "Current Repo Position Versus Target State" section to reflect landed repo state
    - Open a blocking remediation for any invariant that is not yet satisfied
  - Out:
    - Producing the attestation artifact (S2)
    - Any changes to sync-ledger.json, reusable-component-status.json, or contract artifacts
    - Closing pack closeouts (S2)

- **Acceptance criteria**:
  - All five invariant categories enumerated with individual evidence mapped to actual artifact state
  - Optional rails are explicitly documented as optional in target-state-harness.md (verify or add)
  - Attestation artifact canonical location is resolved and documented
  - "Current Repo Position Versus Target State" section updated to reflect SEAM-13B landing state
  - Any invariant gaps are surfaced as blocking remediations before S2 begins
  - If no gaps: all five categories are covered and S2 may proceed

- **Dependencies**:
  - SEAM-13B closeout (CT-15B published, THR-11 revalidated) — satisfied at seam activation
  - `figma-ci-sync/target-state-harness.md` must be readable without structural changes since seam brief was written

- **Verification**:
  - Diff of target-state-harness.md shows "Current Repo Position" section updated
  - Invariant check log or inline checklist in the doc covers all five categories
  - Attestation artifact location is recorded (will be consumed by S2)
  - No silently-omitted optional rails remain — each is named and labeled optional

- **Review surface refs**: All five invariant categories from `review.md` invariant table

#### S1.T1 — Invariant verification

- **Outcome**: Confirmed or blocked status for each of the five invariant categories
- **Inputs/outputs**:
  - Input: `figma-ci-sync/target-state-harness.md`, `src/figma/sync-ledger.json`, `artifacts/harness/reusable-component-status.json`, `artifacts/harness/ct-15b-parity-enforcement-state.md`, `design-tokens/dist/figma/tokens.json`
  - Output: Inline invariant checklist in target-state-harness.md; any blocking remediation entries
- **Thread/contract refs**: CT-15B (consumption confirms promotion criteria)
- **Implementation notes**:
  - canonical-source: verify `design-tokens/` is the source; no Figma-side token definitions
  - projection: verify `tokens.json` artifact revision is current and deterministic
  - publish-rail: verify CT-14B plugin rail satisfaction criteria still hold at current revision
  - verification: verify `materializationStatus` and `lastVerifiedRevision` in sync-ledger.json
  - promotion: verify CT-15B 5-criterion satisfaction from SEAM-13B closeout (all met)
- **Acceptance criteria**: Five-category checklist complete; zero unaddressed invariants
- **Test notes**: Cross-reference against SEAM-13B closeout landed evidence for promotion category
- **Risk/rollback notes**: If any invariant is not satisfied, open a blocking remediation and do not proceed to S2 until resolved

Checklist:

- [ ] Implement: read target-state-harness.md; enumerate and verify each invariant category
- [ ] Implement: confirm optional rails are labeled optional (or add labels)
- [ ] Implement: resolve attestation artifact location (document canonical path)
- [ ] Implement: update "Current Repo Position Versus Target State" section
- [ ] Test: verify diff is accurate and section reflects landed state
- [ ] Validate: confirm S2 has an unambiguous attestation artifact location and invariant evidence
- [ ] Cleanup: open any required remediations for unsatisfied invariants
