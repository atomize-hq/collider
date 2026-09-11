# Collider

Next.js + Tailwind + Tauri (Rust) desktop app with Storybook.

## Commands (via `just`)

- `just preflight` — **run before every push** (checks + LOC guards + tests)
- `just check` — fast lint/format/typecheck (TS + Rust)
- `just test-all` — unit + storybook + Rust tests
- `just sweep` — deep analysis before PR/merge (complements preflight with coverage, knip, cargo-deny, cargo-machete, and e2e)
- `just fmt` — auto-format everything
- `just loc` — LOC guards (TSX max 200, TS max 300, Rust max 400 code lines per file)

## Standards

- `just preflight` must pass before pushing. No exceptions.
- `just sweep` must pass before opening a PR or merging. It complements rather than replaces preflight; both gates are required.
- LOC limits are enforced — keep files small and focused.
- A pre-push hook runs `just preflight`. It is a required local gate, not a CI guarantee: CI also builds and enforces external visual-review/promotion work. Do not bypass required gates.
