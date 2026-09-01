# Stage 1 — Foundations Page Plan

**Date:** 2026-09-01
**Prerequisite:** [ds-phase-2-plan.md](./ds-phase-2-plan.md) (COMPLETE) — the token buildout this page documents.
**Governs:** the pre-publish token repairs (Phase 0), the republish (Phase 1), the Figma Foundations page build (Phase 2), and retirement of the legacy swatch frames (Phase 3).

This plan is intentionally durable — a fresh session should be able to pick it up from cold.

> **Scope decided 2026-09-01:** documented spec, not a bare swatch reference. Known token problems are fixed _before_ the page is built, so the page documents a system worth defending.

> **STATUS (2026-09-01): Phase 0 COMPLETE. Phase 1 blocked on one manual step.**
>
> - `c6d5e5f` — 0b + 0c: core rungs `neutral.400` / `neutral.600` / `violet.400`, text ladder re-valued, four a11y suppressions retired. Also repaired the accessibility gate itself, which had never actually run.
> - `b53ed80` — 0a + 0d: accent flattened onto the theme rail, `theme.tokens.json` removed. Breaking migration event, recorded in the commit body.
> - Figma structural migration done live via `figma-use`: `accent/dark/*` **renamed** to `accent/*` (rename preserves VariableIDs, so all 16 existing bindings survived untouched), the 4 unbound `accent/light/*` deleted, and the Primitives page's explicit mode cleared so it inherits again. File is at 173 variables.
> - **Remaining:** the plugin value-sync run, which is a manual Figma UI action. It creates the 3 new core variables and writes the changed per-mode values, taking the file 173 → 176. See §2.

---

## 0. Why this page exists

Stage 2 is complete (32/32 components seeded). The Primitives canvas (`401:1042`, 1716×9439) is full, and it holds 4 legacy swatch frames still bound to the **dead fork collection `424:1027`** — the vestigial ancestor of a foundations surface. There is currently no place in Figma that answers "what is the type ramp?" or "which text token do I use here?"

The token system is now good enough to document: 177 variables, two modes, 10 families. What it lacks is a rendered surface.

**Two structural references** (both dumped to scratchpad during the 2026-08-30 audit):

- **Atomize Systems** (`9zqKYnNe48ihEY9tvWS1pO`, page `96:2`) — `Foundations · Color` / `· Type`, each a `header` frame followed by `section/*` frames per role group, 1072px column. This is the model to follow. Per the standing rule: **take its structure, not its components.**
- **Collider-Old** (`BSb9QaMzwE2mv0GQ63buQK`) — flatter: a label Text plus a samples Frame per family. Too thin for a documented spec, but its family breakdown is a useful checklist.

---

## 1. Phase 0 — token repairs (must land before any frame is drawn)

Four items. **Only the first is a CHANGE_POLICY event** — the research below downgraded the other three from what was originally assumed.

### 0a. Accent remodel — theme in the value, not the name

`accent.tokens.json` has sibling subtrees `light` and `dark`. Those are **path segments, not modes**; all 8 variables exist in every theme with identical values in both Figma modes. The theme switch happens a layer up, in the role bridge:

```
:root, [data-theme]   →  --primary: var(--accent-dark-primary)
[data-theme='light']  →  --primary: var(--accent-light-primary)
```

**Figma structurally cannot mirror this.** Figma modes switch values _inside_ one variable; they never switch _which_ variable a paint is bound to. A paint holds one VariableID forever. So no rebinding fixes the 4 accent-bound seeds — bind to `accent/dark/primary` and you are pinned to dark's intent, bind to light's and you are pinned to light's. Both go wrong the moment the values diverge.

The fix is to move the switch down into the token layer, which is the standard shape everywhere else (`md.sys.color.primary`, `--accent-9`, shadcn `--primary`): **one semantic name, N values across modes.** The accent family is a fossil from before the theme rail existed — `semantic` was migrated onto the rail, `accent` never was.

Steps:

