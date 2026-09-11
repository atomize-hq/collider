# Collider foundations specimens

The foundations implementation belongs to the installed ds-skills product. Collider
supplies only its resolved token artifact, specimen model and presentation data.

## Build and check

```sh
pnpm build:tokens
pnpm figma:foundations:build
pnpm figma:foundations:check
```

The build writes one self-contained `build/foundations/foundations.run.js`. Check
compares it with current inputs and the pinned renderer without changing it. Neither
command executes Figma code, publishes tokens, verifies a live render or proves
component readiness. The output remains ignored generated data, not authored code.

`model.json` selects 142 non-core token leaves across 29 sections, including all six
motion-role duration/easing leaves that were absent from the initial extraction
probe. The 34 raw core palette leaves remain publication inputs, not extra specimen
rows. All 176 variables are still required in the configured publication collection.
`presentation.json` lays out six specimen families in each of dark and light modes.
The former combined-mode reference becomes 12 explicitly mode-pinned groups; it is
not a claim of pixel-identical rendering or an already completed live migration.

Color pairing and informational-versus-text/UI metrics are consumer data. Typography,
spacing, shape, shadows, motion and layout remain specimens rather than only color
swatches. Derived font styles, opacity fractions, line-height/letter-spacing, CSS
effects and display-scaled geometry are not falsely described as direct bindings.
Contrast labels describe configured token pairs, not component accessibility proof.

## Figma targets and safe first execution

Read-only discovery on 2026-09-10 confirmed the Collider design file
`23PLdynlRYoBYQx9teoC8A`, Foundations page `2419:17`, and 176-variable
`Collider Tokens` collection `VariableCollectionId:2019:334`, with dark/light modes.
Poppins and Roboto Mono styles used by this presentation were available. Recheck
these facts before running a script; IDs and available fonts can change.

The six existing legacy frames are **not owned by the new renderer**. Their IDs are
not accepted as replacement targets. New frame targets are null and their planned
positions start at x=8800, beyond the last observed legacy edge at x=8248. Recheck
that space before a real run. Do not remove old frames by name, delete collections,
recreate variables or adopt unowned content to make a check pass.

First execute through a supported Figma Plugin API evaluation context against an
**isolated test destination**, with its own explicit page/collection targets and
published test variables. Retarget a separate consumer config; do not rewrite the
production publication ledger to describe the test. Verify the resulting specimen
content and rendering, preserve returned root IDs, and only then review a canonical
presentation update. Replacement requires those exact renderer-owned root IDs in
`targetId` and the same plugin context for its ownership markers.

The renderer uses standard plugin-data ownership and guarded preparation/replacement.
The connected `use_figma` MCP adapter explicitly does not support `setPluginData`, so
it is **not** a supported execution context for this generated script. Its read-only
discovery above is not a render test. Use a compatible native/plugin evaluation
context; do not strip the ownership guard or paste the script into an incompatible
adapter. Native execution and live rendered-page review remain pending.

Token plugin build/serve/publication and ledger/proof verification are separate
installed capabilities. A fresh foundations script is not token publication evidence.
Product-owned generation, runtime limits, failure/rollback semantics and supported
APIs are documented with ds-skills; no local template implementation is retained.
