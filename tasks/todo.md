# TODO: Design-system tooling as an installable CLI

**Spec:** [`SPEC.md`](../SPEC.md) · **Plan:** [`plan.md`](plan.md)
Success criteria **S1**–**S8** are in `SPEC.md`. Task IDs match the plan's dependency graph.
Revised after the 2026-09-06 approach review; see plan.md "What changed from the first draft".

---

## Phase 1 — Baselines, gates, retirement, delivery contract

### T1: Capture the manifest and rail-output baselines

**Description:** Nothing can be proven unchanged without a reference taken before anything
moves. Must precede T6, which changes the builder that produces the manifest.

**Acceptance criteria:**

- [x] Exact bytes and digest of `figma/plugins/collider-token-sync/manifest.json`, produced by
      the **current** builder, stored outside the build output —
      `figma/plugin-manifest.baseline.json`. The build output is gitignored
      (`.gitignore:79`), so the baseline had to be a separate committed file regardless.
- [x] The **full normalized rail mapping** captured: ordered variable names, resolved types,
      collection and namespace, per-theme values — not the five summary fields —
      `figma/token-rail.baseline.json`, 176 variables, summary retained alongside
- [x] Any nondeterministic field is explicitly identified and excluded from comparison — and
      the exclusion must not weaken S4's literal manifest-byte comparison. **Nothing is
      excluded**, in any of the three: each file carries an `excludedFields: []` with the
      reason it is empty. The manifest interpolates no generated field, so S4 stays literal.
- [x] The 11 ledger fixtures' **current** outcomes and diagnostic reasons captured, before T3
      edits their inputs or validators. Otherwise a T3 regression becomes the new reference
      merely because T9 recorded it afterwards — `scripts/fixtures/sync-ledger/outcomes.baseline.json`

**Verification:**

- [x] Re-run capture twice; the two artifacts are identical — verified by digest across two
      runs, and again after prettier reformatted the capture script
- [x] The stored baseline is committed or otherwise recoverable, not left in a temp directory

**What T1 found, that later tasks depend on:**

- **Two** fixtures carry `rest-variables-oauth`, not one: `valid-required` (valid,
  `verified-current`, promotable) and `invalid-contradictory-mode` (invalid). T3's "both
  fixtures" is right, and its verification note is now concrete —
  `invalid-contradictory-mode` currently fails on
  `[CT-8B_FORBIDDEN_PARITY_DEFERRED_REASON]`, **not** on the mode. After repointing it must
  still fail on that same code. A `[CT-8B_INVALID_...]` mode error there is the regression.
- Its name is misleading: the contradiction it exercises is parity metadata, not publish mode.
  Renaming is not T1's business, but T3 should not read the name as a spec.
- `pnpm baseline:rail` is the capture command, wired next to `baseline:upstream`.

**Dependencies:** None — must be first
**Files likely touched:** a baseline artifact, a small capture script
**Scope:** S — **done** (`pnpm baseline:rail`, 3 baselines, preflight green)

---

### T2: Wire `.agents` into ESLint, vitest and prettier, and prove enforcement

**Description:** 162 tracked files under `.agents/` were said to be invisible to every gate.
Measured, that headline is wrong in both directions, and the corrections change the task:

- **prettier already covered it.** Only `.agents/skills/ai-elements/` is in `.prettierignore`.
  Proven by mis-formatting `validate-artifact.mjs`: `prettier --check .` went red.
- **The gateable surface is one file.** Of the 162: 80 `.tsx` are the vendored ai-elements
  registry payload, kept byte-for-byte so a re-sync is a clean diff and already excluded with
  that reason recorded; 81 are `.md`/`.json`/`.yaml`. The remainder is
  `.agents/skills/scripts/validate-artifact.mjs` — 332 lines, untested, and the only executable
  in the subtree.
- **tsc's blindness is structural, not an exclusion.** A `**` glob does not match a
  leading-dot directory, so `.agents/` never entered the program. `tsc --listFilesOnly`
  reports 0 files there. `.mjs` is not in the include list either, so no `.mjs` anywhere in the
  repo is typechecked.

