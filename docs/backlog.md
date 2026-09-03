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
