# TODO: Design-system tooling as an installable CLI

**Spec:** [`SPEC.md`](../SPEC.md) · **Plan:** [`plan.md`](plan.md)
Success criteria **S1**–**S8** are in `SPEC.md`. Task IDs match the plan's dependency graph.
Revised after the 2026-09-06 approach reviews; see plan.md "What changed from the first draft".

**Round 4 (2026-09-06, first review with implementation evidence) — verdict ADJUST.** Keep the
architecture; restructure the remaining task contracts before proceeding past T8. T1–T7 and T9
are unchanged and stay done. T8 becomes the boundary contract, T16 splits into **T16a** (Phase 2,
alongside T8) and **T16b** (Phase 3), and T10–T18 each acquire obligations. The revised critical
path is **T8 + T16a → T10/T11 → T12/T13 → T14 → T15 → T16b → T17 → T18**.

Completion is four separate claims — implemented, regression-tested, installed-artifact-tested,
consumer-enforcement-demonstrated (`SPEC.md` §7.5). A `[x]` here without the qualifier in the
task's own notes means the first one only.

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

### T8: Fix the complete boundary contract

**Description:** Restructured after the round-4 review. This was "parsing, help, version, dispatch
and failure behaviour" — a scaffold task. It is now the **highest-leverage task in the plan**,
because everything downstream is immutable once T15 publishes: a release cut without a command,
without a stable machine interface, or without the proof–ledger relationship specified cannot be
amended, only replaced.

The framing that changed: the remaining work is organised around **complete caller behaviour,
record relationships and installed-artifact execution** — not around moving modules and
implementing command names. Three of T9's discoveries are the evidence. A consumer that imports
no rail module still duplicated rail semantics; a validator with no caller still carried a
five-fact duplication nothing compared; two portable validators still hardcoded one consumer.

**No implementation task starts until this lands.** Not because the criteria are heavy, but
because T10–T14 each need to know what they own.

**Acceptance criteria:**

_The command surface_

- [x] `bin/ds-skills` dispatches all **nine** commands in `SPEC.md` §4.2 — the four T9 found
      missing (`ledger parity`, `proof validate`, `figma serve`, `figma baseline`) are in §4.2
      now rather than discovered at T13
- [x] `ledger parity` is **independently invocable**, not a side effect of `ledger validate`.
      `pnpm validate:figma-parity` is its own governance step with its own policy module;
      folding it in would retire a governance step under cover of a refactor
- [x] `--help` and `--version` work **outside any consumer repository**; `--version` reports the
      release identity from T5
- [x] An unimplemented command exits non-zero with an explicit unavailable-command message.
      Dispatching nine commands must not mean nine successful placeholders

_The caller-contract matrix — T9's inventory becomes a contract_

- [x] Every retained caller in the T9 inventory gets a row recording: replacement command, the
      inputs it passes, **the output it actually consumes**, its failure behaviour, side effects,
      the implementation task that owns it (T12 or T13, no overlap), and the regression test that
      will pin it
- [x] **Every disposition has a destination, and every executable destination has an owning
      task.** A `package-owned` entry with no implementing task is an unfinished migration that
      reports success
- [x] **Failure consumers are inspected, per caller**: what it does with a non-zero exit, empty
      stdout, invalid JSON, a timeout, and unavailable inputs. A correctly failing CLI still
      leaves CI green if a wrapper swallows the error or reads missing output as an empty result

_`--json` as a versioned interface (§4.3)_

- [x] A declared **result schema with its own version field**, independent of `ledgerVersion` and
      of the release version. An unsupported result version fails; it is never best-effort parsed
- [x] Diagnostic codes (`[CT-8B_…]`, `[CT-7B_…]`) are **the interface**; renaming one is a
      breaking change. Prose is not
- [x] Deterministic ordering wherever a list is emitted; **stdout carries the result and nothing
      else** — no progress text, no banner. Logs to stderr
- [x] **"Evaluated, and nonconformant" is distinguishable from "could not evaluate."** A
      completed evaluation reporting nonconformance still emits a valid, parseable result with
      its diagnostics. A missing executable, malformed output, unsupported result version, crash
      or timeout must never project as an empty rail, "not applicable", or a pass
- [x] Exit-code meanings are explicit and documented. A subprocess helper that throws on non-zero
      exit **must not discard the structured failure report** — that report is the point of the call

_The status projection_

- [x] `ledger validate --json` returns **everything `summarizeCt8b()` currently derives**,
      including the two fields it reads straight off the ledger (`promotion.parityMode`,
      `promotion.highestEarnedLevel`). Returning raw ledger JSON and letting Collider reconstruct
      conformance keeps the prohibited logic behind a different interface
- [x] Collider may invoke, parse and render. It retains **no rail evaluation and no rail-specific
      fallback policy** — including "if the field is missing, assume deferred"-shaped defaults

_The proof–ledger relationship (`SPEC.md` §5.5)_

- [x] For **each of the five duplicated facts**: its meaning, its source of truth, and the
      required relationship between the records. T12 implements this specification; it does not
      invent it
- [x] The sixth pair — `proof.carrier.used` ↔ `ledger.publish.tokensStudioCarrier`, checked
      against `mode` within each record and never across them — is **explicitly ruled in or out**
- [x] The ledger carries an **unambiguous binding** to the proof it projects: a source reference
      plus an exact binding (digest or equivalent) that cannot match a different record. "Find
      the proof file and compare what is there" is not a binding
- [x] The **version consequence is stated**: this adds a required field, so the ledger schema
      version moves and the fixtures change a second time. §5.2's rule applies — every changed
      outcome names its cause, retirement or relationship, and neither absorbs the other
- [x] **Absence is defined**: a repo making no materialization claim may lack a proof; a ledger
      claiming current materialization must not pass by omitting one; a malformed or
      contradictory proof is never ignorable
