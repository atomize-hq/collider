# Runtime CSS Cutover Runbook

## Preconditions

- `SEAM-4` has already proven app and Storybook consumption through `src/app/globals.css`.
- `node scripts/validate-token-runtime-compatibility.mjs` passes.
- `node scripts/validate-token-artifacts.mjs` passes.
- `pnpm govern:tokens` passes in a clean working tree.

## Cutover

1. Update canonical token sources under `design-tokens/src/**`.
2. Run `pnpm build:tokens`.
3. Run `node scripts/validate-token-runtime-compatibility.mjs`.
4. Run `node scripts/validate-token-artifacts.mjs`.
5. Run `pnpm govern:tokens`.
6. Review the generated artifact diff, including `src/lib/tokens/tokens.css`.

After cutover, direct edits to `src/lib/tokens/tokens.css` are disallowed. All runtime CSS changes must originate from canonical token sources and `pnpm build:tokens`.

## Rollback

1. Restore the last known-good generated artifacts from the reviewed commit:
   `git restore --source=<known-good-commit> -- src/lib/tokens/tokens.css design-tokens/dist/tokens.ts design-tokens/dist/figma/tokens.json`
2. Rebuild from canonical sources:
   `pnpm build:tokens`
3. Re-run the governance path:
   `pnpm govern:tokens`

If rollback requires more than restoring the last known-good generated artifacts and rebuilding, stop and simplify the recovery path before treating the cutover as complete.
