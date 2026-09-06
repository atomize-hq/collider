# Implementation Plan: Design-system tooling as an installable CLI

**Spec:** [`SPEC.md`](../SPEC.md) · **Backlog:** BL-3, BL-4 in [`docs/backlog.md`](../docs/backlog.md)
**Review:** [`docs/consultations/2026-09-06-tooling-migration-review.md`](../docs/consultations/2026-09-06-tooling-migration-review.md) — verdict ADJUST; this revision applies it.
**Repos touched:** `atomize-hq/collider` and `atomize-hq/figma-token-rail` (renamed in Phase 2)

## Overview

Move every executable Figma-rail path out of Collider and into a single installable CLI, so the
repo contributes JSON and nothing else. Delete the `rest-variables-oauth` publish mode entirely,
and fix the portability defects found while verifying the 2026-09-05 extraction. Collider ends
with **no design-tooling entry in `package.json`**, because nothing imports the rail any more —
it invokes a command.

## What changed from the first draft

Three defects were confirmed against the repository, and each forced a structural change:

| Confirmed defect                                                                                                                                                                                                                            | Correction                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Removing the publish-mode enum breaks `valid-required.sync-ledger.json`, which is asserted to yield `[]` and is the base for six further assertions. The old T2 could not pass its own verification before the old T3 repaired the fixture. | **One atomic retirement task** (T3), not three sequential ones.                       |
| `pnpm govern:tokens` is preflight step 1 of 5 and registers `build:tokens`, so a perturbed artifact is regenerated before any verify step sees it.                                                                                          | S2 is verified in an **isolated worktree**, and must fail for the intended invariant. |
| `pack-check.sh` runs `pnpm add "$tarball" esbuild` — it installs the optional peer, so it never proves a plain install can build the plugin.                                                                                                | **T14** makes the builder self-contained and expands `pack-check`.                    |

### Round 2 (2026-09-06, second review)

| Confirmed defect                                                                                                                                                                                                                                                                | Correction                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **The isolated worktree does not dodge regeneration** — that worktree's own preflight runs `build:tokens` too. The round-1 S2 fix moved the blast radius, not the overwrite.                                                                                                    | Two complementary tests: artifact rejection in a data-only fixture the build does not touch, and gate propagation via a **persistent expectation mismatch**. |
| **No CI job runs `just preflight`.** It is the pre-push hook; CI runs the parts as separate jobs, and `figma-token-rail.test.ts` runs inside `just test-all`, which **is** a CI job. Wiring the replacement into preflight alone deletes a CI gate while every job stays green. | `SPEC.md` §5.4 maps the 8 jobs; T16 names the required job; T18 proves a deliberate regression turns it red.                                                 |
| **The dependency clauses omitted T11 and T12.** T14 depended on T10 and T13 only, so the explicit chain to T18 never scheduled the pack-data or ledger-command work the checkpoints require.                                                                                    | T8 depends on T7 **and T9**; T14 depends on all four implementation tasks; T15 on the checkpoint.                                                            |
| **The expectations file could not express what T13 demanded.** Five summary fields cannot encode interior values, so "compare the full normalized mapping" was unsatisfiable.                                                                                                   | The file carries or references the T1 full baseline, and keeps the summary constraints.                                                                      |
| T7 accepted that Collider's dependency "may break as long as it is understood", contradicting the Phase 2 checkpoint requiring Collider green.                                                                                                                                  | T7 must preserve the reference through the rename, or stop and revise.                                                                                       |
| T16 required full CI green while the private dependency is still in the lockfile until T17.                                                                                                                                                                                     | T16 narrowed to provisioning probes; clean product install belongs to T17/T18.                                                                               |
| T17 switched executable callers but nothing activated the skills — stale Markdown and agent discovery paths survive an otherwise complete migration.                                                                                                                            | Skill cutover is explicit T17 work, staged at T16, decided at T5.                                                                                            |

Two further structural corrections from round 1, both about ordering rather than content:

- **Publication and provisioning move ahead of consumer activation.** The first dangerous
  boundary is the task that makes `preflight` require `ds-skills`, not the task that drops the
  dependency. The old plan required the CLI at T11 and published it at T14.
- **An ownership-closure inventory (T9) is now blocking work, not an assumption.** Without it,
  every task can complete while Collider still owns rail logic through
  `scripts/lib/sync-ledger.mjs` and `scripts/lib/publish-proof.mjs`.

## Architecture decisions

