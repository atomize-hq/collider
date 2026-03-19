# Pilot Plugin Setup

This runbook proves the `CT-7B` `plugin-import-manual` path for the existing team-owned Figma file. [`src/figma/README.md`](./README.md) is the live rail policy, and [`src/figma/publish-proof-contract.md`](./publish-proof-contract.md) defines the seam-owned proof facts this walkthrough must capture.

## Pilot Inputs

- Pilot file: `Collider Copy pilot` (`figma://file/23PLdynlRYoBYQx9teoC8A`)
- Canonical artifact path: `design-tokens/dist/figma/tokens.json`
- Canonical local proof URL: `http://127.0.0.1:4173/design-tokens/dist/figma/tokens.json`
- Required theme baseline from `CT-2`: `dark`

## Preconditions

- Use the existing pilot Figma file instead of creating a new proof file.
- Open a clean or reset version of the pilot file before starting the walkthrough.
- Keep the repo as the only source of truth. Do not edit token values in Figma or push token changes from the plugin.
- Refresh the generated artifact before the walkthrough and review the resulting diff before continuing:
  `pnpm build:tokens`
- Use a repo-owned or OSS-backed importer/plugin if available. Tokens Studio is not the intended permanent rail.

## Local Proof Server

Use this server when the plugin/importer accepts a URL input and you want to materialize the generated artifact from the same machine as Figma.

1. From the repo root, serve the generated artifact over localhost:
   `python3 -m http.server 4173 --bind 127.0.0.1`
2. Confirm the artifact is reachable before opening Figma:
   `curl http://127.0.0.1:4173/design-tokens/dist/figma/tokens.json`
3. Keep this server running while the plugin/importer performs the materialization.

## Configure The Plugin Or Importer

1. Open the pilot Figma file and launch the chosen plugin or importer.
2. Select the input mode the plugin actually supports:
   - local URL input,
   - pasted JSON input,
   - local file upload,
   - or another documented read-only artifact handoff.
3. Point the plugin/importer at `design-tokens/dist/figma/tokens.json` through the chosen handoff mode.
4. Materialize variables into the pilot file. Do not enable any write-back or repo-sync mode.

## Materialize the Artifact

1. Confirm the plugin/importer loaded the generated artifact successfully.
2. Do not create, rename, or edit canonical token values locally in the pilot file.
3. Materialize variables for the required `dark` baseline.
4. Inspect the created or updated variables in the pilot file.

## Current Proof Boundary

- The repo currently publishes one Figma-facing artifact as a single `tokens.json` file and one required theme baseline, `dark`.
- For this pilot, the required proof is narrow: confirm that the canonical artifact can be materialized for the `dark` baseline without manual token entry.
- Keep the observed theme mapping at `{"themeId":"dark","figmaMode":"dark"}` as the approved baseline until a maintainer completes the live Figma walkthrough and observes a different visible label that must be recorded explicitly.

## Record The Proof After The Walkthrough

After the materialization attempt, update [`src/figma/publish-proof.json`](./publish-proof.json) using the schema from [`src/figma/publish-proof-contract.md`](./publish-proof-contract.md):

- Keep `proofVersion` as `"1"`.
- Record `mode` as `plugin-import-manual` unless this walkthrough explicitly used `tokens-studio-carried` as temporary carriage.
- Record `artifact.path` as `design-tokens/dist/figma/tokens.json`.
- Record `artifact.gitSha` from `git rev-parse HEAD` after confirming the artifact revision under review.
- Keep `destination.name` as `Collider Copy pilot`.
- Keep `destination.figmaFile` as `figma://file/23PLdynlRYoBYQx9teoC8A`.
- Record `materialization.status` as `passed` or `failed`.
- Record `materialization.attemptedAt` as a UTC ISO-8601 timestamp.
- Record `materialization.notes` whenever the attempt fails. Notes are optional for passed runs.
- Record `carrier.used` as `true` only if Tokens Studio temporarily carried the approved artifact.
- If `carrier.used` is `true`, fill `carrier.reason` and `carrier.exitExpectation`. Otherwise keep both fields as `null`.
- Validate the result locally:
  `pnpm validate:publish-proof`
- If you maintain [`src/figma/sync-ledger.json`](./sync-ledger.json) for branch-local historical evidence, treat it as legacy evidence only. Its current root shape is not the `CT-7B` proof contract and is expected to be replaced downstream by `SEAM-6B`.

## If the Proof Is Blocked

- Record `materialization.status` as `failed`.
- Capture exactly what blocked the attempt in `materialization.notes`, including importer errors, access issues, plugin UI mismatch, or artifact/materialization drift.
- Do not invent a passed proof or downstream governance status until the walkthrough is actually completed in Figma.
