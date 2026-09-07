# SPEC — Design-system tooling as an installable CLI

**Status:** in execution — Phase 1 complete (T1–T6), Phase 2 in progress (T7, T9 done).
Restructured 2026-09-06 after the round-4 review, the first with implementation evidence.
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

Testable conditions. Each states what it proves, because the first draft of several of these
proved less than their labels claimed.

| #   | Condition                             | How it is checked                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | Collider owns no executable rail path | The §5.1 disposition inventory is complete and every entry resolved. Grep for the old **and** new package names across `src/`, `scripts/`, `.agents/`, `justfile`, `package.json` and `.github/`. A name grep alone cannot detect copied logic.                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| S2  | The token gate still bites            | **Two tests (§7.2). An isolated worktree does NOT work** — that worktree's own preflight regenerates the artifact too. (a) _Artifact rejection_: the installed release rejects a corrupted artifact in a data-only fixture the build never overwrites. (b) _Gate propagation_: unmodified preflight **and the required CI job** fail on a persistent expectation mismatch, which the build does not regenerate. Both need a rail-specific diagnostic. Tool missing, input missing and malformed JSON are separate cases and substitute for neither.                                                                                                                                    |
| S3  | Rail output is unchanged              | Compare the **complete normalized mapping** — ordered names, types, collection and namespace, per-theme values — against a baseline captured before any move. Five summary fields are a diagnostic, not an equivalence proof.                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| S4  | The plugin manifest is byte-identical | Capture exact bytes and a digest **before T6**, from the current builder. Compare independently generated output byte-for-byte. A baseline regenerated by the new builder proves nothing.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| S5  | The retired mode is gone              | `grep -rn "rest-variables-oauth"` over tracked **sources**, generated output and the packed tarball. Exempt, because each must keep naming it: `archive/`, this spec, `tasks/`, `docs/consultations/`, and `scripts/fixtures/sync-ledger/outcomes.baseline.json` — the last is the frozen pre-retirement reference T9 reconciles against, so scrubbing the mode out of it would destroy the evidence the criterion exists to protect.                                                                                                                                                                                                                                                  |
| S6  | Both gates green                      | `just preflight` in Collider and `pnpm check` in the pack, the latter against a **clean independently installed release** — not a sibling checkout, a link, or an ambient global binary.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| S7  | `.agents` is actually gated           | A representative lint error and a failing test under `.agents/` each fail their gate, and a mis-formatted file fails prettier. A non-zero file count proves discovery, not enforcement. **The tsc leg is deliberately not proven in Collider**: `.agents/` is invisible to `tsc` because a `**` glob skips a leading-dot directory, and the only executable there moves into the package at T11 — so type coverage lands with the code, in the package's own `pnpm check`. Building a Collider-side tools config for a subtree that is leaving is the stale invariant this criterion warns against. Collider's own unchecked `scripts/**/*.mjs` is a separate, measured gap: **BL-5**. |
| S8  | CI needs no credentials               | All 8 jobs perform a **cold acquisition** of the CLI and run their gate. A green dependency-install step alone proves neither that the CLI installed nor that it ran.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

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

### 3.1 The pack repo — `atomize-hq/ds-skills`, renamed from `atomize-hq/figma-token-rail`

One name for one thing: the repository, the install URL and the command all read `ds-skills`.
The npm-era reason for a longer, self-describing package name went away with §10 — nothing
publishes to a registry, so the package name is now internal and the **repository** name is
the public identity. Verified free in the org before choosing it.

```
@atomize-hq/ds-skills
├── bin/ds-skills                 # the CLI entry point
├── src/
│   ├── cli/                      # command surface (§4.2)
│   ├── figma/                    # the absorbed rail: token-mapping, drift, plugin builder
│   ├── ledger/                   # CT-8B read/write/promote, parameterized by profile
│   └── verify/                   # artifact-vs-expectations checker
├── skills/                       # the 8 skills, shipped as data — BLOCKED, see below
├── schemas/                      # 5 portable JSON Schemas
├── profiles/                     # example.json only — a consumer's profile stays with the consumer
├── templates/
└── plugin/                       # code.ts, ui.html, manifest.template.json
```

Schemas stay **portable shapes**; profiles stay **repo vocabulary**. Porting means writing a
profile, never editing a schema.

Two corrections from the T11 disclosure review, both of which this section had wrong:

