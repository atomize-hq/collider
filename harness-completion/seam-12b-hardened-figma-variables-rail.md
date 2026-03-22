---
seam_id: SEAM-12B
seam_slug: hardened-figma-variables-rail
type: platform
status: exec-ready
execution_horizon: active
plan_version: v2
basis:
  currentness: current
  source_scope_ref: scope_brief.md
  source_scope_version: v1
  upstream_closeouts:
    - seam: SEAM-11B
      pack: harness-completion
      contract: CT-13B
      status: landed
      closeout_ref: governance/seam-11b-closeout.md
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
  planned_location: reserved_final_slice
  status: pending
open_remediations: []
---

# SEAM-12B — Hardened Figma Variables Rail Implementation

- **Goal / value**: Implement a repo-owned OAuth/Variables API rail that can deterministically write approved token contents into Figma without manual interpretation, replacing plugin-import-manual as the hardened long-term publish path.

- **Scope**
  - In:
    - OAuth app registration and credential model for Figma Variables API
    - Repo-owned command or workflow that reads `design-tokens/dist/figma/tokens.json` and writes variables into the target Figma file
    - Explicit scope/permission documentation
    - Deterministic success markers and machine-readable status updates to sync-ledger.json
    - Error handling and failure reporting
  - Out:
    - Removing the plugin-import-manual rail (it remains as fallback)
    - Implementing Figma-to-repo reverse sync
    - Implementing Chromatic, Code Connect, or Storybook Connect rails
    - Changing the canonical token source format

- **Primary interfaces**
  - Inputs:
    - `design-tokens/dist/figma/tokens.json` (generated artifact)
    - CT-13B proof state from SEAM-11B (baseline confirmation that the current artifact is publishable)
    - Figma Variables API (REST, OAuth2)
    - OAuth credentials (stored per repo credential model)
  - Outputs:
    - CLI command or CI workflow step that executes the publish
    - Updated `src/figma/sync-ledger.json` with hardened rail status
    - CT-14B: Hardened Figma rail state contract (mode, credential model, success markers)

- **Key invariants / rules**:
  - The rail must be deterministic: same input artifact → same Figma variable state
  - The rail must not require undocumented manual interpretation to succeed
  - Credentials must follow an explicit ownership model (not personal tokens in env vars)
  - The rail must write machine-readable status into the sync-ledger on every execution
  - Source-of-truth direction is always repo → Figma

- **Dependencies**
  - Direct blockers: SEAM-11B (must confirm current rail works before building replacement)
  - Transitive blockers: Figma OAuth app registration (external)
  - Direct consumers: SEAM-13B (parity ratchet depends on hardened rail being real)
  - Derived consumers: SEAM-14B

- **Touch surface**:
  - New: `scripts/figma-variables-sync.ts` or equivalent (command implementation)
  - New: `src/figma/oauth-config.json` or equivalent (credential model, no secrets)
  - Modified: `src/figma/sync-ledger.json` (new mode and status fields)
  - Modified: `justfile` or `package.json` scripts (publish command registration)
  - External: Figma Variables API endpoints, OAuth app registration

- **Verification**:
  - Command executes successfully against the current artifact and target Figma file
  - sync-ledger.json shows the hardened rail mode alongside plugin-import-manual
  - Machine-readable success markers are written on each execution
  - Credential model is documented and does not rely on personal tokens
  - Determinism test: two consecutive runs with the same input produce the same Figma state

- **Risks / unknowns**:
  - Risk: Figma Variables API scope or rate limits may block the implementation
  - De-risk plan: Spike API access early in seam-local review; document scope requirements before committing to implementation approach
  - Risk: OAuth app registration may require organization admin approval with unknown timeline
  - De-risk plan: Identify approval path during pre-exec review; define fallback if delayed

- **Rollout / safety**:
  - The plugin-import-manual rail remains functional during and after this seam
  - The hardened rail is additive — it does not remove the existing path
  - First execution should be against a branch-specific or test Figma file if available

- **Downstream decomposition context**:
  - This is the `next` seam because it depends on SEAM-11B proof confirmation and involves external dependency resolution
  - THR-09 (proof freshness) and THR-10 (hardened rail readiness) matter most
  - First seam-local review should focus on: API scope requirements, credential model options, and command interface design

- **Expected seam-exit concerns**:
  - Contracts likely to publish: CT-14B (hardened rail state)
  - Threads likely to advance: THR-09 (proof freshness → published), THR-10 (hardened rail → published)
  - Review-surface areas likely to shift after landing: R1 workflow adds automated publish path; R2 data flow shows dual-mode rail
  - Downstream seams most likely to require revalidation: SEAM-13B (parity ratchet depends on hardened rail being real and verified)