- [x] The gate's two questions are separate — do the shared claims agree **for the referenced
      publication**, and is that publication **sufficient for the ledger's present claim**. A
      valid attestation about revision A that no longer supports a claim about revision B is a
      real signal, **never repaired by rewriting the attestation**
- [x] What the gate proves is stated in the output: **validated attestation and consistency**, not
      observed remote synchronization

_Configuration ownership (`SPEC.md` §4.5)_

- [x] Portable invariants and consumer expectations are separated. Destination name, Figma file
      key, artifact path, promotion levels and exception codes get declared JSON owners,
      requiredness rules and validation behaviour
- [x] **Expected values come from the profile, never from the record being checked against them**
- [x] Comparison stays literal equality against a declared expectation. Portability is **not**
      achieved by relaxing `requireLiteral` into "any string is acceptable"
- [x] A profile **cannot** re-enable the retired publish mode or override a portable invariant

_Environment and filesystem (`SPEC.md` §4.4)_

- [x] Configuration precedence, repository-root discovery, relative-path bases, installed-resource
      lookup, declared runtime prerequisites, missing-file behaviour, unknown schema versions, and
      the explicit time input for staleness are all fixed
- [x] **Checks are read-only**; validation never rewrites a proof, ledger, baseline or generated
      artifact to pass. `figma baseline` is the one explicitly mutating command, with capture and
      verify as distinct modes
- [x] `figma serve` has a readiness, bind and shutdown contract, and the URL the built plugin
      embeds agrees with the endpoint it exposes **by construction**
- [x] Every command declares what it reads, writes, serves or launches

**Verification:**

- [x] `pack-check` invokes `ds-skills` from the installed prefix
- [x] Every command run from **outside** the repository root, from a nested directory with an
      explicit root, and from a path containing spaces, behaves per the fixed semantics
- [x] Unknown profile fails loudly rather than defaulting
- [x] A machine-consumed command's stdout parses as its declared schema on both success and
      expected-failure paths

**Written to** [`docs/ds-skills-boundary-contract.md`](../docs/ds-skills-boundary-contract.md);
the scaffold is `25f196f` in `atomize-hq/ds-skills`.

**What the failure-consumer inspection found, and it corrects two earlier claims:**

1. **Eight of the nine callers are sound.** `runTokenGovernance` returns the first non-zero exit
   immediately and `govern-tokens.mjs` propagates it, so a failing validator fails job 1 and the
   pre-push hook. They need one thing from the CLI: a stderr diagnostic and a non-zero exit.
2. **`summarizeCt8b()` collapses every failure into one shape**, and already does — before any CLI
   exists. `readJsonWithValidation` catches anything thrown; `buildErroredRail` maps all of it to
   `freshness: 'missing'` and to **`not-applicable`** when the rail is not claim-relevant, which is
   three of the five change classes. Rewritten to spawn the CLI, a missing binary would land in
   that same `catch`. T17 must give it three distinct cases, and an unavailable evaluator must
   never be `not-applicable`.
3. **That rail enforces nothing in CI, by four independent mechanisms** — no required check exists;
   job 8 is skipped on a failed `needs:`; CI's `changeClass: unknown` makes blocking mode
   unreachable; and CT-8B reaches `blockingReasons` only when `consumer === 'release'`, while CI
   passes `ci`. So **"three CI jobs enforce this surface" was wrong**: two enforce (1 and 4), one
   reports. Corrected in `SPEC.md` §5.4 and in the T9 inventory. `--json` is still required — for
   report correctness, not to preserve a gate.
4. **Fact 6 is ruled in.** `proof.carrier.used` ↔ `ledger.publish.tokensStudioCarrier`: each record
   checks its carrier against its own mode and never against the other's, and since the relationship
   forces the modes equal, an unequal carrier pair is a contradiction both records accept today.
5. **The binding costs a schema version.** `ledger.publication.{proof,sha256}` is a required field,
   so `ledgerVersion` moves 2 → 3 and all 11 fixtures change — the second reconciliation §5.2
   governs. A path alone would be a location, not an identity.

> **Hold point** — no retained T9 caller lacks an input, output and failure contract, or lacks an
> implementation owner. **Held**: nine callers, nine commands, no orphans in either direction.

**Dependencies:** T7 **and T9** — a generic parser scaffold may start earlier, but the contract
cannot be approved before the inventory says which responsibilities survive
**Files likely touched:** `bin/`, `src/cli/`, `SPEC.md` §4–§5, the T9 inventory
**Scope:** L — **done**. Specification plus a scaffold; the gate for six tasks

---

### T9: Produce the executable-path disposition inventory

**Description:** Blocking work, not an assumption. Without it every later task can complete while
Collider still owns rail logic — `scripts/lib/sync-ledger.mjs` and
`scripts/lib/publish-proof.mjs` are edited by T3 but never given a final home.

**Acceptance criteria:**

- [x] Every entry point, helper, test driver and generator carrying rail semantics is listed
      with its **present callers**
- [x] Each gets exactly one disposition: `package-owned`, `data`, `command-only`, or `deleted`
- [x] Covers at minimum `pnpm validate:sync-ledger`, publish-proof validation, the policy tests,
      and any governance generator calling those validators
- [x] Where a generator only _calls_ a rail validator, the rail-specific policy is extracted —
      the whole generator is not claimed
- [x] The 11 ledger fixtures' **approved** post-retirement outcomes and diagnostic reasons are
      frozen, reconciled against T1's pre-retirement capture. Every difference is a deliberate
      retirement change or a regression — decide which, do not adopt it silently
- [x] T3's deleted paths appear in the inventory with a resolved `deleted` disposition; they must
      not vanish from the accounting because the inventory was taken afterwards
