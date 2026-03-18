### S3a — Runtime And Preview Cutover

- **User/system value**: the app shell and Storybook preview stop acting as backup token sources, so generated theme IDs and runtime CSS become the only entry path reviewers rely on.
- **Scope (in/out)**:
  - In: `src/app/**` and `.storybook/**` cleanup that removes copied token values, copied theme literals, or parallel preview-only defaults; one thin adapter only if a Storybook API requires a literal map.
  - Out: `storybook/**` docs presenters; new seam-local verification tests; repo-wide gate wiring.
- **Acceptance criteria**:
  - `src/app/**` and `.storybook/**` no longer maintain independent token tables, copied hex values, or hand-authored theme ID lists when the same data exists in `CT-2` or `CT-6`.
  - Any unavoidable Storybook-specific literal mapping is isolated to one documented adapter rather than spread across preview config and runtime surfaces.
  - The app proof surface and Storybook preview still render from the shared generated artifact path after cleanup.
- **Dependencies**:
  - `S1`
  - `CT-2`
  - `CT-6`
- **Verification**:
  - Run `pnpm storybook` and boot the app locally to confirm the shared generated CSS path still resolves.
  - Search the touched `src/app/**` and `.storybook/**` files for raw token literals or duplicated theme IDs that should have been removed.
- **Rollout/safety**:
  - Preserve the existing generated CSS handoff path from `S1`; do not introduce a second import route during cleanup.
  - If Storybook background APIs still need literals, isolate that mapping and record the limitation for `SEAM-6` instead of spreading exceptions across the seam.

#### S3a.T1 — Remove runtime and preview duplication

- **Outcome**: app and preview entry points consume generated artifacts directly, with any unavoidable preview-only mapping reduced to one adapter.
- **Files**:
  - `src/app/**`
  - `.storybook/**`
  - `src/lib/tokens/**`

Checklist:

- Implement:
  - Replace copied token values or theme constants in `src/app/**` and `.storybook/**` with generated CSS variables, generated theme IDs, or one thin adapter derived from `CT-2` and `CT-6`.
  - Collapse duplicated preview defaults into the smallest artifact-backed configuration surface possible.
- Test:
  - Start the app and Storybook and confirm the proof surfaces still render with the expected baseline theme.
  - Confirm no missing import-path or unresolved CSS-variable errors appear after the cleanup.
- Validate:
  - Inspect the changed runtime and preview files for copied token literals that should not survive the cutover.
  - Confirm any remaining literal mapping is documented as a Storybook API constraint rather than an alternate token source.
- Cleanup:
  - Remove obsolete preview or runtime constants once artifact-backed wiring is stable.
  - Keep helper scope narrow enough that `S3c` can validate it without refactoring.
