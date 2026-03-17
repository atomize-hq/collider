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
| Linter                  | ESLint 10                                |
| Dead code               | Knip                                     |
| Rust tests              | cargo-nextest                            |
| Rust lints              | Clippy, cargo-deny, cargo-machete        |
| Task runner             | just                                     |

---

## Prerequisites

- **Node.js** 22+ · **pnpm** 10+
- **Rust** stable (1.89+) — via [rustup](https://rustup.rs)
- **Tauri system deps** — follow the [Tauri v2 prerequisites guide](https://v2.tauri.app/start/prerequisites/) for your OS
- **just** — `brew install just`

---

## Setup

```bash
pnpm install
pnpm exec playwright install chromium
```

Rust tools (one-time, global):

```bash
cargo install cargo-deny --version 0.19.0 --locked
cargo install cargo-nextest --version 0.9.128 --locked
cargo install cargo-machete --version 0.9.1
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
    editor/         Code/content editor components
    system/         Design-system primitives
  bridge/           Tauri IPC bindings (TS → Rust)
  lib/tokens/       Design token CSS variables
  features/         Feature-scoped modules

src-tauri/          Rust crate (Tauri backend)
  src/              lib.rs, main.rs
  capabilities/     Tauri permission definitions
  deny.toml         cargo-deny license + advisory policy

storybook/
  stories/          Standalone stories
  story-specs/      Story specification docs
```

---

## Quality Gate

### Fast checks — run before every commit

```bash
just check        # prettier + tsc + eslint + cargo fmt + clippy
just check-ts     # TS only
just check-rs     # Rust only
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

## Commit hooks

Husky runs on every commit:

1. **lint-staged** — ESLint + Prettier on staged TS/JS/JSON/CSS files
2. **cargo fmt check** — if any `.rs` files are staged

---

## Key Config Files

| File                   | Purpose                                                |
| ---------------------- | ------------------------------------------------------ |
| `vitest.config.ts`     | Two projects: `unit` (Node) + `storybook` (browser)    |
| `playwright.config.ts` | E2E config — chromium, `pnpm dev` web server           |
| `knip.config.ts`       | Dead export / unused dependency analysis               |
| `src-tauri/deny.toml`  | Allowed licenses + advisory ignore list                |
| `rust-toolchain.toml`  | Pins stable Rust channel                               |
| `.prettierrc`          | Formatter — singleQuote, 100 cols, TW v4 class sorting |
| `justfile`             | All task recipes (`just --list`)                       |
