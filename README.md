# Collider

Desktop IDE shell for Atomize HQ. Built on Next.js 16 + Tauri 2 — React renders the UI, Rust owns the native layer.

---

## Stack

| Layer                   | Technology                               |
| ----------------------- | ---------------------------------------- |
| UI framework            | Next.js 16 (App Router, Turbopack)       |
| Desktop shell           | Tauri 2 (Rust + WKWebView / WebView2)    |
| Styling                 | Tailwind CSS v4                          |
| Component dev           | Storybook 10                             |
| Unit tests              | Vitest 4                                 |
| Browser/component tests | `@vitest/browser` + Playwright           |
| E2E tests               | Playwright 1.58                          |
| Formatter               | Prettier 3 + prettier-plugin-tailwindcss |
| Linter                  | ESLint 9                                 |
| Dead code               | Knip                                     |
| Rust tests              | cargo-nextest                            |
| Rust lints              | Clippy, cargo-deny, cargo-machete        |
| LOC analysis            | tokei (code lines only, blanks excluded) |
| Task runner             | just                                     |

---

## Prerequisites

- **Node.js** 22+ · **pnpm** 10+
- **Rust** stable (1.89+) — via [rustup](https://rustup.rs)
- **Tauri system deps** — follow the [Tauri v2 prerequisites guide](https://v2.tauri.app/start/prerequisites/) for your OS
- **just** — `brew install just`

---

## Setup

Design-system tooling and skills use the release selected in
`ds-skills.release.json` only after its immutable public tag/assets are published
and verified and the pin/core/custom installations are rebound to that identity.
An unpublished staged pin and its release-tagged guide links are prospective, not
public operational authority. Start with [current consumer
documentation](docs/current.md) and [the installation contract](docs/ds-skills-consumer.md)
before running token, Figma, or governance commands. The pin names the exact
release, source commit, and asset digests; do not substitute an ambient executable.
The original public separation landed in [Collider PR2](https://github.com/atomize-hq/collider/pull/2)
with [ds-skills v0.5.3](https://github.com/atomize-hq/ds-skills/releases/tag/v0.5.3);
that is historical landing evidence, not the current pin or a fresh CI result.

```bash
pnpm install
pnpm exec playwright install chromium
```

Rust tools (one-time, global):

```bash
cargo install cargo-deny --version 0.19.0 --locked
cargo install cargo-nextest --version 0.9.128 --locked
cargo install cargo-machete --version 0.9.1
cargo install tokei
```

---

## Development

```bash
just dev          # Next.js on localhost:3000 (Turbopack)
just dev-tauri    # Tauri desktop window (also starts Next.js)
just storybook    # Storybook on localhost:6006
```

---

## Project Structure

```
src/
  app/              Next.js App Router pages + global styles
  components/
    ai-elements/    AI-specific UI components
    ui/             Collider-owned primitive components
  figma/            Consumer Figma configuration and operator inputs
  lib/tokens/       Runtime token integration

src-tauri/          Rust crate (Tauri backend)
  src/              lib.rs, main.rs
  capabilities/     Tauri permission definitions
  deny.toml         cargo-deny license + advisory policy

storybook/
  stories/          Contract and generated-token stories
  component-specs/  Repo-owned component proof contracts
```

---

## Quality Gate

### Pre-push gate

```bash
just preflight    # required local token/proof/static/LOC/test pre-push gate; CI has additional build and external-review work
```

### Token governance shortcut

```bash
just token-governance  # runs the same mandatory governance path used by preflight and CI
```

### Fast checks — run before every commit

```bash
just check        # prettier + tsc + eslint + cargo fmt + clippy
just check-ts     # TS only
just check-rs     # Rust only
```

### LOC guards (via tokei — code lines only, blanks/comments excluded)

```bash
just loc          # Rust + TS/TSX
just loc-rs       # Rust only  (max 400 code lines per file)
just loc-ts       # TSX max 200, TS max 300 code lines — excludes tests + stories
```

### Tests

```bash
just test         # Vitest unit suite (Node, fast)
just test-rs      # Rust tests via cargo-nextest
just test-all     # unit + storybook component + Rust (full automated suite)
just test-ux      # Storybook component tests + Playwright e2e (UI layer only)
just test-cov     # Unit tests + V8 coverage report
```

### E2E

```bash
just e2e          # Playwright headless (auto-starts Next.js)
just e2e-ui       # Playwright interactive UI / trace viewer
```

### Interactive dev tools

```bash
just test-ui      # Vitest browser UI dashboard
just test-watch   # Vitest unit in watch mode
```

### Deep sweep — run before opening a PR

`just sweep` is the required deep gate before any PR or merge. It complements—not
supersedes—`just preflight`: sweep adds coverage, knip, cargo-deny,
cargo-machete, and Playwright e2e, while preflight retains token, proof, installed
output, upstream-policy, and consumer-contract checks. Run both. Neither local gate
proves CI or external visual-review/promotion success.

| Check                                                                 | Preflight | Sweep | CI  |
| --------------------------------------------------------------------- | --------- | ----- | --- |
| Token governance, Storybook proof generation                          | Yes       | No    | Yes |
| Core/custom installation, upstream policy/evidence, consumer contract | Yes       | No    | Yes |
| Format, typecheck, lint/clippy, LOC                                   | Yes       | Yes   | Yes |
| Unit, both Storybook themes, Rust tests                               | Yes       | Yes   | Yes |
| Coverage, knip, cargo-deny, cargo-machete, e2e                        | No        | Yes   | No  |
| Next.js and static Storybook builds                                   | No        | No    | Yes |
| Current external Chromatic review and component promotion             | No        | No    | Yes |

```bash
just sweep        # Everything: sweep-ts + sweep-rs + storybook + e2e
just sweep-ts     # prettier + tsc + eslint + vitest coverage + knip
just sweep-rs     # cargo fmt + clippy + nextest + cargo-deny + cargo-machete
```

### Auto-format

```bash
just fmt          # Prettier + cargo fmt (all files)
just fmt-ts       # Prettier only
just fmt-rs       # cargo fmt only
```

---

## Build

```bash
just build          # Next.js production build
just build-tauri    # Tauri desktop bundle (.app / .exe / .deb)
just build-storybook  # Static Storybook site
```

---

## Git hooks

Husky runs on **commit** (`.husky/pre-commit`):

1. **lint-staged** — ESLint + Prettier on staged TS/JS/JSON/CSS files
2. **cargo fmt check** — if any `.rs` files are staged

…and on **push** (`.husky/pre-push`):

3. **`just preflight`** — token governance + Storybook proof + `just check` + LOC guards + `just test-all`. It is required before push, but CI additionally builds and enforces external visual-review/promotion operations; a local pass is not a CI guarantee. Do not bypass required gates.

---

## Key Config Files

| File                   | Purpose                                                                      |
| ---------------------- | ---------------------------------------------------------------------------- |
| `vitest.config.ts`     | Three projects: `unit` (Node), `storybook` (dark browser), `storybook-light` |
| `playwright.config.ts` | E2E config — chromium, `pnpm dev` web server                                 |
| `knip.config.ts`       | Dead export / unused dependency analysis                                     |
| `src-tauri/deny.toml`  | Allowed licenses + advisory ignore list                                      |
| `rust-toolchain.toml`  | Pins stable Rust channel                                                     |
| `.prettierrc`          | Formatter — singleQuote, 100 cols, TW v4 class sorting                       |
| `justfile`             | All task recipes (`just --list`)                                             |
