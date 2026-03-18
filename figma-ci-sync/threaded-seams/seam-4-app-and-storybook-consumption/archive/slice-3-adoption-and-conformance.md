### S3 — Adoption and Conformance

- **User/system value**: the runtime proof surface and Storybook contract pages stop redefining token values, leaving a clean generated-artifact consumption layer that `SEAM-6` can later guard.
- **Scope (in/out)**:
  - In: remove seam-local token duplication from `src/app/**`, `.storybook/**`, and new `storybook/**` helpers; migrate proof surfaces to generated vars and artifact-backed data only; add local verification for artifact availability and parity.
  - Out: repo-wide gate wiring, CI policy, cutover enforcement outside this seam.
- **Acceptance criteria**:
  - Existing app and Storybook proof surfaces rely on generated variables or generated adapters, not copied token values.
  - Storybook docs and loaders fail clearly when required generated artifacts are absent or stale.
  - A local verification path exists that `SEAM-6` can later promote into broader governance without redesigning this seam.
- **Dependencies**: `S1`, `S2`, `CT-2`, `CT-5`, `CT-6`
- **Verification**: run `pnpm storybook`, `pnpm test:storybook`, and a focused local loader or parity test if one is added; use `just check` to ensure the seam stays within repo standards.
- **Rollout/safety**: keep all checks local to this seam and leave `package.json`, `justfile`, and CI wiring for `SEAM-6`.

#### S3.T1 — Remove remaining token duplication from the seam touch surface

- **Outcome**: app and Storybook surfaces reference generated artifacts instead of maintaining their own token copies or theme literals.
- **Inputs/outputs**:
  - Inputs: current app proof surfaces, Storybook preview config, and any token or recipe docs helpers added in `S1` and `S2`.
  - Outputs: cleaned `src/app/**`, `.storybook/**`, and `storybook/**` usage that routes token values through `CT-2`, `CT-5`, or `CT-6`.
- **Implementation notes**: structural UI config literals are acceptable only when Storybook APIs require them; token values and theme IDs should come from generated artifacts or one thin artifact-derived adapter.
- **Acceptance criteria**: the seam touch surface no longer carries an independent token table or copied theme values.
- **Test notes**: search changed files for raw token hex values; re-run the app and Storybook proof surfaces after cleanup.
- **Risk/rollback notes**: if Storybook APIs force a literal background mapping, isolate it in one adapter and document the limitation for `SEAM-6`.

Checklist:

- Implement: replace duplicated token values or theme constants with generated variables or artifact-derived adapters.
- Test: run the app and Storybook after cleanup and confirm the proof surfaces still render.
- Validate: inspect the seam touch surface for copied token literals that should not survive the cutover.
- Cleanup: keep any unavoidable Storybook-specific mapping isolated and documented.

#### S3.T2 — Add seam-local verification for artifact availability and parity

- **Outcome**: local verification catches missing generated artifacts or broken docs wiring before governance work starts.
- **Inputs/outputs**:
  - Inputs: the import path from `S1`, the docs loaders and presenters from `S2`, and generated artifacts from `CT-5` and `CT-6`.
  - Outputs: targeted Storybook or unit-level verification that fails when artifact paths or required fields go missing.
- **Implementation notes**: keep verification local to this seam; do not modify `package.json`, `justfile`, or CI definitions here.
- **Acceptance criteria**: deleting, renaming, or staling a required generated artifact breaks a local verification path; parity proof surfaces remain reviewable.
- **Test notes**: run `pnpm test:storybook` and any focused local tests added for artifact adapters or loaders.
- **Risk/rollback notes**: avoid overreaching into `SEAM-6`; this task exists to hand governance a runnable seam-local proof, not a global policy.

Checklist:

- Implement: add one focused local verification path for artifact-backed Storybook docs or parity smoke surfaces.
- Test: exercise the verification with both the expected artifact path and a deliberately broken artifact reference.
- Validate: confirm the failure mode is loud and actionable rather than silently serving stale data.
- Cleanup: keep the verification surface small enough for `SEAM-6` to adopt without refactoring this seam.
