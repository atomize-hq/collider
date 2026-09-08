### S3a — Token Authoring Guide

- **User/system value**: maintainers get one seam-owned reference for what belongs in canonical token files so scalar token authoring does not drift back toward recipe or runtime concerns.
- **Scope (in/out)**:
  - In: `design-tokens/src/tokens/AUTHORING.md`; allowed token categories; scalar-only boundaries; reference rules between core, semantic, motion, and theme token files.
  - Out: validator CLI behavior; CI enforcement; runtime traceability examples; rename/removal process details.
- **Acceptance criteria**:
  - `AUTHORING.md` names the canonical files for core, semantic, motion, and theme concerns.
  - The guide states when semantic tokens may reference core tokens and when references are prohibited.
  - The guide explicitly excludes component recipe data and treats runtime CSS as generated output rather than canonical input.
- **Dependencies**:
  - `S1.T2`
  - `S1.T3`
  - `CT-1`
  - `CT-2`
- **Verification**:
  - Review the guide against one base color token, one semantic text token, one motion token, and one theme token example.
  - Cross-check the file-boundary rules against the `S1` file layout so the guide does not invent new source locations.
- **Rollout/safety**:
  - Keep the guide implementation-agnostic so later validator work can enforce the documented invariants without rewriting the policy.

#### S3.T1 — Publish the token authoring guide

- **Outcome**: `design-tokens/src/tokens/AUTHORING.md` becomes the single authoritative guide for canonical token authoring.
- **Files**:
  - `design-tokens/src/tokens/AUTHORING.md`
  - `design-tokens/src/tokens/README.md`
  - `figma-ci-sync/seam-1-canonical-token-source.md`

Checklist:

- Implement:
  - Add `design-tokens/src/tokens/AUTHORING.md`.
  - Describe allowed token categories and the canonical file where each concern belongs.
  - State that component recipe data does not belong in token files and that runtime CSS is generated output.
- Test:
  - Confirm the guide distinguishes scalar tokens from component recipes with concrete examples.
  - Check one example each for a base color token, semantic text token, motion token, and theme token.
- Validate:
  - Ensure the guidance is compatible with the file layout from `S1`.
  - Collapse overlapping guidance from `README.md` so `AUTHORING.md` is the authoritative reference.
