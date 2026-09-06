# TODO: Design-system tooling as an installable CLI

**Spec:** [`SPEC.md`](../SPEC.md) · **Plan:** [`plan.md`](plan.md)
Success criteria **S1**–**S8** are defined in `SPEC.md`. Task IDs match the plan's graph.

---

## Phase 1 — Foundation

### T1: Wire `.agents` into ESLint, vitest and tsc

**Description:** 162 tracked files under `.agents/` are invisible to every repo gate. Nothing
executable can land there until `just preflight` can see it. Land this alone — it is independent
of the rest of the migration and will surface violations in files that have never been checked.

**Acceptance criteria:**

- [ ] `eslint.config.mjs` no longer blanket-ignores `.agents/**`; any remaining exclusion is
      narrow and carries a comment saying why
- [ ] vitest resolves test files under `.agents/`
- [ ] `tsc --listFilesOnly` reports a non-zero count under `.agents/` (a `**/*` glob skips
      dot-directories, so an explicit include is required)
- [ ] Every surfaced violation is fixed, or excluded with a recorded reason

**Verification:**

- [ ] `just check` passes
- [ ] `just preflight` passes
- [ ] `npx tsc --noEmit --listFilesOnly | grep -c '/.agents/'` returns > 0 (**S7**)

**Dependencies:** None
**Files likely touched:** `eslint.config.mjs`, `vitest.config.ts`, `tsconfig.json`, plus fixes
**Scope:** M — unknown tail on the violation count

---

### T2: Remove the enterprise REST rail from Collider

**Description:** Delete the `rest-variables-oauth` code path and its entry points. This also
resolves the `successMarkers` crash by deletion — a successful sync currently exits 3 with
`[UNEXPECTED_RUNTIME_FAILURE]`, pre-existing and never observed because the rail has never run
to success.

**Acceptance criteria:**

- [ ] `scripts/figma-variables-sync-enterprise.mjs` and
      `scripts/lib/figma-variables-sync-enterprise.mjs` deleted
- [ ] `figma:sync:variables:enterprise` gone from `package.json`
- [ ] `figma-sync-variables-enterprise` recipe gone from the `justfile`
- [ ] The mode is removed from both validators' enums **and** their error messages:
      `scripts/lib/sync-ledger.mjs:31,233` and `scripts/lib/publish-proof.mjs:12,57`

**Verification:**

- [ ] `just preflight` passes
- [ ] `pnpm validate:sync-ledger` passes against the live ledger
- [ ] `grep -rn "rest-variables-oauth" scripts/ src/ package.json justfile` returns nothing

**Dependencies:** None
**Files likely touched:** 2 deleted, `package.json`, `justfile`, 2 validators
**Scope:** M

---

### T3: Repoint the two ledger fixtures off `rest-variables-oauth`

**Description:** `valid-required` and `invalid-contradictory-mode` both carry the retired mode,
and both are loaded by name in `figma-sync-policy.test.ts`. Neither fixture is _about_ the mode —
they exercise parity and carrier invariants — so the substitution is mechanical.

**Acceptance criteria:**

- [ ] Both fixtures use `plugin-import-manual`
- [ ] `invalid-contradictory-mode` still fails for the reason it was written to test, not because
      the mode is now unknown

**Verification:**

- [ ] `pnpm vitest run src/lib/tokens/figma-sync-policy.test.ts` passes
- [ ] Read the failure message from the invalid fixture and confirm it names the carrier
      contradiction, not an invalid mode

**Dependencies:** T2
**Files likely touched:** 2 fixtures
**Scope:** XS

---

### T4: Update the governance docs that name the retired mode

**Description:** Four live docs describe `rest-variables-oauth` as a future hardening target.
`parity-policy.md:29` is a written commitment — it holds the Enterprise path open "until
Enterprise API becomes available without seat restrictions." Rewrite it as **retired**; do not
quietly drop the sentence.