- [x] `scripts/capture-rail-baselines.mjs`, added by T1, gets a disposition like any other
      executable path. It is a migration instrument no gate runs, but it is executable and it
      imports the rail — S1 cannot be accepted while it sits unexamined
- [x] For each surviving caller, the **replacement command and the output that caller actually
      consumes** is recorded. An exit status suffices for some; a generator consuming structured
      results needs more. Establish this from the caller, not during T17

**Verification:**

- [x] Every path in the inventory traces to a caller or is marked unreferenced
- [x] The inventory is reviewed before T12 starts

**Written to** [`docs/ds-skills-disposition-inventory.md`](../docs/ds-skills-disposition-inventory.md).

**Four things it changed about the plan, all discovered rather than assumed:**

1. **`scripts/lib/reusable-component-status.mjs` was in nobody's task.** The import graph found
   it. Its `summarizeCt8b()` — 36 of 647 lines — consumes `loadAndValidateSyncLedger`,
   `evaluateSyncLedgerConformance` and two ledger fields directly, and it feeds CI job 8. An
   exit status cannot satisfy it, so **T8 must define a `--json` output mode**. The shape is a
   serialization decision, not a new design: `evaluateSyncLedgerConformance` already returns
   `state`, `promotable` and an `evidence` map with exactly the needed keys. The other 611
   lines are Storybook/Chromatic and are **not** claimed.
2. **`pnpm validate:publish-proof` has no caller at all** — not the justfile, not
   `governanceSteps`, not any of the 8 CI jobs. So Collider's CT-7B proof record is gated only
   by one line inside a unit test. CT-7B and CT-8B are peer contracts and one of them is gated;
   that is an accident, not a policy. §3 puts three options and a recommendation, and it needs
   deciding before T12.
3. **Three commands the CLI contract does not have.** §4.2 lists `ledger validate` but no
   parity command, while `validate:figma-parity` is a separate governance step with its own
   policy module; `figma serve` and `figma baseline` are also missing. Collider cannot own zero
   rail executables without all three.
4. **Three CI jobs enforce this surface**, not one: governance, test-all, and
   reusable-component-promotion. Any replacement has to keep all three biting.

**§3 is decided (round 4): option (1), wire it — and enforce the relationship.** Wiring the
validator alone would fix reachability while leaving the real defect intact: the two records
restate five publication facts and nothing compares them. Both records are kept, with different
responsibilities — the proof attests to one publication, the ledger holds governance state
including whether that attestation supports what it currently claims. The ledger's duplicated
facts become a **checked projection of an explicitly identified proof**. `SPEC.md` §5.5 carries
the specification; T8 fixes the per-fact relationships, T12 implements them. The disposition of
`scripts/validate-publish-proof.mjs` moves from `deleted` to `command-only` as a consequence.

**Dependencies:** T3 (retirement must land first, or the inventory covers dead paths)
**Files likely touched:** a new inventory document
**Scope:** M — analysis, no code. **Done**: 216 lines, one of five dispositions
applied to every path.

---

### T16a: Select the execution contract and name the real enforcement checks

**Description:** Split out of T16 by the round-4 review and **moved to run alongside T8**.
Numbered for continuity with T16b, which stays in Phase 3. The reason it moves: platforms,
runtime prerequisites and install location decide what the release must contain, and an immutable
release cannot be amended. Discovering a missing platform asset after T15 means a new release and
a new reviewed record.

**Acceptance criteria:**

- [x] The environments that actually invoke the rail are **enumerated** — **four**, not the "CI
      and local" the plan assumed. E2 (pre-push hook, must acquire nothing) and E4 (agent/skill
      execution, whose command string lives in Markdown T11 rewrites) were both folded into
      "local" and have different requirements
- [x] Supported platforms and architectures selected against `SPEC.md` §10.5, with the runtime
      prerequisite declared as a hard minimum — **`node >= 22`**. Neither repo declares an
      `engines` field today, and E1 runs Node 25.9.0 against CI's 22
- [x] Install location and **non-interactive executable resolution** fixed: resolution is from the
      reviewed record's version at the version-specific path. An ambient `ds-skills` is not
      executed at all, not even to read its version
- [x] **The real enforcement checks are named** — workflow file, job ids, emitted check contexts
      (the `name:` values, confirmed against `/commits/main/check-runs` rather than inferred),
      triggers, and the `needs:` chain
- [x] **The skip analysis is done, not assumed** — and it found a different mechanism than
      predicted. See below
- [x] All **three** rail-using jobs accounted for: 1 `governance`, 4 `test-all`,
      8 `reusable-component-promotion`
- [x] The eight-job structure is preserved. Job 8's dependency on Chromatic is a real defect, but
      it is **BL-2's** defect; fixing it here would put a Chromatic change in a tooling diff

**Verification:**

- [x] Each named check confirmed against the **live repository configuration**, not the workflow
      file alone — which is exactly how the headline finding surfaced
- [x] For each named job, the conditions under which it **does not execute** are written down

**Written to** [`docs/ds-skills-execution-contract.md`](../docs/ds-skills-execution-contract.md).

**What it found, and it outranks the naming:**

1. **There was no required check — and now there is.** `/branches/main/protection` → 404 "Branch
   not protected"; `/rulesets` → `[]`. Every job was advisory; a red job blocked nothing, and
   earlier drafts said "the required job" as though one existed. Created with approval:
   repository ruleset **`main` (22410608)**, `active`, requiring **`Governance`** and
   **`Test All`** pinned to the GitHub Actions app, empty bypass list, verified through
   `/rules/branches/main`. Direct pushes to `main` are now rejected — PR-only, which is the
   intended cost. **Job 8 is deliberately not required**: GitHub counts a **skipped** check as
   success, so requiring it would install a check that passes without running.
