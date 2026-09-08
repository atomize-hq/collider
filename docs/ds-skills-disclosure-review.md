# Disclosure review — what becomes public when the pack is pushed

**T11 of the `ds-skills` migration.** `atomize-hq/ds-skills` is a **public** repository, so
migrated material is exposed the moment it is **pushed**, not when a release is cut. This review
is therefore a gate on `git push`, not on T15. T15's archive review is the second checkpoint.

Round 4 widened the scope: the review covers "all consumer-derived material that will become
public — profiles, fixtures, baselines, token values, file identifiers, generated output, source
maps, **and the history and refs being pushed** — not merely the final archive contents."

Reviewed 2026-09-06 against the working tree of both repos.

## 1. Secrets and identifiers — clean

Scanned `.agents/skills/**` and everything staged for the pack for: the Figma file key
(`23PLdynlRYoBYQx9teoC8A`), `figma://file/` URIs, Chromatic project tokens, and any 32+ character
opaque string.

**Nothing found.** The Figma file key appears only in `src/figma/publish-proof.json` and
`src/figma/sync-ledger.json` — both Collider `data` that stays in Collider — and in
`publish-proof.mjs`'s `publishProofPilotFile` constant, which is §4.5's row 2 and is T12's to move
into a profile. **T12 must not be allowed to close without it**, because the module it lives in has
already been copied into the public repo.

> **Open, and tracked:** `publish-proof.mjs` in the pack currently carries
> `publishProofPilotFile = 'figma://file/23PLdynlRYoBYQx9teoC8A'`. It is a file **key**, not a
> credential — anyone with access to the file already has it, and it grants nothing on its own —
> so this is a tidiness and coupling defect rather than a leak. The boundary test's allowlist
> records it with its owning task.

## 2. Consumer vocabulary — resolved by keeping it in the consumer

`SPEC.md` §3.1 showed `profiles/ # repo vocabulary (collider.json, …)` inside the pack. T9's
inventory gives `.agents/skills/profiles/collider.json` the disposition `data`. **Those
contradict, and the inventory is right.**

A profile is _consumer_ vocabulary. Shipping one consumer's profile from a portable package
reintroduces exactly the coupling this migration removes — and a second consumer would then be
adding its vocabulary to someone else's repository. So:

- **`collider.json` stays in Collider.** SPEC §3.1 is corrected.
- **The pack ships `profiles/example.json`**, whose vocabulary is deliberately _unlike_ any real
  consumer's — different artifact path, a two-rung tier ladder, an `EX-nnn` consumer-id pattern.
  That is not decoration: the moved validator's suite runs against it, so a validator with a
  consumer's values baked in **fails there** rather than passing by coincidence.

Its content is unremarkable in any case: enum values, a path, and prose. Publishable, but it
belongs to the consumer.

## 3. The portable schemas were not portable

All five named Collider. Reviewed line by line, the split is better than it looked and worse than
it read:

- **No constraint names a consumer.** The shapes genuinely travel. `SPEC.md` §3.1's claim that
  "that split already exists" holds where it counts.
- **Every `$id` did** — `https://collider.local/skills/schemas/…`. Renamespaced to
  `https://ds-skills.local/schemas/…`. Safe: every `$ref` is local (`#/$defs/…`) and the validator
  **rejects** non-local refs outright, so `$id` is decorative.
- **Four `description` fields taught the extension point by naming one consumer's answer** — tier
  ladders, thread-id patterns, a pinned artifact path. Rewritten to describe the extension point
  and point at `profiles/example.json`.
- **`schemas/README.md` was a Collider document**: a column of Collider paths, `--profile
../profiles/collider.json` in its worked commands, and a closing paragraph locating the
  authoritative validators in `scripts/lib/*.mjs`. Rewritten. The authority relationship is
  unchanged — validators win, schemas are a second opinion — only its address moved.

`pack-check` now fails if the **installed** schemas name a consumer, so this cannot regress
quietly. It caught the four descriptions after the `$id` fix had already been made, which is why
it exists rather than a one-time grep.

## 4. Operational instructions — three stale, all found by reading rather than by the import graph

Round 4 predicted this class precisely: "These can retain obsolete commands, install URLs, product
paths, or inline rail logic even when the import graph is clean."

| Where                              | What was stale                                                                |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| `schemas/README.md` worked example | `node ../scripts/validate-artifact.mjs …` — a path that stops existing at T17 |
| `schemas/README.md` closing note   | Located the authoritative validators in the consumer's `scripts/lib/`         |
| the three validator usage strings  | `Usage: node scripts/validate-*.mjs …` — consumer script paths T17 deletes    |

