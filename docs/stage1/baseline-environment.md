# Baseline Environment

**Status:** Stage 1 — baseline locked
**Date:** 2026-03-23

---

## App setup

| Concern    | Choice                                      | Notes                                                                                                                                            |
| ---------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Framework  | Next.js 16 App Router                       | Turbopack for dev                                                                                                                                |
| Styling    | Tailwind v4 + CSS custom properties         | Token vars feed Tailwind theme                                                                                                                   |
| Desktop    | Tauri v2 static-export bundle               | `pnpm build:tauri` → `out/` → loaded by Tauri                                                                                                    |
| Fonts      | Poppins (UI sans) + Roboto Mono (code/data) | Declared in `design-tokens/src/tokens/font.tokens.json`; webfonts imported and `--font-sans` / `--font-mono` bound in `src/lib/tokens/fonts.css` |
| Path alias | `@/*` → `./src/*`                           | Defined in `tsconfig.json`                                                                                                                       |
| Lint       | ESLint 9 + Prettier 3                       | Enforced in pre-commit hooks                                                                                                                     |
| Dead code  | Knip                                        | `pnpm check`                                                                                                                                     |

---

## Storybook setup

See also: `.storybook/storybook-version-policy.json` and `docs/stage1/storybook-baseline.md`.

| Concern         | Choice                                                                        |
| --------------- | ----------------------------------------------------------------------------- |
| Framework       | `@storybook/nextjs-vite` 10.2.19                                              |
| Port            | 6006 (default)                                                                |
| Story locations | `src/**/*.stories.@(ts\|tsx)` and `storybook/stories/**/*.stories.@(ts\|tsx)` |
| CSS             | `src/lib/tokens/tokens.css` imported in `preview.ts`                          |
| Theme provider  | `data-theme` wrapper div set by toolbar selection                             |
| Layout          | fullscreen (no padding frame)                                                 |

---

## Design token pipeline

```
design-tokens/src/tokens/   ← Authoring (Tokens Studio JSON)
        ↓  pnpm build:tokens
design-tokens/dist/
  css/tokens.css             ← Runtime CSS custom properties
  tokens.ts                  ← TypeScript token map
  figma/tokens.json          ← Figma variables upload payload
        ↓  copied / imported
src/lib/tokens/tokens.css    ← Storybook + app runtime
```

Token build uses Style Dictionary v5 with Tokens Studio transforms. Run `pnpm build:tokens` after editing source tokens. Generated files must not be hand-edited.

---

## Build / dev commands

All day-to-day commands go through `just`. Never call `pnpm` scripts directly for the standard lifecycle.

| Command                       | Purpose                                                 |
| ----------------------------- | ------------------------------------------------------- |
| `just check`                  | Fast lint / format / typecheck (TS + Rust)              |
| `just fmt`                    | Auto-format everything                                  |
| `just test-all`               | Unit + Storybook + Rust tests                           |
| `just preflight`              | **Run before every push.** Checks + LOC guards + tests  |
| `just sweep`                  | Deep analysis (preflight + coverage + e2e)              |
| `just loc`                    | LOC guards only                                         |
| `pnpm storybook`              | Storybook dev server (port 6006)                        |
| `pnpm tauri:dev`              | Tauri desktop dev (starts Next.js + Tauri)              |
| `pnpm build:tauri`            | Static-export build for Tauri bundle                    |
| `pnpm build:tokens`           | Rebuild design tokens from source                       |
| `pnpm figma:connect:validate` | Optional Code Connect CLI check; account-tier dependent |
| `pnpm figma:connect:publish`  | Publish to Figma Dev Mode (token required)              |

---

## Pre-push and CI

- `just preflight` must pass locally before every push. No exceptions.
- Pre-commit hooks (Husky + lint-staged) run ESLint + Prettier on staged files.
- Husky hooks mirror CI. Local pass = CI pass.
- LOC guards are enforced in `just preflight`: TSX/TS ≤300, Rust ≤400 code lines.

---

## Baseline verification checklist

Run this before declaring the environment ready for Stage 2:

- [ ] `just check` passes (ESLint, TypeScript, Rust clippy)
- [ ] `just test-all` passes (Vitest unit + Storybook browser tests)
- [ ] `pnpm storybook` launches at localhost:6006 with no errors
- [ ] `pnpm build:tokens` produces `src/lib/tokens/tokens.css` and `design-tokens/dist/`
- [ ] Repo-owned Figma plugin rail, Figma MCP, and figma-use surfaces are documented for Figma-side work
- [ ] `pnpm build:tauri` produces `out/` without errors
- [ ] `just preflight` passes end-to-end

---

## Storybook addon inventory

| Addon              | Package                    | Purpose                              |
| ------------------ | -------------------------- | ------------------------------------ |
| Vitest integration | `@storybook/addon-vitest`  | Browser-based story tests via Vitest |
| Accessibility      | `@storybook/addon-a11y`    | WCAG a11y panel + violations         |
| Design links       | `@storybook/addon-designs` | Figma frame embeds in story panel    |
| Visual review      | `@chromatic-com/storybook` | Chromatic snapshot and review        |

Do not add `@storybook/addon-interactions` or `@storybook/experimental-addon-test`. These are superseded by `addon-vitest` in Storybook 10. See version policy.
