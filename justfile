# Collider — justfile
# Run `just` to see available recipes, `just <recipe>` to run one.
# Requires: just (brew install just)

# ── Default: list all recipes ──────────────────────────────────────────────────
default:
    @just --list

# ══════════════════════════════════════════════════════════════════════════════
# DEV — start local servers
# ══════════════════════════════════════════════════════════════════════════════

# Start Next.js dev server (Turbopack)
dev:
    pnpm dev

# Start Tauri desktop dev (builds Next.js + wraps in WebView)
dev-tauri:
    pnpm tauri:dev

# Start Storybook component explorer
storybook:
    pnpm storybook

# ══════════════════════════════════════════════════════════════════════════════
# FMT — auto-format (write)
# ══════════════════════════════════════════════════════════════════════════════

# Format all TS/JS/JSON/CSS with Prettier
fmt-ts:
    pnpm format

# Format all Rust files with cargo fmt
fmt-rs:
    pnpm cargo:fmt

# Format everything (TS + Rust)
fmt: fmt-ts fmt-rs

# ══════════════════════════════════════════════════════════════════════════════
# CHECK — fast, read-only gate (no tests)
# Run these before committing. Each finishes in seconds.
# ══════════════════════════════════════════════════════════════════════════════

# Fast TS check: format + types + lint
check-ts:
    @echo "── prettier ──────────────────────────────────"
    pnpm format:check
    @echo "── tsc ───────────────────────────────────────"
    pnpm typecheck
    @echo "── eslint ────────────────────────────────────"
    pnpm exec eslint .

# Fast Rust check: fmt + clippy
check-rs:
    @echo "── cargo fmt ─────────────────────────────────"
    pnpm cargo:fmt:check
    @echo "── clippy ────────────────────────────────────"
    pnpm cargo:clippy

# Fast full check: TS + Rust
check: check-ts check-rs

# ══════════════════════════════════════════════════════════════════════════════
# TEST — unit + component tests
# ══════════════════════════════════════════════════════════════════════════════

# Run vitest unit suite (Node, fast)
test:
    pnpm test

# Run vitest unit suite in watch mode
test-watch:
    pnpm test:watch

# Run vitest with coverage report
test-cov:
    pnpm test:coverage

# Run Storybook component tests (browser/Playwright)
test-storybook:
    pnpm test:storybook

# Run Rust unit tests via cargo-nextest
test-rs:
    pnpm cargo:test

# Run all automated tests: unit + storybook component + Rust (no e2e server needed)
test-all: test test-storybook test-rs

# ══════════════════════════════════════════════════════════════════════════════
# E2E / UX — browser-facing tests
# ══════════════════════════════════════════════════════════════════════════════

# Run Playwright e2e tests (headless, starts Next.js dev server)
e2e:
    pnpm test:e2e

# Run all UI-layer tests: storybook component tests + Playwright e2e
test-ux: test-storybook e2e

# ── Interactive dev tools (open a UI, don't use in CI) ──────────────────────

# Open Vitest browser UI dashboard (all projects, interactive)
test-ui:
    pnpm test:ui

# Open Playwright UI (interactive test runner / trace viewer)
e2e-ui:
    pnpm test:e2e:ui

# ══════════════════════════════════════════════════════════════════════════════
# SWEEP — deep, thorough analysis (slow, run before PR/merge)
# ══════════════════════════════════════════════════════════════════════════════

# Deep TS sweep: format + types + lint + unit tests + coverage + knip
sweep-ts:
    @echo "── prettier ──────────────────────────────────"
    pnpm format:check
    @echo "── tsc ───────────────────────────────────────"
    pnpm typecheck
    @echo "── eslint ────────────────────────────────────"
    pnpm exec eslint .
    @echo "── vitest unit + coverage ────────────────────"
    pnpm test:coverage
    @echo "── knip (dead code/deps) ─────────────────────"
    pnpm check

# Deep Rust sweep: fmt + clippy + nextest + deny + machete
sweep-rs:
    @echo "── cargo fmt ─────────────────────────────────"
    pnpm cargo:fmt:check
    @echo "── clippy ────────────────────────────────────"
    pnpm cargo:clippy
    @echo "── nextest ───────────────────────────────────"
    pnpm cargo:test
    @echo "── cargo-deny (licenses + advisories) ────────"
    pnpm cargo:deny
    @echo "── cargo-machete (unused deps) ───────────────"
    pnpm cargo:machete

# Full sweep: deep TS + deep Rust + storybook component tests + e2e
sweep: sweep-ts sweep-rs test-ux

# ══════════════════════════════════════════════════════════════════════════════
# BUILD — production artifacts
# ══════════════════════════════════════════════════════════════════════════════

# Build Next.js for production
build:
    pnpm build

# Build Tauri desktop app
build-tauri:
    pnpm tauri:build

# Build Storybook static site
build-storybook:
    pnpm storybook:build
