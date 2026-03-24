### Seam Brief (Restated)

- **Seam ID**: `SEAM-1`
- **Name**: Canonical Token Source
- **Goal / value**: establish one repo-owned, DTCG-compatible source of scalar design values so runtime, Storybook, and Figma consume the same approved tokens instead of drifting from hand-edited CSS.
- **Type**: domain
- **Slicing strategy**: dependency-first with a contract-first opening slice, because `SEAM-1` owns `CT-1` and `CT-2` and blocks `SEAM-2`, `SEAM-3`, and `SEAM-5`.
- **Scope**
  - In: `design-tokens/src/tokens/**/*.tokens.json` as the canonical source tree; token naming taxonomy; stable token IDs; `dark` as the required v1 theme; a concrete migration map from the current `src/lib/tokens/tokens.css` variables to canonical token IDs.
  - Out: component recipe manifests; generated CSS or typed artifacts; token validation CLI and build automation; Figma transport mechanics; CI and merge gating.
- **Touch surface**: `design-tokens/src/tokens/**`, `src/lib/tokens/tokens.css`, `src/app/globals.css`
- **Verification**: downstream maintainers can trace every currently consumed runtime variable to exactly one canonical token ID or explicit alias entry; token source files stay scalar-only and DTCG-shaped; the v1 theme contract names `dark` as the required baseline and defines fallback behavior for additive themes.
- **Threading constraints**
  - Upstream blockers: none
  - Downstream blocked seams: `SEAM-2`, `SEAM-3`, `SEAM-5`
  - Contracts produced (owned): `CT-1`, `CT-2`
  - Contracts consumed: none

### Slice Index

- `S1` → `slice-1-contract-publication.md`: publish the canonical token tree, theme registry, and stable token IDs that unblock downstream schema work.
- `S2` → `slice-2-runtime-coverage-and-migration-map.md`: map the current runtime CSS variables to canonical token IDs so build and cutover work can preserve behavior.
- `S3` → `slice-3-conformance-and-change-control.md`: codify authoring, naming, and change-control rules so downstream seams can consume `CT-1` and `CT-2` without guessing.

### Threading Alignment (Mandatory)

- **Contracts produced (owned)**:
  - `CT-1`: DTCG token source tree rooted at `design-tokens/src/tokens/`, with scalar token families living in `core.tokens.json`, `semantic.tokens.json`, `motion.tokens.json`, and `themes/<theme>.tokens.json`; first published in `S1`.
  - `CT-2`: theme contract defined by `design-tokens/src/tokens/themes/registry.json`, which names supported theme IDs, marks `dark` as required in v1, and defines fallback behavior for any additive themes; first published in `S1`.
- **Contracts consumed**:
  - none; this seam is the root of the token contract chain.
- **Dependency edges honored**:
  - `SEAM-1 blocks SEAM-2`: `S1` settles stable token IDs and source-tree shape before recipe manifests are asked to reference token values.
  - `SEAM-1 blocks SEAM-3`: `S1` and `S2` publish the canonical input tree plus the runtime migration map that `SEAM-3` must honor when generating CSS artifacts.
  - `SEAM-1 blocks SEAM-5`: `S1` publishes the source tree and theme registry required before Figma-facing exports can claim stable token and theme identifiers.
- **Parallelization notes**:
  - What can proceed now: `S1` can start immediately; once `S1.T2` and `S1.T3` land, `SEAM-2` can begin drafting recipe manifests against real token IDs while `S2` continues the runtime migration work.
  - What must wait: `SEAM-3` should not finalize validators, transforms, or generated artifact paths until `S2` lands the alias/migration map; `SEAM-5` should wait for `S1` so Figma sync never depends on provisional theme IDs.
