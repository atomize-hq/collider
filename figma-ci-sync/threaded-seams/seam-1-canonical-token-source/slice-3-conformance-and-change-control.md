### S3 — Conformance And Change Control

- **Audit result**: decomposed. The original slice bundled three separate deliverables: `AUTHORING.md`, `runtime-traceability.md`, and `CHANGE_POLICY.md`. Completing it would require cross-checks against `CT-1`, `CT-2`, `runtime-css-aliases.json`, `src/lib/tokens/tokens.css`, and seam/threading docs across more than one review loop, so the split keeps each sub-slice to one main outcome, one primary touch surface, and one main verification pass.
- **Archived original**: `archive/slice-3-conformance-and-change-control.md`
- **Sub-slice directory**: `slice-3-conformance-and-change-control/`

#### Sub-slices

- `slice-3-conformance-and-change-control/subslice-1-token-authoring-guide.md`
  - Moves original `S3.T1` into a single deliverable for scalar-token authoring rules and file-boundary guidance.
- `slice-3-conformance-and-change-control/subslice-2-runtime-traceability-examples.md`
  - Moves original `S3.T2` into a worked-example document that proves runtime variables map back to canonical token IDs and themes.
- `slice-3-conformance-and-change-control/subslice-3-token-and-theme-change-policy.md`
  - Moves original `S3.T3` into the migration-oriented policy for additive changes, renames, removals, and theme-ID changes.

#### Sequencing

- `S3a` should land first so the seam has one authoritative authoring guide before traceability or change policy refers back to token-file boundaries.
- `S3b` should follow once `S2.T2` has published the alias map and canonical IDs that the worked examples need to cite.
- `S3c` should land last so the change policy can reference the published authoring and migration artifacts instead of speculating about them.
