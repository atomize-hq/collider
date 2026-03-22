---
seam_id: SEAM-12B
seam_slug: hardened-figma-variables-rail
status: exec-ready
execution_horizon: active
plan_version: v2
basis:
  currentness: current
  source_seam_brief: ../../seam-12b-hardened-figma-variables-rail.md
  source_scope_ref: ../../scope_brief.md
  upstream_closeouts:
    - seam: SEAM-11B
      pack: harness-completion
      contract: CT-13B
      status: landed
      closeout_ref: ../../governance/seam-11b-closeout.md
  required_threads:
    - THR-09
    - THR-10
  stale_triggers:
    - artifact_revision_change_in_design_tokens_dist_figma_tokens_json
    - figma_variables_api_scope_change
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

# SEAM-12B - Hardened Figma Variables Rail Implementation

## Seam Brief (Restated)

- **Goal / value**: Make the `plugin-import-manual` publish path deterministic and repo-owned by shipping a Figma plugin that materializes approved token contents into Figma without manual value transcription. The Enterprise Variables REST API rail is deferred as a future option.

- **Type**: platform

- **Scope**
  - In:
    - Repo-owned Figma plugin that reads `design-tokens/dist/figma/tokens.json` (URL or file upload) and writes local variables into the target Figma file
    - Deterministic mapping rules and verification checks inside the plugin
    - Operator runbook updates and ledger validation alignment
    - CT-14B contract definition (deterministic plugin rail state)
  - Out:
    - Removing the plugin-import-manual rail (it remains as fallback)
    - Implementing Figma-to-repo reverse sync
    - Implementing Chromatic, Code Connect, or Storybook Connect rails
    - Changing the canonical token source format
    - Modifying CT-7B ledger schema shape (consumed, not modified)

- **Touch surface**:
  - New: `figma/plugins/collider-token-sync/**` (repo-owned plugin source + bundle)
  - New: `scripts/build-figma-plugin.mjs` (bundle build)
  - Modified: `src/figma/pilot-setup.md` and policy docs
  - Modified: `src/figma/sync-ledger.json` (mode alignment + verification state)
  - Deferred: Enterprise Variables REST API rail (`rest-variables-oauth`)

- **Verification**:
  - Plugin materializes variables successfully against the current artifact and target Figma file
  - sync-ledger.json records `publish.mode="plugin-import-manual"` and a verified-current state for the active revision
  - Determinism invariant holds at the variable-value level for repeated runs
  - CT-14B contract is defined and consumable by SEAM-13B

- **Basis posture**:
  - Currentness: `current` — SEAM-11B landed 2026-03-22 with CT-13B published and THR-09 advanced to `defined`. Artifact revision unchanged (`2ee89e27306a1caa846d904ad6229370f371b1b3`). Basis revalidated during promotion to active.
  - Upstream closeouts consumed: SEAM-11B/CT-13B (proof state confirming plugin-import-manual works at revision `2ee89e27306a1caa846d904ad6229370f371b1b3`)
  - Required threads: THR-09 (consumed and revalidated — proof freshness from SEAM-11B), THR-10 (produced — hardened rail readiness for SEAM-13B)
  - Stale triggers: artifact revision change in `design-tokens/dist/figma/tokens.json`, plugin mapping/verification changes

- **Threading constraints**
  - Upstream blockers: SEAM-11B (must land with CT-13B published and THR-09 advanced)
  - Downstream blocked seams: SEAM-13B (needs CT-14B / THR-10)
  - Contracts produced: CT-14B (deterministic plugin rail state)
  - Contracts consumed: CT-13B (Figma publish proof state from SEAM-11B)

## Review bundle

- `review.md` is the authoritative artifact for `gates.pre_exec.review`

## Seam-exit gate plan

- **Planned location**: S3 (`slice-3-seam-exit-gate.md`)
- **Why this seam needs an explicit exit gate**: SEAM-13B depends on a verified deterministic rail before it can consider tightening parity. The exit gate must confirm the plugin rail is operational, CT-14B is published, and THR-10 is advanced so SEAM-13B promotion has an unambiguous input.
- **Expected contracts to publish**: CT-14B (deterministic plugin rail state)
- **Expected threads to publish / advance**: THR-09 (proof freshness) consumed and confirmed current; THR-10 (hardened rail readiness) from `identified` to `defined`
- **Likely downstream stale triggers**: plugin mapping/verification changes would stale THR-10 for SEAM-13B
- **Expected closeout evidence**: sync-ledger.json diff, plugin build + operator run logs, CT-14B definition artifact, determinism verification notes

## Slice index

- `S1` -> `slice-1-contract-definition-ct-14b.md` — define CT-14B contract shape before implementation begins
- `S2P` -> `slice-2-plugin-rail.md` — implement the repo-owned plugin rail
- `S2` -> `slice-2-oauth-variables-api-rail.md` — (blocked) Enterprise Variables REST API rail
- `S3` -> `slice-3-seam-exit-gate.md` — seam-exit gate (closeout, thread/contract publication, promotion readiness)

## Governance pointers

- Pack remediation log: `../../governance/remediation-log.md`
- Seam closeout: `../../governance/seam-12b-closeout.md`
