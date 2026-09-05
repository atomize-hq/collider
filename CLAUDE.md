# Collider

Next.js + Tailwind + Tauri (Rust) desktop app with Storybook.

## Commands (via `just`)

- `just preflight` — **run before every push** (checks + LOC guards + tests)
- `just check` — fast lint/format/typecheck + upstream policy (TS + Rust)
- `just test-all` — unit + storybook + Rust tests
- `just sweep` — deep analysis before PR/merge (superset of preflight + coverage + knip + cargo-deny + cargo-machete + e2e)
- `just fmt` — auto-format everything
- `just loc` — LOC guards (TSX/TS max 300, Rust max 400 code lines per file)

## Standards

- `just preflight` must pass before pushing. No exceptions.
- `just sweep` must pass before opening a PR or merging — the deep gate on top of preflight (adds coverage, knip, cargo-deny, cargo-machete, and e2e).
- LOC limits are enforced — keep files small and focused.
- A pre-push hook runs `just preflight`, which mirrors CI — if it passes locally, CI passes. (Bypass with `git push --no-verify` only when you know why.)

## Upstream components

`src/components/ui` (shadcn) and `src/components/ai-elements` (ai-elements) are vendored
by copy, so the CLI that installed a file can also silently overwrite it.

- **`shadcn add --overwrite` is never the upgrade path.** It reverts the focus-ring policy,
  the destructive-fill fix, and the hover-card portal without touching a test.
- Intentional divergences and the upstream API we depend on are recorded in
  [`src/components/upstream-policy.json`](src/components/upstream-policy.json) and enforced
  by `just check`. That file is the answer to "why does this differ from upstream?".
- Adding a deliberate deviation means adding an entry. A failing rule is either a real
  regression or a deviation that has become obsolete — decide which, don't delete to go green.
- [`src/components/upstream-baseline.json`](src/components/upstream-baseline.json) pins the
  registry payload hashes we last compared against, so a finding is reproducible instead of
  true-on-the-day-it-was-measured. Refresh with `pnpm baseline:upstream` when adopting an
  upstream revision; `just check` reads the file, never the network.
- **26 of 63 ai-elements files are orphaned** — they 404 upstream, so "re-adopt from the
  registry" is not available for them at any vintage. The baseline records which. Those are
  ours permanently, whether or not we planned it.
- `just check-contract` checks what ai-elements needs from `src/components/ui`: every
  imported export still exists, and every `[data-slot=x]` a component styles is one some
  component emits. Not in `just check` yet — see the justfile for why.

### shadcn registry vintage

Primitives are on the pre-v4 `new-york` style (`components.json`), authored for React 18 +
Tailwind 3, while the app runs React 19 + Tailwind 4. A migration to the v4-shaped baseline
is planned; the baseline file already pins `new-york-v4` as the target. Do not migrate
components piecemeal — a mixed vintage is what produced both known structural defects.
