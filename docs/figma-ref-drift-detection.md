# Plan: validate:figma-refs — Figma Node ID Drift Detection

## Context

Figma component node IDs are hardcoded in three places (`*.figma.tsx`, `storybook/connect/*.json`, `figma/code-connect/*.json`) and the sync ledger has no mechanism to detect when components move pages, get recreated, or drift from what's tracked. This builds a two-phase validation script — local cross-file consistency (always) + live Figma API node resolution (gated by `FIGMA_API_TOKEN`) — integrated into the existing `govern:tokens` governance chain.

---

## New Files

### `scripts/validate-figma-refs.mjs`

Thin entrypoint (matches exact pattern of every other validator):

```js
#!/usr/bin/env node
import process from 'node:process';
import { runValidateFigmaRefsCli } from './lib/figma-refs.mjs';
process.exit(await runValidateFigmaRefsCli());
```

### `scripts/lib/figma-refs.mjs`

All logic. Exports `validateFigmaRefs(options)` and `runValidateFigmaRefsCli(options)`.

### `figma/refs-manifest.json`

Checked-in manifest of expected Figma node state. Analogous to `sync-ledger.json`. Stores per-component expected name, type, and file key. Updated by `govern:figma-refs` after intentional component changes.

```json
{
  "manifestVersion": "1",
  "fileKey": "SVcsU6gVvpezsJYrvBsS3V",
  "components": [
    {
      "componentId": "thinking-indicator",
      "nodeId": "2130:6",
      "expectedName": "Reasoning",
      "expectedType": "COMPONENT_SET",
      "variantAxis": "state",
      "variantValues": ["streaming", "expanded", "collapsed", "duration"]
    }
  ]
}
```

---

## Modified Files

### `scripts/lib/token-governance.mjs`

Add new step to `governanceSteps` array after `validate:figma-parity`:

```js
{ id: 'validate:figma-refs', kind: 'pnpm-script', scriptName: 'validate:figma-refs' }
```

### `package.json`

Add to `scripts`:

```json
"validate:figma-refs": "node scripts/validate-figma-refs.mjs",
"govern:figma-refs": "node scripts/govern-figma-refs.mjs"
```

### `scripts/govern-figma-refs.mjs` (new)

Writes/updates `figma/refs-manifest.json` by reading current node IDs from source files and fetching live state from Figma API. Run manually after intentional component moves to "commit" the new expected state.

---

## Validation Logic (`scripts/lib/figma-refs.mjs`)

### Phase 1 — Collect & Cross-Check (always runs, no network)

1. Glob `src/**/*.figma.tsx` → regex-extract node ID from `figma.connect(X, 'https://www.figma.com/design/<fileKey>?node-id=<nodeId>', ...)` URLs
2. Glob `storybook/connect/*.json` → parse `figmaComponentRef` = `figma://file/<fileKey>#node-id=<nodeId>`
3. For each componentId, verify file key and node ID match between the two sources
   - Error: `[FIGMA_REFS_NODE_ID_MISMATCH] thinking-indicator: figma.tsx has 2130:6 but storybook/connect has 2131:7`
4. Cross-check node IDs in source files against `figma/refs-manifest.json`
   - Error: `[FIGMA_REFS_MANIFEST_STALE] thinking-indicator: source files reference 2131:7 but manifest records 2130:6 — run govern:figma-refs to update`

### Phase 2 — Live Figma API Resolution (only when `FIGMA_API_TOKEN` env var is set)

Uses Figma REST API: `GET https://api.figma.com/v1/files/<fileKey>/nodes?ids=<nodeId>`

For each node ID from the manifest:

