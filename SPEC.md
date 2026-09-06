# SPEC — Design-system tooling as an installable CLI

**Status:** proposed, not started
**Raised from:** BL-3 and BL-4 in [`docs/backlog.md`](docs/backlog.md), plus two defects found
on 2026-09-05 while verifying the token-rail extraction (`d867f19`).

---

## 1. Objective

Collider owns **357 lines of executable Figma-rail code against 30 lines of actual data**. The
rail was extracted to its own package on 2026-09-05, but the boundary was cut in the wrong
place: the CT-8B ledger mechanism stayed behind because it looked repo-specific, when its input
is a 20-line JSON file and its policy is a schema plus a lookup table.

This work finishes the cut.

**After:** the design-system skill pack ships as a single installable CLI. A repo adopting it
contributes JSON — config, ledger, expectations, inventories — and no executable rail code.
Collider's `package.json` carries no design-tooling dependency at all, because nothing in
Collider imports the rail any more; it invokes a command.

**Users:** the agent working through the stage-1/2/3 skills, and any human running
`just preflight` or CI. Secondary user: a second repo adopting the pack, which is the whole
reason the boundary matters.

### Success criteria

Testable conditions. This work is done when all of them hold.

| #   | Condition                                                                                                                            | How it is checked                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| S1  | `grep -rn "figma-token-rail" package.json src/ scripts/` returns nothing                                                             | Collider owns no rail import and no dependency entry                   |
| S2  | `ds-skills figma verify` fails on a perturbed token artifact, and `just preflight` fails with it                                     | Perturb `design-tokens/dist/figma/tokens.json`, run preflight, restore |
| S3  | Rail output is unchanged: 176 leaves, `accent/primary` first, `type/weight/semibold` last, themes `['dark','light']`, default `dark` | `ds-skills figma verify` against the real artifact                     |
| S4  | `figma/plugins/collider-token-sync/manifest.json` is byte-identical to today's                                                       | `diff` against a copy taken before the work starts                     |
| S5  | `rest-variables-oauth` appears nowhere outside `archive/`                                                                            | `grep -rn "rest-variables-oauth" --exclude-dir=archive .`              |
| S6  | `just preflight` green in Collider; `pnpm check` green in the pack                                                                   | Both run clean, including `pack-check`                                 |
| S7  | ESLint, vitest and tsc all resolve files under `.agents/`                                                                            | Each reports a non-zero file count for that path                       |
| S8  | CI installs the pack and runs `just preflight` without repo credentials                                                              | A PR run goes green through dependency install                         |

### Tech stack

**Collider** — Next.js 16.1 (App Router, static-export safe), React 19.2, Tailwind 4.2,
Tauri v2 (Rust, edition 2021), Storybook 10.2.19, vitest 4.1.0, TypeScript 5.9.3,
ESLint 9.39, Prettier 3.8.1, pnpm 10.11.1, `just` as the task runner.

**The pack** — Node ESM (`"type": "module"`, `moduleResolution: NodeNext`), TypeScript 5.9.3,
vitest 4.1.0, Prettier 3.8.1, esbuild as an optional peer for the plugin bundle,
`@figma/plugin-typings` for the plugin source. No runtime dependencies.

### Two decisions already made

| Decision                                                                                                     | Consequence                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **The pack absorbs the rail.** One installable, `figma-token-rail` becomes an internal module.               | Reverses the separate-repo split from 2026-09-05. That repo becomes the pack's repo rather than being archived — it already has CI, prettier, tsconfig, vitest and `pack-check`. |
| **`rest-variables-oauth` is removed entirely.** From Collider, from the ledger schema, and from the package. | `plugin-import-manual` becomes the only publish mode. Forecloses the Enterprise Variables REST path that `src/figma/parity-policy.md:29` currently holds open.                   |

**On the second decision — the surface is larger than "246 lines."** The full inventory is in
§3.3. It is still clean, for two reasons verified on 2026-09-05: **no test asserts the mode
string** (0 occurrences across the 6 ledger/publish-proof test files), and **CT-15B already
relaxed the promotion trigger** from `rest-variables-oauth` to `plugin-import-manual` in
`b72315a`, so no governance rule depends on the mode existing.

---

## 2. Scope

### Folds in — prerequisites

