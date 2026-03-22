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

- **Goal / value**: Ship a repo-owned **Figma plugin** that deterministically materializes approved token contents into Figma without manual value transcription. The Variables REST API write rail is treated as Enterprise-only future work and is not part of the v1 posture.

- **Scope**
  - In:
    - Repo-owned Figma plugin that reads `design-tokens/dist/figma/tokens.json` (URL default + file upload fallback)
    - Deterministic mapping rules (token path to variable name, type coercions, color parsing, duration normalization)
    - Replace-collection write behavior for a fixed collection/mode (`Collider Tokens`, `Base`)
    - In-plugin verification (counts, names, and values for the default mode)
    - Operator runbook + ledger alignment for `plugin-import-manual`
    - CT-14B: deterministic plugin rail state contract (no new schema fields)
  - Out:
    - Removing the plugin-import-manual rail (it remains the canonical v1 rail)
    - Implementing Figma-to-repo reverse sync
    - Implementing Chromatic, Code Connect, or Storybook Connect rails
    - Changing the canonical token source format

- **Primary interfaces**
  - Inputs:
    - `design-tokens/dist/figma/tokens.json` (generated artifact)
    - CT-13B proof state from SEAM-11B (baseline confirmation that the current artifact is publishable)
    - Figma plugin Variables API (local document write)
  - Outputs:
    - Repo-owned plugin bundle + operator flow that executes the publish
    - Updated `src/figma/sync-ledger.json` with hardened rail status
    - CT-14B: deterministic plugin rail state contract (verified-current plugin materialization)

- **Key invariants / rules**:
  - The rail must be deterministic: same input artifact → same Figma variable state
  - The rail must not require undocumented manual interpretation to succeed
  - The repo remains the only canonical source of token values (repo → Figma only)
  - Source-of-truth direction is always repo → Figma

- **Dependencies**
  - Direct blockers: SEAM-11B (must confirm current rail works before building replacement)
  - Direct consumers: SEAM-13B (parity ratchet depends on hardened rail being real)
  - Derived consumers: SEAM-14B

- **Touch surface**:
  - New: `figma/plugins/collider-token-sync/**` (plugin source)
  - New: `scripts/build-figma-plugin.mjs` (plugin bundling)
  - New: `src/lib/tokens/figma-token-mapping.ts` (pure mapping used by plugin + tests)
  - Modified: `src/figma/pilot-setup.md`, `src/figma/README.md`, `src/figma/parity-policy.md`
  - Modified: `src/figma/sync-ledger.json` + fixtures (canonical mode alignment)

- **Verification**:
  - Plugin executes successfully against the current artifact and pilot file
  - sync-ledger.json records `publish.mode="plugin-import-manual"` and a verified-current state for the active revision
  - In-plugin verification confirms counts, names, and values match the computed mapping
  - Determinism test: two consecutive runs with the same input produce the same Figma state

- **Risks / unknowns**:
  - Risk: The destination file may contain a remote/published collection with the same name; the plugin must abort cleanly rather than partially apply.
  - Risk: Figma CSP/network restrictions may block localhost fetch; file upload must remain a first-class fallback.

- **Rollout / safety**:
  - The plugin-import-manual rail remains functional during and after this seam
  - First execution should be against a branch-specific or test Figma file if available

- **Downstream decomposition context**:
  - THR-09 (proof freshness) and THR-10 (hardened rail readiness) matter most
  - First seam-local review should focus on deterministic mapping correctness and failure handling when the target collection cannot be replaced

- **Expected seam-exit concerns**:
  - Contracts likely to publish: CT-14B (hardened rail state)
  - Threads likely to advance: THR-09 (proof freshness → published), THR-10 (hardened rail → published)
  - Review-surface areas likely to shift after landing: R1 workflow adds a repo-owned deterministic plugin; R2 data flow shows plugin materialization and ledger update loop
  - Downstream seams most likely to require revalidation: SEAM-13B (parity ratchet depends on hardened rail being real and verified)