**The tsc leg does not belong in Collider.** `validate-artifact.mjs` moves into the CLI package
at T11 (`ds-skills validate`), and in the package it does not live under `.agents/` at all — so
a Collider-side Node-tooling tsconfig built to cover it would gate a subtree that is leaving.
That is exactly the "dummy files to satisfy a stale invariant" S7 rules out. Type coverage for
this code lands with the code, in the package's own `pnpm check`. The separate and real gap —
Collider's own 35 `scripts/**/*.mjs` are unchecked, 27 measured errors — is **BL-5**, not this.

**Acceptance criteria:**

- [x] `eslint.config.mjs` no longer blanket-ignores `.agents/**`; the remaining exclusion is
      narrow (`ai-elements/references/`, `ai-elements/scripts/`) and carries the vendoring
      reason. ESLint went from 0 to 1 `.agents` file, 288 files total.
- [x] The one violation it surfaced is fixed: `const { $ref, ...rest }` tripped
      `no-unused-vars`, because `@typescript-eslint`'s rule defaults `ignoreRestSiblings` to
      **false**, unlike the base ESLint rule. Rewritten as an explicit discard.
- [x] vitest resolves test files under `.agents/` — `.agents/**/*.test.mjs` added to the unit
      project, named explicitly because a `**` glob skips dot-directories
- [x] A real test exists, so the glob is not permanently inert:
      `validate-artifact.test.mjs`, 6 cases against the **process** contract, since every
      caller invokes it as `node …` and consumes exit status and stderr. It covers `$ref` with
      sibling override (the line this task edited), the portable-schema/profile split against
      the repo's real ledger, and the property a hand-rolled validator most needs — an
      unimplemented keyword is _rejected_, never silently ignored.
- [x] tsc participates — **resolved as out of scope for Collider**, per above. Recorded, not
      skipped.
- [x] A representative lint error and a failing test under `.agents/` **each fail their gate**

**Verification:**

- [x] `just check` and `just preflight` pass
- [x] **S7 proofs**, each introduced, observed red, and reverted to green: - lint: `new Array(1, 2, 3)` → `@typescript-eslint/no-array-constructor` at **error**;
      `eslint .` exit 1 (a warning would not have — this config tolerates 21 of them) - test: flipped assertion → `pnpm test` exit 1, naming the `.agents` file - prettier: mis-formatted file → `prettier --check .` exit 1 - type: not provable here, and correctly so — see above

**Dependencies:** None
**Files likely touched:** `eslint.config.mjs`, `vitest.config.ts`, `tsconfig*.json`, plus fixes
**Scope:** M — **done**, and smaller than budgeted: 1 warning fixed, 1 test suite added,
2 config lines. The "unknown tail" was 27 errors that turned out to belong to BL-5.

---

### T3: Retire `rest-variables-oauth` from Collider as one atomic change

**Description:** One task, one green state. Splitting the enum removal from the fixture repair
cannot work: `valid-required.sync-ledger.json` carries the mode, is asserted to yield `[]` at
`figma-sync-policy.test.ts:78`, and is the base for six further assertions at lines 110, 123,
144, 157 and 174. Removing the enum first breaks seven assertions.

Also resolves the `successMarkers` crash by deletion — a successful sync currently exits 3 with
`[UNEXPECTED_RUNTIME_FAILURE]`, pre-existing and never observed because the rail has never run
to success.

**Acceptance criteria:**

- [ ] Deleted: `scripts/figma-variables-sync-enterprise.mjs`,
      `scripts/lib/figma-variables-sync-enterprise.mjs`
- [ ] `figma:sync:variables:enterprise` gone from `package.json`;
      `figma-sync-variables-enterprise` gone from the `justfile`
- [ ] Enum **and error message** updated in `scripts/lib/sync-ledger.mjs:31,233` and
      `scripts/lib/publish-proof.mjs:12,57`
- [ ] Both fixtures repointed to `plugin-import-manual` **in the same change**
- [ ] Schema and profile enums updated: `.agents/skills/schemas/sync-ledger.schema.json:34`,
      `.agents/skills/profiles/collider.json:9`
- [ ] `src/figma/parity-policy.md:10,29` states the mode is **retired**, not deferred —
      line 29 is a written commitment, so rewrite it rather than dropping the sentence
- [ ] `src/figma/README.md:16` and `src/figma/publish-proof-contract.md:14` updated

**Verification:**

