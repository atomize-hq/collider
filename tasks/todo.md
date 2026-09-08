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

**Description:** Copies, not moves — the Phase 2 checkpoint requires Collider untouched and
green, and removing these before T17's atomic cutover would break the consumer for all of
Phase 2. And **not the set the first draft named**. Round 4: it must carry the
status-rail computation and the standalone parity policy module too, or the boundary closes
around a subset. "No behaviour change" survives as a rule for the relocated code; it is not a
description of the task's scope.

**Acceptance criteria:**

- [x] Modules under `src/figma/`; every relative import carries a `.js` specifier;
      `moduleResolution: NodeNext` passes typecheck
- [x] **`figma-parity.mjs` (112 lines) moves** — the standalone CT-15B promotion policy on top of
      the ledger evaluator, which the first draft's "ledger and conformance modules" did not name
- [x] **The status-rail computation moves** — the 36 lines of `summarizeCt8b()` that evaluate,
      not the 611 lines of Storybook/Chromatic reporting around it. The carve-out boundary is
      T9 §2 and it is exact
- [x] **One evaluator, four surfaces.** Human output, `--json`, the standalone commands and the
      status projection share the same decisions. A second evaluator written "just for JSON" is
      the defect this criterion exists to prevent
- [x] **Relocation and intentional change stay separately reviewable.** Relocation means
      behaviour equivalent to the reconciled post-T3 reference. Intentional change means
      proof–ledger enforcement, portability corrections and newly specified boundary behaviour.
      Without the distinction a regression is explained away as "part of the move", and a
      necessary new check is hidden by rebaselining
- [x] Tests move **with** their code, and where a moved assertion now executes is recorded. A
      lower Collider test count is not a regression if the tests are running in the package —
      but that has to be shown, not asserted

**Verification:**

- [x] `pnpm check` passes including `smoke` (the built ESM loads under Node)
- [x] Full normalized mapping matches the T1 baseline (**S3**)
- [x] The package evaluates the relevant fixture inputs **without importing product code** and
      without depending on Collider's checkout layout

> **Hold point** — the package can evaluate the fixture inputs standing alone.

**Dependencies:** T8 (transitively T9)
**Files likely touched:** 5–6 moved, `src/index.ts`
**Scope:** M — **done**, `884cbb2`. Was S, before the parity module and the status computation
were counted

**What it found:** the reason-code branches are **order-dependent** — a stale ledger whose parity
is deferred reports `ct8b-parity-stale`, not `ct8b-parity-deferred`. Reordering them changes what a
reviewer is told while every outcome stays identical. Caught because expected values were captured
from the pre-move implementation rather than from the moved one describing itself.

---

### T11: Move skills, schemas, profiles and templates in — preparation only

**Description:** Package-side preparation. **Do not remove anything from Collider yet** — a
working `.agents` script stays until its replacement exists and callers are switched. Settle
materialization here: canonical editing location, tracked or generated, stale-copy handling,
`.claude/skills` symlink behaviour, and a release identity shared with the CLI.

**Acceptance criteria:**

- [x] `schemas/`, `profiles/`, `templates/` present in the pack and in `files`
- [x] **`skills/` — settled and moved.** Three of the eight: `sync-quality-governor`,
      `stage-1-foundation-primitives-system`, `storybook-rigorous-spec-system`.
      `ai-elements` and `ai-elements-plate-builder` **stay with the consumer**, and no shipped
      skill may reference them — gated, and the gate was proven to fail
- [ ] The two rail-referencing skills (`sync-quality-governor`, `stage-1`) describe CLI
      invocations rather than repo paths — they no longer name a consumer, but they still
      describe `pnpm`/`node` invocations. Re-check at T17, when the commands actually change
- [x] `validate-artifact.mjs` moves behind `ds-skills validate` unchanged, **and its test
      moves with it** — now `src/validate/artifact.mjs` + `artifact.test.mjs`, 6 cases, repointed
      at the pack's own fixture and example profile
- [x] **Prove the moved executable is actually inside the package's gates.** Not inferred from a
      directory name: `vitest.config.ts` gained `src/**/*.test.mjs` (the suite is spawn-based,
      because every caller invokes it as `node …`), and the gate was **proven to bite** — stubbing
      out the unimplemented-keyword rejection turned `pnpm vitest` red on exactly that case
- [x] **Provenance drives exclusions.** Nothing from `.agents/skills/ai-elements/` was copied, so
      no vendored payload was swept in alongside owned code
- [x] **Operational instructions reviewed**, and three were stale — found by reading, not by the
      import graph, exactly as round 4 predicted
- [x] **Disclosure review before the first public push** —
      [`docs/ds-skills-disclosure-review.md`](../docs/ds-skills-disclosure-review.md), covering
      secrets, profiles, fixtures, schemas, generated output, and history/refs
- [x] How installed skill assets are **discovered** — `ds-skills skills` prints the path this
      install actually resolves, so a consumer never has to know the layout. A consumer that has
      to be told a path can be told the wrong one
- [x] The retained `.agents/skills/` subtree is the **frozen compatibility snapshot** until T17 —
      Collider is untouched, so the three moved skills exist in both places but only one is edited
- [x] There are never two independently editable copies — the pack's copies are the ones now
      edited; Collider's are frozen until T17 switches discovery to the installed assets
- [x] CLI and materialized skills report the same release identity, and **fail closed on skew**
      (§10.6). One `release.json` plus one `skills/RELEASE.json`, written from a single object at
      stage time so they cannot disagree inside an asset; a copy that came from another release
      is refused with both versions named. A missing stamp is could-not-evaluate, never a
      default — a fallback would make the check pass on the one machine it cannot protect.
      Proven by staging the skills stamp from the working tree instead: the release said v0.4.0,
      the skills said `dev`, and the installed CLI refused

**Verification:**

- [x] `pack-check` confirms the moved directories survive packing — checked in the **installed**
      package, not by reading `files`, because a `files` entry naming a directory that does not
      ship still looks correct
- [x] The installed schemas carry no consumer namespace — a new `pack-check` assertion, which
      **caught four `description` fields** after the `$id` fix had already been made
- [ ] Every real Collider artifact validates against its schema, with and without the profile —
      belongs with T17's `ds-skills validate` wiring
- [ ] The old v1 templates are still correctly rejected
- [x] Collider is unchanged by this task and still green — tree clean, `just check` 0 errors

> **Hold point** — disclosure review happens before newly moved consumer-derived content is
> pushed publicly. **Held**: the review is written, and nothing is pushed.

**What the review found:**

1. **`SPEC.md` §3.1 and T9's inventory contradicted each other about `collider.json`**, and the
   inventory was right. A consumer's profile does not ship from a portable package — a second
   consumer would be adding its vocabulary to someone else's repository. The pack ships
   `profiles/example.json` instead, with vocabulary deliberately unlike any real consumer's, so a
   validator with baked-in values **fails against it** rather than passing by coincidence.
2. **All five "portable" schemas named Collider** — every `$id`, four `description` fields, and
   most of `schemas/README.md`. No _constraint_ did, so the shapes really were portable, but the
   package would have published one consumer's namespace and worked examples.
3. **Nine hardcoded consumer constants, not four.** The three usage strings name
   `scripts/validate-*.mjs` paths T17 deletes, so after cutover they instruct a user to run a
   script that does not exist. `defaultSyncLedgerPath` and `defaultPublishProofPath` are consumer
   layout. All five are the "defaults and error messages" class round 4 named.
