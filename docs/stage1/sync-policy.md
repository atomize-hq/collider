# Sync Policy

**Status:** live policy
**Date:** 2026-03-23, revised 2026-09-03 (Code Connect retired; gate aligned to practice)

---

## What counts as drift

A component is in drift when any of the following is true:

| Signal              | Drift condition                                                                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Code ↔ Figma**    | The React component's visual output no longer matches the Figma library component for the same variant/state combination                                 |
| **Figma node ref**  | `downstreamHooks.figmaComponentRef` in `storybook/component-specs/<id>.json` points to a deleted or renamed Figma node                                   |
| **Story ↔ Spec**    | `storybook/story-inventory.json` lists story IDs that no longer exist, or required story kinds are missing                                               |
| **Token ↔ CSS**     | `src/lib/tokens/tokens.css` is stale vs. `design-tokens/dist/css/tokens.css`                                                                             |
| **Figma variables** | Figma variables diverge from the token values in `design-tokens/dist/figma/tokens.json` — measured by the repo plugin's read-only **Check Drift** action |
| **Sync ledger**     | `src/figma/sync-ledger.json` shows a component's `syncStatus` as `out-of-sync` or `pending`                                                              |

---

## Required links: story ↔ Figma ↔ code

For a design-system component to be considered in sync, the component spec must carry a
live Figma node reference and its stories must be registered:

```
Figma library component
    ↕  downstreamHooks.figmaComponentRef  (storybook/component-specs/<id>.json)
React component (src/components/...)
    ↕  ownedStoryRefs / storybook/story-inventory.json
Storybook stories
```

- `downstreamHooks.figmaComponentRef` must point to a live node in the Collider file.
- `downstreamHooks.codeEntrypoint` must point to the component's real source file.
- Every story ID in `ownedStoryRefs` must exist in `storybook/story-inventory.json`.

### Code Connect is retired

Code Connect is **not** a rail in this project. Do not create `.figma.tsx` files, do not
populate `figma/code-connect/`, and do not add `parameters.design` to stories. The single
recorded design↔code link is `figmaComponentRef` in the component spec.

The CT-11B mapping rail therefore reports `not-applicable` rather than `satisfied` — it has
nothing to measure (see `1383a87`). The implementing code was deliberately **retained**, not
deleted, so a future revival is a data change rather than a rebuild: the moment
`artifacts/harness/reusable-component-mapping-status.json` carries components again, every
branch of that rail resumes on its own.

Archived: [`archive/storybook/code-connect-bootstrap.md`](../../archive/storybook/code-connect-bootstrap.md).

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
| `pnpm figma:connect:validate`             | **Retired** — Code Connect is not a rail    |

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
- [ ] The repo-owned Figma plugin rail / figma-use / Figma MCP surfaces are documented

_(Historical: this list also required a Code Connect bootstrap artifact and a valid
`figma.config.json`. Both were satisfied at the time. Code Connect has since been retired —
`figma.config.json` and the `@figma/code-connect` dependency are retained but unused.)_

### Stage 2 → Stage 3 (organism/layout assembly may begin)

A component graduates from Stage 2 to Stage 3-ready when:

- [ ] React component exists in `src/components/<subdir>/`
- [ ] `storybook/component-specs/<id>.json` exists, with a `tier` and `ownedStoryRefs`
- [ ] All required story kinds for its tier are implemented and in `story-inventory.json`
- [ ] `pnpm validate:storybook-tier-policy` passes for this component
- [ ] Every story passes a11y with zero violations, in **both** themes
- [ ] `downstreamHooks.figmaComponentRef` names the component's Figma node
- [ ] `downstreamHooks.codeEntrypoint` names the component's source file
- [ ] `just preflight` passes

All 32 Stage-2 components meet this gate. Two criteria that appeared here before 2026-09-03
have been removed rather than waived, and it is worth being explicit about why:

- **Code Connect artifacts** (`figma/code-connect/<name>.json`, `.figma.tsx`,
  `parameters.design`) — retired, see above. No component ever had them.
- **`src/figma/sync-ledger.json` entry is `syncStatus: "in-sync"`** — unmeetable by
  construction. That ledger tracks the token artifact, not components; it has no
  per-component array and never had one.

### Outstanding debt, not a gate

**No Chromatic baseline exists for any of the 32 components.** The rail worked — 20 builds
published between 2026-03-21 and 2026-03-24 — but it has published nothing since, so
Chromatic holds the March pilot only. This was never enforced as a Stage-2 exit criterion
and is not reinstated as one here; recording it as a gate nobody has ever passed would just
recreate the fiction this revision removes. It is tracked as **BL-2** in
[`docs/backlog.md`](../backlog.md) and should be settled before Stage 3 leans on visual
review.

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

1. A token value change is materialized into Figma variables via the repo plugin (`pnpm figma:plugin:build` → run `Collider Token Sync` then **Sync Variables**), confirmed by a clean **Check Drift** report
2. A Figma library component is visually updated and reconciled with the React component

Do not update `syncStatus: "in-sync"` optimistically. It requires a confirmed publish or a manual visual reconciliation.

---

## Who owns what

| Artifact                        | Owner                                                                                                                                                                                                                                                                                              |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React component visual fidelity | Code (Stage 2 round-trip)                                                                                                                                                                                                                                                                          |
| Figma library component         | Figma (design source)                                                                                                                                                                                                                                                                              |
| Design↔code link                | Code — `downstreamHooks.figmaComponentRef` in the component spec. Code Connect is retired; the rail is retained but reports `not-applicable`                                                                                                                                                       |
| Design tokens / CSS vars        | Code (`design-tokens/` pipeline)                                                                                                                                                                                                                                                                   |
| Figma variables                 | Code → Figma via repo plugin `Collider Token Sync` (`pnpm figma:plugin:build`, mode `plugin-import-manual`), one-way; drift back from Figma is _reported_, never written into canon. Enterprise Variables REST rail is optional hardening — see [`src/figma/README.md`](../../src/figma/README.md) |
| Story inventory                 | Code (`storybook/story-inventory.json`)                                                                                                                                                                                                                                                            |
| Sync ledger                     | Code (`src/figma/sync-ledger.json`)                                                                                                                                                                                                                                                                |
| Chromatic baseline              | Code + Chromatic CI                                                                                                                                                                                                                                                                                |
