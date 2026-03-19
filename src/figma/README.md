# Figma Sync Policy

This directory documents Collider's live Figma convergence posture under `CT-7B` and `CT-8B`.

## Canonical Source

- The repo remains the only canonical source of token values.
- `design-tokens/src/**` is the editable source tree.
- `design-tokens/dist/figma/tokens.json` is the only approved Figma-facing artifact.
- Figma consumes repo-approved values. It does not author canonical values.

## Publish Rail (`CT-7B`)

- `plugin-import-manual` is the default proof rail for current convergence work.
- `rest-variables-oauth` is the only approved hardening target before parity can become required.
- `tokens-studio-carried` is optional temporary carriage only. It is never a permanent required rail.
- No Figma write-back or bidirectional sync is allowed by this policy.

## Verification Ledger (`CT-8B`)

- `src/figma/sync-ledger.json` is the machine-readable v2 ledger for the current branch.
- `node scripts/validate-sync-ledger.mjs src/figma/sync-ledger.json` validates the ledger contract.
- `node scripts/validate-figma-parity.mjs` reads the same ledger for required-parity checks.
- This README is operator guidance only. The JSON ledger and validator define the contract.

## Current Posture

- The live ledger is currently `promotion.parityMode="deferred"`.
- Deferred parity may still earn `D-publish-valid` when the current artifact revision is materialized successfully.
- `E-promotion-complete` requires `promotion.parityMode="required"`, the hardened rail, current verification, and no open blocking exceptions.

## Operational Rules

- Treat plugin settings as a transport detail, not a source-of-truth switch.
- Canonical token changes still go through repo PRs.
- Record any unresolved parity blockers in `exceptions`.
- Keep parity-policy decisions centralized in `src/figma/parity-policy.md` instead of duplicating them across runbooks.
