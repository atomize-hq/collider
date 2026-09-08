---
name: stage-3-organism-layout-assembler
description: Assemble verified primitives and components into organisms, layouts, page shells, and route-level screens while preserving Tauri boundaries, Storybook coverage, and design sync. Use when the agent is composing multiple components into screens, layouts, or route-level assemblies rather than working on a single primitive.
---

# Stage 3 — Organisms, Layouts, and Route Assembly

Use this skill after Stage 2 has produced verified components.

This stage is for composition:

- organisms,
- multi-region panels,
- route shells,
- settings screens,
- workspace layouts,
- feature assemblies.

## Use this when

- the work item is no longer a single reusable component
- you are composing multiple verified components together
- you need page stories or screen stories
- you need shared shells, layouts, drawers, split panes, or workspace regions
- you need to wire route-level behavior
- you need to map layout-level design without redefining primitives

## Expected inputs

- Stage 1 baseline conventions
- Stage 2 verified primitives/components
- target feature or route
- Figma frame(s) or layout references
- Storybook and mocking conventions
- current native boundary contracts where relevant

## Required outputs

Produce or update some or all of:

1. a composition plan — start from `../../../.claude/skills/templates/composition-plan.template.json`. Stage 3 has
   not run yet, so no directory convention is established: agree the location with the repo
   before writing one, and do not assume an `assembly/` directory exists
2. updated organism/layout components
3. page/screen stories
4. route wiring
5. bridge/mock updates
6. component specs + story-inventory entries for anything promoted to reusable

## Composition rules

### 1. Compose from verified building blocks first

Prefer:

- verified primitives,
- verified wrappers,
- verified editor/chat shells.

Do not invent new primitives casually inside organism/layout work.

If a new reusable component is discovered:

- spin it out,
- send it through Stage 2,
- then resume Stage 3.

### 2. Keep one-off layout decisions out of the primitive API

A page-specific spacing or arrangement does not automatically justify:

- a new prop,
- a new primitive variant,
- or a design-system change.

Use local composition first. Escalate to the system only when reuse is real.

### 3. Use page/screen stories as the assembly testbed

Before or alongside route wiring, create stories for:

- happy/default screen
- empty screen
- loading state
- error state
- constrained viewport if important
- permission or offline state if important
- key interactions if important
- multi-step workflow stories if the screen has a meaningful sequence
- motion-oriented screen stories if transitions/choreography matter

These stories let you verify composition without depending on live native services.

### 4. Be explicit about native behavior

At this stage, document:

- which composed interactions call Tauri commands
- what is mocked in Storybook
- what is deferred
- what failure/cancellation states exist
- which flows are expected to be replayable in Storybook

## Recommended workflow

### Step 1 — define the assembly boundary

Clarify whether the target is:

- an organism,
- a layout shell,
- a route-level screen,
- a workspace region,
- or a page composed from several organisms.

### Step 2 — inventory inputs

List:

- reused Stage 2 components
- local wrappers still needed
- layout containers
- native interactions
- loading/error states
- design references

### Step 3 — build a composition plan

Document:

- which components are reused
- which wrappers are new
- which stories are needed
- which workflows are replayed
- whether any new primitive is being discovered
- which areas are real routes versus Storybook-only assemblies

### Step 4 — create or update layout-level Figma references

If helpful:

- capture the assembled UI into Figma,
- or update an existing layout frame,
- or refine a frame manually in Figma after composition exists.

Use layout-level design feedback to improve composition, not to silently mutate primitive contracts.

### Step 5 — wire route/app behavior

When wiring routes:

- stay compatible with the Tauri-safe frontend assumptions
- mock native work in stories
- document the bridge boundary
- preserve shared shell clarity

### Step 6 — verify

Verification should include:

- screen/page stories
- interaction checks
- accessibility checks
- workflow replay coverage for key user journeys
- optional motion-specific stories for visible choreography
- optional visual regression
- sync report if the feature is nearing handoff

## Story requirements for organisms and layouts

### Core screen states

For meaningful screens, cover:

- default
- loading
- empty
- error
- permission denied / blocked
- narrow viewport / responsive stress if relevant

### Workflow stories

Create replayable workflows for:

- multi-step setup flows
- creation/edit/confirm flows
- AI-assisted insert/apply flows
- drawer/sheet/dialog sequences
- save/cancel/retry flows
- any path that product/design review cares about as a sequence

### Motion stories

Add explicit motion stories when:

- layout transitions are part of acceptance
- regions resize or reveal progressively
- drawers/sheets/panels animate in ways that affect usability

## When an organism needs a component spec

An organism earns a `storybook/component-specs/<id>.json` — with a tier, `ownedStoryRefs`, and a
`downstreamHooks.figmaComponentRef` / `codeEntrypoint` pair — when it is part of the shared system.

### Give a spec to

- reusable organisms that belong in the shared design system
- composed wrappers that are expected to be reused across features

### Usually do not spec

- highly page-specific arrangements
- one-off internal layout shells
- route-only containers with no reusable design-system value

When in doubt, spec the reusable thing and leave page-level compositions to story/design links.

> Code Connect is retired and plays no part here — see `docs/stage1/sync-policy.md`.

## Hard rules

### 1. Stage 3 cannot redefine Stage 2 primitives casually

If the screen needs a new primitive or a primitive contract change, stop and route that unit back to Stage 2.

### 2. Page-level convenience does not justify leaking complexity into system components

Avoid “god props” added just to satisfy one screen.

### 3. Every privileged flow must be documented

If a layout introduces:

- file picking,
- native storage,
- OS integration,
- window actions,
- deep desktop interactions,

then the bridge and failure states must be documented and mocked in Storybook.

### 4. Verification is part of assembly

Route wiring without page/screen verification is incomplete.

## Completion criteria

This stage is complete when:

- the organism/layout/screen exists in code
- required page stories exist
- route or shell behavior is documented
- native boundary behavior is mocked or defined
- key workflows are replayable in Storybook
- no hidden primitive drift remains
- sync state is recorded
