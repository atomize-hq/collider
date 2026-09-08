---
name: stack-orchestrator
description: Entry skill for the Next.js + Tauri v2 + AI Elements + Plate + Figma + figma-use + Figma MCP + Figma plugin + Storybook workflow. Use when the agent needs to classify a request, route it to the correct stage skill, and enforce cross-stack rules across desktop boundaries, design sync, and Storybook-driven UI work.
---

# Stack Orchestrator

Use this as the **entry skill** for the whole stack.

It does not try to do everything itself. Its job is to:

1. classify the work,
2. route it to the correct stage skill,
3. enforce shared rules across the stack,
4. stop design-only assumptions or web-only assumptions from breaking the desktop app.

## Stack assumptions

- UI framework: **Next.js App Router**
- Desktop/native boundary: **Tauri v2**
- AI UI primitives: **AI Elements**
- Rich editor primitives: **Plate**
- Design source: **Figma**
- Design↔code link: **`figmaComponentRef`** in the component spec
- Figma automation / scripted edits: **figma-use**
- Figma design context / capture: **Figma MCP**
- Figma publish/sync rail: **repo-owned Figma plugin**
- Executable component surface: **Storybook**

## Always enforce these invariants

### 1. Tauri is the only privileged/native boundary

- OS access, filesystem access, secure storage, shell integration, native menus/dialogs, and any privileged behavior live behind Tauri commands/events/plugins.
- Frontend code must not assume Node APIs are available.
- Every privileged UI action must have an explicit bridge contract.

### 2. Next.js is a UI framework here, not a required runtime server

- Assume the shipped desktop app must be **static-export safe**.
- Reject plans that require an always-on Next.js server for core desktop behavior.
- Server-only features must be explicitly justified and isolated from shipped desktop flows.

### 3. Storybook is the executable truth for reusable UI states

- Every reusable component should have at least one story before it enters the round-trip loop.
- For meaningful reusable components, the real requirement is stronger:
  - variant coverage,
  - state coverage,
  - action/event visibility,
  - workflow stories,
  - motion stories when motion matters,
  - async/native mock coverage where relevant.
- Storybook stories are the fastest stable place to:
  - seed component states,
  - mock native behavior,
  - verify acceptance,
  - run interaction/a11y/visual checks.

### 4. Figma library components and variables are the visual/system truth

- Reusable design changes should be made in **library components and variables**, not only in detached frames.
- Detached frames can demonstrate intent, but they do not redefine the system on their own.
- Variable naming and component variant naming must be deliberate and consistent with code tokens and props.

### 5. The design↔code link lives in the component spec

- `storybook/component-specs/<component-id>.json` carries the mapping: `downstreamHooks.figmaComponentRef` (the Figma node) paired with `downstreamHooks.codeEntrypoint` (the TSX file).
- **Code Connect is retired.** No component carries a mapping, and the CT-11B rail reports `not-applicable`. Do not add one, and do not read its absence as drift.
- The implementing code was deliberately kept, so reviving it would be a data change rather than a rebuild — see `docs/stage1/sync-policy.md`.

### 6. figma-use, Figma MCP, and the repo-owned Figma plugin are operational tools, not canonical truth

- Use them to create, patch, diff, export, capture, publish, or automate.
- Do not treat their output as final implementation truth without reconciling against code, Storybook, and the design system.

### 7. AI Elements and Plate have distinct ownership

- **AI Elements** owns conversational/presentational AI primitives.
- **Plate** owns rich editing and document structure.
- Your app owns transport, persistence, native actions, and orchestration.

### 8. Storybook tooling must stay on a deliberate version policy

- Keep Storybook packages on one exact version line.
- Avoid leaving old Storybook package names/imports in the repo after upgrades.
- Treat Storybook config, story taxonomy, and story inventory as foundation artifacts, not incidental setup.

### 9. Vendored registry components are owned here, not upstream

- `src/components/ui` (shadcn) and `src/components/ai-elements` (ai-elements) are copies, not
  dependencies. Once installed, the repo owns them.
- Intentional divergences and the upstream API we rely on are recorded in
  `src/components/upstream-policy.json` and enforced by `just check`.
- Re-running a registry CLI over an existing file is never the upgrade path. An upgrade is a
  deliberate reconcile against that manifest, and a vintage change (for example shadcn's v4
  line) is a design decision, not maintenance.

## Routing rules

### Route to `storybook-rigorous-spec-system` when the task involves

