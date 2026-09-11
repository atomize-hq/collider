> Historical Stage 1 architecture context. Current ownership and execution are in
> [consumer documentation](../current.md); verify planned directories against the tree.

# Architecture

**Status:** Stage 1 — baseline locked
**Date:** 2026-03-23

---

## Stack

| Layer             | Technology                         | Version        |
| ----------------- | ---------------------------------- | -------------- |
| UI framework      | Next.js App Router                 | ^16.1.7        |
| Styling           | Tailwind CSS v4                    | 4.2.1          |
| Desktop shell     | Tauri                              | v2.10.3        |
| Language          | TypeScript (strict)                | 5.9.3          |
| Package manager   | pnpm                               | 10.11.1        |
| Build tool        | Turbopack (dev) / Next.js build    | —              |
| Test runner       | Vitest + Playwright                | 4.1.0 / 1.58.2 |
| Component surface | Storybook                          | 10.2.19        |
| Design tokens     | Installed ds-skills token compiler | pinned release |

---

## Desktop-safe rendering assumptions

The shipped Collider desktop app is a **static-export** Next.js bundle loaded by Tauri's embedded WebView. This defines two hard constraints:

1. **No always-on Next.js server.** Core desktop flows must work from the static export (`out/`). Server-only Next.js features (route handlers, RSC with dynamic data, middleware) are not available in the shipped binary. They may be used in dev/test contexts only.

2. **No Node.js browser APIs.** Frontend code runs in WebView, not Node. Do not call `fs`, `path`, `process`, or other Node globals from React code. All privileged work goes through Tauri.

`next.config.ts` enforces this: `output: 'export'` is conditional on `TAURI=true`. The `pnpm build:tauri` script sets that env var; normal `next build` is unrestricted for dev/CI purposes.

---

## Frontend / native boundary

```
React (WebView)
    ↕  invoke / listen
src/bridge/  ← typed adapter layer
    ↕
Tauri commands / events (Rust)
    ↕
OS / filesystem / shell
```

- **React code** only calls typed bridge functions. No raw `window.__TAURI__` calls outside `src/bridge/`.
- **`src/bridge/`** owns the TypeScript type contract for every Tauri command and event. Each bridge module corresponds to one domain (e.g., `src/bridge/shell.ts`, `src/bridge/fs.ts`).
- **Rust side** (`src-tauri/src/lib.rs`) registers commands and handles capabilities.
- **Storybook** mocks bridge modules. No story should require a live Tauri context to render or interact.

---

## Folder structure

```
src/
├── app/                    Next.js App Router (route shells, pages, layouts)
├── bridge/                 Typed Tauri bridge adapters  [EMPTY — to build]
├── components/
│   ├── system/             Design-system primitives  [EMPTY — to build]
│   ├── ai-elements/        AI conversation primitives  [EMPTY — to build]
│   └── editor/             Plate editor wrappers  [EMPTY — to build]
├── features/               Feature-local composition  [EMPTY — to build]
├── figma/                  Figma sync ledger, proofs, policy docs
└── lib/
    ├── tokens/             Runtime CSS token exports + governance tests
    └── chromatic/          Chromatic review test contracts

storybook/
├── stories/                Story files (also src/**/*.stories.tsx)
├── component-specs/        Per-component spec JSON records
├── story-specs/            [EMPTY — story spec records to land here]
└── *.json / *.md           Governance contracts, policy, taxonomy

figma/                     Consumer plugin configuration and foundations data

design-tokens/
├── src/tokens/             Authoring source (Tokens Studio JSON)
└── dist/                   Build output (CSS, TS, Figma JSON)
```

---

## AI Elements / Plate ownership split

### AI Elements — owns conversational UI

`src/components/ai-elements/` wraps all presentational AI primitives:

- Message rows (user / assistant variants)
- Code blocks (with syntax highlight, copy action)
- Citations / source references
- Composer (text input + send controls)
- Loaders / thinking indicators
- Tool call / result rows

The app owns transport, streaming, and history. AI Elements owns rendering these shapes. Do not spread raw vendor or ad-hoc implementations across `src/app/` or `src/features/`.

If/when an upstream `ai-elements` library is added as a dependency, the wrappers in `src/components/ai-elements/` are the translation layer between the library API and the Collider design system (tokens, variants and application models).

### Plate — owns rich editing and document structure

`src/components/editor/` wraps all Plate editor instances:

- Base editor kit (plugins, serialization)
- Toolbar/controls
- AI-assisted edit surface (inserts into the editor; does not replace it)

Plate is not yet planned for the first primitives wave. When the editor feature is scoped, define plugin choices, serialization strategy, and AI-edit entry points here before implementation.

### Shared rules

- Neither AI Elements nor Plate handles transport, persistence, or Tauri commands. That belongs to `src/bridge/` and `src/features/`.
- Every AI Elements and Plate wrapper must have a Storybook story before it enters the round-trip loop.
- Component specs record actual design-node references under `downstreamHooks.figmaComponentRef`; token publication remains independent.

---

## Static export safety checklist

Before any new route, layout, or feature is introduced:

- [ ] Uses only static or client-side data fetching in shipped desktop flows
- [ ] Does not call Node.js APIs directly (use `src/bridge/` instead)
- [ ] Tauri command calls are gated behind the bridge adapter
- [ ] Storybook story can render without a live Tauri process
- [ ] Applicable AGENTS.md LOC limits and executable guards pass; historical limits do not override current instructions