The first two are fixed. The third is **deliberately not**: those strings are pinned by a test that
was carried over on purpose, so T12's genericization has to update a failing test rather than drift
past it.

## 5. The count of hardcoded consumer constants is nine, not four

`SPEC.md` §4.5 listed four. Reading the relocated modules found five more, all of the "defaults and
error messages" class:

| #     | Constant                  | Value                                              |
| ----- | ------------------------- | -------------------------------------------------- |
| 1–4   | (as recorded in §4.5)     | destination name, file key, two artifact paths     |
| **5** | `syncLedgerUsage`         | `Usage: node scripts/validate-sync-ledger.mjs …`   |
| **6** | `figmaParityUsage`        | `Usage: node scripts/validate-figma-parity.mjs …`  |
| **7** | `publishProofUsage`       | `Usage: node scripts/validate-publish-proof.mjs …` |
| **8** | `defaultSyncLedgerPath`   | `src/figma/sync-ledger.json`                       |
| **9** | `defaultPublishProofPath` | `src/figma/publish-proof.json`                     |

5–7 are worse than untidy: after T17 they instruct a user to run a script that does not exist.

## 6. The skills are **not** cleared for publication — decision required

`SPEC.md` §3.1 says `skills/ # the 8 skills, shipped as data`. That was written before anyone read
their contents. Two findings block it:

### 6.1 `ai-elements` is a mirror of a third-party documentation site

**Corrected 2026-09-06.** An earlier draft of this section called these "80 vendored `.tsx`
component sources copied from the AI Elements registry." That was wrong, and it was wrong because
it was written from filenames and a `SKILL.md` line rather than from reading the files.

What `.agents/skills/ai-elements/` actually is:

| Part              | Count | What it is                                                                        |
| ----------------- | ----: | --------------------------------------------------------------------------------- |
| `references/*.md` |    49 | The AI Elements documentation pages, one per component, mirrored                  |
| `scripts/*.tsx`   |    80 | The code examples those pages point at — `See scripts/agent.tsx for this example` |

The examples are 7,453 lines total, ~20–35 lines each, and every one of them **imports from**
`@/components/ai-elements/*` rather than implementing anything. They are usage demos.

**The component sources were never here.** They live in `src/components/ai-elements/` — 91 files,
12,259 lines — which is a different directory, is not under `.agents/`, and is not in this
migration's scope at any point.

So the licensing concern is real but much smaller than stated, and of a different kind.
Documentation examples exist to be copied into user code; that is their purpose. Mirroring a
vendor's entire docs site into a public, redistributable package is a different act from using an
example, and it carries no attribution or licence note today — but it is not redistributing a
component library, which is what the earlier draft claimed.

### 6.1b The better question is fit, not licence

`ds-skills` is design-system **tooling**: token rails, ledgers, portable schemas, the Figma plugin
builder. A 129-file mirror of a third-party component library's documentation has nothing to do
with any of that. It shares a repository with the rail today because `.agents/skills/` is where
this repo keeps agent skills — which is a hosting decision, not a cohesion one.

`SPEC.md` §3.1 said `skills/ # the 8 skills, shipped as data`. That line was written without anyone
examining what the eight skills were. Grouped by what they actually do:

| Skill                                  | Relationship to this package                             |
| -------------------------------------- | -------------------------------------------------------- |
| `sync-quality-governor`                | **Rail governance** — pairs directly with the CLI        |
| `stage-1-foundation-primitives-system` | **Tokens, Figma variables, sync policy** — rail-adjacent |
| `storybook-rigorous-spec-system`       | Owns four of the five schemas that moved                 |
| `stage-2-component-roundtrip-loop`     | Workflow, not tooling                                    |
| `stage-3-organism-layout-assembler`    | Workflow, not tooling                                    |
| `stack-orchestrator`                   | Routes between the stage skills                          |
| `ai-elements`                          | Third-party docs mirror — no rail relationship           |
| `ai-elements-plate-builder`            | Same                                                     |

**Recommendation: move the first three, leave the rest.** That needs no licence review, because the
two `ai-elements` skills stop being candidates on cohesion grounds alone — a token-rail CLI should
not ship someone else's component-library documentation.

If the workflow skills are wanted in the package later, that is a separate decision about what
`ds-skills` is for, and it should be made on those terms rather than inherited from where the files
happened to live.

