# Collider token publication

Canonical values live in `design-tokens/src/tokens/`. The installed ds-skills product
builds `design-tokens/dist/figma/tokens.json`, generates the Figma plugin and serves
its artifact. Collider owns configuration, target identity and publication records,
not plugin implementation. See [installed boundary](../../docs/ds-skills-consumer.md).

## Configured inputs

- `figma/token-sync.config.json`: collection `Collider Tokens`, plugin identity
  `Collider Token Sync`, artifact URL and namespace.
- `ds-skills.project.json`: installed capability configuration.
- `src/figma/validation-profile.json`: Collider artifact/destination vocabulary.
- `publish-proof.json`: recorded token publication attempt.
- `sync-ledger.json`: version 3 ledger with a SHA-bound publication proof.

The recorded production target is `23PLdynlRYoBYQx9teoC8A`. Do not use it for an
unreviewed migration smoke. [Operator inputs](plugin-setup.md) describe isolation.

## Build, serve and verify

```sh
pnpm build:tokens
pnpm figma:plugin:build
pnpm figma:tokens:serve
```

Import the generated `figma/plugins/collider-token-sync/manifest.json` into native
Figma. Verify its actual local path and the open destination before running it.
Load the configured artifact, use **Check Drift** for a read-only comparison, then
**Sync Variables** only for an authorized target/change. Sync re-reads variables to
verify its result. The workflow updates existing matching IDs; do not delete and
recreate production collections or discard bindings to obtain a passing check.

The token server records posted drift results at `.codex-artifacts/figma/drift-report.json`
with artifact SHA and repo revision. Check those identities and the actual destination;
a stale report or a successful fetch alone is not live publication evidence. No
write-back into token source is authorized. Reconcile desired Figma changes into
canonical source and publish forward after review.

```sh
pnpm validate:publish-proof
pnpm validate:sync-ledger
pnpm validate:figma-parity
```

These commands validate records and their binding through the pinned product. They
do not read live Figma or establish visual parity for all components. The existing
proof records an earlier publication at `dc97a2671dbcc6e2a71873042566f4937b766d9d`;
its preservation during separation is not a newly executed smoke.

See [proof inputs](publish-proof-contract.md), [parity policy](parity-policy.md) and
[foundations generation](../../figma/foundations/README.md). Component readiness and
recipe validity are [separate](../../docs/stage1/sync-policy.md).