2. **Job 8 is not running, and has not been.** The fork guard I expected to be the hazard is
   **unreachable** — the repo is private with `allow_forking: false`, so the fork condition is
   never true. The live mechanism is duller: job 8 `needs: chromatic-review`, job 7 **fails** on
   BL-2's unaccepted baselines, and a failed `needs:` skips the dependent job. Latest `main` run
   `31917271403`: jobs 1–6 green, 7 failure, 8 **skipped**. So the CT-8B status rail — the caller
   T9 discovered, and the entire reason T8 defines `--json` — has not been enforced in CI for as
   long as Chromatic has been red. A `skipped` conclusion is not a `failure`, so nothing surfaced
   it.
3. **The replacement gate therefore goes upstream of Chromatic**: job 1 `governance` for the
   ledger, parity and proof validators (already in `governanceSteps`), job 4 `test-all` for
   `ds-skills figma verify` (where `figma-token-rail.test.ts` runs today, so the S2 protection does
   not move between jobs during the cutover).
4. **The pack is missing more than commands**: no `bin` field and no executable, no `engines`,
   `esbuild` still an optional peer, one CI job on one platform, and `files` lists none of the four
   directories T11 moves in.

> **Hold point** — the enforcement path is identified by name and trigger condition, the
> platform/runtime/location selections are settled, and the required-check binding **exists**.
> **Held.**

**Dependencies:** none blocking; runs concurrently with T8
**Files likely touched:** `SPEC.md` §5.4, a decision record, the repository ruleset
**Scope:** S — **done**

---

### T10: Move the rail modules under `src/figma/`

**Description:** A move, but **not the move the first draft named**. Round 4: it must carry the
status-rail computation and the standalone parity policy module too, or the boundary closes
around a subset. "No behaviour change" survives as a rule for the relocated code; it is not a
description of the task's scope.

**Acceptance criteria:**

- [ ] Modules under `src/figma/`; every relative import carries a `.js` specifier;
      `moduleResolution: NodeNext` passes typecheck
- [ ] **`figma-parity.mjs` (112 lines) moves** — the standalone CT-15B promotion policy on top of
      the ledger evaluator, which the first draft's "ledger and conformance modules" did not name
- [ ] **The status-rail computation moves** — the 36 lines of `summarizeCt8b()` that evaluate,
      not the 611 lines of Storybook/Chromatic reporting around it. The carve-out boundary is
      T9 §2 and it is exact
- [ ] **One evaluator, four surfaces.** Human output, `--json`, the standalone commands and the
      status projection share the same decisions. A second evaluator written "just for JSON" is
      the defect this criterion exists to prevent
- [ ] **Relocation and intentional change stay separately reviewable.** Relocation means
      behaviour equivalent to the reconciled post-T3 reference. Intentional change means
      proof–ledger enforcement, portability corrections and newly specified boundary behaviour.
      Without the distinction a regression is explained away as "part of the move", and a
      necessary new check is hidden by rebaselining
- [ ] Tests move **with** their code, and where a moved assertion now executes is recorded. A
      lower Collider test count is not a regression if the tests are running in the package —
      but that has to be shown, not asserted

**Verification:**

- [ ] `pnpm check` passes including `smoke` (the built ESM loads under Node)
- [ ] Full normalized mapping matches the T1 baseline (**S3**)
- [ ] The package evaluates the relevant fixture inputs **without importing product code** and
      without depending on Collider's checkout layout

> **Hold point** — the package can evaluate the fixture inputs standing alone.

**Dependencies:** T8 (transitively T9)
**Files likely touched:** 5–6 moved, `src/index.ts`
**Scope:** M — was S, before the parity module and the status computation were counted

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
- [ ] **Prove the moved executable is actually inside the package's gates.** "The package check
      is green" is not evidence unless that file is in the program — which is exactly how it
      escaped Collider's gates for as long as it did: `**` does not match a leading-dot
      directory, so nothing ever looked. Show the file in the checked set; do not infer coverage
      from a directory name or a green aggregate. Deliberately not building temporary
      product-side type-check machinery stays the right call (T2), and this is where the
      coverage actually lands
- [ ] **Provenance drives exclusions.** Justified upstream/vendored exclusions are retained by
      path and reason; newly moved **owned** code must not be swept into a vendored-payload
      exclusion because it landed nearby
- [ ] **Operational instructions are reviewed, not just imports.** Skills, Markdown, YAML,
      templates and examples can carry obsolete commands, install URLs, product paths or inline
      rail logic while the import graph is spotless
- [ ] **Disclosure review before the first public push**, covering **all consumer-derived
      material that becomes public** — profiles, fixtures, baselines, token values, file
      identifiers, generated output, source maps, **and the history and refs being pushed** — not
      merely the final archive. Consumer-specific values belong in declared JSON, not in portable
      validators; anything intentionally published as an example is reviewed as such
- [ ] How installed skill assets are **discovered** after the Collider copy disappears is proven,
      not designed on paper
- [ ] The retained `.agents/skills/` subtree is declared the **frozen compatibility snapshot**
      until T17 — still active for agents, not a second independently maintained source
- [ ] There are never two independently editable copies
- [ ] CLI and materialized skills report the same release identity

**Verification:**

- [ ] `pack-check` confirms all four directories survive packing
- [ ] Every real Collider artifact validates against its schema, with and without the profile
- [ ] The old v1 templates are still correctly rejected
- [ ] Collider is unchanged by this task and still green

> **Hold point** — disclosure review happens before newly moved consumer-derived content is
> pushed publicly, not merely before T15 publishes a release.

**Dependencies:** T8 (transitively T9), and T5's materialization decision
**Files likely touched:** ~160 moved into the pack, `package.json` `files`
**Scope:** L — large by count; discovery paths, relative references and symlinks make it more
than mechanical

