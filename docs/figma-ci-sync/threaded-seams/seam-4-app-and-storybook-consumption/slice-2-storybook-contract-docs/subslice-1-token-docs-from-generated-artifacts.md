### S2a — Token Docs from Generated Artifacts

- **User/system value**: engineers can inspect token categories and theme values in Storybook from generated artifacts instead of relying on copied literals or prose.
- **Scope (in/out)**:
  - In: a token-focused docs surface, plus any thin loader or presenter module under `storybook/**` that reads `CT-5` or metadata paired with `CT-6`.
  - Out: pilot recipe docs, recipe manifest selection, CI inventory gates, or broader component-library work.
- **Acceptance criteria**:
  - Storybook token docs render from generated artifact inputs rather than hand-maintained JSON, prose tables, or duplicated literals.
  - Any local adapter remains thin and traceable to `CT-5` or `CT-6`.
  - The token docs surface fails clearly if the generated artifact path or required fields are missing.
- **Dependencies**:
  - `S1.T1`
  - `CT-5` and `CT-6` from `SEAM-3`
- **Verification**:
  - Render the token docs surface in Storybook locally.
  - Run `pnpm test:storybook`.
  - Add a focused loader or adapter check if parsing or transformation logic is introduced.
- **Rollout/safety**:
  - Keep the adapter shape minimal so `SEAM-6` can later enforce freshness without a bespoke reconciliation layer.

#### S2.T1 — Publish token docs from generated artifacts

- **Outcome**: Storybook exposes generated token categories and theme values from build outputs, not copied literals.
- **Files**:
  - `storybook/**`
  - `.storybook/**` only if docs discovery or asset loading needs thin configuration support

Checklist:

- Implement:
  - Add a Storybook docs surface that reads the generated token artifact shape from `SEAM-3`.
  - Keep any presenter or loader logic artifact-backed and thin.
- Test:
  - Run Storybook and confirm token groups and values render from generated data.
  - Add a focused check if parsing or adaptation logic exists.
- Validate:
  - Break the artifact path locally and confirm the docs surface fails clearly instead of silently serving stale data.
  - Confirm no static token catalog or mirrored JSON appears under `storybook/**`.