- **The pack absorbs the rail.** `@atomize-hq/design-system-skills` is the one installable;
  `figma-token-rail` becomes an internal module. The existing repo is renamed rather than
  archived — it already carries CI, Prettier, tsconfig, vitest and `pack-check`.
- **Data crosses the boundary, code never does** — with one stated exception: the CLI writes
  generated plugin output into Collider. Those are package-owned artifacts, never
  consumer-maintained source.
- **Provisioning and execution are separate operations.** Provisioning installs an exact
  reviewed release into an isolated prefix and may reach the registry. Execution runs that
  binary and never resolves a newer one. The local pre-push path acquires nothing.
- **Delivery is a GitHub Releases installer script**, following the pattern already proven at
  `atomize-hq/substrate` — a tag-pinned `curl | bash` bootstrap plus a PowerShell twin, fetching
  checksummed release assets. Not npm. It separates provisioning from execution by construction,
  and it dissolves the optional-peer problem by shipping a bundled artifact. **It requires the
  repository to be public**, which is more exposure than the npm route needed.
- **No `package.json` entry does not mean no recorded version.** Collider keeps reviewed JSON
  naming the release tag and expected digest — a toolchain dependency rather than an application
  one.
- **Schemas stay portable, profiles carry vocabulary.** Porting means writing a profile.
- **`plugin-import-manual` becomes the only publish mode.** Verified safe: no test asserts the
  mode string, and CT-15B already moved the promotion trigger off it in `b72315a`.
- **Removal beats repair for the enterprise rail.** The `successMarkers` crash goes with the
  file that holds it.

## Dependency graph

```
T1 baselines + fixture capture ─────┐  (first: T6 changes the builder, T3 changes the fixtures)
T2 .agents gates ───────────────────┤  (independent)
T3 atomic retirement, Collider ─────┤
T4 remove REST rail, pack ──────────┤
T5 delivery contract (decision) ────┤
T6 plugin UI configuration ─────────┤
                                     ▼
              T7 repo + package identity        T3 ──▶ T9 disposition inventory
                          └──────────────┬───────────────┘
                                         ▼
                          T8 CLI contract + scaffold      (needs T7 AND T9)
                                         │
                    ┌────────────────────┼────────────────────┐
                    ▼                    ▼                    ▼
              T10 move rail        T11 move pack data (needs T5's materialization call)
                    │                    │
                    │                    ▼
                    │              T12 ledger cmds
                    ▼                    │
              T13 figma cmds ────────────┤
                    └──────────┬─────────┘
                               ▼
          T14 self-contained builder + pack-check   (needs T10, T11, T12, T13)
                               ▼
                    Phase 2 checkpoint ──▶ T15 cut release  (ask first)
                               ▼
                    T16 prove acquisition + provision + name the required CI job
                               ▼
                    T17 consumer cutover: callers, skills, dependency (atomic)
                               ▼
                    T18 clean-environment evidence + deliberate-failure proof
```

T1 must precede both T6 (which changes the builder producing the manifest baseline) and T3
(which changes the fixtures whose current behaviour must be captured first). **T8's command
contract cannot be approved before T9** says which responsibilities survive — a generic parser
scaffold may start earlier. T14 depends on all four implementation tasks, not two; the first
draft's dependency clauses omitted T11 and T12 entirely, so the explicit chain to T18 never
scheduled them.

## Phases

### Phase 1: Baselines, gate coverage, retirement, delivery contract

- [x] T1: Capture the manifest and rail-output baselines — `45a5027`
- [x] T2: Wire `.agents` into ESLint, vitest and prettier, and prove enforcement — tsc leg resolved as package-side; Collider's own `.mjs` gap recorded as BL-5
- [x] T3: Retire `rest-variables-oauth` from Collider as one atomic change — 2 of 11 fixtures moved, both in one field, diagnostics unchanged
- [x] T4: Remove `syncVariablesViaRest` from the pack — `a134533`; `pack-check` asserted it too
- [x] T5: Decide the delivery contract — `SPEC.md` §10; mechanism proof moved to T14
- [x] T6: Fix the plugin UI's hardcoded values and placeholder substitution — `1f529ed`; S4 byte-identical

**Checkpoint: Foundation** — all six tasks landed; the review is the only thing outstanding.

- [x] `just preflight` green; `pnpm check` green including `pack-check`. Collider's knip was
      **already red at HEAD** before this work, on two leftovers from the extraction — fixed in
      `c788854` so the gate means something again.