4. **`skills/` was a scope question, and "the 8 skills" had never been examined.** Settled: three
   move, `ai-elements` and `ai-elements-plate-builder` stay with the consumer, and no shipped skill
   may reference them. Severing that meant removing a whole "AI Elements / Plate foundation rules"
   section from `stage-1` and rewriting three checklist items, a directory listing and a paragraph
   so the practice survives without the vendor names. It also surfaced a second bug: skills sat
   _beside_ `schemas/` under `.agents/skills/`, so `` `../schemas` `` resolved there and silently
   does not here.

   The original finding, corrected: `ai-elements/` is a
   mirror of a third-party library's **documentation** — 49 doc pages plus the 80 usage examples
   they reference, every one importing from `@/components/ai-elements/*` rather than implementing
   anything. **The vendored component sources are `src/components/ai-elements/`** — 91 files,
   12k lines — and were never in this migration's scope. My first reading of this said "80 vendored
   component sources" and was wrong; it came from filenames rather than from opening the files.
   Corrected, the question is cohesion: a token-rail CLI should not ship someone else's
   component-library docs, which also means no licence review is needed. Four of the eight skills
   name the consumer and need the schemas' portability pass.

**Dependencies:** T8 (transitively T9), and T5's materialization decision
**Files likely touched:** `schemas/`, `templates/`, `profiles/`, `src/validate/`, `package.json`
**Scope:** L — **done except one item deliberately deferred.** Portable assets, the validator and
three skills have moved and are gated; discovery and shared release identity closed at T14
(`ds-skills` `003f5d7`). The only open item is the two skills' `pnpm`/`node` invocation strings,
which are re-checked at T17 when the commands actually change

---

### T12: Own validation, the proof–ledger relationship, status output and parity

**Description:** Scope comes from T9's inventory and T8's contract, not from the deleted sync
script. Round 4 gave this task explicit ownership of four things, and the third is new: ledger
and proof validation, **their cross-record relationship**, the machine-readable rail-status
result, and the independently invocable parity command.

**Acceptance criteria:**

_Ownership_

- [x] Every `package-owned` entry from T9 that this task owns is implemented; each inventory
      entry names **one** implementing task, T12 or T13, with no overlap
- [x] `ledger parity` stays independently invocable — its existing governance-step identity is
      preserved, not absorbed as a side effect of another command
- [x] Errors carry a phase (`ledger`, `proof`, `artifact`, …)
- [x] Collider's callers have a command to switch to at T17

_The proof–ledger relationship — implementing T8's specification_

- [x] **§3 of the T9 inventory is decided: option (1), wire it.** `ds-skills proof validate` joins
      the governance chain, and the relationship check joins `ledger validate`. Porting an
      ungated validator and leaving it ungated by inheritance is not an option
- [x] The five duplicated facts are checked **for the exact referenced publication**, per the
      binding T8 specified. Neither record is ever copied onto the other to make them agree
- [x] Sufficiency is checked **separately** from agreement: a valid attestation about an earlier
      revision that no longer supports the ledger's present claim fails as _unsupported claim_,
      with its own diagnostic — not as _invalid proof_
- [x] Absence behaves as specified: no claim may lack a proof; a current-materialization claim
      may not; a malformed proof is never ignored
- [x] The schema version moves and the fixtures change a second time — and **every changed
      outcome names its cause**, retirement or relationship (`SPEC.md` §5.2). A second
      reconciliation table is produced; the T9 table is not edited in place

_Portability_

- [x] All four hardcoded consumer constants generalised (`SPEC.md` §4.5): `publishProofPilotName`,
      `publishProofPilotFile`, `publishProofArtifactPath`, `syncLedgerArtifactPath`
- [x] **Both validators audited for the same pattern**, including defaults and error-message
      text — not only the checks
- [x] Expected values come from the profile, never from the record under test. Literal equality
      is preserved; "any string is acceptable" is not a portability fix
- [x] A profile cannot re-enable the retired mode or override a portable invariant, and this is
      tested — the retirement touched a schema, two validators, fixtures and error messages, so
      the allowed values exist in several representations that must agree

_Fixtures and tests_

- [x] The 11 ledger fixtures and 5 proof fixtures move with their validators
- [x] **New cases: each record individually valid while their shared claims disagree**, using
      schema-valid mutations in each direction wherever representable
- [x] Also covered: missing required proof, wrong source binding, wrong destination, wrong
      revision, and valid historical proof that no longer supports the current claim
- [x] The second consumer is **genuinely different** — different destination identity, artifact
      path and policy data — and is tested for both legitimate acceptance and mismatched-record
      rejection. Copying Collider's layout under another name proves nothing

**Verification:**

- [x] All 11 fixtures produce their frozen outcomes and diagnostic reasons, reconciled twice and
      separately: against T1's pre-retirement capture, and against the relationship change. A
      fixture must not pass by failing earlier for an unrelated reason
- [x] `pnpm check` passes

> **Hold point** — the status caller obtains its complete rail result **without loading or
> interpreting either record itself**.

**Dependencies:** T8, T9, T10, T11 (profile/schema contract)
**Files likely touched:** `src/ledger/`, `src/proof/`, profile schema, fixtures, tests
**Scope:** L — was M. The relationship, the second reconciliation and the constant
generalization are each larger than the original "implement the commands" framing

---

**Landed:** `atomize-hq/ds-skills` `519c96d` (implementation) and `5a0b2da` (diagnostic phase).
The reconciliation and the findings are in
[`docs/ds-skills-second-reconciliation.md`](../docs/ds-skills-second-reconciliation.md).

**What it found:**

- **Nine hardcoded consumer constants, not the four `SPEC.md` §4.5 lists** — the two pilot
  identifiers, the two independently-declared artifact paths, **two default record paths**, and
  **three usage strings** naming consumer scripts T17 deletes. The defaults mattered most: a
  default path is a consumer assumption that fires only when an argument is omitted, which is the
  case least likely to be tested.
- **The package was shipping a real Figma file key and the consumer's name into a public
  repository** — four proof fixtures, five destinations, one prose reason string. Nothing had been
  pushed. It survived T11's disclosure review because the boundary check reads **modules only**,
  on the reasoning that a fixture naming a consumer is sample data. True for coupling, false for
  disclosure: in a public package, sample data is published data.
- **A `pack-check.sh` assertion had stopped testing what it claimed.** It asserted that
  `ledger validate --ledger nope.json` exits 2 with empty stdout as evidence that an unimplemented
  command cannot look like a clean run. Once the command was implemented it still exited 2 with
  empty stdout — because `--profile` was missing. Green, testing nothing. The fourth
  filter-shaped lie in this migration.
- **Sufficiency is structurally subsumed by agreement** once all six facts are enforced: it and
  `CT-8B_PUBLISH_VALID_REQUIRES_CURRENT_REVISION` fire on the same state. Kept — it reports that
  state from the publication's side, which is what says re-attesting is not the fix — but recorded
  as subsumed rather than counted as independent coverage.
- **Fact 1 cannot fail between two valid records**, because both validators pin `artifact.path` to
  the same profile key. The comparison is kept as defence in depth and exercised directly, labelled
  as such rather than counted as a live check.
- **No fixture outcome moved.** All 11 keep their state, promotability and diagnostics across the
  v2 -> v3 move. The status-rail baseline is **not** rebaselined: the test substitutes the version
  segment and asserts the revision segment is byte-identical, so a fixture that changed identity
  under cover of the schema bump fails.

**Deliberately not done here:** wiring `proof validate` into Collider's governance chain is T17's
half of the §3 decision — this task owns the command. `SPEC.md` §4.5 and the boundary contract §5
still say "four constants"; correcting a contract from inside its own implementation is the wrong
place, so §6 of the reconciliation doc flags it for whoever edits them next.

### T13: Own the figma commands, serve, baseline, and the rail tests

