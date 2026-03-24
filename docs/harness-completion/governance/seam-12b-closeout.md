---
seam_id: SEAM-12B
status: landed
closeout_version: v1
seam_exit_gate:
  source_ref: ../threaded-seams/seam-12b-hardened-figma-variables-rail/slice-3-seam-exit-gate.md
  status: passed
  promotion_readiness: ready
basis:
  currentness: current
  upstream_closeouts:
    - seam: SEAM-11B
      pack: harness-completion
      contract: CT-13B
      closeout_ref: seam-11b-closeout.md
  required_threads:
    - THR-09
    - THR-10
  stale_triggers:
    - artifact_revision_change_in_design_tokens_dist_figma_tokens_json
gates:
  post_exec:
    landing: passed
    closeout: passed
open_remediations: []
---

# Closeout — SEAM-12B Hardened Figma Variables Rail

- **Summary**: SEAM-12B is landed with a passed seam-exit gate. The repo-owned `collider-token-sync` Figma plugin was built, loaded into the pilot file, and executed against the current artifact revision (`2ee89e27306a1caa846d904ad6229370f371b1b3`) via the localhost proof server, materializing 40 variables into the `Collider Tokens / Base` collection deterministically. CT-14B is published with 5-criterion satisfaction definition. THR-09 is consumed and confirmed current; THR-10 is advanced from `identified` to `defined`, enabling SEAM-13B to consume the hardened rail proof as the precondition for the parity ratchet.

## Seam-exit gate record

- **Source artifact**: `../threaded-seams/seam-12b-hardened-figma-variables-rail/slice-3-seam-exit-gate.md`

- **Landed evidence**:
  - Plugin run report (2026-03-22T14:10:29Z): `Collider Token Sync: SUCCESS`, collection=`Collider Tokens`, mode=`Base`, variables=`40`. Artifact ingested from `http://localhost:4173/design-tokens/dist/figma/tokens.json` (4096 bytes, URL mode).
  - `src/figma/sync-ledger.json`: `publish.mode="plugin-import-manual"`, `publish.tokensStudioCarrier=false`, `verification.materializationStatus="passed"`, `verification.lastVerifiedRevision="2ee89e27306a1caa846d904ad6229370f371b1b3"` — all fields satisfy CT-14B criteria; no ledger mutation required, ledger was already current from SEAM-11B baseline and the plugin run confirmed it without divergence.
  - CT-14B artifact: `artifacts/harness/ct-14b-hardened-figma-rail-state.md` — 5-criterion satisfied state defined, canonical example JSON present, consumer verification procedure specified.
  - Plugin source: `figma/plugins/collider-token-sync/` (code.ts + built bundle) — repo-owned, no manual value transcription.

- **Contracts published or changed**: `CT-14B` published at `artifacts/harness/ct-14b-hardened-figma-rail-state.md`. All 5 satisfaction criteria met simultaneously: (1) `publish.mode="plugin-import-manual"` ✓, (2) `publish.tokensStudioCarrier=false` ✓, (3) `verification.materializationStatus="passed"` ✓, (4) `verification.lastVerifiedRevision` matches `artifact.revision` (`2ee89e27306a1caa846d904ad6229370f371b1b3`) ✓, (5) CT-13B remains satisfied ✓. Direct consumer: SEAM-13B. Derived consumer: SEAM-14B.

- **Threads published / advanced**: `THR-09` consumed and confirmed current — artifact revision unchanged, CT-13B satisfaction criteria still hold, no revalidation required. `THR-10` advanced from `identified` to `defined` — hardened rail is operational and verified; SEAM-13B may now consume CT-14B/THR-10 as the precondition for parity ratchet activation.

- **Review-surface delta**: No material divergence from pre-exec review diagrams. R1 (publish workflow) — automated plugin path confirmed as canonical v1 rail; dual-mode diagram unchanged. R2 (data flow) — plugin ingests via URL (localhost proof server) and emits run report for operator ledger update, exactly as designed; no reverse sync added. R3 (Enterprise rail) — remains deferred; S2 (OAuth/Variables API) remains blocked as planned; no scope drift.

- **Planned-vs-landed delta**: S2 (OAuth/REST API rail) remains blocked — this is expected per seam scope and is not a delta. S2P delivered the canonical v1 plugin rail as specified. No scope additions or removals during execution. The plugin run report format (single-block copyable output rather than a generated file) is consistent with the S2P operator flow design.

- **Downstream stale triggers raised**: `seam_12b_hardened_rail_state_change` — any change to plugin mapping rules, verification logic, or collection/mode naming stales THR-10 for SEAM-13B and requires SEAM-13B basis revalidation. `artifact_revision_change_in_design_tokens_dist_figma_tokens_json` — stales CT-14B satisfaction criterion 4 and requires re-materialization and re-verification.

- **Remediation disposition**: No open remediations. Remediation log was clean at pack extraction and remains clean. No new remediations opened during S1, S2P, or S3.

- **Promotion blockers**: None remain. All 5 CT-14B satisfaction criteria are met. THR-10 is advanced. sync-ledger.json has no blocking exceptions. Parity remains `deferred` per policy — this is expected posture for SEAM-12B; SEAM-13B is responsible for ratcheting it to `required`.

- **Promotion readiness**: `ready`

## Post-exec gate disposition

- **Landing gate**: passed
- **Closeout gate**: passed
- **Unresolved remediations**: none
- **Carried-forward remediations**: none