---

### T12: Own validation, the proof–ledger relationship, status output and parity

**Description:** Scope comes from T9's inventory and T8's contract, not from the deleted sync
script. Round 4 gave this task explicit ownership of four things, and the third is new: ledger
and proof validation, **their cross-record relationship**, the machine-readable rail-status
result, and the independently invocable parity command.

**Acceptance criteria:**

_Ownership_

- [ ] Every `package-owned` entry from T9 that this task owns is implemented; each inventory
      entry names **one** implementing task, T12 or T13, with no overlap
- [ ] `ledger parity` stays independently invocable — its existing governance-step identity is
      preserved, not absorbed as a side effect of another command
- [ ] Errors carry a phase (`ledger`, `proof`, `artifact`, …)
- [ ] Collider's callers have a command to switch to at T17

_The proof–ledger relationship — implementing T8's specification_

- [ ] **§3 of the T9 inventory is decided: option (1), wire it.** `ds-skills proof validate` joins
      the governance chain, and the relationship check joins `ledger validate`. Porting an
      ungated validator and leaving it ungated by inheritance is not an option
- [ ] The five duplicated facts are checked **for the exact referenced publication**, per the
      binding T8 specified. Neither record is ever copied onto the other to make them agree
- [ ] Sufficiency is checked **separately** from agreement: a valid attestation about an earlier
      revision that no longer supports the ledger's present claim fails as _unsupported claim_,
      with its own diagnostic — not as _invalid proof_
- [ ] Absence behaves as specified: no claim may lack a proof; a current-materialization claim
      may not; a malformed proof is never ignored
- [ ] The schema version moves and the fixtures change a second time — and **every changed
      outcome names its cause**, retirement or relationship (`SPEC.md` §5.2). A second
      reconciliation table is produced; the T9 table is not edited in place

_Portability_

- [ ] All four hardcoded consumer constants generalised (`SPEC.md` §4.5): `publishProofPilotName`,
      `publishProofPilotFile`, `publishProofArtifactPath`, `syncLedgerArtifactPath`
- [ ] **Both validators audited for the same pattern**, including defaults and error-message
      text — not only the checks
- [ ] Expected values come from the profile, never from the record under test. Literal equality
      is preserved; "any string is acceptable" is not a portability fix
- [ ] A profile cannot re-enable the retired mode or override a portable invariant, and this is
      tested — the retirement touched a schema, two validators, fixtures and error messages, so
      the allowed values exist in several representations that must agree

_Fixtures and tests_

- [ ] The 11 ledger fixtures and 5 proof fixtures move with their validators
- [ ] **New cases: each record individually valid while their shared claims disagree**, using
      schema-valid mutations in each direction wherever representable
- [ ] Also covered: missing required proof, wrong source binding, wrong destination, wrong
      revision, and valid historical proof that no longer supports the current claim
- [ ] The second consumer is **genuinely different** — different destination identity, artifact
      path and policy data — and is tested for both legitimate acceptance and mismatched-record
      rejection. Copying Collider's layout under another name proves nothing

**Verification:**

- [ ] All 11 fixtures produce their frozen outcomes and diagnostic reasons, reconciled twice and
      separately: against T1's pre-retirement capture, and against the relationship change. A
      fixture must not pass by failing earlier for an unrelated reason
- [ ] `pnpm check` passes

> **Hold point** — the status caller obtains its complete rail result **without loading or
> interpreting either record itself**.

**Dependencies:** T8, T9, T10, T11 (profile/schema contract)
**Files likely touched:** `src/ledger/`, `src/proof/`, profile schema, fixtures, tests
**Scope:** L — was M. The relationship, the second reconciliation and the constant
generalization are each larger than the original "implement the commands" framing

---

### T13: Own the figma commands, serve, baseline, and the rail tests

**Description:** `figma verify`, `figma drift`, `figma plugin build` — plus `figma serve` and
`figma baseline`, assigned here by round 4 so both have one command owner. Baseline orchestration
may call T12's evaluators; owning the command is still this task. Package-side only; Collider
activation is T17.

**Acceptance criteria:**

_The commands_

- [ ] All five commands implemented per the §4.4 semantics
- [ ] `figma drift`'s source of observed state is explicit; if it needs a live session it is
      **not** a gate command
- [ ] `figma verify` compares the full normalized mapping against reviewed baseline data, never
      against the current artifact, and reads a **local** artifact path — not the config's
      serving origin
- [ ] The pack's suite covers flattener, comparator, theme resolution and `$themeOverrides`
- [ ] Any real-artifact constraint the old `$themeOverrides` assertion protected (per T9) is
      explicitly enforced here. A package fixture does not inherit it, and normalization can
      conceal structural properties

_The builder, and T6's checks made durable_

- [ ] The original consumer's **exact manifest baseline and complete normalized mapping** are
      preserved
- [ ] For **alternate** configurations, the test asserts the intended changed output — byte
      identity to the original digest is the criterion for the original configuration only
- [ ] **T6's substitution checks become durable tests**, including the two round-4 raised: - the `jsString` escaper is pinned **directly**, on hostile values containing `</script`,
      `<script` and `<!--`. Routing through a URL does not exercise it: `new URL()` rejects
      `<` in a hostname with `ERR_INVALID_URL`, so the escaper is defence in depth for a value
      that cannot currently carry the sequence — which is exactly why nothing pins it today - the generated endpoint is tested **together with manifest permissions**. `networkAccess`
      is `allowedDomains: ["none"]` and `devAllowedDomains` applies in development only, so
      T6's third-configuration test proved substitution, **not usability**. A consumer pointing
      at a hosted origin gets a correct manifest that cannot fetch it