**Description:** `figma verify`, `figma drift`, `figma plugin build` — plus `figma serve` and
`figma baseline`, assigned here by round 4 so both have one command owner. Baseline orchestration
may call T12's evaluators; owning the command is still this task. Package-side only; Collider
activation is T17.

**Acceptance criteria:**

_The commands_

- [x] All five commands implemented per the §4.4 semantics
- [x] `figma drift`'s source of observed state is explicit; if it needs a live session it is
      **not** a gate command
- [x] `figma verify` compares the full normalized mapping against reviewed baseline data, never
      against the current artifact, and reads a **local** artifact path — not the config's
      serving origin
- [x] The pack's suite covers flattener, comparator, theme resolution and `$themeOverrides`
- [x] Any real-artifact constraint the old `$themeOverrides` assertion protected (per T9) is
      explicitly enforced here. A package fixture does not inherit it, and normalization can
      conceal structural properties

_The builder, and T6's checks made durable_

- [x] The original consumer's **exact manifest baseline and complete normalized mapping** are
      preserved
- [x] For **alternate** configurations, the test asserts the intended changed output — byte
      identity to the original digest is the criterion for the original configuration only
- [x] **T6's substitution checks become durable tests**, including the two round-4 raised: - the `jsString` escaper is pinned **directly**, on hostile values containing `</script`,
      `<script` and `<!--`. Routing through a URL does not exercise it: `new URL()` rejects
      `<` in a hostname with `ERR_INVALID_URL`, so the escaper is defence in depth for a value
      that cannot currently carry the sequence — which is exactly why nothing pins it today - the generated endpoint is tested **together with manifest permissions**. `networkAccess`
      is `allowedDomains: ["none"]` and `devAllowedDomains` applies in development only, so
      T6's third-configuration test proved substitution, **not usability**. A consumer pointing
      at a hosted origin gets a correct manifest that cannot fetch it

_Serve_

- [x] Tests for actual readiness, an occupied port, shutdown, and access **only to the intended
      resources**. It must not become a generic server for a consumer checkout because that is
      the easy migration
- [x] Bind behaviour specified, and the plugin's embedded URL agrees with the served endpoint

_Baseline_

- [x] **Verification and capture are separate behaviours.** Verification never rewrites expected
      data and **fails when the required reference is missing**
- [x] The non-overwrite guard is preserved and tested: mixed drift across the three artifacts
      leaves **all three unchanged**, not just the one that differed first. No partial writes
- [x] Automated gates never pass `--force`. A manual demonstration that `--force` works is not a
      substitute for these tests
- [x] **The T1 reference stays frozen**, with an explicit reconciliation record. It does not
      become an automatically refreshed "current baseline"
- [x] A small set of **directly asserted semantic examples** sits alongside the historical
      reference — T1 proves preservation of prior behaviour, not that prior behaviour was correct

**Verification:**

- [x] `pnpm check` passes
- [x] `figma verify` against Collider's real artifact matches the T1 baseline (**S3**)
- [x] Negative cases: missing input, malformed JSON, mismatched expectations each produce a
      rail-specific diagnostic and a non-zero exit

> **Hold point** — all builder, serve and baseline behaviour is reachable through installed CLI
> commands, with no product-owned implementation left behind.

**Dependencies:** T8, T9, T10
**Files likely touched:** `src/cli/`, `src/verify/`, `plugin/`, tests
**Scope:** L — was M, before serve, baseline and the durable T6 tests were counted

---

**Landed:** `atomize-hq/ds-skills` `bd4d8ae` (commands) and `690a1cf` (three constraints made
checkable). 214 tests, `pnpm check` green, Collider untouched.

**Verified against the consumer's real data, not a package fixture:**

- **S3** — `ds-skills figma verify --config figma/token-sync.config.json --expect
figma/token-rail.baseline.json --artifact design-tokens/dist/figma/tokens.json` → `✓ collection=Collider
Tokens variables=176 themes=dark,light default=dark`, exit 0.
- **S4** — `ds-skills figma baseline --check … --plugin-out figma/plugins/collider-token-sync` →
  both committed references **unchanged**, exit 0. The manifest is byte-identical to T1's capture
  (sha256 `df45a8de…`, 373 bytes), and the committed plugin build still matches its config.

**Three defects the new tests found:**

- **Re-capturing a baseline reordered its keys**, so a second run produced a diff with no change
  in it — indistinguishable from real drift, and directly against the "run it twice, the tree
  stays clean" property the capture promises. An unchanged reference is now left alone byte for
  byte, which also stops a consumer's formatter and a re-capture fighting over short arrays.
- **The drift-report endpoint trusted the client's provenance.** It spread the posted payload
  _after_ the stamped fields, so a caller could supply its own `artifactSha256` and have the
  server record it as measured — defeating the one thing the envelope exists for. **Inherited
  verbatim from Collider's `scripts/serve-figma-tokens.mjs`**, so the relocation would have carried
  it across silently. Collider still has the original; T17 replaces that file.
- **A missing config surfaced as an unexpected runtime failure** (exit 3) rather than an inability
  to evaluate (exit 2), collapsing the distinction T8 §3.1 exists to draw.

**Design decisions worth keeping:**

- **`figma drift` takes observed state from a named file.** Figma variables are readable only
  inside a plugin session, so a command that produced its own observation would need a live editor
  and could never be a gate. Recording and checking are two steps; only the second is a check.
- **`figma verify` reads a local artifact path.** A verifier that fetched what the plugin fetches
  would pass whenever the server agreed with itself.
- **One builder, two entry points.** `plugin/build.mjs` is now a wrapper over `src/plugin/build.ts`;
  pack-check compares the two entry points' output byte for byte, so they cannot drift. The
  extraction also removed the runtime `import("../src/config.ts")` fallback.
- **`--plugin-out` was added** so the manifest baseline can name the manifest it describes, and so
  a committed plugin build that no longer matches its config is its own finding
  (`RAIL_BASELINE_STALE_BUILD`) — invisible to a baseline captured from a scratch build.

**Not carried across:** the mapping baseline's `railDependency` stamp is consumer provenance the
portable capturer does not reproduce. It is _preserved_ rather than dropped, and excluded from the
comparison along with `$comment` and `producedBy` — a capturer that reported drift because the tool
renamed itself would be crying wolf about its own byline.

### T14: Test the release product, not a package tarball

**Description:** `pack-check.sh` runs `pnpm add "$tarball" esbuild` — it installs the optional
peer itself, so it proves the plugin builds when a consumer already has esbuild and never that a
plain install can. That gate stays valuable, and round 4 is blunt that it **does not establish the
new delivery contract**: a `.tgz` in a temp directory is not the artifact anyone installs.

**Acceptance criteria:**

_The builder_

- [x] Prebuilt at package build time, with only config-dependent assembly at command time —
      `scripts/prebuild-plugin.mjs`. The seam is two identifiers `plugin/code.ts` declares and
      never defines, substituted by JSON literals; the build refuses a bundle where either
      appears anything but **exactly once**
- [x] The builder is never resolved from Collider — and now not from anywhere at command time
- [x] Platform-specific binaries are handled: there are none left. Prebuilding removed the only
      native dependency, so the §10.5 matrix is retained as the **selection** contract and
      §10.5 is amended in place to say so
- [x] `pack-check` no longer installs the builder itself, and asserts none is present.
      `esbuild` is no longer a peer dependency at all

_The real artifact_

- [x] Testing targets the staged release archive and the production installer —
      `scripts/checks/release-install.sh`, `release-lifecycle.sh`, `release-matrix.sh`.
      Staging twice produces byte-identical assets, so the tested and published bytes are one
      claim
