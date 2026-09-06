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

- [x] Deleted: `scripts/figma-variables-sync-enterprise.mjs`,
      `scripts/lib/figma-variables-sync-enterprise.mjs`
- [x] `figma:sync:variables:enterprise` gone from `package.json`;
      `figma-sync-variables-enterprise` gone from the `justfile`
- [x] Enum **and error message** updated in `scripts/lib/sync-ledger.mjs:31,233` and
      `scripts/lib/publish-proof.mjs:12,57`
- [x] Both fixtures repointed to `plugin-import-manual` **in the same change**
- [x] Schema and profile enums updated: `.agents/skills/schemas/sync-ledger.schema.json:34`,
      `.agents/skills/profiles/collider.json:9`
- [x] `src/figma/parity-policy.md:10,29` states the mode is **retired**, not deferred —
      line 29 is a written commitment, so rewrite it rather than dropping the sentence
- [x] `src/figma/README.md:16` and `src/figma/publish-proof-contract.md:14` updated

**Verification:**

- [x] `pnpm vitest run src/lib/tokens/figma-sync-policy.test.ts` passes
- [x] The contradictory-carrier fixture still fails **naming the carrier contradiction**, not an
      invalid mode — read the message, do not accept a red result
- [x] `just preflight` passes
- [x] **S5**: `grep -rn "rest-variables-oauth"` over tracked sources and generated output returns
      nothing, excluding `archive/`, `SPEC.md`, `tasks/` and `docs/consultations/`

**Reconciliation against T1's frozen baseline** — the reason the capture had to come first:

```
### invalid-contradictory-mode.sync-ledger.json
  mode  : rest-variables-oauth -> plugin-import-manual
  errors: UNCHANGED -> ["[CT-8B_FORBIDDEN_PARITY_DEFERRED_REASON] …"]

### valid-required.sync-ledger.json
  mode  : rest-variables-oauth -> plugin-import-manual
  errors: UNCHANGED -> []
  state : UNCHANGED -> verified-current

fixtures changed: 2 of 11
```

Exactly two fixtures moved, each in exactly one field, and `invalid-contradictory-mode` still
fails on the **carrier/parity** contradiction rather than an invalid mode. That is the
regression this task's verification was watching for, and it is now measured rather than
eyeballed. The baseline file keeps the retired mode's name on purpose — it is the
pre-retirement reference T9 reconciles against, so **S5 exempts it** and
`pnpm baseline:rail` refuses to overwrite it.

**Not in the criteria, found while doing it:**

- `docs/figma-ref-drift-detection.md` cited the deleted file twice as a pattern to copy — the
  token-skip behaviour and the dependency-injection shape. Both rewritten to stand alone;
  the DI reference now points at `sync-ledger.mjs:171` / `figma-parity.mjs:79`, which carry
  the same pattern and are not going anywhere.
- `parity-policy.md:10` records real history (`b72315a` relaxed the trigger) and had to keep
  saying so while losing the literal string. It now names the rail descriptively.
- `pnpm check` (knip) was **already red at `HEAD`** before this task — verified by stashing.
  `@figma/plugin-typings` is an orphan the extraction left behind. Not T3's doing; fixed
  separately so this diff stays about the retirement.

**Dependencies:** **T1** — the fixture capture must complete before this task edits those fixtures or their validators
**Files likely touched:** 2 deleted, 2 validators, 2 fixtures, 3 docs, 1 schema, 1 profile,
`package.json`, `justfile`
**Scope:** L — atomic by necessity, not by choice. **Done**: 2 files deleted, 2 validators, 2 fixtures, 1 schema, 1 profile, 4 docs, `package.json`, `justfile`.

---

### T4: Remove `syncVariablesViaRest` from the pack

**Description:** Delete the REST rail and its 19 tests. The `smoke` script asserts that export
exists, so it must be repointed or the gate fails on a correct build.

**Acceptance criteria:**

- [x] `src/rails/rest-variables.ts` and `rest-variables.test.ts` deleted
- [x] The export is gone from `src/index.ts`
- [x] `smoke` checks a surviving export — **and so does `pack-check.sh:24`**, which the
      criteria missed. It asserted the same deleted export and went red on a correct build.
      Found by running the gate rather than by reading the task. Both now check
      `flattenTokenDocument` and `buildExpectedVariables`: the same surface, verified once
      against `dist/` and once against a tarball installed into a throwaway consumer.

**Verification:**

- [x] `pnpm check` passes end to end — format, typecheck, tests, build, smoke, pack-check
- [x] Test count 44 → 25, i.e. 19 removed (13 `it()` declarations, expanded by `it.each`).
      Measured by running the suite at `HEAD~1` in a throwaway worktree, not inferred.