**Acceptance criteria:**

- [ ] `src/figma/parity-policy.md:10,29` states the mode is retired and why
- [ ] `src/figma/README.md:16` and `src/figma/publish-proof-contract.md:14` updated
- [ ] `.agents/skills/schemas/sync-ledger.schema.json:34` and
      `.agents/skills/profiles/collider.json:9` drop the enum value
- [ ] No doc still implies the mode is available

**Verification:**

- [ ] `grep -rn "rest-variables-oauth" --exclude-dir=archive --exclude-dir=node_modules .`
      returns nothing (**S5**)
- [ ] `node .agents/skills/scripts/validate-artifact.mjs` still accepts the live ledger
- [ ] `just preflight` passes

**Dependencies:** T2
**Files likely touched:** 3 docs, 1 schema, 1 profile
**Scope:** M

---

### T5: Remove `syncVariablesViaRest` from the pack

**Description:** Delete the REST rail and its 19 tests. The `smoke` script asserts
`typeof m.syncVariablesViaRest === 'function'` — it must be repointed at a surviving export or
the gate fails on a correct build.

**Acceptance criteria:**

- [ ] `src/rails/rest-variables.ts` and `rest-variables.test.ts` deleted
- [ ] The export is gone from `src/index.ts`
- [ ] `smoke` checks a surviving export

**Verification:**

- [ ] `pnpm check` passes end to end, including `smoke` and `pack-check`

**Dependencies:** None (different repo from T2)
**Files likely touched:** 2 deleted, `src/index.ts`, `package.json`
**Scope:** S

---

### T6: Fix the hardcoded Collider values in the plugin UI

**Description:** `plugin/ui.html` carries `localhost:4173` at lines 120 and 159 and
`design-tokens/src/tokens/` at line 141. Meanwhile `plugin/build.mjs:70` already calls
`replaceAll("__RAIL_ARTIFACT_ORIGIN__", …)` against a placeholder that **appears nowhere in the
HTML** — a silent no-op. Wire the existing placeholder and add one for the token-source path.

**Acceptance criteria:**

- [ ] `__RAIL_ARTIFACT_ORIGIN__` appears in `ui.html` and is substituted at build time
- [ ] The token-source path is configurable, defaulting to something repo-neutral
- [ ] No `localhost:4173` or Collider path remains in the pack's sources
- [ ] Building with Collider's config still yields `localhost:4173` in the output

**Verification:**

- [ ] `grep -n "localhost:4173\|design-tokens/src" plugin/ui.html` returns nothing
- [ ] Build with `figma/token-sync.config.json` and confirm the built `ui.html` contains
      `localhost:4173`
- [ ] `manifest.json` still byte-identical (**S4**)

**Dependencies:** None
**Files likely touched:** `plugin/ui.html`, `plugin/build.mjs`, config schema
**Scope:** S

---

> ### ✅ Checkpoint: Foundation
>
> - [ ] `just preflight` green; `pnpm check` green including `pack-check`
> - [ ] **S5** and **S7** hold
> - [ ] **Review with human before T7** — it renames a repo

---

## Phase 2 — The pack becomes the tool

### T7: Rename the repo and scaffold the `ds-skills` CLI

**Description:** Rename `atomize-hq/figma-token-rail` to the pack's name, add `bin/ds-skills`,
and fix the command signatures. **Settle the CI install mechanism here** — global install, skills
installer, or pinned `dlx`. T13 removes the fallback, so an unanswered question at that point is
a blocker.

**Acceptance criteria:**

- [ ] Repo renamed; package renamed to `@atomize-hq/design-system-skills`
- [ ] `bin/ds-skills` dispatches the five commands in `SPEC.md` §4.2
- [ ] Every command exits non-zero on failure and reads only data
- [ ] The CI install mechanism is chosen and proved in a throwaway workflow

**Verification:**

