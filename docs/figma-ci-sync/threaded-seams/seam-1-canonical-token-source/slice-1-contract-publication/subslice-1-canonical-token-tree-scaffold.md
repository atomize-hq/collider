### S1a — Canonical Token Tree Scaffold

- **User/system value**: downstream seams get a concrete `CT-1` root and family file layout before they bind recipes, build steps, or Figma exports to token paths.
- **Scope (in/out)**:
  - In: create `design-tokens/src/tokens/`; publish the first `core`, `semantic`, `motion`, and `themes/dark` family files; keep entries scalar-only and DTCG-shaped.
  - Out: naming-policy prose, theme-registry fallback rules, generated CSS, validators, or recipe data.
- **Acceptance criteria**:
  - `design-tokens/src/tokens/core.tokens.json` exists with representative or placeholder scalar entries.
  - `design-tokens/src/tokens/semantic.tokens.json` exists and is limited to semantic token structure.
  - `design-tokens/src/tokens/motion.tokens.json` exists and reserves motion ownership under `CT-1`.
  - `design-tokens/src/tokens/themes/dark.tokens.json` exists and establishes `dark` as the v1 theme file path.
  - No component variants, slots, or recipe-only concerns appear anywhere in the scaffolded tree.
- **Dependencies**:
  - `figma-ci-sync/threading.md`
  - `figma-ci-sync/seam-1-canonical-token-source.md`
- **Verification**:
  - Inspect the tree and confirm every file path matches the `CT-1` contract in `figma-ci-sync/threading.md`.
  - Review one representative token or placeholder in each family file and confirm it is scalar-only.
- **Rollout/safety**:
  - Preserve legacy concepts instead of normalizing names aggressively in this step.
  - Keep runtime import behavior unchanged; this is contract publication only.

#### S1.T1 — Create the canonical token source tree

- **Outcome**: the repo has a concrete home for `CT-1` that downstream seams can target without guessing paths or ownership.
- **Files**:
  - `design-tokens/src/tokens/core.tokens.json`
  - `design-tokens/src/tokens/semantic.tokens.json`
  - `design-tokens/src/tokens/motion.tokens.json`
  - `design-tokens/src/tokens/themes/dark.tokens.json`

Checklist:

- Implement:
  - Create the `design-tokens/src/tokens/` directory structure and the four family files.
  - Seed each file with at least one representative token or explicit placeholder structure that matches the intended ownership of that family.
  - Keep all entries scalar-only and DTCG-shaped.
- Test:
  - Confirm the resulting tree matches `design-tokens/src/tokens/**/*.tokens.json`.
  - Check that each family file contains only scalar token content.
- Validate:
  - Compare the published paths against the `CT-1` definition in `figma-ci-sync/threading.md`.
  - Verify that no component-specific data or runtime-generated concerns were introduced.
