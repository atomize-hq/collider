# Collider — justfile
# Run `just` to see available recipes, `just <recipe>` to run one.
# Requires: just (brew install just)

# ── Default: list all recipes ──────────────────────────────────────────────────
default:
    @just --list

# ══════════════════════════════════════════════════════════════════════════════
# PREFLIGHT — mandatory gate before every push
# Mirrors what CI enforces: token governance + Storybook proof gate + static checks + LOC guards + full test suite.
# If this passes locally, CI should pass too.
#   just preflight
# ══════════════════════════════════════════════════════════════════════════════

# Pre-push CI gate: token governance + Storybook proof gate + check + LOC guards + all automated tests
preflight:
    @echo ""
    @echo "╔══════════════════════════════════════════════════╗"
    @echo "║            PREFLIGHT — pre-push CI gate          ║"
    @echo "╚══════════════════════════════════════════════════╝"
    @echo ""
    @echo "▶ step 1/5 — token governance"
    pnpm govern:tokens
    @echo ""
    @echo "▶ step 2/5 — storybook proof gate"
    just storybook-proof
    @echo ""
    @echo "▶ step 3/5 — static checks"
    just check
    @echo ""
    @echo "▶ step 4/5 — LOC guards"
    just loc
    @echo ""
    @echo "▶ step 5/5 — automated tests"
    just test-all
    @echo ""
    @echo "✓ Preflight passed — safe to push"
    @echo ""

# ══════════════════════════════════════════════════════════════════════════════
# TOKENS — governance surface
# Runs the same seam-owned governance command that preflight uses.
# Use this when you want to exercise only the token gate.
# ══════════════════════════════════════════════════════════════════════════════

# Manual token governance path (same command used by preflight)
token-governance:
    pnpm govern:tokens

# Manual Storybook proof ratchet (same command used by preflight and CI)
storybook-proof:
    pnpm govern:storybook-proof

# Manual reusable-component promotion gate (consumer policy stays outside preflight for now)
reusable-component-promotion:
    pnpm govern:reusable-component-promotion

# Build the repo-owned Figma token sync plugin
figma-plugin-build:
    pnpm figma:plugin:build

# Serve the token artifact with permissive CORS headers (for plugin URL fetch)
figma-token-server:
    pnpm figma:tokens:serve

# Enterprise-only rail (Figma Variables REST API; requires Enterprise/full-seat access)
figma-sync-variables-enterprise:
    pnpm figma:sync:variables:enterprise

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

# Upstream policy: our intentional deviations from shadcn / ai-elements are still
# in place, and the upstream API we depend on has not been refactored away.
# No network — pattern-matches the working tree, finishes in milliseconds.
check-upstream:
    @echo "── upstream policy ───────────────────────────"
    pnpm validate:upstream-policy

# Fast Rust check: fmt + clippy
check-rs:
    @echo "── cargo fmt ─────────────────────────────────"
    pnpm cargo:fmt:check
    @echo "── clippy ────────────────────────────────────"
    pnpm cargo:clippy

# Fast full check: TS + upstream policy + Rust
check: check-ts check-upstream check-rs

# ══════════════════════════════════════════════════════════════════════════════
# LOC — lines-of-code guards via tokei (code lines only; blanks + comments excluded)
#   Rust  src-tauri/src/**/*.rs   max 400 code lines
#   TSX   src/**/*.tsx            max 200 code lines  (components / pages)
#   TS    src/**/*.ts             max 300 code lines  (hooks / utils / lib)
#   test and story files are excluded from the TS check
# ══════════════════════════════════════════════════════════════════════════════

# Check Rust file sizes via tokei (max 400 code lines)
loc-rs:
    tokei --files --output json src-tauri/src | node scripts/validate-loc.mjs rs 400

# Check TS/TSX file sizes via tokei (.tsx max 200, .ts max 300 — excludes tests + stories)
loc-ts:
    tokei --files --output json src | node scripts/validate-loc.mjs ts 200 300

# Check all file sizes: Rust + TS
loc: loc-rs loc-ts

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
# Superset of preflight: adds coverage, knip, cargo-deny, machete, e2e.
# ══════════════════════════════════════════════════════════════════════════════

# Deep TS sweep: format + types + lint + coverage + knip
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

# Full sweep: deep TS + deep Rust + LOC guards + storybook component tests + e2e
sweep: sweep-ts sweep-rs loc test-ux

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
