### S3c — Runtime Compatibility And Idempotence Proof

- **User/system value**: downstream seams get explicit proof that the generated runtime CSS still satisfies the current variable contract and that token artifacts rebuild without drift.
- **Scope (in/out)**:
  - In: one seam-local proof layer under the repo’s existing unit-test conventions; assertions for required legacy runtime variables; no-diff rebuild assertions for generated artifacts.
  - Out: app rendering tests; Storybook adoption checks; CI wiring; policy decisions about cutover or manual-edit governance.
- **Acceptance criteria**:
  - A repeatable proof path exists for runtime CSS compatibility with the current variable surface.
  - The proof also asserts no-diff rebuild behavior for generated artifacts after a clean second build.
  - The proof stays scoped to seam-owned artifacts and does not pull `SEAM-4` consumer files into the test body.
- **Dependencies**:
  - `S3a`
  - `S3b`
  - `CT-5`
  - `CT-6`
  - current runtime variable surface documented by `SEAM-1`
- **Verification**:
  - Run `pnpm build:tokens`, then run `pnpm exec vitest run --project unit src/lib/tokens/tokens.test.ts`.
  - Confirm the proof asserts presence of the required legacy variables and no-diff rebuild behavior across `design-tokens/dist/**` plus `src/lib/tokens/tokens.css`.
- **Rollout/safety**:
  - Keep the proof artifact-focused so later seams can depend on it without inheriting app-rendering or Storybook-specific assumptions.

#### S3.T3 — Prove runtime compatibility and artifact idempotence

- **Outcome**: the seam has explicit conformance proof that generated artifacts are stable enough to unblock `SEAM-4`, `SEAM-5`, and `SEAM-6`.
- **Files**:
  - `src/lib/tokens/tokens.test.ts`
  - `src/lib/tokens/tokens.css`
  - `design-tokens/dist/tokens.ts`
  - `design-tokens/dist/figma/tokens.json`

Checklist:

- Implement:
  - Add a seam-local unit proof at `src/lib/tokens/tokens.test.ts` that parses the generated runtime CSS and asserts the required legacy variables are still present.
  - Add a no-diff rebuild assertion covering `src/lib/tokens/tokens.css` and the generated artifacts under `design-tokens/dist/**`.
  - Keep the proof limited to seam-owned artifacts instead of rendering app or Storybook consumers.
- Test:
  - Run `pnpm build:tokens`, then `pnpm exec vitest run --project unit src/lib/tokens/tokens.test.ts`.
  - Confirm the test fails when one required legacy variable is removed or when a second build changes generated artifact contents.
- Validate:
  - Confirm the proof references the runtime variable inventory from `SEAM-1` instead of inventing a new compatibility source.
  - Confirm `SEAM-4` and `SEAM-6` can consume the proof outcome without needing additional consumer-file assertions in this slice.
