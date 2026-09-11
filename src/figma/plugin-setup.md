# Collider plugin operator inputs

Use the installed product's [public plugin runbook](https://github.com/atomize-hq/ds-skills/blob/v0.5.4/README.md), configured by
`figma/token-sync.config.json`. This document supplies Collider-specific inputs and
safety constraints; it is not a second reusable plugin runbook. The tagged runbook
link is prospective until the matching immutable tag/assets are published and
verified and Collider's pin/core/custom installations are rebound to that exact
published identity; an unpublished staged pin is not public operational authority.

## Collider inputs

- File key: `23PLdynlRYoBYQx9teoC8A`.
- Collection: `Collider Tokens`; matching existing variable IDs/bindings must survive.
- Artifact: `design-tokens/dist/figma/tokens.json`.
- Local artifact URL: `http://localhost:4173/design-tokens/dist/figma/tokens.json`.
- Generated development-plugin manifest:
  `figma/plugins/collider-token-sync/manifest.json`.

The release prebuilds its shared token runtime. `pnpm figma:plugin:build` applies
these consumer inputs and emits the consumer-specific manifest/code/UI; import that
fresh manifest as a **development plugin** in a compatible Figma Plugin API context.
After `pnpm build:tokens`, `pnpm figma:tokens:serve` serves the exact artifact. The
Collider alias supplies `--drift-out .codex-artifacts/figma/drift-report.json`: an
in-panel drift result and successful report recording are distinct outcomes. A missing
or unwritable drift report is a recording failure, not proof that drift was absent.

Use the public ds-skills release contract for artifact fetch/file fallback, supported
sync/check/report actions, and platform-independent recovery. Confirm the registered
development plugin uses this freshly built manifest rather than a stale bundle from
another checkout.

## Safety boundary before Sync

The product's pre-sync warning is controlling; this file does not weaken or duplicate
it. Before any authorized production sync, recheck that Collider's configured
collection and complete artifact are the selected inputs, inspect drift, and use the
product's isolated-first verification guidance. Do not blindly remove unexpected
variables, rewrite the production ledger, or bypass ownership guards.

A production change requires reviewed canonical source and real post-sync checks. No
current instruction grants Figma mutation: historical isolated-proof authorization is
not standing authorization, and a schema/build check is not a live publication receipt.

## Foundations boundary

Foundations execution has separate page/collection configuration and requires a
compatible Plugin API context; see [safe first execution](../../figma/foundations/README.md).
It is not a token-plugin action. Do not remove ownership guards to use an incompatible
adapter.
