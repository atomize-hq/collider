# Component Recipe Validator Fixtures

These fixtures exercise the local `SEAM-2` validator contract without involving build transforms, Storybook, or CI wiring.

## Expected outcomes

- `button.valid.recipe.json`: passes `node scripts/validate-component-recipe.mjs scripts/fixtures/component-recipes/button.valid.recipe.json`
- `button.invalid-missing-token.recipe.json`: fails with a `token-inventory` diagnostic at `$.slots.label.text`
- `button.invalid-inline-value.recipe.json`: fails with a `token-reference` diagnostic at `$.slots.root.background`
- `button.invalid-unknown-pilot-name.recipe.json`: fails with a `pilot-contract` diagnostic for the unexpected `badge` slot

## Notes

- The validator stops on the first invalid file when given a glob.
- These fixtures intentionally stay inside the v1 `button` pilot boundary defined in `design-tokens/src/recipes/pilot-components.json`.
