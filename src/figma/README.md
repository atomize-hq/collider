# Figma Sync Policy

This directory documents Collider's live Figma convergence posture under `CT-7B` and `CT-8B`.

## Canonical Source

- The repo remains the only canonical source of token values.
- `design-tokens/src/**` is the editable source tree.
- `design-tokens/dist/figma/tokens.json` is the only approved Figma-facing artifact.
- Figma consumes repo-approved values. It does not author canonical values.

## Publish Rail (`CT-7B`)

- `plugin-import-manual` is the default proof rail for current convergence work.
- The repo-owned Figma plugin (`Collider Token Sync`) is the canonical implementation of `plugin-import-manual`.
- `rest-variables-oauth` exists only as a future Enterprise-only rail (Figma Variables REST API) and is not part of the v1 operator flow.
- `tokens-studio-carried` is optional temporary carriage only. It is never a permanent required rail.
- No Figma write-back or bidirectional sync is allowed by this policy.

## Verification Ledger (`CT-8B`)

- `src/figma/sync-ledger.json` is the machine-readable v2 ledger for the current branch.
- `node scripts/validate-sync-ledger.mjs src/figma/sync-ledger.json` validates the ledger contract and prints the evaluated state for the current artifact revision.
- `node scripts/validate-figma-parity.mjs` reads the same ledger for required-parity checks.
- This README is operator guidance only. The JSON ledger and validator define the contract.
- Evaluated states are `declared`, `verified-current`, `verified-stale`, `blocked-exception`, and `incomplete`.
- Only `verified-current` is publish-valid for the active revision. Carrier-only Tokens Studio usage may still be `verified-current`, but it never becomes the permanent required rail.

## Current Posture

- The live ledger is currently `promotion.parityMode="deferred"`.
- Deferred parity may still earn `D-publish-valid` when the current artifact revision is materialized successfully.
- `E-promotion-complete` remains out of scope for v1 until an explicit Enterprise-backed parity rail is adopted.

## Operational Rules

- Treat plugin settings as a transport detail, not a source-of-truth switch.
- Canonical token changes still go through repo PRs.
- Record any unresolved parity blockers in `exceptions`.
- Keep parity-policy decisions centralized in `src/figma/parity-policy.md` instead of duplicating them across runbooks.

## Plugin Operator Flow

1. Build the plugin bundle:
   `pnpm figma:plugin:build`
2. Import the plugin into Figma from:
   `figma/plugins/collider-token-sync/manifest.json`
3. Serve the artifact locally (optional but recommended):
   `pnpm figma:tokens:serve`
4. In the pilot file, run the plugin and sync from:
   `http://localhost:4173/design-tokens/dist/figma/tokens.json`
