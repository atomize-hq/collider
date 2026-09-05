# Skill pack — Next.js + Tauri + Figma + Storybook

A staged workflow for building a desktop UI system where **Storybook is the executable contract**,
Figma is the design source, and the two are kept in step by explicit, schema-backed artifacts
rather than by memory.

## Layout

```text
.agents/skills/                 canonical — edit only here
  <skill>/SKILL.md              the skills themselves
  <skill>/agents/openai.yaml    Codex $skill interface metadata
  <skill>/references/           long-form material a skill points at
  schemas/                      JSON Schemas for the artifacts the workflow produces
  templates/                    starting points, each a valid instance of its schema
  profiles/                     per-repo vocabulary for the schemas' extension points
  scripts/                      one generic schema validator
.claude/skills/<skill>          symlinks into the above
```

`.agents` and `.claude` are both gitignored (`.gitignore:44-45`), so this pack is **untracked** —
no history, no review, no CI. That is why it drifted from the repo for six months before the
2026-09-05 audit. Treat an edit here with the care you would give an unreviewable change.

## Skills

| Skill                                  | Use it for                                                                  |
| -------------------------------------- | --------------------------------------------------------------------------- |
| `stack-orchestrator`                   | Entry point. Classifies a request and routes it; enforces cross-stack rules |
| `stage-1-foundation-primitives-system` | Baseline setup, tokens, Figma variables, primitive wave, sync policy        |
| `stage-2-component-roundtrip-loop`     | One component through story → Figma → code → verification                   |
| `stage-3-organism-layout-assembler`    | Composing verified components into organisms, layouts, routes               |
| `storybook-rigorous-spec-system`       | Storybook as a system: version policy, tiers, story contracts               |
| `sync-quality-governor`                | Drift audits, reconciliation plans, promotion decisions                     |
| `ai-elements`                          | The ai-elements registry: 48 component references + runnable demos          |
| `ai-elements-plate-builder`            | AI chat + rich-editor hybrid surfaces (Plate is not installed yet)          |

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

`schemas/` describes what the workflow's artifacts must look like; `templates/` gives you a valid
starting instance of each; `profiles/` holds one repo's vocabulary; `scripts/` validates an
instance against a schema.

```bash
node scripts/validate-artifact.mjs \
  schemas/sync-ledger.schema.json ../../src/figma/sync-ledger.json \
  --profile profiles/collider.json
```

Read `schemas/README.md` before changing anything in there — it defines the split between the
portable shape and the repo-specific vocabulary, and lists what the schemas deliberately do not
check. **In a repo that owns semantic validators, those validators are the gate and these schemas
are a second opinion.** In Collider the gate is `scripts/lib/*.mjs` plus the contract tests in
`storybook/`, reached through `just preflight`.

## Toward reuse in other repos

The pack is not repo-neutral yet, but the seam is drawn. Portable today: the thirteen-kind story
taxonomy, all five schemas, the templates, the generic validator, and the stage model. Still
Collider-specific: every path in the tables above, the Figma file key, the token pipeline, and the
prose examples inside each `SKILL.md`.

Porting means writing a new `profiles/<repo>.json` and rewriting paths in the skills — it should
never mean editing `schemas/`. If it does, the schema was carrying vocabulary that belonged in a
profile; fix it there instead.
