---
slice_id: S1
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
contracts_produced: []
contracts_consumed:
  - CT-7B
  - CT-8B
open_remediations: []
candidate_subslices: []
---

### S1 - Proof execution and ledger update

- **User/system value**: Establishes that the repo's plugin-import-manual rail actually works for the current artifact revision, removing the blocking `figma-proof-pending` exception and advancing the promotion level to `D-publish-valid`.

- **Scope (in/out)**:
  - In: execute the plugin-import-manual proof, capture evidence, update sync-ledger.json fields, clear the exception, advance `highestEarnedLevel`
  - Out: defining CT-13B (that is S2), creating new rails, modifying ledger schema

- **Acceptance criteria**:
  - Proof evidence artifact exists at a known repo path and references the exact current `design-tokens/dist/figma/tokens.json` revision
  - `src/figma/sync-ledger.json` shows:
    - `verification.materializationStatus`: `verified`
    - `verification.lastVerifiedRevision`: matches the current artifact revision hash
    - `promotion.highestEarnedLevel`: `D-publish-valid`
    - `exceptions`: empty array (the `figma-proof-pending` exception is removed)
  - The ledger update is traceable to the proof evidence (same revision in both)

- **Dependencies**:
  - CT-7B (ledger schema shape — consumed to know which fields to write)
  - CT-8B (drift gate — consumed to confirm no drift block prevents the proof)
  - `design-tokens/dist/figma/tokens.json` at current revision (read-only input)
  - Figma file `figma://file/SVcsU6gVvpezsJYrvBsS3V` (write target via plugin)

- **Verification**:
  - JSON schema validation on sync-ledger.json post-update
  - Proof evidence artifact references correct revision
  - No internal inconsistency: exception cleared only when proof succeeded

- **Rollout/safety**:
  - Operational proof execution, not a code change — immediate upon completion
  - Sync-ledger update is atomic and reviewable in a single commit
  - Pre-proof Figma variable state should be captured as a baseline in case of drift

- **Review surface refs**: R1 (proof workflow), R2 (ledger state transition) in `review.md`

#### S1.T1 - Verify current artifact revision

- **Outcome**: Confirm the actual current revision of `design-tokens/dist/figma/tokens.json` matches the basis or record the actual current revision
- **Inputs/outputs**: `design-tokens/dist/figma/tokens.json` -> revision hash
- **Thread/contract refs**: THR-09 stale trigger
- **Implementation notes**: Read `git log -1 --format=%H -- design-tokens/dist/figma/tokens.json` or check the file content hash. If it differs from the basis hash (`5a567cd7d07860135ab0bfb1d8f2873ef1eec836`), use the actual current revision for all downstream work.
- **Acceptance criteria**: Current revision hash is recorded and used consistently
- **Test notes**: Compare hash against basis; if different, the proof still proceeds but uses the real hash
- **Risk/rollback notes**: Low risk — read-only verification step

Checklist:

- Implement: read current revision
- Test: compare against basis hash
- Validate: hash is recorded for use in T2-T4
- Cleanup: none

#### S1.T2 - Execute plugin-import-manual proof

- **Outcome**: Run the plugin-import-manual rail against the Figma file using the current token artifact
- **Inputs/outputs**: `design-tokens/dist/figma/tokens.json` + Figma plugin -> import result (success/failure)
- **Thread/contract refs**: CT-8B (drift gate must not block)
- **Implementation notes**: Open the Figma plugin import UI, load the token file, execute the import against `figma://file/SVcsU6gVvpezsJYrvBsS3V`. The source-of-truth direction is repo -> Figma, never reverse.
- **Acceptance criteria**: Plugin import completes without errors, or failure is documented with specific error details
- **Test notes**: Visual confirmation that Figma variables match the expected token set
- **Risk/rollback notes**: If import fails, do NOT update the ledger. Document the failure and evaluate whether remediation is needed.

Checklist:

- Implement: execute plugin import
- Test: verify Figma variables reflect token values
- Validate: capture success/failure status
- Cleanup: none

#### S1.T3 - Capture proof evidence

- **Outcome**: Create a machine-readable proof evidence artifact documenting the successful import
- **Inputs/outputs**: proof execution result -> evidence artifact (JSON or structured log)
- **Thread/contract refs**: THR-09 (evidence supports thread satisfaction)
- **Implementation notes**: Record: timestamp, artifact revision hash, Figma file ID, import result, and any observable output. Store at a path like `artifacts/harness/figma-proof-evidence.json`.
- **Acceptance criteria**: Evidence artifact exists, references the correct revision, and is machine-parseable
- **Test notes**: JSON schema validation on the evidence file
- **Risk/rollback notes**: If evidence capture fails after a successful import, the import is still valid — retry evidence capture only

Checklist:

- Implement: create evidence artifact
- Test: validate JSON structure and revision reference
- Validate: evidence path is known for CT-13B definition
- Cleanup: none

#### S1.T4 - Update sync-ledger and clear exception

- **Outcome**: Atomic update to `src/figma/sync-ledger.json` reflecting the proven state
- **Inputs/outputs**: current ledger + proof result -> updated ledger
- **Thread/contract refs**: CT-7B (schema shape), THR-09 (proof freshness state)
- **Implementation notes**: Update four fields atomically: `verification.materializationStatus` = `verified`, `verification.lastVerifiedRevision` = current revision hash, `promotion.highestEarnedLevel` = `D-publish-valid`, `exceptions` = `[]` (remove `figma-proof-pending`). Single commit.
- **Acceptance criteria**: Ledger passes JSON schema validation, all four fields are correct, exception is removed
- **Test notes**: Diff the ledger pre/post; confirm no unrelated fields changed
- **Risk/rollback notes**: If any field update is wrong, revert the entire commit. Do not leave a partial update.

Checklist:

- Implement: update ledger fields
- Test: JSON schema validation, field verification
- Validate: git diff shows only expected changes
- Cleanup: none
