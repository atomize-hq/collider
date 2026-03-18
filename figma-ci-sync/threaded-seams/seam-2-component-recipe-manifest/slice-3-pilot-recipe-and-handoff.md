### S3 — Pilot Recipe and Handoff

- **Status**: decomposed into sub-slices sized for one Codex session each.
- **Why decomposed**:
  - The helper audit marked this slice as `OK` by default thresholds, but `S3` still bundles two distinct deliverables with separate touch surfaces: the normative `button.recipe.json` artifact and the downstream handoff/index surface.
  - Splitting on that boundary keeps each sub-slice to one main outcome, one primary file cluster, and one verification path.
- **Archived original**: `archive/slice-3-pilot-recipe-and-handoff.md`
- **Sub-slice directory**: `slice-3-pilot-recipe-and-handoff/`

#### Sub-slices

- `subslice-1-pilot-button-recipe.md` (`S3a`) — author and validate the pilot `button` recipe file.
- `subslice-2-source-owned-handoff-index.md` (`S3b`) — publish the minimal recipe discovery index and README handoff notes for downstream seams.
