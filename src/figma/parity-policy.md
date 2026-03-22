# Figma Parity Policy

This file is the canonical parity-policy surface for Collider's `CT-8B` ledger.

## Current Posture

- The current parity posture is `promotion.parityMode="deferred"`.
- Parity remains deferred in v1 because the publish rail is `plugin-import-manual` (repo-owned plugin/importer), not an API-backed Enterprise rail.

## Allowed States

- `deferred` and `required` are the only allowed parity states.
- `A-source-valid`, `B-projection-valid`, `C-consumption-valid`, `D-publish-valid`, and `E-promotion-complete` are the only allowed earned levels.
- `E-promotion-complete` is forbidden while parity remains deferred.
- Required parity consumes the shared ledger evaluator and therefore requires `state=verified-current`, not merely a structurally valid ledger.

## Promotion Trigger

Promotion from deferred to required is allowed only when all of the following are true:

- the active publish rail is `plugin-import-manual` (canonical v1 path per CT-15B provisional assumptions; `rest-variables-oauth` remains deferred until Enterprise API becomes available without seat restrictions)
- the current artifact revision is recorded in `artifact.revision`
- `verification.materializationStatus="passed"` for that same revision
- `verification.lastVerifiedRevision` matches `artifact.revision`
- no open blocking exceptions remain
- release or governance ownership is explicit for the enforcing gate

## Seam-Owned Inputs

- `src/figma/sync-ledger.json`
- `node scripts/validate-sync-ledger.mjs src/figma/sync-ledger.json`
- `node scripts/validate-figma-parity.mjs`

The ledger is the machine-readable truth for the current branch. This policy explains how to interpret `promotion.*` and `exceptions`; it does not replace the JSON contract.

## Non-Goals

- No Figma write-back or bidirectional sync is introduced here.
- No CI or package-script ownership moves into this policy document.
- No transport or credential work that belongs to `CT-7B` is redefined here.