- [ ] `pnpm vitest run src/lib/tokens/figma-sync-policy.test.ts` passes
- [ ] The contradictory-carrier fixture still fails **naming the carrier contradiction**, not an
      invalid mode — read the message, do not accept a red result
- [ ] `just preflight` passes
- [ ] **S5**: `grep -rn "rest-variables-oauth"` over tracked sources and generated output returns
      nothing, excluding `archive/`, `SPEC.md`, `tasks/` and `docs/consultations/`

**Dependencies:** **T1** — the fixture capture must complete before this task edits those fixtures or their validators
**Files likely touched:** 2 deleted, 2 validators, 2 fixtures, 3 docs, 1 schema, 1 profile,
`package.json`, `justfile`
**Scope:** L — atomic by necessity, not by choice

---

### T4: Remove `syncVariablesViaRest` from the pack

**Description:** Delete the REST rail and its 19 tests. The `smoke` script asserts that export
exists, so it must be repointed or the gate fails on a correct build.

**Acceptance criteria:**

- [ ] `src/rails/rest-variables.ts` and `rest-variables.test.ts` deleted
- [ ] The export is gone from `src/index.ts`
- [ ] `smoke` checks a surviving export

**Verification:**

- [ ] `pnpm check` passes end to end

**Dependencies:** None (different repo from T3)
**Files likely touched:** 2 deleted, `src/index.ts`, `package.json`
**Scope:** S

---

### T5: Decide the delivery contract

**Description:** A decision task with no code. The first draft deferred this into the middle of
the migration; it is settled here instead, because everything from Phase 3 onward depends on it.
The principle: **provisioning and execution are separate operations.**

**Acceptance criteria — each written down, not assumed:**

- [ ] **Distribution is a GitHub Releases installer script**, following
      `atomize-hq/substrate/scripts/substrate/install.sh` and its `install-substrate.ps1` twin.
      Confirm the consequence explicitly: **the repository must be public**, because
      `raw.githubusercontent.com` and `releases/download` both 404 for a private repo without a
      token. This is more exposure than the npm route would have needed — **ask before
      proceeding**
- [ ] Two deliberate divergences from the reference implementation, both recorded: a missing or
      mismatched `SHA256SUMS` **fails** rather than warning and skipping, and an unresolvable
      tag **fails** rather than falling back to `main`