- [x] **Measured, not assumed:** the installed CLI runs with `fs` instrumented and every path it
      opens is checked against its install prefix and the consumer's data
      (`scripts/checks/trace-reads.mjs`). Faulted with one stray read, it goes red
- [x] **Both production installers implemented and tested here.** `install.ps1` runs under
      `pwsh` in the gate — real archive layout, real platform selection, real integrity
      enforcement, real refusals. No escape hatch when `pwsh` is absent
- [x] The bootstrap hard-fails when its baked identity is empty **or still a placeholder** — the
      ungenerated template is the likeliest way one ends up in that state, and it is tested
- [x] No `--version` flag, and no flags at all: `curl | bash` has no argv. The two things a
      caller legitimately varies are env vars. **Proven by accident**: the v0.4.0 bootstrap
      pointed at a v0.4.1-only mirror 404s, which is now an explicit assertion
- [x] **T5's mechanism proof** executed on the frozen candidate assets across all five §10.5
      pairs — each selects **its own** asset, verifies it, and installs a working executable

_Closing the chain_

- [x] Every link tested: record → bootstrap → baked digests → payload → installed executable
- [x] The bootstrap **contains and enforces** the per-platform digests, so it establishes payload
      integrity rather than moving the question along
- [x] Negative tests at each layer with the record held unchanged, including the decisive one —
      **a modified payload with a matching modified `SHA256SUMS`**. Rejection is asserted to
      happen before anything is unpacked, not merely before it is used
- [x] Failure modes: damage-free failure (canary file), paths with spaces, platform selection,
      Node minimum, and refusals in **both** shell and PowerShell

_Rehearsal_

- [x] **Run against a disposable clone of Collider**, `pnpm rehearse`. The consumer's tree is
      asserted untouched. **S3 and S4 both pass through the installed release against Collider's
      real data.** Five findings, all consumer data migrations for T17 — see below

**Verification:**

- [x] `pack-check`'s decisive scenario passes: two data-only consumers outside both checkouts,
      no product dependencies, no credentials, no ambient builder, installing the **release** and
      exercising every command with valid and invalid inputs
- [x] The second consumer differs in every profiled dimension — namespace, artifact path, origin,
      plugin identity, theme names, collection and permitted publish modes. Its expected Figma
      observation is **hand-computed**, not generated by the code under test
- [x] The pack has a lint gate and the LOC guard — `ds-skills` `37a9971`; **this item had no owning task**, and adopting it found four live defects

> **Hold point** — the exact candidate assets have passed installed-artifact and prospective
> consumer-integration tests. Local installer-fixture tests do **not** replace T16b's real
> anonymous acquisition. **Held.**

**What T14 found:**

1. **`--port 0` reported port 0** and split the two loopback families across different ephemeral
   ports — a "serve on any free port" printing a URL nothing can connect to.
2. **`ds-skills validate` required a path into the package's own tree.** A consumer had to write
   `<prefix>/lib/schemas/…` — this migration's coupling, reintroduced from the other side. A
   shipped schema is now named; paths still work for a consumer's own.
3. **The placeholder assertion had gone vacuous a third time.** Fixed with a registry field
   (`requiresArguments`) rather than an inline exception that would outlive its reason.
4. **CI ran neither the lint gate nor the LOC guard** — it listed steps while `pnpm check` listed
   nine. CI now runs `pnpm check` and installs `tokei`.
5. Baking the config as a JS _string_ rather than an object parses, runs, and gives every field
   as `undefined`. Caught by executing the assembled bundle against a stub Figma in `node:vm`.

**Rehearsal findings — T17's, not the package's:**

1. `.agents/skills/profiles/collider.json` lacks `destination-name` and `destination-figma-file`,
   which T12 made required. Every record command exits 2, so `--json` yields no rail projection.
   **Closed** — the two keys are declared. No Collider code reads that file, so the addition is
   inert to Collider's gates and `proof validate` against the real proof now exits 0.
2. `src/figma/sync-ledger.json` is still `ledgerVersion: "2"` with no `publication` block.
   **Not separable — it is the data half of T17's cutover, and stays at v2 until then.** Migrating
   it alone was tried and reverted: `scripts/lib/sync-ledger.mjs:80` pins `ledgerVersion` to the
   literal `'2'` and its key spec has no `publication`, so the migrated ledger fails Collider's own
   validator and **five tests** across three Storybook suites. Repairing a module T17 deletes, to
   accept a version its replacement already requires, is throwaway work in both directions. The
   migration is pre-computed in T17 instead, so the cutover applies it rather than deriving it.
   Recording where the check lives, since it is not where it looks: `pnpm validate:sync-ledger` has
   **zero gate callers** — it is in `package.json` and in neither `just check` nor `just preflight`
   — so the ledger is guarded only through those tests, the same zero-caller shape T9 found on
   `validate:publish-proof`.

**Found while verifying finding 1, and fixed in the package (`ds-skills` `53c758f`):** with a
publication binding that does not hold, `ledger validate` reported `ok: false` while its `rail`
block still said `outcome: "satisfied"`, `reasonCodes: []`, `promotable: true`. The rail projection
is computed from the ledger alone, and a ledger agrees with itself whatever the proof says — but
that block is the one a status caller is contracted to consume _on its own_, so the single consumer
that opens neither record was told the rail was fine while the attestation under it was unverified.
Not a regression: `evaluateStatusRail` was behaviour-pinned against the pre-move implementation,
which had no binding to consult because v2 had none, so the gap arrived with v3 and the pin
preserved it by construction. The same defect this command already refused for an _unreadable_
ledger — the binding was its surviving instance. `rail.outcome` and `promotable` are now withheld
on a failed binding, with a `ct8b-publication-unverified` reason code; `state` and `freshness` still
describe the ledger, which is readable and says what it says.

**Full record:** [`docs/ds-skills-release-product-evidence.md`](../docs/ds-skills-release-product-evidence.md)

**Dependencies:** T10, **T11, T12**, T13 — every command and asset must exist before the
packaging gate can claim to exercise them
**Files likely touched:** `plugin/build.mjs`, `scripts/pack-check.sh`, installers, `package.json`, CI
**Scope:** L — was M, before the chain closure and the rehearsal were counted. **Done** —
`ds-skills` `003f5d7`. 244 tests / 20 files, `pnpm check` green end to end

---

> ### ✅ Checkpoint: The package is complete
>
> - [x] Every §4.2 command implemented with §4.4 semantics specified — **ten**, not nine;
>       `skills` was added at T14 for discovery and the §10.6 skew rule
> - [x] `pack-check` decisive scenario green, plus the second consumer
> - [x] The proof–ledger relationship is enforced, with disagreement tests in both directions
> - [x] Pack suite covers `$themeOverrides`; lint gate and LOC guard in place, and the guard now
>       covers `installers/` too
> - [x] T16a's platform, runtime, location and enforcement selections are recorded — and §10.5's
>       _rationale_ is amended, since prebuilding the plugin removed the native dependency the
>       per-platform split was justified by
> - [x] **Collider untouched by this phase and still green** — the rehearsal runs against a
>       disposable clone and asserts the working tree is unmodified afterwards

---

## Phase 3 — Distribution and consumer cutover

### T15: Cut the release — **ask first** — ✅ **DONE 2026-09-07**

**Description:** The earlier clean scan covered the rail repo as it was on 2026-09-05. It does
not establish that the **final** package is clean after ~160 files moved in.

**Acceptance criteria:**

- [x] The final tarball is reviewed for disclosure and redistribution suitability
- [x] **The approval packet identifies**: source commit, release tag, the candidate asset
      inventory, bootstrap and payload digests, and the T14 test evidence for those exact bytes.
      Testing candidate A and rebuilding candidate B during publication re-opens every claim
