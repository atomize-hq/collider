# Implementation Plan: Design-system tooling as an installable CLI

**Spec:** [`SPEC.md`](../SPEC.md) · **Backlog:** BL-3, BL-4 in [`docs/backlog.md`](../docs/backlog.md)
**Repos touched:** `atomize-hq/collider` and `atomize-hq/figma-token-rail` (renamed in Phase 2)

## Overview

Move every executable Figma-rail path out of Collider and into a single installable CLI, so the
repo contributes JSON and nothing else. Along the way, delete the `rest-variables-oauth` publish
mode entirely and fix three portability defects found while verifying the 2026-09-05 extraction.
Collider ends with **no design-tooling entry in `package.json`**, because nothing imports the
rail any more — it invokes a command.

## Architecture decisions

- **The pack absorbs the rail.** `@atomize-hq/design-system-skills` is the one installable;
  `figma-token-rail` becomes an internal module. The existing rail repo is renamed rather than
  archived, because it already carries CI, Prettier, tsconfig, vitest and `pack-check`.
- **Data crosses the boundary, never code.** No pack command imports from a consuming repo, and
  no consuming repo imports from the pack. Every command reads JSON and exits non-zero on
  failure. This is the single constraint every review of this work should check first.
- **Schemas stay portable, profiles carry vocabulary.** Already true for the story/spec
  artifacts; this extends it to the ledger. Porting to a new repo means writing a profile, never
  editing a schema.
- **`plugin-import-manual` becomes the only publish mode.** Verified safe: no test asserts the
  mode string, and CT-15B already moved the promotion trigger off `rest-variables-oauth` in
  `b72315a`.
- **Removal beats repair for the enterprise rail.** The `successMarkers` crash is fixed by
  deleting the file that holds it, not by populating fields the ledger has never carried.

## Dependency graph

```
T1 .agents gates ──────────────────────────────────┐
                                                    │ (independent)
T2 remove REST rail (Collider) ──┬── T3 fixtures ──┤
                                  └── T4 docs      │
T5 remove REST rail (pack) ───────────────────────┤
T6 fix hardcoded plugin UI ───────────────────────┤
                                                    ▼
                              T7 rename repo + CLI scaffold
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
              T8 move rail        T9 move pack data   T10 ledger CLI
                    │                   │                   │
                    └───────────────────┴─────────┬─────────┘
                                                   ▼
                                        T11 figma verify + expectations
                                                   │
                                        T12 plugin build via CLI
                                                   │
                                        T13 drop package.json entry
                                                   │
                                        T14 publish + CI install
```

T1 is independent of everything and lands first to fail fast. T2–T6 are pure deletion and can
be done in any order. T7 is the hinge — nothing after it can start until the CLI exists.

## Phases

### Phase 1: Foundation — gates and removal

- [ ] T1: Wire `.agents` into ESLint, vitest and tsc
- [ ] T2: Remove the enterprise REST rail from Collider
- [ ] T3: Repoint the two ledger fixtures off `rest-variables-oauth`
- [ ] T4: Update the four governance docs that name the retired mode
- [ ] T5: Remove `syncVariablesViaRest` from the pack
- [ ] T6: Fix the hardcoded Collider values in the plugin UI

**Checkpoint: Foundation**

- [ ] `just preflight` green in Collider
- [ ] `pnpm check` green in the pack, including `pack-check`
- [ ] `grep -rn "rest-variables-oauth" --exclude-dir=archive .` returns nothing (**S5**)
- [ ] ESLint, vitest and tsc each report a non-zero file count under `.agents/` (**S7**)
- [ ] Review with human before Phase 2 — T7 renames a repo

### Phase 2: The pack becomes the tool

- [ ] T7: Rename the repo and scaffold the `ds-skills` CLI
- [ ] T8: Move the rail modules under `src/figma/`
- [ ] T9: Move skills, schemas, profiles and templates in as shipped data
- [ ] T10: Move the CT-8B ledger mechanism behind `ds-skills ledger validate`

**Checkpoint: The pack is self-sufficient**