| Item                                                      | Why it cannot be deferred                                                                                                                                                                                                                                           |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BL-4 step 1** — wire `.agents` into eslint, vitest, tsc | 162 tracked files with zero gate coverage. `eslint.config.mjs:11` globally ignores `.agents/**`; vitest includes only `src/**` and `storybook/**`; tsconfig's `**/*` glob skips dot-directories. Executable code cannot land somewhere `just preflight` cannot see. |
| **BL-3** — make the tooling installable off this machine  | Transformed, not inherited. The `git+ssh` dependency that breaks all 8 CI jobs is **deleted** rather than fixed, because the `package.json` entry goes away. What survives is the real requirement: CI must be able to install the pack, which means publishing it. |

### Folds in — cheap, same surface

| Item                                                                                                                                                   | Disposition                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`successMarkers` crash** — a successful enterprise sync exits 3 with `[UNEXPECTED_RUNTIME_FAILURE]`                                                  | Resolved by deletion. The file it lives in is removed. Pre-existing (identical at `d867f19^`), never observed because the rail has never run to success.                                                                                                           |
| **Hardcoded Collider values in the package's plugin UI** — `plugin/ui.html` lines 120, 141, 159 carry `localhost:4173` and `design-tokens/src/tokens/` | Must be fixed for the pack to be honestly portable. `plugin/build.mjs:70` already calls `replaceAll("__RAIL_ARTIFACT_ORIGIN__", …)` against a placeholder that **appears nowhere in the HTML** — a no-op. Wire the placeholder, add one for the token-source path. |
| **Self-referential rail test** — `figma-token-rail.test.ts` case 3 builds the expected variable set, echoes it back as observed, asserts no drift      | Delete. It tests the package against itself and duplicates the package's own fixture suite.                                                                                                                                                                        |
| **`$themeOverrides` assertion** — `token-build-contracts.test.ts:116`                                                                                  | Move into the package's suite. It asserts a property of the rail, not of Collider's tokens.                                                                                                                                                                        |

### Explicitly out

| Item                                                  | Why                                                                                                                                                                                                                                                                      |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **BL-1** — `figmaComponentRef` dual-format normalizer | Same _pattern_ (data in the repo, parser in the tool), zero shared code. Different surface: 32 component specs, not the token rail. Folding it in doubles the review surface for no shared work.                                                                         |
| **BL-2** — Chromatic review rail                      | Downstream, not a prerequisite. This work **unblocks** it — BL-2's first step is opening a PR, which currently dies at `pnpm install` in all 8 jobs. Do BL-2 after, as its own PR: it accepts 205 visual baselines and should not share a diff with a tooling migration. |
| **Reviving `rest-variables-oauth` later**             | Out of scope by decision. If the Enterprise API becomes available without seat restrictions, it is a new feature against the pack, not a revert.                                                                                                                         |

---

## 3. Project structure

### 3.1 The pack repo (renamed from `atomize-hq/figma-token-rail`)

```
@atomize-hq/design-system-skills
├── bin/ds-skills                 # the CLI entry point
├── src/
│   ├── cli/                      # command surface (§4.2)
│   ├── figma/                    # the absorbed rail: token-mapping, drift, plugin builder
│   ├── ledger/                   # CT-8B read/write/promote, parameterized by profile
│   └── verify/                   # artifact-vs-expectations checker
├── skills/                       # the 8 skills, shipped as data
├── schemas/                      # 5 portable JSON Schemas
├── profiles/                     # repo vocabulary (collider.json, …)
├── templates/
└── plugin/                       # code.ts, ui.html, manifest.template.json
```

Schemas stay **portable shapes**; profiles stay **repo vocabulary**. That split already exists
and is the model for everything else here — porting means writing a profile, never editing a
schema.

### 3.2 Collider after

**Deleted (357 lines of executable rail code):**

```
scripts/lib/figma-variables-sync-enterprise.mjs   237
src/lib/tokens/figma-token-rail.test.ts            78
scripts/build-figma-plugin.mjs                     33
scripts/figma-variables-sync-enterprise.mjs         9
```

**Kept, and grows by one file (data only):**

```
figma/token-sync.config.json          10   collection, artifact URL, namespace, plugin identity
src/figma/sync-ledger.json            20   CT-8B ledger
figma/token-rail.expectations.json    ~7   NEW — see below
```

The new expectations file is what `figma-token-rail.test.ts` currently asserts in TypeScript:

```json
{
  "leafCount": 176,
  "firstLeaf": "accent/primary",
  "lastLeaf": "type/weight/semibold",
  "defaultThemeId": "dark",
  "themeIds": ["dark", "light"]
}
```

Moving these into JSON improves the failure mode: a changed leaf count becomes a reviewable
diff, not someone editing a test to go green.

### 3.3 Full removal inventory for `rest-variables-oauth`