**Dependencies:** None (different repo from T3)
**Files likely touched:** 2 deleted, `src/index.ts`, `package.json`, plus `scripts/pack-check.sh`
and `README.md` — the README presented the two rails as a choice, so it is rewritten to say
there is one, keeping the comparison table marked _removed_: the reasoning is exactly why
nobody should reintroduce it as-is.
**Scope:** S — **done**, `a134533` in `atomize-hq/figma-token-rail`

---

### T5: Decide the delivery contract

**Description:** A decision task with no code. The first draft deferred this into the middle of
the migration; it is settled here instead, because everything from Phase 3 onward depends on it.
The principle: **provisioning and execution are separate operations.**

**Acceptance criteria — each written down, not assumed:**

- [x] **Distribution is a GitHub Releases installer script**, following
      `atomize-hq/substrate/scripts/substrate/install.sh` and its `install-substrate.ps1` twin.
      Confirm the consequence explicitly: **the repository must be public**, because
      `raw.githubusercontent.com` and `releases/download` both 404 for a private repo without a
      token. This is more exposure than the npm route would have needed — **ask before
      proceeding**
- [x] Two deliberate divergences from the reference implementation, both recorded: a missing or
      mismatched `SHA256SUMS` **fails** rather than warning and skipping, and an unresolvable
      tag **fails** rather than falling back to `main`
