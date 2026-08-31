# Stage 1 — Phase 2 Foundation-Token Buildout Plan

**Date:** 2026-08-31
**Prerequisite:** [ds-gap-audit-2026-08-30.md](./ds-gap-audit-2026-08-30.md) — read that first for context on why Phase 2 exists.
**Governs:** the seven token file writes (tasks #11–17) + Phase 3 Figma republish (task #18).

This plan is intentionally durable — a fresh session should be able to pick it up from cold.

---

## 0. What Phase 2 actually is

Phase 2 extends and repairs a **live token pipeline that already has downstream consumers**. It is NOT a green-field token authoring pass.

The live pipeline today:

```
design-tokens/src/tokens/*.tokens.json
    │
    ▼  pnpm build:tokens (node design-tokens/build/build-tokens.mjs)
    │
design-tokens/dist/tokens.ts + dist/css/tokens.css + dist/figma/tokens.json
    │
    ├─▶ src/lib/tokens/tokens.css  (mirror of dist for src consumers)
    │       │
    │       ▼  imported by src/app/globals.css
    │       │
    │       ▼  Tailwind v4 dual config:
    │           - tailwind.config.ts extends via var(--*) references
    │           - globals.css @theme inline maps shadcn semantic roles
    │       │
    │       ▼  consumed by:
    │           - 32 ai-elements components (src/components/ai-elements/*)
    │           - 24 shadcn ui/* primitives
    │           - Storybook rendering (via .storybook/preview.ts → globals.css)
    │
    └─▶ dist/figma/tokens.json
            │
            ▼  pnpm figma:tokens:serve  (local CORS server)
            │
            ▼  figma/plugins/collider-token-sync (built via pnpm figma:plugin:build)
            │       runs INSIDE Figma; fetches from local server; upserts variables
            │
            ▼  Collider Figma file (23PLdynlRYoBYQx9teoC8A)
            │       597 vars materialized as of 2026-08-18 publish-proof
            │       32 ComponentSets bind their fills to these VariableIDs
            │
            ▼  Ledger: src/figma/sync-ledger.json
            ▼  Proof: src/figma/publish-proof.json
            ▼  Validators: pnpm validate:sync-ledger / validate:publish-proof / validate:figma-parity
```

**Consequence for every Phase 2 write:** touching a token file has cascade effects across 32 seeded Figma ComponentSets + Storybook + ai-elements + shadcn ui/\*. Additive changes (new tokens with no existing consumer) are safe; value changes to tokens that already have consumers are downstream visual changes.

---

## 1. Governing decisions (all resolved)

| ID       | Decision                | Value                                                                 | Source                                                    |
| -------- | ----------------------- | --------------------------------------------------------------------- | --------------------------------------------------------- |
| Phase 1  | Font-family policy      | Poppins (font/sans) + Roboto Mono (font/mono). No serif.              | Collider-Old typography samples (nodes 401:1116→401:1122) |
| Phase 1b | Token-naming philosophy | Hybrid — raw scale block + semantic alias block per file              | User 2026-08-31                                           |
| Q2       | Token file location     | Flat under `design-tokens/src/tokens/` alongside existing files       | Default (not asked, low-stakes)                           |
| Q3       | Elevation modes         | Dark-only single values (add modes later if light theme materializes) | User 2026-08-31                                           |
| Q4       | Semantic token naming   | Keep current dotted convention (`color.background.base`) — no sweep   | User 2026-08-31                                           |
| Q5       | Type-size ramp density  | 2pt Collider-tuned: 10/12/14/16/18/20/24 (7 sizes)                    | User 2026-08-31                                           |
| Q6       | Shape-file split        | Bundle radius + opacity + border-widths into one `shape.tokens.json`  | User 2026-08-31                                           |

---

## 2. Per-file specs (concrete, ready to author)

Every file uses the **hybrid pattern**: two sections — raw scale block + semantic alias block referencing the scale.

### File 1 — `text.tokens.json` (new)

**Raw scale:**

- `font.sans` = `"Poppins"` (string)
- `font.mono` = `"Roboto Mono"` (string)
- `weight.regular` = 400, `weight.medium` = 500, `weight.semibold` = 600, `weight.bold` = 700
- `size.xs` = 10, `size.sm` = 12, `size.base` = 14, `size.md` = 16, `size.lg` = 18, `size.xl` = 20, `size.2xl` = 24
- `leading.tight` = 1.2, `leading.normal` = 1.5, `leading.relaxed` = 1.75 (values TBD from designer intent)
- `tracking.normal` = 0, `tracking.wide` = 0.025em

**Semantic aliases** (from Collider-Old TYPOGRAPHY frame):

- `text.path` → `size.md` (16, matches Path text sample)
- `text.output-line` → `size.md` (16, matches OutputLine samples)
- `text.secondary` → `size.sm` (12, matches Secondary sample)
- `text.status-letter` → `size.xs` (10, matches Status letter sample)

**Downstream wiring required:**

- **`tailwind.config.ts`:** add `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing` extends referencing `var(--text-size-*)`, `var(--text-weight-*)`, `var(--text-leading-*)`, `var(--text-tracking-*)`
- **`src/lib/tokens/fonts.css`:** bump Google Fonts URL to include Poppins 700 (fix for the existing `font-bold` bug — being handled separately as the warm-up commit, done before this file lands so we don't conflate)
- **`token-runtime-compatibility-surface.json`:** likely no change needed (typography sizes are Tailwind-utility-consumed, not runtime-computed by components)

### File 2 — `motion.tokens.json` (replace stub)

**Raw scale:**

- `duration.instant` = 80, `duration.fast` = 130, `duration.base` = 190, `duration.slow` = 280, `duration.slower` = 420 (all ms)
- `easing.out` = `"cubic-bezier(0.22, 0.61, 0.20, 1)"` (Atomize starting point)
- `easing.in-out` = `"cubic-bezier(0.45, 0, 0.20, 1)"`
- `easing.spring` = `"cubic-bezier(0.34, 1.30, 0.50, 1)"`

**Semantic aliases** (seed minimal; grow as consumers emerge):

- `motion.hover` → `duration.instant` + `easing.out`
- `motion.appear` → `duration.base` + `easing.out`
- `motion.dismiss` → `duration.fast` + `easing.in-out`

**Downstream wiring:**

- **`tailwind.config.ts`:** add `transitionDuration`, `transitionTimingFunction` extends
- Delete the `"placeholder": { "durationQuick": "150ms" }` stub — nothing consumes it (verified by grepping)

### File 3 — `elevation.tokens.json` (new)

**Raw scale** (5 dark-only levels):

- `elevation.0` = `"none"` (no shadow — flat)
- `elevation.1` = `"0 1px 2px rgba(0,0,0,0.4)"` (subtle raise, cards)
- `elevation.2` = `"0 2px 6px rgba(0,0,0,0.5)"` (dropdown, tooltip)
- `elevation.3` = `"0 4px 12px rgba(0,0,0,0.6)"` (popover)
- `elevation.4` = `"0 12px 32px rgba(0,0,0,0.7)"` (modal, sheet)

Note: values above are placeholders — refine against actual visual need during authoring. Atomize uses 7 mode-aware shadow color tokens; we're collapsing to dark-only single-value shadows per Q3.

**Semantic aliases:**

- `elevation.card` → `elevation.1`
- `elevation.dropdown` → `elevation.2`
- `elevation.tooltip` → `elevation.2`
- `elevation.popover` → `elevation.3`
- `elevation.modal` → `elevation.4`
- `elevation.sheet` → `elevation.4`

**Downstream wiring:**

- **`tailwind.config.ts`:** add `boxShadow` extend

### File 4 — `layout.tokens.json` (new)

**Raw scale** (5 container widths + gutter — Collider is desktop, doesn't need marketing-page sizes):

- `container.narrow` = 540
- `container.prose` = 680
- `container.page` = 1060
- `container.doc` = 1160
- `container.max` = 1200
- `gutter.default` = 24
- `gutter.tight` = 16

**Semantic aliases** — same as raw for containers (`.narrow`, `.prose`, `.page` are already semantic); grow if usage patterns diverge.

**Downstream wiring:**

- **`tailwind.config.ts`:** add `maxWidth` extend for containers

### File 5 — `shape.tokens.json` (new, bundled per Q6)

**Radius raw scale:**

- `radius.none` = 0, `radius.2xs` = 1, `radius.xs` = 3, `radius.sm` = 2, `radius.md` = 5, `radius.lg` = 8, `radius.xl` = 12, `radius.2xl` = 16, `radius.pill` = 24, `radius.full` = 9999

Note: **`radius.md` moves from current 4px → 5px** to match Collider-Old's badge/hints value. This is a value change with downstream visual consequence for every existing `rounded-md` consumer. Alternative: keep `.md` = 4px and add `.md-strong` = 5px. Decide during authoring based on visual regression tolerance. If value change: needs explicit spot-check across cards/badges/buttons.

**Radius semantic aliases** (from Collider-Old BORDER RADIUS frame):

- `radius.keycap` → `radius.2xs` (2px) — Collider-Old measured 2px
- `radius.toolbar-btn` → `radius.xs` (3px) — Collider-Old measured 3px
- `radius.git-file-row` → `radius.sm` (2px) — CAUTION: current sm=2px but Collider-Old measured 4px for git-file-row. **Discrepancy → add `radius.sm-plus` = 4px OR remap current sm=2 to sm=4 (breaking). Flag for user decision.**
- `radius.badge` → `radius.md` (5px per Collider-Old) — see radius.md note above
- `radius.hints-bar` → `radius.md` (5px)

**Opacity raw scale:**

- `opacity.disabled` = 0.35 (35% — Collider-Old inactive)
- `opacity.subtle` = 0.5 (50% — Collider-Old dot-sep)
- `opacity.dim` = 0.7 (70% — Collider-Old branch-container)
- `opacity.full` = 1 (100%)

**Opacity semantic aliases:**

- `opacity.inactive` → `opacity.disabled`
- `opacity.dot-sep` → `opacity.subtle`
- `opacity.branch-container` → `opacity.dim`

**Border width raw scale:**

- `border.width.default` = 1
- `border.width.strong` = 2

**Downstream wiring:**

- **`tailwind.config.ts`:** already has `borderRadius` extend (7 values → expand to 10). Add `opacity` extend. Add `borderWidth` extend.
- **`globals.css`:** `@theme inline` may need updates if any of these tokens become shadcn-role-mapped

### File 6 — Extend `semantic.tokens.json`

Existing tokens keep their names/values. Additions:

**Background (add 1):**

- `color.background.raised` — between `base` (#171717) and `elevated` (#2a2a2a). Value TBD.

**Surface (new bucket, 3):**

- `color.surface.card`
- `color.surface.sunken`
- `color.surface.input`

**Border (extend from 1 to 3):**

- `color.border.default` — same value as current `border` var (from stream A: `#8A9AAF` in Collider-Old, may need to reconsider — no existing `border` semantic token in code today; only `theme.tokens.json` has a `border` role at `#e5e5e5` which is wrong for dark)
- `color.border.strong`
- `color.border.faint`

**Text (extend from 10 to 13):**

- `color.text.muted` — between `secondary` and `dim`
- `color.text.subtle`
- `color.text.faint`

**Accent (extend from 1 to 6):**

- `color.accent.hover`
- `color.accent.contrast`
- `color.accent.tint`
- `color.accent.line`
- (`color.accent.base` + `color.accent.text` already exist under `accent.tokens.json` — verify shape)

**Interaction (new bucket, 2):**

- `color.focus-ring`
- `color.selection`

**Derived alpha tints (new bucket, 13):**

- `color.derived.positive.a12`, `.a14`, `.a35`, `.a40`
- `color.derived.warning.a12`, `.a14`, `.a35`, `.a40`
- `color.derived.critical.a12`, `.a14`, `.a35`, `.a40`, `.a45`

**Values:** need to source from Collider-Old-consistent palette derivations. Some are alpha-over-transparent variants of functional colors. Author these during the file 6 pass, not upfront.

**Downstream wiring:**

- **`globals.css` `@theme inline`:** consider whether new shadcn-role mappings need to reference these
- **`token-runtime-compatibility-surface.json`:** likely no change — components consume via Tailwind classes, not direct custom-property lookup

### File 7 — Extend `spacing.tokens.json`

**Add sub-steps:**

- `spacing.0-5` = 2, `spacing.1-5` = 6, `spacing.2-5` = 10, `spacing.7` = 28

**Add larger steps:**

- `spacing.14` = 56, `spacing.16` = 64, `spacing.20` = 80, `spacing.24` = 96, `spacing.32` = 128

**Semantic aliases** (from Collider-Old SPACING/GAPS + PADDINGS frames — values NOT YET PROBED):

- Gaps: `spacing.toolbar-btn.gap`, `spacing.hint-key.gap`, `spacing.hint-open.gap`, `spacing.hints-bar.gap`, `spacing.git-file-row.gap`, `spacing.header-path.gap`, `spacing.branch-inner.gap`
- Paddings: `spacing.block-header.pl`, `spacing.block-header.py`, `spacing.hints-bar.px`, `spacing.hints-bar.py`, `spacing.keycap.px`, `spacing.git-file-row.pl`

**PROBE REQUIRED BEFORE WRITING FILE 7:**

Live-probe Collider-Old's `SPACING/GAPS` frame (403:1748) and `PADDINGS` frame (403:1781) via `figma-use node get` on each child to extract actual pixel values. Then map aliases to the closest raw scale step.

**Downstream wiring:**

- **`tailwind.config.ts`:** already has `spacing` extend (10 values → expand). Semantic aliases can be added as custom utilities if desired (or just referenced as `var(--spacing-*)` inline).

---

## 3. Per-file execution checklist (repeat 7 times)

Every Phase 2 file follows this 10-step drill:

1. **Edit** `design-tokens/src/tokens/<file>.tokens.json` (raw scale + semantic aliases per hybrid pattern).
2. **Extend** `tailwind.config.ts` with the matching category, referencing `var(--*)`.
3. **Extend** `globals.css` `@theme inline` if any new shadcn-role mappings emerge (rare for foundation additions).
4. **Build tokens:** `pnpm build:tokens` — regenerates `src/lib/tokens/tokens.css` + `design-tokens/dist/tokens.ts`.
5. **Font-face check:** if font weights change, bump `src/lib/tokens/fonts.css` Google Fonts URL. (Poppins 700 is fixed as the warm-up, before file 1.)
6. **Runtime compat check:** update `scripts/token-runtime-compatibility-surface.json` ONLY if runtime code will depend on new custom properties. Foundation additions usually don't need this.
7. **Preflight:** `just preflight` — 5 gates in order:
   - `pnpm govern:tokens` (token governance)
   - `just storybook-proof` (storybook proof ratchet)
   - `just check` (lint + typecheck + Rust check)
   - `just loc` (LOC guards)
   - `just test-all` (unit + storybook + Rust)
     Must pass all 5 before commit.
8. **Storybook visual pass:** open Storybook (`pnpm storybook`), spot-check 3–5 story surfaces relevant to the changed category. Catch unintended visual regressions in the 32 ai-elements + 24 shadcn ui/\* consumers.
9. **Commit:** one commit per file, clear scope in the message (`feat(tokens): add elevation.tokens.json` etc.).
10. **Continue** to the next file.

**Note on step 7:** `just preflight` is a hard gate that mirrors CI. If it fails, do NOT push — diagnose and fix locally.

---

## 4. Ordering + rationale

Order matters because later files consume decisions or wiring from earlier files:

1. **`text.tokens.json`** — foundation for every visible surface. Needed for typography discipline in Stage 3.
2. **`motion.tokens.json`** — foundation for every animated interaction. Independent of typography.
3. **`elevation.tokens.json`** — foundation for layered surfaces. Independent.
4. **`layout.tokens.json`** — foundation for shells and screens. Independent.
5. **`shape.tokens.json`** — extends radius + opacity + border-widths. Independent, but has a potential breaking change (`radius.md` value) that needs visual regression care.
6. **Extend `semantic.tokens.json`** — additive semantic color extensions. Independent.
7. **Extend `spacing.tokens.json`** — needs the pre-probe of Collider-Old spacing values before writing.

Alternate ordering acceptable if a Stage 3 assembly loop suddenly needs elevation or containers before typography; the plan is flexible.

---

## 5. Phase 3 — Figma republish (task #18)

**Batch, not per-file.** Publish all 7 file changes in one Figma publish sweep at the end. The plugin is idempotent (upsert) and preserves VariableIDs.

Steps:

1. **Confirm baseline state** — `pnpm validate:sync-ledger`, `pnpm validate:publish-proof`, `pnpm validate:figma-parity`. Should all pass before publish.
2. **Build the plugin bundle:** `pnpm figma:plugin:build` (only needed if plugin code.ts was touched; otherwise the existing `code.js` is fine).
3. **Serve tokens locally:** `pnpm figma:tokens:serve` (starts a CORS-permissive server the plugin fetches from).
4. **In Figma:** open the Collider file (`23PLdynlRYoBYQx9teoC8A`) as the fronted tab.
5. **Import the plugin manifest** (Figma → Menu → Plugins → Development → Import plugin from manifest → `figma/plugins/collider-token-sync/manifest.json`).
6. **Run the plugin** from within Figma. It fetches from the local server and upserts variables. Preserves existing VariableIDs (like `2019:334` collection, `2019:370` text/primary, etc.).
7. **Update ledger + proof:**
   - `src/figma/sync-ledger.json` — bump `artifact.revision`, `verification.lastVerifiedRevision` to new git sha.
   - `src/figma/publish-proof.json` — bump `artifact.gitSha`, `materialization.attemptedAt`, update the `notes` field with the new variable count.
8. **Validate:** `pnpm validate:sync-ledger`, `pnpm validate:publish-proof`, `pnpm validate:figma-parity`. All must pass.
9. **Live spot-check in Figma:** verify a few new variables appear (e.g., `elevation/card`, `motion/duration/base`) with correct values.
10. **Commit** the ledger + proof updates.

---

## 6. Verification approach

**After each Phase 2 file lands:** `just preflight` + Storybook visual spot-check.

**After Phase 3 republish:** Figma spot-check + `validate:*` scripts.

**After all of Phase 2 + Phase 3 lands:** consider a `sync-quality-governor` skill pass to catch any drift between code / Storybook / Figma. This is the pre-Stage-3 handoff gate.

---

## 7. Known gotchas + banked learnings

From audit + prior loop memory:

- **`figma-use variable list --collection` ignores the filter** — returns all vars regardless. Group client-side by name prefix.
- **`figma-use path` is Vector path operations**, not "show current file." Infer file identity via `page list` fingerprint.
- **Two forked Figma files can share page IDs** (Collider-Old and Atomize both have `Primitives (401:1040)`). Verify by page-list fingerprint before probing.
- **Publish plugin is idempotent** (upsert, per commit f9e7e36). Preserves VariableIDs. Safe to re-run.
- **`just preflight` mirrors CI.** If it passes locally, CI passes.
- **Tailwind v4 dual config** — `tailwind.config.ts` extends + `globals.css @theme inline`. Both matter; think about both.
- **`radius.md` value change (4→5)** is a break to existing `rounded-md` consumers. If it lands, spot-check every card/badge/button story. Alternative: keep 4, add new step.

---

## 8. Open decisions (surface during authoring, not gating)

- **`radius.md` value:** keep 4 (safe) or move to 5 (Collider-Old fidelity)?
- **Radius sub-step naming:** `radius.sm` currently = 2px, Collider-Old wants sm-like = 2 (keycap) but git-file-row = 4. Add `radius.sm-plus` = 4 or remap?
- **Leading/tracking values:** the type-ramp step values (10-24) are locked; leading/tracking are estimates. Refine during file 1 authoring against actual visual need.
- **Elevation shadow values:** dark-only shadow specs are placeholders. Refine during file 3 authoring against actual visual need.
- **Derived alpha color values:** need palette derivation logic. Source from Atomize's a12/a14/a35/a40/a45 stops if useful, or compute from Collider functional colors.
- **Fonts.css weight expansion:** confirmed need for Poppins 700 (font-bold used 1x). Roboto Mono only used at 400/500 — no expansion needed unless a future component adopts mono bold.

---

## 9. What comes after Phase 2 + Phase 3

- **Sync-quality-governor pass** to catch any drift.
- **Update `docs/stage1/primitives-wave.md`** to reflect the reset — Wave 1 was AI Elements, that's done. Wave 2 is on hold; Stage 3 organisms come next.
- **Stage 3 planning** starts, using the new foundation vocabulary. First target: `conversation` assembly (per sandbox-loop memory).

---

## 10. Artifacts + references

- Prior audit: [ds-gap-audit-2026-08-30.md](./ds-gap-audit-2026-08-30.md)
- Superseded first-pass audit: [\_superseded-migration-audit-2026-08-29.md](./_superseded-migration-audit-2026-08-29.md)
- Live scratchpad dumps: `/private/tmp/.../scratchpad/audit/` (atomize-_, collider-old-_, code-inventory.txt)
- Memory files: `project_ds_gap_audit_2026-08-30.md`, `project_figma_token_sync_reconcile.md`
- Publish-plugin: `figma/plugins/collider-token-sync/`
- Token source: `design-tokens/src/tokens/*.tokens.json`
- Tailwind config: `tailwind.config.ts`
- Globals: `src/app/globals.css`
- Fonts: `src/lib/tokens/fonts.css`
- Component specs: `storybook/component-specs/*.json`
- Runtime compat surface: `scripts/token-runtime-compatibility-surface.json`
- Ledger + proof: `src/figma/sync-ledger.json`, `src/figma/publish-proof.json`
