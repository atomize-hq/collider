# Stage 1 Revisit — Design System Robustness Gap Audit

**Date:** 2026-08-30
**Supersedes:** `_superseded-migration-audit-2026-08-29.md` (mis-scoped — the "old file" that doc analyzed turned out to be Atomize Systems, not Collider-Old, due to a Figma tab confusion).

**Purpose:** compare the CURRENT Collider design system against (a) Collider-Old's intended DS baseline and (b) Atomize Systems (a mature sister-project DS) to identify **completeness/robustness gaps** in the base design system BEFORE Stage 3 assembly begins. This is a gap-finding doc — not a migration plan.

**Sources probed (live via `figma-use` v0.13.1):**

- **Collider-Old** (`BSb9QaMzwE2mv0GQ63buQK`), Primitives page (`401:1040`), 8 pages total, 1 variable collection ("Colors", 23 vars).
- **Atomize Systems** (`9zqKYnNe48ihEY9tvWS1pO`), Foundations page (`96:2`), 9 pages total, 142 variables organized across 7 named collections.
- **Current Collider code**: `design-tokens/src/tokens/*` + `src/components/{ui,ai-elements,system,editor}/*`.

Note: Collider-Old and current Collider share fork ancestry (identical variable collection ID `424:1027`, matching color values). Atomize is a genuinely separate project — use as **reference for what a robust DS looks like**, not as a source to port from.

---

## TL;DR

Collider today has a **partial DS foundation**: colors are covered, spacing/radius are workable, but everything else is stubbed or missing. The gaps that will bite Stage 3 first, in severity order:

1. **CRITICAL: Typography — no type system.** The intended two-font pairing (Poppins for UI, Roboto Mono for code — confirmed via Collider-Old typography samples: 10/12/16px Poppins Regular for Path/Secondary/Status letters; 16px Roboto Mono Regular/Medium for OutputLine) is only half-wired: `font.tokens.json` correctly declares `Poppins`, but nothing consumes it (`tailwind-variables.tokens.json` sets Roboto Mono as the default, so mono renders everywhere). No size ramp, no weight scale, no line-height/tracking tokens, no font-family roles beyond the raw name. **Blocks:** any organism/screen that needs UI sans (headings, body, labels) distinct from code mono.
2. **CRITICAL: Motion — literal stub.** One "placeholder" token: `durationQuick: 150ms`. No easing curves. **Blocks:** every animated interaction, transitions, drawer/sheet/dialog motion, streaming/loading states, any Stage-3 workflow story with meaningful motion.
3. **HIGH: Elevation/shadow — zero tokens.** Nothing to make cards, modals, popovers, sheets, tooltips read as elevated surfaces. **Blocks:** every organism that uses layered surfaces.
4. **HIGH: Layout containers — zero tokens.** No `container/max`, `page`, `prose`, `lead`, `narrow`, `gutter`. **Blocks:** any route-level shell or content-width discipline in Stage 3.
5. **MEDIUM: Border/stroke widths — no tokens.** Border widths are hard-coded across components. **Blocks:** consistency at scale.
6. **MEDIUM: Semantic color structure — flat.** Missing the `bg / surface / border / text / accent / functional` role structure Atomize demonstrates; current tokens are usable but shallow. Also missing `focus-ring`, `selection`, and derived-alpha state tints.
7. **LOW: Spacing scale — coarse.** 10 steps vs Atomize's 19 (missing sub-steps 0.5, 1.5, 2.5, 7, and larger 16/20/24/32).

Everything else (radius, color hex values, spacing base grid, core semantic colors, StatusStrip semantics) is already in reasonable shape.

---

## Robust-DS reference: what Atomize Systems has

Atomize is deliberately organized. **142 variables** organized as:

### Color (39 semantic vars over a 13-anchor palette, all 2-mode light/dark)