- [x] Release-identity **format and version-selection rules**, and where Collider records them.
      Three distinct things: deciding the rules (here), assigning the version to be built (before
      T14's decisive pack test), and recording the finished tarball's integrity (T15/T16). T5
      cannot certify bytes that do not exist. Do not change package metadata after T14 and treat
      the rebuilt package as the already-tested artifact
- [x] The materialization contract's release-selection obligations, so T11 cannot choose an
      incompatible activation scheme
- [x] Install location and prefix: job-local in CI, persistent and version-specific locally
- [x] Executable discovery, including the Unix/Windows path difference — the bash and
      PowerShell installers are a matched pair, not an afterthought
- [x] **How the bootstrap learns its version.** `curl … | bash` supplies no argv and no
      `BASH_SOURCE`; the reference implementation parses `--version=` and otherwise resolves
      `latest`. Choose an explicit argument contract or a release-specific bootstrap carrying its
      own identity. **Prove it with two different selected versions, from outside any repository,
      in a non-interactive shell**, establishing what version reaches the asset URL — not merely
      that the first request returns 200
- [x] **The reviewed record binds more than one digest**: repository, release, source commit,
      per-platform asset identity and expected integrity. Populated from the T14-tested bytes,
      never from whatever `SHA256SUMS` accompanies a later download
- [x] **Supported OS / architecture / runtime combinations named.** "Linux/macOS/Windows" is not
      an asset-selection contract, and a bundled builder ships platform-specific binaries
- [x] **Whether the release includes a Node runtime** or requires a separately provisioned
      supported version. Either is fine; it must be explicit and never resolved from Collider
- [x] **Lifecycle contract**: install/reinstall idempotent, never leaving a partial directory
      that later reads as complete; upgrade provisions before activating and fails closed on
      CLI/skill skew; concurrent versions coexist and no global "current" pointer overrides
      project selection; uninstall removes only the selected install and leaves a project
      selecting it with an actionable failure, not a fallback
- [x] `pipefail` guidance for the documented one-liner — a failed `curl` into bash exits 0
- [x] **GitHub immutable releases enabled** — done 2026-09-06 on `atomize-hq/figma-token-rail`,
      verified `{"enabled": true, "enforced_by_owner": false}`. Not a `gh repo edit` flag and not
      a field on the repository object; it has its own
      `GET`/`PUT`/`DELETE /repos/{owner}/{repo}/immutable-releases` endpoints. Enabled **now**
      rather than at T15 because only releases created after enabling are immutable
- [x] Offline local behaviour: the pre-push path acquires nothing, and a missing or mismatched
      install fails with an actionable setup message
- [x] Caching is an optimization only — a cache miss installs **the same release**
- [x] An early mechanism proof is planned that needs no published artifact (dummy package or
      workflow-supplied tarball); the release proof belongs to T16. **Planned, not run** — see
      the verification note below.

**Verification:**

- [ ] The mechanism proof runs green in a throwaway workflow: isolated install, package
      independence, executable discovery, platform behaviour — **blocked on T14**, which owns
      the installers. There is nothing to run a mechanism proof against until one exists;
      writing a workflow that exercises an installer nobody has written would be theatre.
      Moved into T14's criteria so it cannot be lost, and T14 already owns the frozen-candidate
      installation test this would duplicate.
- [x] The decision is recorded in `SPEC.md` §10 — a new section; what was §10 is now §11.
      §10 also corrects the "version pinning is in the URL" bullet that survived round 3's fix
      in the same list that stated the opposite two paragraphs earlier.

**The measurement that decided it.** The reference bootstrap fetched anonymously at `v0.2.6`
and at `v0.2.8` is **byte-identical** — 4458 bytes, same SHA-256 — and neither contains its own
tag. `latest` resolves to `v0.2.8` today, so `curl …/v0.2.6/install.sh | bash` installs
**v0.2.8 right now**, not after some future drift. That killed "document the `--version=` flag"
as an answer: a copied one-liner cannot carry a pin the script can read. The contract instead
makes the bootstrap a **release asset** with its identity baked in, and drops `--version`
entirely — the asset _is_ the version, so there is nothing to disagree with.

Anonymous token-free `releases/download` was confirmed at 200 on the same repository, so the
public-repo delivery path is measured rather than assumed.

**Owner action, now done:** GitHub immutable releases enabled on the repository 2026-09-06.
`gh` reaches it through dedicated endpoints rather than `gh repo edit` or the repository object.

**Dependencies:** None
**Files likely touched:** `SPEC.md`, a throwaway workflow
**Scope:** M — **decision done** (`SPEC.md` §10, 8 subsections); mechanism proof deferred to T14

---

### T6: Fix the plugin UI's hardcoded values and placeholder substitution

**Description:** `plugin/ui.html` carries `localhost:4173` at lines 120 and 159 and
`design-tokens/src/tokens/` at line 141 — a Collider filesystem path, in a package whose stated
contract is that nothing in it knows the name of the repo using it.

**Correcting this task's own premise:** it claimed `build.mjs:70`'s `__RAIL_ARTIFACT_ORIGIN__`
substitution was a silent no-op. It is not. That chain runs against
`manifest.template.json`, which _does_ contain the placeholder at line 10, and it produced the
`devAllowedDomains` entry in the T1 baseline. The defect is narrower and more ordinary: a
working substitution sat next to three hardcoded values, and nothing connected them.

**Acceptance criteria:**

- [x] Placeholders exist in `ui.html` for the artifact origin and the token-source path, and
      both are substituted at build time
- [x] No `localhost:4173` or Collider path remains in the pack's sources — **no Collider path
      anywhere**, verified inside the packed tarball. Four `localhost:4173` remain and are
      deliberate: they are all the same neutral default `artifactUrl`, in `src/config.ts`, its
      build output, the example config and the README documenting it. A config default has to
      be something; what the criterion was about was values baked into `ui.html` where no
      config could reach them, and those are gone. (Whether `artifactUrl` should have a default
      at all, rather than being required, is a separate question — a consumer omitting it
      currently gets localhost silently.)
- [x] Missing placeholder, and unresolved placeholder, each fail loudly — one `substitute()`
      helper replaces both ad-hoc `replaceAll` chains and refuses either kind of drift. A
      placeholder the template no longer carries means a configured value has silently stopped
      reaching the plugin; that used to be undetectable, which is how a hardcoded hostname
      survived beside a working substitution.
- [x] Quotes and backslashes in configured values are escaped safely, **per context**: HTML
      text is HTML-escaped, and the drift-report URL lands inside a `<script>`, so it is
      JSON-encoded with `<`/`>` as `\u003c`/`\u003e`. HTML-escaping that one would have
      corrupted the value; JSON-encoding the text ones would have printed quotes.

**Verification:**

- [x] `grep -n "localhost:4173\|design-tokens/src" plugin/ui.html` returns nothing
- [x] Build with Collider's config: output contains `localhost:4173`
- [x] Build a **second, distinctly configured** plugin and confirm the first configuration is
      not still embedded anywhere in the output. The example config shares Collider's origin,
      so it proves nothing about the origin — a **third** config was built with a different
      scheme, host, port and token path, plus hostile values (`Acme <Token> "Sync"`, a path
      containing quotes and a backslash). Nothing crosses between the three, and every value
      escapes correctly in `<title>`, `<h1>`, `<code>` and the script.
- [x] Manifest still matches the T1 baseline (**S4**) — built from Collider's config with the
      **new** builder: byte-identical, 373 bytes, sha256 `df45a8de…` on both sides

**Dependencies:** T1 (baseline must exist first)
**Files likely touched:** `plugin/ui.html`, `plugin/build.mjs`, config schema
**Scope:** M — **done**, `1f529ed` in `atomize-hq/figma-token-rail`, plus `tokenSourcePath`
added to Collider's `figma/token-sync.config.json` (an ignored extra key until the dependency
is bumped at T17, so Collider stays green either way).

**Handed to T14:** `substitute()`'s two invariants are proven by hand, not by a test —
`plugin/build.mjs` is a script with no exported surface, and copying `plugin/` to a temp
directory breaks its `../src/config.ts` resolution. T14 rewrites the builder into the CLI,
which is when it acquires a testable shape; lock the invariants down there rather than leaving
a proof that decays.

