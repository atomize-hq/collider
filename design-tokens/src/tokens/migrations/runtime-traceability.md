# Runtime Traceability Examples

## Purpose And Contract Boundary

This document proves that the current runtime CSS variable surface can be traced back to one canonical token ID, one theme ID, and one compatibility action without relying on later build or generator implementation details.

It is a worked-example companion to `design-tokens/src/tokens/migrations/runtime-css-aliases.json`, not a second source of truth.
Use the alias map for the full machine-readable contract, `runtime-variable-inventory.json` for the complete runtime variable inventory, and the token JSON files under `design-tokens/src/tokens/` for canonical token ownership and references.

This document does not:

- replace the full alias inventory,
- define generator behavior for `SEAM-3`,
- define app or Storybook migration steps for `SEAM-4`,
- define validator, CI, or cutover enforcement for `SEAM-6`.

## How To Read An Example

Every example in this file uses the same fields so maintainers can follow one traceability path end to end:

- `Legacy runtime variable`: the current CSS custom property from `src/lib/tokens/tokens.css`.
- `Runtime category`: the normalized category recorded in `runtime-variable-inventory.json`.
- `Canonical semantic token ID`: the public token ID downstream seams should reference instead of the legacy CSS variable.
- `Theme ID`: the v1 theme entry that owns the runtime value. In v1 this remains `dark`, which is also the default theme in `themes/registry.json`.
- `Compatibility action`: the action recorded in `runtime-css-aliases.json`. Action meanings come from `runtime-cutover-notes.md`.
- `Semantic-to-core resolution`: the canonical reference chain from the semantic token to the core scalar token that owns the raw value.
- `Current runtime value`: the live value currently published by `src/lib/tokens/tokens.css`.
- `Why this action applies`: a short explanation of why the alias-map action is correct for this runtime name.

## Worked Examples

### Example 1: Background base stays preserved

- `Legacy runtime variable`: `--color-background-base`
- `Runtime category`: `background`
- `Canonical semantic token ID`: `semantic.color.background.base`
- `Theme ID`: `dark`
- `Compatibility action`: `preserve`
- `Semantic-to-core resolution`: `semantic.color.background.base` -> `{core.color.neutral.950}` -> `core.color.neutral.950`
- `Current runtime value`: `#171717`
- `Why this action applies`: this runtime name already matches the canonical semantic meaning closely enough that v1 cutover preserves the legacy CSS variable while downstream seams adopt the canonical semantic token ID.

### Example 2: Background white-10 is a tracked rename migration

- `Legacy runtime variable`: `--color-background-white-10`
- `Runtime category`: `background`
- `Canonical semantic token ID`: `semantic.color.background.white-10`
- `Theme ID`: `dark`
- `Compatibility action`: `rename-with-migration`
- `Semantic-to-core resolution`: `semantic.color.background.white-10` -> `{core.color.white-alpha.10}` -> `core.color.white-alpha.10`
- `Current runtime value`: `rgba(255, 255, 255, 0.1)`
- `Why this action applies`: this legacy runtime name is kept under explicit migration control so later cleanup cannot retire it silently; any removal must be handled as a documented migration event rather than opportunistic output churn.

### Example 3: Text secondary stays preserved through a semantic token

- `Legacy runtime variable`: `--color-text-secondary`
- `Runtime category`: `text`
- `Canonical semantic token ID`: `semantic.color.text.secondary`
- `Theme ID`: `dark`
- `Compatibility action`: `preserve`
- `Semantic-to-core resolution`: `semantic.color.text.secondary` -> `{core.color.neutral.500}` -> `core.color.neutral.500`
- `Current runtime value`: `#6a7282`
- `Why this action applies`: the runtime variable is still part of the required compatibility surface, but downstream contracts should move to the canonical semantic token ID instead of binding directly to the runtime CSS variable name.

### Example 4: Legacy statusstrip spelling remains an alias

- `Legacy runtime variable`: `--color-statusstrip-success`
- `Runtime category`: `status-strip`
- `Canonical semantic token ID`: `semantic.color.status-strip.success`
- `Theme ID`: `dark`
- `Compatibility action`: `alias`
- `Semantic-to-core resolution`: `semantic.color.status-strip.success` -> `{core.color.green.800}` -> `core.color.green.800`
- `Current runtime value`: `#0e5e2e`
- `Why this action applies`: the runtime CSS variable keeps the legacy `statusstrip` spelling for compatibility, while the canonical token ID uses the normalized `status-strip` segment form. The alias-map action makes that naming split explicit without treating the legacy runtime name as canonical.

## Maintenance Guardrails

- Keep this file small. It is a proof set for `background`, `text`, and `statusstrip`, not a duplicate of the full alias inventory.
- Update an example only when one of its cited source-of-truth artifacts changes: `runtime-variable-inventory.json`, `runtime-css-aliases.json`, `semantic.tokens.json`, `core.tokens.json`, `themes/dark.tokens.json`, `themes/registry.json`, or `src/lib/tokens/tokens.css`.
- Add a new worked example only when the current set no longer covers a runtime category or compatibility-action class that downstream seams need to understand.
- If this file ever contradicts the alias map, runtime inventory, or canonical token files, fix the contradiction at the source instead of recording a local exception here.