_Serve_

- [ ] Tests for actual readiness, an occupied port, shutdown, and access **only to the intended
      resources**. It must not become a generic server for a consumer checkout because that is
      the easy migration
- [ ] Bind behaviour specified, and the plugin's embedded URL agrees with the served endpoint

_Baseline_

- [ ] **Verification and capture are separate behaviours.** Verification never rewrites expected
      data and **fails when the required reference is missing**
- [ ] The non-overwrite guard is preserved and tested: mixed drift across the three artifacts
      leaves **all three unchanged**, not just the one that differed first. No partial writes
- [ ] Automated gates never pass `--force`. A manual demonstration that `--force` works is not a
      substitute for these tests
- [ ] **The T1 reference stays frozen**, with an explicit reconciliation record. It does not
      become an automatically refreshed "current baseline"
- [ ] A small set of **directly asserted semantic examples** sits alongside the historical
      reference — T1 proves preservation of prior behaviour, not that prior behaviour was correct

**Verification:**

- [ ] `pnpm check` passes
- [ ] `figma verify` against Collider's real artifact matches the T1 baseline (**S3**)
- [ ] Negative cases: missing input, malformed JSON, mismatched expectations each produce a
      rail-specific diagnostic and a non-zero exit

> **Hold point** — all builder, serve and baseline behaviour is reachable through installed CLI
> commands, with no product-owned implementation left behind.

**Dependencies:** T8, T9, T10
**Files likely touched:** `src/cli/`, `src/verify/`, `plugin/`, tests
**Scope:** L — was M, before serve, baseline and the durable T6 tests were counted

---

### T14: Test the release product, not a package tarball

**Description:** `pack-check.sh` runs `pnpm add "$tarball" esbuild` — it installs the optional
peer itself, so it proves the plugin builds when a consumer already has esbuild and never that a
plain install can. That gate stays valuable, and round 4 is blunt that it **does not establish the
new delivery contract**: a `.tgz` in a temp directory is not the artifact anyone installs.

**Acceptance criteria:**

_The builder_

- [ ] Either invariant plugin code is prebuilt at release with only config-dependent assembly at
      command time, or the builder dependency is part of the package's own install
- [ ] The builder is never resolved from Collider
- [ ] Platform-specific binaries are handled for the platforms T16a selected
- [ ] `pack-check` no longer installs the builder itself

_The real artifact_

- [ ] Testing targets the **actual staged release archive and production installer**, including
      resources and runtime dependencies — not `node_modules/.bin`, and not the `files` field,
      which are development checks only
- [ ] The installed CLI builds the plugin and runs its commands **without reaching into** the
      package source tree, Collider's `node_modules`, or undeclared developer tooling. A declared
      runtime prerequisite is fine; an accidental one is a defect
- [ ] **The production bash and PowerShell installers are implemented and tested here**, not left
      to exist by T15. Archive layout, platform selection, integrity enforcement against the
      reviewed record, and the §10.6 lifecycle behaviours
- [ ] The bootstrap **hard-fails when its baked release identity is empty** (§10.1)
- [ ] There is **no `--version` flag**: the asset is the version
- [ ] **T5's mechanism proof**, inherited because it had nothing to run against, executed on these
      frozen candidate assets across the §10.5 OS/arch matrix

_Closing the chain_

- [ ] The whole chain is tested, not one layer of it:
      **reviewed record → verified bootstrap bytes → verified payload bytes → installed
      executable and resources**. A verified bootstrap that then trusts a replaceable archive plus
      a replaceable checksum list has moved the trust, not established it
- [ ] Either the reviewed record binds the payload digests, or the verified bootstrap contains and
      enforces them. **A baked tag and asset name is selection identity, not payload integrity**
- [ ] Negative tests at **each** layer, with the reviewed record held unchanged: modified
      bootstrap, and modified payload **with matching modified checksum metadata**. Rejection
      occurs **before** untrusted execution
- [ ] Failure modes covered: installation failure that does not damage an existing installation,
      paths containing spaces, supported-platform selection, and error propagation in **both**
      shell and PowerShell

_Rehearsal_

- [ ] **A pre-release consumer-cutover rehearsal in a disposable checkout**: exercise the proposed
      T17 caller changes against the staged candidate **before** publishing it. Product activation
      remains T17's; this is here so the cutover does not discover a missing command semantic
      after the release is immutable

**Verification:**

- [ ] `pack-check`'s decisive scenario passes: a clean, data-only consumer outside both
      checkouts — no product dependencies, no credentials, **no ambient builder** — installs the
      release and exercises every command with valid and invalid inputs
- [ ] A second, differently configured consumer passes: different namespace, paths, origin,
      plugin identity and profile vocabulary
- [ ] The pack has a lint gate and the LOC guard

> **Hold point** — the exact candidate assets have passed installed-artifact and prospective
> consumer-integration tests. Local installer-fixture tests do **not** replace T16b's real
> anonymous acquisition.

**Dependencies:** T10, **T11, T12**, T13 — every command and asset must exist before the
packaging gate can claim to exercise them
**Files likely touched:** `plugin/build.mjs`, `scripts/pack-check.sh`, installers, `package.json`, CI
**Scope:** L — was M, before the chain closure and the rehearsal were counted

---

> ### ✅ Checkpoint: The package is complete
>
> - [ ] Every §4.2 command implemented with §4.4 semantics specified
> - [ ] `pack-check` decisive scenario green, plus the second consumer
> - [ ] The proof–ledger relationship is enforced, with disagreement tests in both directions
> - [ ] Pack suite covers `$themeOverrides`; lint gate and LOC guard in place
> - [ ] T16a's platform, runtime, location and enforcement selections are recorded
> - [ ] **Collider untouched by this phase and still green**

---

