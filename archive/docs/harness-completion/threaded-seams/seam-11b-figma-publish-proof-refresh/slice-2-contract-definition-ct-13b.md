---
slice_id: S2
seam_id: SEAM-11B
slice_kind: delivery
execution_horizon: active
status: exec-ready
plan_version: v2
basis:
  currentness: current
  basis_ref: seam.md#basis
  stale_triggers:
    - artifact_revision_change_in_design_tokens_dist_figma_tokens_json
gates:
  pre_exec:
    review: passed
    contract: passed
    revalidation: passed
  post_exec:
    landing: pending
    closeout: pending
threads:
  - THR-09
contracts_produced:
  - CT-13B
contracts_consumed:
  - CT-7B
open_remediations: []
candidate_subslices: []
---

### S2 - Contract definition CT-13B

- **User/system value**: Makes the proof state from S1 consumable by SEAM-12B. Without a defined contract, SEAM-12B cannot verify that the current rail works before building the replacement.

- **Scope (in/out)**:
  - In: define CT-13B as a state contract that captures the proof verification status, the verified revision, the evidence artifact path, and the earned promotion level
  - Out: modifying the ledger schema (CT-7B owns that), executing proofs (that is S1), any SEAM-12B work

- **Acceptance criteria**:
  - CT-13B is defined in a contract artifact (e.g., `artifacts/harness/ct-13b-figma-proof-state.md` or inline in the seam closeout)
  - The contract specifies:
    - What constitutes satisfaction: `materializationStatus: verified` + non-null `lastVerifiedRevision` + proof evidence artifact exists
    - How consumers verify: read sync-ledger.json fields + check evidence artifact path
    - Stale trigger: artifact revision change in `design-tokens/dist/figma/tokens.json`
  - SEAM-12B can consume CT-13B without ambiguity

- **Dependencies**:
  - S1 must complete first (the contract describes the state S1 produces)
  - CT-7B (the ledger schema that the contract references)

- **Verification**:
  - CT-13B definition matches the actual landed state from S1
  - The contract's satisfaction criteria are met by the current repo state post-S1
  - THR-09 references CT-13B correctly

- **Rollout/safety**:
  - Contract definition is a documentation artifact — no runtime risk
  - If S1 landing changes expected shape, CT-13B must be updated before seam exit

- **Review surface refs**: R3 (contract/thread flow) in `review.md`, R3 in `../../review_surfaces.md`

#### S2.T1 - Define CT-13B contract artifact

- **Outcome**: A machine-readable or structured contract definition that SEAM-12B can consume
- **Inputs/outputs**: S1 landed state + threading.md contract registry -> CT-13B definition
- **Thread/contract refs**: CT-13B (produced), THR-09 (carried by this contract)
- **Implementation notes**: The contract should specify: (1) type: state, (2) owner: SEAM-11B, (3) direct consumer: SEAM-12B, (4) satisfaction fields in sync-ledger.json, (5) evidence artifact path, (6) stale trigger. Place at `artifacts/harness/ct-13b-figma-proof-state.md` or equivalent.
- **Acceptance criteria**: Contract definition exists, is internally consistent, and matches the landed S1 state
- **Test notes**: Verify contract satisfaction criteria against actual sync-ledger.json values
- **Risk/rollback notes**: Low risk — documentation artifact. If wrong, update before seam exit.

Checklist:

- Implement: write CT-13B definition
- Test: verify satisfaction criteria match S1 output
- Validate: SEAM-12B consumption path is clear
- Cleanup: none
