---
seam_id: SEAM-11B
seam_slug: figma-publish-proof-refresh
type: capability
status: exec-ready
execution_horizon: active
plan_version: v2
basis:
  currentness: current
  source_scope_ref: scope_brief.md
  source_scope_version: v1
  upstream_closeouts:
    - seam: SEAM-5B
      pack: harness-convergence
      contract: CT-7B
    - seam: SEAM-6B
      pack: harness-convergence
      contract: CT-8B
    - seam: SEAM-10B
      pack: harness-future-rails
      contract: CT-12B
  required_threads:
    - THR-09
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
seam_exit_gate:
  required: true
  planned_location: reserved_final_slice
  status: pending
open_remediations: []
---

# SEAM-11B — Current-Revision Figma Publish Proof Refresh

- **Goal / value**: Make the existing plugin-import-manual rail current again for the current `design-tokens/dist/figma/tokens.json` revision so the repo can honestly claim `D-publish-valid`.

- **Scope**
  - In:
    - Execute the plugin-import-manual proof against the current artifact revision (`5a567cd7d07860135ab0bfb1d8f2873ef1eec836`)
    - Update `src/figma/sync-ledger.json`: set `materializationStatus` to verified, populate `lastVerifiedRevision`, clear the `figma-proof-pending` exception where justified
    - Document the proof execution with machine-readable evidence
    - Advance `highestEarnedLevel` to `D-publish-valid`
  - Out:
    - Implementing a new publish rail (that is SEAM-12B)
    - Changing the ledger schema or contract shape
    - Modifying the Figma file structure

- **Primary interfaces**
  - Inputs:
    - `design-tokens/dist/figma/tokens.json` at current revision
    - `src/figma/sync-ledger.json` (current state)
    - Plugin-import-manual rail procedure
  - Outputs:
    - Updated `src/figma/sync-ledger.json` with verified status
    - Proof evidence artifact (screenshot, log, or machine-readable record)
    - CT-13B: Figma publish proof state contract

- **Key invariants / rules**:
  - The proof must run against the exact current artifact revision — not a stale or assumed revision
  - The ledger update must be traceable to the proof execution
  - No exception may be cleared without matching proof evidence
  - The repo source-of-truth model is preserved: tokens flow repo → Figma, never reverse

- **Dependencies**
  - Direct blockers: none (all upstream seams are landed)
  - Transitive blockers: SEAM-5B contract shape (CT-7B), SEAM-6B drift gate (CT-8B)
  - Direct consumers: SEAM-12B (needs confirmed working rail as baseline)
  - Derived consumers: SEAM-13B, SEAM-14B

- **Touch surface**:
  - `src/figma/sync-ledger.json`
  - `design-tokens/dist/figma/tokens.json` (read-only)
  - Figma file `figma://file/23PLdynlRYoBYQx9teoC8A` (write target via plugin)
  - Proof evidence artifact (new, location TBD at seam-local review)

- **Verification**:
  - sync-ledger.json shows `materializationStatus: verified` and non-null `lastVerifiedRevision`
  - `figma-proof-pending` exception is resolved or justified
  - `highestEarnedLevel` is `D-publish-valid`
  - Proof evidence artifact exists and references the correct revision

- **Risks / unknowns**:
  - Risk: The current Figma file state may have drifted since last known-good proof, causing plugin import to fail or produce unexpected results
  - De-risk plan: Capture pre-proof Figma variable state as a baseline before executing the import

- **Rollout / safety**:
  - This is an operational proof execution, not a code change — rollout is immediate upon proof completion
  - The sync-ledger update is atomic and reviewable in a single commit

- **Downstream decomposition context**:
  - This is the `active` seam because it is the first gate the repo must pass and has no blockers
  - THR-09 (proof freshness thread) matters most — it carries the proof state from this seam to SEAM-12B
  - First seam-local review should focus on: exact proof procedure, evidence format, and ledger update rules

- **Expected seam-exit concerns**:
  - Contracts likely to publish: CT-13B (Figma publish proof state)
  - Threads likely to advance: THR-09 (proof freshness → defined)
  - Review-surface areas likely to shift after landing: sync-ledger status in R2 data flow diagram
  - Downstream seams most likely to require revalidation: SEAM-12B (depends on proof baseline)
