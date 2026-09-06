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

- [ ] Exact bytes and digest of `figma/plugins/collider-token-sync/manifest.json`, produced by
      the **current** builder, stored outside the build output
- [ ] The **full normalized rail mapping** captured: ordered variable names, resolved types,
      collection and namespace, per-theme values — not the five summary fields
- [ ] Any nondeterministic field is explicitly identified and excluded from comparison

**Verification:**

- [ ] Re-run capture twice; the two artifacts are identical
- [ ] The stored baseline is committed or otherwise recoverable, not left in a temp directory

**Dependencies:** None — must be first
**Files likely touched:** a baseline artifact, a small capture script
**Scope:** S

---

### T2: Wire `.agents` into ESLint, vitest and tsc, and prove enforcement

**Description:** 162 tracked files under `.agents/` are invisible to every gate. Discovery is
not enforcement — `tsc --listFilesOnly` prints participating files and stops, and JS error
checking additionally depends on `checkJs`.

**Acceptance criteria:**

- [ ] `eslint.config.mjs` no longer blanket-ignores `.agents/**`; any remaining exclusion is
      narrow and carries a reason
- [ ] vitest resolves test files under `.agents/`
- [ ] tsc participates in those files under an appropriate config — Node tooling and the Next
      app may need separate compiler configurations; keep them separate
- [ ] A representative lint error, type error and failing test under `.agents/` **each fail
      their gate** (introduce temporarily, confirm the failure, revert)
- [ ] Every surfaced violation fixed, or excluded with a recorded reason

**Verification:**

- [ ] `just check` and `just preflight` pass
- [ ] The three deliberate failures each failed, and preflight went green after reverting (**S7**)

**Dependencies:** None
**Files likely touched:** `eslint.config.mjs`, `vitest.config.ts`, `tsconfig*.json`, plus fixes
**Scope:** M — unknown tail on the violation count

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

**Dependencies:** None
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

- [ ] Registry and access model. Note that publishing the package does **not** require making
      the source repository public
- [ ] Exact release identity, and where Collider records it (reviewed JSON naming package,
      version and integrity — a toolchain dependency, not an application one)
- [ ] Install location and prefix: job-local in CI, persistent and version-specific locally
- [ ] Executable discovery, including the Unix/Windows path difference
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
- [ ] Collider's existing dependency still resolves, or the breakage is understood and accepted

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

**Dependencies:** T7
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
- [ ] The 11 ledger fixtures have their expected post-retirement outcomes **and diagnostic
      reasons** frozen

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

**Dependencies:** T8
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
- [ ] `validate-artifact.mjs` moves behind `ds-skills validate` unchanged
- [ ] The materialization decision is recorded; there are never two independently editable copies
- [ ] CLI and materialized skills report the same release identity

**Verification:**

- [ ] `pack-check` confirms all four directories survive packing
- [ ] Every real Collider artifact validates against its schema, with and without the profile
- [ ] The old v1 templates are still correctly rejected
- [ ] Collider is unchanged by this task and still green

**Dependencies:** T8
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

- [ ] Every `package-owned` entry from T9 is implemented
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
- [ ] `figma verify` compares the full normalized mapping, not five fields

**Verification:**

- [ ] `pnpm check` passes
- [ ] `figma verify` against Collider's real artifact matches the T1 baseline (**S3**)
- [ ] Negative cases: missing input, malformed JSON, mismatched expectations each produce a
      rail-specific diagnostic and a non-zero exit

**Dependencies:** T8, T9, T10
**Files likely touched:** `src/cli/`, `src/verify/`, tests
**Scope:** M

---

### T14: Make the plugin builder self-contained and expand `pack-check`

**Description:** `pack-check.sh` runs `pnpm add "$tarball" esbuild` — it installs the optional
peer itself, so it proves the plugin builds when a consumer already has esbuild and never that a
plain install can. npm does not auto-install optional peers.

**Acceptance criteria:**

- [ ] Either invariant plugin code is prebuilt at release with only config-dependent assembly at
      command time, or the builder dependency is part of the package's own install
- [ ] The builder is never resolved from Collider
- [ ] Platform-specific binaries are handled for the platforms actually supported
- [ ] `pack-check` no longer installs the builder itself

**Verification:**

- [ ] `pack-check`'s decisive scenario passes: a clean, data-only consumer outside both
      checkouts — no product dependencies, no credentials, **no ambient builder** — installs the
      release and exercises every command with valid and invalid inputs
- [ ] A second, differently configured consumer passes: different namespace, paths, origin,
      plugin identity and profile vocabulary
- [ ] The pack has a lint gate and the LOC guard

**Dependencies:** T10, T13
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

### T15: Publish the tested artifact — **ask first**

**Description:** The earlier clean scan covered the rail repo as it was on 2026-09-05. It does
not establish that the **final** package is clean after ~160 files moved in.

**Acceptance criteria:**

- [ ] The final tarball is reviewed for disclosure and redistribution suitability
- [ ] The exact artifact that passed T14 is the one published; its identity is recorded
- [ ] Rollback is defined as **explicit version selection** — never `latest`, never restoring
      the retired mode
- [ ] User approval obtained before publishing

**Verification:**

- [ ] The published version matches the tested digest
- [ ] Scoped publication has the intended access setting

**Dependencies:** T14 · **ask first**
**Files likely touched:** pack `package.json`, release config
**Scope:** S

---

### T16: Prove anonymous cold acquisition and provision every environment

**Description:** This is the release proof T5's mechanism proof could not give: a dummy package
or a workflow-supplied tarball proves installation mechanics, not that the approved artifact is
anonymously retrievable.

**Acceptance criteria:**

- [ ] Cold acquisition with **no credentials configured** succeeds from a clean checkout
- [ ] All 8 CI jobs provision the CLI; a shared setup step rather than eight copies
- [ ] Local provisioning documented; pre-push acquires nothing
- [ ] Cache keys distinguish release, toolchain version and platform; a miss installs the same
      release

**Verification:**

- [ ] Cold and warm CI runs both succeed and are measured
- [ ] `ds-skills --version` reports the approved release in every environment

**Dependencies:** T15
**Files likely touched:** `.github/workflows/ci.yml`, setup action, docs
**Scope:** M

---

### T17: Activate Collider's callers and delete what they supersede

**Description:** One atomic commit. Invocation changes, deletions and the lockfile change land
together, because the intermediate states are not independently green.

**Acceptance criteria:**

- [ ] `figma/token-rail.expectations.json` created
- [ ] `ds-skills figma verify` wired into `just preflight`
- [ ] `just figma-plugin-build` calls the CLI; `scripts/build-figma-plugin.mjs` deleted
- [ ] Every `package-owned` / `command-only` entry from T9 switched
- [ ] `src/lib/tokens/figma-token-rail.test.ts` deleted; the self-referential drift case not
      carried over anywhere
- [ ] `@atomize-hq/figma-token-rail` gone from `package.json`; lockfile regenerated

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
- [ ] No residual rail implementation anywhere in Collider
- [ ] BL-3 and BL-4 marked closed in `docs/backlog.md`
- [ ] `SPEC.md` updated wherever a decision changed during implementation

**Verification:**

- [ ] A PR run goes green end to end (**S8**)
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
