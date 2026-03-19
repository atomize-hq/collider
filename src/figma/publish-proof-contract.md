# Publish Proof Contract

This document defines the seam-owned publish-proof facts for `SEAM-5B`. It is the handoff surface that downstream `SEAM-6B` work may consume when mapping publish semantics into `CT-8B`.

## Scope

- This contract covers publish semantics only.
- This contract does not define `CT-8B` root keys, ledger versioning, promotion fields, or verification policy.
- The contract exists so downstream ledger work does not invent new meaning for publish mode, artifact revision, or temporary-carrier state.

## Required Proof Fields

- `mode`: must be exactly one of `plugin-import-manual`, `rest-variables-oauth`, or `tokens-studio-carried`.
- `artifact.path`: must be exactly `design-tokens/dist/figma/tokens.json`.
- `artifact.revision`: records the repo revision of the artifact used for the publish attempt. This field is required for every successful proof.
- `destination.figmaFile`: records the destination Figma file reference for the attempt.
- `materializationOutcome`: must be exactly `passed` or `failed`.
- `tokensStudioCarrier`: must be a boolean. Set it to `true` only when Tokens Studio carried the approved artifact temporarily.

## Field Semantics

- `mode` records the active rail mode for the attempt. Do not translate it into alternate labels.
- `artifact.path` fixes the approved artifact boundary. No other path is allowed.
- `artifact.revision` binds the proof to the artifact revision that was actually exercised.
- `destination.figmaFile` identifies where the approved artifact was materialized.
- `materializationOutcome` records whether the publish attempt completed successfully.
- `tokensStudioCarrier` records temporary carrier usage separately from `mode` semantics so downstream consumers can distinguish temporary carriage from required rail policy.

## Minimal Example

```json
{
  "mode": "plugin-import-manual",
  "artifact": {
    "path": "design-tokens/dist/figma/tokens.json",
    "revision": "5a567cd7d07860135ab0bfb1d8f2873ef1eec836"
  },
  "destination": {
    "figmaFile": "figma://file/23PLdynlRYoBYQx9teoC8A"
  },
  "materializationOutcome": "passed",
  "tokensStudioCarrier": false
}
```

## Downstream Boundary

- `SEAM-6B` may embed these facts into `publish.*` and `verification.*` fields later.
- If downstream work needs ledger root keys, parity rules, or promotion-level semantics, that belongs to `CT-8B`, not to this document.
