# Runtime Cutover Compatibility Notes

## Purpose

This document is the policy companion to `design-tokens/src/tokens/migrations/runtime-css-aliases.json`.
It tells downstream seams what they must preserve during the initial runtime cutover without prescribing generator internals, app rewiring details, or enforcement wiring.

## Non-Goals

- This is not a generator specification for `SEAM-3`.
- This is not an app or Storybook migration checklist for `SEAM-4`.
- This is not a cutover runbook, validator contract, or gate definition for `SEAM-6`.
- This does not duplicate the full runtime inventory or alias-map payload.

## Stable Import-Path Rule

During the initial runtime cutover, `src/app/globals.css` remains the sole stable runtime import surface and continues importing `../lib/tokens/tokens.css`; downstream seams may replace the file contents behind that path but must not introduce a second runtime import route.

This rule exists to keep the app and Storybook cutover behind one stable handoff path while `src/lib/tokens/tokens.css` changes from hand-authored CSS to a generated artifact.

## Machine-Readable Contract Boundary

`design-tokens/src/tokens/migrations/runtime-css-aliases.json` is the machine-readable compatibility contract for legacy runtime variable handling.
This document explains how to interpret the alias-map actions, but it does not add a second source of truth or override individual alias records.

If review finds a contradiction between these notes and the alias map, fix the contradiction at the source instead of documenting a local exception here.

## No-Silent-Removal Rule

Any legacy runtime variable listed in the runtime inventory or alias map remains part of the required compatibility surface until a later seam-owned cutover step explicitly retires it.

Generated-artifact adoption, runtime cleanup, or gate promotion must not silently remove a legacy variable that is still covered by the alias map.

## Rename-As-Migration Rule

A runtime-name change is never treated as opportunistic cleanup.
If a legacy variable is going to disappear, the alias map must mark that case as `rename-with-migration`, and a later seam must own the explicit migration handling before removal becomes valid.

This keeps token-source policy aligned with `CT-1` versioning rules: renames and removals are migration events, not incidental output churn.

## Compatibility Action Semantics

- `preserve`: the legacy runtime variable remains a required compatibility surface during v1 cutover. Example: `--color-text-primary` continues mapping directly to `semantic.color.text.primary`.
- `alias`: the legacy runtime variable must remain available during cutover even if a downstream seam also emits a more canonical runtime-facing name. Example: the legacy `statusstrip` variables map to canonical `semantic.color.status-strip.*` token IDs and must not disappear while consumers still rely on the legacy spelling.
- `rename-with-migration`: the legacy runtime variable is not allowed to disappear silently; its retirement requires explicit downstream migration handling before removal. Example: `--color-background-white-10` is treated as a tracked migration event rather than an unreviewed rename.

These categories define compatibility intent only.
They do not prescribe how `SEAM-3` emits runtime CSS, how `SEAM-4` consumes it, or how `SEAM-6` enforces it.

## Downstream Obligations

### `SEAM-3` — Token Build And Distribution

`SEAM-3` must preserve the stable artifact path at `src/lib/tokens/tokens.css` and honor the compatibility intent recorded in `runtime-css-aliases.json`.
It may change how the file is generated, but it must keep legacy runtime names available when the alias map marks them as `preserve` or `alias`, and it must not treat `rename-with-migration` entries as permission for silent removal.

### `SEAM-4` — App And Storybook Consumption

`SEAM-4` must keep the app and Storybook on the shared runtime artifact path defined above.
It must not reintroduce backup token tables, copied theme IDs, or parallel runtime import paths while cleaning up consumer surfaces around the generated artifact.

### `SEAM-6` — Governance, Validation, And Cutover

`SEAM-6` may enforce these compatibility obligations through validators, runbooks, and gates, but the exact commands, rollback steps, and enforcement wiring remain owned by `SEAM-6`.
This document defines what must be preserved, not how governance machinery is implemented.

## Theme Compatibility

All v1 runtime compatibility obligations assume the `dark` baseline defined by `CT-2` in `design-tokens/src/tokens/themes/registry.json`.
Omitted theme selection still resolves to `dark`, and an explicitly unknown theme ID remains a contract error rather than a silent fallback.

Future additive themes may extend the compatibility surface later, but this document does not expand the v1 baseline beyond `dark`.