- **Anchors** (13): `color/ink`, `slate`, `steel`, `teal`, `ivory`, `charcoal`, `slate-2`, `graphite`, plus 5 teal tints (bright/soft/deep/tint/tint-strong).
- **`color/bg/*`** (3): base, raised, elevated.
- **`color/surface/*`** (3): card, sunken, input.
- **`color/border/*`** (3): default, strong, faint.
- **`color/text/*`** (5): default, muted, subtle, faint, inverse.
- **`color/accent/*`** (6): base, text, hover, contrast, tint, line.
- **`color/functional/*`** (3): positive, warning, critical.
- **`color/focus-ring`**, **`color/selection`** — dedicated interaction tokens.
- **`color/derived/{positive,warning,critical}/{a12,a14,a35,a40,a45}`** (13) — alpha-tinted fills for state backgrounds/highlights.
- **`color/shadow/{xs,sm,md,lg,xl}-*`** (7) — elevation shadow colors (mode-aware).

### Typography (32 vars)

- **Font families** (3): `font/serif` = **Newsreader**, `font/sans` = **Inter**, `font/mono` = **IBM Plex Mono**.
- **Weights** (4): regular=400, medium=500, semibold=600, bold=700.
- **Leading** (4): tight, snug, normal, relaxed.
- **Tracking** (7): tighter, tight, normal, snug, wide, wider, widest.
- **Size ramp** (15 steps, non-uniform, hand-tuned): 4xs=9, 3xs=10, 2xs=11, xs=12, sm=13, base=14, md=15, lg=17, xl=20, 2xl=24, 3xl=30, 4xl=38, 5xl=48, 6xl=64, 7xl=84.

### Spacing (19 vars, sub-pixel grid)

`0, px, 0-5, 1, 1-5, 2, 2-5, 3, 4, 5, 6, 7, 8, 10, 12, 16, 20, 24, 32` — finer than Tailwind's default because of dense-UI use cases.

### Radius (9 vars)

`none, 2xs, xs, sm, md, lg, xl, 2xl, pill`. Plus `border/width` and `border/width-strong` in the same collection.

### Motion (8 vars)

- **Durations** (5): instant=80ms, fast=130, base=190, slow=280, slower=420.
- **Easings** (3): `out` = `cubic-bezier(0.22, 0.61, 0.20, 1)`, `in-out` = `cubic-bezier(0.45, 0, 0.20, 1)`, `spring` = `cubic-bezier(0.34, 1.30, 0.50, 1)`.

### Layout containers (8 vars)

`container/max=1200, page=1060, doc=1160, prose=680, lead=580, lead-wide=720, narrow=540, gutter=24`.

### Stroke widths — Line collection (4 vars)

`stroke/hairline=1, fine=1.5, medium=2, bold=3` — separate from `border/*` widths.

**Key structural point:** Atomize splits ~identical concepts across dedicated collections (Color, Spacing, Radius, Typography, Motion, Line) with a single `Primitives` collection under them. That's not just cosmetic — it's how a mature DS keeps naming, ownership, and mode-swapping tractable.

---

## Collider-Old reference: what was actually intended

Collider-Old is a **compact style-guide file**, not a formal DS spec:

- 1 variable collection ("Colors"), 23 vars: 5 backgrounds, 10 text tones, 6 statusstrip fills, 1 border, 1 hover.
- Primitives page = a `Primitives Canvas` (1440×3923) with 20 documentation sections showing usage examples (TYPOGRAPHY sample rows, SPACING/GAPS demo, BORDER RADIUS & OPACITY demo, color swatches, and visual references for each atom on the M&A page).
- **Typography documented as usage examples, not a formal ramp.** Sample rows show sizes 15px / 18px / 21px / 24px. No font family/weight/leading/tracking documented as tokens.
- **No elevation frame.** No motion frame. No layout containers frame.

**Interpretation:** Collider-Old's DS was intentionally lean. Its color palette and 4px grid are the load-bearing pieces. Everything else (typography ramp, motion, elevation) was never formalized — it lived implicitly in individual component designs.

---

## Current Collider code: what actually exists

### `design-tokens/src/tokens/`

