# Backlog

Deferred work with a decision already made. Items here are scoped and agreed but not
scheduled — they are not open questions. Anything still undecided belongs in a plan doc,
not here.

---

## BL-1 — `figmaComponentRef` needs dual-format support, not a single canonical form

**Raised:** 2026-09-03, from the repo staleness audit.
**Surface:** `storybook/component-specs/*.json` → `downstreamHooks.figmaComponentRef` (32 files).

### What's there now

The field carries two grammars, split roughly in half, with no validator on the shape:

| Form             | Example                                                                 | Count |
| ---------------- | ----------------------------------------------------------------------- | ----- |
| `fileKey#nodeId` | `23PLdynlRYoBYQx9teoC8A#2277:93`                                        | 17    |
| Figma web URL    | `https://www.figma.com/design/23PLdynlRYoBYQx9teoC8A?node-id=2237-1723` | 15    |

The node id differs too: `2277:93` in the hash form, `2237-1723` in the URL form. That is
Figma's own convention — a web URL hyphenates the colon — so the two are the same id written
two ways, not two different addressing schemes.

Hash form: `agent`, `attachments`, `checkpoint`, `commit`, `confirmation`,
`environment-variables`, `file-tree`, `jsx-preview`, `package-info`, `plan`, `queue`,
`sandbox`, `schema-display`, `stack-trace`, `terminal`, `test-results`, `web-preview`.

URL form: `artifact`, `chain-of-thought`, `code-block`, `context`, `image`,
`inline-citation`, `message`, `open-in-chat`, `prompt-input`, `reasoning`, `snippet`,
`sources`, `suggestion`, `task`, `tool`.

### The decision

**Support both. Do not normalize to one.**

The split is not a mistake to clean up — it reflects two consumers that want different
things, and the project expects to use both:

- **`figma-use`** (the CLI driving the seeding recipe today) addresses nodes as
  `fileKey` plus a colon node id.
- **The Figma MCP server / plugin surfaces** take a web URL. Any work routed through
  MCP rather than `figma-use` needs the URL form.

Picking one and migrating the other 15–17 files would just move the conversion cost to
whichever consumer lost, and the loser would hand-convert at every call site.

### Scope of the work

1. A small normalizer next to the spec contract that parses either form into
   `{ fileKey, nodeId }` and emits either form on request — one function pair,
   `parseFigmaComponentRef` / `formatFigmaComponentRef(ref, 'hash' | 'url')`.
2. Node-id canonicalization inside it: colon is the internal form, hyphen the URL form.
3. A shape check in the component-spec contract so a third grammar can't appear
   unnoticed the way this split did. **Validate both forms as legal** — the check
   exists to reject malformed refs, not to force one grammar.
4. Leave the 32 spec files as they are. Once the normalizer exists, the stored form
   stops mattering.

### Why it was not done in the audit pass

Nothing is broken today: every consumer is `figma-use`, and every ref it reads happens to
be resolvable by hand. The cost lands the first time a loop is driven through the Figma MCP
server, which is why this is queued rather than closed.

**Related:** the same audit found `docs/stage1/sync-policy.md`'s Stage 2→3 gate requiring
Code Connect artifacts that no component has, which contradicts
`docs/ai-elements-loop-handoff.md`. That is a policy decision, not backlog — it needs
resolving before this item's validator work touches the spec contract.

---

## BL-2 — Re-establish the Chromatic review rail

**Raised:** 2026-09-03, from the repo staleness audit.
**Surface:** `.github/workflows/ci.yml` (`chromatic-review`, `reusable-component-promotion`),
`scripts/lib/chromatic-review.mjs`, `artifacts/chromatic/status.json`.

### State of play

The rail is not unbuilt — it worked. **20 `chromatic-review` jobs succeeded between
2026-03-21 and 2026-03-24**, each publishing a build to Chromatic project
`69b96940ff7216b1df881d31`. It has published nothing since.

`96d5c39` (25 Mar) emptied `storybook/story-inventory.json`.
`runChromaticReview()` resolves the proof scope at `chromatic-review.mjs:50`,
**before** the publish call at `:74`, so every run since has thrown
`CHROMATIC_REVIEW_EMPTY_SCOPE` and uploaded nothing — the 2026-08-16 run on `main`
included. Chromatic therefore holds the March pilot only (`button`, then
`thinking-indicator`); none of the 32 ai-elements components have ever been
snapshotted.

Knock-on: `reusable-component-promotion` declares `needs: chromatic-review`, so the
CT-11B promotion gate has been **skipped, not run**, since 24 Mar.

### Already verified (2026-09-03, `56393d1`)

- **The empty-scope blocker is fixed on this branch.** Running
  `pnpm chromatic:review` locally with no token reaches the `local-refusal` branch,
  which is only possible if `createChromaticProofScope()` succeeded first. That also
  proves all 32 components have a matching spec with a non-empty `tier` — otherwise
  it would have thrown `CHROMATIC_REVIEW_SCOPE_SPEC_MISMATCH`.
- Scope resolves to **32 components / 205 unique story IDs**.

That local run is the cheap pre-check. Repeat it before spending a CI run:

```bash
pnpm storybook:build && pnpm chromatic:review
```

