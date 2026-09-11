# Collider

Next.js + Tailwind + Tauri (Rust) desktop app with Storybook.

## Commands (via `just`)

- `just preflight` — **run before every push** (checks + LOC guards + tests)
- `just check` — fast lint/format/typecheck + upstream policy (TS + Rust)
- `just test-all` — unit + storybook + Rust tests
- `just sweep` — deep analysis before PR/merge (complements preflight with coverage, knip, cargo-deny, cargo-machete, and e2e)
- `just fmt` — auto-format everything
- `just loc` — executable LOC guards (TSX max 200, TS max 300, Rust max 400 code lines per file)

## Standards

- `just preflight` must pass before pushing. No exceptions.
- `just sweep` must pass before opening a PR or merging. It complements rather than replaces preflight; both gates are required.
- LOC limits are enforced — keep files small and focused.
- A pre-push hook runs `just preflight`. It is a required local gate, not a CI guarantee: CI also builds and enforces external visual-review/promotion work. Do not bypass required gates.

## Installed design-system workflows

Start with [current documentation](docs/current.md) and the installed
[stack orchestrator](.agents/skills/stack-orchestrator/SKILL.md). Skill authoring,
reusable tooling and curation belong to ds-skills; do not edit managed output files.

## Owned component sources

`src/components/ui` and `src/components/ai-elements` are copied, Collider-owned source.
Do not run an overwrite installer over them. The actual policy, ownership/split map,
accepted upstream snapshot and capture/diff/check commands are documented in
[src/components/upstream-sources.md](src/components/upstream-sources.md).
`just check` enforces installed source policy and import/slot contracts. Fix an
actual regression or review an obsolete rule; do not delete rules just to pass.

The newer primitive snapshot is a migration target, not a claim that components have
already migrated. Use [the migration context](docs/shadcn-v4-migration-handoff.md)
and current source before a bounded application change. Current curated guidance
covers the explicit [library selections](design-system/README.md), not every module.