### 6.2 Several skills are Collider documents, not portable ones

Measured, per skill, whether any file names the consumer:

| Skill                                  | Files naming Collider                        |
| -------------------------------------- | -------------------------------------------- |
| `ai-elements`                          | 1 (an explicit "REPO RULE (Collider)" block) |
| `stack-orchestrator`                   | 2                                            |
| `storybook-rigorous-spec-system`       | 2                                            |
| `stage-2-component-roundtrip-loop`     | 1                                            |
| `ai-elements-plate-builder`            | 0                                            |
| `stage-1-foundation-primitives-system` | 0                                            |
| `stage-3-organism-layout-assembler`    | 0                                            |
| `sync-quality-governor`                | 0                                            |

`.agents/skills/README.md` additionally carries project-status prose — "Chromatic has no baseline…
Do not treat Chromatic review as a gate you can lean on" — which is accurate internally and reads
as unreleased-product commentary in a public package.

None of this is sensitive. It is the same portability defect as §3, and it needs the same
treatment: describe the extension point, let the consumer supply the answer.

### 6.3 Settled — three skills move, two stay with the consumer

**Decided 2026-09-06.** `ai-elements` and `ai-elements-plate-builder` remain in Collider and are
**not** part of `ds-skills`. Moved instead: `sync-quality-governor`,
`stage-1-foundation-primitives-system`, and `storybook-rigorous-spec-system`.

**And no skill shipped from the package may reference the two that stayed.** That took more than
deleting a line — `stage-1` carried an entire "AI Elements / Plate foundation rules" section, three
checklist items, a directory listing naming the wrappers, and prose about primitives arriving "as
dependencies of the ai-elements loops". The section is gone and the rest describes the practice
without the vendor names, so the guidance survives the severing.

Two further defects came out with it:

- **Consumer status inside a portable skill.** `storybook-rigorous-spec-system`'s decision matrix
  ended in "Where Collider actually sits" — the exact thing that stops a skill being portable the
  moment a second repo installs it. The recommendation rows stay; the section now describes what a
  repo should record, and says to record it where its own status lives.
- **Relative asset paths that were right in the old layout.** Skills sat _beside_ `schemas/` and
  `templates/` under `.agents/skills/`, so `` `../schemas` `` resolved. In the package they are one
  level deeper and it resolves to `skills/schemas`, which exists in neither repo. Repointed, and
  each path checked to resolve rather than assumed to.

Four `pack-check` assertions now hold the line, each **proven to fail** before being trusted:
nothing shipped as data may name a consumer (schemas, skills, templates, profiles); no installed
skill may reference ai-elements or plate; neither of those two skill directories may exist in the
package; and no skill may use a consumer-relative asset path.

> A note on method: the first `plate` scan matched `tem`**`plate`**`s` and reported four false
> positives. That is the third time in this migration a filter has misreported its own result —
> after `grep -v node_modules` matching line content at T7, and a `jq` object filter silently
> dropping rows while verifying the ruleset. The gate uses a word boundary.

### 6.4 What remains

Moved and cleared: `schemas/`, `templates/`, `profiles/` (as an example), and the `validate`
executable with its tests. Not moved: `skills/`.

Moved and cleared: `schemas/`, `templates/`, `profiles/` (as an example), the `validate` executable
with its tests, and the three skills above.

Still open, and none of it is a disclosure question:

- **Materialization** — canonical editing location, tracked or generated, stale-copy handling, and
  the `.claude/skills` symlink retarget. Collider's `.agents/skills/` copies are the frozen
  compatibility snapshot until T17 switches them.
- **Shared release identity** between the CLI and the materialized skills, so an agent cannot read
  instructions for one command contract while executing another.
- **The three skills still describe consumer workflows in places** — they were written for one
  repo. Nothing in them names a consumer any more, which is the publishable bar; making them
  genuinely reusable is a separate piece of work and not this migration's.

The three moved skills' operational instructions will also need re-checking at T17, when
`ds-skills` commands replace the `pnpm`/`node` invocations they still describe.

## 7. History and refs

The pack repository's history contains no migrated consumer material: every commit to date is the
rail extraction plus this migration's own work, and nothing from `.agents/` has been committed to
it. There is no imported history to review, and no filtered push is required.

**Four commits are currently unpushed** in the pack. They contain the §1 open item — the file key
in `publish-proof.mjs` — which is assessed above as a coupling defect rather than a leak, and is
already tracked by the boundary test's allowlist.
