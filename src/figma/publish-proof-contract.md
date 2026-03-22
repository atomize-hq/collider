# Publish Proof Contract

This document defines the seam-owned publish-proof facts for `SEAM-5B`. It is the handoff surface that downstream `SEAM-6B` work may consume when mapping publish semantics into `CT-8B`.

## Scope

- This contract covers publish semantics only.
- This contract does not define `CT-8B` root keys, ledger versioning, promotion fields, or verification policy.
- The contract exists so downstream ledger work does not invent new meaning for publish mode, artifact revision, or temporary-carrier state.

## Required Proof Fields

- `proofVersion`: must be exactly `"1"`.
- `mode`: must be exactly one of `plugin-import-manual`, `oauth-variables-api`, or `tokens-studio-carried`.
- `artifact.path`: must be exactly `design-tokens/dist/figma/tokens.json`.
- `artifact.gitSha`: records the repo revision of the artifact used for the publish attempt. Use a 40-character lowercase git SHA.
- `destination.name`: must be exactly `Collider Copy pilot`.
- `destination.figmaFile`: must be exactly `figma://file/23PLdynlRYoBYQx9teoC8A`.
- `materialization.status`: must be exactly `passed` or `failed`.
- `materialization.attemptedAt`: records when the publish attempt was executed. Use a UTC ISO-8601 timestamp.
- `materialization.notes`: required for failed attempts and optional for passed attempts.
- `carrier.used`: must be a boolean. Set it to `true` only when Tokens Studio carried the approved artifact temporarily.
- `carrier.reason`: required when `carrier.used=true`; otherwise it must be `null`.
- `carrier.exitExpectation`: required when `carrier.used=true`; otherwise it must be `null`.

## Field Semantics

- `proofVersion` makes the publish-proof payload itself versioned without taking ownership of the downstream ledger version.
- `mode` records the active rail mode for the attempt. Do not translate it into alternate labels.
- `artifact.path` fixes the approved artifact boundary. No other path is allowed.
- `artifact.gitSha` binds the proof to the artifact revision that was actually exercised.
- `destination` identifies the fixed pilot target for this slice.
- `materialization.status` records whether the publish attempt completed successfully.
- `materialization.attemptedAt` makes the recorded attempt reviewable even when the proof is blocked.
- `materialization.notes` carries explicit blocker details when the attempt fails.
- `carrier` records temporary carrier usage separately from `mode` semantics so downstream consumers can distinguish temporary carriage from required rail policy.

## Minimal Example

```json
{
  "proofVersion": "1",
  "mode": "oauth-variables-api",
  "artifact": {
    "path": "design-tokens/dist/figma/tokens.json",
    "gitSha": "5a567cd7d07860135ab0bfb1d8f2873ef1eec836"
  },
  "destination": {
    "name": "Collider Copy pilot",
    "figmaFile": "figma://file/23PLdynlRYoBYQx9teoC8A"
  },
  "materialization": {
    "status": "passed",
    "attemptedAt": "2026-03-19T20:46:09Z"
  },
  "carrier": {
    "used": false,
    "reason": null,
    "exitExpectation": null
  }
}
```

## Downstream Boundary

- `SEAM-6B` may embed these facts into `publish.*` and `verification.*` fields later.
- If downstream work needs ledger root keys, parity rules, or promotion-level semantics, that belongs to `CT-8B`, not to this document.
