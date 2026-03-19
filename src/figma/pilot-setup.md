# Pilot Pull Setup

This runbook proves the `CT-7` pilot pull path for the existing team-owned Figma file. [`src/figma/README.md`](./README.md) remains the normative policy source; this file is only the step-by-step operator path for the pilot proof.

## Pilot Inputs

- Pilot file: `Collider Copy pilot` (`figma://file/23PLdynlRYoBYQx9teoC8A`)
- Canonical artifact path: `design-tokens/dist/figma/tokens.json`
- Published artifact URL: `https://raw.githubusercontent.com/atomize-hq/collider/main/design-tokens/dist/figma/tokens.json`
- Local proof URL: `http://127.0.0.1:4173/design-tokens/dist/figma/tokens.json`
- Required theme baseline from `CT-2`: `dark`

## Preconditions

- Use the existing pilot Figma file instead of creating a new proof file.
- Open a clean or reset version of the pilot file before starting the walkthrough.
- Keep the repo as the only source of truth. Do not edit token values in Figma or push token changes from the plugin.
- If you need to refresh the committed artifact before the walkthrough, run the normal repo token build flow first and review the resulting diff before continuing.
- If the published artifact URL returns `404` because `main` is behind the reviewed revision or the repo artifact is not publicly reachable from the current environment, use the local proof URL instead of inventing a second sync mode.

## Optional Local URL Fallback

Use this fallback when the published raw GitHub URL is not reachable from the current repo state but you still need to complete the pilot proof on the same machine as Figma.

1. From the repo root, serve the generated artifact over localhost:
   `python3 -m http.server 4173 --bind 127.0.0.1`
2. Confirm the artifact is reachable before opening Figma:
   `curl http://127.0.0.1:4173/design-tokens/dist/figma/tokens.json`
3. Keep this server running while Tokens Studio performs the pull.

## Configure URL Sync

1. Open the pilot Figma file and launch the Tokens Studio plugin.
2. In the plugin, open `Settings`.
3. Under the sync provider section, choose `Add new`.
4. Select the `URL` sync provider.
5. Enter these values:
   - `Name`: `collider-figma-tokens`
   - `URL`: use the published artifact URL when it is reachable; otherwise use the local proof URL
   - `Headers`: leave empty for both the raw GitHub URL flow and the localhost proof flow
6. Save the provider configuration.
7. If the plugin prompts you to sync provider data into the file, choose `Pull`. Do not choose `Push`.

## Pull and Materialize the Artifact

1. Return to the Tokens page in the plugin and confirm the remote artifact loaded successfully.
2. Do not create, rename, or edit token sets locally in the pilot file.
3. Open `Styles & Variables`.
4. Choose `Export Styles & Variables`.
5. Enable `Variables` for the pilot proof. Leave `Styles` off unless you are explicitly checking style mirrors as a secondary verification.
6. Continue with the default export path for the synced artifact.
7. Finish the export and inspect the created or updated variables in the pilot file.

## Current Proof Boundary

- The repo currently publishes one Figma-facing artifact as a single `tokens.json` file and one required theme baseline, `dark`.
- Tokens Studio documents URL sync as read-only and documents Token Set export as a collection-based export path rather than a multi-mode Themes export.
- For this pilot, the required proof is narrower: confirm that the canonical artifact can be pulled and materialized for the `dark` baseline without manual token entry.
- Keep the ledger mapping at `{"themeId":"dark","figmaMode":"dark"}` as the approved baseline until a maintainer completes the live Figma walkthrough and observes a different visible label that must be recorded explicitly.

## Update the Ledger After the Walkthrough

After the pull and export attempt, update [`src/figma/sync-ledger.json`](./sync-ledger.json):

- Set `status.artifactGitSha` to the reviewed repo revision from `git rev-parse HEAD`.
- Keep `status.themeIds` as `["dark"]`.
- Keep `status.themeMapping` as `[{"themeId":"dark","figmaMode":"dark"}]` unless the observed export label in Figma differs, in which case record the observed value and add a matching drift note.
- Set `status.lastSuccessfulPullAt` to a UTC ISO-8601 timestamp only after the pull and export succeed.
- Add one `drift[]` entry for each unresolved issue, such as provider errors, blocked access, a published URL that still returns `404`, plugin UI mismatch, or materialization that does not match the seeded mapping.

## If the Proof Is Blocked

- Leave `status.lastSuccessfulPullAt` as `null`.
- Add an open `drift[]` entry describing exactly what blocked the proof.
- Do not invent a success timestamp or remove existing drift until the walkthrough is actually completed in Figma.

## References

- [Tokens Studio: URL - Server Sync Provider](https://docs.tokens.studio/token-storage/remote/sync-server-url)
- [Tokens Studio: Export Using Token Sets](https://docs.tokens.studio/figma/export/token-sets)
