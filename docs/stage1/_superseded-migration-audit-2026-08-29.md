# Stage 1 Revisit — Old-File Migration Audit

**Date:** 2026-08-29
**Old file:** Collider-Old (`BSb9QaMzwE2mv0GQ63buQK`) — probed live via `figma-use` v0.13.1
**Current file:** Collider (`23PLdynlRYoBYQx9teoC8A`) — deferred to token source of truth for the diff
**Scope:** comprehensive audit only. No migration performed this pass.

---

## Why this audit exists

Stage 2 landed 32/32 ai-elements primitives. Before Stage 3 (organism/layout assembly) begins, the user flagged that a significant amount of the original Collider design system — atoms/primitives from the old Figma file — was never carried across. Assembling organisms on top of a thin atom layer would push composition-time gaps back into primitive contracts, which the stack-orchestrator invariants explicitly forbid ("Stage 3 cannot redefine Stage 2 primitives casually"). This audit produces the gap map that a subsequent migration pass will execute against.

## TL;DR

- **Stream A (variables/tokens):** essentially complete. 21/23 old-file color vars already live in `design-tokens/src/tokens/semantic.tokens.json` with the same names and values. **Two missing:** `border` (#8A9AAF) and `Background/hover` (#FFFFFF).
- **Stream B (atoms/primitives):** substantial. **19 ComponentSets + ~4 standalone atoms** on the old file's "Molecules and Atoms" page have no code equivalent. Remaining ~19 standalone components are composites/organisms that belong to Stage 3, not this migration.
- **VS-Code + App-Shell v2.1 pages:** organism-tier only. Table for Stage 3 planning; not part of primitive migration.
- **Empty pages** ("Primitives", "Organisms", "App Shell", "App Shell v2", "drafts" contains only 2 outdated components): legacy — nothing to migrate.

---

## Methodology

1. Patched Figma 126+ block via `sudo figma-use patch`, relaunched with `--remote-debugging-port=9222`.
2. Fronted the old file. Enumerated:
   - Variable collections + variables + values (`figma-use collection list`, `variable list`, `variable get`).
   - Every page's `COMPONENT_SET` and standalone `COMPONENT` nodes (`figma-use page set` + XPath `//COMPONENT_SET`, `//COMPONENT[not(parent::COMPONENT_SET)]`).
3. Cross-referenced findings against:
   - `design-tokens/src/tokens/*.json` (Stream A comparator, since it was itself the seed for the current file's 597 vars per commit f9e7e36).
   - `src/components/ui/*` (shadcn primitives pulled in as ai-elements deps).
   - `src/components/ai-elements/*` (the 32 Stage-2 components).
   - `docs/stage1/primitives-wave.md` (original Wave 1 plan).

**Live current-file re-dump was skipped.** The token source of truth (`design-tokens/`) is authoritative — the current Figma file's variables are a downstream projection of it. A live verification pass is trivial to run after the audit if desired.

**Raw dumps** are in `/private/tmp/.../scratchpad/audit/`:

- `old-file-vars.txt` — 23 color variables with hex values.
- `old-file-components.txt` — per-page ComponentSet + Component listings.
- `code-inventory.txt` — current code primitive layout.

---

## Old-file structure (baseline)

| Page                | Node id    | ComponentSets | Standalone Components | Notes                                        |
| ------------------- | ---------- | ------------- | --------------------- | -------------------------------------------- |
| Molecules and Atoms | `78:2268`  | 19            | 23                    | The real atom/primitive layer                |
| Primitives          | `401:1040` | 0             | 0                     | Empty — legacy                               |
| Organisms           | `105:382`  | 0             | 0                     | Empty — legacy                               |
| VS-Code             | `475:8516` | 11            | 4                     | IDE shell — organism-tier, Stage 3 material  |
| App Shell           | `458:5606` | 0             | 0                     | Empty                                        |
| App Shell v2        | `461:6457` | 0             | 0                     | Empty                                        |
| App Shell v2.1      | `466:7384` | 1             | 1                     | ComposerInput + Activity Bar — organism-tier |
| drafts              | `0:1`      | 0             | 2                     | Side Menu, Vertical Frame — discard          |

**One variable collection**: `Colors` (`VariableCollectionId:424:1027`), 23 variables, one implicit mode. No typography/spacing/radius/motion collections exist in the old file.

---

## Stream A — Variables/tokens diff

### Covered (21/23) — already in `design-tokens/src/tokens/semantic.tokens.json`

Every Background/_, Text/_, and StatusStrip/\* variable maps 1:1 by name and value. Casing convention translates (`Background/base` → `color.background.base`). No values disagree.

### Gap (2/23)

| Old-file var       | Old value | Notes                                                                                                                                                                                                                                                                         |
| ------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `border`           | `#8A9AAF` | No matching semantic token. `theme.tokens.json` has a `border` role at `#e5e5e5` (light shadcn default) — not the Collider dark bluish-grey. **Add as `color.border.default` (or similar) in `semantic.tokens.json`.**                                                        |
| `Background/hover` | `#FFFFFF` | Value is pure white, which suggests it was used as an overlay alpha on top of surfaces (the old file's Background category also has `white-10` = `#111111` which reads as an alpha layer). Confirm intent with the user before adding — may be duplicative of an alpha token. |

### Stream A migration effort estimate

- Two token additions to `semantic.tokens.json` (+ their `core.*` bases if needed).
- Republish via the idempotent publish-plugin (commit f9e7e36; upserts, preserves VariableIDs).
- Update `docs/stage1/figma-variables-plan.md` to record the two additions.
- **One small PR, ~30 min.**

---

## Stream B — Atoms/primitives diff

### M&A page — 19 ComponentSets (the real primitive candidates)

| Old-file atom     | Category  | Coverage in code                                                                                              | Recommendation                                                     |
| ----------------- | --------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| StatusStrip       | `[NEW]`   | shadcn `badge` covers pill shape but not the 6-variant semantic strip using `status-strip/*` tokens.          | Port. Bind to existing `status-strip/*` tokens.                    |
| GitFileRow        | `[WRAP]`  | ai-elements `commit-files.CommitFile` covers most of the shape; different token bindings.                     | Reuse `CommitFile` structure, wrap with git-specific slots.        |
| CollapseIndicator | `[NEW]`   | shadcn `collapsible` covers logic, not the visual indicator itself.                                           | Small visual primitive port.                                       |
| Keycap            | `[NEW]`   | No match anywhere.                                                                                            | Port. Foundational for KeyboardHintsBar composite.                 |
| Scrollbar         | `[REUSE]` | shadcn `scroll-area` covers.                                                                                  | Reuse as-is unless custom viz is required.                         |
| GitFileStatus     | `[WRAP]`  | shadcn `badge` covers.                                                                                        | Wrap `badge` with the git status semantics.                        |
| BadgeChip         | `[REUSE]` | shadcn `badge` covers.                                                                                        | Reuse as-is. Rename if needed for clarity.                         |
| ToolbarButton     | `[WRAP]`  | shadcn `button` covers primitive; needs toolbar variant.                                                      | Add toolbar variant to `button.tsx` or wrap.                       |
| ChevronToggle     | `[NEW]`   | Not present; lucide has ChevronRight/Down icons for the raw glyph.                                            | Small primitive port.                                              |
| FileIcon          | `[REUSE]` | lucide `FileIcon` already used by `ai-elements/file-tree-items`.                                              | Reuse lucide directly. Only port if type-specific variants matter. |
| OutputLine        | `[WRAP]`  | ai-elements `terminal` has Header/Title/Status; verify TerminalOutput row exists — if yes reuse, if not port. | Verify then reuse or wrap.                                         |
| BranchIndicator   | `[NEW]`   | No match.                                                                                                     | Port.                                                              |
| DiffCount         | `[WRAP]`  | `badge` covers.                                                                                               | Wrap `badge`.                                                      |
| FileCount         | `[WRAP]`  | `badge` covers.                                                                                               | Wrap `badge`.                                                      |
| PathText          | `[NEW]`   | No dedicated text primitive.                                                                                  | Small text primitive port (monospace, truncation).                 |
| TreeRow           | `[REUSE]` | ai-elements `file-tree` + `file-tree-items` cover.                                                            | Reuse. Only port if old-file variants materially differ.           |
| FolderIcon        | `[REUSE]` | lucide `FolderIcon` + `FolderOpenIcon` already used.                                                          | Reuse lucide directly.                                             |
| VerbToken         | `[NEW]`   | No match.                                                                                                     | Port.                                                              |
| SeverityToken     | `[NEW]`   | No match.                                                                                                     | Port.                                                              |

### M&A page — 23 standalone components (mostly composites)

| Old-file component                  | Category                       | Recommendation          |
| ----------------------------------- | ------------------------------ | ----------------------- |
| DurationText                        | Atom — text style              | Port as tiny primitive. |
| ContextPill                         | Atom — small pill              | Wrap `badge`.           |
| DiffStats, BranchStatus             | Composite of atoms             | **Defer to Stage 3.**   |
| ErrorDetail                         | Composite                      | **Defer to Stage 3.**   |
| BlockHeader (+3 variants)           | Composite/organism header      | **Defer to Stage 3.**   |
| BlockFooter (+3 variants)           | Composite/organism footer      | **Defer to Stage 3.**   |
| ActionToolbar                       | Composite                      | **Defer to Stage 3.**   |
| KeyboardHintsBar, HintGroup         | Composite (needs Keycap first) | **Defer to Stage 3.**   |
| GitDetailsDecorators                | Composite                      | **Defer to Stage 3.**   |
| FileTreeList                        | Organism                       | **Defer to Stage 3.**   |
| SplitPane                           | Layout container / organism    | **Defer to Stage 3.**   |
| CommandBody (+3 collapsed variants) | Composite/organism             | **Defer to Stage 3.**   |
| FailureStack                        | Organism                       | **Defer to Stage 3.**   |

### Stream B summary counts (primitives only, this migration's scope)

| Category  | Count | Items                                                                                                                    |
| --------- | ----- | ------------------------------------------------------------------------------------------------------------------------ |
| `[NEW]`   | 8     | StatusStrip, CollapseIndicator, Keycap, ChevronToggle, BranchIndicator, PathText, VerbToken, SeverityToken, DurationText |
| `[WRAP]`  | 7     | GitFileRow, GitFileStatus, ToolbarButton, OutputLine, DiffCount, FileCount, ContextPill                                  |
| `[REUSE]` | 4     | Scrollbar, BadgeChip, FileIcon, FolderIcon, TreeRow                                                                      |

(Count is 9 `[NEW]` if we include DurationText.)

**Recommended migration order** (foundational first, then things that depend on them):

1. `PathText` — used by many downstream (path rendering in git rows, file trees, etc.)
2. `Keycap` — foundational for KeyboardHintsBar composites in Stage 3
3. `ChevronToggle` + `CollapseIndicator` — small visual primitives, unblock BlockHeader/CommandBody
4. `StatusStrip` — the semantic-token showcase, validates the `status-strip/*` token bindings
5. `VerbToken`, `SeverityToken` — the token trio (VerbToken/SeverityToken/StatusStrip probably share a common shape)
6. `BranchIndicator`
7. `GitFileStatus` (wrap `badge`) → then `GitFileRow` (wrap `CommitFile` + `GitFileStatus`)
8. `DiffCount`, `FileCount`, `ContextPill` — badge wraps
9. `ToolbarButton` — button variant / wrap
10. `DurationText`
11. Verify `OutputLine` against ai-elements `terminal` internals; port only if needed
12. `[REUSE]` items — no code work, just document the mapping in a spec file so Stage 3 uses the right thing

**Estimated loop count:** 9–12 Stage-2-style loops (some `[NEW]` items are small enough to batch, e.g. Keycap + ChevronToggle + CollapseIndicator in one loop).

### VS-Code + App-Shell v2.1 pages — organism-tier

These are IDE and shell surfaces:

- **VS-Code**: Tabs, Activity Bar, EditorPanel, Status Bar, Top Bar, Primary Side Bar, Tab Manager, 8 view icons.
- **App-Shell v2.1**: ComposerInput, Activity Bar.

**None of these are primitives.** They are Stage 3 assembly targets. Table them in `docs/stage3/assembly-backlog.md` (to be created when Stage 3 planning starts). ComposerInput deserves a specific check: if it overlaps materially with the new `prompt-input` ai-element from Stage 2 loop #10, decide whether v2.1's ComposerInput is a superset that should influence composition, or a divergent shape to retire.

---

## Recommended migration plan

### Phase 0 — this audit (DONE)

- Produce this doc.

### Phase 1 — Stream A (tokens)

- Add `border` + `Background/hover` semantic tokens to `semantic.tokens.json`.
- Republish via publish-plugin (safe/idempotent).
- Update `docs/stage1/figma-variables-plan.md`.
- **Effort:** ~30 min, one PR.

### Phase 2 — Stream B (atoms)

- Run 9–12 Stage-2-style loops in the recommended order above.
- Each loop lands in `src/components/system/` (the reserved empty dir), NOT in `src/components/ui/` (which stays as the shadcn install target).
- Each loop follows the Stage-2 story contract: default + variant-matrix + docs, plus workflow/motion/a11y where relevant, matching the existing ai-elements loop discipline.
- Each loop seeds the corresponding Figma ComponentSet on the current file's **Primitives page** (`401:1040`) — NOT the old file. The old file is a source; the current file remains canonical.
- Each loop records a spec at `storybook/component-specs/<name>.json` per the existing CT-11B pattern.
- Update `docs/stage1/primitives-wave.md` to reflect the migrated wave.

### Phase 3 — verification

- Live re-dump the current file's variables (the deferred task #3) to confirm the plugin republish landed the two new vars cleanly.
- Sync-quality-governor pass to confirm no drift between old file (now retired), current file, and code.

### Phase 4 — Stage 3 unblocked

- Table VS-Code + App-Shell v2.1 organisms in `docs/stage3/assembly-backlog.md`.
- Then, and only then, start the first Stage 3 assembly (`conversation` remains the recommended first target from the sandbox-loop memory).

---

## Open questions for the user

Before Phase 1 starts:

1. **Old-file `Background/hover` = `#FFFFFF` — what was this actually used for?** Overlay alpha? Hover on light surface? If it's an alpha layer, we may want to encode it as `color.background.hover-overlay` with an alpha value, not a raw hex — align with how `white-10` already works.
2. **Old-file `border` = `#8A9AAF` — is this the canonical Collider border, or context-specific?** If canonical, add as `color.border.default`. If context-specific (e.g. only for split-pane dividers), add under a scoped name.
3. **Should `[REUSE]` primitives (Scrollbar/BadgeChip/FileIcon/FolderIcon/TreeRow) get spec records** documenting the mapping, or is it enough to note the mapping in this audit doc?
4. **Should VS-Code page's `Tabs` component set influence how we treat the shadcn `tabs` primitive**, or is IDE-tabs UX different enough that it belongs entirely under Stage 3 assembly?
5. **`OutputLine` verification** — before writing it into the migration order, do you want me to grep `ai-elements/terminal*` for a TerminalOutput row equivalent, or is it fine to leave that verification as the first step of that specific loop?
6. **Retirement plan for the old file** — after Phase 3, is the old file archived, kept read-only as a source-of-original-truth, or actually deleted?

Once these are answered, Phase 1 can start immediately; Phase 2 can be scoped into concrete loop batches.

---

## Artifacts

- Old-file variables: `old-file-vars.txt` in scratchpad.
- Old-file components (per page): `old-file-components.txt` in scratchpad.
- Current code inventory: `code-inventory.txt` in scratchpad.
- This audit: `docs/stage1/migration-audit-2026-08-29.md` (this file).
