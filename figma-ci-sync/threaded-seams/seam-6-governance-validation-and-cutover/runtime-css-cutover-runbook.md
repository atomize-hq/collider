# Runtime CSS Cutover Runbook

This runbook is the step-by-step operator procedure for retiring manual edits to `src/lib/tokens/tokens.css` and accepting the generated runtime CSS artifact as the only allowed update path. Normative compatibility policy remains in [`design-tokens/src/tokens/migrations/runtime-cutover-notes.md`](../../../design-tokens/src/tokens/migrations/runtime-cutover-notes.md), and runtime and Storybook adoption proof remains in [`figma-ci-sync/threaded-seams/seam-4-app-and-storybook-consumption/slice-3-adoption-and-conformance/subslice-1-runtime-and-preview-cutover.md`](../seam-4-app-and-storybook-consumption/slice-3-adoption-and-conformance/subslice-1-runtime-and-preview-cutover.md). This file does not redefine `CT-5`, `CT-6`, or any later enforcement wiring.

## Purpose and Scope

- Use this runbook when the repo is ready to stop treating `src/lib/tokens/tokens.css` as a hand-maintained file and start treating it as a generated artifact only.
- Use this runbook only after the generated runtime CSS compatibility surface from `S2a` exists and the runtime and Storybook consumers from `SEAM-4` are already proven against the shared import path.
- Do not use this file to redefine compatibility rules, generator internals, CI ordering, or `just preflight` policy. Those remain owned by the existing contract and seam docs.

## Preconditions

- `pnpm govern:tokens` exists and passes.
- `node scripts/validate-token-artifacts.mjs` exists and passes.
- `node scripts/validate-token-runtime-compatibility.mjs` from `S2a` exists and passes.
- The runtime and preview cutover proof in [`subslice-1-runtime-and-preview-cutover.md`](../seam-4-app-and-storybook-consumption/slice-3-adoption-and-conformance/subslice-1-runtime-and-preview-cutover.md) is complete and still valid.
- [`src/app/globals.css`](../../../src/app/globals.css) still preserves the stable runtime import path `@import '../lib/tokens/tokens.css';`.
- The operator starts from a clean worktree. If unrelated changes are present, stop and isolate or commit them before starting the cutover.

## Required Evidence

Run and record the output of each command before accepting the cutover:

1. `git status --short`
2. `pnpm govern:tokens`
3. `node scripts/validate-token-artifacts.mjs`
4. `node scripts/validate-token-runtime-compatibility.mjs`
5. `pnpm test:storybook`
6. `git diff -- src/lib/tokens/tokens.css design-tokens/dist`

If any command above fails, the cutover is blocked and must not be accepted.

## Cutover Steps

1. Confirm the worktree is clean with `git status --short`.
2. Run `pnpm build:tokens`.
3. Review the generated-artifact diff with `git diff -- src/lib/tokens/tokens.css design-tokens/dist`.
4. Confirm the diff is limited to the generated artifact surfaces owned by `CT-5` and `CT-6`.
5. Commit only the generated artifact change after review. Do not mix unrelated source or policy edits into the cutover commit.
6. Treat direct edits to `src/lib/tokens/tokens.css` as disallowed from this point forward. Any future change to that file must come from `pnpm build:tokens` or from the rollback sequence below.

## Immediate Post-Cutover Validation

Rerun the same validation path immediately after the cutover commit:

1. `pnpm govern:tokens`
2. `node scripts/validate-token-artifacts.mjs`
3. `node scripts/validate-token-runtime-compatibility.mjs`
4. `pnpm test:storybook`

Any failure in this section means the cutover is not accepted. Stop, record the failure, and use the rollback path instead of patching `src/lib/tokens/tokens.css` by hand.

## Rollback Steps

Use one repo-native rollback path only:

1. Identify `<last-known-good-sha>` for the last accepted generated artifact state.
2. Run `git restore --source <last-known-good-sha> -- src/lib/tokens/tokens.css design-tokens/dist`.
3. Run `pnpm build:tokens`.
4. Rerun `pnpm govern:tokens`.
5. Rerun `node scripts/validate-token-artifacts.mjs`.
6. Rerun `node scripts/validate-token-runtime-compatibility.mjs`.
7. If the bad cutover was already committed, create a follow-up commit containing only the restored generated artifacts.
8. Never patch `src/lib/tokens/tokens.css` by hand during rollback. If the restore, rebuild, and revalidate flow is not sufficient, the seam is not ready for cutover.

## Post-Rollback Validation

After rollback, confirm the repo is back on the accepted generated-artifact state:

1. `git diff -- src/lib/tokens/tokens.css design-tokens/dist`
2. `pnpm govern:tokens`
3. `node scripts/validate-token-artifacts.mjs`
4. `node scripts/validate-token-runtime-compatibility.mjs`
5. `pnpm test:storybook`

Do not reopen the cutover until all post-rollback checks pass and the failure cause is understood.

## Operator Notes and References

- `S2b` documents the cutover and rollback procedure only. It does not create enforcement.
- `S2c` is responsible for turning this policy into advisory drift detection after the compatibility proof and runbook are already in place.
- The rollback path must stay `restore artifacts, rebuild, revalidate`. If it grows beyond that, simplify the system before attempting cutover again.
- `CT-5` and `CT-6` own the generated artifact paths and runtime CSS contract.
- `SEAM-4` owns the runtime and Storybook adoption proof that must exist before cutover.
- `SEAM-1` owns the stable import-path and no-silent-removal compatibility notes in [`runtime-cutover-notes.md`](../../../design-tokens/src/tokens/migrations/runtime-cutover-notes.md).