- **Node not found (404)**: `[FIGMA_REFS_NODE_NOT_FOUND] thinking-indicator: node 2130:6 not found in Figma file — component may have been deleted or recreated`
- **Type mismatch**: `[FIGMA_REFS_TYPE_MISMATCH] thinking-indicator: expected COMPONENT_SET but got FRAME`
- **Name mismatch**: `[FIGMA_REFS_NAME_MISMATCH] thinking-indicator: expected "Reasoning" but got "Reasoning_OLD"`
- **Variant axis mismatch** (ComponentSet only): `[FIGMA_REFS_VARIANT_MISMATCH] thinking-indicator: expected state=[streaming,expanded,collapsed,duration]`

If `FIGMA_API_TOKEN` is not set: print `[FIGMA_REFS_LIVE_CHECK_SKIPPED] FIGMA_API_TOKEN not set — live node resolution skipped` and pass. This matches the pattern used by `figma-variables-sync-enterprise.mjs`.

### Success output

```
✓ Figma refs cross-check passed (1 component, 1 node ID consistent)
✓ Figma refs live validation passed (1/1 nodes resolved correctly)
```

---

## Error Code Reference

| Code                              | Phase | Meaning                                                              |
| --------------------------------- | ----- | -------------------------------------------------------------------- |
| `[FIGMA_REFS_NODE_ID_MISMATCH]`   | 1     | Node ID differs between `*.figma.tsx` and `storybook/connect/*.json` |
| `[FIGMA_REFS_MANIFEST_STALE]`     | 1     | Source files have a node ID not recorded in the manifest             |
| `[FIGMA_REFS_MANIFEST_MISSING]`   | 1     | `figma/refs-manifest.json` does not exist                            |
| `[FIGMA_REFS_LIVE_CHECK_SKIPPED]` | 2     | `FIGMA_API_TOKEN` not set (non-blocking)                             |
| `[FIGMA_REFS_NODE_NOT_FOUND]`     | 2     | Node ID no longer exists in Figma file                               |
| `[FIGMA_REFS_TYPE_MISMATCH]`      | 2     | Node exists but wrong type                                           |
| `[FIGMA_REFS_NAME_MISMATCH]`      | 2     | Node exists but name changed                                         |
| `[FIGMA_REFS_VARIANT_MISMATCH]`   | 2     | ComponentSet variant values changed                                  |

---

## Governance Integration

Add `validate:figma-refs` after `validate:figma-parity` in `governanceSteps` in `scripts/lib/token-governance.mjs`. This means it runs as part of `pnpm govern:tokens` → `just preflight` → CI.

No `justfile` changes needed — it slots into the existing `govern:tokens` orchestration automatically.

---

## Critical Files

- `scripts/validate-figma-refs.mjs` — **new** entrypoint
- `scripts/lib/figma-refs.mjs` — **new** core logic
- `scripts/govern-figma-refs.mjs` — **new** manifest update command
- `figma/refs-manifest.json` — **new** checked-in expected state manifest
- `scripts/lib/token-governance.mjs` — add step to `governanceSteps` array
- `package.json` — add `validate:figma-refs` and `govern:figma-refs` scripts

### Existing patterns to match exactly

- Error format: `[SCREAMING_SNAKE_CODE] message` on stderr
- Success format: `✓ message` on stdout
- `writeLine(stream, message)` helper — copy from `figma-parity.mjs:110`
- Dependency injection pattern — `options.fetch`, `options.readJson`, `options.env`, etc. — copy from `figma-variables-sync-enterprise.mjs`
- Exit codes: 0 = pass, 1 = validation failure, 3 = unexpected runtime error

---

## Verification

1. Run `pnpm validate:figma-refs` — should pass with current state
2. Manually change a node ID in `ThinkingIndicator.figma.tsx` to a wrong value → `pnpm validate:figma-refs` should fail with `[FIGMA_REFS_NODE_ID_MISMATCH]`
3. Restore correct node ID, set `FIGMA_API_TOKEN=<real-token>` → should pass Phase 2 live check
4. Change manifest node ID to a non-existent ID with token set → should fail `[FIGMA_REFS_NODE_NOT_FOUND]`
5. `just preflight` — should include `validate:figma-refs` in step 1 token governance output