- [x] The exact artifact that passed T14 is the one released; nothing is rebuilt
- [x] **Annotated-tag identity is recorded separately from the peeled commit.** Git distinguishes
      dereferencing a tag object from resolving the commit it names, and a field labelled
      `commit` is not evidence of object type — measured at T7, where pnpm's lockfile
      `commit: b00a82d8…` is the **tag object**, not the commit `189db11`
- [x] `SHA256SUMS` is published alongside every asset, with per-platform assets where the bundled
      builder requires them. It covers the bootstrap too, and the bootstrap digest goes into the
      reviewed record
- [x] The installer scripts are published as **release assets**, per §10.1 — not merely committed
      at the tag. A `raw.githubusercontent.com/<org>/<repo>/<tag>/…` bootstrap cannot know its own
      version, which is the defect §10.1 removes; the measurement is in T5
- [x] **Assembly order: stage a draft with every asset attached, then publish.** Immutable
      releases forbid adding, replacing or deleting an asset after publication, so a release
      published incomplete cannot be repaired — it needs a new release **and** a new reviewed
      record in Collider. This is an assembly constraint, not only a security one
- [x] Rollback is defined as **explicit version selection** — never `latest`, never restoring the
      retired mode. On a first release there is no compatible earlier version, so rollback is not
      yet a demonstrated recovery procedure; say so rather than implying one exists
- [x] User approval obtained before publishing

_Readiness delta — from the 2026-09-07 consult ([record](../docs/consultations/2026-09-07-release-readiness-review.md)), accepted after local verification_

- [x] **Every required check is reachable through the released CLI's public command path.** One
      that is not is a release blocker, distinct from T17's question of whether a gate calls it.
      This is the pre-release half of the caller-proof strengthening; the consumer-gate half is
      T17's
- [x] **The bounded stale-check inspection is done** — 2026-09-07, `ds-skills` `a1b48fd`,
      `e5ed7e3`. **It found a second instance of the same defect.** `ledger parity` printed ✓ and
      exited 0 on the exact records `ledger validate` rejects: required parity affirms
      `E-promotion-complete`, and that rung is what the binding's own sufficiency check rests on
      the bound publication, so it was asserting the thing the binding underwrites while reading
      one record. Fixed at the caller, with deferred parity deliberately left alone — it affirms
      the deferral, not a rung — and both directions tested, since the deferred case staying green
      under the inverse control is what makes it evidence rather than decoration.
      Area A also found that the **installed-artifact gate never asserted the rail block**, only
      `DIGEST_MISMATCH` on stderr, so the correction was proven by a unit test and not by the bytes
      that ship. `consumer.sh` now asserts both commands through the installed executable, and
      reverting either fix turns the installed gate red.
      Area B's one-factor counterexample is pinned: a substitute proof that is individually valid
      and agrees on all six §4 facts, so only the digest can catch it — disabling that comparison
      lets the swap through undetected. Area C's one pin spanning a contract change is
      `status-rail.baseline.json`, and it is correct as a pin: it describes a ledger-only function,
      and the prerequisite now lives in the two callers that compose an answer. Area D was already
      covered — the vm test executes the shipped bundle after substitution, not a rebuild.
      The four areas, as scoped: every
      independently consumed affirmative projection; cross-record relationships and any
      single-input shortcut, probed with **one-factor counterexamples** — hold the status-producing
      record fixed and break only its partner or binding, and swap the partners of two individually
      valid pairs; behaviour pins that span a contract change; and whether the **distributed
      prebuilt bundle after substitution** is what the bundle tests exercise, rather than the source
      entry point or a separately rebuilt one. Do not regenerate goldens from the successor — that
      swaps one circular oracle for another. Exit condition: no current invariant is supported only
      by predecessor parity
- [x] **The Figma file key is out of the unpushed history.** Found 2026-09-07: three of the
      then-unpushed commits carried the real key in five files each — four `publish-proof`
      fixtures and `publish-proof.mjs`, where it was `export const publishProofPilotFile`. T12 had
      fixed the working tree, so HEAD was clean, but a push publishes history and not the tip.
      Rewritten the same day with `git filter-branch` over `origin/main..HEAD`, substituting the
      key for `fixture-consumer-a` and the destination name for `Fixture Consumer A` — the values
      T12 itself chose, so the rewritten history agrees with what the files became. Ten commits
      changed SHA; the invariant that made it safe is that **`HEAD^{tree}` is byte-identical
      before and after** (`420ce191`), since the key was already absent from the tip.
      Note the two occurrences were different failures. The fixtures were test data. The
      `publish-proof.mjs` export was a portable package with one consumer's constant compiled into
      its source — the coupling this migration exists to remove, with the disclosure incidental
      to it.
- [x] **Correcting the standing note: the repo has already been pushed.** `origin/main` is at
      `1a57225` (2026-09-05) with **8 commits already public**, and those eight are clean — the key
      appears in none of them. The disclosure gate therefore applies to the unpushed commits, not
      to a first-ever publication. Scope any history scan with `git rev-list origin/main`; `git log
--all` walks unpushed refs and will report local commits as if they were public, which is how
      this finding first read as an active leak when it was not.
- [x] **Disclosure approval names an exact publication scope, and covers reachable history** — not
      the working tree. Deleted content, captured predecessor outputs, fixtures and metadata are all
      published by a push that makes them reachable. Inspect what could broaden the scope
      (`--mirror`, `push.followTags`, `push.default`) and inspect first-push and tag-triggered
      automation, so nothing publishes a release ahead of the approval or leaks through a job's
      output. "The first CI run will scan it" is not available: that run is downstream of the
      publication event
- [x] **The reviewed record is not the release description.** Confirm at cut time whether GitHub
      permits editing an immutable release's title and notes — the consult asserts it does, which
      this repo has not verified. If so, nothing may treat the rendered release page as the
      authority; the committed record is
- [x] **Read the uploaded draft back before publishing.** Compare names, sizes and digests against
      the reviewed record from the uploaded bytes, not from upload success — and **reject
      unexplained extra assets as well as missing ones**
- [x] After publishing, exercise the bootstrap through the **unauthenticated public route** before
      any consumer adopts it. If that surfaces a content mistake, leave the consumer un-cut-over and
      issue a corrected release; never weaken verification to match what shipped

**Verification:**

- [x] The published version matches the tested digest
- [x] **The published release object's immutable status is verified.** The repository-setting
      check at T5 was preparation, not proof about a future release
- [x] On a clean machine: download the bootstrap **asset** for the pinned release, verify it
      against the reviewed record, execute it, and confirm the installed version is the pinned
      one — not merely that the first request returned 200. The `curl … | bash` one-liner is
      exercised separately, as the documented human path, with `set -o pipefail`

**Dependencies:** the Phase 2 checkpoint, and the exact artifact that passed T14 · **ask first**
**Files likely touched:** pack `package.json`, release config
**Scope:** S

---

**Released:** https://github.com/atomize-hq/ds-skills/releases/tag/v0.4.0 —
`isImmutable: true`, verified on the release object rather than inferred from a repo setting
(the repo object exposes no immutability field at all, so the T5 check could never have proved it).

Source `08f7cc8`, tag object `c3ec959` peeling to it. Eight assets. Read back from the draft and
digest-compared against the record committed here **before** publishing: 8 of 8 matched, no extras,
none missing. An independent re-stage was byte-identical, so the bytes T14 tested are the bytes
that shipped.

