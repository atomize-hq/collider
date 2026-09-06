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

---

## BL-3 — `@atomize-hq/figma-token-rail` is not installable outside this machine

**Raised:** 2026-09-05, when the Figma token rail was extracted to its own repo (`d867f19`).
**Surface:** [`package.json:77`](../package.json), `pnpm-lock.yaml`,
`.github/workflows/ci.yml` (all 8 jobs), and the four consumers listed below.

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

**What replaces it is the open question,** and it is the one thing `package.json` was giving
away for free: a pinned, reproducible, CI-cached version. Whatever carries the pack has to
provide an equivalent. Note that `skills-lock.json` (tracked, 2026-03-17) already sketches
exactly this — `ai-elements` vendored from `vercel/ai-elements` with a `computedHash` — and
**nothing in the repo reads it**. Finishing that mechanism, or deliberately replacing it, is
part of the plan doc in step 2, not a detail to settle in passing.

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

### Why it was not done at extraction time

The extraction drew the boundary at "what only this repo can own" and put the CT-8B ledger
mechanism on Collider's side of it. That was the wrong cut: the ledger is data, and its
governance is a schema. The 793-to-237 reduction was real, but 237 was not the floor — about
30 lines of JSON is.
