### S3 — Adoption and Conformance

- **Status**: decomposed into sub-slices sized for one Codex session each.
- **Why decomposed**:
  - The helper audit marked this slice as `OK` on raw counts, but `S3` still spans three distinct touch surfaces: app runtime cleanup under `src/app/**`, Storybook entry or helper cleanup across `.storybook/**` and `storybook/**`, and a separate conformance-verification path.
  - The original slice also mixes cleanup work with deliberate failure-path testing. Splitting keeps each sub-slice to one main outcome, one primary file cluster, and one main verification layer.
- **Archived original**: `archive/slice-3-adoption-and-conformance.md`
- **Sub-slice directory**: `slice-3-adoption-and-conformance/`

#### Sub-slices

- `subslice-1-runtime-and-preview-cutover.md` (`S3a`) — remove remaining token and theme duplication from `src/app/**` and `.storybook/**` while preserving one artifact-backed entry path.
- `subslice-2-storybook-proof-surface-cleanup.md` (`S3b`) — finish adoption inside `storybook/**` docs or helper surfaces so proof pages stay artifact-backed instead of carrying local token or recipe copies.
- `subslice-3-local-artifact-conformance-checks.md` (`S3c`) — add the seam-local verification and broken-artifact failure path that `SEAM-6` can later promote into broader governance.
