---
name: stage-2-component-roundtrip-loop
description: Run the repeatable story to Figma to code to Storybook verification loop for a single component or a tightly related primitive batch. Use when the agent is importing, designing, reconciling, or verifying one reusable component or a very small set of related primitives.
---

# Stage 2 — Component Round-Trip Loop

Use this skill for the main day-to-day loop of the system.

It is designed for:

- one primitive/component at a time, or
- a very small batch of closely related primitives that share the same contract and token language.

## Use this when

- importing a default/example component into the project
- creating the first Storybook story for a reusable component
- expanding a shallow story into a full contract
- seeding a code component into Figma
- editing a component in Figma manually or through figma-use
- reconciling design changes back into code
- recording the Figma node in the component spec
- verifying the component in Storybook

## Core principle

For reusable components, the loop should be:

1. **define executable story contract first**
2. **seed executable code state**
3. **seed or capture the design surface**
4. **iterate in Figma**
5. **record the design↔code link**
6. **reconcile production code**
7. **verify in Storybook**
8. **record sync status**

## Expected inputs

### Required

- component name / target
- Stage 1 baseline conventions
- current repo conventions
- a current or desired Storybook story/fixture
- Figma target (library component, frame, or node)

### Optional but valuable

- figma-use command history / patch notes
- Figma MCP capture output
- sync ledger from prior loop runs
- current Chromatic/story links

## Required outputs

Produce or update some or all of the following:

1. code component files under `src/components/ai-elements/` or `src/components/ui/`
2. component story files
3. `storybook/component-specs/<component-id>.json` — tier, `requiredStoryKinds`, `ownedStoryRefs`, and `downstreamHooks` (`codeEntrypoint` + `figmaComponentRef`)
4. new story IDs registered in `storybook/story-inventory.json`
5. the component's row in `docs/ai-elements-inventory.md`
6. follow-up tasks if drift remains

## The loop

### Step 1 — define the story contract

Before design iteration becomes authoritative, define the Storybook contract.

For reusable components, classify which stories are required:

#### Contract stories

- `Default`
- `VariantMatrix`
- `StateMatrix`

#### Interaction stories

- `Actions`
- `Controlled`
- `Keyboard` / `Focus` when meaningful

#### Workflow stories

Create at least one replayable multi-step workflow story when the component is interactive beyond one trivial click.

Examples:

- dialog opens → form fields change → submit → success state
- menu opens → keyboard navigation → selection made
- assistant composer types → send → streaming state → completion
- tabs change → panel content updates → follow-up action occurs

#### Motion stories

Create explicit motion stories when:

- animation timing or reveal behavior matters
- layout changes during interaction
- the component opens/closes/expands/collapses
- approval depends on seeing the sequence, not just the final static state

#### Async stories

Create async/mocked stories when:

- loading/error/empty/success states exist
- native or network calls influence behavior
- permissions or delayed responses are visible

This story contract becomes the **verification surface** for the rest of the loop.

### Step 2 — seed the component in code

Start from the real environment:

- install the default/example component from its registry
  (`npx ai-elements@latest add <name>`, which pulls its shadcn primitives with it)
- wrap it to fit repo conventions
- create a baseline story set before major iteration

**Installing is a one-way door.** `src/components/ui` and `src/components/ai-elements` are
vendored by copy, so re-running the CLI over a file that already exists silently replaces the
repo's edits — no test fails. Never pass `--overwrite`, and never re-add a component to
"refresh" it. If the file is already present, updating it is a deliberate reconcile: read
`src/components/upstream-policy.json`, re-apply every rule that names the file, then run
`just check`.

The component must have an executable state in Storybook before round-trip work becomes authoritative.

### Step 3 — seed the component in Figma

Choose the most appropriate seeding path.

#### Preferred when you want fidelity from real code

Use **Code to Canvas** (`generate_figma_design` via the Figma MCP server) to capture
the running Storybook story or app UI and convert it into editable Figma design layers.

This is best when:

- the code component already exists,
- you want the Figma starting point to match the real implementation closely,
- you want faster code-to-canvas bootstrapping,
- the component has complex rendering (streaming states, syntax highlighting, etc.)
  that would be painful to recreate manually or via figma-use.

Run Storybook locally, navigate to the target story, then invoke `generate_figma_design`
to capture the rendered state. Multiple story states (default, loading, error) can be
captured as separate frames and organized side-by-side.

#### Preferred when you want scriptability, patching, or bulk edits

Use **figma-use** to:

- create/arrange frames,
- render JSX-like structures,
- patch nodes,
- bind variables,
- diff/compare Figma states,
- export reference artifacts.

#### Preferred when you want to exercise the repo-owned Figma rail

Use the repo-owned Figma plugin when the component needs to be materialized, compared, or published through the canonical `plugin-import-manual` workflow.

#### Preferred when a well-structured community or vendor Figma file exists

Copy components from the source file + run a variable rebind pass.

Before committing to this path:

