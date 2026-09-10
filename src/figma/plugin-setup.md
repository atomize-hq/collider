# Collider plugin operator inputs

Use the installed product's supported plugin workflow, configured by
`figma/token-sync.config.json`. [Publication policy](README.md) explains evidence
boundaries; this file supplies Collider-specific operation and safety constraints.

## Production

- File key: `23PLdynlRYoBYQx9teoC8A`.
- Collection: `Collider Tokens`; matching existing variable IDs/bindings must survive.
- Artifact: `design-tokens/dist/figma/tokens.json`.
- Local URL: `http://localhost:4173/design-tokens/dist/figma/tokens.json`.
- Generated manifest: `figma/plugins/collider-token-sync/manifest.json`.

Confirm the registered development plugin uses the freshly built manifest, not a
stale bundle from another checkout. Fetch the current artifact after each build.
Inspect drift before an authorized sync; do not blindly remove unexpected variables.
A production change requires reviewed canonical source and actual post-sync checks.

## Separation verification

First use an explicitly selected disposable Figma file. Configure an isolated
consumer copy with that file's actual targets and separate evidence outputs. Confirm
the team/file identity before mutation. Do not redirect production records to the
test, fabricate passed fields, or mark an unexecuted check as successful.

Build and serve through the independently installed pinned product. In native Figma,
load the artifact, observe drift, sync and re-read the result. Capture real artifact
identity, file/collection/mode IDs, variable values/types, preserved IDs on repeat
sync, and the drift report. Record an actual failure as failure; lack of execution
is missing proof. Product schema checks are not substitutes for this observation.

Foundations execution needs a compatible Plugin API context and its separate
page/collection configuration; see [safe first execution](../../figma/foundations/README.md).
Do not remove ownership guards to use an incompatible adapter.
