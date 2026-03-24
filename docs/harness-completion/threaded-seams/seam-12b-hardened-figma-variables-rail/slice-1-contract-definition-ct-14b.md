---
slice_id: S1
seam_id: SEAM-12B
slice_kind: delivery
execution_horizon: active
status: landed
plan_version: v2
basis:
  currentness: current
  basis_ref: seam.md#basis
  stale_triggers:
    - artifact_revision_change_in_design_tokens_dist_figma_tokens_json
    - figma_variables_api_scope_change
gates:
  pre_exec:
    review: inherited
    contract: passed
    revalidation: passed
  post_exec:
    landing: passed
    closeout: passed
threads:
  - THR-09
  - THR-10
contracts_produced:
  - CT-14B
contracts_consumed:
  - CT-13B
open_remediations: []
candidate_subslices: []
---

### S1 - CT-14B contract definition

- **User/system value**: Define the hardened rail state contract before implementation begins so that SEAM-13B (and any future consumer) has a stable interface to plan against, and so that S2 implementation has a clear target shape to build toward.

- **Scope (in/out)**:
  - In:
    - Define CT-14B contract shape for the **plugin rail** as a constrained combination of existing sync-ledger v2 fields
    - Document what "deterministic plugin rail state" means in machine-readable terms
    - Define the relationship between CT-14B and CT-13B (CT-14B extends proof state with rail operational state)
    - Specify versioning and compatibility guarantees
  - Out:
    - Implementing the rail (that is S2)
    - Modifying the CT-7B ledger schema shape
    - Publishing CT-14B as final (publication happens at seam exit)

- **Acceptance criteria**:
  - CT-14B contract artifact exists with machine-readable field definitions
  - The contract specifies: the required `publish.mode`, `verification.*` fields, and promotion constraints for a satisfied plugin rail
  - The contract explicitly states what downstream consumers (SEAM-13B) can depend on
  - The contract is compatible with CT-7B/CT-8B v2 ledger schema — no schema migration required
  - The determinism invariant is defined at the variable-value level (not full API response level)

- **Dependencies**:
  - CT-13B (consumed — proof state shape informs what CT-14B extends)
  - CT-7B (consumed — ledger schema bounds what fields CT-14B can add)
  - Note: CT-13B is now published (SEAM-11B landed 2026-03-22), so CT-14B definition can consume the realized proof state shape

- **Verification**:
  - Contract artifact passes schema validation
  - Fields defined are within CT-7B v2 schema extension bounds
  - Downstream consumer interface (what SEAM-13B needs) is explicit

- **Rollout/safety**: Contract definition is a planning artifact — no runtime impact until S2 implements against it

- **Review surface refs**: R2 (data flow), R3 (contract flow)

#### S1.T1 - Define CT-14B contract shape

- **Outcome**: Machine-readable CT-14B contract definition artifact
- **Inputs/outputs**:
  - Input: CT-7B/CT-8B schema shape, CT-13B proof state shape (provisional)
  - Output: CT-14B contract artifact (likely in governance or contract directory)
- **Thread/contract refs**: CT-14B (produced), CT-13B (consumed), CT-7B (consumed), THR-10 (CT-14B is the carried contract)
- **Implementation notes**:
  - Define the satisfied state strictly in existing ledger fields (no extensions):
    - `publish.mode="plugin-import-manual"`
    - `publish.tokensStudioCarrier=false`
    - `verification.materializationStatus="passed"`
    - `verification.lastVerifiedRevision === artifact.revision` (verified-current)
  - Define equivalence criteria: what "same Figma state" means for determinism testing
- **Acceptance criteria**: CT-14B artifact exists, is machine-readable, and specifies the satisfied-state constraints above
- **Test notes**: Validate contract artifact against governance schema; verify CT-7B compatibility
- **Risk/rollback notes**: Low risk — this is a definition artifact. If plugin mapping or verification changes, the contract can be revised before S2 implementation.

Checklist:

- [x] Implement: define CT-14B contract artifact — `artifacts/harness/ct-14b-hardened-figma-rail-state.md`
- [x] Test: validate schema compatibility with CT-7B — all fields nest under `publish`, no schema migration
- [x] Validate: confirm downstream consumer interface covers SEAM-13B needs — CT-15B stale trigger `ct_14b_shape_change` confirmed
- [x] Cleanup: ensure contract is referenced in threading.md and seam.md — threading.md updated with resolved compat decision
