### S3 — Runtime CSS conformance and freshness

- **Audit result**: decomposed. The original slice bundled three separate execution concerns: publishing generated runtime CSS at the stable import path, adding a seam-local freshness checker across generated artifacts, and proving compatibility/idempotence through repeatable tests. Completing that work would span `design-tokens/build/**`, `design-tokens/dist/**`, `src/lib/tokens/tokens.css`, `scripts/**`, and a new proof layer, so the split keeps each sub-slice to one main outcome, one primary touch surface, and one main verification pass.
- **Archived original**: `archive/slice-3-runtime-css-conformance-and-freshness.md`
- **Sub-slice directory**: `slice-3-runtime-css-conformance-and-freshness/`

#### Sub-slices

- `slice-3-runtime-css-conformance-and-freshness/subslice-1-generated-runtime-css-publication.md`
  - Moves original `S3.T1` into the build-owned publication step that keeps `src/lib/tokens/tokens.css` generated and import-compatible without changing consumers.
- `slice-3-runtime-css-conformance-and-freshness/subslice-2-local-artifact-freshness-checker.md`
  - Moves original `S3.T2` into a deterministic drift checker for generated artifacts, with `SEAM-6` still owning later package/CI wiring.
- `slice-3-runtime-css-conformance-and-freshness/subslice-3-runtime-compatibility-and-idempotence-proof.md`
  - Moves original `S3.T3` into a seam-local proof layer for legacy variable compatibility and no-diff rebuild assertions.

#### Sequencing

- `S3a` should land first so `CT-6` exists at the stable runtime path before any freshness or proof logic depends on it.
- `S3b` should follow once the publish step is stable, because the checker needs the final artifact set and expected runtime CSS destination.
- `S3c` should land last so the proof layer exercises the final published CSS contract and the freshness behavior instead of forcing both to change underneath it.
