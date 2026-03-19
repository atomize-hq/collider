# Pilot Plugin Setup

This runbook proves the current `CT-7B` plugin-based proof rail for the existing team-owned Figma file. [`src/figma/README.md`](./README.md) remains the policy summary; this file is the operator walkthrough for a proof attempt against the current artifact revision.

## Pilot Inputs

- Pilot file: `Collider Copy pilot` (`figma://file/23PLdynlRYoBYQx9teoC8A`)
- Canonical artifact path: `design-tokens/dist/figma/tokens.json`
- Canonical local proof URL: `http://127.0.0.1:4173/design-tokens/dist/figma/tokens.json`

## Preconditions

- Use the existing pilot Figma file instead of creating a new proof file.
- Keep the repo as the only source of truth. Do not edit canonical token values in Figma.
- Refresh the generated artifact through the normal repo token build flow before the walkthrough if needed.
- Prefer a repo-owned or OSS-backed importer/plugin. Tokens Studio is temporary carriage only.

## Local Proof Server

1. From the repo root, serve the generated artifact over localhost:
   `python3 -m http.server 4173 --bind 127.0.0.1`
2. Confirm the artifact is reachable before opening Figma:
   `curl http://127.0.0.1:4173/design-tokens/dist/figma/tokens.json`
3. Keep this server running while the plugin/importer performs the materialization.

## Configure The Plugin Or Importer

1. Open the pilot Figma file and launch the chosen plugin or importer.
2. Use a read-only handoff mode such as a local URL, pasted JSON, or file upload.
3. Point the importer at `design-tokens/dist/figma/tokens.json`.
4. Materialize variables into the pilot file without enabling any write-back mode.

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
