---
slice_id: S2P
seam_id: SEAM-12B
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
    review: inherited
    contract: inherited
    revalidation: passed
  post_exec:
    landing: pending
    closeout: pending
threads:
  - THR-09
  - THR-10
contracts_produced: []
contracts_consumed:
  - CT-13B
  - CT-14B
open_remediations: []
---

### S2P - Plugin rail implementation (repo-owned)

- **User/system value**: Replace manual interpretation with a deterministic, repo-owned Figma plugin that materializes variables from `design-tokens/dist/figma/tokens.json` while keeping the repo as the only canonical token authoring surface.

- **Scope (in/out)**:
  - In:
    - Repo-owned Figma plugin build + distribution bundle
    - Deterministic mapping from token artifact to Figma local variables
    - Replace-collection write behavior (`Collider Tokens`, mode `Base`)
    - Verification and a copyable run report for ledger updates
    - Operator runbook updates
  - Out:
    - REST API hardening (Enterprise-only; see `slice-2-oauth-variables-api-rail.md`)
    - Figma-to-repo reverse sync
    - Automatic repo mutation from inside the plugin

- **Acceptance criteria**:
  - Plugin can ingest tokens via URL (default localhost proof server) and file upload fallback.
  - Plugin deterministically writes the `Collider Tokens` collection and `Base` mode values into the pilot file without manual value transcription.
  - Verification checks pass: expected variable count, expected names present, values set for the default mode.
  - The repo policy surfaces reflect `plugin-import-manual` as the canonical v1 rail and keep `promotion.parityMode="deferred"`.

- **Operator flow**:
  1. Build the plugin bundle: `pnpm figma:plugin:build`
  2. Import `figma/plugins/collider-token-sync/manifest.json` into Figma
  3. Serve artifact locally: `pnpm figma:tokens:serve`
  4. Run the plugin in the pilot file and sync from:
     `http://localhost:4173/design-tokens/dist/figma/tokens.json`
  5. Update `src/figma/sync-ledger.json` and validate: `pnpm validate:sync-ledger`
