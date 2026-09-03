# Sync Policy

**Status:** Stage 1 — policy locked
**Date:** 2026-03-23

---

## What counts as drift

A component is in drift when any of the following is true:

| Signal              | Drift condition                                                                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Code ↔ Figma**    | The React component's visual output no longer matches the Figma library component for the same variant/state combination                                 |
| **Code Connect**    | The `.figma.tsx` mapping has props or variant enums that don't match `supportedVariants` in the CT-11B record                                            |
| **Figma node URL**  | The node URL in `.figma.tsx` points to a deleted or renamed Figma node                                                                                   |
| **Story ↔ Spec**    | `storybook/story-inventory.json` lists story IDs that no longer exist, or required story kinds are missing                                               |
| **Token ↔ CSS**     | `src/lib/tokens/tokens.css` is stale vs. `design-tokens/dist/css/tokens.css`                                                                             |
| **Figma variables** | Figma variables diverge from the token values in `design-tokens/dist/figma/tokens.json` — measured by the repo plugin's read-only **Check Drift** action |
| **Sync ledger**     | `src/figma/sync-ledger.json` shows a component's `syncStatus` as `out-of-sync` or `pending`                                                              |

---

## Required links: story ↔ Figma ↔ code

For every design-system component to be considered in sync, all three links must exist and be valid:

```
Figma library component
    ↕  Code Connect (.figma.tsx + CT-11B record)
React component (src/components/...)
    ↕  parameters.design Figma URL
Storybook story
```

- The `parameters.design.url` in each story must point to a live Figma node.
- The `.figma.tsx` node URL must match the CT-11B `figmaComponentRef`.
- The CT-11B `supportedVariants` must match the actual Figma component properties.

---

## Sync check commands

| Command                                   | What it checks                              |
| ----------------------------------------- | ------------------------------------------- |
| `pnpm validate:figma-parity`              | Design/code parity across mapped components |
| `pnpm validate:tokens`                    | Token build artifact integrity              |
| `pnpm validate:storybook-story-inventory` | Story IDs in inventory are real and present |
| `pnpm validate:storybook-policy`          | Storybook version pin and addon compliance  |
| `pnpm validate:storybook-tier-policy`     | Component tier story coverage               |
| `pnpm validate:storybook-proof-structure` | Proof artifact structure integrity          |
| `pnpm validate:publish-proof`             | Publish proof completeness                  |
| `pnpm validate:sync-ledger`               | Sync ledger freshness                       |
| `pnpm figma:connect:validate`             | Optional Code Connect CLI check             |

`validate:figma-parity` checks the sync ledger's internal consistency; it does not read Figma. To
measure the Figma file itself, run the repo plugin's **Check Drift** action with
`pnpm figma:tokens:serve` running — it records `artifacts/figma/drift-report.json` stamped with the
artifact SHA-256 and repo revision. See [`src/figma/README.md`](../../src/figma/README.md).

`just sweep` runs most of these. Run `just sweep` before a merge that touches design-system components.

---

## Stage promotion criteria

### Stage 1 → Stage 2 (component round-trip loop may begin)

Stage 2 can begin when:

- [ ] This doc (`docs/stage1/sync-policy.md`) and all other Stage 1 docs are committed and reviewed
- [ ] `.storybook/storybook-version-policy.json` is committed and `pnpm validate:storybook-policy` passes
- [ ] `pnpm storybook` launches cleanly with zero errors
- [ ] `just preflight` passes
- [ ] `pnpm build:tokens` produces valid CSS and `pnpm validate:tokens` passes
- [ ] At least one Wave 1 component has a `storybook/component-specs/<name>.json` record
- [ ] `storybook/code-connect-bootstrap.md` is committed (`toolchain-installed` status confirmed)
- [ ] `figma.config.json` is valid and the repo-owned Figma plugin rail / figma-use / Figma MCP surfaces are documented

### Stage 2 → Stage 3 (organism/layout assembly may begin)

A component graduates from Stage 2 to Stage 3-ready when:

- [ ] React component exists in `src/components/<subdir>/`
- [ ] All required story kinds for its tier are implemented and in `story-inventory.json`
- [ ] `pnpm validate:storybook-tier-policy` passes for this component
- [ ] `default` story passes a11y with zero violations
- [ ] Figma design link is in story `parameters.design`
- [ ] CT-11B record exists at `figma/code-connect/<name>.json`
- [ ] `.figma.tsx` exists at `src/components/<subdir>/<name>.figma.tsx`
- [ ] Repo-managed Code Connect mapping files are current, or external Code Connect CLI usage is explicitly deferred
- [ ] Chromatic snapshot baseline exists (build published)
- [ ] `src/figma/sync-ledger.json` entry is `syncStatus: "in-sync"`

### Stage 3 complete

An organism is Stage 3 complete when:

- [ ] All component dependencies are Stage 2 graduated
- [ ] Organism has a Storybook story (at minimum `default` + `docs`)
- [ ] Organism story has a Figma design link pointing to the organism frame
- [ ] `just preflight` passes with the organism in the tree

---

## Sync ledger

`src/figma/sync-ledger.json` is the per-component sync state tracker. It records:

- `componentId` — matches the `storybook/component-specs/<name>.json` record
- `figmaNodeId` — the Figma node this component maps to
- `syncStatus` — `in-sync` | `out-of-sync` | `pending` | `unmapped`
- `lastSyncedAt` — ISO timestamp of the last confirmed sync

Update the sync ledger entry when:

1. A Code Connect mapping is published (`pnpm figma:connect:publish`)
2. A Figma library component is visually updated and reconciled with the React component
3. A token value change is materialized into Figma variables via the repo plugin (`pnpm figma:plugin:build` → run `Collider Token Sync` then **Sync Variables**), confirmed by a clean **Check Drift** report

Do not update `syncStatus: "in-sync"` optimistically. It requires a confirmed publish or a manual visual reconciliation.

---

## Who owns what

| Artifact                        | Owner                                                                                                                                                                                                                                                                                              |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React component visual fidelity | Code (Stage 2 round-trip)                                                                                                                                                                                                                                                                          |
| Figma library component         | Figma (design source)                                                                                                                                                                                                                                                                              |
| Code Connect mapping            | Code (repo-managed, reviewed in PR)                                                                                                                                                                                                                                                                |
| Design tokens / CSS vars        | Code (`design-tokens/` pipeline)                                                                                                                                                                                                                                                                   |
| Figma variables                 | Code → Figma via repo plugin `Collider Token Sync` (`pnpm figma:plugin:build`, mode `plugin-import-manual`), one-way; drift back from Figma is _reported_, never written into canon. Enterprise Variables REST rail is optional hardening — see [`src/figma/README.md`](../../src/figma/README.md) |
| Story inventory                 | Code (`storybook/story-inventory.json`)                                                                                                                                                                                                                                                            |
| Sync ledger                     | Code (`src/figma/sync-ledger.json`)                                                                                                                                                                                                                                                                |
| Chromatic baseline              | Code + Chromatic CI                                                                                                                                                                                                                                                                                |
