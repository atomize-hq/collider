---
slice_id: S1
seam_id: SEAM-12B
slice_kind: delivery
execution_horizon: next
status: decomposed
plan_version: v1
basis:
  currentness: provisional
  basis_ref: seam.md#basis
  stale_triggers:
    - seam_11b_proof_state_change
    - figma_variables_api_scope_change
gates:
  pre_exec:
    review: inherited
    contract: pending
    revalidation: pending
  post_exec:
    landing: pending
    closeout: pending
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
    - Define CT-14B contract shape: mode identifier, credential model descriptor, success markers schema, sync-ledger field extensions
    - Document what "hardened rail state" means in machine-readable terms
    - Specify the sync-ledger fields CT-14B adds (within v2 schema bounds per CT-7B)
    - Define the relationship between CT-14B and CT-13B (CT-14B extends proof state with rail operational state)
    - Specify versioning and compatibility guarantees
  - Out:
    - Implementing the rail (that is S2)
    - Modifying the CT-7B ledger schema shape
    - Publishing CT-14B as final (publication happens at seam exit)

- **Acceptance criteria**:
  - CT-14B contract artifact exists with machine-readable field definitions
  - The contract specifies: rail mode identifier, credential model type, success marker shape, sync-ledger extension fields
  - The contract explicitly states what downstream consumers (SEAM-13B) can depend on
  - The contract is compatible with CT-7B v2 ledger schema — no schema migration required
  - The determinism invariant is defined at the variable-value level (not full API response level)

- **Dependencies**:
  - CT-13B (consumed — proof state shape informs what CT-14B extends)
  - CT-7B (consumed — ledger schema bounds what fields CT-14B can add)
  - Note: CT-13B is not yet published (SEAM-11B not landed), so CT-14B definition is provisional

- **Verification**:
  - Contract artifact passes schema validation
  - Fields defined are within CT-7B v2 schema extension bounds
  - Downstream consumer interface (what SEAM-13B needs) is explicit

- **Rollout/safety**: Contract definition is a planning artifact — no runtime impact until S2 implements against it

- **Review surface refs**: R2 (data flow), R3 (contract flow)

#### S1.T1 - Define CT-14B contract shape

- **Outcome**: Machine-readable CT-14B contract definition artifact
- **Inputs/outputs**:
  - Input: CT-7B schema shape, CT-13B proof state shape (provisional), Figma Variables API documentation
  - Output: CT-14B contract artifact (likely in governance or contract directory)
- **Thread/contract refs**: CT-14B (produced), CT-13B (consumed), CT-7B (consumed), THR-10 (CT-14B is the carried contract)
- **Implementation notes**:
  - Define sync-ledger field extensions: `publishMode: "oauth-variables-api"`, `oauthCredentialModel`, `lastHardenedRunStatus`, `lastHardenedRunTimestamp`, `successMarkers`
  - Define equivalence criteria: what "same Figma state" means for determinism testing
  - Specify the credential model type enum and what each value guarantees
- **Acceptance criteria**: CT-14B artifact exists, is machine-readable, and specifies all fields listed above
- **Test notes**: Validate contract artifact against governance schema; verify CT-7B compatibility
- **Risk/rollback notes**: Low risk — this is a definition artifact. If Variables API scope changes the shape, the contract can be revised before S2 implementation.

Checklist:

- Implement: define CT-14B contract artifact
- Test: validate schema compatibility with CT-7B
- Validate: confirm downstream consumer interface covers SEAM-13B needs
- Cleanup: ensure contract is referenced in threading.md and seam.md