It only needs `storybook-static/` to exist (`assertChromaticReviewBuildDirectory`),
validates the scope, refuses to publish without `CHROMATIC_PROJECT_TOKEN`, and exits 0.

### Still unverified

1. **Is `CHROMATIC_PROJECT_TOKEN` still valid?** Untested since March. Missing-or-invalid
   in CI throws `CHROMATIC_REVIEW_TOKEN_MISSING` (`isChromaticReviewCi` makes the refusal
   fatal on Actions).
2. **Does the Chromatic project still exist** on the current plan, and does it still
   accept builds?
3. **Baselines.** All 32 components are new to Chromatic, so the first build is ~205
   all-new snapshots and `diffOutcome` will be `changed`. That is not a failure —
   `exitZeroOnChanges: true` and `changed` maps to check conclusion `neutral` — but
   someone has to accept the baselines in Chromatic's UI before later builds mean
   anything.
4. **Snapshot budget.** ~205 snapshots per build at one viewport (no `chromatic.modes`
   or viewport config anywhere; 3 stories set `disableSnapshot`, 21 set
   `pauseAnimationAtEnd`). Chromatic bills per snapshot — check the plan's allowance
   before turning it loose on every push.

### The work

1. Open a PR from `feat/message-stage2-pilot`. **CI only triggers on `pull_request` or
   `push` to `main`**, and this branch has never had either — a PR is the only way to
   exercise the rail. It also settles items 1–2 above in a single run.
2. Read the run: if `chromatic-review` goes green, accept the 205 baselines in Chromatic.
3. Re-pin the CT-10B provenance marker in
   `storybook/reusable-component-promotion-contract.test.ts` to whatever revision CI
   records, and update the two `deferred`/`skipped` assertions in that file — a real
   review makes them `changed`/`neutral` (or `passed`/`success` once baselines exist).
4. Regenerate the eight CT-12B fixtures under
   `scripts/fixtures/reusable-component-status/`. A satisfied CT-10B rail raises the
   highest earned claim from `reusable-component-proof-ready` back to
   `reusable-component-reviewed`, and drops the `ct10b-review-deferred` reason code.
   Generate them through `createReusableComponentStatus()` with the test's own fixed
   timestamps and workspace mutations — never hand-edit.
5. Confirm `reusable-component-promotion` actually runs rather than skipping.

### Knobs that already exist

- `CHROMATIC_REVIEW_DEFER=true` → `skip: true` and `diffOutcome: 'deferred'`. This is
  the sanctioned way to keep the job wired but silent. Note it still requires a build
  URL (`CHROMATIC_REVIEW_BUILD_URL_MISSING` otherwise), so whether a skipped run
  returns one is itself unverified.
- `CHROMATIC_REVIEW_REQUIRED_FOR_CLAIM=true` → `reviewMode: 'claim-required'` and
  `requiredForClaim: true`. Currently unset, so the review is informational and cannot
  block a claim. Flip this only after baselines are accepted and the rail is green.

### Gotcha

`pnpm validate:chromatic-status` enforces a 1440-minute freshness window and, when
`CHROMATIC_STATUS_EXPECTED_GIT_SHA` is set, an exact SHA match. **Any committed
`status.json` fails both outside the run that generated it.** That is why the committed
artifact records the deferral rather than a review: CI regenerates the file before
validating it, so the committed copy only has to be honest, not fresh.

### 2026-09-08 — the rail published again, and four of the five unknowns are now answered