- installing or upgrading Storybook
- pinning Storybook versions
- replacing old Storybook packages or imports
- defining story taxonomy
- adding interaction/workflow stories
- motion-story requirements
- controls/docs discipline
- visual/a11y/test addon policy
- Figma/Chromatic/design-link strategy

### Route to `stage-1-foundation-primitives-system` when the task involves

- baseline repo setup
- architecture and folder structure
- Tauri/Next.js integration
- Storybook installation/configuration as part of the broader baseline
- design token strategy
- Figma variables and modes
- primitive wave planning
- sync policy definition

### Route to `stage-2-component-roundtrip-loop` when the task involves

- a single primitive/component
- a small batch of related primitives
- importing a default/example component
- story-first component work
- code-to-canvas iteration (generate_figma_design via Figma MCP)
- canvas-to-code iteration (get_design_context via Figma MCP)
- figma-use for scripted canvas work (variable binding, node patching, bulk edits)
- repo-owned Figma plugin sync/publish rail work
- recording the Figma node in the component spec

### Route to `stage-3-organism-layout-assembler` when the task involves

- combining verified components into organisms
- layouts, shells, and route-level composition
- page/screen stories
- app shells, modals, drawers, multi-region layouts
- feature-level assembly that spans multiple components

### Route to `ai-elements-plate-builder` when the task involves

- chat transcript UIs
- composers
- citations
- code blocks
- assistant panels
- rich text editing
- AI + editor hybrid workspaces

### Route to `sync-quality-governor` when the task involves

- checking drift
- preparing a handoff
- merge readiness
- verifying Storybook/Figma/spec alignment
- finding the minimum reconciliation tasks
- enforcing stage promotion criteria

## Reference skills to keep separate

### `tauri`

Use for:

- command/event/plugin specifics,
- packaging/signing/release details,
- capability and permission details,
- platform-specific native behavior.

### `vercel-react-best-practices`

Use for:

- rendering discipline,
- async/data-fetch review,
- bundle control,
- re-render and hydration review,
- performance tuning.

## Decision rules for this workflow

### If the request starts from an existing example/default code component

Prefer:

1. give it a structured Storybook contract first,
2. capture or mirror it into Figma,
3. iterate visually,
4. record the Figma node in the spec's `figmaComponentRef`,
5. reconcile code,
6. verify.

### If the request starts from an existing Figma component/library

Prefer:

1. inspect the library component using `get_design_context`,
2. classify the change type (raw value / token / structural) — see Stage 2 canvas-to-code classification,
3. decide whether the code component already exists,
4. if structural: confirm the spec's `figmaComponentRef` still points at the right node,
5. route into Stage 2 for implementation/reconciliation.

### If the request references a community or vendor Figma file as a source

Before defaulting to live capture or figma-use seeding, check Stage 2's **community-seed path** (Step 3):

1. use `get_variable_defs` on a representative node to evaluate the source file's variable set,
2. if the variable set is small and maps cleanly to Collider's tokens, copy + rebind is faster than any seeding approach,
3. if the variable set is complex or inconsistent, fall back to the standard Step 3 seeding paths.

The rest of Stage 2 (Steps 4–9) is identical regardless of which seeding path was used.

### If the request is about a screen/layout, not a primitive

- Route to Stage 3.
- If Stage 3 discovers a missing primitive, create a Stage 2 subtask for that primitive.

### If the request mixes Storybook foundation and component work

- Use `storybook-rigorous-spec-system` to define or repair the baseline rules first.
- Then continue with Stage 1 or Stage 2 as appropriate.

### If the request mixes design, code, and sync concerns

- Do not collapse everything into one vague task.
- Stage the work:
  - Storybook baseline/foundation first,
  - baseline/system second,
  - component loop third,
  - composition fourth,
  - sync audit after each meaningful step.

## Correction rules

Correct or reject the plan when any of these appear:

- reliance on a live Next.js server for shipped desktop flows
- raw browser code directly doing privileged native work
- reusable components with no Storybook stories
- reusable interactive components with no workflow coverage
- visible motion with no motion-aware verification surface
- Figma detached frames being treated as the design-system source of truth
- Code Connect being reintroduced as a requirement or a gate — it is retired, and `figma:connect:validate` with it
- figma-use exports being treated as reviewed production code automatically
- Plate being bypassed for canonical document content
- AI Elements being used as the transport/backend architecture
- Storybook package drift being ignored
- a registry CLI being re-run over existing files, or `--overwrite` proposed as an upgrade path
- an entry removed from `src/components/upstream-policy.json` to make a check pass
