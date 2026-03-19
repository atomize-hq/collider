# Figma Parity Policy

This file records the current parity posture for the Figma rail. [`src/figma/README.md`](./README.md) owns the live `CT-7B` rail policy, while `SEAM-6B` will own the downstream `CT-8B` verification and promotion contract.

## Current Posture

- The current parity posture is `parityMode=deferred`.
- Parity remains deferred because enterprise Figma parity automation is not yet available, the pilot sync ledger is not yet stable enough for governance promotion, and `SEAM-6B` has not yet promoted a deterministic parity gate.

## Allowed States

- `deferred` and `required` are the only allowed parity states.
- `advisory` and any other intermediate branch are forbidden.

## Promotion Trigger

- Promotion to `required` is allowed only when all of the following are true:
  - A supported OAuth-app-backed Variables rail exists for parity automation.
  - The pilot sync ledger is stable enough to serve as governance input.
  - `SEAM-6B` owns a deterministic parity check in a merge gate.

## Governance Handoff To `SEAM-6B`

- `SEAM-6B` owns the machine-readable verification and promotion contract (`CT-8B`).
- Until that ledger contract lands, the historical branch-local surfaces remain evidence only:
  - `src/figma/sync-ledger.json`
  - `node scripts/validate-sync-ledger.mjs src/figma/sync-ledger.json`
- `src/figma/sync-ledger.json` is not the live `CT-7B` publish-proof contract and does not yet define the `CT-8B` root schema.
- `scripts/validate-sync-ledger.mjs` validates the legacy branch-local shape only.
- Rail mode policy, approved artifact boundaries, and downstream-only source-of-truth rules live in `src/figma/README.md`.
- Publish-proof facts for downstream adoption live in `src/figma/publish-proof-contract.md`.

## Non-Goals

- No Figma write-back or bidirectional sync is introduced here.
- No CI, `package.json`, or `justfile` ownership moves into this seam.
- No parity automation or REST integration is implemented here yet.
