# Component Recipe Validator Fixtures

These fixtures exercise the local `SEAM-2` validator contract without involving build transforms,
Storybook, or CI wiring. They are manual-only — no test, package script, or CI job reads them.

## Currently blocked

**All four fixtures fail at `$.componentId` with `[pilot-component] component "button" is not an
active pilot component`, so none of the expectations below can be observed today.**

`design-tokens/src/recipes/pilot-components.json` has no active components: `422c854`
(2026-03-23) migrated the pilot rail from `button` to `thinking-indicator`, stranding these
fixtures, and `96d5c39` (2026-03-25) removed `thinking-indicator` too, leaving only two
`deferred` entries. `validatePilotContract` runs before every other rule, so the first failure
masks whatever each fixture was built to catch.

To observe the documented behaviour, add an active `button` entry to that registry carrying
`variantAxes` `intent: [primary, secondary]` / `size: [sm, md]`, defaults `intent: primary`,
`size: md`, `state: rest`, slots `[root, label, icon]`, and states
`[rest, hover, focus, disabled]`. With that entry present, all four expectations below hold
exactly as written — verified 2026-09-03.

## Expected outcomes

- `button.valid.recipe.json`: exits 0 — `✓ Validated 1 component recipe file(s)`
- `button.invalid-missing-token.recipe.json`: exits 1 with a `token-inventory` diagnostic at
  `$.slots.label.text` — `unknown CT-1 token reference "{semantic.color.text.missing}"`
- `button.invalid-inline-value.recipe.json`: exits 1 with a `token-reference` diagnostic at
  `$.slots.root.background` — `inline scalar values are not allowed`
- `button.invalid-unknown-pilot-name.recipe.json`: exits 1 with a `pilot-contract` diagnostic at
  `$.slots` — `unknown slot names: badge`

Run one with:

```bash
node scripts/validate-component-recipe.mjs scripts/fixtures/component-recipes/button.valid.recipe.json
```

## Notes

- The validator stops on the first invalid file when given a glob.
- These fixtures intentionally stay inside the `button` pilot boundary that
  `design-tokens/src/recipes/pilot-components.json` defined when they were written (`72e3643`,
  2026-03-18).
- `scripts/validate-component-recipe.mjs` is not wired into `package.json`, the `justfile`, or CI.
  The validators behind it (`scripts/lib/component-recipe-validator*.mjs`) _are_ live inside
  `govern:tokens`, but run over zero recipe files — `design-tokens/src/recipes/index.json` is
  empty.