Public delivery exercised anonymously with no token: fetched `install.sh`, verified it against the
reviewed record **before executing it**, ran it, and it selected `macos_arm64`, installed to a
version-specific prefix, reported source `08f7cc8`, and answered `0.4.0` with
`[RAIL_SKILL_RELEASE] cli=v0.4.0 skills=v0.4.0` — no skew.

Late finding, settled before the push: the 16 unpushed commits carried a different author email
from the 8 already public. Both author and committer were rewritten to the public identity. That
cascaded further than metadata sounds like it should — `sourceCommit` is baked into both installers
and into the payload's `release.json`, so every digest moved and the candidate had to be rebuilt,
re-tagged and re-staged.

### T16b: Prove anonymous cold acquisition and provision every environment

**Description:** The release proof T5's mechanism proof could not give: a dummy package or a
workflow-supplied tarball proves installation mechanics, not that the approved artifact is
anonymously retrievable. The contract selection it used to carry is **T16a**, done in Phase 2.

**Acceptance criteria:**

- [x] Cold acquisition **of the exact release** succeeds with **no usable authentication**, fresh
      relevant caches, and **no existing rail installation** — from a clean checkout, via the
      pinned installer URL, with integrity verified against the reviewed record. A corrupted
      asset **fails** — see "How anonymity was proved" below
- [x] **Each required environment from T16a is provisioned.** E1/E2/E4 share one machine and one
      prefix (`just ds-skills-install`); E3 gets
      [`.github/actions/setup-ds-skills`](../.github/actions/setup-ds-skills/action.yml), used by
      the **three** jobs that invoke the rail rather than all eight — T16a §5.4 measured which
      three, and a job that provisions a tool it never runs proves availability of nothing. The
      count in this criterion predated that measurement
- [x] **The reviewed toolchain record is created here** — created at T15, **moved here** to the
      repo root where §10.4 always said it goes. Nothing read it until now, so this was the last
      free moment to fix the drift. The provisioning/execution behaviour that reads it is
      `scripts/lib/ds-skills.mjs` (resolve, never networked) and
      `scripts/lib/ds-skills-acquire.mjs` (acquire, explicit)
- [x] **Invocation binds to the installed, verified executable** — resolution is from the record's
      version at the version-specific path, and the action exports `DS_SKILLS` from what it read
      back off disk. `PATH` is never consulted; an ambient binary is never executed
- [x] The conditional-execution analysis is **re-confirmed against the live API**: run
      `31917271403` still reports 1–6 success, 7 **failure**, 8 **skipped**, and ruleset `main`
      (22410608) is still `active` requiring `Governance` + `Test All` on app `15368`