- [ ] `pack-check` invokes `ds-skills` from `node_modules/.bin` in a throwaway project
- [ ] `ds-skills --help` lists all five commands
- [ ] The throwaway workflow installs and runs the CLI with no repo credentials

**Dependencies:** Foundation checkpoint
**Files likely touched:** `package.json`, `bin/`, `src/cli/`, CI workflow
**Scope:** M

---

### T8: Move the rail modules under `src/figma/`

**Description:** Relocate `token-mapping`, `drift` and the plugin builder into the pack's figma
namespace. Pure move — no behaviour change.

**Acceptance criteria:**

- [ ] Modules live under `src/figma/`; every relative import carries a `.js` specifier
- [ ] `moduleResolution: NodeNext` still passes typecheck

**Verification:**

- [ ] `pnpm check` passes, including `smoke` (the built ESM loads under Node)
- [ ] Rail output unchanged against Collider's artifact: 176 leaves, both themes (**S3**)

**Dependencies:** T7
**Files likely touched:** 3–4 moved, `src/index.ts`
**Scope:** S

---

### T9: Move skills, schemas, profiles and templates in as shipped data

**Description:** The 8 skills, 5 schemas, profiles and templates move from Collider's
`.agents/skills/` into the pack and ship as package data. Only 2 skills reference the rail
workflow (`sync-quality-governor`, `stage-1`), so the rewrite surface is small.

**Acceptance criteria:**

- [ ] `skills/`, `schemas/`, `profiles/`, `templates/` present in the pack and listed in `files`
- [ ] The two rail-referencing skills describe CLI invocations, not repo paths
- [ ] `validate-artifact.mjs` moves behind `ds-skills validate` unchanged

**Verification:**

- [ ] `pack-check` confirms all four directories survive packing
- [ ] Every real Collider artifact still validates against its schema, with and without the
      profile
- [ ] The old v1 templates are still correctly rejected

**Dependencies:** T7
**Files likely touched:** ~160 moved, `package.json` `files`
**Scope:** L — large by file count, mechanical by nature

---

### T10: Move the CT-8B ledger mechanism behind `ds-skills ledger validate`

**Description:** The 237-line sync script's inputs are a 20-line JSON ledger and a policy table.
Reimplement it generically, parameterized by ledger path and profile name.

**Acceptance criteria:**

- [ ] `ds-skills ledger validate --ledger <path> --profile <name>` reproduces today's outcomes
- [ ] Promotion levels and exception codes come from the profile, not from code
- [ ] Errors still carry a phase (`auth` / `ledger` / `artifact` / `transport`)
- [ ] Collider's 11 ledger fixtures all produce their current results

**Verification:**

- [ ] Run against all 11 fixtures in `scripts/fixtures/sync-ledger/` — every pass still passes
      and every failure still fails for the same recorded reason
- [ ] `pnpm check` passes

**Dependencies:** T7
**Files likely touched:** `src/ledger/`, profile schema, tests
**Scope:** M

---

> ### ✅ Checkpoint: The pack is self-sufficient
>
> - [ ] `pack-check` runs `ds-skills` from an installed tarball
> - [ ] No import crosses the repo boundary in either direction
> - [ ] Pack suite covers flattener, comparator, theme resolution, `$themeOverrides`

---

## Phase 3 — Collider stops owning rail code

### T11: Add `figma verify` and the expectations file

**Description:** Replace `figma-token-rail.test.ts` with JSON plus a CLI call. Delete its third
case outright — it builds the expected set, echoes it back as observed and asserts no drift,
testing the package against itself. Move the `$themeOverrides` assertion from
`token-build-contracts.test.ts:116` into the pack.

**Acceptance criteria:**

- [ ] `figma/token-rail.expectations.json` holds `leafCount`, `firstLeaf`, `lastLeaf`,
      `defaultThemeId`, `themeIds`
