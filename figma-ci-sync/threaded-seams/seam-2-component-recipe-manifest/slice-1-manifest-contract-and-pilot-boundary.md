### S1 — Manifest Contract and Pilot Boundary

- **User/system value**: downstream seams get a concrete `CT-3` contract and a deliberately small v1 pilot, so build and docs work do not guess at recipe shape or overreach past the current repo surface.
- **Scope (in/out)**:
  - In: schema fields, file layout, authoring rules, pilot-component choice, slot/state/axis naming for the pilot.
  - Out: validator CLI wiring, generated outputs, Storybook rendering, and runtime consumption.
- **Acceptance criteria**:
  - `CT-3` is documented as a versioned source contract rooted at `design-tokens/src/recipes/*.recipe.json`.
  - The required top-level recipe fields are explicit: `recipeVersion`, `componentId`, `variantAxes`, `defaults`, `slots`, `states`, and `fallbacks`.
  - Token references are defined as DTCG-style reference strings to `CT-1` tokens, never inline scalar values.
  - The v1 pilot is concrete and bounded: `button` only, with `input` and `card` explicitly deferred until the repo has real primitive surfaces to verify against.
- **Dependencies**: `SEAM-1`, `CT-1`
- **Verification**: schema review against `threading.md`; positive/negative sample review before validator implementation.
- **Rollout/safety**: treat the schema as additive until `SEAM-3` and `SEAM-4` consume it; record breaking-shape changes in migration notes rather than mutating the pilot silently.

#### S1.T1 — Define the `CT-3` schema and source layout

- **Outcome**: a versioned schema file and authoring guide make the recipe contract unambiguous before validation or adoption work starts.
- **Inputs/outputs**:
  - Inputs: `CT-1` naming conventions from `SEAM-1`, `CT-3` definition from `figma-ci-sync/threading.md`.
  - Outputs: `design-tokens/src/recipes/schema/recipe.schema.json`, `design-tokens/src/recipes/README.md`.
- **Implementation notes**:
  - Require every recipe file to declare `recipeVersion`.
  - Require `componentId` to be stable, lowercase, and file-name aligned.
  - Define `variantAxes` as the source of allowed variant names and values.
  - Define `defaults` so downstream seams do not infer default states.
  - Define `slots` and `states` so slot-level token usage is explicit.
  - Define `fallbacks` for variant/state resolution order instead of leaving precedence implicit.
- **Acceptance criteria**:
  - The schema rejects missing required keys.
  - The guide names the canonical recipe glob: `design-tokens/src/recipes/*.recipe.json`.
  - The guide states that every token-bearing leaf must be a `CT-1` reference string.
- **Test notes**: review one valid and one intentionally invalid sample against the schema draft before coding the validator.
- **Risk/rollback notes**: avoid over-modeling compound behavior in v1; if a field is not needed for the pilot, omit it rather than freezing speculative shape.

Checklist:

- Implement: write the schema skeleton and authoring guide.
- Test: compare the draft against the `SEAM-2` invariants and `CT-3` definition.
- Validate: confirm no required field depends on runtime-only or Storybook-only data.
- Cleanup: remove any provisional fields that exist only to anticipate future components.

#### S1.T2 — Lock the v1 pilot boundary and naming rules

- **Outcome**: the seam stops being open-ended by recording exactly which component contract is in-scope for v1 and which names downstream seams can depend on.
- **Inputs/outputs**:
  - Inputs: `figma-ci-sync/seam-2-component-recipe-manifest.md`, current repo evidence showing no established primitive library under `src/components/system`.
  - Outputs: `design-tokens/src/recipes/pilot-components.json`, updates to `design-tokens/src/recipes/README.md`.
- **Implementation notes**:
  - Set the active pilot set to `button` only.
  - Record pilot axes as `intent` and `size`.
  - Record pilot states as `rest`, `hover`, `focus`, and `disabled`.
  - Record pilot slots as `root`, `label`, and `icon`.
  - Mark `input` and `card` as deferred examples from the source plan, not committed v1 scope.
- **Acceptance criteria**:
  - Downstream seams can tell which recipe files are normative in v1.
  - No task in this seam assumes a second component recipe exists.
  - The pilot naming is stable enough for later Storybook and Figma docs to mirror directly.
- **Test notes**: verify the pilot file does not introduce names that cannot be mapped back to the schema in `S1.T1`.
- **Risk/rollback notes**: if `SEAM-1` token naming cannot support the button contract cleanly, shrink the pilot further before adding axes or slots.

Checklist:

- Implement: add the pilot-boundary file and update the authoring guide.
- Test: sanity-check the chosen axes, states, and slots against the current repo’s lack of concrete components.
- Validate: confirm the pilot still demonstrates variants, states, and slot references without expanding scope.
- Cleanup: move any deferred component examples out of normative v1 sections.