1. Use `get_variable_defs` on a representative node in the source file to inspect its variable set
2. If the variable set is small (< ~15 variables) and semantically clean, rebind is faster than any seeding approach
3. Map each source variable to its Collider equivalent (color, typography, spacing)
4. Copy the components you need into Collider's Figma file
5. Run a variable rebind pass with figma-use to remap all variables in one operation
6. Verify the result looks correct, then **resume from Step 4** — the rest of the loop is identical

This path is best when:

- a maintained community or vendor file already has full variant/state coverage for the component,
- the source file uses a CSS-variable-backed token system (not hardcoded values),
- the variable set maps cleanly to Collider's token system with few remaps,
- building the Figma surface from scratch via code seeding would be significantly slower.

Do not use this path when:

- the source file is poorly maintained or its variables are deeply inconsistent,
- the component structure diverges significantly from what the npm package actually renders,
- you cannot verify the source file's fidelity against the real code output.

#### Acceptable fallback

Create or refine the component manually in Figma if that is the fastest route.

#### ComponentSet recipe (figma-use, v0.13.1)

Building a variant set is order-sensitive and several steps fail _silently_. Follow this
exactly:

1. **Measure the rendered DOM, never the Tailwind class names.** Run the story and read
   `getComputedStyle`. `rounded-md` is 4px here, not Tailwind's 6px; `gap-1` on a call site
   is not in the component's base class; Tailwind v4 still emits a bare `shadow`. Seeding
   from class names produces a set that is wrong in ways nobody notices.
2. **Render one frame per variant, named `variant=<value>`, using real hex.** `bg="var:Name"`
   in `render` does _not_ bind — it silently falls back to white. So does a JSX `$var`.
3. **`node to-component` each frame**, then `component combine "<id1>,<id2>,..."` — comma
   separated, in ONE argument. `defineComponentSet` is not exported in v0.13.1.
4. **Bind variables LAST, on the ComponentSet's children.** `to-component` and `combine`
   DROP every paint binding. Binding before combining loses the work with no error.
5. **Use the full `VariableID:a:b` string** with `figma.variables.getVariableById`. A bare
   `a:b` returns `null`, and `setBoundVariableForPaint(paint, 'color', null)` _unbinds_
   rather than throwing — so a wrong id reports success and leaves raw paint.
6. **Read `boundVariables` back and assert.** Never trust the write's return value.
7. Bind more than colour where variables exist: `radius/*`, `spacing/*` (itemSpacing),
   `shape/border/width/*`.

Other v0.13.1 quirks:

- `justify="between"` silently fails in `render` — eval-patch `primaryAxisAlignItems`.
- There is no `figma-use page create`; use `figma.createPage()` via `eval`.
- Export is `figma-use export node <id> --output <path>`.
- `h="hug"` is not a value — omit `w`/`h` and auto-layout hugs.
- `node clone` deposits page-level orphans; search the PAGE after any clone.
- An opacity-modulated fill (`bg-success/10`) has no token. Leave it raw and record the gap
  rather than binding the solid variable at 10% — see the variable-sweep rule.

### Step 4 — iterate in Figma

During Figma iteration:

- update the **library component** where the change is reusable
- update variables where the change is token-level
- use detached frames only for experiments or composition previews
- keep variant and property naming clean and intentional
- keep Figma variant/property names close to the story contract when possible

### Canvas-to-code change classification

Before doing any code work from a Figma change, classify the change type. The classification determines the tool chain.

#### Type 1 — Raw value change

A hardcoded style value changed directly in the Figma component (font size, color hex, spacing, radius, etc.) without going through a variable.

**Tool chain**: `get_design_context` to read the new value → direct CSS/TSX edit → no spec change needed.

#### Type 2 — Token / variable change

A Figma variable was updated (e.g. a color or typography token in a variable collection).

**Tool chain**: Run the token pipeline first (`govern:tokens`) to pull the updated variable into design-tokens dist and regenerate CSS custom properties → verify the CSS module already references the variable (no direct edit needed if it does) → no spec change needed.

#### Type 3 — Structural change

The component's layout, nesting, slots, or variants changed (new layer, reordered children, added/removed prop, new variant axis).

**Tool chain**: `get_design_context` is the primary inspection tool → compare rendered structure against current TSX → update TSX and CSS as needed → re-check the spec if the prop surface or story set moved.

> **Tool pairing note**: the spec's `figmaComponentRef` tells you _which node_ to inspect and `codeEntrypoint` tells you _which file_ it answers to. `get_design_context` tells you _the actual values and structure_. Use them together: the spec narrows the scope; `get_design_context` reveals the diff.

### Step 5 — reconcile the component contract

Before editing production code, decide whether the design change is:

#### Variant-safe

Examples:

- spacing/padding/radius changes
- visual hierarchy changes
- adding a variant that fits the current prop model
- icon/slot visibility rules that fit current slots

These usually stay within Stage 2.

