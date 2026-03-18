### S1 — Contract Publication

- **User/system value**: downstream seams get a stable, repo-authored token contract and theme registry before they build recipes, generated artifacts, or Figma exports.
- **Scope (in/out)**:
  - In: canonical source-tree creation under `design-tokens/src/tokens/`; initial scalar token families; stable token-ID and naming decisions; theme-registry file and `dark` baseline theme.
  - Out: generated CSS, typed outputs, validators, CI gates, or any component recipe data.
- **Acceptance criteria**:
  - `CT-1` is concretely defined by file layout, naming rules, and initial token-family ownership.
  - `CT-2` is concretely defined by a theme-registry file that marks `dark` as required and additive themes as opt-in.
  - No component variants, slots, or recipe-only concerns appear in the token tree.
- **Dependencies**: none
- **Verification**: file-structure review against `threading.md`; maintainer can locate one token in each family and one theme entry without consulting later seams.
- **Rollout/safety**: keep the runtime import path unchanged for now; treat this slice as contract publication only, not a runtime cutover.

#### S1.T1 — Create the canonical token source tree

- **Outcome**: the repo has a concrete home for `CT-1` that downstream seams can target without guessing paths or ownership.
- **Inputs/outputs**:
  - Inputs: `figma-ci-sync/threading.md`, `figma-ci-sync/seam-1-canonical-token-source.md`
  - Outputs: `design-tokens/src/tokens/core.tokens.json`, `design-tokens/src/tokens/semantic.tokens.json`, `design-tokens/src/tokens/motion.tokens.json`, `design-tokens/src/tokens/themes/dark.tokens.json`
- **Implementation notes**: keep files scalar-only; use DTCG-shaped groups and names that reflect current runtime usage before any cleanup for elegance.
- **Acceptance criteria**: each family file exists with at least one representative token or explicit placeholder structure; token names are lower-risk continuations of the current CSS variable vocabulary.
- **Test notes**: inspect the tree and confirm every file path matches the `CT-1` definition in `threading.md`.
- **Risk/rollback notes**: avoid premature renames; if a candidate name is unclear, preserve the legacy concept and record cleanup for a later slice instead of forcing a breaking rename now.

Checklist:

- Implement: create the `design-tokens/src/tokens/` directory and family files for `core`, `semantic`, `motion`, and `themes/dark`.
- Test: confirm the tree matches `design-tokens/src/tokens/**/*.tokens.json`.
- Validate: check that no component-specific data is introduced.
- Cleanup: remove any duplicate placeholders once representative tokens are promoted to real entries.

#### S1.T2 — Publish stable token IDs and family-level naming rules

- **Outcome**: maintainers know how token IDs are formed and which family owns each value class before other seams begin referencing them.
- **Inputs/outputs**:
  - Inputs: current CSS custom properties in `src/lib/tokens/tokens.css`
  - Outputs: `design-tokens/src/tokens/README.md`
- **Implementation notes**: define the canonical ID grammar, category prefixes, reference rules for semantic-to-core relationships, and the rule that runtime CSS is derived output rather than canonical input.
- **Acceptance criteria**: the README states how to name base versus semantic tokens, where motion tokens live, and that component recipes are explicitly out of scope for this tree.
- **Test notes**: review three examples from the current CSS variable surface and show where each would land in the new taxonomy.
- **Risk/rollback notes**: if naming debate remains, record the disputed alternative in notes but keep one chosen canonical name to avoid blocking `SEAM-2` and `SEAM-3`.

Checklist:

- Implement: write the naming grammar and family ownership rules in `design-tokens/src/tokens/README.md`.
- Test: trace at least three existing CSS variables into their proposed canonical token IDs.
- Validate: confirm the rules are sufficient for `SEAM-2` to reference token IDs without inventing naming conventions.
- Cleanup: remove any redundant prose that repeats `threading.md` without adding file-level guidance.

#### S1.T3 — Define the theme registry contract

- **Outcome**: `CT-2` becomes a concrete file-backed contract with stable theme IDs and fallback semantics.
- **Inputs/outputs**:
  - Inputs: `figma-ci-sync/threading.md`, `figma-ci-sync/scope_brief.md`
  - Outputs: `design-tokens/src/tokens/themes/registry.json`
- **Implementation notes**: the registry should at minimum declare `dark` as required in v1, specify the default/fallback theme, and document that additional themes are additive.
- **Acceptance criteria**: the theme registry names one required theme, one fallback path, and the compatibility rule for future theme additions.
- **Test notes**: verify the registry and `themes/dark.tokens.json` agree on the theme ID string and that no alternate source of truth exists elsewhere in the seam.
- **Risk/rollback notes**: do not add speculative light-theme or brand-theme entries unless they already have approved value sets; additive expansion is a later, non-blocking change.

Checklist:

- Implement: add `design-tokens/src/tokens/themes/registry.json` with required fields for theme ID, required/default status, and fallback behavior.
- Test: verify `dark` is the only required v1 theme.
- Validate: confirm there is exactly one place where supported theme IDs are declared.
- Cleanup: remove duplicate theme declarations from docs or notes if they drift from the registry.