1. Flatten `accent.tokens.json` to `accent.primary`, `accent.primary-foreground`, `accent.sidebar-primary`, `accent.sidebar-primary-foreground`, holding the **dark** values (dark is `defaultThemeId`).
2. Add an `accent` block to `themes/light.tokens.json`. Today that is **one line** — `sidebar-primary: #155dfc`. Everything else is already identical across the two subtrees.
3. Delete the two `--primary` lines from the `[data-theme='light']` block in [globals.css:70](../../src/app/globals.css:70). The base bridge then follows the theme for free like every other role. **Leave `--destructive-foreground`** — that one is a genuine exception (following `text/primary` drops it to 2.79:1 on light's `#c10007`).
4. Add 8 entries to `migrations/runtime-css-aliases.json` — this is a token-ID removal and therefore a CHANGE_POLICY migration event.

Result: 177 → 173 variables. The 4 seed bindings repoint to `accent/primary`.

**Urgency note, recorded honestly:** `primary` is `#155dfc` in _both_ subtrees and `primary-foreground` is `#eff6ff` in both. The only value that differs anywhere in the family is `sidebar-primary`, and **nothing consumes it** — there is no `--sidebar-primary` role in the bridge and no `bg-sidebar-*` usage in the codebase. So the `[data-theme='light']` override block currently does zero work and nothing is visibly broken. This is a latent modeling defect, fixed now only because we are republishing anyway and a mis-modeled family would look worst on a Foundations page.

### 0b. `text.secondary` — the one token the light pass missed

Measured contrast, all `semantic.color.text.*`, both grounds (`#171717` dark / `#ffffff` light):

| token         | dark      | CR            | light     | CR    |
| ------------- | --------- | ------------- | --------- | ----- |
| primary       | `#ffffff` | 17.93         | `#171717` | 17.93 |
| warning       | `#e8d1a2` | 12.01         | `#8a5300` | 6.33  |
| success       | `#48df3a` | 10.15         | `#0e5e2e` | 7.90  |
| tertiary      | `#b0bac8` | 9.14          | `#3f3f3f` | 10.53 |
| info          | `#51a2ff` | 6.80          | `#1447e6` | 6.83  |
| caution       | `#f08000` | 6.65          | `#9a3412` | 7.31  |
| error         | `#fb2c36` | 4.71          | `#c10007` | 6.42  |
| **secondary** | `#6a7282` | **3.71 FAIL** | `#6a7282` | 4.84  |
| **ai**        | `#8a38f5` | **3.38 FAIL** | `#6d28d9` | 7.10  |

Two findings that reframe this from "rename the ladder" to something much cheaper:

1. **`text.secondary` is the only text token with no light override.** Every other one — including `dim` — got one in the light pass. It is `#6a7282` in both modes and passes on white (4.84) only by luck.
2. **`text.tertiary` has zero consumers in code.** It is defined but never adopted, which is exactly why nobody noticed it outranks `secondary` by 2.5×.

So the naming ladder is not inverted by a naming mistake — it is inverted because `secondary` was left behind and `tertiary` was never used. **This is a re-value, not a rename: no token ID changes, no CHANGE_POLICY event.**

**DECIDED 2026-09-01 — no separate icon/stroke token. Add the missing scale rung instead.**

A split into _muted text_ (4.5:1) vs _muted stroke_ (3:1) was considered and rejected on evidence:

- **Icons inherit `currentColor`.** lucide icons take their stroke from the surrounding text color, which is the whole ai-elements pattern. A separate icon token would require explicitly classing every icon site to opt out of inheritance — churn across ~100 call sites to make icons _dimmer_, which is not a defect being fixed.
- **Every measured failure is on text, not icons.** Four story files already suppress `color-contrast` with a deferral note pointing at this exact token (`code-block`, `tool`, `reasoning`, `sandbox`). There is no icon contrast problem to solve.
- **A bespoke icon token would have no enforcement surface** and would drift immediately, against the code↔Figma↔Storybook parity rule.

The actual root cause is a **gap in the core scale**: neutral jumps `300` (#b0bac8, 9.14) → `500` (#6a7282, 3.71) with no `400`. `secondary` had to pick an extreme and picked the failing one. Fill the rung and the existing ladder sorts itself out — `tertiary` becomes the genuine dim step, and any icon that should stay dim uses `text-tertiary`, no new vocabulary.

**Core additions** (new token IDs — additive, _not_ a CHANGE_POLICY event), solved to preserve the existing 220° blue-grey hue family:

| token                    | value     | on `#171717` | on `#ffffff` |
| ------------------------ | --------- | ------------ | ------------ |
| `core.color.neutral.400` | `#9ca2af` | 7.00         | 2.56         |
| `core.color.neutral.600` | `#535966` | 2.55         | 7.03         |
| `core.color.violet.400`  | `#a566f7` | 4.99         | 2.40         |

**Semantic re-values** (value-only, no ID change):

| token            | dark                 | light                                               |
| ---------------- | -------------------- | --------------------------------------------------- |
| `text.secondary` | `neutral.400` → 7.00 | `neutral.600` → 7.03 ← _fills the missing override_ |
| `text.tertiary`  | `neutral.500` → 3.71 | `neutral.500` → 4.84                                |
| `text.ai`        | `violet.400` → 4.99  | `violet.700` → 7.10 _(unchanged)_                   |

Resulting ladder, monotonic in both modes for the first time:

```
dark    primary 17.93  >  secondary 7.00  >  tertiary 3.71  >  dim (alpha)
light   primary 17.93  >  secondary 7.03  >  tertiary 4.84  >  dim (alpha)
```

`text.ai` gets a new `violet.400` rather than a re-valued `violet.500` because **`status-strip.ai` also references `violet.500`** — that is a strip fill, not text, where 3.38 already clears the 3:1 non-text threshold. Leave it alone.

`tertiary` at 3.71 dark is deliberate and must be **documented on the Foundations page as decorative / AA-large only**. The failing value does not disappear — it is a legitimately useful dim tone and it is what the 93 Figma icon-stroke bindings want — it simply stops being the default for body-adjacent text.

**Downstream cleanup required by this change:** retire the four `color-contrast` a11y suppressions in `code-block`, `tool`, `reasoning`, and `sandbox` stories. They exist solely to defer this fix; leaving them would hide future regressions. Both `semantic.tokens.json` and `themes/dark.tokens.json` declare these values and must be updated together, and `migrations/runtime-traceability.md:61` cites the old `secondary → neutral.500` resolution.

### 0c. `text.ai` — 3.38:1 in dark

**DECIDED 2026-09-01 — fixed, folded into the 0b commit.** Previously flagged and deliberately left alone. Light was always fine (7.10); dark moves to the new `core.color.violet.400` at 4.99. See the 0b tables for values and for why `violet.500` itself is left untouched.

### 0d. `theme.tokens.json` — retire

55 light-valued shadcn tokens, superseded by the real theme rail. **Confirmed 0 consumers** outside generated `tokens.css`, and already withheld from Figma via `figmaExcludedFamilies`. It is fully inert. Removal is a CHANGE_POLICY event; folding it into the same commit as 0a costs one more alias block and closes the "dark-values-or-retire" question that has been open since the picker cleanup.

---

## 2. Phase 1 — republish + rebind

1. ~~`pnpm build:tokens`, confirm contract tests still pin the flattened count.~~ Done — artifact holds 176 leaves.
2. ~~Rename/delete the accent variables in Figma.~~ Done via `figma-use`. **Renaming rather than recreating is what made step 3 unnecessary** — VariableIDs survive a rename, so the 16 bindings on `accent/dark/primary` followed it to `accent/primary` with no rebinding at all.
3. **TODO — manual.** Run the plugin to sync values. It is the only step that cannot be scripted, because the plugin is Figma UI. `pnpm figma:plugin:build` has already been run, so `code.js` is current.
   - Figma → Plugins → **Collider Token Sync**
   - Start the artifact server first: `pnpm figma:tokens:serve` (script `scripts/serve-figma-tokens.mjs`, port overridable via `FIGMA_TOKEN_SERVER_PORT`). It refuses to boot if `design-tokens/dist/figma/tokens.json` is missing, so run `pnpm build:tokens` before it. There is also a `figma-tokens` entry in `.claude/launch.json`.
   - Leave the **Artifact URL** on its default `http://localhost:4173/design-tokens/dist/figma/tokens.json` and hit **Fetch**. (The file picker also works, but the URL path is the normal route and is what `manifest.json` whitelists under `devAllowedDomains`.)
   - **Sync Variables**
   - Expect 173 → 176: creates `core/color/neutral/400`, `core/color/neutral/600`, `core/color/violet/400`, and updates the changed per-mode values for `semantic/color/text/{secondary,tertiary,ai}` plus `accent/sidebar-primary` in light.
4. Update `src/figma/sync-ledger.json` + `publish-proof.json` with the new count and the migration note.

---

## 3. Phase 2 — build the page

New page **Foundations** (the Primitives canvas is full and must not be extended). Six frames, Atomize-derived structure — `header` frame then `section/*` frames, 1072px column, 64px gutter:

| Frame                         | Sections                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `Foundations · Color`         | Background & Surface · Border · Text · Accent · Functional & State · Interaction                             |
| `Foundations · Type`          | `type/font/poppins` ramp (10/12/14/16/18/20/24) · `type/font/roboto-mono` ramp · weight + leading + tracking |
| `Foundations · Space & Shape` | spacing scale · radius · border widths · opacity                                                             |
| `Foundations · Elevation`     | shadow specimens on surface + elevated grounds                                                               |
| `Foundations · Motion`        | durations + easing — see constraint below                                                                    |
| `Foundations · Layout`        | container widths as scale bars                                                                               |

Per-swatch annotation: **token name · resolved value · usage rule**, plus contrast where it is a text color.

### Two build constraints worth knowing up front

**Non-visual families cannot be swatched.** `motion` and `layout` have no rendered form. Motion becomes an annotated table (name, value, intended use); layout becomes proportional bars. Do not force them into a swatch grid.

**Contrast numbers cannot be variable-bound.** Every swatch fill flips with the page mode for free, but the annotation text is static — a `17.93` typed into a Text node stays `17.93` in both modes. Options: annotate dark only (and say so in the header), or render both as `dark / light` pairs. **Recommend the pair form** — it is the only version that stays true in both modes, and it makes the light-mode gaps from 0b visible rather than hidden.

---

## 4. Phase 3 — retire the legacy swatch frames

The 4 swatch frames on the Primitives canvas bind dead collection `424:1027`. Once `Foundations · Color` exists they are strictly superseded. Delete them and note it in the ledger — do not leave two competing color references in one file.

---

## 5. Ordering + rationale

```
0b text.secondary ─┐
0c text.ai        ─┴─▶ commit 1: core rungs + re-values + retire the 4
                       a11y suppressions. No migration artifact.
                       │
                       ▼
0a accent remodel ─┐
0d theme retire   ─┴─▶ commit 2: one CHANGE_POLICY event (both are ID
                       removals) + alias entries.
                       │
                       ▼
              Phase 1 republish + rebind
                       │
                       ▼
              Phase 2 build 6 frames
                       │
                       ▼
              Phase 3 delete legacy swatches
```

Value-only work goes first: it is self-contained, it is verifiable by the existing a11y gate the moment the suppressions come off, and it keeps the riskier migration commit clean.

Phase 0 before Phase 2 is the whole point of the "fix first" decision: every frame drawn against a token that is about to change is a frame that has to be rebuilt.

---

## 6. Verification

- `just preflight` after each Phase 0 commit.
- Contract test `carries theme overrides without leaking them into the variable set` must still pass after the accent move — accent gains a `$themeOverrides` entry for the first time.
- After Phase 1, switch the Foundations page to light mode and confirm every specimen flips; clear the explicit mode afterward so the page inherits.
- Contrast claims on the page must be **measured, not eyeballed** — recompute rather than copying the table in §0b, which will be stale once 0b lands.

---

## 7. Banked gotchas that apply here

- `justify="between"` silently fails in `figma-use render` — eval-patch `primaryAxisAlignItems` (9 prior recurrences).
- JSX `$var` in `render` does **not** bind — bind explicitly with `figma-use set fill <id> '$semantic/...'` afterward.
- A single `eval` walk for bulk variable binding is far faster than N `set fill` calls.
- `node clone` silently deposits page-level orphans — search the page after any clone.
- Figma horizontal flex collapses Text whitespace; use grid where alignment matters.
- `figma-use eval` needs an explicit `return` plus `--json`, and sync APIs only — top-level `await` kills the WebSocket bridge.

---

## 8. Artifacts + references

- Reference dumps (this session's scratchpad, `audit/`): `atomize-foundations.txt`, `collider-old-foundations.txt`, `atomize-collections.txt`, `collider-old-primitives-canvas.txt`.
- Token source: `design-tokens/src/tokens/*.tokens.json` + `themes/`.
- Role bridge: [src/app/globals.css](../../src/app/globals.css).
- Change policy: `docs/figma-ci-sync/threaded-seams/seam-1-canonical-token-source/slice-3-conformance-and-change-control/subslice-3-token-and-theme-change-policy.md`.
- Ledger + proof: `src/figma/sync-ledger.json`, `src/figma/publish-proof.json`.
- Figma file: **Collider** `23PLdynlRYoBYQx9teoC8A`; Primitives page `401:1040`, canvas `401:1042`.

---

## 9. What comes after

Stage 3 — `conversation` assembly, per the sandbox-loop handoff.