#### Contract-breaking

Examples:

- changing public props/slots
- changing nested composition structure
- introducing new reusable subcomponents
- changing async/native behavior
- changing editor/conversation responsibilities
- forcing token-system changes

These may require:

- Stage 1 token/system updates,
- Stage 3 composition updates,
- or `sync-quality-governor` before proceeding.

### Step 6 — record the design↔code link

The link is a pair of fields in `storybook/component-specs/<component-id>.json`:

- `downstreamHooks.figmaComponentRef` — the Figma node
- `downstreamHooks.codeEntrypoint` — the TSX file the node answers to

Two `figmaComponentRef` formats are in use and both are currently valid: the figma-use form
`<fileKey>#<a>:<b>` (17 specs) and the web-URL form
`https://www.figma.com/design/<fileKey>?node-id=<a>-<b>` (15 specs), which is what the Figma MCP
server needs. Match the format the component already carries; if you are writing the field for the
first time, use the form the tool you are actually driving expects. Unifying this behind a
parse/format pair is **BL-1** in `docs/backlog.md` — do not silently normalise one into the other
before that lands.

Set both on the first loop for a component. On later loops, update `figmaComponentRef` only when the node itself moved — a **structural (Type 3)** change that re-seeded the component, not a value or token change.

> **Code Connect is retired.** It was never wired for any of the 32 components, and the CT-11B rail reports `not-applicable`. Do not add a mapping and do not run `figma:connect:validate`. The implementing code is still in the repo so a revival would be a data change rather than a rebuild — see `docs/stage1/sync-policy.md`.

Verify while you are here:

- `ownedStoryRefs` covers every story kind the tier requires
- the story IDs in the spec exist in `storybook/story-inventory.json`
- `figmaComponentRef` resolves to a node that still exists in the file

### Step 7 — reconcile production code

Use the current Figma component, variables, and Storybook story to update the real code.

While editing code:

- keep diffs small
- preserve existing repo conventions
- keep the component wrapped in the design system
- update stories at the same time
- update tests if behavior changed
- keep action spies, controls, and workflow stories aligned with the public API

### Step 8 — verify in Storybook

A reusable component is not done until Storybook is current.

Minimum verification for meaningful reusable components:

- `Default`
- `VariantMatrix` when variants exist
- `StateMatrix` for meaningful public states
- `Actions` for observable events
- `Controlled` when parent-driven state matters
- one replayable `Workflow` story when behavior is multi-step
- one `Motion` story when motion materially affects UX
- mocked async/native states when behavior depends on them
- accessibility check where relevant
- docs/design links remain current

Optional but recommended:

- visual regression gate
- branch-linked Storybook/Chromatic link in Figma
- sync audit

### Step 9 — record sync status

Update the loop artifact and sync ledger with:

- current Figma node/file link
- current story link/path
- current Chromatic link if used
- current plugin-rail status, if the loop exercised the repo-owned Figma plugin
- drift status
- remaining follow-ups

## Story-specific implementation guidance

### Controlled components

If the component is controlled, include a story that demonstrates the real control loop rather than only static args.

### Eventful components

Use explicit event visibility so the Storybook surface shows what user actions emitted.

### Async components

Document the mock source and show the main async paths explicitly.

### Motion-sensitive components

Record:

- which motion is under test
- the expected start and end state
- any timing or reduced-motion assumptions

### Design-system components

Add links or metadata that make the relationship between story, Figma, and mapping obvious.

## Hard rules

### 1. Do not change production code without an executable story/fixture

If a component is reusable, it needs a story or equivalent fixture before round-trip work becomes authoritative.

### 2. A reusable component needs more than a default story

Default-only coverage is not enough for a shared primitive or atom.

### 3. Detached Figma frames are not design-system truth

Reusable design changes belong in the library component and variable system.

### 4. The spec records the link; it does not implement anything

`figmaComponentRef` and `codeEntrypoint` say which node and which file belong together. Keeping them current does not substitute for reviewing or implementing the actual code change.

### 5. figma-use exports are references unless explicitly reviewed

Use exports, diffs, and patches as acceleration tools. Reconcile them to repo conventions before treating them as production code.

### 6. The loop ends only after verification

“Looks correct in Figma” is not enough.
“Compiles in code” is not enough.
The component must also be current in Storybook and recorded in the sync ledger.

## Required acceptance criteria for a reusable component

The loop is complete when all of these are true:

- the component exists in code
- the component has Storybook coverage matching its public contract
- the Figma library component/frame is current
- token/variable changes are accounted for
- the spec's `figmaComponentRef` and `codeEntrypoint` are populated and current
- drift is recorded
- verification passes

## Promotion rules

### Promote to Stage 3 when

- the component is verified
- it is ready to be composed into larger screens
- the next work item is mostly layout/composition

### Bounce back to Stage 1 when

- token naming must change
- variable collections/modes must change
- baseline story conventions are insufficient
- foundation architecture assumptions need revision
