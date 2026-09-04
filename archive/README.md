# Archive

Historical documents. **Accurate when written, not instructions now.**

Everything here was moved with `git mv`, so `git log --follow` still reaches the original
history. Nothing was rewritten — the only edits made during archiving were status banners on
the three standalone documents, and repairs to relative links that the move itself broke.

Paths mirror where each document used to live, so `archive/docs/figma-ci-sync/` was
`docs/figma-ci-sync/`.

## Why these are kept rather than deleted

They record decisions and the reasons behind them, including roads not taken. That is worth
more than the disk space, and deleting them would make the git history harder to read, not
easier. What they are **not** is a description of how the repo works today.

If you are grepping and land here, you are reading history. Check
[`docs/README.md`](../docs/README.md) for the live surface.

## Contents

### `docs/figma-ci-sync/` — 77 files

SEAM-1 to SEAM-6. The original seam/slice/subslice decomposition of the token pipeline and
the Figma sync rail. Authored 2026-03-17 to 2026-03-24.

Superseded by what actually shipped. It describes `scripts/validate-component-loop.mjs` and
`scripts/validate-component-recipe.mjs` as patterns to extend. The first was deleted on
2026-09-03 — it validated `loops/<slug>/component-loop.json`, an artifact that never existed.
The second still exists but is unwired; the recipe validators it fronts (`scripts/lib/component-recipe-validator*.mjs`)
*are* live inside `govern:tokens`, over zero recipe files.

### `docs/harness-completion/` — 36 files

SEAM-11B to SEAM-15B closeouts, plus the governance pack. The CT-13B/14B/15B contract
definitions and their exit gates.

### `docs/harness-convergence/` — 19 files

The convergence pass that reconciled the seam trees against each other.

### `docs/harness-future-rails/` — 52 files

SEAM-7B to SEAM-10B. Forward-looking rails, including the branch-aware visual review work
that became the Chromatic job.

### `src/figma/rest-variables-oauth.md`

The Enterprise Variables REST rail. Demoted to optional hardening by `0f7c951` (2026-08-15),
which made the repo-owned plugin the documented default. Requires a Figma Enterprise seat;
the account seat is `pro`, so this rail has never been exercised.

### `src/figma/tokens-studio-carrier-policy.md`

The Tokens Studio exception path. Defined, then never used — `sync-ledger.json` has carried
`publish.tokensStudioCarrier: false` for the life of the ledger.

### `scripts/figma-variables-smoke.sh`

The smoke test for the Enterprise Variables REST rail — reads local variables, creates a throwaway
collection and FLOAT variable, verifies the write, optionally cleans up. Moved here so it sits with
the doc it exercises, `src/figma/rest-variables-oauth.md`, rather than beside the 25 live scripts.
Not broken; unexercisable — it needs a Figma Enterprise seat and the account seat is `pro`.

### `storybook/code-connect-bootstrap.md`

The Code Connect bootstrap. Code Connect is retired: no component carries a mapping, and the
CT-11B rail reports `not-applicable` (`1383a87`). The implementing code was deliberately
**retained** so a future revival is a data change rather than a rebuild — see
[`docs/stage1/sync-policy.md`](../docs/stage1/sync-policy.md).

## Rules

- Do not cite anything here as current policy.
- Do not "fix" the contents. A wrong statement in an archived document is evidence about what
  was believed at the time.
- `archive/` is listed in `.prettierignore` so formatter upgrades cannot churn the record.
- If something here turns out to still be load-bearing, move it back out rather than
  promoting it in place.