- **A consumer's profile does not ship from here.** `collider.json` stays in Collider as `data`
  (T9's disposition, which contradicted this diagram and was right). Shipping one consumer's
  vocabulary from a portable package reintroduces the coupling the migration removes, and would
  make a second consumer add its vocabulary to someone else's repository. The pack ships
  `profiles/example.json`, whose vocabulary is deliberately unlike any real consumer's so that a
  validator with baked-in values fails against it.
- **"That split already exists" was true of the constraints and false of everything else.** All
  five schemas named Collider — in every `$id`, in four `description` fields, and throughout
  `schemas/README.md`. No _constraint_ did, so the shapes really were portable, but the package
  would have published one consumer's namespace and worked examples. Fixed, and `pack-check` now
  fails if the **installed** schemas name a consumer.

**`skills/` is blocked on a licensing decision.** `ai-elements/` is 129 files including **80
vendored third-party `.tsx` sources with no recorded licence**. Private-repo use is not public
redistribution, and that decision is the user's. Several skills are also Collider documents rather
than portable ones. See [`docs/ds-skills-disclosure-review.md`](docs/ds-skills-disclosure-review.md)
§6.

### 3.2 Collider after

**Deleted (357 lines of executable rail code):**

```
scripts/lib/figma-variables-sync-enterprise.mjs   237
src/lib/tokens/figma-token-rail.test.ts            78
scripts/build-figma-plugin.mjs                     33
scripts/figma-variables-sync-enterprise.mjs         9
```

**Kept, and grows by four files (data only):**

```
figma/token-sync.config.json                          10   collection, artifact URL, namespace, plugin identity
src/figma/sync-ledger.json                            20   CT-8B ledger
figma/token-rail.expectations.json                    ~7   NEW — see below
figma/token-rail.baseline.json                      1435   NEW (T1) — the mapping the expectations file references
figma/plugin-manifest.baseline.json                   11   NEW (T1) — manifest bytes and digest, for S4
scripts/fixtures/sync-ledger/outcomes.baseline.json  207   NEW (T1) — the fixtures' pre-retirement outcomes, for T3
```

T1 also adds `scripts/capture-rail-baselines.mjs` (174 lines), which is **executable and calls
the rail** — exactly the class of file this migration exists to remove. It is a migration
instrument, not a standing gate: nothing in `just preflight` or CI runs it. It therefore owes a
disposition in the §5.1 inventory like every other executable path, and **S1 must not be
accepted while it survives unexamined**. The likely answer is that re-capturing a baseline
becomes a CLI command and the script is deleted, but that is T9's call, not T1's.

**The expectations file must carry the full expected mapping**, or explicitly reference a
baseline file that does. Five summary fields cannot express interior variable names, types,
collection and namespace bindings, or per-theme values — an interior token's light value can
change while all five stay identical. It keeps the summary constraints as well, so "full
mapping" does not quietly discard the default-theme assertion:

```json
{
  "summary": {
    "leafCount": 176,
    "firstLeaf": "accent/primary",
    "lastLeaf": "type/weight/semibold",
    "defaultThemeId": "dark",
    "themeIds": ["dark", "light"]
  },
  "mapping": "./token-rail.baseline.json"
}
```

The expected side comes from the T1 baseline and is **never regenerated from the current
artifact during preflight** — that would resurrect the self-referential test in a new form.

`figma verify` must also be bound to a **local artifact path**, separately from the plugin's
serving origin. The config carries an artifact URL for the plugin; a gate command must not
depend on a dev server or the network.

Moving these into JSON improves the failure mode: a changed value becomes a reviewable diff, not
someone editing a test to go green.

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

Nine commands. Four of them — `ledger parity`, `proof validate`, `figma serve`,
`figma baseline` — were discovered at T9 and are not optional extras: without them Collider
cannot reach zero rail executables, and a release cut without them is **immutable and
incomplete**.

| Command                                                      | Reads / writes                      | What the caller consumes      |
| ------------------------------------------------------------ | ----------------------------------- | ----------------------------- |
| `ds-skills figma plugin build --config <path>`               | reads config, **writes** plugin out | exit status                   |
| `ds-skills figma verify --config <path> --expect <path>`     | read-only                           | exit status + rail diagnostic |
| `ds-skills figma drift --config <path>`                      | read-only                           | exit status                   |
| `ds-skills figma serve --config <path>`                      | read-only, **long-running**         | dev command, never a gate     |
| `ds-skills figma baseline --config <path> --out <path>`      | **explicitly mutating**             | exit status                   |
| `ds-skills ledger validate --ledger <path> --profile <name>` | read-only                           | exit status, **or `--json`**  |
| `ds-skills ledger parity --ledger <path> --profile <name>`   | read-only                           | exit status                   |
| `ds-skills proof validate --proof <path> --profile <name>`   | read-only                           | exit status                   |
| `ds-skills validate <schema> <instance> [--profile <path>]`  | read-only                           | exit status                   |

The last already exists as `scripts/validate-artifact.mjs` and moves behind the CLI unchanged.

`ledger parity` stays **independently invocable** rather than becoming a side effect of
`ledger validate`: `pnpm validate:figma-parity` is its own governance step with its own policy
module, and collapsing it would quietly retire a governance step under cover of a refactor.

**Every command reads data and exits non-zero on failure.** No command imports from the
consuming repo, and no consuming repo imports from the pack. That is the entire architectural
constraint, and every review of this work should check it first.

One qualification, because the literal wording is wrong otherwise: **generated output does
cross.** The CLI writes `code.js`, `ui.html` and `manifest.json` into Collider. Those are
package-owned generated artifacts, never consumer-maintained source. Equally, invoking a
command from `just` is orchestration — it is not licence to reimplement validation or policy
logic in shell, in a `justfile` recipe, or in an inline CI `run:` body.

### 4.3 `--json` is a versioned interface, not a formatting flag

`summarizeCt8b()` consumes structured results, so `--json` is a contract another program is
written against. It carries the obligations of one:

- **A declared result schema with its own version field**, independent of `ledgerVersion` and of
  the release version. A consumer that sees an unsupported result version must fail, not
  best-effort parse.
- **Stable diagnostic codes.** The `[CT-8B_…]` / `[CT-7B_…]` identifiers are the interface;
  their prose is not. Renaming a code is a breaking change.
- **Deterministic ordering** wherever a list is emitted, so a diff is a real difference.
- **stdout carries the result and nothing else.** No progress text, no human commentary, no
  banner. Diagnostics and logs go to stderr.

**Distinguish "evaluated, and it does not conform" from "could not evaluate."** This is the
failure mode that keeps CI green while the gate is dead. A completed evaluation reporting
nonconformance must still emit a valid, parseable result carrying its diagnostics. A missing
executable, malformed output, an unsupported result version, a crash or a timeout must **never**
be projected as an empty rail, "not applicable", or a pass.

Exit codes follow project convention, but each meaning is explicit and documented. A subprocess
helper that throws on a non-zero exit must not discard the structured failure report the caller
needs — the report is the point of the call.

### 4.4 Input and side-effect semantics — must be specified, not assumed

Each command needs these pinned down before it is implemented, because the current signatures
do not answer them:

- **Where does `figma drift` get observed state?** If it needs a live Figma session or the
  local proof server, then it is not a gate command. Offline `just preflight` must never
  depend on a dev server or network access to Figma.
- **Does each command read, write, or both?** The table in §4.2 is the answer, and it is
  binding: **checks are read-only**. Validation must not quietly rewrite a proof, a ledger, a
  baseline or a generated artifact in order to pass. `figma baseline` is the one explicitly
  mutating command, and its capture mode is distinct from its verify mode.
- **`figma serve` needs its own contract**: bind address, readiness signal, behaviour on an
  occupied port, shutdown, and which resources it exposes. It serves the artifact the config
  names — it must not become a generic static server for a consumer checkout because that is
  the easiest port. The URL the built plugin embeds and the endpoint `serve` exposes must agree
  by construction, not by coincidence.
- **A substituted URL is not a usable URL.** The generated manifest declares
  `networkAccess.allowedDomains: ["none"]`, which permits **no** external requests, and
  `devAllowedDomains` applies during plugin development only. So a consumer pointing
  `artifactUrl` at a hosted origin gets a correctly substituted plugin that cannot fetch it.
  Right for Collider's localhost workflow; an undocumented wall for anyone else. Generated
  endpoint, manifest permissions and `serve` behaviour are one contract and are tested together
  — byte identity of the original manifest is the success criterion for the **original**
  configuration only, never for a different network configuration.
- **Path resolution.** Config-relative or working-directory-relative, stated per option. Test
  from outside the repository root, from a nested directory with an explicit root, and from an
  install path containing spaces.
- **Repository-root discovery, and what happens without one.** `--help` and `--version` must
  work outside any consumer repository.
- **Profile resolution.** `--profile <name>` and `--profile <path>` are different contracts.
  Unknown profile must fail loudly rather than falling back to a default.
- **Profiles stay data.** No executable callbacks, no embedded scripting escape hatch.
- **Time is an input.** Staleness evaluation takes an explicit clock so tests are deterministic,
  and a single invocation evaluates one coherent snapshot rather than re-reading files that may
  change between phases.
- **Installed-resource lookup.** Schemas, templates and skill assets resolve from the install
  prefix, never from a sibling checkout, the consumer's `node_modules`, or ambient tooling. A
  declared runtime prerequisite is acceptable; an accidental one is a defect.

### 4.5 Configuration ownership — portable invariants versus consumer expectations

Two kinds of value are currently tangled together in the validators, and the distinction decides
what may be configured:

- **Portable invariants** are properties of the contract itself: `ledgerVersion` must be the
  supported version, `tokensStudioCarrier` must agree with `mode`, a retired publish mode is
  rejected. A profile must **never** be able to re-enable a retired mode or override an
  invariant. Configurability must not become a route around a portable prohibition.
- **Consumer expectations** are properties of one repository: destination name, Figma file key,
  artifact path, promotion levels, exception codes. These move into declared JSON with an owner,
  a requiredness rule and validation behaviour.

The generalization rule, stated so it cannot be satisfied the lazy way: **an expected value comes
from the profile or configuration, never from the record being checked against it.** Comparison
stays literal equality against a declared expectation. Portability is _not_ achieved by relaxing
`requireLiteral` into "any string is acceptable" — that deletes the check and calls it a feature.

The four constants known to need this treatment, all enforced today by `requireLiteral` against a
Collider-specific literal:

| Constant                   | Enforces                      | Today                                    |
| -------------------------- | ----------------------------- | ---------------------------------------- |
| `publishProofPilotName`    | `proof.destination.name`      | `'Collider'`                             |
| `publishProofPilotFile`    | `proof.destination.figmaFile` | `'figma://file/<Collider file key>'`     |
| `publishProofArtifactPath` | `proof.artifact.path`         | `'design-tokens/dist/figma/tokens.json'` |
| `syncLedgerArtifactPath`   | `ledger.artifact.path`        | same literal, separately declared        |

That last row is the tell: the same fact is pinned twice, from two modules, with no check that
the two agree. §5.5 is about that class of defect generally. Both validators must also be audited
for the same pattern in **defaults and error-message text**, not only in the checks.

## 5. Ownership closure

### 5.1 The disposition inventory — do this before implementing

The deletion list in §3.2 does not establish "every executable rail path", and the plan can
otherwise complete every task while Collider still owns rail logic. Two surviving files make
this concrete: `scripts/lib/sync-ledger.mjs` and `scripts/lib/publish-proof.mjs` are _edited_
by the retirement work but never given a final home.

Before any package implementation, produce an inventory. For every entry point, helper, test
driver and generator carrying rail semantics, record its **present callers** and exactly one
disposition:

| Disposition     | Meaning                                            |
| --------------- | -------------------------------------------------- |
| `package-owned` | The implementation moves; Collider calls a command |
| `data`          | It becomes JSON that a command reads               |
| `command-only`  | Collider keeps an invocation, nothing more         |
| `deleted`       | It goes with the retired rail                      |

Cover at minimum `pnpm validate:sync-ledger`, publish-proof validation, the policy tests, and
any governance generator that calls those validators. **Extract the rail-specific policy from a
generator rather than claiming the whole generator** — unrelated product logic stays.

### 5.2 The eleven ledger fixtures

Freeze their expected post-retirement outcomes **and diagnostic reasons** before rewriting
anything. Pass/fail alone is not enough: the contradictory-carrier fixture must not appear to
pass because it now fails earlier for an unrelated reason. That reconciliation is done: T1
captured the pre-retirement outcomes, T9 froze the post-retirement table, and two fixtures moved
in one field each with no diagnostic changed.

**A second reconciliation is coming, and it must stay separately reviewable.** §5.5 adds a proof
binding to the ledger schema, which changes fixture inputs again. Keep the two causes apart in
the record: a change caused by the retirement (T3, already frozen) and a change caused by
relationship enforcement (T12) are different claims, and neither may absorb the other. A
regression must not become explicable as "part of the move", and a newly required check must not
be smuggled in by rebaselining. Every outcome that changes names its cause, or it is a defect.

The five publish-proof fixtures carry the same obligation, and they gain cases the current set
has no reason to contain: each record individually valid while their shared claims disagree.

### 5.3 Skill materialization — unresolved, and blocking

The pack currently lives at `.agents/skills/` with `.claude/skills/` symlinks into it, under a
standing rule to edit only in `.agents`. If that directory starts holding installed package
assets, the rule is wrong and there are two independently editable copies.

Settle before anything moves: canonical editing location, materialization location, tracked or
generated, release identity, stale-copy handling, and symlink behaviour. **The CLI and the
materialized skills must share one release identity** — otherwise an agent reads instructions
for one command contract while executing another.

### 5.4 Which CI job enforces this

`figma-token-rail.test.ts` currently runs in CI through `just test-all`. Deleting it removes a
CI gate, and **no CI job runs `just preflight`** — that is the pre-push hook only.

The eight jobs in `.github/workflows/ci.yml`, with the check context each emits (GitHub uses the
job's `name:`, which is not always its id) and the gate command it actually runs. Triggers are
`pull_request` on any branch and `push` to `main`:

| #   | job id                         | check context                | `needs`                         | gate command                               |
| --- | ------------------------------ | ---------------------------- | ------------------------------- | ------------------------------------------ |
| 1   | `governance`                   | Governance                   | —                               | `pnpm govern:tokens`                       |
| 2   | `storybook-proof`              | Storybook Proof              | `governance`                    | `pnpm govern:storybook-proof`              |
| 3   | `quality`                      | Quality                      | `governance`, `storybook-proof` | `just check` + `just loc`                  |
| 4   | `test-all`                     | Test All                     | `quality`                       | `just test-all`                            |
| 5   | `build-next`                   | Build Next.js                | `quality`                       | `pnpm build`                               |
| 6   | `build-storybook`              | Build Storybook              | `quality`                       | `pnpm storybook:build`                     |
| 7   | `chromatic-review`             | chromatic-review             | `build-storybook`               | Chromatic publish — **conditional**        |
| 8   | `reusable-component-promotion` | Reusable Component Promotion | `chromatic-review`              | `pnpm govern:reusable-component-promotion` |

Three of them touch the rail surface — **1** (the ledger and parity validators, through
`governanceSteps`), **4** (`figma-token-rail.test.ts`), and **8** (the CT-8B status rail, through
`summarizeCt8b()`) — but **only two of them enforce it.** Job 8 reports. Measured in
[`docs/ds-skills-boundary-contract.md`](docs/ds-skills-boundary-contract.md) §2.3: CT-8B reaches
`blockingReasons` only when `consumer === 'release'`, and CI passes `consumer: ci`; and blocking
mode itself is unreachable because CI passes `changeClass: unknown`, which makes the change class
`heuristic` rather than `explicit`. The replacement must keep **two gates biting and one report
accurate** — a smaller claim than "keep all three biting", and the accurate one.

**Measured against the live repository on 2026-09-06, and it is worse than the workflow reads.**

_There was no required check; T16a created one._ `main` was **not protected**
(`/branches/main/protection` → 404) and the repository had **zero rulesets** (`/rulesets` → `[]`),
so every job was advisory. Repository ruleset **`main` (id 22410608)** now requires `Governance`
and `Test All`, pinned to the GitHub Actions app, with an empty bypass list. Direct pushes to
`main` are consequently rejected — everything goes through a pull request.

_`Reusable Component Promotion` is deliberately **not** required._ GitHub documents that
successful check statuses are "success, **skipped**, and neutral", so a job skipped by a failed
`needs:` reports **Success** to a required check. Requiring job 8 today would install a check that
passes without running — this migration's own failure mode, at the enforcement layer. It stays
advisory until BL-2 lets it run. (Inverse trap, same source: a skipped _workflow_ stays **Pending**
and does block. Jobs and workflows behave oppositely.)

_Job 7's fork guard is unreachable._ The repository is private with `allow_forking: false`, so
`github.event.pull_request.head.repo.fork` is always false and the `if:` never skips job 7 for
that reason. The guard is a latent hazard, not a live one — it activates the day forking is
enabled.

_Job 8 skips anyway, by a different mechanism._ `needs: chromatic-review` means job 8 is skipped
whenever job 7 does not succeed — and **job 7 currently fails**, on the unaccepted visual
baselines tracked as BL-2. The most recent `main` run (`31917271403`) is unambiguous:

```
success  Governance          success  Build Next.js
success  Storybook Proof     success  Build Storybook
success  Quality             failure  chromatic-review
success  Test All            skipped  Reusable Component Promotion
```

So **the CT-8B status rail is not being enforced in CI at all**, and has not been since Chromatic
started failing. `summarizeCt8b()` — the caller T9 found, and the reason `--json` exists — runs
inside a job that does not run. A `skipped` conclusion is not a `failure`, so nothing surfaces it.

Three consequences, none optional:

- The replacement rail verification goes in a job **upstream of Chromatic** — realistically job 1
  `governance` or job 4 `test-all`, which is where the protection lives today anyway. Placing it
  downstream would inherit a gate that is already inert.
- **"It is a required check" is not evidence its commands ran**, and here not even evidence the
  job ran. Enforcement evidence must name the workflow file, job id, emitted check context,
  trigger conditions, required-check or ruleset binding, **and** the conditions under which the
  job does not execute — including an upstream `needs:` failure.
- **S8 has a binding to turn red.** Demonstrating a red job is not demonstrating a blocked merge,
  which is why the ruleset had to exist first. T18 names ruleset `main` (22410608) and the context
  it turns red — `Governance` for a proof–ledger disagreement, since the validators run in job 1.

The emitted check contexts are confirmed against the live check-runs API and are the `name:`
values, not the job ids: `Governance`, `Storybook Proof`, `Quality`, `Test All`, `Build Next.js`,
`Build Storybook`, `chromatic-review`, `Reusable Component Promotion`.

### 5.5 The proof and the ledger — two records, one checked relationship

`src/figma/publish-proof.json` (CT-7B) and `src/figma/sync-ledger.json` (CT-8B) restate the same
publication facts, and **nothing compares them**. T9 found the proof validator has no caller at
all; the deeper defect is that even wiring it would leave both records independently authored.

**Keep both records.** They have different responsibilities:

- **The proof is an attestation** about one publication: what someone says they imported, into
  which destination, at which artifact revision.
- **The ledger is governance state**, including whether that attestation supports the state the
  ledger currently claims.

Collapsing them would remove one duplication opportunity without establishing that publication
happened, and would erase the distinction between source evidence and governance assessment.
Removing redundant ledger fields may become right once their consumers have migrated; it is not
a prerequisite for this extraction.

**The rule: the ledger's duplicated facts become a checked projection of an explicitly identified
proof, not independent authority.** The five duplicated facts, measured:

| Fact                  | Proof                    | Ledger                                                    | Today                                                         |
| --------------------- | ------------------------ | --------------------------------------------------------- | ------------------------------------------------------------- |
| artifact path         | `artifact.path`          | `artifact.path`                                           | both `requireLiteral`, two separately declared constants      |
| artifact revision     | `artifact.gitSha`        | `artifact.revision` / `verification.lastVerifiedRevision` | ledger self-checks; no cross-record check                     |
| publish mode          | `mode`                   | `publish.mode`                                            | same enum, two declarations                                   |
| Figma destination     | `destination.figmaFile`  | `publish.figmaFile`                                       | proof pins a literal; **ledger accepts any non-empty string** |
| materialization state | `materialization.status` | `verification.materializationStatus`                      | different value sets; no cross-record check                   |

A sixth pair — `proof.carrier.used` and `ledger.publish.tokensStudioCarrier` — is checked against
`mode` **within** each record and never **across** them. T8 rules it in or out explicitly; it is
not left to be noticed at implementation time.

**Binding.** The ledger names the proof it projects, unambiguously — a source reference plus an
exact binding (digest, or an equivalent that cannot match a different record). "Find the proof
file and compare whatever is there" is not a binding. This adds a required field, which is a
schema change with a version consequence and a **second** fixture reconciliation; §5.2 says how
that stays honest.

**History is not currentness.** A valid attestation about revision A does not become false when
tokens advance to revision B. It ceases to _support a ledger claim that B is materialized_. The
gate must therefore check two separate things:

1. The shared claims **agree for the exact referenced publication**.
2. That publication is **sufficient for the ledger's present claim**, under the existing
   staleness and promotion rules.

Never repair a disagreement by rewriting the attestation to match the ledger, and never copy
either record onto the other. A stale proof is a real signal.

**Absence has a defined meaning.** A repository that makes no materialization claim may
legitimately carry no proof. A ledger claiming successful or current materialization must not
pass by omitting one. A present but malformed or contradictory proof is a failure, never an
ignorable one.

**What the gate proves, and what it does not.** It can establish that an attestation is
well-formed, refers to the expected destination and artifact, and consistently supports the
ledger's claims. It cannot establish that the claimed human import happened, or that the remote
Figma file still holds those values. The CLI and the status output must say _validated
attestation and consistency_ — not observed remote synchronization. That limit is not a reason to
delete the proof or to restore the retired REST rail; it is the reason the retired rail's absence
costs nothing here.

## 6. Code style

- Follow each repo's existing configuration. Collider: single quotes, 100 columns. The pack:
  double quotes, 80 columns. **Do not unify them** — the 107-line `ui.html` diff between the
  two today is entirely this, and it is noise, not a defect.
- LOC guards apply in Collider (TS/TSX 300, Rust 400). **The pack must adopt a lint gate and
  the same LOC guard** as part of taking ownership of the code; it has formatting, typecheck,
  tests and packing today, but no linting.
- `moduleResolution: NodeNext` in the pack, with explicit `.js` specifiers on every relative
  import. TypeScript does not rewrite extensionless imports on emit; this already shipped a
  build that vitest resolved and Node could not load.
- Errors carry a phase (`auth`, `ledger`, `artifact`, `transport`) so a caller can distinguish
  a misconfiguration from a rail failure. Preserve this when the ledger mechanism moves.

## 7. Testing strategy

### 7.1 Baselines, captured before anything moves

Captured by `pnpm baseline:rail`, which runs the current builder and the current validators and
writes three committed artifacts. Its output is deterministic — no timestamp, absolute path or
host identifier is recorded, and it prettier-formats what it writes — so re-running it on an
unchanged tree produces no diff. That is the verification: run it twice, the tree stays clean.

- **Manifest bytes and digest**, from the _current_ builder, before T6 touches it →
  `figma/plugin-manifest.baseline.json`. Nothing is excluded: the manifest is a static template
  with three config substitutions and interpolates no generated field, so S4 stays a literal
  byte comparison rather than a comparison of a filtered subset.
- **The full normalized rail mapping** — ordered names, types, collection and namespace,
  per-theme values — not the five summary fields → `figma/token-rail.baseline.json`. It keeps
  the summary too, so "full mapping" does not quietly discard the default-theme assertion.
- **The 11 ledger fixtures' current outcomes and verbatim diagnostics**, before T3 edits their
  inputs or validators → `scripts/fixtures/sync-ledger/outcomes.baseline.json`.

All three are the reference for S3, S4 and T9's reconciliation. A baseline regenerated by the
new code is not evidence.

### 7.2 The S2 trap, and why an isolated worktree is not the fix

`pnpm govern:tokens` is **preflight step 1 of 5**, and `scripts/lib/token-governance.mjs`
registers `build:tokens`. A perturbed `design-tokens/dist/figma/tokens.json` is therefore
regenerated before any verify step observes it.

An isolated worktree does not avoid this — **that worktree's own preflight regenerates the
artifact too.** It isolates the blast radius, not the overwrite. Two complementary tests are
needed instead:

1. **Artifact rejection.** Run the installed release directly against a deliberately corrupted
   artifact placed in a data-only fixture location the build does not overwrite. This proves the
   verifier detects the fault.
2. **Gate propagation.** Run _unmodified_ preflight with a **persistent** mismatch — an altered
   expectation, which `build:tokens` does not regenerate — and confirm the real installed
   verifier runs, reports it, and fails the gate.

Injecting a mutation after generation and before verification is also valid, provided it does
not replace or stub the verifier. Whichever is used, the evidence must identify **the actual
input read at verification time**.

Missing tool, missing input and malformed JSON stay separate negative cases. None of them
demonstrates that a semantic token regression is caught.

**And the gate has to be a CI gate.** No CI job runs `just preflight` — it is the pre-push hook,
and CI runs the constituent parts as separate jobs. `figma-token-rail.test.ts` runs today inside
`just test-all`, which **is** a CI job. Wiring the replacement into preflight alone would move
that protection out of CI while every job stayed green. The replacement must land in a named
required job, and §5.4 is where that mapping lives.

### 7.3 `pack-check` must stop hiding the defect it exists to catch

`scripts/pack-check.sh` runs `pnpm add "$tarball" esbuild`. It installs the optional peer
explicitly, so it proves the plugin builds _when a consumer already has esbuild_ — never that a
plain install can. npm does not auto-install optional peer dependencies, so a successful
`ds-skills` install does not establish that `figma plugin build` runs.

**The Releases installer is the clean answer** (§10): bundle the builder into the published
asset so a consumer installs a finished artifact rather than a dependency tree npm may leave
incomplete. Failing that, prebuild the invariant plugin code at release time and do only
config-dependent assembly at command time. **Never resolve the builder from Collider.**

esbuild ships platform-specific binaries, which the release-asset route handles explicitly —
per-platform assets, each checksummed — where an npm optional peer does not.

Expand `pack-check` rather than adding a parallel gate. Its decisive scenario:

> A clean, data-only consumer directory outside both checkouts — no product dependencies, no
> repository credentials, no ambient builder. Install the selected release and exercise every
> command with valid **and invalid** inputs.

Then repeat against real Collider data, and against a **second consumer configured differently**
— different namespace, paths, origin, plugin identity and profile vocabulary. Copying Collider's
layout under another directory name proves nothing about portability.

### 7.4 Ownership

- **Pack** owns rail unit tests against its own fixture — flattener, comparator, theme
  resolution, `$themeOverrides`.
- **Collider** owns only what its data can assert, through JSON plus the verify command.
- Delete the self-referential drift case rather than moving it.
- **Moving `$themeOverrides` into a package fixture can lose integration protection.** Where the
  existing test constrains Collider's real generated artifact, keep that through the CLI's
  real-data verification.
- JSON expectations are still editable. Moving a constant out of TypeScript improves the
  ownership boundary, not its resistance to being changed to make CI pass.

### 7.5 What counts as evidence

The author running the tests is not the problem. **Circular evidence** is. Three questions
separate them, and every completion claim in this work has to answer all three:

- Do the expected and the actual result have **independent origins**? A stored pre-change
  baseline, a hand-asserted fixture and a required CI job rejecting a deliberately introduced
  contradiction all qualify. A verifier that regenerates its own expectations does not.
- Is the **exact artifact** identified? Exercising a different build from the one distributed
  proves something about neither.
- Can **someone else replay it**? A one-off command in a transcript is not a gate.

Comparing two records that merely agree with each other is not verification either — that is the
defect §5.5 exists to fix, restated as a testing rule.

**Completion is four separate claims, and a task may hold some without the others:**

| Claim                                 | Means                                                                |
| ------------------------------------- | -------------------------------------------------------------------- |
| **implemented**                       | The behaviour exists and its contract is written down                |
| **regression-tested**                 | A durable test pins it, and the test fails when the behaviour breaks |
| **installed-artifact-tested**         | Proven through the distributed artifact, not the source tree         |
| **consumer-enforcement-demonstrated** | A real required CI path runs it and can be shown to go red           |

T5 is contract-complete without delivery being proven. T7 is rename-complete without acquisition
being proven. Marking either "done" without the qualifier is the overclaim this table prevents.

### 7.6 Known trap

A stale `node_modules/.cache/storybook` produced 18 `SyntaxError` failures that were
misdiagnosed as a dependency conflict, and a release shipped with a false causal claim in its
commit message. **Clear that cache before blaming a dependency change for test failures.**

## 8. Boundaries

### Always

- Keep `just preflight` green, and keep it able to fail. Both.
- Verify against real Collider data before and after every structural move, using the §7.1
  baselines.
- Regenerate governance artifacts through their generators. Never hand-edit generated JSON.
- Add an entry to `src/components/upstream-policy.json` for any deliberate divergence from an
  upstream component, and treat a failing rule as a decision to make, not a line to delete.

### Ask first

- **Publishing the pack.** Outward-facing and effectively irreversible. Note that publishing the
  npm package does **not** require making the source repository public — keep those two
  approvals separate.
- Changing the shape of `src/figma/sync-ledger.json` or the promotion levels.
- Removing a publish mode beyond the one decided here.
- Any change that weakens what `just preflight` catches, even temporarily.
- Renaming the tooling repository — it invalidates the recorded dependency URL.

### Never

- Run the Enterprise REST rail against the real Figma file. It **DELETEs and recreates** the
  collection, destroying `VariableID`s and every paint binding. It is being removed precisely so
  this cannot happen by accident.
- Re-run a registry CLI over an existing vendored component, or use `shadcn add --overwrite` as
  an upgrade path.
- Vendor a second copy of the flattener. That duplicate existed once and silently drifted,
  losing the `dimension` token type.
- Make `just preflight` depend on network access, a dev server, or a live Figma session.
- Roll back by restoring the retired mode. Roll back by explicit version selection.
- Leave a false causal claim in a commit message after finding out it was wrong.

## 9. Sequencing

Four phases. The governing correction over the first draft: **publication and provisioning come
before consumer activation**, because the moment `just preflight` requires `ds-skills`, every
environment that runs it must already be able to get it.

1. **Baselines, gate coverage, retirement, delivery contract.** Capture §7.1 baselines; wire
   `.agents` into the gates; retire the mode as one atomic change; fix the plugin UI
   configuration; decide how the CLI is delivered.
2. **A complete, self-contained package.** Rename, move, implement every promised command,
   transfer tests, prepare skill assets without breaking their consumers yet — and settle the
   execution contract (supported platforms, runtime prerequisites, install location, and the
   real enforcement checks) **in this phase**, because those choices decide what the release must
   contain and an immutable release cannot be amended afterwards.
3. **Distribution and consumer cutover.** Publish, prove anonymous cold acquisition, provision
   every environment, then switch callers and delete superseded code and the dependency.
4. **Clean-environment evidence and closure.** Full CI acceptance, all criteria, residual audit,
   backlog closure.

Task-level detail, dependencies and checkpoints are in [`tasks/plan.md`](tasks/plan.md) and
[`tasks/todo.md`](tasks/todo.md).

## 10. Delivery contract

Settled at T5. The governing principle: **provisioning and execution are separate operations.**
Provisioning installs one exact reviewed release and may reach the network. Execution runs that
binary and resolves nothing — no registry, no `latest`, no PATH lookup.

### 10.1 The mechanism, and the one thing the reference gets wrong

Distribution is a GitHub Releases installer script, following
`atomize-hq/substrate/scripts/substrate/install.sh` and its PowerShell twin. The repository is
public as of 2026-09-06; anonymous, token-free access to both `raw.githubusercontent.com` at a
tag and `releases/download` was verified, so the delivery path is proven rather than assumed.

**The reference's bootstrap does not learn its version from the tag in its own URL, and this is
now measured rather than argued.** Fetching `scripts/substrate/install.sh` anonymously at
`v0.2.6` and at `v0.2.8` returns **byte-identical files** — same 4458 bytes, same SHA-256 —
and neither contains its own tag anywhere. Version selection happens entirely at runtime:
`--version=` if supplied, otherwise `releases/latest`, which resolves to `v0.2.8` today. So
`curl …/v0.2.6/install.sh | bash` installs **v0.2.8 right now** — not "after latest moves".
Under `curl … | bash` there is no argv and no `BASH_SOURCE`, so a copied one-liner cannot carry
a pin the script can read.

**Our contract removes the ambiguity instead of documenting around it: the bootstrap is a
release asset, not a repository file.**

```bash
curl -fsSL https://github.com/atomize-hq/ds-skills/releases/download/v0.4.0/install.sh -o install.sh
# CI: verify install.sh against the reviewed record, then execute. Never pipe.
bash install.sh
```

The asset is generated at release time with its release identity baked in, so URL and content
agree by construction, and immutable releases make the asset unswappable. There is **no
`--version` flag**: the asset _is_ the version, so there is nothing to disagree with. Installing
a different version means using that version's URL. The bootstrap hard-fails if its baked
identity is empty — a bootstrap that does not know what it is must not guess.

The `curl … | bash` one-liner stays documented for humans, with `set -o pipefail`, because a
failed `curl` feeding empty stdin to bash exits 0 and `set -e` inside a script that never
arrived cannot help. **CI never pipes**: it downloads, verifies, then executes.

### 10.2 Two deliberate divergences from the reference

Recorded so nobody later "fixes" them back into alignment:

- The reference **warns and skips** when `SHA256SUMS` is missing (`install-substrate.sh:2330,
2337`). Ours **fails**. A tool that gates CI cannot treat missing integrity as a warning.
- The reference **falls back to `main`** when it cannot resolve a release tag. Ours **hard-fails**.
  A resolution failure or a cache miss installs the pinned release or nothing, never a floating
  ref.

### 10.3 Trust chain

The bootstrap executes before anything it downloads is verified, and a `SHA256SUMS` published
beside the archive is self-consistency: whoever can replace the archive can replace its
checksum list. So the independent anchor is **Collider's reviewed record**, and the chain is:

1. Collider's reviewed record pins the bootstrap's own digest. CI verifies it **before** executing.
2. The bootstrap verifies each downloaded asset against the reviewed record's per-platform digest —
   not against whatever `SHA256SUMS` accompanies the download.
3. `SHA256SUMS` remains published, and a mismatch against it fails, but it is a consistency check
   layered on top, never the anchor.

The negative test is therefore a **modified asset with a matching modified `SHA256SUMS`**,
rejected against the reviewed record. A merely corrupted archive proves only that the weaker
check works.

**GitHub immutable releases: enabled 2026-09-06**, verified `{"enabled": true,
"enforced_by_owner": false}`. It locks the tag to its commit and prevents asset modification after
publication — the tag/commit binding is not something an installer can enforce for itself.

Three operational details that decide when this had to happen:

- It is **not** on the repository object and **not** a `gh repo edit` flag. It has its own
  endpoints: `GET`/`PUT`/`DELETE /repos/{owner}/{repo}/immutable-releases`.
- **Only releases created after enabling are immutable.** Existing ones stay mutable unless
  republished, which is why this was enabled now rather than at T15 — enabling it after cutting
  v0.4.0 would have left §10.3's trust chain resting on a tag that could still move.
- The setting survives the T7 rename, so the order of those two does not matter.
- **It also forbids adding, replacing or deleting an asset after publication.** That is an
  assembly constraint, not only a security property: the release is staged as a **draft with
  every asset already attached**, and only then published. A release discovered to be missing an
  asset cannot be repaired — it needs a new release and a new reviewed record in Collider.

**The chain has to close end to end, or step 1 is theatre.** A verified bootstrap that then
trusts a replaceable archive plus a replaceable checksum list has moved the trust, not
established it. Either the reviewed record binds the payload digests, or the verified bootstrap
contains and enforces them. A baked tag and asset name is _selection_ identity; it is not payload
integrity, and the two must not be confused. The full chain:

> reviewed consumer record → verified bootstrap bytes → verified payload bytes → installed
> executable and resources

Every link is tested, including the negative cases at each layer, with the reviewed record held
unchanged throughout. Rejection must happen **before** untrusted execution, not after.

### 10.4 The reviewed record

`ds-skills.release.json` at Collider's repo root — beside `package.json`, `justfile` and
`components.json`, because it is a toolchain pin, not application data. It binds more than one
digest:

```json
{
  "repository": "atomize-hq/ds-skills",
  "release": "v0.4.0",
  "sourceCommit": "<40-char sha>",
  "bootstrap": { "asset": "install.sh", "sha256": "…" },
  "assets": {
    "macos_arm64": { "asset": "ds-skills-v0.4.0-macos_arm64.tar.gz", "sha256": "…" },
    "…": {}
  }
}
```

Every digest is populated from the **T14-tested bytes**. Three distinct steps that must not
collapse into one: T5 decides these rules, the version to be built is assigned before T14's
decisive pack test, and the finished tarball's integrity is recorded at T15/T16. T5 cannot
certify bytes that do not exist. Package metadata does not change after T14, and a rebuilt
package is not the already-tested artifact.

### 10.5 Platforms, architectures and runtime

Named explicitly, because "Linux/macOS/Windows" is not an asset-selection contract:

| OS      | Architectures       | Asset                                      |
| ------- | ------------------- | ------------------------------------------ |
| macOS   | `arm64`, `x86_64`   | `ds-skills-v<version>-macos_<arch>.tar.gz` |
| Linux   | `x86_64`, `aarch64` | `ds-skills-v<version>-linux_<arch>.tar.gz` |
| Windows | `x86_64`            | `ds-skills-v<version>-windows_x86_64.zip`  |

Assets are per-platform **because the bundled plugin builder carries a native binary**, not
because the CLI is. An unlisted OS/arch pair fails with the list, rather than downloading
something that will not run.

**The release does not ship a Node runtime.** `ds-skills` requires a supported Node provided by
the environment, declared as a hard minimum and checked at install with an actionable message.
Rationale: the CLI is a small Node program, every environment that runs Collider's gates already
provisions Node, and bundling a runtime would add ~25MB per platform to solve a problem nobody
has. This is explicit precisely so it is never resolved from whatever Collider happens to pin.

### 10.6 Install location, discovery and lifecycle

|                 | Location                                     | Persistence                  |
| --------------- | -------------------------------------------- | ---------------------------- |
| CI              | job-local prefix under the runner's temp dir | none — every job installs    |
| Local (Unix)    | `~/.local/share/ds-skills/<version>/`        | persistent, version-specific |
| Local (Windows) | `%LOCALAPPDATA%\ds-skills\<version>\`        | persistent, version-specific |

Executable at `<prefix>/bin/ds-skills` on Unix and `<prefix>\bin\ds-skills.cmd` on Windows. The
bash and PowerShell installers are a **matched pair**, not an afterthought: same prefix scheme,
same verification, same failure modes.

**Collider resolves the binary from the reviewed record's version at the version-specific path,
never from PATH.** An ambient `ds-skills` on someone's machine must not be able to satisfy the
gate — that is the difference between a pinned toolchain and a hope.

Lifecycle:

- **Install / reinstall** is idempotent: unpack to a temp directory, then atomically rename into
  place. The rename _is_ the completion marker, so a partial directory can never read as complete.
- **Upgrade** provisions the new version before anything activates it, and **fails closed on
  CLI/skill skew** — the CLI and its materialized skills share one release identity and refuse to
  run mismatched.
- **Concurrent versions coexist** by construction, since the prefix carries the version. There is
  **no global `current` pointer**, so nothing can override a project's selection.
- **Uninstall** removes only the selected install. A project still pinned to it then fails with
  the exact install command, never a fallback to another version.

### 10.7 Offline, caching, and the early proof

The local pre-push path **acquires nothing**. A missing or mismatched install fails with an
actionable setup message naming the exact command. Caching is an optimization only: the cache key
is the release identity, and a miss installs the same release.

An early mechanism proof is planned that needs **no published artifact** — a workflow-supplied
tarball exercising isolated install, executable discovery, platform behaviour, and each failure
mode. The proof against a real release belongs to T16.

### 10.8 Rejected alternatives

Public npm was the previous plan and remains viable, but it adds a registry, a scope and a
publish flow this org does not otherwise use, and it leaves the optional-peer problem in §7.3
unsolved. **GitHub Packages is not viable** — it requires authentication even to install a public
package. Pinned `dlx` couples acquisition to execution, which is the one thing this contract
separates.

## 11. Open risks

**Delivery risk lives in §10, not here.** The contract is settled; what remains a _risk_ is
that it is unproven end to end until T16 performs a cold acquisition from a real release, and
that the repository being public exposes migrated material on push rather than at release —
which is why T11 carries a disclosure review.

**Rejected alternatives, and why.** Public npm was the previous plan and remains viable, but it
adds a registry, a scope and a publish flow this org does not otherwise use. **GitHub Packages
is not viable** — it requires authentication even to install a public package. Pinned `dlx`
couples acquisition to execution.

**No consumer activation before provisioning exists.** The first dangerous boundary is the task
that makes `preflight` require the CLI — not the task that drops the dependency.

**Residual product-owned validators.** The §5.1 inventory is the mitigation. Without it this
work can report success while Collider still owns rail logic.

**The plugin builder may only work with ambient dependencies.** See §7.3.

**Skills/CLI version skew, and stale materialized assets.** See §5.3.

**Publication exposes whatever the move brought with it.** The 2026-09-05 clean scan covered the
rail repo as it was then. Re-review the **final tarball** after all assets move.

**Honest note on "every task ends green."** The private `git+ssh` dependency already prevents a
clean credential-free CI install. Local preflight passing during Phase 1 is not clean-CI
evidence, and this plan does not promise per-commit clean CI until Phase 3 provisions the tool.

**~~`.agents` gate wiring may surface real violations~~ — closed at T2.** The 162 files were 80
vendored payload, 81 Markdown/JSON/YAML and one script. It surfaced a single warning. The
remaining, larger gap is Collider's own untypechecked `scripts/**/*.mjs`: **BL-5**, 27 measured
errors, deliberately out of this migration.

**~~`parity-policy.md` promises a future this cancels~~ — closed at T3.** Line 29 now states the
rail is retired, and says why, rather than dropping the sentence that made the promise.
