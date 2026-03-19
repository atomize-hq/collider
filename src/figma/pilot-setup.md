# Pilot Plugin Setup

This runbook proves the `CT-7` pilot plugin-import path for the existing team-owned Figma file. [`src/figma/README.md`](./README.md) remains the normative policy source; this file is only the step-by-step operator path for the pilot proof.

## Pilot Inputs

- Pilot file: `Collider Copy pilot` (`figma://file/23PLdynlRYoBYQx9teoC8A`)
- Canonical artifact path: `design-tokens/dist/figma/tokens.json`
- Canonical local proof URL: `http://127.0.0.1:4173/design-tokens/dist/figma/tokens.json`
- Required theme baseline from `CT-2`: `dark`

## Preconditions

- Use the existing pilot Figma file instead of creating a new proof file.
- Open a clean or reset version of the pilot file before starting the walkthrough.
- Keep the repo as the only source of truth. Do not edit token values in Figma or push token changes from the plugin.
- If you need to refresh the committed artifact before the walkthrough, run the normal repo token build flow first and review the resulting diff before continuing.
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
- Keep the ledger mapping at `{"themeId":"dark","figmaMode":"dark"}` as the approved baseline until a maintainer completes the live Figma walkthrough and observes a different visible label that must be recorded explicitly.

## Update the Ledger After the Walkthrough

After the pull and export attempt, update [`src/figma/sync-ledger.json`](./sync-ledger.json):

- Set `status.artifactGitSha` to the reviewed repo revision from `git rev-parse HEAD`.
- Keep `status.themeIds` as `["dark"]`.
- Keep `status.themeMapping` as `[{"themeId":"dark","figmaMode":"dark"}]` unless the observed export label in Figma differs, in which case record the observed value and add a matching drift note.
- Set `status.lastSuccessfulPullAt` to a UTC ISO-8601 timestamp only after the pull and export succeed.
- Add one `drift[]` entry for each unresolved issue, such as importer errors, blocked access, plugin UI mismatch, or materialization that does not match the seeded mapping.

## If the Proof Is Blocked

- Leave `status.lastSuccessfulPullAt` as `null`.
- Add an open `drift[]` entry describing exactly what blocked the proof.
- Do not invent a success timestamp or remove existing drift until the walkthrough is actually completed in Figma.
