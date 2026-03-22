# Collider Token Sync (Figma Plugin)

This is a repo-owned Figma plugin that materializes `design-tokens/dist/figma/tokens.json` into a local variables collection inside the current Figma file.

## Import

Import the plugin by selecting this file in Figma:

`figma/plugins/collider-token-sync/manifest.json`

Do not import `dist/` (that folder is not the runtime entrypoint for this plugin).

## Build

From the repo root:

`pnpm figma:plugin:build`

This writes `code.js` next to `manifest.json` (gitignored).
