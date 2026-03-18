### S3a — Generated Runtime CSS Publication

- **User/system value**: the app keeps importing `src/lib/tokens/tokens.css` at the current path while `SEAM-3` takes ownership of that file as generated build output instead of hand-maintained CSS.
- **Scope (in/out)**:
  - In: final build publication into `src/lib/tokens/tokens.css`; generated-file banner text; preservation of the current runtime variable surface needed before `SEAM-4` adoption work.
  - Out: freshness checker behavior; package or CI wiring; changes to `src/app/globals.css`; Storybook adoption; Figma export policy.
- **Acceptance criteria**:
  - `pnpm build:tokens` writes `src/lib/tokens/tokens.css` as a generated artifact at the existing runtime path.
  - The published CSS includes a clear do-not-edit banner.
  - The generated file retains the legacy variable names current consumers rely on, including the existing background, text, and `statusstrip` surface.
- **Dependencies**:
  - `S2`
  - `CT-5`
  - `src/app/globals.css`
  - `SEAM-1` runtime variable inventory and alias guidance
- **Verification**:
  - Run `pnpm build:tokens` twice and confirm `src/lib/tokens/tokens.css` has no second-run diff.
  - Compare the generated variable names against the current runtime surface documented in `SEAM-1` before removing any hand-authored content.
- **Rollout/safety**:
  - Keep the `@import '../lib/tokens/tokens.css';` handoff unchanged so rollback remains isolated to the build pipeline.

#### S3.T1 — Publish generated runtime CSS at the existing import path

- **Outcome**: `CT-6` exists at `src/lib/tokens/tokens.css` without forcing runtime consumer import-path changes.
- **Files**:
  - `design-tokens/build/build-tokens.mjs`
  - `design-tokens/build/paths.mjs`
  - `src/lib/tokens/tokens.css`
  - `src/app/globals.css`

Checklist:

- Implement:
  - Add the final publish step that writes or copies the runtime CSS artifact into `src/lib/tokens/tokens.css`.
  - Add a generated-file banner that marks the runtime CSS as build-owned.
  - Preserve the legacy variable names current runtime consumers still need until `SEAM-4` finishes adoption.
- Test:
  - Run `pnpm build:tokens` twice and verify no second-run diff in `src/lib/tokens/tokens.css`.
  - Diff the generated variable list against the current background, text, and `statusstrip` variables so compatibility gaps are visible.
- Validate:
  - Confirm `src/app/globals.css` can keep the current import path unchanged.
  - Confirm no Storybook or app consumer files are modified as part of this slice.
