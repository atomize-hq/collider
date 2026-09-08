# Collider Token Sync (build output)

**This directory is generated. Do not edit it.**

```bash
pnpm figma:plugin:build
```

Then import `figma/plugins/collider-token-sync/manifest.json` into Figma
(Plugins → Development → Import plugin from manifest).

## Where the plugin actually lives

The plugin source is [`@atomize-hq/ds-skills`](https://github.com/atomize-hq/ds-skills), the pinned release named in `ds-skills.release.json`.
Everything specific to this repo is in [`figma/token-sync.config.json`](../../token-sync.config.json):
the `Collider Tokens` collection name, the localhost artifact URL, the
`com.atomizehq.collider` `$extensions` namespace, the `dark` default theme, and the
plugin's Figma name and id.

The build stamps that config into the bundle and the manifest, so the plugin id
Figma already knows stays stable across rebuilds.

## The two actions

- **Sync Variables** — writes the published artifact into the Figma file, then re-reads it and
  runs the drift comparison to confirm the write actually landed. Upserts, so `VariableID`s and
  the paint bindings pointing at them survive.
- **Check Drift** — read-only. Reports where the file disagrees with the artifact, in either
  direction.

A finding from Check Drift is a _proposal_, never a source of truth.
`design-tokens/src/tokens/` is the only authoring surface; fix it there and re-publish.

## Serving the artifact

The plugin fetches over HTTP, so run the local proof server first:

```bash
pnpm figma:tokens:serve
```

## Tests

The rail is unit-tested in its own repo. What this repo asserts — that _our_ artifact and _our_
config produce the variable set we expect — is in
`pnpm figma:verify`, which runs as a step of `pnpm govern:tokens`.
