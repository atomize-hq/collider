### S1 — Shared Artifact Ingestion Baseline

- **User/system value**: the app root and Storybook preview consume the same generated CSS artifact and theme contract, giving the first end-to-end proof that repo-authored tokens drive both surfaces.
- **Scope (in/out)**:
  - In: stable CSS import wiring across `src/app/globals.css` and `.storybook/preview.ts`; default theme and background behavior derived from `CT-2` and `CT-6`; one lightweight Storybook parity proof.
  - Out: recipe docs, broader component adoption, CI or gate wiring.
- **Acceptance criteria**:
  - `src/app/globals.css` and `.storybook/preview.ts` both consume the generated `CT-6` CSS artifact.
  - Storybook default theme and background behavior references `CT-2` and `CT-6` rather than becoming a second token source.
  - A lightweight Storybook proof surface demonstrates baseline generated variables resolve at runtime and is exercised by `pnpm test:storybook`.
- **Dependencies**: `CT-2` from `SEAM-1`; `CT-6` and any supporting asset shape from `CT-5` in `SEAM-3`
- **Verification**: boot the app and Storybook locally; inspect the same baseline theme in both; include the proof surface under `pnpm test:storybook`; manual Storybook inspection is supplemental only.
- **Rollout/safety**: preserve the existing `src/lib/tokens/tokens.css` handoff path and make Storybook changes additive until parity is proven.

#### S1.T1 — Align app and Storybook entry points to `CT-6`

- **Outcome**: both runtime entry points load the same generated CSS contract through one documented path.
- **Inputs/outputs**:
  - Inputs: `src/lib/tokens/tokens.css` from `SEAM-3`; theme IDs and fallback behavior from `CT-2`.
  - Outputs: updates to `src/app/globals.css`, `.storybook/preview.ts`, and `.storybook/main.ts` only if Storybook asset loading needs explicit config.
- **Implementation notes**: keep `src/lib/tokens/tokens.css` as the cutover path; do not read token source JSON directly from Storybook.
- **Acceptance criteria**: app and Storybook import the same artifact path; preview configuration does not hard-code a parallel token table.
- **Test notes**: run the app, `pnpm storybook`, and `pnpm test:storybook`; confirm generated variables are present in both surfaces and that the automated Storybook path covers the proof surface.
- **Risk/rollback notes**: if Storybook asset loading needs extra setup, keep app imports untouched and land the Storybook wiring as an additive step first.

Checklist:

- Implement: point Storybook preview at the same generated CSS artifact consumed by `src/app/globals.css`.
- Test: start the app and Storybook and confirm no missing CSS import or unresolved CSS variable errors.
- Validate: compare the baseline background and text variables rendered in the app proof page and Storybook canvas.
- Cleanup: remove any duplicate theme or token literals from preview config once the artifact-backed path works.

#### S1.T2 — Add a Storybook runtime parity smoke surface

- **Outcome**: Storybook gets a small proof surface that shows generated CSS variables are available without copying token values into docs.
- **Inputs/outputs**:
  - Inputs: `CT-6` runtime CSS artifact and the theme defaults established in `S1.T1`.
  - Outputs: one story or docs entry under `storybook/**` or `src/**/*.stories.tsx` that renders live CSS variable usage.
- **Implementation notes**: keep the surface docs-oriented and thin; read live CSS variables or computed styles instead of hard-coding expected token values.
- **Acceptance criteria**: reviewers can see that named baseline variables resolve in Storybook from the generated artifact.
- **Test notes**: include the surface in Storybook smoke coverage through `pnpm test:storybook`; manual `pnpm storybook` checks may supplement the run but are not an alternative acceptance path.
- **Risk/rollback notes**: avoid turning the smoke surface into a long-lived parallel token catalog.

Checklist:

- Implement: add a minimal Storybook story or docs page that renders values from generated CSS variables.
- Test: render the new surface in Storybook and verify the variables resolve instead of falling back.
- Validate: confirm the surface still works if the app keeps using the existing `src/app/page.tsx` token references.
- Cleanup: keep the proof surface focused on parity, not broad design-system documentation.
