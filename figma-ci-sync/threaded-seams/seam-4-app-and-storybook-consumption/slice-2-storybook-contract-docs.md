### S2 — Storybook Contract Docs

- **Why this was decomposed**:
  - The original slice carried two separate Storybook outcomes: generated token docs and a pilot recipe contract docs surface.
  - Those outcomes consume different upstream contracts (`CT-5` for token artifact shape, `CT-3` for the approved pilot recipe ID) and likely span loader, presenter, docs, and verification files across `storybook/**`.
  - Splitting keeps each sub-slice to one primary docs surface and one main verification path.
- **Sub-slice directory**: `slice-2-storybook-contract-docs/`
- Archived original: `archive/slice-2-storybook-contract-docs.md`

#### Sub-slices

- `subslice-1-token-docs-from-generated-artifacts.md` (`S2a`)
  - Builds the Storybook token docs surface directly from `CT-5` and `CT-6`, including any thin artifact-backed loader or presenter logic and its focused verification.
- `subslice-2-pilot-recipe-docs-surface.md` (`S2b`)
  - Publishes one approved pilot recipe contract in Storybook from `CT-3` and `CT-5`, reusing the artifact-backed pattern established in `S2a`.

#### Execution order

- Start with `S2a` to establish the artifact-backed token docs pattern and any reusable Storybook adapter shape.
- Follow with `S2b` once the v1 pilot recipe set is available from `SEAM-2`.
