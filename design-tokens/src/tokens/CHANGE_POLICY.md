# Token And Theme Change Policy

## Purpose And Precedence

This document is the seam-owned policy for public identifier changes under `CT-1` and `CT-2`.
It governs only:

- public token IDs published from `design-tokens/src/tokens/**`, and
- theme IDs declared in `design-tokens/src/tokens/themes/registry.json`.

Use this file when deciding whether a token-ID or theme-ID change is additive or breaking, and when deciding whether an explicit migration event is required.

This document does not own validator behavior, CI wiring, generator behavior, or downstream execution of migrations.
If another local note appears to define token-ID or theme-ID rename/removal policy differently, this file takes precedence.

## Non-Goals

- This is not a generator specification for `SEAM-3`.
- This is not an app or Storybook migration runbook for `SEAM-4`.
- This is not a validator, gate, or cutover contract for `SEAM-6`.
- This does not redefine the token-family grammar from `design-tokens/src/tokens/README.md`.
- This does not replace `runtime-css-aliases.json` as the machine-readable migration artifact for runtime-facing compatibility.

## Token ID Change Rules

- Adding a new canonical token ID is additive and non-breaking only when no existing public token ID changes and the new ID follows the family and segment rules published in `design-tokens/src/tokens/README.md`.
- Renaming an existing canonical token ID is a breaking migration event.
- Removing an existing canonical token ID is a breaking migration event.
- Silent rename or silent removal of a public token ID is never allowed.
- When a token-ID rename or removal affects a runtime-exposed canonical token, `design-tokens/src/tokens/migrations/runtime-css-aliases.json` remains the migration artifact of record for any affected runtime compatibility handling.

These rules implement the `CT-1` versioning contract in `figma-ci-sync/threading.md`: additive token introduction is non-breaking, while token rename or removal requires a migration mapping and regenerated consumer artifacts.

## Theme ID Change Rules

- Adding a new theme ID is additive and non-breaking only when it is appended to `design-tokens/src/tokens/themes/registry.json` with:
  - a unique `id`,
  - a matching theme file entry,
  - `required: false`, and
  - an explicit `extends` chain that still terminates at `dark`.
- Renaming an existing theme ID is a breaking migration event.
- Removing an existing theme ID is a breaking migration event.
- An additive theme must not weaken `dark` as `defaultThemeId` or `terminalFallbackThemeId`.
- `unknownThemeIdBehavior` must remain `error` for additive theme expansion unless the theme contract itself is explicitly revised in a later seam-owned change.

These rules implement the current `CT-2` contract in `figma-ci-sync/threading.md`: theme IDs become stable public names once consumers depend on them, omitted theme selection still resolves to `dark`, and explicitly unknown theme IDs remain contract errors.

## Migration Artifact Obligations

- A token-ID rename or removal that touches a runtime-exposed canonical token requires updating every affected `canonicalTokenId` entry in `design-tokens/src/tokens/migrations/runtime-css-aliases.json`.
- If a legacy runtime variable is being retired as part of that token change, the alias-map entry must continue using the existing `rename-with-migration` action rather than ad hoc prose or an undocumented exception.
- A theme-ID rename or removal requires updating every affected `themeId` entry in `design-tokens/src/tokens/migrations/runtime-css-aliases.json`.
- A theme-ID rename or removal also requires updating the corresponding entry in `design-tokens/src/tokens/themes/registry.json`.
- Additive token IDs and additive theme IDs do not create a migration artifact by themselves.
- Additive changes must not silently rewrite existing alias-map semantics, default-theme behavior, or fallback behavior already published for current consumers.

## Worked Examples

### Example 1: Token rename is a breaking migration event

Hypothetical change: rename `semantic.color.background.white-10` to a different public canonical token ID.

- Classification: breaking migration event.
- Why: an existing public token ID would change, which is breaking under `CT-1`.
- Required artifact updates:
  - update the `canonicalTokenId` field for the `--color-background-white-10` row in `design-tokens/src/tokens/migrations/runtime-css-aliases.json`,
  - preserve explicit migration handling for the legacy runtime variable through the existing `rename-with-migration` action, and
  - refresh any worked documentation that cites the old canonical token ID, including `design-tokens/src/tokens/migrations/runtime-traceability.md`.
- Not allowed: leaving the alias-map row untouched while changing the canonical token ID in source files.

### Example 2: Additive theme addition remains non-breaking only under the current fallback contract

Hypothetical change: add a new theme ID `midnight` that extends `dark`.

- Classification: additive and non-breaking only if the current theme contract remains intact.
- Required registry conditions:
  - `midnight` is added as a unique `id` in `design-tokens/src/tokens/themes/registry.json`,
  - the matching theme file is declared,
  - `required` stays `false` for `midnight`,
  - `midnight` declares `extends: "dark"` or another explicit chain that still terminates at `dark`,
  - `defaultThemeId` remains `dark`,
  - `terminalFallbackThemeId` remains `dark`, and
  - `unknownThemeIdBehavior` remains `error`.
- Alias-map expectation: existing entries in `design-tokens/src/tokens/migrations/runtime-css-aliases.json` remain on `dark` unless a separate, explicit migration is declared.
- Not allowed: adding `midnight` while implicitly changing the default theme, weakening unknown-theme handling, or silently remapping existing alias-map rows.

## Maintenance Rule

Keep this file as the single policy owner for token-ID and theme-ID change classification.
If future docs need to mention rename/removal behavior, they should cross-reference this file and stay scoped to their own concern instead of restating the full policy.