Opening PR #1 did what step 1 said it would. `chromatic-review` ran on
[`34238311954`](https://github.com/atomize-hq/collider/actions/runs/34238311954) (build 20) and
[`34243650410`](https://github.com/atomize-hq/collider/actions/runs/34243650410) (build 21).
Both **published**, and both then **failed on 2 component errors**, exit 2.

```
✖ Encountered 2 build errors: failing with exit code 2
    → Tested 229 stories across 42 components; captured 226 snapshots and found 2 component errors
```

| unknown above                                         | answer                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Is `CHROMATIC_PROJECT_TOKEN` still valid?          | **Yes.** Two builds authenticated and uploaded.                                                                                                                                                                                                                                                                                    |
| 2. Does the project still exist and accept builds?    | **Yes.** `69b96940ff7216b1df881d31`, builds 20 and 21.                                                                                                                                                                                                                                                                             |
| 3. First build comes back `changed`, accept baselines | **No — it comes back `failed`.** Baselines cannot be accepted while the build errors, so step 2 of "The work" is blocked behind the component errors, not behind a decision.                                                                                                                                                       |
| 4. Snapshot budget ~205                               | **Wrong by ~11%, and for a structural reason.** Chromatic snapshots the **whole Storybook**, not the proof scope: **229 stories across 42 components**, of which 3 set `disableSnapshot`, so 226 are attempted. The ~205 figure came from the 32-component proof scope, which only governs the _review_, never what gets captured. |
| 5. Does `reusable-component-promotion` run?           | **Still no.** It declares `needs: chromatic-review`, so a failing review skips it. The CT-11B gate remains skipped rather than run — the same knock-on as before, now for a different reason.                                                                                                                                      |

**The counts reconcile**: 229 total − 3 `disableSnapshot` = 226 attempted, of which 2 errored. So
it is precisely two stories, not a flaky pair.

#### Which two is not currently knowable from CI, and that is its own defect

The job never preserves the evidence. `chromatic-review.mjs` writes
`artifacts/chromatic/chromatic-diagnostics.json`, and `runChromaticReview()` reads it — but
**only to pull the build URL** (`resolveChromaticBuildUrl`); everything else is discarded. The
workflow uploads `status.json` alone, and that file records `diffOutcome` and scope, never
per-story outcomes. So a build can fail on component errors and leave nothing behind that says
which components.

The diagnostics file **is safe to upload**: checked by running the CLI with a deliberately
invalid token (`chpt_0000…`, auth refused, nothing published) and searching the resulting file —
the project token does not appear anywhere in it. The CLI also accepts `--junit-report`, which is
purpose-built for naming failing tests and is not currently passed.

Making one of those an artifact is the smallest change that turns this from unanswerable into
answerable. Not taken here: the rail is governed by this item, and the sequencing below is the
user's call.

#### Leading hypothesis, held loosely

The only two stories that render the entire 653-token registry are also the only two extreme
outliers in the build, measured in a real browser against the exact `storybook-static` artifact
Chromatic tested:

| story                                        | rendered height | nodes  |
| -------------------------------------------- | --------------- | ------ |
| `Contracts/Tokens > Docs`                    | **203,191 px**  | 10,866 |
| `Contracts/Generated Tokens > TokenRegistry` | **122,464 px**  | 5,518  |
| every other story                            | ordinary        | —      |

Two candidates, two errors. But this is correlation: both stories **render without error** in that
static build, all 458 vitest story-tests pass, and Chromatic's docs state no size limit — their
FAQ says only that a component error means Chromatic "cannot render one or more components".
So treat it as the first thing to check, not the answer.

Also ruled out: the two stories fixed in `dfcb5f6` are **not** these. Build 21 ran after that fix
and reported the same 2 errors, unchanged.

#### Revised order of work

1. Get the story names. Either upload `chromatic-diagnostics.json`, add `--junit-report` and
   upload that, or read build 21 directly in the Chromatic UI — the fastest route if someone has
   the login, since the build page names errored components.
2. Fix the two stories, then accept the ~228 baselines.
3. Then steps 3–5 of "The work" above, unchanged.

Note that `chromatic-review` is **not** a required check — the `main` ruleset requires only
`Governance` and `Test All` — so none of this blocks the PR. What it blocks is
`reusable-component-promotion`, and through it the CT-11B gate.

#### 2026-09-08, later — confirmed from the Chromatic UI, and fixed

Build 22 names both, and the cause is a hard product limit that is not in Chromatic's public
docs — only in the build UI:

> Your story couldn't be captured because it exceeds our 25,000,000px limit. Its dimensions are
> 1,200x43,080px.

| story                                         | dimensions    | pixels | over the limit |
| --------------------------------------------- | ------------- | ------ | -------------- |
| `Contracts/Generated Tokens > Token Registry` | 1200 × 43,080 | 51.7M  | 2.1×           |
| `Contracts/Tokens > Docs`                     | 1200 × 88,925 | 106.7M | 4.3×           |

At 1200px wide the ceiling is **~20,833px tall**. The size hypothesis above was right, and the
mechanism was exactly size — but note it was still only correlation until the UI confirmed it,
and Chromatic's own suggestions ("separate pages into components", "minimize the number of very
large elements") do not apply: no layout of 653 token cards fits under 20,833px. The real choice
was to snapshot a subset or not snapshot.

**Fix: `chromatic: { disableSnapshot: true }` on both**, with the measurement recorded at each
story. Justification, in order of weight:

- Both are **contract** stories, outside `story-inventory.json` and so outside the CT-11B review
  scope. They prove generated artifacts drive a page; the assertions are structural.
- A whole-registry visual diff repaints on any token change, so it could never isolate a
  regression — the snapshot was never going to be useful even if it fit.
- Nothing is lost: Chromatic has never once captured them, and `Test All` still runs both stories
  with the a11y gate at `error` over every node.
- Precedent: three stories already set `disableSnapshot` for their own recorded reasons.

If per-family visual coverage is ever wanted, the honest version is splitting the registry into
one story per token family — each within limits — rather than truncating one page.

**Correction to the entry above.** It said "1 sets `disableSnapshot`, so 228 are attempted" and
"229 − 1 − 2 = 226". Both wrong: **3** stories set `disableSnapshot` (`tool`, `code-block`,
`reasoning`), so 229 − 3 = **226 attempted**, of which 2 errored. The arithmetic looked like it
reconciled only because two mistakes cancelled. With the two contract stories now disabled, the
next build attempts 224.

#### Outcome — build 23 passed, and the whole run is green

[`34248843764`](https://github.com/atomize-hq/collider/actions/runs/34248843764), all **8 jobs
green**, the first fully green run on this repository since **2026-03-24**.

```
✔ Build 23 passed!
    → Tested 229 stories across 42 components; captured 224 snapshots in 1 minute 21 seconds
224 visual changes were found in this build.
```

224 captured is exactly the 226 attempted minus the two now disabled, so nothing else regressed
into or out of the snapshot set.

**`Reusable Component Promotion` ran** — success, not skipped — for the first time since 24 March.
That clears the knock-on this item opens with. **It ran; it did not enforce**: CI still passes
`REUSABLE_COMPONENT_PROMOTION_CHANGE_CLASS: unknown`, so `changeClassSource` is `heuristic`,
`blockingAllowed` is false and `enforcementMode` is `advisory`. Two of the three mechanisms that
make CT-8B inert are untouched by this; only the `needs:` skip is gone.

**Still open, and now unblocked rather than blocked:**

- **Step 2 — accept the baselines.** All 224 are new, so `diffOutcome` is `changed`, which maps to
  check conclusion `neutral` and exits 0 under `exitZeroOnChanges`. The job is green _because_
  changes do not fail it, not because the snapshots have been reviewed. Nothing in Chromatic means
  anything until someone accepts them.
- **Steps 3–4** — re-pin the CT-10B provenance marker and regenerate the eight CT-12B fixtures,
  both of which needed a real review to exist first. They now have one.
- Item 4's original worry stands and is now measured: **224 snapshots per build, ×2 if a light
  mode is ever added**. Check the plan allowance before this runs on every push.

---

## BL-3 — `@atomize-hq/figma-token-rail` is not installable outside this machine

**Raised:** 2026-09-05, when the Figma token rail was extracted to its own repo (`d867f19`).
**Surface:** [`package.json:77`](../package.json), `pnpm-lock.yaml`,
`.github/workflows/ci.yml` (all 8 jobs), and the four consumers listed below.

> **Status 2026-09-06 — in execution, not open.** Subsumed by
> [`SPEC.md`](../SPEC.md); T17 removes the dependency entirely, which resolves this rather
> than repairing it. Two facts below are now out of date: the repo is **public** and has been
> **renamed to `atomize-hq/ds-skills`** (the old URL redirects, verified). What has not
> changed is the cause — `git+ssh` authenticates against a key regardless of visibility, so CI
> still cannot install it.

### State of play

The rail now lives at `atomize-hq/figma-token-rail` and Collider consumes it as a git
dependency:

```
"@atomize-hq/figma-token-rail": "git+ssh://git@github.com/atomize-hq/figma-token-rail.git#v0.3.0"
```

Consumers: `scripts/build-figma-plugin.mjs`, `scripts/lib/figma-variables-sync-enterprise.mjs`,
`src/lib/tokens/figma-token-rail.test.ts`, `src/lib/tokens/token-build-contracts.test.ts`.

Three properties of that line matter, and only the first is obvious:

1. **The repo is private.** Installing requires authorization.
2. **The URL is SSH.** GitHub has no anonymous SSH user — `git@github.com` always
   authenticates against a key on some account, whatever the repo's visibility. The
   lockfile records `resolution.repo: git@github.com:atomize-hq/figma-token-rail.git`,
   the SCP form, so the fetch really is SSH and not HTTPS-with-a-token.
3. **`dist/` is not committed** in the rail (it is gitignored there), so
   `"prepare": "pnpm build"` compiles from source on every consumer at install time.

### This breaks CI now, and it blocks BL-2

Every job in `.github/workflows/ci.yml` runs `pnpm install --frozen-lockfile` after a
plain `actions/checkout@v4`. There is no `ssh-agent` step, no deploy key, no
`url.*.insteadOf` rewrite, and no `.npmrc` — in this repo or the user profile. Checkout's
own credential only covers Collider and is an HTTPS extraheader, which an SSH specifier
never consults.

So all 8 jobs fail at install. It has not shown up yet only because **CI triggers on
`pull_request` or `push` to `main`, and `feat/message-stage2-pilot` has had neither** —
the same fact BL-2 is built on. BL-2's first step is to open that PR. It will fail during
dependency install, long before `chromatic-review` runs.

**BL-3 must land first.** Local development is unaffected: a developer with a GitHub SSH
key installs fine, which is precisely why this is invisible from a working machine.

### The decision

**Publish the rail to npm.** Public repo alone is not sufficient and not the target state.

**Read BL-4 before acting on this.** It moves the boundary between the rail and the repo,
and may make the pack — not the rail — the thing that gets published. The CI break below is
real either way and blocks BL-2 on its own; the publishing decision is the part BL-4 owns.

Making the repo public removes _authorization_ but not _authentication_ — on the current
SSH URL, a public repo still fails for anyone without a key, CI included. Public therefore
requires a specifier change as well:

```json
"@atomize-hq/figma-token-rail": "github:atomize-hq/figma-token-rail#v0.3.0"
```

That shorthand resolves to anonymous HTTPS. Even then, `prepare` still builds from source
on every consumer: install needs a TypeScript toolchain, takes longer than unpacking a
tarball, and compiles against whatever TS version resolves there rather than the one the
rail's CI tested. A published tarball ships `dist/` prebuilt and removes all of it.

For a package whose entire purpose is reuse across repos — it was extracted from
`.agents/skills` specifically so other repos could adopt the skill pack — npm is the
difference between portable in principle and portable.

**Watch for this when flipping visibility:** if the repo goes public and the specifier
stays SSH, every local install keeps working and nothing appears to change. The breakage
is only visible to CI and to other people.

### Scope of the work

1. Create the `@atomize-hq` npm org. Scoped packages default to restricted, so the first
   publish needs `npm publish --access public`.
2. Publish `v0.3.0` (or a fresh patch) from the rail repo. Its `pnpm check` already gates
   this — `format:check`, `typecheck`, `test`, `build`, `smoke`, and `pack-check`, the last
   of which packs a tarball, installs it into a throwaway project, imports the API and
   builds the plugin from `node_modules`.
3. Change Collider's specifier to a semver range (`"^0.3.0"`), regenerate `pnpm-lock.yaml`,
   and confirm the four consumers above still resolve.
4. Run `just preflight`, then open the BL-2 PR and confirm install succeeds in CI.
5. Add a release step to the rail's `.github/workflows/ci.yml` so a tag publishes, rather
   than leaving publication as a manual act that can drift from the tag.

### Interim option, if CI is needed before npm

A deploy key on `atomize-hq/figma-token-rail` plus `webfactory/ssh-agent` in each job
unblocks CI without changing the repo's visibility. It is strictly worse as an end state —
eight jobs each carrying a secret to fetch one 236K package — but it is the cheap path if
BL-2 becomes urgent first.

### Publishing is safe to do — already checked

The 24 tracked files were scanned on 2026-09-05 for repo-specific identifiers and secret
material. **Clean.** No Figma file key, no tokens, no Collider paths; the only
Collider-adjacent string is the `@atomize-hq` package scope. Token handling is
parameterized — `resolveAccessToken(env)` takes an env object rather than reading
`process.env` — so there is no credential path baked into the source. Nothing in the
history needs scrubbing before the repo goes public.

### Why it was not done at extraction time

The git dependency was the deliberate choice for the extraction commit: it kept the change
reversible while the package was still churning, and it churned — four releases in one day,
three of them fixing packaging bugs that were invisible from inside the package (`src/`
missing from `files`, `esbuild` a dependency rather than a peer, and TypeScript not
rewriting extensionless imports, which left the built ESM unloadable under Node while the
test suite was green). Publishing to npm during that is how a broken version becomes
permanent. The guards added in response — `moduleResolution: NodeNext`, `pnpm smoke`,
`pnpm pack-check`, all three in the rail's CI — are what make publishing safe now.

---

## BL-4 — The consuming repo should own data, not rail logic

**Raised:** 2026-09-05, from reviewing what the token-rail extraction actually left behind.

> **Status 2026-09-06 — in execution, not open.** This is the backlog item the whole
> `ds-skills` migration implements. The authoritative accounting is now
> [`docs/ds-skills-disposition-inventory.md`](ds-skills-disposition-inventory.md), which
> covers more surface than the list below — it found a consumer this entry never named.

**Surface:** `scripts/build-figma-plugin.mjs`, `scripts/figma-variables-sync-enterprise.mjs`,
`scripts/lib/figma-variables-sync-enterprise.mjs`, `src/lib/tokens/figma-token-rail.test.ts`,
`src/lib/tokens/token-build-contracts.test.ts`, and the `.agents/skills` pack.

### The decision

**The CLI owns behavior. The repo owns data.** The standard shape — eslint is installed and
`.eslintrc` is yours; terraform is installed and the `.tf` files are yours. A repo adopting
this tooling should contribute config, a ledger, an inventory and expectations, and no
executable rail code at all.

**The skill pack is what gets installed**, with `@atomize-hq/figma-token-rail` as an internal
module rather than a second thing to wire up. Adoption in a new repo becomes one install plus
a handful of JSON files, instead of installing a package, copying a skill directory, and
hand-wiring the two together.

### What that moves

Collider owns **357 lines of executable rail code** today, against 30 lines of actual data:

| Executable, should move                           | LOC |
| ------------------------------------------------- | --- |
| `scripts/lib/figma-variables-sync-enterprise.mjs` | 237 |
| `src/lib/tokens/figma-token-rail.test.ts`         | 78  |
| `scripts/build-figma-plugin.mjs`                  | 33  |
| `scripts/figma-variables-sync-enterprise.mjs`     | 9   |

| Data, should stay                   | LOC |
| ----------------------------------- | --- |
| `src/figma/sync-ledger.json`        | 20  |
| `figma/token-sync.config.json`      | 10  |
| a new expectations file (see below) | ~7  |

The 237-line sync script is the one that looks repo-specific and is not. Its inputs are a
20-line JSON ledger; its policy — promotion levels, exception codes, the outcome-to-level
mapping — is a schema and a lookup table. Both are data. The code that reads a ledger, runs a
rail, and writes an outcome is generic. `.agents/skills/schemas/` plus
`profiles/collider.json` is already this exact split applied to the story/spec artifacts;
this extends it to the rail.

`src/lib/tokens/figma-token-rail.test.ts` asserts `176`, `accent/primary`,
`type/weight/semibold`, `dark`, and `['dark','light']`. That is an expectations file in the
shape of a test. Moving the values into JSON also improves the failure mode: a changed leaf
count becomes a reviewable diff rather than someone editing a test to go green.

**One of its four cases should be deleted, not moved.** The third builds the expected variable
set, echoes it back as the observed set, and asserts no drift — it tests the package against
itself, which the rail's own 19 fixture tests already cover.

`token-build-contracts.test.ts:116` uses `flattenTokenDocument` for a single assertion, that
`$themeOverrides` does not change the leaf count. That is a property of the rail, not of
Collider's tokens, and belongs in the package's suite regardless of the rest of this item.

### Relationship to BL-3

**This subsumes BL-3's publishing half.** If the pack is the installable and the rail is
internal to it, "make the rail installable" and "stop the repo owning rail logic" are one
piece of work, not two. Do not do BL-3's npm publish as a standalone step without deciding
this first — it would publish a boundary this item moves.

**BL-3's CI break is not subsumed and still blocks BL-2.** `pnpm install --frozen-lockfile`
fails in all 8 jobs while the dependency is a private `git+ssh` URL, whatever the package is
called or contains. That is true today and stays true until BL-3 is done.

### The `package.json` entry should not survive this

The rail is in `dependencies` today for one reason: Collider **imports** it, at
`figma-token-rail.test.ts`, `token-build-contracts.test.ts:9`, and
`build-figma-plugin.mjs:18` (`require.resolve`). Imports need module resolution, and module
resolution needs `node_modules`.

This item removes all three. The tests become an expectations file plus a CLI invocation, the
build script becomes a CLI invocation, and the `$themeOverrides` assertion moves into the
package's own suite. Nothing in Collider imports anything afterwards, so the requirement
drops from "resolvable module" to "runnable command" — a PATH question, not a `package.json`
question.

This tooling is not part of what builds or runs a Tauri desktop app, and it should not appear
in the manifest that describes what does. Leaving it there is also what makes all 8 CI jobs
pay an install cost for something only the token pipeline uses.

Versioning is not a gap this repo has to fill. The pack is installed as a skill, by skill
tooling, which owns pinning the same way `pnpm` owns it for `package.json` — the repo does
not design a second mechanism for it.

### Prerequisite: the repo's gates do not see `.agents`

162 tracked files, zero coverage:

- `eslint.config.mjs:11` — `globalIgnores(['.agents/**'])`
- `vitest.config.ts` — includes only `src/**` and `storybook/**`
- `tsconfig.json` — `include: ['**/*.ts', …]`, and a `**/*` glob skips dot-directories

Wire these before anything executable lands in the pack. Nothing there can currently fail
`just preflight`, and a CLI that CI depends on must be lintable, typecheckable and testable
like the rest of the repo.

### Scope of the work

1. Wire `.agents` into eslint, vitest and tsc (above). Independent of everything else here
   and worth doing on its own.
2. Decide the pack's package shape — `bin/` entries, what ships as data, whether
   `figma-token-rail` becomes an internal module or stays a dependency of the pack. This one
   needs a plan doc, not a backlog entry.
3. Give the rail a verify entry point that reads config + expectations + artifact, so
   `figma-token-rail.test.ts` can become JSON.
4. Move the ledger mechanism behind a CLI parameterized by the ledger and a profile.
5. Delete the self-referential drift case; move the `$themeOverrides` assertion into the
   package's suite.
6. Replace `scripts/build-figma-plugin.mjs` with a CLI invocation reading
   `figma/token-sync.config.json`.
7. Drop `@atomize-hq/figma-token-rail` from `package.json` and regenerate the lockfile. Only
   safe once 3–6 have removed the last import; until then it is load-bearing.

### Why it was not done at extraction time

The extraction drew the boundary at "what only this repo can own" and put the CT-8B ledger
mechanism on Collider's side of it. That was the wrong cut: the ledger is data, and its
governance is a schema. The 793-to-237 reduction was real, but 237 was not the floor — about
30 lines of JSON is.

---

## BL-5 — Collider's own Node tooling is not typechecked

**Found:** 2026-09-06, while wiring T2 of the tooling migration.

`tsconfig.json` has `include: ['**/*.ts', '**/*.tsx', …]`. Two consequences, both silent:

- `.mjs` is not in the include list at all, so **no** `.mjs` file in the repo participates in
  `pnpm typecheck` — that is 35 files under `scripts/`, plus `design-tokens/build/`.
- A `**` glob does not match a leading-dot directory, which is why `.agents/` was invisible to
  `tsc` even though the include looks repo-wide. `tsc --listFilesOnly` prints **0** files under
  `.agents/`.

ESLint does cover these files; `tsc` does not. So a type error in the token build or in a
governance validator is caught only if it also happens to be a lint error, which most are not.

### Measured, not estimated

A probe config with `allowJs`, `checkJs`, non-strict, over
`scripts/**/*.mjs` + `design-tokens/build/**/*.mjs` + `.agents/skills/scripts/**/*.mjs`:

```
18  scripts/lib/token-validation.mjs
 2  scripts/lib/token-governance.mjs
 2  scripts/lib/token-artifacts.mjs
 2  scripts/build-foundations-page.mjs
 1  scripts/lib/storybook-component-spec.mjs
 1  scripts/lib/figma-variables-sync-enterprise.mjs
 1  scripts/fetch-upstream-baseline.mjs
──
27 errors, 7 files
```

Under `strict: true` it is 59 in `.agents` alone, all implicit-`any`. Strict is the wrong
setting for untyped JS; `checkJs` without `noImplicitAny` is the one that finds defects rather
than demanding annotations.

### What the 27 actually are

The 18 in `token-validation.mjs` are one root cause: a helper whose parameter shape was
inferred from its first call site, so it "requires" `line`/`column` that most callers omit. One
JSDoc annotation on that helper clears all 18.

Of the other 9, three are worth a look rather than a suppression:

- `figma-variables-sync-enterprise.mjs:83` — `verification` is not a known property of the
  object being built. This is the same area as the `successMarkers` defect that makes a
  successful sync exit 3. The file is deleted by the migration's T3, so this one resolves
  itself.
- `build-foundations-page.mjs:166,185` — a union of string-or-object is passed where a string
  is required, then `.padEnd` is called on it. Latent unless the object branch is unreachable.
- `fetch-upstream-baseline.mjs:166` — `.items` read off a value typed `unknown`, i.e. an
  unchecked shape assumption about a fetched payload.

### Scope of the work

Add a second compiler project — Node tooling is not the Next app and should not share its
`lib`, `jsx` or `moduleResolution`. Wire it into `just check-ts` beside `pnpm typecheck`, then
fix the 27.

### Why it is not part of the tooling migration

The `.agents` half of this gap is dissolved by the migration itself: that code moves into the
CLI package and is typechecked by the package's own `pnpm check`, so building Collider-side
machinery for it would be gating a subtree that is leaving. The `scripts/` half is Collider's
own and stays — but it is unrelated to the rail, and fixing token-governance internals inside a
migration diff makes both harder to review.

---

## BL-6 — RESOLVED: two Storybook stories failed on CI and passed locally

**Raised:** 2026-09-06 as an apparent local flake. **Diagnosed and fixed:** 2026-09-08.
**Two unrelated defects**, not one — the entry that treated them as a single phenomenon was
wrong, and so was its error text. Corrections are called out inline below.

| project               | file                                                   | story           | actual failure                                                |
| --------------------- | ------------------------------------------------------ | --------------- | ------------------------------------------------------------- |
| `storybook`, `-light` | `src/components/ai-elements/sandbox.stories.tsx`       | Tab Switch Flow | `Unable to find an element with the text` — **not** a timeout |
| `storybook`, `-light` | `storybook/stories/tokens/token-contracts.stories.tsx` | Docs            | `Test timed out in 15000ms`                                   |

**Correction to the 2026-09-08 entry this replaces.** It reported `Test timed out in 15000ms`
as the error for all four failures. Only `token-contracts` timed out. `sandbox` failed on the
assertion, in 4452 ms / 5374 ms of file time. The two have nothing in common but the run.

### Defect 1 — `sandbox > Tab Switch Flow` asserted on a DOM that only exists before shiki lands

`await canvas.findByText(/Found 15 prime numbers/i)` can never match highlighted output. Shiki's
`log` grammar splits that line into five sibling spans — measured, not assumed:

```
[0] "Found "  [1] "15"  [2] " prime numbers up to "  [3] "50"  [4] ":"
```

Testing Library's text matcher joins only an element's **own direct text nodes**, so once those
spans exist no element carries the phrase. Before shiki resolves, `createRawTokens` emits one
token per whole line, so a single span holds the full text and the matcher hits. The story was
therefore asserting on the pre-highlight fallback and passed only by winning a race.

That explains the behaviour the old entry could not: it failed **in isolation** (the preceding
`Keyboard` story mounts the output tab, so the `log` tokens are already cached and the first
render is highlighted) and passed **in the full run** (under load shiki had not resolved yet, so
the raw fallback was still on screen). "Whatever makes it pass is a property of the full run" was
right; the property was slowness.

Probe at assertion time on the fixed story confirms all three facts at once:
`spansInFirstLine=5`, `oldMatcherHits=0`, `textContent="Found 15 prime numbers up to 50:"`.

**Fix:** assert on `textContent`, which traverses descendants and so holds in both states —
the reasoning `code-block.stories.tsx > AsyncHighlight` already records for the same component.
`sandbox` was the only story with this defect; the other 20 text queries were checked, and
`terminal.stories.tsx:199` is the only other one inside streamed output, which does not go
through shiki.

### Defect 2 — `token-contracts > Docs` is genuinely slower than the default budget

Not a race. Vitest defaults `testTimeout` to **15 s in browser mode** (`resolved.testTimeout ??=
resolved.browser.enabled ? 15e3 : 5e3`) — nothing in this repo had set it. The story renders the
whole generated registry, 653 tokens, and the a11y addon then runs axe over every node.

Measured by turning axe off for that story alone:

|             | test time  |
| ----------- | ---------- |
| with axe    | **6.90 s** |
| without axe | **0.42 s** |

So ~94% of the cost is the audit, not the render. And the runner is **~3.7× slower** than this
machine — a ratio that holds across two independent stories, so it is a usable multiplier:

| story                                        | local  | CI                | budget              |
| -------------------------------------------- | ------ | ----------------- | ------------------- |
| `Contracts/Tokens > Docs`                    | 6.90 s | **25.0 / 25.8 s** | 15 s ✗              |
| `Contracts/Generated Tokens > TokenRegistry` | 2.92 s | **11.3 / 11.5 s** | 15 s — 25% headroom |
| next slowest (`sandbox`, 7 tests)            | —      | 5.4 s             | fine                |

**This was never a one-story problem.** The second-slowest story sits at 11.3 s of a 15 s budget
and would have become the next failure on any slower runner.

**Fix:** `testTimeout: 60_000` on both browser projects in `vitest.config.ts`, sized from the
25 s worst case. This keeps the audit whole rather than trimming what axe sees.

Two things checked rather than assumed while choosing that knob:

- `parameters: { test: { timeout: N } }` on a story is **silently ignored** by
  `@storybook/addon-vitest` — a 1 ms budget still passed. Per-story timeouts do not exist here.
- `testTimeout` in `vitest.config.ts` **is** honoured — the same 1 ms control produced
  `Test timed out in 1ms`.

### Residual — worth doing, deliberately not done here

Auditing 653 structurally identical token cards costs ~50 s of CI wall time (two projects) for
the a11y information of one card. Cutting it would change what the gate sees, and SPEC §8 makes
"any change that weakens what `just preflight` catches" ask-first, so it is recorded rather than
taken. If it is ever taken, the honest version bounds what the _story_ renders, not what axe is
allowed to look at.

### Why it stayed invisible so long

`Test All` had been skipped in every earlier run of PR #1, behind a failing `Governance`. Before
that, the last CI run to reach any conclusion on this repository was **2026-03-24** — the whole of
Stage 2, the token work and the a11y gate landed with no CI at all. That run was this suite's
first on a runner.

### Not caused by the `ds-skills` cutover or the `shiki` pin

Checked rather than assumed, and still true after diagnosis — both defects predate both changes:

- the sandbox failure reproduces with a **single shiki 4.4.3** in the tree, so BL-7's pin is not
  the cause;
- `esbuild`, `vite@7.3.1`, `vitest@4.1.0` and `playwright@1.58.2` resolve identically before and
  after the cutover;
- neither story file appears in either commit's diff.

### The standing lesson

`just preflight` green was **not** evidence that the sandbox story worked — it passed there for
the wrong reason. A test whose result depends on losing a race reports the timing, not the
behaviour. Both fixes remove the timing dependence rather than widening a tolerance.

---

## BL-7 — `shiki` is pinned to 3.x to keep one major in the tree

**Not a defect to fix — a pin with a retirement condition.** Recorded so nobody "upgrades" it
back without re-reading this.

Collider has two shiki consumers:

| consumer                         | what it highlights                                      | declared range               |
| -------------------------------- | ------------------------------------------------------- | ---------------------------- |
| Collider's own `code-block-*.ts` | the `CodeBlock` component                               | Collider's direct dependency |
| `@streamdown/code@1.1.1`         | code inside streamed markdown, in Message and Reasoning | `shiki: ^3.19.0`             |

`a395f0c` (CodeBlock loop, 2026-08-18) added `"shiki": "^4.4.3"` as a direct dependency. That was
`latest` on the day — the ai-elements registry declares `"dependencies": ["lucide-react", "shiki"]`
with **no version constraint**, so `npx ai-elements add code-block` installs whatever is newest.
Nothing in the loop needed 4.

Two majors in one tree makes `streamdown`'s `HighlightOptions` and `@streamdown/code`'s
mutually unassignable, so `plugins={streamdownPlugins}` fails to typecheck in `message.tsx` and
`reasoning.tsx`. Measured: `17cf091` (one shiki) — 0 errors; `a395f0c` (two) — those exact two.

### Why it hid for 21 days

`tsconfig.json` sets `incremental: true` and `tsconfig.tsbuildinfo` is gitignored, so a developer
machine answers from a warm cache and CI never does. CI is the only place this can surface — and
CI had never run on this branch until PR #1, because the workflow triggers are `pull_request` and
`push` to `main`. **A clean install is not a clean typecheck**; `rm -rf node_modules` does not
touch the build info.

### What retires this pin

`@streamdown/code` moving to shiki 4. It is at its latest (1.1.1) and still on `^3.19.0`, and
nothing upstream is pending: `streamdown` 2.5.0 and 2.6.0 declare no `shiki` and no
`@streamdown/*` dependencies at all — the four plugins are Collider's own direct dependencies,
opted into at `8806ed4`. When that moves, raise Collider's `shiki` with it, in one line.

### The alternative, measured and not taken

`"pnpm": { "overrides": { "@streamdown/code>shiki": "^4.4.3" } }` also works, and was tested:
one shiki, 0 type errors, 262 unit + 458 Storybook tests green, and `@streamdown/code@1.1.1`
really does run on shiki 4 — it loads the 346-language bundle and highlights correctly.

It was not taken because it forces a package off its own declared range to no measured benefit.
Token output is **byte-identical** between the two majors, both through Collider's `CodeBlock`
(7 grammars) and through `@streamdown/code` (7 grammars, 74 tokens), and every dual-theme
premise `9faf284` depends on holds in both: `color`, `bgColor` and `fontStyle` all undefined,
`htmlStyle` populated on every token with the same font-weight custom properties, per-token
backgrounds dropped. The only difference is 14 extra languages in shiki 4's bundle, none of
which the repo highlights — it uses bash, json, jsx, log, python, tsx, typescript and diff, all
present in both.

Revisit as a pair with **BL-5**, which would typecheck the Node tooling: both are about a check
that exists but does not see everything it should.
