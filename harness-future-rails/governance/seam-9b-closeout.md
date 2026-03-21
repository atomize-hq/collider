---
seam_id: SEAM-9B
status: decomposed
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
    landing: pending
    closeout: pending
seam_exit_gate:
  source_ref: ../threaded-seams/seam-9b-reusable-component-mapping-and-link-convergence/slice-4-seam-exit-gate.md
  status: blocked
  promotion_readiness: blocked
open_remediations:
  - REM-003
---

# SEAM-9B Closeout — Reusable Component Mapping and Link Convergence

- **Summary**: the repo-owned `CT-11B` contract, pilot projection outputs, generator, validator, and machine-readable status surface are landed, but `SEAM-9B` remains blocked at the seam-exit gate because the live pilot mapping is still incomplete. `storybook/connect/button.json` and `figma/code-connect/button.json` match the frozen `mappingVersion: "1"` field set, yet the required `CT-10B`-derived Storybook-link fields remain unresolved because `artifacts/chromatic/status.json` is not present in the working tree, so `THR-07` cannot be published and downstream promotion cannot treat mapping completeness as ready.
- **Landed evidence**: `pnpm generate:component-mapping`; `pnpm validate:reusable-component-mapping`; `pnpm vitest run storybook/component-mapping-contract.test.ts storybook/reusable-component-mapping-validation.test.ts`; `storybook/reusable-component-mapping-contract.md`; `storybook/reusable-component-mapping-projection-policy.md`; `storybook/connect/button.json`; `figma/code-connect/button.json`; `artifacts/harness/reusable-component-mapping-status.json`
- **Contracts updated / published**: `CT-11B` landed at `storybook/reusable-component-mapping-contract.md`, `storybook/reusable-component-mapping-projection-policy.md`, `scripts/lib/reusable-component-mapping-contract.mjs`, `scripts/lib/component-mapping.mjs`, `scripts/lib/reusable-component-mapping-validator.mjs`, `scripts/generate-component-mapping.mjs`, `scripts/validate-reusable-component-mapping.mjs`, `storybook/connect/button.json`, `figma/code-connect/button.json`, and `artifacts/harness/reusable-component-mapping-status.json`. The shared contract and pilot projections are inspectable, but the downstream-consumable handoff is not publishable yet because the status artifact still classifies the live pilot mapping as incomplete.
- **Threads advanced**: no outbound threads advanced at closeout time. `THR-07` remains `identified` because `artifacts/harness/reusable-component-mapping-status.json` reports `0 complete`, `1 incomplete`, and `0 invalid`; inbound `THR-03` and `THR-04` remain the revalidated basis for the active seam.
- **Review surface deltas**: downstream `SEAM-10B` may inspect the landed `CT-11B` contract, projection policy, pilot outputs, and `artifacts/harness/reusable-component-mapping-status.json` to see the exact mapping blocker without prose scraping. It may not treat `THR-07` as published or promotion-ready while the live pilot outputs still report `storyLinkStatus: "missing-status-artifact"` and keep `publishedStorybookUrl` unresolved.
- **Planned vs landed delta**: the planned `S1` through `S3` contract, projection, and validation surfaces landed without material schema drift. The remaining delta is closeout readiness, not field-shape drift: the live pilot outputs still match the frozen `CT-11B` v1 field set, but `publishedStorybookUrl`, `publishedStorybookRevisionGitSha`, `publishedStorybookComponentIds`, and `publishedStorybookStoryIds` are all `null`, so the machine-readable status surface remains incomplete instead of promotion-consumable.
- **Downstream stale triggers**: revalidate downstream consumers if `storybook/component-specs/*.json` changes the repo-owned component identity or downstream hook shape, if `figmaComponentRef` changes its reference format, if `storybook/connect/**` or `figma/code-connect/**` changes Storybook-link projection rules or field meanings, if `CT-10B` changes `build.url`, `revision.gitSha`, `proofInventory.selectedComponentIds`, or `proofInventory.selectedStoryIds`, or if any consumer starts reading vendor UI or prose instead of repo-owned `CT-10B` and `CT-11B` surfaces.
- **Remediation disposition**: `REM-003` stays open. The repo now has the `CT-11B` contract, pilot projection outputs, and validation/reporting entrypoints, but the seam-exit gate is blocked because `artifacts/harness/reusable-component-mapping-status.json` currently reports `[CT-11B_MAPPING_INCOMPLETE_FIELD] componentId "button" requires publishedStorybookUrl before the mapping is complete`. Until the repo can derive current Storybook-link provenance from the allowed `CT-10B` fields, this closeout may not claim `CT-11B` published for downstream promotion and may not advance `THR-07`.
- **Seam-exit gate**: realized from `threaded-seams/seam-9b-reusable-component-mapping-and-link-convergence/slice-4-seam-exit-gate.md`; status `blocked`; promotion readiness `blocked`. The blocking condition is explicit and evidence-backed: `SEAM-9B` revalidated the allowed `CT-10B` Storybook-link inputs in `storybook/chromatic-review-contract.md` as `build.url`, `revision.gitSha`, `proofInventory.selectedComponentIds`, and `proofInventory.selectedStoryIds`, but the live pilot outputs cannot consume those fields because `artifacts/chromatic/status.json` is absent locally. As a result, the pilot outputs keep the `CT-10B`-derived link fields `null`, `storyLinkStatus` stays `missing-status-artifact`, and the mapping handoff remains non-consumable.
- **Open follow-ups**: restore or publish current repo-owned `CT-10B` evidence at `artifacts/chromatic/status.json` or provide equivalent recorded publication evidence that the mapping generator may consume directly; rerun `pnpm generate:component-mapping` and `pnpm validate:reusable-component-mapping` until `artifacts/harness/reusable-component-mapping-status.json` reports the pilot mapping `complete`; only then resolve `REM-003`, advance `THR-07`, and update this closeout to a `ready` seam-exit gate for `SEAM-10B`.
