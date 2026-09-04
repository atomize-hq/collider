---
seam_id: SEAM-9B
status: landed
closeout_version: v1
basis:
  upstream_closeouts:
    - SEAM-5B
    - SEAM-6B
    - SEAM-7B
    - SEAM-8B
  required_threads:
    - THR-03
    - THR-04
gates:
  post_exec:
    landing: passed
    closeout: passed
seam_exit_gate:
  source_ref: ../threaded-seams/seam-9b-reusable-component-mapping-and-link-convergence/slice-4-seam-exit-gate.md
  status: passed
  promotion_readiness: ready
open_remediations: []
---

# SEAM-9B Closeout — Reusable Component Mapping and Link Convergence

- **Summary**: `SEAM-9B` is now landed with a passed seam-exit gate. The repo-owned `CT-11B` contract, pilot projection outputs, generator, validator, and machine-readable status surface now resolve the pilot component family to current Storybook, code, and Figma surfaces without vendor-owned truth. On March 21, 2026, the `chromatic-review` CI owner reran successfully for `e4a9f4f4e0a9dd75744a80cfe6a323882855c16e` and uploaded `chromatic-status-e4a9f4f4e0a9dd75744a80cfe6a323882855c16e`; restoring that repo-owned `CT-10B` artifact locally and regenerating `CT-11B` completed the pilot mapping and made `THR-07` publishable for downstream promotion work.
- **Landed evidence**: `pnpm restore:chromatic-status --sha e4a9f4f4e0a9dd75744a80cfe6a323882855c16e`; `CHROMATIC_STATUS_EXPECTED_GIT_SHA=e4a9f4f4e0a9dd75744a80cfe6a323882855c16e pnpm validate:chromatic-status`; `pnpm generate:component-mapping`; `pnpm validate:reusable-component-mapping`; `pnpm vitest run storybook/chromatic-status-restore.test.ts storybook/chromatic-status-validation.test.ts storybook/component-mapping-contract.test.ts storybook/reusable-component-mapping-validation.test.ts`; `artifacts/chromatic/status.json`; `storybook/connect/button.json`; `figma/code-connect/button.json`; `artifacts/harness/reusable-component-mapping-status.json`
- **Contracts updated / published**: `CT-11B` is published at `storybook/reusable-component-mapping-contract.md`, `storybook/reusable-component-mapping-projection-policy.md`, `scripts/lib/reusable-component-mapping-contract.mjs`, `scripts/lib/component-mapping.mjs`, `scripts/lib/reusable-component-mapping-validator.mjs`, `scripts/generate-component-mapping.mjs`, `scripts/validate-reusable-component-mapping.mjs`, `storybook/connect/button.json`, `figma/code-connect/button.json`, and `artifacts/harness/reusable-component-mapping-status.json`. The restored `CT-10B` evidence at `artifacts/chromatic/status.json` now populates `publishedStorybookUrl`, `publishedStorybookRevisionGitSha`, `publishedStorybookComponentIds`, and `publishedStorybookStoryIds` through the frozen v1 field boundary.
- **Threads advanced**: `THR-07` moved from `identified` to `published`; inbound `THR-03` and `THR-04` remain the revalidated basis for the landed seam.
- **Review surface deltas**: downstream `SEAM-10B` may now consume `CT-11B` from the landed contract docs, pilot outputs, and `artifacts/harness/reusable-component-mapping-status.json` without prose scraping. Mapping completeness is no longer anecdotal: the pilot output reports `1 complete`, `0 incomplete`, and `0 invalid`, and both Storybook Connect and Figma Code Connect projections carry the same resolved published Storybook provenance.
- **Planned vs landed delta**: no material schema drift. The planned `S1` through `S4` outputs landed on the frozen `CT-11B` v1 field set. The only post-exec issue was missing `CT-10B` publication evidence; once the March 21, 2026 rerun artifact was available, the existing contract and generator surfaces completed without widening the field boundary.
- **Downstream stale triggers**: revalidate downstream consumers if `storybook/component-specs/*.json` changes the repo-owned component identity or downstream hook shape, if `figmaComponentRef` changes its reference format, if `storybook/connect/**` or `figma/code-connect/**` changes Storybook-link projection rules or field meanings, if `CT-10B` changes `build.url`, `revision.gitSha`, `proofInventory.selectedComponentIds`, or `proofInventory.selectedStoryIds`, or if any consumer starts reading vendor UI or prose instead of repo-owned `CT-10B` and `CT-11B` surfaces.
- **Remediation disposition**: `REM-003` is resolved. The named `chromatic-review` owner now emits downloadable repo-owned `CT-10B` evidence for the target revision, the local restore path can consume that artifact directly, and the pilot mapping status now reports the required Storybook-link fields as complete rather than missing.
- **Seam-exit gate**: realized from `threaded-seams/seam-9b-reusable-component-mapping-and-link-convergence/slice-4-seam-exit-gate.md`; status `passed`; promotion readiness `ready`; the `CT-11B` handoff is now consumable for `SEAM-10B`.
- **Open follow-ups**: `SEAM-10B` remains the downstream consumer of published `THR-07`; any future promotion-policy work must consume the landed `CT-11B` field boundary and stale triggers recorded here rather than widening mapping semantics ad hoc.