- [ ] Release-identity **format and version-selection rules**, and where Collider records them.
      Three distinct things: deciding the rules (here), assigning the version to be built (before
      T14's decisive pack test), and recording the finished tarball's integrity (T15/T16). T5
      cannot certify bytes that do not exist. Do not change package metadata after T14 and treat
      the rebuilt package as the already-tested artifact
- [ ] The materialization contract's release-selection obligations, so T11 cannot choose an
      incompatible activation scheme
- [ ] Install location and prefix: job-local in CI, persistent and version-specific locally
- [ ] Executable discovery, including the Unix/Windows path difference — the bash and
      PowerShell installers are a matched pair, not an afterthought
- [ ] **How the bootstrap learns its version.** `curl … | bash` supplies no argv and no
      `BASH_SOURCE`; the reference implementation parses `--version=` and otherwise resolves
      `latest`. Choose an explicit argument contract or a release-specific bootstrap carrying its
      own identity. **Prove it with two different selected versions, from outside any repository,
      in a non-interactive shell**, establishing what version reaches the asset URL — not merely
      that the first request returns 200
- [ ] **The reviewed record binds more than one digest**: repository, release, source commit,
      per-platform asset identity and expected integrity. Populated from the T14-tested bytes,
      never from whatever `SHA256SUMS` accompanies a later download
- [ ] **Supported OS / architecture / runtime combinations named.** "Linux/macOS/Windows" is not
      an asset-selection contract, and a bundled builder ships platform-specific binaries
- [ ] **Whether the release includes a Node runtime** or requires a separately provisioned
      supported version. Either is fine; it must be explicit and never resolved from Collider
- [ ] **Lifecycle contract**: install/reinstall idempotent, never leaving a partial directory
      that later reads as complete; upgrade provisions before activating and fails closed on
      CLI/skill skew; concurrent versions coexist and no global "current" pointer overrides
      project selection; uninstall removes only the selected install and leaves a project
      selecting it with an actionable failure, not a fallback
- [ ] `pipefail` guidance for the documented one-liner — a failed `curl` into bash exits 0
- [ ] **GitHub immutable releases enabled**, locking the tag to its commit and preventing asset
      modification
- [ ] Offline local behaviour: the pre-push path acquires nothing, and a missing or mismatched
      install fails with an actionable setup message
- [ ] Caching is an optimization only — a cache miss installs **the same release**
- [ ] An early mechanism proof is planned that needs no published artifact (dummy package or
      workflow-supplied tarball); the release proof belongs to T16

**Verification:**

- [ ] The mechanism proof runs green in a throwaway workflow: isolated install, package
      independence, executable discovery, platform behaviour
- [ ] The decision is recorded in `SPEC.md` §10

**Dependencies:** None
**Files likely touched:** `SPEC.md`, a throwaway workflow
**Scope:** M

---

### T6: Fix the plugin UI's hardcoded values and placeholder substitution

**Description:** `plugin/ui.html` carries `localhost:4173` at lines 120 and 159 and
`design-tokens/src/tokens/` at line 141, while `plugin/build.mjs:70` substitutes
`__RAIL_ARTIFACT_ORIGIN__` — a placeholder that appears nowhere in the HTML, so the call is a
silent no-op.

**Acceptance criteria:**

- [ ] Placeholders exist in `ui.html` for the artifact origin and the token-source path, and
      both are substituted at build time
- [ ] No `localhost:4173` or Collider path remains in the pack's sources
- [ ] Missing placeholder, and unresolved placeholder, each fail loudly
- [ ] Quotes and backslashes in configured values are escaped safely

**Verification:**

- [ ] `grep -n "localhost:4173\|design-tokens/src" plugin/ui.html` returns nothing
- [ ] Build with Collider's config: output contains `localhost:4173`
- [ ] Build a **second, distinctly configured** plugin and confirm the first configuration is
      not still embedded anywhere in the output
- [ ] Manifest still matches the T1 baseline (**S4**)

**Dependencies:** T1 (baseline must exist first)
**Files likely touched:** `plugin/ui.html`, `plugin/build.mjs`, config schema
**Scope:** M

---

> ### ✅ Checkpoint: Foundation
>
> - [ ] `just preflight` green; `pnpm check` green
> - [ ] **S5** and **S7** hold — S7 by enforcement, not file count
> - [ ] T1 baselines stored and digested
> - [ ] Delivery contract written down
> - [ ] **Review with human before T7** — it renames a repo

---

## Phase 2 — A complete, self-contained package

### T7: Rename the repo and settle package identity

**Description:** Administration only, separated from CLI design. GitHub redirects Git operations
after a rename, but hosted action references do not receive that redirect.

**Acceptance criteria:**

- [ ] Repo renamed; package renamed to `@atomize-hq/design-system-skills`
- [ ] Metadata, links and release configuration updated
- [ ] Affected references inspected rather than assumed — action references especially

**Verification:**

- [ ] The pack's own CI passes post-rename
- [ ] **Collider's existing dependency still resolves.** Phase 2 requires Collider green, so a
      new local failure introduced by the rename is not acceptable. Inspect the lockfile
      reference and preserve it through the rename; if that cannot be done, stop and revise the
      transition explicitly. The pre-existing credential failure authorizes nothing here

**Dependencies:** Foundation checkpoint · **ask first**
**Files likely touched:** `package.json`, README, CI config
**Scope:** S

---

### T8: Build the CLI contract and scaffold

**Description:** Parsing, help, version reporting, dispatch and failure behaviour. **Dispatching
five commands must not mean five successful placeholders** — an unimplemented command exits
non-zero with an explicit unavailable-command message. Functional acceptance belongs to T12–T13.

**Acceptance criteria:**

- [ ] `bin/ds-skills` dispatches the five commands in `SPEC.md` §4.2
- [ ] `--help` and `--version` work; `--version` reports the release identity from T5
- [ ] Unimplemented commands exit non-zero with an explicit message
- [ ] Input and side-effect semantics from §4.3 are fixed: path resolution, profile resolution,
      unknown-profile failure, read-vs-write per command

**Verification:**

- [ ] `pack-check` invokes `ds-skills` from `node_modules/.bin`
- [ ] Every command run from **outside** the repository root behaves per the fixed semantics
- [ ] Unknown profile fails loudly rather than defaulting

**Dependencies:** T7 **and T9** — a generic parser scaffold can start earlier, but the command
contract cannot be approved before the inventory says which responsibilities survive
**Files likely touched:** `bin/`, `src/cli/`
**Scope:** M

---

### T9: Produce the executable-path disposition inventory

**Description:** Blocking work, not an assumption. Without it every later task can complete while
Collider still owns rail logic — `scripts/lib/sync-ledger.mjs` and
`scripts/lib/publish-proof.mjs` are edited by T3 but never given a final home.

**Acceptance criteria:**

- [ ] Every entry point, helper, test driver and generator carrying rail semantics is listed
      with its **present callers**
- [ ] Each gets exactly one disposition: `package-owned`, `data`, `command-only`, or `deleted`
- [ ] Covers at minimum `pnpm validate:sync-ledger`, publish-proof validation, the policy tests,
      and any governance generator calling those validators
- [ ] Where a generator only _calls_ a rail validator, the rail-specific policy is extracted —
      the whole generator is not claimed
- [ ] The 11 ledger fixtures' **approved** post-retirement outcomes and diagnostic reasons are
      frozen, reconciled against T1's pre-retirement capture. Every difference is a deliberate
      retirement change or a regression — decide which, do not adopt it silently
- [ ] T3's deleted paths appear in the inventory with a resolved `deleted` disposition; they must
      not vanish from the accounting because the inventory was taken afterwards
- [ ] `scripts/capture-rail-baselines.mjs`, added by T1, gets a disposition like any other
      executable path. It is a migration instrument no gate runs, but it is executable and it
      imports the rail — S1 cannot be accepted while it sits unexamined
- [ ] For each surviving caller, the **replacement command and the output that caller actually
      consumes** is recorded. An exit status suffices for some; a generator consuming structured
      results needs more. Establish this from the caller, not during T17

**Verification:**

- [ ] Every path in the inventory traces to a caller or is marked unreferenced
- [ ] The inventory is reviewed before T12 starts

**Dependencies:** T3 (retirement must land first, or the inventory covers dead paths)
**Files likely touched:** a new inventory document
**Scope:** M — analysis, no code

---

### T10: Move the rail modules under `src/figma/`

**Description:** Pure move. No behaviour change.

**Acceptance criteria:**

- [ ] Modules under `src/figma/`; every relative import carries a `.js` specifier
- [ ] `moduleResolution: NodeNext` passes typecheck

**Verification:**

- [ ] `pnpm check` passes including `smoke` (the built ESM loads under Node)
- [ ] Full normalized mapping matches the T1 baseline (**S3**)

**Dependencies:** T8 (transitively T9)
**Files likely touched:** 3–4 moved, `src/index.ts`
**Scope:** S

---

### T11: Move skills, schemas, profiles and templates in — preparation only

**Description:** Package-side preparation. **Do not remove anything from Collider yet** — a
working `.agents` script stays until its replacement exists and callers are switched. Settle
materialization here: canonical editing location, tracked or generated, stale-copy handling,
`.claude/skills` symlink behaviour, and a release identity shared with the CLI.

**Acceptance criteria:**

- [ ] `skills/`, `schemas/`, `profiles/`, `templates/` present in the pack and in `files`
- [ ] The two rail-referencing skills (`sync-quality-governor`, `stage-1`) describe CLI
      invocations rather than repo paths
- [ ] `validate-artifact.mjs` moves behind `ds-skills validate` unchanged, **and its test
      moves with it** — `validate-artifact.test.mjs` is Collider's only coverage of that
      script, and it tests the process contract, so it ports without rewriting
- [ ] **Disclosure review before the first public push.** The repo is public now, so material is
      exposed the moment it lands — not at release. Review the migrated files, and any history
      actually imported, before pushing. T15's archive review is the second checkpoint, not the
      first
- [ ] The retained `.agents/skills/` subtree is declared the **frozen compatibility snapshot**
      until T17 — still active for agents, not a second independently maintained source
- [ ] There are never two independently editable copies
- [ ] CLI and materialized skills report the same release identity

**Verification:**

- [ ] `pack-check` confirms all four directories survive packing
- [ ] Every real Collider artifact validates against its schema, with and without the profile
- [ ] The old v1 templates are still correctly rejected
- [ ] Collider is unchanged by this task and still green

**Dependencies:** T8 (transitively T9), and T5's materialization decision
**Files likely touched:** ~160 moved into the pack, `package.json` `files`
**Scope:** L — large by count; discovery paths, relative references and symlinks make it more
than mechanical

---

### T12: Implement the ledger and publish-proof commands

**Description:** Scope comes from T9's inventory, not from the deleted sync script. Determine
which read/write/promotion responsibilities survive REST retirement; give each an explicit
command or package-owned path. Do not recreate obsolete sync behaviour because an old directory
description mentioned it, and do not silently drop surviving governance behaviour.

**Acceptance criteria:**

- [ ] Every `package-owned` entry from T9 that this task owns is implemented; each inventory
      entry names **one** implementing task, T12 or T13, with no overlap
- [ ] Promotion levels and exception codes come from the profile, not from code
- [ ] Errors carry a phase (`ledger`, `artifact`, …)
- [ ] Collider's callers have a command to switch to at T17

**Verification:**

- [ ] All 11 fixtures produce their **frozen** outcomes and diagnostic reasons — a fixture must
      not pass by failing earlier for an unrelated reason
- [ ] `pnpm check` passes

**Dependencies:** T8, T9, T11 (profile/schema contract)
**Files likely touched:** `src/ledger/`, profile schema, tests
**Scope:** M — reconcile against T9 before committing to this size

---

### T13: Implement the figma commands and transfer the rail tests

**Description:** `figma verify`, `figma drift`, `figma plugin build`. Package-side only —
Collider activation is T17. Move `$themeOverrides` coverage here so the Phase 2 checkpoint can
actually hold.

**Acceptance criteria:**

- [ ] All three commands implemented per the §4.3 semantics
- [ ] `figma drift`'s source of observed state is explicit; if it needs a live session it is
      **not** a gate command
- [ ] The pack's suite covers flattener, comparator, theme resolution and `$themeOverrides`
- [ ] `figma verify` compares the full normalized mapping against reviewed baseline data, never
      against the current artifact, and reads a **local** artifact path — not the config's
      serving origin
- [ ] Any real-artifact constraint the old `$themeOverrides` assertion protected (per T9) is
      explicitly enforced here. A package fixture does not inherit it, and normalization can
      conceal structural properties

**Verification:**

- [ ] `pnpm check` passes
- [ ] `figma verify` against Collider's real artifact matches the T1 baseline (**S3**)
- [ ] Negative cases: missing input, malformed JSON, mismatched expectations each produce a
      rail-specific diagnostic and a non-zero exit

**Dependencies:** T8, T9, T10
**Files likely touched:** `src/cli/`, `src/verify/`, tests
**Scope:** M

---

### T14: Production installers, self-contained builder, expanded `pack-check`

**Description:** `pack-check.sh` runs `pnpm add "$tarball" esbuild` — it installs the optional
peer itself, so it proves the plugin builds when a consumer already has esbuild and never that a
plain install can. npm does not auto-install optional peers.

**Acceptance criteria:**

- [ ] Either invariant plugin code is prebuilt at release with only config-dependent assembly at
      command time, or the builder dependency is part of the package's own install
- [ ] The builder is never resolved from Collider
- [ ] Platform-specific binaries are handled for the platforms actually supported
- [ ] `pack-check` no longer installs the builder itself
- [ ] **The production bash and PowerShell installers are implemented and tested here**, not left
      to exist by T15. Archive layout, platform selection, integrity enforcement against the
      reviewed record, and the lifecycle behaviours T5 specified
- [ ] Installation is exercised **through the production installer against a frozen
      release-candidate asset set**, from a controlled source. T15 then publishes those exact
      tested bytes without rebuilding
- [ ] Release acceptance exercises the **real archive layout and installed prefix** — not
      `node_modules/.bin`, and not the `files` field, which are development checks only
- [ ] Negative integrity test: a modified asset **with a matching modified `SHA256SUMS`** is
      rejected against the reviewed record. Corrupting only the archive proves less

**Verification:**

- [ ] `pack-check`'s decisive scenario passes: a clean, data-only consumer outside both
      checkouts — no product dependencies, no credentials, **no ambient builder** — installs the
      release and exercises every command with valid and invalid inputs
- [ ] A second, differently configured consumer passes: different namespace, paths, origin,
      plugin identity and profile vocabulary
- [ ] The pack has a lint gate and the LOC guard

**Dependencies:** T10, **T11, T12**, T13 — every command and asset must exist before the
packaging gate can claim to exercise them
**Files likely touched:** `plugin/build.mjs`, `scripts/pack-check.sh`, `package.json`, CI
**Scope:** M

---

> ### ✅ Checkpoint: The package is complete
>
> - [ ] Every §4.2 command implemented with §4.3 semantics specified
> - [ ] `pack-check` decisive scenario green, plus the second consumer
> - [ ] Pack suite covers `$themeOverrides`; lint gate and LOC guard in place
> - [ ] **Collider untouched by this phase and still green**

---

## Phase 3 — Distribution and consumer cutover

### T15: Cut the release — **ask first**

**Description:** The earlier clean scan covered the rail repo as it was on 2026-09-05. It does
not establish that the **final** package is clean after ~160 files moved in.

**Acceptance criteria:**

- [ ] The final tarball is reviewed for disclosure and redistribution suitability
- [ ] The exact artifact that passed T14 is the one released; its tag and digest are recorded
- [ ] `SHA256SUMS` is published alongside every asset, with per-platform assets where the
      bundled builder requires them
- [ ] The installer scripts are committed at the release tag, so the pinned
      `raw.githubusercontent.com/<org>/<repo>/<tag>/…` URL resolves
- [ ] Rollback is defined as **explicit version selection** — never `latest`, never restoring
      the retired mode. On a first release there is no compatible earlier version, so rollback is
      not yet a demonstrated recovery procedure; say so rather than implying one exists
- [ ] User approval obtained before publishing

**Verification:**

- [ ] The published version matches the tested digest
- [ ] A `curl | bash` from the pinned tag succeeds on a clean machine

**Dependencies:** the Phase 2 checkpoint, and the exact artifact that passed T14 · **ask first**
**Files likely touched:** pack `package.json`, release config
**Scope:** S

---

### T16: Prove anonymous cold acquisition and provision every environment

**Description:** This is the release proof T5's mechanism proof could not give: a dummy package
or a workflow-supplied tarball proves installation mechanics, not that the approved artifact is
anonymously retrievable.

**Acceptance criteria:**

- [ ] Cold acquisition with **no credentials configured** succeeds from a clean checkout, via
      the pinned installer URL, with `SHA256SUMS` verified — and a corrupted asset **fails**
- [ ] All 8 CI jobs provision the CLI via a shared setup step rather than eight copies
- [ ] **The reviewed toolchain record is created here** — the JSON naming package, exact release
      and integrity that T5 specified — along with the provisioning/execution behaviour that
      reads it
- [ ] Each of the 8 jobs is mapped to its actual gate command, and the required job that will
      execute the replacement rail verification is **named** (see `SPEC.md` §5.4)
- [ ] The approved release's skill assets are staged **without being activated**
- [ ] Local provisioning documented; pre-push acquires nothing
- [ ] Cache keys distinguish release, toolchain version and platform; a miss installs the same
      release

**Verification:**

- [ ] **Provisioning probes** succeed cold and warm and are measured. Not full product
      workflows — the private `git+ssh` dependency is still in the lockfile until T17, so
      ordinary CI cannot be green yet. Clean product install belongs to T17/T18
- [ ] `ds-skills --version` reports the approved release in every environment
- [ ] Negative cases all fail or use the intended release, never acquiring at execution time and
      never falling back: wrong selected release, missing install, an unrelated global binary on
      `PATH`, integrity mismatch during acquisition or cache acceptance

**Dependencies:** T15
**Files likely touched:** `.github/workflows/ci.yml`, setup action, docs
**Scope:** M

---

### T17: Activate Collider's callers and delete what they supersede

**Description:** One atomic commit. Invocation changes, deletions, skill activation and the
lockfile change land together, because the intermediate states are not independently green.

**Rehearse before accepting.** After T9 this task needs a concrete file/caller/asset checklist
and re-sizing — the validators, generator integration, policy-test retirement and skill
materialization can expand it well beyond the file estimate below. Rehearse the patch in an
isolated consumer worktree after provisioning: clean dependency install, offline execution, real
agent skill discovery, and negative gate propagation. The danger is not the L label; it is
discovering missing command semantics inside the cutover.

**Acceptance criteria:**

- [ ] `figma/token-rail.expectations.json` created
- [ ] `ds-skills figma verify` wired into `just preflight` **and into the required CI job named
      at T16**. No CI job runs preflight — it is the pre-push hook — and
      `figma-token-rail.test.ts` runs today inside `just test-all`, which is a CI job. Wiring
      only preflight would delete a CI gate while every job stayed green
- [ ] **The required job's artifact path is established**: which step produces the artifact it
      verifies, in what order, and that it belongs to the commit under test — not another job's
      filesystem, a stale committed copy, or a cache. A conditionally skipped job reports
      success, so "required" in the plan is not evidence the verifier ran
- [ ] The provisioned CLI and skill assets are selected without ambient fallback: an unrelated
      binary on `PATH` is **not executed at all**, not even to read its version
- [ ] `just figma-plugin-build` calls the CLI; `scripts/build-figma-plugin.mjs` deleted
- [ ] Every `package-owned` / `command-only` entry from T9 switched
- [ ] `src/lib/tokens/figma-token-rail.test.ts` deleted; the self-referential drift case not
      carried over anywhere
- [ ] `@atomize-hq/figma-token-rail` gone from `package.json`; lockfile regenerated
- [ ] **Skill cutover**, which T9's executable inventory does not cover: activate the approved
      release's assets, remove or replace superseded consumer copies, update the canonical
      editing rule, retarget `.claude/skills` discovery, and detect a stale asset or a
      skill/CLI release mismatch
- [ ] Agent-visible skills — not just the copies inside the tarball — belong to the selected
      release and carry no references to removed scripts

**Verification:**

- [ ] **S2** — perturb the artifact **in an isolated worktree** (preflight step 1 runs
      `build:tokens` and would regenerate it in place), confirm preflight fails **for the
      intended invariant**, restore, confirm green
- [ ] **S4** — manifest byte-identical to the T1 baseline, independently generated
- [ ] **S1** — grep both package names across `src/`, `scripts/`, `.agents/`, `justfile`,
      `package.json`, `.github/`; T9 inventory fully resolved
- [ ] `rm -rf node_modules && pnpm install --frozen-lockfile && just preflight` passes
- [ ] Clear `node_modules/.cache/storybook` before blaming any failure on this change

**Dependencies:** T16
**Files likely touched:** 2 deleted, 1 new JSON, `justfile`, `package.json`, `pnpm-lock.yaml`,
plus T9's switched callers
**Scope:** L — atomic by necessity

---

> ### ✅ Checkpoint: The boundary holds
>
> - [ ] **S1**, **S2**, **S3**, **S4** hold
> - [ ] `just preflight` green from a clean install

---

## Phase 4 — Clean-environment evidence and closure

### T18: Full CI acceptance, residual audit, backlog closure

**Acceptance criteria:**

- [ ] All 8 jobs cold-acquire the CLI and run their gate
- [ ] No residual rail implementation anywhere in Collider, including generator adapters and
      the T1 capture script
- [ ] The retired-string scan extracts the tarball first, and classifies permitted command or
      data references rather than treating every package-name match as a defect
- [ ] Where executable coverage left `.agents`, the package-side S7 enforcement test is named and
      proven — deliberate faults in the moved code fail their gates
- [ ] BL-3 and BL-4 marked closed in `docs/backlog.md`
- [ ] `SPEC.md` updated wherever a decision changed during implementation

**Verification:**

- [ ] A PR run goes green end to end, **and** a deliberate semantic token regression turns the
      named required job red (**S8**). A clean run alone proves acquisition, not enforcement
- [ ] **S6** — `pnpm check` against a clean independently installed release, not a sibling
      checkout, link, or ambient binary
- [ ] All eight criteria hold

**Dependencies:** T17
**Files likely touched:** `.github/workflows/ci.yml`, `docs/backlog.md`, `SPEC.md`
**Scope:** M

---

> ### ✅ Checkpoint: Complete
>
> - [ ] **S1**–**S8** all hold
> - [ ] BL-3 and BL-4 closed; **BL-2 unblocked** — open it as its own PR, never in this diff

---

## Not in this work

- **BL-1** (`figmaComponentRef` dual-format) — same pattern, zero shared code, different surface
- **BL-2** (Chromatic) — unblocked by T18, but accepting 205 visual baselines must not share a
  diff with a tooling migration