- [x] **S5** holds over sources, generated output **and the packed tarball** — checked by
      unpacking it. One deliberate exemption, recorded in the criterion: the frozen
      pre-retirement baseline must keep naming the mode, or T9 has nothing to reconcile against.
- [x] **S7** holds by enforcement, not discovery — a lint error, a failing test and a
      mis-formatted file were each introduced, observed red, and reverted. The tsc leg is
      deliberately not claimed here; it belongs to the package (see T2).
- [x] Baselines from T1 stored and digested, and protected: the capture refuses to overwrite a
      baseline that has drifted, which T3 then exercised for real.
- [x] The delivery contract is written down, including offline local behaviour — `SPEC.md` §10
- [ ] **Review with human before Phase 2** — T7 renames a repo

### Phase 2: A complete, self-contained package

- [ ] T7: Rename the repo and settle package identity
- [ ] T8: Build the CLI contract and scaffold
- [ ] T9: Produce the executable-path disposition inventory
- [ ] T10: Move the rail modules under `src/figma/`
- [ ] T11: Move skills, schemas, profiles and templates in — preparation only
- [ ] T12: Implement the ledger and publish-proof commands
- [ ] T13: Implement the figma commands and transfer the rail tests
- [ ] T14: Make the plugin builder self-contained and expand `pack-check`

**Checkpoint: The package is complete**

- [ ] Every command in `SPEC.md` §4.2 is implemented, with input and side-effect semantics
      specified per §4.3
- [ ] `pack-check` passes its decisive scenario: a clean, data-only consumer with no product
      dependencies, no credentials and **no ambient builder**
- [ ] A second, differently configured consumer passes — different namespace, paths, origin,
      plugin identity and profile vocabulary
- [ ] The pack's suite covers flattener, comparator, theme resolution and `$themeOverrides`
- [ ] The pack has a lint gate and the LOC guard
- [ ] Collider is untouched by this phase and still green

### Phase 3: Distribution and consumer cutover

- [ ] T15: Cut the release — **ask first**
- [ ] T16: Prove anonymous cold acquisition and provision every environment
- [ ] T17: Activate Collider's callers and delete what they supersede

**Checkpoint: The boundary holds**

- [ ] **S1** — the T9 inventory is fully resolved; grep covers both package names across `src/`,
      `scripts/`, `.agents/`, `justfile`, `package.json`, `.github/`
- [ ] **S2** — verified in an isolated worktree, failing for the intended invariant
- [ ] **S3** — full normalized mapping matches the T1 baseline
- [ ] **S4** — manifest byte-identical to the T1 baseline, compared independently

### Phase 4: Clean-environment evidence and closure

- [ ] T18: Full CI acceptance, residual audit, backlog closure

**Checkpoint: Complete**

- [ ] **S6** and **S8** hold — 8 jobs cold-acquire the CLI and run their gate
- [ ] All eight criteria hold
- [ ] BL-3 and BL-4 closed; BL-2 unblocked, to be opened as its own PR

## Risks and mitigations

Ordered by impact on whether this work achieves its objective, not by how easy they are to
describe.

