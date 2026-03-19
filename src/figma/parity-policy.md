# Figma Parity Policy

This file is the canonical parity-policy surface for `CT-7`.

## Current Posture

- The current parity posture is `parityMode=deferred`.
- Parity remains deferred because enterprise Figma parity automation is not yet available, the pilot sync ledger is not yet stable enough for governance promotion, and `SEAM-6` has not yet promoted a deterministic parity gate.

## Allowed States

- `deferred` and `required` are the only allowed parity states.
- `advisory` and any other intermediate branch are forbidden.

## Promotion Trigger

- Promotion to `required` is allowed only when all of the following are true:
  - Enterprise Figma API access exists for parity automation.
  - The pilot sync ledger is stable enough to serve as governance input.
  - `SEAM-6` owns a deterministic parity check in a merge gate.

## Governance Handoff To `SEAM-6`

- `SEAM-6` should consume only these seam-owned inputs:
  - `src/figma/sync-ledger.json`
  - `node scripts/validate-sync-ledger.mjs src/figma/sync-ledger.json`
- `src/figma/sync-ledger.json` is the machine-readable status for the current branch.
- `scripts/validate-sync-ledger.mjs` is the seam-owned contract check for that status.
- `src/figma/README.md` is operator guidance only and must not become a second policy source.

## Non-Goals

- No Figma write-back or bidirectional sync is introduced here.
- No CI, `package.json`, or `justfile` ownership moves into this seam.
- No enterprise parity automation or REST integration is implemented here.
