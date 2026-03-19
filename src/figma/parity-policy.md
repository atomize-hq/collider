# Figma Parity Policy

This file is the boundary document between the live `CT-7B` rail contract and downstream `SEAM-6B` governance. [`src/figma/README.md`](./README.md) owns the publish-rail policy, while `SEAM-6B` owns the later `CT-8B` verification, promotion, and merge-gate contract.

## Current Posture

- The current parity posture is `parityMode=deferred`.
- Deferred remains the default until the hardened rail prerequisites are satisfied and `SEAM-6B` adopts them into downstream verification and promotion logic.

## Proof-Only Publish Validity

- Proof-only publish validity may come from a verified `plugin-import-manual` attempt for the current artifact revision.
- A `tokens-studio-carried` attempt may support proof-only work only when it is explicitly recorded as a temporary carrier exception.
- Proof-only publish validity does not, by itself, authorize required parity or promotion-complete claims.

## Required-Parity Prerequisites

- `rest-variables-oauth` is the only approved hardening target before required parity may be considered.
- The hardening path must satisfy the ownership, tenancy, scope, and success-marker requirements in [`src/figma/rest-variables-oauth.md`](./rest-variables-oauth.md).
- Any Tokens Studio usage must follow [`src/figma/tokens-studio-carrier-policy.md`](./tokens-studio-carrier-policy.md) and must not remain as a permanent dependency.
- `SEAM-6B` decides when those upstream facts are sufficient for required parity. This file does not define that downstream threshold.

## Handoff To `SEAM-6B`

- `SEAM-6B` owns the machine-readable verification and promotion contract (`CT-8B`).
- `src/figma/publish-proof-contract.md` owns the seam-local publish-proof facts that `SEAM-6B` may later embed into `CT-8B`.
- `src/figma/sync-ledger.json` and `node scripts/validate-sync-ledger.mjs src/figma/sync-ledger.json` remain legacy branch-local evidence only.
- This file does not define `CT-8B` root keys, earned promotion levels, or merge-gate behavior.

## Non-Goals

- No Figma write-back or bidirectional sync is introduced here.
- No OAuth app implementation, destination provisioning, or merge-gate automation is implemented here.
- No CI, `package.json`, or `justfile` ownership moves into this slice.
