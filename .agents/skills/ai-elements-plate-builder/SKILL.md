---
name: ai-elements-plate-builder
description: Design and implement AI-native chat, composer, editor, and hybrid workspace surfaces using AI Elements plus Plate while keeping transport and native behavior outside the UI library layer. Use when the agent needs to decide what belongs in AI Elements vs Plate, build a rich AI workspace, or reconcile conversational UI with structured editing.
---

# AI Elements + Plate Builder

Use this skill when the work item is an **AI-native workspace surface**.

## Use this when

- building chat surfaces
- building assistant panels
- building a prompt composer
- building citations/code-block/reasoning surfaces
- building a rich text or block editor
- building a hybrid chat + editor workspace
- reconciling whether something belongs in AI Elements, Plate, or app-specific wrappers

## Ownership model

### AI Elements owns conversational presentation

Use AI Elements for:

- conversation containers
- message rows
- response rendering
- citations
- code blocks
- reasoning/step displays
- loaders and transient assistant states

### Plate owns editable document structure

Use Plate for:

- canonical rich text/document state
- block structure
- selections
- keyboard editing behavior
- slash menus/toolbars
- serialization/import/export workflows
- structured editing experiences

### The app owns orchestration

Your app should own:

- transport
- streaming adapters
- persistence
- native file or OS actions
- command invocation
- access control and permissions
- apply/accept/reject flows between assistant output and editor content

## Preferred patterns

### Pattern 1 — side-by-side workspace

- conversation/history on one side
- Plate editor/document on the other
- explicit handoff between transcript and document

### Pattern 2 — composer-first workflow

- AI Elements presents the prompt/response lifecycle
- Plate or a structured draft surface holds user-authored content
- app wrappers control insertion and commit behavior

### Pattern 3 — inline assist for editor content

- Plate stays canonical
- AI suggestions appear as previews, side panels, or diffable proposals
- user actions explicitly apply/reject changes

## Required design/implementation notes

For any AI/editor surface, produce:

- component decomposition
- state ownership notes
- story matrix
- focus/keyboard behavior notes
- insertion/apply/revert behavior
- persistence and native action notes
- error/cancellation behavior

## State rules

Explicitly decide:

- what state belongs to the transcript
- what state belongs to the editor/document
- what state is ephemeral UI state
- what is persisted locally
- what is persisted remotely
- what is native-state mediated through Tauri

Do not blur transcript state and editor state into one vague store.

## Streaming rules

When rendering streamed assistant output:

- show partial state cleanly
- distinguish partial vs final vs failed vs cancelled
- keep transport details away from leaf presentational components
- avoid mutating the editor invisibly during streaming

## Story requirements

For non-trivial surfaces, include stories for:

- default state
- loading/streaming state
- empty state
- error state
- insertion/apply flow
- edge content (long text, code blocks, citations, narrow width)

## Accessibility rules

Ensure:

- keyboard navigation works across transcript and editor regions
- focus is explicit when applying AI output into the editor
- code blocks and citations are navigable
- context menus and slash menus remain usable without pointer-only interaction

## Native boundary rules

Any of the following must live behind the Tauri bridge:

- open/save dialogs
- filesystem reads/writes
- windowing behavior
- secure storage
- OS integrations
- long-running native jobs

Storybook should mock these boundaries explicitly.

## Anti-patterns

Avoid:

- treating AI Elements as the backend/transport layer
- using Plate as a chat transcript renderer
- invisibly mutating Plate content without user-visible review
- letting streamed transport logic leak into presentational components
- putting privileged desktop operations directly in arbitrary React helpers
