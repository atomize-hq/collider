# Collider

Next.js + Tailwind + Tauri (Rust) desktop app with Storybook.

## Commands (via `just`)

- `just preflight` — **run before every push** (checks + LOC guards + tests)
- `just check` — fast lint/format/typecheck (TS + Rust)
- `just test-all` — unit + storybook + Rust tests
- `just sweep` — deep analysis before PR/merge (superset of preflight + coverage + e2e)
- `just fmt` — auto-format everything
- `just loc` — LOC guards (TSX max 200, TS max 300, Rust max 400 code lines per file)

## Standards

- `just preflight` must pass before pushing. No exceptions.
- LOC limits are enforced — keep files small and focused.
- Pre-push hooks mirror CI. If it passes locally, CI passes.