Larger than the headline number. All of it is live (non-`archive/`) surface:

**Collider — code**

- `scripts/figma-variables-sync-enterprise.mjs` — delete
- `scripts/lib/figma-variables-sync-enterprise.mjs` — delete
- `scripts/lib/sync-ledger.mjs:31` (enum) and `:233` (error message)
- `scripts/lib/publish-proof.mjs:12` (enum) and `:57` (error message)
- `package.json` — drop the `figma:sync:variables:enterprise` script
- `justfile` — drop the `figma-sync-variables-enterprise` recipe

**Collider — fixtures** (both loaded by name in `src/lib/tokens/figma-sync-policy.test.ts`)

- `scripts/fixtures/sync-ledger/valid-required.sync-ledger.json:8` → `plugin-import-manual`
- `scripts/fixtures/sync-ledger/invalid-contradictory-mode.sync-ledger.json:8` → same

Neither fixture is _about_ the mode — they exercise parity and carrier invariants — so the
substitution is mechanical. Re-run `figma-sync-policy.test.ts` to confirm both still fail and
pass for the reasons they were written to.

**Collider — docs**

- `src/figma/README.md:16`
- `src/figma/parity-policy.md:10` and `:29` — `:29` is the promotion trigger and currently
  holds the Enterprise path open. Rewrite it to say the mode is retired, not deferred.
- `src/figma/publish-proof-contract.md:14`

**Pack**

- `schemas/sync-ledger.schema.json:34` and `profiles/collider.json:9` — the enums
- `src/rails/rest-variables.ts` and `rest-variables.test.ts` — delete, with its 19 tests
- `src/index.ts` — drop the export
- `package.json` — the `smoke` script asserts `typeof m.syncVariablesViaRest === 'function'`;
  update it to a surviving export or the smoke gate fails on a correct build

---

## 4. Commands

### 4.1 Collider — what changes

| Today                                                             | After                                                                       |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `pnpm figma:plugin:build` → `node scripts/build-figma-plugin.mjs` | `ds-skills figma plugin build --config figma/token-sync.config.json`        |
| `pnpm figma:sync:variables:enterprise`                            | **removed**                                                                 |
| `figma-token-rail.test.ts` inside `pnpm test`                     | `ds-skills figma verify --config … --expect …`, wired into `just preflight` |

`just preflight` must still fail on a token regression. That is the acceptance criterion for
the verify command, not a nice-to-have — if the gate weakens, this work has made things worse.

`just figma-plugin-build` and `just figma-token-server` keep their names.
`just figma-sync-variables-enterprise` is removed.

### 4.2 Pack — CLI surface

```
ds-skills figma plugin build   --config <path>
ds-skills figma verify         --config <path> --expect <path>
ds-skills figma drift          --config <path>
ds-skills ledger validate      --ledger <path> --profile <name>
ds-skills validate             <schema> <instance> [--profile <path>]
```

The last already exists as `scripts/validate-artifact.mjs` and moves behind the CLI unchanged.

**Every command reads data and exits non-zero on failure.** No command imports from the
consuming repo, and no consuming repo imports from the pack. That is the entire architectural
constraint, and every review of this work should check it first.

---

## 5. Code style

- Follow each repo's existing configuration. Collider: single quotes, 100 columns. The pack:
  double quotes, 80 columns. **Do not unify them** — the 107-line `ui.html` diff between the
  two today is entirely this, and it is noise, not a defect.
- LOC guards apply in Collider (TS/TSX 300, Rust 400). The pack should adopt the same guard
  once it holds real code.
- `moduleResolution: NodeNext` in the pack, with explicit `.js` specifiers on every relative
  import. TypeScript does not rewrite extensionless imports on emit; this already shipped a
  build that vitest resolved and Node could not load.
- Errors carry a phase (`auth`, `ledger`, `artifact`, `transport`) so a caller can distinguish
  a misconfiguration from a rail failure. Preserve this when the ledger mechanism moves.

---

## 6. Testing strategy

### What proves the move worked

1. **Behavioural equivalence on real data.** Before and after must produce identical output:
   `leaves: 176 | first: accent/primary | last: type/weight/semibold`, and
   `themes: ['dark','light'] | default: dark`.
2. **The plugin manifest stays byte-identical.** Figma's existing plugin registration must keep
   loading. This was verified at extraction time and is a hard requirement again.
3. **A deliberately broken token artifact fails `just preflight`.** The test that matters is
   not that the command runs — it is that the gate still bites. Verify by temporarily
   perturbing the artifact, not by reasoning about it.