| Risk                                                                                                                                                                                                             | Impact                            | Mitigation                                                                                                                                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A CLI required before it can be provisioned.** The moment preflight needs `ds-skills`, every environment must be able to get it.                                                                               | **High**                          | Phase 3 publishes and provisions _before_ T17 activates any caller. T5 settles the contract in Phase 1.                                                                                                                                                              |
| **The bootstrap does not learn its version from its URL.** `curl … \| bash` supplies no argv; the reference parses `--version=` and otherwise resolves `latest`, so a copied one-liner silently installs latest. | **High**                          | T5 settles an explicit argument contract or a release-specific bootstrap, proven with two selected versions from outside any repo.                                                                                                                                   |
| **The bootstrap executes before any checksum is verified**, and a same-release `SHA256SUMS` is self-consistency, not an independent anchor.                                                                      | **High**                          | Collider's reviewed record is the independent expectation. CI downloads, verifies, then executes. Negative test uses a modified asset **with** a matching modified checksum.                                                                                         |
| **The public repo exposes material on push, not at release.**                                                                                                                                                    | **Medium**                        | Disclosure review at T11, before the first public push; T15's archive review is the second checkpoint.                                                                                                                                                               |
| **Installer implementation was deferred to publication.** T15 required the scripts to exist; nothing owned building and testing them.                                                                            | **Medium**                        | T14 owns the production installers and tests them against frozen candidate assets.                                                                                                                                                                                   |
| **Residual product-owned validators.** `sync-ledger.mjs` and `publish-proof.mjs` are edited by the retirement but never given a final home; the work can report success with rail logic still in Collider.       | **High**                          | T9 is blocking. Every rail-carrying path gets exactly one disposition.                                                                                                                                                                                               |
| **Loss of real-data gate protection.** Moving `$themeOverrides` into a package fixture, or accepting a weak S2/S3, silently drops what the gate actually caught.                                                 | **High**                          | S2 as the two complementary tests in SPEC §7.2 — an isolated worktree does not work, because that worktree's own preflight regenerates the artifact. S3 against the full normalized mapping. Keep consumer-artifact constraints in the CLI's real-data verification. |
| **Accidental governance change during genericization.** T12 rewrites policy evaluation; the 11 fixtures are the only thing pinning current behaviour.                                                            | **High**                          | Freeze expected outcomes **and diagnostic reasons** before rewriting. A fixture must not pass by failing earlier for an unrelated reason.                                                                                                                            |
| **A plugin builder that only works with ambient dependencies.** npm does not auto-install optional peers, and `pack-check` currently installs esbuild itself.                                                    | **High**                          | T14. Prebuild invariant plugin code at release, or make the builder self-contained. Never resolve it from Collider. Test the supported platforms.                                                                                                                    |
| **Skills/CLI version skew and stale materialized assets.** An agent can read instructions for one command contract while executing another.                                                                      | **Medium**                        | T11 settles materialization; CLI and skills share one release identity.                                                                                                                                                                                              |
| **Publication exposes what the move brought with it.** The 2026-09-05 scan covered the rail repo as it then was.                                                                                                 | **Medium**                        | Re-review the final tarball at T15, after all assets have moved.                                                                                                                                                                                                     |
| **Unresolved path and profile semantics.** Config-relative vs cwd-relative, `--profile` name vs path, unknown-profile fallback.                                                                                  | **Medium**                        | Specified in `SPEC.md` §4.3 and tested from outside the repo root.                                                                                                                                                                                                   |
| **`.agents` gate wiring surfaces real violations** in 162 unlinted files.                                                                                                                                        | **Medium**                        | T2 budgets for it. Record a reason for anything excluded.                                                                                                                                                                                                            |
| **Repository rename invalidates the recorded dependency URL.** GitHub redirects Git operations, but hosted action references do not get that redirect.                                                           | **Low**                           | Inspect actual references rather than assuming a break. Ask before renaming.                                                                                                                                                                                         |
| **`parity-policy.md` promises a future this cancels.**                                                                                                                                                           | **Low, but a written commitment** | T3 rewrites it as _retired_, plainly.                                                                                                                                                                                                                                |

Kept in the execution runbook rather than the risk table, because they compete for attention
with the rows above: the stale `node_modules/.cache/storybook` incident, formatter noise between
the two repos' Prettier configs, and the intentional deletion of obsolete tests.

## Parallelization

- **Safe to parallelize:** T1/T2/T5 against each other; T3 (Collider) against T4/T6 (pack).
- **Must be sequential:** T1 → T6 (T6 changes the builder that produces the baseline).
  T7 → T8 → the implementation tasks. T14 → T15 → T16 → T17 → T18.
- **Needs coordination:** T12 and T13 both consume the T8 command contract and the T9 inventory.
  Fix both before either starts.

## Honest note on "every task ends green"

The private `git+ssh` dependency already prevents a clean credential-free CI install today. Local
preflight passing during Phase 1 is **not** clean-CI evidence. This plan does not promise
per-commit clean CI before Phase 3 provisions the tool; achieving that earlier would require an
accessible transitional artifact for the existing dependency, which is not in scope.

## Open questions

- ~~Making the tooling repository public.~~ **Settled 2026-09-06** — the repo is public, and
  anonymous tag-pinned fetches were verified at two existing tags. Remaining approvals: the
  repository rename (T7) and cutting the release (T15). The consequence that moves earlier is
  that migrated material is exposed on push, so disclosure review happens at T11, not T15.
- **Does `.agents/skills/` become generated output or stay tracked?** Blocks T11. If generated,
  the "edit only in `.agents`" rule and the `.claude/skills` symlinks both need revisiting.
- **Where does `figma drift` get observed state?** If it needs a live Figma session, it cannot
  be a gate command.