- [x] The enforcement path T16a named is **exercised** — PR
      [#1](https://github.com/atomize-hq/collider/pull/1), run `34174322072`.
      The `Set up ds-skills` step ran **green on a real runner inside the required `Governance`
      check**, all four sub-steps `outcome=success`. Its full green is T17's, not T16b's
- [x] The approved release's skill assets are staged **without being activated**: the payload
      carries `lib/skills/` with its own `RELEASE.json`, and two tests assert Collider still
      resolves its own skills from the checkout
- [x] Local provisioning documented — `docs/ds-skills-execution-contract.md` §7; pre-push acquires
      nothing, enforced by a test that walks the whole preflight recipe graph
- [x] Cache keys distinguish release, toolchain version and platform; a miss installs the same
      release. Node is **measured, not declared** — a job that quietly changed runtime would
      otherwise reuse an install made under a different one

**Verification:**

- [x] **Provisioning probes** succeed cold and warm and are measured: **cold 1078 ms** (acquires),
      **warm 207 ms** (verifies, acquires nothing)
- [x] `ds-skills --version` reports `0.4.0` in every environment reachable from this machine, and
      `skills` reports `cli=v0.4.0 skills=v0.4.0` — no skew
- [x] Negative cases all fail or use the intended release. Ten of them, each a way the pin could
      stop pinning while everything still looked green — the table is in the contract doc §7.4,
      the tests in `src/lib/tokens/ds-skills-provisioning.test.ts`, and six were additionally
      exercised end-to-end against the real release

> **Hold point** — the exact release is anonymously obtainable, every rail caller environment can
> execute it, and the required enforcement path is identified **and** exercised. **Held.**

**What the real runner proved, that no local test could.** From run `34174322072`, inside the
required `Governance` check:

```
Cache not found for input keys: ds-skills-Linux-X64-node22.23.2-v0.4.0-6b4ff9b2…
fetching https://github.com/atomize-hq/ds-skills/releases/download/v0.4.0/install.sh
verified install.sh against the reviewed record
ds-skills v0.4.0 installed
  asset       ds-skills-v0.4.0-linux_x86_64.tar.gz (linux_x86_64)
  executable  /home/runner/work/_temp/ds-skills/v0.4.0/bin/ds-skills
```

- **`node22.23.2`**, not the `'22'` the workflow declares — the key carries what ran, so a job
  that quietly changed runtime cannot reuse an install made under a different one
- **`linux_x86_64`** — the installer selected the platform asset itself; the same command picks
  `macos_arm64` on E1. Identical payload bytes make "it installed" a weak signal, so what is
  asserted is the **selection** (§10.5)
- Fetched **anonymously by a runner holding no credentials** for that release — the stranger's
  route, on infrastructure that is not this machine
- Job-local prefix under `RUNNER_TEMP`, 1.1 s, all four sub-steps `outcome=success`

**The job still fails, for the reason this task's own verification predicted.** `pnpm install
--frozen-lockfile` cannot clone `git@github.com:atomize-hq/figma-token-rail.git` — a runner has no
key for it, and every other job skips behind `Governance`. **T17 deletes that dependency
outright**, so repairing the URL here would be work T17 removes and would pull a dependency change
out of the atomic cutover it belongs to. This is the documented boundary between T16b and T17, not
a discovery.

**Two composite-action defects, found by distrusting my own test.** The local step-runner expands
`env.DS_SKILLS_PREFIX` in a `with:` — but it implements _my assumption_ about composite actions,
not GitHub's, so it could only ever confirm it. `d7992a2` moved the cache path onto a step output;
`f99f90c` passed the prefix explicitly to every step. Then the runner was taught to disable
`GITHUB_ENV` propagation entirely, and with it off the install still lands in `RUNNER_TEMP`.
Before the fix it would have landed in `~/.local/share/ds-skills`, cached an empty directory, and
looked exactly like success.

**How anonymity was proved, rather than assumed:** the cold install ran from a fresh `git clone`
under `env -i`, with a **deliberately invalid** `GITHUB_TOKEN`/`GH_TOKEN` in the environment. An
authenticated request carrying that token would have returned 401; it returned the asset. That is
an inverse control for anonymity, not an absence of evidence. The corrupted-integrity case ran
against the real network too: one hex character of the expected digest changed, the real
`install.sh` fetched, mismatch reported with both digests, **nothing executed and nothing
installed**.

**What installing the real release corrected:** the payload unpacks as `bin/` + `lib/`, so the
identity a consumer reads is at `lib/release.json` and `lib/skills/RELEASE.json` — not at the
install root, which is where the resolver was first written to look. A fixture built from the
layout this repo expected would have passed against a resolver that could never work. `SPEC.md`
§10.6 amended to record the layout and to say why the **pair** of files, not either alone, is what
makes the skew rule checkable at all.

**Identity is read, never executed.** Nothing is spawned to establish what an install is. The rule
"do not run an ambient binary to decide whether to trust it" is only implementable because the
payload carries its provenance as data.

**Getting a CI run at all was the constraint.** CI triggers on `pull_request` and on `push` to
`main`, the T16a ruleset made `main` PR-only, and there is no `workflow_dispatch` — adding one
would not help, since GitHub only honours that trigger for workflows already on the default
branch. So the branch had to be pushed and a PR opened, 182 commits ahead of `origin/main`. Done
with approval; PR [#1](https://github.com/atomize-hq/collider/pull/1).

**A note on cache hits.** A restored cache is not evidence. The provisioning step re-verifies the
tree against the record; a tampered cached identity was detected and **reinstalled** rather than
inherited. Proven by tampering with one, not by reading the code.

**Dependencies:** T15 (and T16a's selections)
**Files touched:** `ds-skills.release.json` (moved to root), `scripts/lib/ds-skills.mjs`,
`scripts/lib/ds-skills-acquire.mjs`, `scripts/install-ds-skills.mjs`,
`.github/actions/setup-ds-skills/action.yml`, `.github/workflows/ci.yml`, `justfile`,
`package.json`, `src/lib/tokens/ds-skills-provisioning.test.ts`, `SPEC.md` §10.6,
`docs/ds-skills-execution-contract.md` §7
**Scope:** M — **done.** `c64a88c`, `d7992a2`, `f99f90c`; exercised on run `34174322072`

---

### T17: Activate Collider's callers and delete what they supersede — ✅ **DONE**

**Description:** One atomic commit. Invocation changes, deletions, skill activation and the
lockfile change land together, because the intermediate states are not independently green — and
because a split-authority state, where some callers use the CLI and some use the local copy, is
the exact failure this migration exists to end.

**Rehearse before accepting.** T14's disposable-checkout rehearsal is the first pass; this is the
real one. The danger is not the L label, it is discovering a missing command semantic inside the
cutover, after the release is immutable.

**Acceptance criteria:**

_Activation — all of it, at once_

- [x] **Every** retained caller from T9 is switched, including the two the first draft missed:
      `summarizeCt8b()` in `reusable-component-status.mjs`, and the newly wired proof
      relationship check
- [x] `summarizeCt8b()` keeps its **mapping to a status rail** and loses all rail policy: it
      spawns the CLI and parses the §4.3 result. The other 611 lines of that generator are
      untouched, and the **unaffected portions of its report are compared before and after** to
      prove it — captured pre- and post-rewrite, `generatedAt` normalised, **byte-identical**.
      The only difference anywhere in the report is inside the CT-8B rail itself:
      `ledgerVersion:2` → `ledgerVersion:3`, caused by the data migration below, not by the
      rewrite. `freshness` and `outcome` are unchanged
- [x] ~~`figma/token-rail.expectations.json` created~~ — **superseded, see inventory §9.1.**
      `figma verify --expect` requires `summary` and `variables` inline and follows no `mapping`
      pointer; `figma baseline` owns the filename `token-rail.baseline.json` at both ends. The
      T1 baseline already has exactly that shape, so it **is** the expectations file. A second
      file would duplicate 1435 lines with nothing comparing them — the defect §5.5 exists to
      close, reintroduced to satisfy a name
- [x] `ds-skills figma verify` wired into `just preflight` **and into the required CI job named
      at T16a** — as `governanceSteps[5]`, so one wiring reaches both: preflight step 1/5 is
      `pnpm govern:tokens`, and so is the required `Governance` job
- [x] **The required job's artifact path is established**: `governanceSteps[2]` is `build:tokens`,
      which writes `design-tokens/dist/figma/tokens.json`; `figma:verify` is step 5 of the same
      `pnpm govern:tokens` process, in the same job, reading the artifact that process just
      produced from the commit under test. Not a committed copy — the artifact is gitignored;
      not another job's filesystem — no `download-artifact` precedes it; not a cache — nothing
      caches `design-tokens/dist`
- [x] The provisioned CLI and skill assets are selected without ambient fallback. **Measured**
      with a decoy `ds-skills` on `PATH` that prints on execution and an empty
      `DS_SKILLS_PREFIX`: `pnpm validate:sync-ledger` exits **2** with `[DS_SKILLS_UNAVAILABLE]`
      and the install command; `pnpm govern:tokens` exits 2; `summarizeCt8b()` reports
      `freshness: missing`, `outcome: unsatisfied`, `ct-8b-missing` — never satisfied. The decoy
      ran **zero** times, not even for `--version`
- [x] `just figma-plugin-build` calls the CLI; `scripts/build-figma-plugin.mjs` deleted

_Data migration — pre-computed at T14's rehearsal, so the cutover applies it_

- [x] `src/figma/sync-ledger.json` → `ledgerVersion: "3"` plus the `publication` binding. The
      digest was **recomputed at cutover** rather than trusted from the transcription, and came
      out identical: `1743b84408dd943480a49cd723186f8e82a75b74c917ecbabd150e0c01969167`. No fact
      changed; `dc97a26` is still the last commit to touch the artifact
- [x] Landed in the same commit as the code. Confirmed necessary rather than assumed: with the
      new wiring in place and the v2 ledger still on disk, `ledger validate` reported
      `[CT-8B_INVALID_LITERAL] ledgerVersion must be 3` and
      `[CT-8B_MATERIALIZATION_REQUIRES_PUBLICATION]`

- [x] **Effective enforcement, not a caller.** Each retained check was run through its mandatory
      gate with otherwise-valid data carrying one violation, then restored:

| check         | gate            | CLI entry point   | input                        | violation injected                                                       | result                                                                                 | restored |
| ------------- | --------------- | ----------------- | ---------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | -------- |
| CT-8B ledger  | `govern:tokens` | `ledger validate` | ledger + profile             | `tokensStudioCarrier: true`                                              | `[CT-8B_INVALID_TOKENS_STUDIO_CARRIER_COMBINATION]`, exit 1                            | exit 0   |
| CT-8B binding | `govern:tokens` | `ledger validate` | ledger + bound proof         | one second added to `attemptedAt`                                        | `[CT-8B_PUBLICATION_DIGEST_MISMATCH]`, exit 1 — while the proof alone stayed **valid** | exit 0   |
| CT-7B proof   | `govern:tokens` | `proof validate`  | proof + profile              | `destination.name: NotCollider`, digest re-satisfied so only CT-7B fails | `[CT-7B_PUBLISH_PROOF_INVALID_LITERAL]`, exit 1                                        | exit 0   |
| CT-15B parity | `govern:tokens` | `ledger parity`   | ledger + profile             | covered by the promotion-gate fixture pair                               | `outcome=deferred`, `ct8b-parity-deferred`                                             | —        |
| rail mapping  | `govern:tokens` | `figma verify`    | config + baseline + artifact | `summary.leafCount: 175`                                                 | `[RAIL_VERIFY_SUMMARY_DRIFT]`, exit 1                                                  | exit 0   |

**The integration edge, cut in a disposable tree.** `figma:verify` was removed from
`governanceSteps` while the validator itself was left untouched, and the baseline was set to an
absurd `leafCount: 999`. `pnpm govern:tokens` exited **0** — the gate dead, nothing noticing.
Restoring only the one step line, with the same absurd baseline, produced
`[RAIL_VERIFY_SUMMARY_DRIFT] leafCount is 176, the baseline records 999` and exit 1. Three
tests in `token-governance.test.ts` fail on the cut: they assert the ordered step ids and the
literal script commands, so the wiring is what is under test, not the validator.
No check was retired, so no retirement record is owed.

_Removal — nothing survives by living somewhere unusual_

- [x] Direct ledger-field reads, evaluator imports, the local parity implementation, the serve
      implementation, the baseline implementation, the moved skill executables and superseded
      wrappers are all removed — 9 scripts, 3 test files, 16 fixtures, the skill validator and
      its test
- [x] `src/lib/tokens/figma-token-rail.test.ts` deleted; the self-referential drift case not
      carried over anywhere
- [x] `@atomize-hq/figma-token-rail` gone from `package.json`; lockfile regenerated, all three
      edges removed. The pnpm-version-dependent git-dependency install ends here —
      `pnpm install --frozen-lockfile` no longer needs SSH access to a private repo, which is
      what was failing every CI run since the PR opened. **A fourth edge went with it**:
      `esbuild`, which the lockfile recorded as the rail's resolution suffix
      (`…#b00a82d8(esbuild@0.25.12)`) and which Collider carried as a direct devDependency only
      to satisfy the rail's optional peer. T14 removed that peer from the pack — the plugin
      bundle is prebuilt — so nothing was left to satisfy. `knip` had flagged it as unused on
      `HEAD` too, so this is the removal of a dependency whose reason to exist ended, not a
      regression this task introduced
- [x] **Inline workflow and task-runner bodies audited as well as files.** Every `run:` line in
      the 8 CI jobs and every `justfile` recipe re-read: the justfile calls `pnpm` scripts, the
      `pnpm` scripts call `node scripts/ds-skills.mjs` with arguments only. No algorithm moved
      into a recipe or a `run:` block
- [x] The generated-plugin exception stays narrow: `figma/plugins/collider-token-sync/` output is
      gitignored except its `README.md`; the builder source is deleted
- [x] **Skill cutover.** The release owns `stage-1-foundation-primitives-system`,
      `storybook-rigorous-spec-system`, `sync-quality-governor`, `schemas/` and `templates/`;
      Collider's forks of all five are removed. `scripts/link-ds-skills.mjs` writes generated,
      gitignored symlinks into the resolved install; `--check` compares the **resolved** target
      so a link written against an earlier release is caught rather than merely existing.
      Inverse-controlled both ways: `DS_SKILLS_LINK_STALE` against a repointed link,
      `DS_SKILLS_LINK_MISSING` against a deleted one. The canonical editing rule in
      `.agents/skills/README.md` is rewritten for two owners in one directory — and its claim
      that `.agents` is gitignored was stale, contradicted by `.gitignore` itself
- [x] Agent-visible skills belong to the selected release and carry no references to removed
      scripts. **The fork was already stale**: Collider's `schemas/sync-ledger.schema.json` was
      still v2 while the rail had moved to v3, and nothing in the repo could notice. That is the
      concrete failure the link replaces

**Verification:**

- [x] **S2** — both complementary tests. (1) **Artifact rejection**: `$themeOverrides` renamed so
      it leaks, in a scratch location `build:tokens` does not overwrite → four diagnostics
      (`leafCount is 198, the baseline records 176`; the `light` theme lost; 198 differing
      variables; 198 theme-incomplete), exit 1. (2) **Gate propagation**: `summary.leafCount`
      set to 175 in the committed baseline, then **unmodified** `pnpm govern:tokens` →
      `[RAIL_VERIFY_SUMMARY_DRIFT]`, exit 1, green again on restore. The mismatch survives
      `build:tokens` regenerating the artifact two steps earlier, because the baseline is not
      regenerated — which is what makes it persistent. The input read at verification time is
      `design-tokens/dist/figma/tokens.json`, written by `governanceSteps[2]` of the same process
- [x] **S4** — the manifest regenerated by `pnpm figma:plugin:build` through the CLI is
      byte-identical to the T1 baseline: sha256 `df45a8de…b928bc`, 373 bytes, independently
      recomputed after deleting the file. The plugin's `code.js` and `ui.html` do differ — the
      pack's bundle gained the drift-report feature between `figma-token-rail` v0.3.0 and
      `ds-skills` v0.4.0 — and both are gitignored, so neither enters the repo
- [x] **S1** — paths enumerated before contents (`git ls-files -z | xargs -0 grep -l`). It found
      a live import no inventory listed: `token-build-contracts.test.ts:9`. Four mentions of the
      retired package survive, all correct: `SPEC.md` (this migration's own spec), the two T1
      baselines (`railDependency` is provenance — what produced the reference), and one comment
      in `token-governance.mjs` naming the test the step replaces
- [x] `rm -rf node_modules && pnpm install --frozen-lockfile && just preflight` passes —
      262 unit + 458 Storybook tests, Rust clean. **Corrected after CI:** that run's `tsc` step
      was reading a stale `tsconfig.tsbuildinfo`. `tsconfig.json` sets `incremental: true` and the
      file is gitignored, so it survives `rm -rf node_modules` — a clean _install_ is not a clean
      _typecheck_. With the file deleted, `pnpm typecheck` reports two pre-existing errors in
      `message.tsx` and `reasoning.tsx`. See the parity note below; every rail-specific result
      above was re-measured after the correction and is unaffected
- [x] `node_modules/.cache/storybook` cleared before the run

**Two findings this task did not cause and did surface.** Recorded here because T17 is what made
them visible: `Governance` passing is what let `Quality` run at all, and it had been skipped in
every previous run of PR #1.

1. **`streamdown` resolves two `shiki` majors.** `streamdown@2.5.0` uses `shiki@4.4.3` while
   `@streamdown/code@1.1.1` pins `shiki@^3.19.0`, and the two `HighlightOptions` types are not
   assignable. Measured at `HEAD~1` with **its own** lockfile and no build info: the same two
   errors, in two files T17 does not touch. `@streamdown/code` is already at its latest version,
   so there is no clean upstream bump — the choice is an override, a downgrade of Collider's
   direct `shiki: ^4.4.3`, or a cast, and Collider uses `shiki` directly in six files of the
   code-block subsystem. That is a dependency decision, not a cutover detail.
2. **`just preflight` does not mirror CI for `tsc`.** CLAUDE.md's standard is "if it passes
   locally, CI passes". CI is always cold; a developer machine never is, and the build info is
   gitignored, so this specific class of failure can only ever be seen on CI. Deleting the file
   does not fix it — the check then simply fails locally too, blocking every push until (1) is
   resolved. The two have to be fixed together, in that order.

> **Hold point** — one consumer change switches all required callers and removes the superseded
> implementations, with no intermediate split-authority state. **Held.**

**Dependencies:** T16b
**Files touched:** 31 deleted, 3 new scripts, 2 new fixtures, `justfile`, `package.json`,
`pnpm-lock.yaml`, `.gitignore`, the ledger, `token-governance.mjs`,
`reusable-component-status.mjs`, 5 test files, 8 status fixtures, 7 docs
**Scope:** L — atomic by necessity. **Done.**

**What it changed about the plan, all discovered by executing rather than reading:**

1. **The expectations file is the baseline** (inventory §9.1). The pack owns the filename at both
   ends; a second file would have been duplication with no cross-check.
2. **One sync-ledger fixture was misdispositioned** (§9.2). Ten test the validator; one was input
   to a Collider gate test. The caller-graph pass looked for import edges, and a path string in a
   fixture-copy list is not one.
3. **An unlisted rail import** (§9.3), caught by the S1 enumeration, not by the inventory.
4. **The test workspaces were incomplete.** Both status-generator test workspaces copied the
   ledger without the proof or the profile. Under v3 that is not a valid workspace, and the gate
   said so — correctly, by reporting `ct8b-publication-unverified` rather than assuming.

---

> ### ✅ Checkpoint: The boundary holds — **reached**
>
> - [x] **S1** holds — enumerated by path; the four surviving mentions are the spec, two
>       provenance fields and one historical comment
> - [x] **S2** holds — both complementary tests, each with a rail-specific diagnostic
> - [x] **S3** holds — the drift check's expected side is the T1 baseline, never regenerated
>       during preflight
> - [x] **S4** holds — manifest byte-identical, independently regenerated
> - [x] `just preflight` green from a clean install

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
