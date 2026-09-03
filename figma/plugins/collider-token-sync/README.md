# Collider Token Sync (Figma Plugin)

A repo-owned Figma plugin that reconciles `design-tokens/dist/figma/tokens.json` with the variables
in the current Figma file. It has two actions, and both compare through the same code.

## Actions

### Sync Variables (writes)

Materializes the published artifact into the file's `Collider Tokens` collection. Upsert semantics:
the collection and existing VariableIDs are preserved, so paint bindings on components survive a
re-sync. Each theme in the artifact becomes one mode on the collection.

After writing, it re-reads the file and runs the drift comparison against it. A partial or silently
failed write shows up as a verification failure rather than a success.

### Check Drift (read-only)

Compares the file against the artifact and reports the differences. It writes nothing — not to the
Figma file, and not to the token sources.

| Finding               | Meaning                                                             |
| --------------------- | ------------------------------------------------------------------- |
| `MISSING_VARIABLE`    | Published by the artifact, absent from the collection               |
| `UNEXPECTED_VARIABLE` | Added in Figma, not in the artifact                                 |
| `TYPE_MISMATCH`       | The variable's `resolvedType` no longer matches the token's `$type` |
| `VALUE_MISMATCH`      | Value edited in Figma (both sides are printed, colors as hex)       |
| `ALIAS_BINDING`       | Re-pointed at another variable; the artifact publishes literals     |
| `MISSING_MODE_VALUE`  | Variable has no value in one mode                                   |
| `MISSING_MODE`        | The artifact declares a theme the collection has no mode for        |
| `UNEXPECTED_MODE`     | The collection has a mode the artifact does not declare             |

If `pnpm figma:tokens:serve` is running, the result is also recorded to
`artifacts/figma/drift-report.json`, stamped with the artifact SHA-256 and repo revision it was
measured against. That file is the measurement behind the sync ledger's
`verification.materializationStatus`.

## Direction

The rail is one-way. `design-tokens/src/tokens/` is the only place token values are authored; the
runtime CSS, the typed module, and these Figma variables are all derived from it.

There is deliberately **no** Figma-to-canonical writer. Figma's four variable types
(`COLOR | FLOAT | STRING | BOOLEAN`) cannot carry DTCG `$type` back — `FLOAT` alone covers
`dimension`, `duration`, and `number` — and aliases, composite tokens like shadows, and the families
withheld from the Figma publish have no representation at all. An inverse writer could only ever
edit values that already exist, and would silently flatten everything else.

So an intentional Figma-side change is a **proposal**: `Check Drift` reports it, you make the
equivalent edit in `design-tokens/src/tokens/`, run `pnpm build:tokens`, and sync forward. The diff
lands in the canonical files where `govern:tokens` and `CHANGE_POLICY` can judge it.

## Import

Import the plugin by selecting this file in Figma:

`figma/plugins/collider-token-sync/manifest.json`

Do not import `dist/` (that folder is not the runtime entrypoint for this plugin).

## Build

From the repo root:

`pnpm figma:plugin:build`

This writes `code.js` next to `manifest.json` (gitignored).

## Where the logic lives

The comparison itself is pure and unit-tested in `src/lib/tokens/figma-drift.ts` — no Figma API, no
I/O. `code.ts` only supplies the snapshot. Both `Sync Variables` and `Check Drift` route through
`compareFigmaVariables`, so the write-verification and the drift report cannot diverge.
