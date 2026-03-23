# Primitives Wave — Wave 1

**Status:** Stage 1 — defined, not yet implemented
**Date:** 2026-03-23

Wave 1 is centered on **AI Elements primitives** — the conversational UI primitives that are core to the Collider product. These live in `src/components/ai-elements/`. Generic system primitives (button, input, etc.) come in later waves or are introduced on-demand as composition requires them.

**Transport posture:** All Wave 1 components are mock-first. Props accept Collider-native view models. No AI SDK dependency is installed. Storybook stories drive component development using fixtures and fake stream states. See `docs/collider_frontend_landing_guide.md` for the full rationale.

---

## Status tags

| Tag       | Meaning                                               |
| --------- | ----------------------------------------------------- |
| `[NEW]`   | Built from scratch in this codebase (Collider-native) |
| `[WRAP]`  | Thin wrapper around an upstream library component     |
| `[REUSE]` | Upstream library component used directly (no wrapper) |

All Wave 1 components are **`[NEW]`**. AI Elements community Figma files are visual and structural reference only — not an installed dependency. Components are adapted to Collider's dark theme, Roboto Mono, dense layout, and token system. Re-evaluate status only if Substrate contracts later require a vendor UI adapter.

---

## Prerequisite: Collider-native view models

Before implementing any Wave 1 component, define these types in `src/features/chat/types.ts` (or equivalent). Components accept these models, not vendor SDK types:

```ts
export type MessageRole = 'user' | 'assistant';
export type MessageState = 'default' | 'streaming' | 'error';

export interface ToolCallViewModel {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  parameters?: Record<string, unknown>;
  result?: unknown;
}

export interface MessageViewModel {
  id: string;
  role: MessageRole;
  content: string; // rendered markdown/text
  state: MessageState;
  toolCalls?: ToolCallViewModel[];
  branchIndex?: number;
  branchTotal?: number;
}
```

These types live in `src/features/`, not in `src/components/ai-elements/`. Components import from features; the dependency arrow goes one way.

---

## Wave 1 components

### 1. MessageRow — `[NEW]`

**Path:** `src/components/ai-elements/MessageRow.tsx`
**Figma:** to be mapped when library component node is confirmed
**Tier:** primitive
**Description:** A single message row in a conversation transcript. Two visual forms driven by `role`:

- `user` — right-aligned bubble (`bg-background-elevated`, `radius-lg`), copy/edit actions below
- `assistant` — left-aligned, avatar + content + optional `ToolCallRow` slots + branch nav + action toolbar

Accepts `MessageViewModel`. Does not know about transport or streaming state beyond the `state` prop.

**Props key:**

- `message: MessageViewModel`
- `onCopy?: () => void`
- `onEdit?: () => void`
- `onRegenerate?: () => void`

**Story kinds required:** `default`, `docs`
**Optional story kinds:** `variant-matrix` (user vs assistant), `state-matrix` (default/streaming/error)

**LOC budget:** TSX ≤200. Split into `MessageRowUser` and `MessageRowAssistant` sub-files if needed.

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

### 3. ToolCallRow — `[NEW]`

**Path:** `src/components/ai-elements/ToolCallRow.tsx`
**Figma:** to be mapped when library component node is confirmed
**Tier:** primitive
**Description:** A collapsible tool call card embedded inside `MessageRow` for `role=assistant`. Shows tool name, status badge (pending/running/completed/failed), and an expandable body with parameters (rendered as a `CodeBlock`). Not a standalone component — always used as a child of `MessageRow`.

Accepts `ToolCallViewModel`. No network calls; result data arrives via props.

**Props key:**

- `toolCall: ToolCallViewModel`
- `defaultExpanded?: boolean`

**Story kinds required:** `default`, `docs`
**Optional story kinds:** `state-matrix` (pending/running/completed/failed)

**LOC budget:** TSX ≤200

---

### 4. Citation — `[NEW]`

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

1. **Collider view model types** — `src/features/chat/types.ts` first; no component can land without these
2. `ThinkingIndicator` — standalone, no composition deps, confirms token/animation baseline
3. `CodeBlock` — standalone, used by ToolCallRow
4. `ToolCallRow` — depends on CodeBlock; needed before MessageRow (assistant) can be complete
5. `MessageRow` — composes CodeBlock + ToolCallRow in assistant variant; user variant is standalone
6. `Composer` — most interactive, depends on token + focus baseline; can land in parallel with MessageRow

`Citation` is deferred to Wave 2 — it does not appear in the core chat flow visible in the community Figma reference.

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
