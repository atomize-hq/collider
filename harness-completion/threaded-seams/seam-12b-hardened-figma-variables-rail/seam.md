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

- **Goal / value**: Replace the plugin-import-manual publish path with a repo-owned OAuth/Variables API rail that deterministically writes approved token contents into Figma. This eliminates manual interpretation from the publish path and gives the repo a hardened, automatable publish mechanism needed before parity can be ratcheted to required.

- **Type**: platform

- **Scope**
  - In:
    - OAuth app registration and credential model for Figma Variables API
    - Repo-owned command or workflow that reads `design-tokens/dist/figma/tokens.json` and writes variables into the target Figma file
    - Explicit scope/permission documentation
    - Deterministic success markers and machine-readable status updates to sync-ledger.json
    - Error handling and failure reporting
    - CT-14B contract definition (hardened rail state)
  - Out:
    - Removing the plugin-import-manual rail (it remains as fallback)
    - Implementing Figma-to-repo reverse sync
    - Implementing Chromatic, Code Connect, or Storybook Connect rails
    - Changing the canonical token source format
    - Modifying CT-7B ledger schema shape (consumed, not modified)

- **Touch surface**:
  - New: `scripts/figma-variables-sync.ts` or equivalent (command implementation)
  - New: `src/figma/oauth-config.json` or equivalent (credential model, no secrets)
  - Modified: `src/figma/sync-ledger.json` (new mode and status fields for hardened rail)
  - Modified: `justfile` or `package.json` scripts (publish command registration)
  - External: Figma Variables API endpoints, OAuth app registration

- **Verification**:
  - Command executes successfully against the current artifact and target Figma file
  - sync-ledger.json shows the hardened rail mode alongside plugin-import-manual
  - Machine-readable success markers are written on each execution
  - Credential model is documented and does not rely on personal tokens
  - Determinism test: two consecutive runs with the same input produce the same Figma state
  - CT-14B contract is defined and consumable by SEAM-13B

- **Basis posture**:
  - Currentness: `current` — SEAM-11B landed 2026-03-22 with CT-13B published and THR-09 advanced to `defined`. Artifact revision unchanged (`2ee89e27306a1caa846d904ad6229370f371b1b3`). Basis revalidated during promotion to active.
  - Upstream closeouts consumed: SEAM-11B/CT-13B (proof state confirming plugin-import-manual works at revision `2ee89e27306a1caa846d904ad6229370f371b1b3`)
  - Required threads: THR-09 (consumed and revalidated — proof freshness from SEAM-11B), THR-10 (produced — hardened rail readiness for SEAM-13B)
  - Stale triggers: artifact revision change in `design-tokens/dist/figma/tokens.json`, Figma Variables API scope change

- **Threading constraints**
  - Upstream blockers: SEAM-11B (must land with CT-13B published and THR-09 advanced)
  - Downstream blocked seams: SEAM-13B (needs CT-14B / THR-10)
  - Contracts produced: CT-14B (hardened Figma rail state — mode, credential model, success markers)
  - Contracts consumed: CT-13B (Figma publish proof state from SEAM-11B)

## Review bundle

- `review.md` is the authoritative artifact for `gates.pre_exec.review`

## Seam-exit gate plan

- **Planned location**: S3 (`slice-3-seam-exit-gate.md`)
- **Why this seam needs an explicit exit gate**: SEAM-13B depends on a verified hardened rail to ratchet parity to required. The exit gate must confirm the rail is operational, CT-14B is published, and THR-10 is advanced so SEAM-13B promotion has an unambiguous input. External dependency risk (OAuth app registration) makes explicit exit accounting especially important.
- **Expected contracts to publish**: CT-14B (hardened rail state — operational mode, credential model, deterministic success markers, sync-ledger field updates)
- **Expected threads to publish / advance**: THR-09 (proof freshness) consumed and confirmed current; THR-10 (hardened rail readiness) from `identified` to `defined`
- **Likely downstream stale triggers**: hardened rail implementation change or Figma Variables API scope change would stale THR-10 for SEAM-13B
- **Expected closeout evidence**: sync-ledger.json diff showing hardened rail mode, command execution logs, CT-14B definition artifact, credential model documentation, determinism test results

## Slice index

- `S1` -> `slice-1-contract-definition-ct-14b.md` — define CT-14B contract shape before implementation begins
- `S2` -> `slice-2-oauth-variables-api-rail.md` — implement the repo-owned OAuth/Variables API rail
- `S3` -> `slice-3-seam-exit-gate.md` — seam-exit gate (closeout, thread/contract publication, promotion readiness)

## Governance pointers

- Pack remediation log: `../../governance/remediation-log.md`
- Seam closeout: `../../governance/seam-12b-closeout.md`
