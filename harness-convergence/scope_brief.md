# Scope Brief

- Goal (1 sentence): converge Collider from the original `figma-ci-sync/*` planning baseline onto the governing target-state harness by preserving old `SEAM-1` through `SEAM-4` as landed evidence, replacing the old Figma transport assumptions with `SEAM-5B`, and defining the promotion model that will consume that new rail.
- Why now: the original pack landed a valid baseline, but its seam-5 transport assumptions are no longer sufficient as the live harness design; [figma-ci-sync/target-state-harness.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/figma-ci-sync/target-state-harness.md) now defines the governing model for what the system should become.
- Primary user(s) + JTBD: design-system maintainers need a concrete convergence plan that preserves historical planning truth while clarifying the remaining live work; designers need a deterministic repo-to-Figma rail that does not invert source-of-truth ownership; frontend engineers and AI agents need machine-checkable rules for canonical source, derived projections, publish rails, verification rails, and promotion gates.
- In-scope: a new convergence pack; explicit carry-forward of canonical source and derived projection contracts from the old pack; a new Figma seam conceptually equivalent to `SEAM-5B`; explicit replacement of the old seam-5 and `CT-7` assumptions; a downstream verification and promotion seam that consumes the new Figma rail; a supersession map from historical docs to new convergence docs.
- Out-of-scope: implementing the plugin rail; implementing the OAuth-backed Variables rail; implementing Tokens Studio usage; changing `figma-ci-sync/*` beyond leaving it untouched as historical context; changing the skill pack; reopening settled canonical token, recipe, build, or app-consumption seams unless a later pack explicitly does so.
- Success criteria: the repo has one new planning pack that future convergence work can use without mutating the historical pack; the target-state harness is named as governing truth; old `SEAM-5` is explicitly historical evidence only; `SEAM-5B` and `SEAM-6B` define the live convergence path; `CT-7` has a clear supersession path; AI agents can identify canonical source, derived projections, publish rails, verification rails, and promotion gates without guessing.
- Constraints: this is a planning/doc task only; no unrelated code changes; no skill-pack edits; `figma-ci-sync/*` should remain unchanged; the new docs must remain concrete enough for owner assignment and downstream agent execution.
- External systems / dependencies: Figma, Figma plugin/importer flows, Figma Variables REST API with OAuth app ownership, optional Tokens Studio carrier usage, Storybook proof surfaces, repo validation/build commands, local and CI promotion gates.
- Known unknowns / risks: the exact implementation shape of the plugin rail; the credential model and tenancy constraints of the OAuth-backed Variables rail; how long parity should remain deferred after the proof rail exists; whether Tokens Studio is needed at all during the transition.

## Decision Snapshot

- Canonical source remains the repo-owned authoring surfaces already defined by historical `SEAM-1` and `SEAM-2`: `design-tokens/src/tokens/**/*.tokens.json`, `design-tokens/src/tokens/themes/registry.json`, and `design-tokens/src/recipes/*.recipe.json`.
- Derived projections remain the outputs already defined by historical `SEAM-3` and consumed by historical `SEAM-4`: `src/lib/tokens/tokens.css`, `design-tokens/dist/tokens.ts`, and `design-tokens/dist/figma/tokens.json`, plus Storybook-facing proof surfaces that inspect those projections.
- Runtime and Storybook publish rails remain inherited satisfied inputs from the original pack and are not reopened here.
- The live Figma publish model is no longer historical `SEAM-5`; it is `SEAM-5B`, which defines:
  - short-term proof rail: `plugin-import-manual`
  - long-term hardened rail: `rest-variables-oauth`
  - Tokens Studio: optional temporary carrier only, never a required permanent harness dependency
- Figma remains downstream-only. No Figma-originated value change is allowed to become canonical without a repo PR updating canonical source files.
- Verification and promotion move through `SEAM-6B`, not through the historical seam-6 assumptions alone. `SEAM-6B` is responsible for making the new Figma rail machine-readable and promotion-safe.
- Historical seam-5 material is evidence about the old posture. It is not live truth and must not be cited as if it already defined the permanent harness design.

## Inherited Satisfied Inputs

| Historical seam | Status in this pack      | What is carried forward                                                  |
| --------------- | ------------------------ | ------------------------------------------------------------------------ |
| `SEAM-1`        | satisfied input          | canonical token ownership, theme registry, and source-of-truth rules     |
| `SEAM-2`        | satisfied input          | recipe contract ownership and token-reference discipline                 |
| `SEAM-3`        | satisfied input          | deterministic build commands and derived artifact paths                  |
| `SEAM-4`        | satisfied input          | runtime and Storybook consumption as proof surfaces                      |
| `SEAM-5`        | historical evidence only | earlier v1 transport posture, now superseded for live planning           |
| `SEAM-6`        | historical baseline only | earlier governance framing, now insufficient until it consumes `SEAM-5B` |

## Capability Inventory

- preserve historical planning truth without reopening the old pack
- declare the governing relationship between the target-state harness and the new convergence pack
- freeze the active repo-to-Figma publish posture into a new seam contract
- separate short-term proof transport from long-term hardened transport
- explicitly demote Tokens Studio from assumed rail to optional temporary carrier
- define machine-readable Figma verification and promotion expectations
- give downstream implementation owners a pack that is assignable without re-litigating old seams

## Assumptions

- historical `SEAM-1` through `SEAM-4` remain directionally correct and are sufficient as inputs unless later evidence proves otherwise
- `design-tokens/dist/figma/tokens.json` remains the Figma-facing derived artifact unless a future convergence pack explicitly replaces that projection
- the proof rail can be accepted before the hardened rail exists, but only with explicit deferred parity status
- the hardened rail cannot become required until credential ownership, transport determinism, and gate ownership are concrete
- any temporary Tokens Studio usage must still consume repo-approved projections and must not become a second authoring surface