## Phase 3 — Distribution and consumer cutover

### T15: Cut the release — **ask first**

**Description:** The earlier clean scan covered the rail repo as it was on 2026-09-05. It does
not establish that the **final** package is clean after ~160 files moved in.

**Acceptance criteria:**

- [ ] The final tarball is reviewed for disclosure and redistribution suitability
- [ ] **The approval packet identifies**: source commit, release tag, the candidate asset
      inventory, bootstrap and payload digests, and the T14 test evidence for those exact bytes.
      Testing candidate A and rebuilding candidate B during publication re-opens every claim
- [ ] The exact artifact that passed T14 is the one released; nothing is rebuilt
- [ ] **Annotated-tag identity is recorded separately from the peeled commit.** Git distinguishes
      dereferencing a tag object from resolving the commit it names, and a field labelled
      `commit` is not evidence of object type — measured at T7, where pnpm's lockfile
      `commit: b00a82d8…` is the **tag object**, not the commit `189db11`
- [ ] `SHA256SUMS` is published alongside every asset, with per-platform assets where the bundled
      builder requires them. It covers the bootstrap too, and the bootstrap digest goes into the
      reviewed record
- [ ] The installer scripts are published as **release assets**, per §10.1 — not merely committed
      at the tag. A `raw.githubusercontent.com/<org>/<repo>/<tag>/…` bootstrap cannot know its own
      version, which is the defect §10.1 removes; the measurement is in T5
- [ ] **Assembly order: stage a draft with every asset attached, then publish.** Immutable
      releases forbid adding, replacing or deleting an asset after publication, so a release
      published incomplete cannot be repaired — it needs a new release **and** a new reviewed
      record in Collider. This is an assembly constraint, not only a security one
- [ ] Rollback is defined as **explicit version selection** — never `latest`, never restoring the
      retired mode. On a first release there is no compatible earlier version, so rollback is not
      yet a demonstrated recovery procedure; say so rather than implying one exists
- [ ] User approval obtained before publishing

**Verification:**

- [ ] The published version matches the tested digest
- [ ] **The published release object's immutable status is verified.** The repository-setting
      check at T5 was preparation, not proof about a future release
- [ ] On a clean machine: download the bootstrap **asset** for the pinned release, verify it
      against the reviewed record, execute it, and confirm the installed version is the pinned
      one — not merely that the first request returned 200. The `curl … | bash` one-liner is
      exercised separately, as the documented human path, with `set -o pipefail`

**Dependencies:** the Phase 2 checkpoint, and the exact artifact that passed T14 · **ask first**
**Files likely touched:** pack `package.json`, release config
**Scope:** S

---

### T16b: Prove anonymous cold acquisition and provision every environment

**Description:** The release proof T5's mechanism proof could not give: a dummy package or a
workflow-supplied tarball proves installation mechanics, not that the approved artifact is
anonymously retrievable. The contract selection it used to carry is **T16a**, done in Phase 2.

**Acceptance criteria:**

- [ ] Cold acquisition **of the exact release** succeeds with **no usable authentication**, fresh
      relevant caches, and **no existing rail installation** — from a clean checkout, via the
      pinned installer URL, with integrity verified against the reviewed record. A corrupted
      asset **fails**
- [ ] **Each required environment from T16a is provisioned.** Installing in one CI job does not
      establish availability in the others — all 8 jobs provision via a shared setup step rather
      than eight copies
- [ ] **The reviewed toolchain record is created here** — the JSON naming package, exact release
      and integrity that §10.4 specified — along with the provisioning/execution behaviour that
      reads it
- [ ] **Invocation binds to the installed, verified executable**, never to whichever `ds-skills`
      appears first on a developer's `PATH`
- [ ] The enforcement path T16a named is **exercised**, and the conditional-execution analysis is
      confirmed against a real run: a skipped job reports success, so a required check is not
      evidence its commands ran
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

> **Hold point** — the exact release is anonymously obtainable, every rail caller environment can
> execute it, and the required enforcement path is identified **and** exercised.