- [ ] `ds-skills figma verify --config … --expect …` checks them and exits non-zero on mismatch
- [ ] Wired into `just preflight`
- [ ] `src/lib/tokens/figma-token-rail.test.ts` deleted; the self-referential case not carried
      over anywhere
- [ ] `$themeOverrides` assertion lives in the pack's suite

**Verification:**

- [ ] Perturb `design-tokens/dist/figma/tokens.json`, confirm `just preflight` **fails**, restore,
      confirm it passes (**S2**) — verify by perturbing, not by reasoning
- [ ] Verify reports 176 leaves, `accent/primary` first, `type/weight/semibold` last, themes
      `['dark','light']`, default `dark` (**S3**)

**Dependencies:** T8, T10
**Files likely touched:** 1 new JSON, 1 deleted test, `justfile`, `token-build-contracts.test.ts`
**Scope:** M

---

### T12: Replace `build-figma-plugin.mjs` with a CLI invocation

**Description:** The wrapper exists only to stamp `figma/token-sync.config.json` through the
package's builder. The CLI reads that config directly.

**Acceptance criteria:**

- [ ] `scripts/build-figma-plugin.mjs` deleted
- [ ] `just figma-plugin-build` calls `ds-skills figma plugin build --config …`
- [ ] The plugin builds to the same path

**Verification:**

- [ ] `just figma-plugin-build` succeeds
- [ ] `manifest.json` byte-identical to the pre-work copy (**S4**) — Figma's existing plugin
      registration must keep loading
- [ ] Built `code.js` calls the same Figma API surface as before

**Dependencies:** T8
**Files likely touched:** 1 deleted, `justfile`, `package.json`
**Scope:** S

---

### T13: Drop `@atomize-hq/figma-token-rail` from `package.json`

**Description:** The last step of the boundary move. Only safe once T11 and T12 have removed the
final import.

**Acceptance criteria:**

- [ ] The dependency is gone and `pnpm-lock.yaml` regenerated
- [ ] `pnpm install --frozen-lockfile` succeeds from a clean `node_modules`

**Verification:**

- [ ] `grep -rn "figma-token-rail" package.json src/ scripts/` returns nothing (**S1**)
- [ ] `rm -rf node_modules && pnpm install --frozen-lockfile && just preflight` passes
- [ ] Clear `node_modules/.cache/storybook` before blaming any failure on this change

**Dependencies:** T11, T12
**Files likely touched:** `package.json`, `pnpm-lock.yaml`
**Scope:** XS

---

> ### ✅ Checkpoint: The boundary holds
>
> - [ ] **S1**, **S2**, **S3**, **S4** all hold
> - [ ] `just preflight` green

---

## Phase 4 — Publish and close

### T14: Publish the pack and add its install step to CI

**Description:** Where BL-3 actually closes. The pack must install in CI **without repo
credentials**, or this recreates BL-3's break under a new name.

**Acceptance criteria:**

- [ ] The pack is published and installable by an unauthenticated consumer
- [ ] All 8 CI jobs install it and run `just preflight`
- [ ] BL-3 and BL-4 marked closed in `docs/backlog.md`

**Verification:**

- [ ] A PR run goes green through dependency install (**S8**)
- [ ] Install from a clean checkout with no credentials configured
- [ ] All eight success criteria in `SPEC.md` hold

**Dependencies:** T13
**Files likely touched:** `.github/workflows/ci.yml`, `docs/backlog.md`, pack `package.json`
**Scope:** M

---

> ### ✅ Checkpoint: Complete
>
> - [ ] **S1**–**S8** all hold
> - [ ] BL-3 and BL-4 closed; **BL-2 unblocked** — open it as its own PR, never in this diff
> - [ ] `SPEC.md` updated if any decision changed during implementation

---

## Not in this work

- **BL-1** (`figmaComponentRef` dual-format) — same pattern, zero shared code, different surface
- **BL-2** (Chromatic) — unblocked by T14, but accepting 205 visual baselines must not share a
  diff with a tooling migration