| File                             | Contents                                                                             | Assessment                                                                                                                                                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core.tokens.json`               | Base palette (neutral, blue, green, amber, orange, violet, red — full 50→950 scales) | **OK.** Core palette is reasonable; ~92 lines.                                                                                                                                                                                    |
| `tailwind-colors.tokens.json`    | Full Tailwind color palette                                                          | **OK but bloated.** 1026 lines; treat as vendor palette, not source of truth.                                                                                                                                                     |
| `tailwind-variables.tokens.json` | Tailwind CSS variables                                                               | **OK but partly incoherent** — declares font-family as `Roboto Mono` while `font.tokens.json` declares `Poppins`.                                                                                                                 |
| `semantic.tokens.json`           | `color/background/*` (5), `color/text/*` (10), `color/status-strip/*` (6)            | **OK.** Matches Collider-Old's Colors collection 1:1.                                                                                                                                                                             |
| `accent.tokens.json`             | Accent color                                                                         | OK.                                                                                                                                                                                                                               |
| `spacing.tokens.json`            | 10 steps: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12 (= 0, 4, 8, 12, 16, 20, 24, 32, 40, 48px)   | **PARTIAL.** Missing sub-steps (0.5, 1.5, 2.5, 7) and larger steps (14, 16, 20, 24, 32 in Tailwind terms). Fine for now, will bite in Stage 3 dense layouts.                                                                      |
| `radius.tokens.json`             | 7 steps: none, sm, md, lg, xl, 2xl, full                                             | **OK.** Complete enough. Missing `2xs`/`xs` that Atomize has, and `pill` alias for `full`.                                                                                                                                        |
| `font.tokens.json`               | 1 token: `font-family: "Poppins"`                                                    | **PARTIAL.** Value is intent-correct (Poppins is Collider-Old's UI font) but nothing in the shipping app consumes it — Roboto Mono takes over via tailwind-variables. No size/weight/leading/tracking scale, no `font/mono` role. |
| `motion.tokens.json`             | 1 token labeled `"placeholder"`: `durationQuick: 150ms`                              | **STUB.** Explicitly labeled placeholder. No easings.                                                                                                                                                                             |
| `theme.tokens.json`              | shadcn role bridge (`--background`, `--foreground`, `--border`, etc.)                | OK for role-mapping to shadcn primitives, but `border` role is `#e5e5e5` (light default) — not Collider dark.                                                                                                                     |

### `src/components/*`

| Directory                      | Contents                                                                                                                                                                                                                                                                        | Assessment                                                                                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ui/` (24 files)               | shadcn primitives pulled in as ai-elements deps: accordion, alert, avatar, badge, button-group, button, card, carousel, collapsible, command, dropdown-menu, hover-card, input-group, input, progress, scroll-area, select, separator, spinner, switch, tabs, textarea, tooltip | Solid primitive coverage, sourced from shadcn. **Uses shadcn semantic classes (`bg-secondary`, `text-foreground`)** that depend on the `theme.tokens.json` bridge. |
| `ai-elements/` (32 primitives) | Stage-2 output. Full AI transcript + composer surface.                                                                                                                                                                                                                          | Complete.                                                                                                                                                          |
| `system/`                      | **Empty.**                                                                                                                                                                                                                                                                      | Reserved by primitives-wave.md for Collider-native primitives; nothing landed there.                                                                               |
| `editor/`                      | **Empty.**                                                                                                                                                                                                                                                                      | Reserved for Plate wrappers; deferred.                                                                                                                             |

---

## Gap map — Collider today vs a robust foundation

### GAP 1 — Typography system (CRITICAL)

**Missing:**

- Font family roles as string tokens (`font/sans`, `font/mono`) so components can call them by role instead of by name.
- `font/mono` role — `Roboto Mono` is used app-wide but never named as a token.
- Poppins actually being consumed anywhere in the running app (currently overridden by mono via tailwind-variables).
- Size ramp: no `text.size.{4xs..7xl}` tokens.
- Weight scale: no `text.weight.{regular,medium,semibold,bold}` tokens.
- Line-height scale: no `text.leading.{tight,snug,normal,relaxed}`.
- Tracking scale: no `text.tracking.*`.

**Consequence:** every organism/screen in Stage 3 hard-codes `text-sm`/`text-base`/`text-xs` from Tailwind defaults, which are locked to a 4-point step (12/14/16/18/20) — coarser than Atomize's 1-point ramp, and completely unrelated to Collider's actual design intent. And there's no way for a component to say "UI label" vs "code token" — everything gets mono.

**Font-family policy (RESOLVED 2026-08-30 via user + Collider-Old evidence):** two fonts — **Poppins for UI (font/sans)**, **Roboto Mono for code (font/mono)**. This is what Collider-Old already documented in its TYPOGRAPHY samples (Poppins at 10/12/16px for Path/Secondary/Status letters; Roboto Mono at 16px Regular/Medium for OutputLine text). No serif — Newsreader is Atomize-specific and not needed here.

**Recommendation:** land a `text.tokens.json` (or extend `font.tokens.json`) with:

- `font/sans` = `Poppins`, `font/mono` = `Roboto Mono`
- weights: regular=400, medium=500, semibold=600, bold=700
- size ramp (Collider-tuned, based on what Collider-Old actually uses + reasonable expansion): xs=10, sm=12, base=14, md=16, lg=18, xl=20, 2xl=24 (adjust if design pushes for finer 1pt step later)
- leading: tight, normal, relaxed
- tracking: normal, wide (defer wider variants until proven needed)

Then update `tailwind-variables.tokens.json` so `font-sans` and `font-mono` classes both resolve to the token values.

### GAP 2 — Motion system (CRITICAL)

**Missing:**

- Easing curves (Atomize has 3; we have zero).
- Duration steps beyond one placeholder (Atomize has 5).
- Any semantic aliases for common transitions (hover, focus, appear, dismiss).

**Consequence:** every Stage-3 assembly with visible motion (drawer slides, sheet reveals, streaming state, tab transitions, dropdown open/close, toast entry, loading shimmer) will invent ad-hoc `duration-150` classes, no shared easing, no consistency across surfaces. Motion stories in Storybook (which the taxonomy requires for meaningful primitives) have no tokens to test against.

**Recommendation:** land a `motion.tokens.json` with the 5-duration + 3-easing set Atomize uses (or a Collider-tuned variant). This is a 15-minute file; the bigger work is scrubbing existing components to use the tokens.

### GAP 3 — Elevation (HIGH)

**Missing:**

- Shadow color tokens (Atomize has 7 mode-aware).
- Shadow offset/blur/spread specs.
- Named elevation levels (`elevation-1`, `elevation-2`, or similar).

**Consequence:** cards, modals, popovers, sheets, tooltips — none have a shared elevation vocabulary. Layered organisms in Stage 3 (drawer over content, dropdown over sheet, toast over anything) will look muddled without elevation discipline.

**Recommendation:** land `elevation.tokens.json` with 3–5 named levels. Even without mode-awareness (dark-only Collider), single-value shadows are enough.

### GAP 4 — Layout containers (HIGH)

**Missing:**

- `container/*` widths (Atomize has 7).
- `gutter` token.

**Consequence:** Stage 3 route shells and screens invent widths ad-hoc. Reading-width discipline (prose vs page vs doc) doesn't exist as a shared vocabulary.

**Recommendation:** land `layout.tokens.json` with 4–5 container widths + a gutter. Even fewer than Atomize is fine — Collider is a desktop app, not a marketing site — but the vocabulary needs to exist.

### GAP 5 — Corners / radius / opacity / border widths (MEDIUM)

**Current radius state:** `radius.tokens.json` has 7 scale steps (none/sm=2/md=4/lg=8/xl=12/2xl=16/full=9999). Workable but not calibrated against Collider-Old's actual usage.

**Missing from radius:**

- Sub-steps `2xs=1px` and `xs=3px` (Collider-Old uses 3px for toolbar buttons — no current token maps to it).
- Semantic aliases (`radius.keycap`, `radius.pill`, `radius.badge`) per the hybrid naming decision (see "Naming philosophy" below).
- `radius.md` currently = 4px, but Collider-Old uses 5px for badges/hints — either extend the scale or accept the 4px approximation.

**Missing entirely:**

- **Opacity scale** — I initially missed this whole category. Collider-Old documents 4 opacity values by usage: `inactive-opacity=35%`, `dot-sep-opacity=50%`, `branch-container-opacity=70%`, `full-opacity=100%`. Nothing in code encodes these; components hard-code `opacity-50` etc.
- **Border widths** — `border.width.default=1px`, `border.width.strong=2px`. Hard-coded across components today.
- **Stroke widths** — for icon/vector work (Atomize has 4: hairline/fine/medium/bold). Defer until an iconography loop unless we need them sooner.

**Consequence:** the current radius set is close enough to work, but opacity is un-tokenized and inconsistent across components. Border widths similar. Sweeping is annoying at scale.

**Recommendation:** merge these into one `shape.tokens.json` (or extend `radius.tokens.json`) since they're all "edge/shape" concerns. Concrete scale from Collider-Old evidence: radius `{2xs:1, xs:3, sm:2, md:5, lg:8, xl:12, 2xl:16, pill:24, full:9999}`; opacity `{disabled:35, subtle:50, dim:70, full:100}`; border-width `{default:1, strong:2}`.

### Collider-Old's documented radius/opacity values (source-of-truth reference)

Radius (from Primitives page BORDER RADIUS & OPACITY frame):

- `keycap-radius` = 2px, `toolbar-btn-radius` = 3px, `git-file-row-radius` = 4px, `run-badge-radius` = 5px, `hints-bar-radius` = 5px, `full-radius` = 24px.

Opacity:

- `inactive-opacity` = 35%, `dot-sep-opacity` = 50%, `branch-container-opacity` = 70%, `full-opacity` = 100%.

### GAP 6 — Semantic color structure (MEDIUM)

**Missing:**

- `color.bg.raised` (between base and elevated).
- `color.surface.{card,sunken,input}` (dedicated surface tokens).
- `color.border.{strong,faint}` (only one border token today).
- `color.text.{muted,subtle,faint}` variants beyond primary/secondary/tertiary/dim.
- `color.accent.{hover,contrast,tint,line}` (only one accent today).
- `color.focus-ring`, `color.selection` — explicit interaction tokens.
- `color.derived.*` alpha state tints (positive/warning/critical @ 12/14/35/40/45).

**Consequence:** shadcn-role bridge in `theme.tokens.json` fills some of this (`--secondary`, `--muted-foreground`, `--ring`), but the mapping is one-way (semantic bridge → role, not role → semantic), and role names diverge from the Collider naming convention.

**Recommendation:** an extension pass on `semantic.tokens.json` that adds ~15 new tokens across bg/surface/border/text/accent/interaction. Existing tokens keep their names for backwards compat.

### GAP 7 — Spacing sub-steps (LOW)

**Missing:** `0.5, 1.5, 2.5, 7, 14, 16, 20, 24, 32` (in 4px-grid multiples: 2, 6, 10, 28, 56, 64, 80, 96, 128).

**Consequence:** dense-UI moments (icon-adjacent text, tight rows) fall back to hard-coded `px-1.5` and similar. Low-severity now; medium-severity in Stage 3.

**Recommendation:** append missing steps to `spacing.tokens.json`. Existing steps keep their names.

---

## What to do about component-level gaps

The prior audit spent a lot of time diffing Atomize's atoms (StatusStrip, Keycap, TreeRow, etc.) against Collider code, then suggested porting them. **That was wrong scope** — Atomize is a different project, and Collider-Old's atoms are a compact reference, not a spec.

The right frame now:

- **Wait to identify component-level gaps** until Stage 3 planning discovers them under actual composition pressure.
- **Do not port atoms from Atomize.** The value of Atomize here is its foundational structure (variables, mode-awareness, collection organization), not its specific atom implementations.
- **When Stage 3 discovers a missing primitive**, spin it out as a Stage-2 loop into `src/components/system/` (the reserved empty dir), per the primitives-wave.md convention.

---

## Recommended plan (foundations only, no component migration)

### Phase 0 — this audit (DONE)

### Phase 1 — font policy (DECIDED 2026-08-30)

Two-font system inherited from Collider-Old's intent: **Poppins (font/sans)** for UI + **Roboto Mono (font/mono)** for code. No serif. See GAP 1 for rationale + concrete token recommendations.

### Phase 1b — naming philosophy (DECIDED 2026-08-31)

**Hybrid: scale + semantic aliases.** Raw scale (`radius.sm=2px`, `spacing.4=16px`, `opacity.subtle=50`, etc.) as the foundation; semantic aliases (`radius.keycap → radius.sm`, `spacing.hint-key → spacing.2`, `opacity.dot-sep → opacity.subtle`) layered on top. Applies to radius, spacing, opacity, elevation, and any future edge/shape/tone tokens.

**Why this decision:** flexibility (raw scale for new components) + discipline (semantic aliases for documented atoms). Matches how the code currently references sizes while giving us a place to record Collider-Old's usage-driven vocabulary. Migration cost is minimal — existing scale tokens keep their names.

**How to apply:** every token file in Phase 2 should have TWO sections — a raw scale block and a semantic-alias block that references the scale. New atoms pick from the scale; the alias block grows as atoms formalize.

### Phase 2 — write missing foundation token files

One PR per file, each small. Each file adopts the hybrid pattern (scale + aliases).

1. `text.tokens.json` — families (`font/sans=Poppins`, `font/mono=Roboto Mono`), weights (400/500/600/700), sizes (xs=10, sm=12, base=14, md=16, lg=18, xl=20, 2xl=24), leading (tight/normal/relaxed), tracking (normal/wide). Semantic aliases as needed (`text/path`, `text/output-line`, `text/status-letter` → concrete sizes from Collider-Old).
2. `motion.tokens.json` — durations (instant=80, fast=130, base=190, slow=280, slower=420 in ms), easings (out/in-out/spring cubic-beziers). Semantic aliases (`motion/hover`, `motion/focus`, `motion/appear`, `motion/dismiss`) as consumers emerge.
3. `elevation.tokens.json` — 3–5 dark-only shadow levels. Semantic aliases (`elevation/card`, `elevation/modal`, `elevation/popover`).
4. `layout.tokens.json` — 4–5 container widths + gutter. Semantic aliases (`container/page`, `container/prose`, `container/narrow`).
5. **`shape.tokens.json` (or extend `radius.tokens.json`)** — radius scale + opacity scale + border widths, all with semantic aliases per Collider-Old's documented usage. Concrete values in GAP 5 above.
6. Extend `semantic.tokens.json` — bg/surface/border/text/accent/interaction extensions.
7. Extend `spacing.tokens.json` — sub-steps + large-step additions + semantic aliases for the 7 gap-usages and 6 padding-usages Collider-Old documented (`spacing/hint-key`, `spacing/git-file-row`, `spacing/hints-bar-px`, etc. — pull concrete values before writing).

### Phase 3 — republish to current Figma file

Run the publish-plugin (commit f9e7e36; idempotent upsert) to materialize the new tokens as Figma variables in the current Collider file. Preserves existing VariableIDs (the plugin is idempotent per the reconcile work in `project_figma_token_sync_reconcile.md`).

### Phase 4 — reconcile existing components

Sweep `src/components/ui/*` and `src/components/ai-elements/*` for hard-coded values that now have tokens (font sizes, motion durations, borders). Not required for Phase 4 to ship — can be done incrementally as touched.

### Phase 5 — Stage 3 unblocked

Now organism/layout work has a real foundation vocabulary to compose against.

---

## Artifacts

- Atomize collections dump: `atomize-collections.txt` in scratchpad.
- Atomize key values: `atomize-key-values.txt` in scratchpad.
- Atomize Foundations frame structure (top-level): `atomize-foundations.txt`.
- Collider-Old Primitives Canvas + foundations: `collider-old-*.txt`.
- Current code inventory: `code-inventory.txt`.
- This audit: `docs/stage1/ds-gap-audit-2026-08-30.md`.

---

## Phase 2 decisions (all RESOLVED 2026-08-31)

- **Q2 — File location:** flat under `design-tokens/src/tokens/` alongside existing files (default; not asked but low-stakes and consistent with current layout).
- **Q3 — Elevation modes:** **dark-only single values** (Collider is dark-only per memory; adding modes later is a bounded migration).
- **Q4 — Token naming:** **keep current** dotted convention (`color.background.base`) — avoids a sweep of every consumer.
- **Q5 — Type ramp:** **2pt Collider-tuned** — 7 sizes: 10, 12, 14, 16, 18, 20, 24.
- **Q6 — Shape-file split:** **bundle** — one `shape.tokens.json` with radius + opacity + border-widths (~30 tokens).

All governing questions for Phase 2 are now closed. Concrete file specs for each Phase 2 write follow the recommendations in the Phase 2 section above.
