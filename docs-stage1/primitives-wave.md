# Primitives Wave — Wave 1

**Status:** Stage 1 — defined, not yet implemented
**Date:** 2026-03-23

Wave 1 is centered on **AI Elements wrappers** — the conversational UI primitives that are core to the Collider product. These live in `src/components/ai-elements/`. Generic system primitives (button, input, etc.) come in later waves or are introduced on-demand as AI Elements composition requires them.

---

## Status tags

| Tag       | Meaning                                               |
| --------- | ----------------------------------------------------- |
| `[NEW]`   | Built from scratch in this codebase                   |
| `[WRAP]`  | Thin wrapper around an upstream library component     |
| `[REUSE]` | Upstream library component used directly (no wrapper) |

All Wave 1 components are `[NEW]` until an upstream `ai-elements` library is declared as a dependency. At that point, re-evaluate each as `[WRAP]` or `[REUSE]` and update this document.

---

## Wave 1 components

### 1. MessageRow — `[NEW]`

**Path:** `src/components/ai-elements/MessageRow.tsx`
**Figma:** to be mapped when library component node is confirmed
**Tier:** primitive
**Description:** A single message row in a conversation transcript. Renders a user or assistant turn with role indicator, content, and optional metadata (timestamp, model label).

**Variants:**

- `role`: `user` | `assistant`
- `state`: `default` | `streaming` | `error`

**Story kinds required:** `default`, `docs`
**Optional story kinds:** `variant-matrix`, `state-matrix`

**LOC budget:** TSX ≤200

---

### 2. CodeBlock — `[NEW]`

**Path:** `src/components/ai-elements/CodeBlock.tsx`
**Figma:** to be mapped when library component node is confirmed
**Tier:** primitive
**Description:** Inline or block-level code display with syntax language label, copy action, and optional line numbers. Used inside MessageRow content and standalone.

**Variants:**

- `language`: string (e.g., `typescript`, `rust`, `bash`, `plain`)
- `showCopyButton`: boolean
- `showLineNumbers`: boolean

**Story kinds required:** `default`, `docs`
**Optional story kinds:** `variant-matrix`, `actions`

**LOC budget:** TSX ≤200

---

### 3. Citation — `[NEW]`

**Path:** `src/components/ai-elements/Citation.tsx`
**Figma:** to be mapped when library component node is confirmed
**Tier:** primitive
**Description:** A source reference chip rendered inline or as a footnote. Shows a label, icon, and optional URL. May be interactive (opens detail panel) or display-only.

**Variants:**

- `variant`: `inline` | `footnote`
- `interactive`: boolean

**Story kinds required:** `default`, `docs`
**Optional story kinds:** `variant-matrix`, `actions`

**LOC budget:** TSX ≤200

---

### 4. Composer — `[NEW]`

**Path:** `src/components/ai-elements/Composer.tsx`
**Tier:** interactive
**Description:** The primary input control for sending messages. Textarea with auto-grow, send button, optional file-attach slot, and keyboard shortcut hint. All network/bridge calls are injected via props — the component owns only presentation and event emission.

**Variants:**

- `state`: `idle` | `streaming` | `disabled`
- `showAttach`: boolean

**Story kinds required:** `default`, `docs`, `state-matrix`, `focus`, `keyboard`
**Optional story kinds:** `controlled`, `actions`

**LOC budget:** TSX ≤200. If it exceeds this, split into `ComposerInput` and `ComposerToolbar`.

---

### 5. ThinkingIndicator — `[NEW]`

**Path:** `src/components/ai-elements/ThinkingIndicator.tsx`
**Figma:** to be mapped when library component node is confirmed
**Tier:** primitive
**Description:** An animated loader shown while the assistant is generating a response. Visually distinct from a spinner — should match the Collider design system's streaming/running aesthetic (see StatusStrip running variant in Figma).

**Variants:**

- `size`: `sm` | `md`
- `label`: string | undefined (optional accessible label)

**Story kinds required:** `default`, `docs`
**Optional story kinds:** `motion`

**LOC budget:** TSX ≤200

---

## Implementation order

Build in this sequence to unblock composition:

1. `ThinkingIndicator` — standalone, no dependencies, confirms token/animation baseline
2. `CodeBlock` — standalone, no composition dependencies
3. `Citation` — standalone chip
4. `MessageRow` — composes CodeBlock and Citation inside content slot
5. `Composer` — most interactive, depends on token + focus baseline

---

## Wave 2 preview (not yet scoped)

These come after Wave 1 is verified and Code Connect-mapped:

- `ToolCallRow` — assistant tool invocation display
- `ToolResultRow` — tool result / output display
- `ConversationThread` — list of MessageRows with scroll management
- `MessageActions` — copy, regenerate, edit action toolbar per message
- Generic system primitives as required by AI Elements composition (e.g., `Button`, `IconButton`, `Tooltip`)

---

## Component spec records

Each Wave 1 component needs a spec record created at:

```
storybook/component-specs/<name>.json
```

Follow the shape of the existing `storybook/component-specs/button.json`. Required fields:

- `componentId`
- `tier`
- `figmaComponentRef` (set when Figma node is confirmed)
- `validatorKinds` (from component tier policy)
- `implementedStoryRefs` (filled in as stories are created)

---

## Code Connect records

Each Wave 1 component needs a CT-11B governance record at:

```
figma/code-connect/<name>.json
```

And a native mapping at:

```
src/components/ai-elements/<name>.figma.tsx
```

These are created after the React component is implemented and after the Figma library node is confirmed. See `storybook/code-connect-bootstrap.md` for the full pattern.