4. **`pack-check` passes.** Pack a tarball, install into a throwaway project, invoke the CLI
   from `node_modules/.bin`, build the plugin. Three packaging bugs were invisible from inside
   the package and only this caught them.

### Ownership

- **Pack** owns rail unit tests against its own fixture — the flattener, the comparator, theme
  resolution, the `$themeOverrides` property.
- **Collider** owns only what its data can assert, and asserts it through JSON plus the verify
  command. No Collider test imports the rail.
- Delete the self-referential drift case rather than moving it.

### Known trap

A stale `node_modules/.cache/storybook` produced 18 `SyntaxError` failures that were
misdiagnosed as a dependency conflict during the extraction, and a release shipped with a false
causal claim in its commit message. **Before blaming a dependency change for test failures,
clear that cache and re-run.**

---

## 7. Boundaries

### Always

- Keep `just preflight` green, and keep it able to fail. Both.
- Verify against real Collider data before and after every structural move — 176 leaves, both
  themes, the artifact's own namespace.
- Regenerate governance artifacts through their generators (`createReusableComponentStatus()`,
  the token build). Never hand-edit generated JSON.
- Add an entry to `src/components/upstream-policy.json` for any deliberate divergence from an
  upstream component, and treat a failing rule as a decision to make, not a line to delete.

### Ask first

- Publishing the pack, or changing a repo's visibility. Both are outward-facing and effectively
  irreversible; the pack's tracked files were scanned clean on 2026-09-05, but the decision is
  the user's.
- Changing the shape of `src/figma/sync-ledger.json` or the promotion levels. The ledger is
  machine-readable governance truth, and `parity-policy.md` defers to it.
- Removing a publish mode beyond the one decided here.
- Any change that weakens what `just preflight` catches, even temporarily.

### Never

- Run the Enterprise REST rail against the real Figma file. It **DELETEs and recreates** the
  collection, destroying `VariableID`s and every paint binding in the file. It is being removed
  precisely so this cannot happen by accident.
- Re-run a registry CLI over an existing vendored component, or use `shadcn add --overwrite` as
  an upgrade path.
- Vendor a second copy of the flattener. That duplicate already existed once and silently
  drifted, losing the `dimension` token type.
- Leave a false causal claim in a commit message after finding out it was wrong. Push a
  correction.

---

## 8. Sequencing

Each step ends green. Nothing here requires a big-bang cutover.

1. **Wire `.agents` into eslint, vitest, tsc.** Independent, no dependencies, worth landing
   alone. Expect existing violations; fix or explicitly exclude them.
2. **Remove `rest-variables-oauth`** per the §3.3 inventory, in both repos. Deletes the
   `successMarkers` crash rather than fixing it.
3. **Fix the pack's hardcoded Collider values** and wire the dead `__RAIL_ARTIFACT_ORIGIN__`
   placeholder. Small, and it makes every later portability claim true.
4. **Rename the repo, absorb the pack**, build the `ds-skills` CLI, move the skills/schemas/
   profiles/templates in. Largest step; the pack's existing CI, prettier and `pack-check` carry
   over.
5. **Add `figma verify`** and the expectations file. Delete `figma-token-rail.test.ts`; move the
   `$themeOverrides` assertion into the pack.
6. **Replace `build-figma-plugin.mjs`** with a CLI invocation.
7. **Drop `@atomize-hq/figma-token-rail` from `package.json`**, regenerate the lockfile. Only
   safe once 5 and 6 have removed the last import.
8. **Publish the pack** and add its install step to CI. This is where BL-3 actually closes.
9. **Open the BL-2 PR** — now that `pnpm install` succeeds in CI.

---

## 9. Open risks

**How the CLI reaches CI is not yet settled, and it is the load-bearing unknown.** With no
`package.json` entry, `ds-skills` has to arrive some other way — a global install step, the
skills installer, or a pinned `dlx` invocation. Each has different caching and pinning
behaviour in GitHub Actions. Settle this at step 4, before step 7 removes the fallback.

**The pack must be installable in CI without credentials**, or step 8 recreates BL-3's break
under a new name. Publishing publicly is the straightforward answer; the alternative is a
deploy key in eight jobs, which is worse.

**Step 1 may surface real violations.** 162 files have never been linted or typechecked. Budget
for it rather than discovering it mid-migration.

**`parity-policy.md` promises a future that this spec cancels.** Line 29 holds the Enterprise
rail open "until Enterprise API becomes available without seat restrictions." Removing the mode
is a deliberate reversal of a written commitment, and the doc should say so plainly rather than
quietly dropping the sentence.
