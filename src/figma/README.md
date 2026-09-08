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
- The Enterprise-only rail (Figma Variables REST API) is **retired**. It was seat-gated and never ran to success; its publish mode, script and `just` recipe were removed. It is not a deferred option.
- `tokens-studio-carried` is optional temporary carriage only. It is never a permanent required rail.
- No Figma write-back or bidirectional sync is allowed by this policy.
- The plugin's read-only `Check Drift` action is the sanctioned way to observe Figma-side change. It
  compares the file against the artifact and reports differences; it never writes token sources.
  A change made in Figma is re-made in `design-tokens/src/tokens/` and published forward.

## Verification Ledger (`CT-8B`)

- `src/figma/sync-ledger.json` is the machine-readable v2 ledger for the current branch.
- `pnpm validate:sync-ledger` validates the ledger contract, checks its `publication` binding against the publish proof, and prints the evaluated state for the current artifact revision.
- `pnpm validate:figma-parity` reads the same ledger for required-parity checks.
- `pnpm validate:publish-proof` validates the proof on its own.

All three run the pinned `ds-skills` release; Collider owns the invocation and none of the policy.

- This README is operator guidance only. The JSON ledger and validator define the contract.
- Evaluated states are `declared`, `verified-current`, `verified-stale`, `blocked-exception`, and `incomplete`.
- Only `verified-current` is publish-valid for the active revision. Carrier-only Tokens Studio usage may still be `verified-current`, but it never becomes the permanent required rail.
- `verification.materializationStatus` is an operator claim. `artifacts/figma/drift-report.json` is
  the measurement that backs it: the plugin's `Check Drift` action posts its result to the local
  token server, which stamps the artifact SHA-256 and repo revision it was measured against. Treat a
  report whose `repoRevision` or `artifactSha256` no longer matches the current build as expired.

## Current Posture

- The live ledger is `promotion.parityMode="required"` at `highestEarnedLevel="E-promotion-complete"`,
  with `verification.materializationStatus="passed"` for artifact revision `dc97a26`.
- Deferred parity may still earn `D-publish-valid` when the current artifact revision is materialized successfully.
- Parity is enforced against the ledger's own consistency, not against a live read of Figma. Run
  `Check Drift` to measure the file itself and record `artifacts/figma/drift-report.json`.

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
4. In the pilot file, run the plugin and load the artifact from:
   `http://localhost:4173/design-tokens/dist/figma/tokens.json`
5. **Check Drift** first — read-only, and it tells you whether a sync is even needed or whether
   someone changed something in Figma that has to be reconciled into the canonical source first.
6. **Sync Variables** to write the artifact into the file. The sync verifies itself by re-reading the
   file and running the same comparison, so a partial write cannot report success.

Both actions run against the artifact loaded in step 4, so a stale fetch produces a stale verdict.
Re-fetch after every `pnpm build:tokens`.