**Dependencies:** T15 (and T16a's selections)
**Files likely touched:** `.github/workflows/ci.yml`, setup action, `ds-skills.release.json`, docs
**Scope:** M

---

### T17: Activate Collider's callers and delete what they supersede

**Description:** One atomic commit. Invocation changes, deletions, skill activation and the
lockfile change land together, because the intermediate states are not independently green — and
because a split-authority state, where some callers use the CLI and some use the local copy, is
the exact failure this migration exists to end.

**Rehearse before accepting.** T14's disposable-checkout rehearsal is the first pass; this is the
real one. The danger is not the L label, it is discovering a missing command semantic inside the
cutover, after the release is immutable.

**Acceptance criteria:**

_Activation — all of it, at once_

- [ ] **Every** retained caller from T9 is switched, including the two the first draft missed:
      `summarizeCt8b()` in `reusable-component-status.mjs`, and the newly wired proof
      relationship check
- [ ] `summarizeCt8b()` keeps its **mapping to a status rail** and loses all rail policy: it
      spawns the CLI and parses the §4.3 result. The other 611 lines of that generator are
      untouched, and the **unaffected portions of its report are compared before and after** to
      prove it
- [ ] `figma/token-rail.expectations.json` created
- [ ] `ds-skills figma verify` wired into `just preflight` **and into the required CI job named at
      T16a**. No CI job runs preflight — it is the pre-push hook — and `figma-token-rail.test.ts`
      runs today inside `just test-all`, which **is** a CI job. Wiring only preflight would delete
      a CI gate while every job stayed green
- [ ] **The required job's artifact path is established**: which step produces the artifact it
      verifies, in what order, and that it belongs to the commit under test — not another job's
      filesystem, a stale committed copy, or a cache
- [ ] The provisioned CLI and skill assets are selected without ambient fallback: an unrelated
      binary on `PATH` is **not executed at all**, not even to read its version. **No fallback to
      the former implementation when the CLI is missing** — a missing tool is a failure, not a
      downgrade
- [ ] `just figma-plugin-build` calls the CLI; `scripts/build-figma-plugin.mjs` deleted

_Removal — nothing survives by living somewhere unusual_

- [ ] Direct ledger-field reads, evaluator imports, the local parity implementation, the serve
      implementation, the baseline implementation, the moved skill executables and superseded
      wrappers are all removed
- [ ] `src/lib/tokens/figma-token-rail.test.ts` deleted; the self-referential drift case not
      carried over anywhere
- [ ] `@atomize-hq/figma-token-rail` gone from `package.json`; lockfile regenerated and its edges
      removed. The pnpm-version-dependent git-dependency install (T7) ends here — it does not
      justify broadening this migration into supporting arbitrary package-manager versions
- [ ] **Inline workflow and task-runner bodies are audited as well as files.** Moving an algorithm
      into a `justfile` recipe or a CI `run:` block does not satisfy the ownership boundary
- [ ] The generated-plugin exception stays narrow: generated output crosses; product-owned builder
      source and handwritten or generated governance implementations do not
- [ ] **Skill cutover**, which T9's executable inventory does not cover: activate the approved
      release's assets, remove or replace superseded consumer copies, update the canonical
      editing rule, retarget `.claude/skills` discovery, and detect a stale asset or a skill/CLI
      release mismatch
- [ ] Agent-visible skills — not just the copies inside the tarball — belong to the selected
      release and carry no references to removed scripts

**Verification:**

- [ ] **S2** — by the two complementary tests in `SPEC.md` §7.2, **not** an isolated worktree:
      an isolated worktree's own preflight regenerates the artifact, which isolates the blast
      radius rather than the overwrite. (1) artifact rejection against a corrupted artifact in a
      location `build:tokens` does not overwrite; (2) gate propagation under unmodified preflight
      with a **persistent** expectation mismatch. The evidence must identify the actual input read
      at verification time
- [ ] **S4** — manifest byte-identical to the T1 baseline, independently generated
- [ ] **S1** — enumerate paths **before** inspecting contents (`git ls-files -z | xargs -0 grep`),
      across `src/`, `scripts/`, `.agents/`, `justfile`, `package.json`, `.github/`, for both
      package names. A content filter that also matches path text hides real hits — that is how
      `pack-check.sh:18` survived a `grep -v node_modules` at T7. T9 inventory fully resolved
- [ ] `rm -rf node_modules && pnpm install --frozen-lockfile && just preflight` passes
- [ ] Clear `node_modules/.cache/storybook` before blaming any failure on this change

> **Hold point** — one consumer change switches all required callers and removes the superseded
> implementations, with no intermediate split-authority state.

**Dependencies:** T16b
**Files likely touched:** 2 deleted, 1 new JSON, `justfile`, `package.json`, `pnpm-lock.yaml`,
`reusable-component-status.mjs`, plus T9's switched callers
**Scope:** L — atomic by necessity

---

> ### ✅ Checkpoint: The boundary holds
>
> - [ ] **S1**, **S2**, **S3**, **S4** hold
> - [ ] `just preflight` green from a clean install

---

## Phase 4 — Clean-environment evidence and closure

### T18: Demonstrate enforcement through the real installed path

**Description:** More than a final green run. A clean run proves acquisition; it does not prove
the gate can still fail.

**Acceptance criteria:**

- [ ] All 8 jobs cold-acquire the CLI and run their gate
- [ ] **The evidence record names**: exact Collider and package revisions, the installed release
      identity and digests, environment and runtime versions, **the invoked executable path**,
      baseline identities, and the actual CI run and check results
- [ ] No residual rail implementation anywhere in Collider, including generator adapters and the
      T1 capture script
- [ ] The retired-string scan extracts the tarball first, and classifies permitted command or data
      references rather than treating every package-name match as a defect. **Frozen baselines and
      explicit rejection tests must keep naming the retired mode** — inert historical evidence is
      not live support, and requiring every occurrence to vanish would delete the proof that it is
      rejected
- [ ] Where executable coverage left `.agents`, the package-side S7 enforcement test is named and
      proven — deliberate faults in the moved code fail their gates
- [ ] **T9's recorded inventory passes are re-run against the final tree**, by the enumerate-then-
      inspect method
- [ ] BL-3 and BL-4 marked closed in `docs/backlog.md`
- [ ] `SPEC.md` updated wherever a decision changed during implementation

**Verification:**

- [ ] A PR run goes green end to end, **and** a deliberate regression turns the named required
      check red (**S8**). The binding is ruleset **`main` (22410608)** and the context is
      **`Governance`**, since the validators run in job 1 through `governanceSteps`. The regression
      targets the seam this migration created: a **schema-valid proof–ledger disagreement that
      leaves each record individually valid**. Malformed JSON that only trips a linter would not
      establish this. Evidence must show the merge **blocked**, not merely the job red — and must
      not use a check whose job can be skipped, since GitHub counts `skipped` as success
- [ ] **Every independent enforcement path across T14–T18 has a durable test**: parity failure,
      structured-status failure handling, missing or wrong CLI, baseline drift without rewriting,
      and acquisition tampering. Not every mutation needs its own live PR — but every boundary
      needs a test, and T18 demonstrates the **real** required CI path
- [ ] **S6** — `pnpm check` against a clean independently installed release, not a sibling
      checkout, link, or ambient binary
- [ ] All eight criteria hold

> **Hold point** — passing **and** deliberately failing behaviour are both demonstrated through
> the real installed CLI and the real enforcement configuration.

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
