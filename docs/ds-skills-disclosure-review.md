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

### 6.1 Eighty vendored third-party `.tsx` files, no licence

`.agents/skills/ai-elements/` is 129 files: 49 Markdown and **80 vendored `.tsx` component sources**
copied from the AI Elements registry. There is **no `LICENSE` file, and no recorded licence** for
them anywhere in this repository — `upstream-policy.json` records API contracts and deviations, not
terms.

Today they sit in a **private** repository, which is a use. Pushing them to a **public** one is
**redistribution of third-party source**. That is a licensing decision with a real answer, and it
is not mine to assume — AI Elements may well permit it, but "probably fine" is not a licence
review.

**Nothing from `ai-elements/` has been copied into the pack.** It stays in Collider pending that
decision.

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

### 6.3 What this blocks

T11 cannot close. Moved and cleared: `schemas/`, `templates/`, `profiles/` (as an example), and the
`validate` executable with its tests. Not moved: `skills/`. Until §6.1 is answered, the skills stay
in Collider, and with them T11's remaining criteria — the two rail-referencing skills' CLI
invocations, skill materialization, the `.claude/skills` symlink retarget, and shared release
identity.

## 7. History and refs

The pack repository's history contains no migrated consumer material: every commit to date is the
rail extraction plus this migration's own work, and nothing from `.agents/` has been committed to
it. There is no imported history to review, and no filtered push is required.

**Four commits are currently unpushed** in the pack. They contain the §1 open item — the file key
in `publish-proof.mjs` — which is assessed above as a coupling defect rather than a leak, and is
already tracked by the boundary test's allowlist.
