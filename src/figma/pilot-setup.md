# Pilot Plugin Setup

This runbook proves the current `CT-7B` plugin-based proof rail for the existing team-owned Figma file. [`src/figma/README.md`](./README.md) remains the policy summary; this file is the operator walkthrough for a proof attempt against the current artifact revision.

## Pilot Inputs

- Pilot file: `Collider Copy pilot` (`figma://file/SVcsU6gVvpezsJYrvBsS3V`)
- Canonical artifact path: `design-tokens/dist/figma/tokens.json`
- Canonical local proof URL: `http://localhost:4173/design-tokens/dist/figma/tokens.json`

## Preconditions

- Use the existing pilot Figma file instead of creating a new proof file.
- Keep the repo as the only source of truth. Do not edit canonical token values in Figma.
- Refresh the generated artifact through the normal repo token build flow before the walkthrough if needed.
- Prefer a repo-owned or OSS-backed importer/plugin. Tokens Studio is temporary carriage only.

## Local Proof Server

1. From the repo root, serve the generated artifact over localhost:
   `pnpm figma:tokens:serve`
2. Confirm the artifact is reachable before opening Figma:
   `curl http://localhost:4173/design-tokens/dist/figma/tokens.json`
3. Keep this server running while the plugin/importer performs the materialization.

## Configure The Plugin Or Importer

1. Build the repo-owned plugin bundle:
   `pnpm figma:plugin:build`
2. In Figma, import the plugin from:
   `figma/plugins/collider-token-sync/manifest.json`
3. Open the pilot Figma file and run the plugin: `Collider Token Sync`.
4. Fetch the artifact from the local proof URL:
   `http://localhost:4173/design-tokens/dist/figma/tokens.json`
5. Sync variables. The plugin will replace the `Collider Tokens` collection deterministically.

## Update The Ledger After The Walkthrough

After the proof attempt, update [`src/figma/sync-ledger.json`](./sync-ledger.json):

- Set `artifact.revision` to the reviewed repo revision from `git rev-parse HEAD`.
- Keep `publish.mode` aligned with the rail you actually used.
- Set `publish.tokensStudioCarrier=true` only if the attempt used Tokens Studio as temporary carriage.
- Keep `publish.figmaFile` pointed at the pilot file reference.
- Set `verification.materializationStatus` to `passed`, `failed`, or `not-run`.
- Set `verification.lastVerifiedRevision` to the attempted artifact revision when the importer actually ran; keep it `null` only for `not-run`.
- Keep `promotion.parityMode="deferred"` unless governance has explicitly moved parity to required.
- Set `promotion.highestEarnedLevel` to `D-publish-valid` only when the current artifact revision materialized successfully.
- Use `exceptions=[]` on the happy path. Record one `exceptions[]` entry per unresolved blocker with `blocking`, `status`, and the affected `field`.
- Re-run `node scripts/validate-sync-ledger.mjs src/figma/sync-ledger.json` and confirm the evaluator reports the intended state. `declared`, `verified-stale`, `blocked-exception`, and `incomplete` are all non-promotable outcomes.

## If The Proof Is Blocked

- Set `verification.materializationStatus` to `failed` if the importer ran and failed, otherwise leave it `not-run`.
- Leave `promotion.highestEarnedLevel` below `D-publish-valid`.
- Add an open blocking `exceptions[]` entry describing exactly what blocked the proof.
- Do not invent a successful verification revision or clear exceptions until the walkthrough actually succeeds.
