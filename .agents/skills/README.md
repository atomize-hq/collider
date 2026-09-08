# Skill pack — Next.js + Tauri + Figma + Storybook

A staged workflow for building a desktop UI system where **Storybook is the executable contract**,
Figma is the design source, and the two are kept in step by explicit, schema-backed artifacts
rather than by memory.

## Layout

```text
.agents/skills/                 Collider's skills — edit only here
  <skill>/SKILL.md              the skills themselves
  <skill>/agents/openai.yaml    Codex $skill interface metadata
  <skill>/references/           long-form material a skill points at
  profiles/collider.json        Collider's vocabulary for the release's schemas
.claude/skills/<skill>          symlinks into the above

<ds-skills install>/lib/        the release's half — never edited here
  skills/<skill>/               three skills the release owns
  schemas/ templates/           the portable artifact contracts
.claude/skills/<name>           generated symlinks into the install (gitignored)
```

**Two owners, one discovery directory.** Collider owns the skills above and its profile;
`@atomize-hq/ds-skills` owns `stage-1-foundation-primitives-system`,
`storybook-rigorous-spec-system`, `sync-quality-governor`, `schemas/` and `templates/`. Both
halves appear under `.claude/skills`, and only one of them is editable here.

**Editing rule:** change a release-owned asset by releasing `ds-skills` and re-pinning
`ds-skills.release.json`, never by editing the link target. Editing an installed file changes it
for every project on the machine, and the next `just ds-skills-install` overwrites it.

Collider's half is **tracked**. It was untracked until 2026-09-05, which is how it drifted from
the repo for six months with nothing able to catch it. The release-owned half is generated:
`just ds-skills-install` writes the links, `just ds-skills-check` asserts they resolve into the
pinned release, and a link left behind by an earlier release fails that check rather than quietly
serving old content — the failure mode the removed `schemas/` fork actually hit, sitting at
ledger v2 while the rail had moved to v3.

## Skills

| Skill                                  | Use it for                                                                  |
| -------------------------------------- | --------------------------------------------------------------------------- |
| `stack-orchestrator`                   | Entry point. Classifies a request and routes it; enforces cross-stack rules |
| `stage-1-foundation-primitives-system` | Baseline setup, tokens, Figma variables, primitive wave, sync policy ᴰˢ     |
| `stage-2-component-roundtrip-loop`     | One component through story → Figma → code → verification                   |
| `stage-3-organism-layout-assembler`    | Composing verified components into organisms, layouts, routes               |
| `storybook-rigorous-spec-system`       | Storybook as a system: version policy, tiers, story contracts ᴰˢ            |
| `sync-quality-governor`                | Drift audits, reconciliation plans, promotion decisions ᴰˢ                  |
| `ai-elements`                          | The ai-elements registry: 48 component references + runnable demos          |
| `ai-elements-plate-builder`            | AI chat + rich-editor hybrid surfaces (Plate is not installed yet)          |

ᴰˢ — owned by the pinned `ds-skills` release, not by this repo.

Start at `stack-orchestrator` when the right entry point is not obvious.

## Source-of-truth model

| Layer              | Truth lives in                                                               |
| ------------------ | ---------------------------------------------------------------------------- |
| Runtime behavior   | Next.js + Tauri application code                                             |
| Component contract | Storybook stories + `storybook/component-specs/<id>.json`                    |
| Design system      | Figma library components, variants, and variables                            |
| Design tokens      | `design-tokens/src/tokens/` — everything else is derived from it             |
| Design ↔ code link | `downstreamHooks.figmaComponentRef` + `codeEntrypoint` in the component spec |
| Publish rail state | `src/figma/sync-ledger.json`                                                 |

Two corrections worth stating plainly, because earlier versions of this file got them wrong:

- **Code Connect is retired.** It is not a rail, not a gate, and not the mapping layer. A
  component with no mapping is not drift. See `docs/stage1/sync-policy.md`.
- **Chromatic has no baseline.** The rail works and holds a March pilot, but no Stage-2
  component has an approved snapshot. Do not treat Chromatic review as a gate you can lean on.

## Supporting directories

`schemas/` describes what the workflow's artifacts must look like and `templates/` gives you a
valid starting instance of each — both come from the pinned release. `profiles/` holds Collider's
vocabulary and stays here. `ds-skills validate` checks an instance against a schema.

```bash
node scripts/ds-skills.mjs validate \
  .claude/skills/schemas/sync-ledger.schema.json src/figma/sync-ledger.json \
  --profile .agents/skills/profiles/collider.json
```

Read `schemas/README.md` before changing anything in there — it defines the split between the
portable shape and the repo-specific vocabulary, and lists what the schemas deliberately do not
check. **In a repo that owns semantic validators, those validators are the gate and these schemas
are a second opinion.** In Collider the gate is the pinned `ds-skills` CLI plus the contract tests
in `storybook/`, reached through `just preflight`. Collider owns no rail validators of its own.

## Toward reuse in other repos

The pack is not repo-neutral yet, but the seam is drawn. Portable today: the thirteen-kind story
taxonomy, all five schemas, the templates, the generic validator, and the stage model. Still
Collider-specific: every path in the tables above, the Figma file key, the token pipeline, and the
prose examples inside each `SKILL.md`.

Porting means writing a new `profiles/<repo>.json` — it should never mean editing `schemas/`. If
it does, the schema was carrying vocabulary that belonged in a profile; fix it there instead.
The three ᴰˢ skills, the schemas and the templates have already made this trip: they left this
repo at the `ds-skills` migration and now arrive portable, with Collider's specifics supplied by
`profiles/collider.json`.