---

> ### ✅ Checkpoint: Foundation
>
> - [x] `just preflight` green; `pnpm check` green
> - [x] **S5** and **S7** hold — S7 by enforcement, not file count
> - [x] T1 baselines stored and digested
> - [x] Delivery contract written down
> - [x] **Review with human before T7** — it renames a repo

---

## Phase 2 — A complete, self-contained package

### T7: Rename the repo and settle package identity

**Description:** Administration only, separated from CLI design. GitHub redirects Git operations
after a rename, but hosted action references do not receive that redirect.

**Acceptance criteria:**

- [x] Repo renamed to **`atomize-hq/ds-skills`**; package renamed to `@atomize-hq/ds-skills`.
      Both names were confirmed free in the org before the decision. The repo name is the
      public identity now that §10 delivers by release asset rather than registry, so it is
      the one that has to read well in an install URL — not the package name
- [x] Metadata, links and release configuration updated — `repository`, `homepage` and `bugs`
      added; the package had none, and a released artifact should. The default config filename
      (`ds-skills.config.json`) and the example config file were renamed too, because the old
      name appears in a user-facing error message
- [x] Affected references inspected rather than assumed — action references especially. CI has
      none that could miss a redirect: only `actions/*` and `pnpm/action-setup`

**Verification:**

- [x] The pack's own CI passes post-rename
- [x] **Collider's existing dependency still resolves** — measured three ways, not asserted:
      `git ls-remote` on the exact `git+ssh` URL in `package.json` returns `b00a82d8…` for
      `v0.3.0`, the object the lockfile pins; the `https` form pnpm records does the same; and a
      throwaway `pnpm add` of that old URL installs the package with a built `dist/`, so the
      redirect covers fetch and not merely ref listing. Nothing breaks at the tag because
      `v0.3.0` predates the rename commit — the package name there is still the old one, which
      is exactly what the lockfile expects. Collider's `just preflight` is green.

**Two things the verification turned up:**

- The lockfile's `commit: b00a82d8…` **is not a commit**. It is the annotated **tag object**;
  the commit is `189db11`. pnpm labels it `commit:` regardless. Harmless, and mildly good: a
  recreated tag would produce a different sha and be rejected rather than silently accepted.
- The git dependency's installability is **pnpm-version-dependent**. At Collider's pinned
  `10.11.1` (and CI's `PNPM_VERSION: '10.11.1'`) the `prepare` build runs and `dist/` is
  produced. A newer pnpm blocks lifecycle scripts for git dependencies unless the package is in
  `onlyBuiltDependencies`, and Collider has no `pnpm-workspace.yaml`, no `.npmrc` and no `pnpm`
  field — so the install **fails**, loudly rather than silently. `dist/` is gitignored in the
  pack, so there is no fallback. T17 removes the dependency and the problem with it; until then,
  bumping pnpm breaks the install.

**Dependencies:** Foundation checkpoint · **ask first**
**Files likely touched:** `package.json`, README, CI config
**Scope:** S — **done**, `190dba4` in `atomize-hq/ds-skills`

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
- [ ] **T5's mechanism proof**, inherited because it had nothing to run against: a throwaway
      workflow needing no published artifact, covering isolated install, package independence,
      executable discovery and platform behaviour across the OS/arch matrix named in §10.5.
      It runs on the frozen candidate assets this task already produces
- [ ] The bootstrap **hard-fails when its baked release identity is empty** — a bootstrap that
      does not know what it is must not fall back to resolving one (§10.1)
- [ ] There is **no `--version` flag**: the asset is the version. A flag would reintroduce the
      disagreement §10.1 exists to remove

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
- [ ] The installer scripts are published as **release assets**, per §10.1 — not merely
      committed at the tag. A `raw.githubusercontent.com/<org>/<repo>/<tag>/…` bootstrap cannot
      know its own version, which is the defect §10.1 exists to remove; the measurement is in
      T5. `SHA256SUMS` covers the bootstrap too, and its digest goes into the reviewed record
- [ ] Rollback is defined as **explicit version selection** — never `latest`, never restoring
      the retired mode. On a first release there is no compatible earlier version, so rollback is
      not yet a demonstrated recovery procedure; say so rather than implying one exists
- [ ] User approval obtained before publishing

**Verification:**

- [ ] The published version matches the tested digest
- [ ] On a clean machine: download the bootstrap **asset** for the pinned release, verify it
      against the reviewed record, execute it, and confirm the installed version is the pinned
      one — not merely that the first request returned 200. The `curl … | bash` one-liner is
      exercised separately, as the documented human path, with `set -o pipefail`
- [ ] The release is immutable, confirmed on the published release object rather than assumed
      from the repository setting

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
