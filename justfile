# Collider — justfile
# Run `just` to see available recipes, `just <recipe>` to run one.
# Requires: just (brew install just)

# ── Default: list all recipes ──────────────────────────────────────────────────
default:
    @just --list

# ══════════════════════════════════════════════════════════════════════════════
# PREFLIGHT — mandatory gate before every push
# Local token/proof/static/LOC/test gate; CI additionally builds and enforces external
# visual review and promotion. A local pass does not guarantee CI success.
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
reusable-component-promotion profile consumer:
    pnpm govern:reusable-component-promotion --profile {{quote(profile)}} --consumer {{quote(consumer)}}

# Build the installed product's Figma token sync plugin for this consumer
figma-plugin-build:
    pnpm figma:plugin:build

# Serve the token artifact with permissive CORS headers (for plugin URL fetch)
figma-token-server:
    pnpm figma:tokens:serve

# ══════════════════════════════════════════════════════════════════════════════
# DS-SKILLS — the pinned design-system CLI
# Collider runs the release named in ds-skills.release.json, resolved at its
# version-specific path. An ambient `ds-skills` on your PATH is never used and
# is never executed — not even to read its version.
#
# Provisioning is explicit and one-time. `just preflight` acquires nothing: if
# the release is missing it fails and tells you to run the install recipe.
# An already verified installation does not need the network for local gates.
# ══════════════════════════════════════════════════════════════════════════════

# Install core discovery, then the separately accepted custom curation on both surfaces.
# Explicit upgrades refuse edited/unowned outputs; stale acceptance must be reviewed first.
ds-skills-install:
    pnpm ds-skills:install
    node .ds-skills/project.mjs curation install --config ds-skills.project.json

# Verify the sealed release, launcher and discovery assets — acquires nothing
ds-skills-check:
    pnpm ds-skills:check
    node .ds-skills/project.mjs curation check --config ds-skills.project.json
    node .ds-skills/project.mjs curation installed check --config ds-skills.project.json

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

# Consumer-owned invariants and static imports/slots, evaluated by installed ds-skills.
# Offline checks do not establish upstream freshness, runtime behavior or publication.
check-upstream:
    @echo "── upstream policy ───────────────────────────"
    pnpm validate:upstream-policy
    pnpm baseline:upstream:check

# Slot owners are derived from selected source; no stored API mirror or enrollment.
# Use `pnpm validate:consumer-contract --json` for the evaluated API/slot report.
check-contract:
    @echo "── consumer contract ─────────────────────────"
    pnpm validate:consumer-contract

# Fast Rust check: fmt + clippy
check-rs:
    @echo "── cargo fmt ─────────────────────────────────"
    pnpm cargo:fmt:check
    @echo "── clippy ────────────────────────────────────"
    pnpm cargo:clippy

# Fast full check: TS + upstream policy + Rust
check: ds-skills-check check-ts check-upstream check-contract check-rs

# ══════════════════════════════════════════════════════════════════════════════
# LOC — lines-of-code guards via tokei (code lines only; blanks + comments excluded)
#   Rust  src-tauri/src/**/*.rs   max 400 code lines
#   TSX   src/**/*.tsx            max 200 code lines
#   TS    src/**/*.ts             max 300 code lines
#   test and story files are excluded from the TS check
#
# The normal recipe enforces the existing AGENTS policy without relaxing it.
# Its focused regression test checks both exact limits and their first failing values.
# ══════════════════════════════════════════════════════════════════════════════

# Check Rust file sizes via tokei (max 400 code lines)
loc-rs:
    tokei --files --output json src-tauri/src | node scripts/validate-loc.mjs rs 400

# Check TSX <=200 and TS <=300 code lines (excludes tests + stories).
loc-ts:
    node --test scripts/validate-loc.test.mjs
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
# Complement to preflight: coverage, knip, cargo-deny, machete and e2e.
# Does not replace preflight token/proof/install/upstream/contract checks; both are required.
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