- [ ] `pack-check` installs the tarball and runs `ds-skills` from `node_modules/.bin`
- [ ] Every command reads data only — no import crosses the repo boundary in either direction
- [ ] The pack's own suite covers the flattener, comparator, theme resolution and
      `$themeOverrides`

### Phase 3: Collider stops owning rail code

- [ ] T11: Add `figma verify` and the expectations file; delete `figma-token-rail.test.ts`
- [ ] T12: Replace `build-figma-plugin.mjs` with a CLI invocation
- [ ] T13: Drop `@atomize-hq/figma-token-rail` from `package.json`

**Checkpoint: The boundary holds**

- [ ] `grep -rn "figma-token-rail" package.json src/ scripts/` returns nothing (**S1**)
- [ ] A perturbed token artifact fails `just preflight` (**S2**) — verify by perturbing, not
      by reasoning
- [ ] Rail output unchanged: 176 leaves, both themes, same first and last (**S3**)
- [ ] `manifest.json` byte-identical to the pre-work copy (**S4**)

### Phase 4: Publish and close

- [ ] T14: Publish the pack and add its install step to CI

**Checkpoint: Complete**

- [ ] A PR run goes green through dependency install without repo credentials (**S8**)
- [ ] All eight success criteria in `SPEC.md` hold
- [ ] BL-3 closed; BL-4 closed; BL-2 unblocked and ready to open as its own PR

## Risks and mitigations

| Risk                                                                                                                                                                                        | Impact                              | Mitigation                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **How `ds-skills` reaches CI is unsettled.** With no `package.json` entry it needs a global install, the skills installer, or a pinned `dlx` — each caches and pins differently in Actions. | **High** — T13 removes the fallback | Settle at T7, before T13. Prove the chosen mechanism in a throwaway workflow first.                                                        |
| **The pack must install in CI without credentials**, or T14 recreates BL-3's break under a new name.                                                                                        | **High**                            | Publish publicly. A deploy key across eight jobs is the worse alternative and should be a last resort.                                     |
| **T1 surfaces real violations** in 162 files never linted or typechecked.                                                                                                                   | **Medium** — could stall Phase 1    | Budget for it. Fix or explicitly exclude, but record why for anything excluded.                                                            |
| **Renaming the repo breaks the existing git dependency** for anyone mid-work.                                                                                                               | **Medium**                          | GitHub redirects renamed repos, but the lockfile records the old URL. Land T13 in the same window, and warn before renaming.               |
| **`parity-policy.md:29` promises a future this cancels.**                                                                                                                                   | **Low, but a written commitment**   | T4 rewrites the line as _retired_, not deferred. Do not quietly drop the sentence.                                                         |
| **A stale `node_modules/.cache/storybook` fakes syntax errors** and has already caused one misdiagnosis and a false claim in a release commit.                                              | **Low, high embarrassment**         | Clear the cache and re-run before blaming any dependency change for test failures.                                                         |
| **Deleting the REST rail discards 19 passing tests** and working code.                                                                                                                      | **Low**                             | Deliberate. It is recoverable from git history if the Enterprise API ever becomes viable, and would be a new feature rather than a revert. |

## Parallelization

- **Safe to parallelize:** T2/T3/T4 (Collider removal) against T5/T6 (pack) — different repos,
  no shared files. T1 against everything.
- **Must be sequential:** T7 → T8/T9/T10 → T11/T12 → T13 → T14. The CLI must exist before
  anything can call it, and the last import must go before the dependency does.
- **Needs coordination:** T10 and T11 both define CLI surface. Fix the command signatures in T7
  so the two can proceed without renegotiating them.

## Open questions

- **Which install mechanism for `ds-skills`?** The load-bearing unknown. Needs an answer at T7.
- **Does `.agents/skills/` in a consuming repo become generated output or stay tracked?** Agents
  read skills from disk, so the pack must be materialized somewhere. If it becomes generated,
  the `.claude/skills` symlinks and the "edit only in `.agents`" rule both need revisiting.
- **Does the pack keep `@atomize-hq` scope on npm, and public or restricted?** Public is implied
  by the CI requirement, but it is the user's call.
