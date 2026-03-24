---
seam_id: SEAM-11B
seam_slug: figma-publish-proof-refresh
status: exec-ready
execution_horizon: active
plan_version: v2
basis:
  currentness: current
  source_seam_brief: ../../seam-11b-figma-publish-proof-refresh.md
  source_scope_ref: ../../scope_brief.md
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
  planned_location: S3
  status: pending
open_remediations: []
---

# SEAM-11B - Current-Revision Figma Publish Proof Refresh

## Seam Brief (Restated)

- **Goal / value**: Make the existing plugin-import-manual rail current again for the current `design-tokens/dist/figma/tokens.json` revision so the repo can honestly claim `D-publish-valid`. This is the first gate the repo must pass on the path to `E-promotion-complete`.

- **Type**: capability

- **Scope**
  - In:
    - Execute the plugin-import-manual proof against the current artifact revision (`5a567cd7d07860135ab0bfb1d8f2873ef1eec836`)
    - Update `src/figma/sync-ledger.json`: set `materializationStatus` to `verified`, populate `lastVerifiedRevision`, clear the `figma-proof-pending` exception where justified
    - Document the proof execution with machine-readable evidence
    - Advance `highestEarnedLevel` to `D-publish-valid`
    - Define and publish CT-13B (Figma publish proof state contract)
  - Out:
    - Implementing a new publish rail (that is SEAM-12B)
    - Changing the ledger schema or contract shape (CT-7B is consumed, not modified)
    - Modifying the Figma file structure beyond what the plugin import produces
    - Reopening any upstream seam

- **Touch surface**:
  - `src/figma/sync-ledger.json` (write)
  - `design-tokens/dist/figma/tokens.json` (read-only)
  - Figma file `figma://file/23PLdynlRYoBYQx9teoC8A` (write target via plugin)
  - Proof evidence artifact (new, created during execution)

- **Verification**:
  - sync-ledger.json shows `materializationStatus: verified` and non-null `lastVerifiedRevision` matching the current artifact revision
  - `figma-proof-pending` exception is resolved
  - `highestEarnedLevel` is `D-publish-valid`
  - Proof evidence artifact exists and references the correct revision
  - CT-13B contract is defined and consumable by SEAM-12B

- **Basis posture**:
  - Currentness: `current` — all upstream seams (SEAM-5B, SEAM-6B, SEAM-10B) are landed with closeouts, no basis gaps exist
  - Upstream closeouts assumed: SEAM-5B/CT-7B (ledger schema), SEAM-6B/CT-8B (drift gate), SEAM-10B/CT-12B (component status)
  - Required threads: THR-09 (proof freshness — produced by this seam)
  - Stale triggers: artifact revision change in `design-tokens/dist/figma/tokens.json`

- **Threading constraints**
  - Upstream blockers: none (all upstream seams landed)
  - Downstream blocked seams: SEAM-12B (needs CT-13B / THR-09)
  - Contracts produced: CT-13B (Figma publish proof state)
  - Contracts consumed: CT-7B (ledger schema shape), CT-8B (drift gate)

## Review bundle

- `review.md` is the authoritative artifact for `gates.pre_exec.review`

## Seam-exit gate plan

- **Planned location**: S3 (`slice-3-seam-exit-gate.md`)
- **Why this seam needs an explicit exit gate**: SEAM-12B depends on confirmed working proof rail as baseline. The exit gate must make the proof state, contract publication, and thread advancement deterministic so SEAM-12B promotion has an unambiguous input.
- **Expected contracts to publish**: CT-13B (Figma publish proof state — verified materialization status at known revision)
- **Expected threads to publish / advance**: THR-09 (proof freshness) from `identified` to `defined`
- **Likely downstream stale triggers**: artifact revision change in `design-tokens/dist/figma/tokens.json` would stale THR-09 for SEAM-12B
- **Expected closeout evidence**: sync-ledger.json diff showing `materializationStatus: verified`, proof evidence artifact path, CT-13B definition artifact

## Slice index

- `S1` -> `slice-1-proof-execution-and-ledger-update.md` — execute proof, update ledger, create evidence
- `S2` -> `slice-2-contract-definition-ct-13b.md` — define CT-13B contract for downstream consumption
- `S3` -> `slice-3-seam-exit-gate.md` — seam-exit gate (closeout, thread/contract publication, promotion readiness)

## Governance pointers

- Pack remediation log: `../../governance/remediation-log.md`
- Seam closeout: `../../governance/seam-11b-closeout.md`
