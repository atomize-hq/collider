---
contract_id: CT-14B
type: state
owner_seam: SEAM-12B
pack: harness-completion
direct_consumers:
  - SEAM-13B
derived_consumers:
  - SEAM-14B
thread_ids:
  - THR-09
  - THR-10
schema_version: '1'
ledger_schema_ref: CT-7B
---

# CT-14B — Hardened Figma Rail State

## Purpose

Captures the operational status of the hardened OAuth/Variables API rail, as recorded in `src/figma/sync-ledger.json`. Enables SEAM-13B to confirm the hardened rail is working before ratcheting parity from deferred to required.

## Satisfaction Criteria

CT-14B is satisfied when **all six** conditions hold simultaneously:

1. `publish.mode` = `"oauth-variables-api"` in `src/figma/sync-ledger.json`
2. `publish.oauthCredentialModel` is non-null and equals `"oauth-app"` (not personal tokens)
3. `publish.lastHardenedRunStatus` = `"passed"`
4. `publish.lastHardenedRunTimestamp` is non-null (ISO 8601 timestamp of last successful execution)
5. `publish.successMarkers` is a non-empty object containing `variableCount` > 0, `collectionCount` > 0, and `determinismVerified` = `true`
6. CT-13B remains satisfied (proof state is still current — the hardened rail extends, not replaces, the proven baseline)

## Consumer Verification Procedure

A downstream consumer (SEAM-13B) verifies CT-14B satisfaction by:

1. Read `src/figma/sync-ledger.json`
2. Assert `publish.mode === "oauth-variables-api"`
3. Assert `publish.oauthCredentialModel === "oauth-app"`
4. Assert `publish.lastHardenedRunStatus === "passed"`
5. Assert `publish.lastHardenedRunTimestamp !== null`
6. Assert `publish.successMarkers.determinismVerified === true`
7. Assert `publish.successMarkers.variableCount > 0`
8. Assert `publish.successMarkers.collectionCount > 0`
9. Verify CT-13B satisfaction criteria still hold (see `artifacts/harness/ct-13b-figma-proof-state.md`)

If any assertion fails, CT-14B is not satisfied and the consuming seam must not proceed with work that assumes a working hardened rail.

## Stale Triggers

- Artifact revision change in `design-tokens/dist/figma/tokens.json` (same trigger as CT-13B — the hardened rail must be re-executed against the new artifact)
- Figma Variables API scope change (API surface the rail depends on has shifted)
- OAuth credential model change (credential assumptions no longer hold)

The consumer detects artifact staleness by comparing `artifact.revision` in the ledger against `git log -1 --format=%H -- design-tokens/dist/figma/tokens.json`.

## Owned Fields

CT-14B introduces new fields within the `publish` object of `src/figma/sync-ledger.json`. All new fields are additive extensions within the existing CT-7B v2 schema — no schema migration required.

| Field                              | Expected Value (Satisfied) | Schema Owner           |
| ---------------------------------- | -------------------------- | ---------------------- |
| `publish.mode`                     | `"oauth-variables-api"`    | CT-14B (extends CT-7B) |
| `publish.oauthCredentialModel`     | `"oauth-app"`              | CT-14B (new)           |
| `publish.lastHardenedRunStatus`    | `"passed"`                 | CT-14B (new)           |
| `publish.lastHardenedRunTimestamp` | ISO 8601 timestamp         | CT-14B (new)           |
| `publish.successMarkers`           | Object (see below)         | CT-14B (new)           |

### `publish.successMarkers` Shape

```json
{
  "variableCount": 42,
  "collectionCount": 3,
  "determinismVerified": true
}
```

- `variableCount` — number of Figma variables written by the rail (must be > 0)
- `collectionCount` — number of Figma variable collections written (must be > 0)
- `determinismVerified` — `true` when two consecutive runs with the same input token file produced identical variable values in Figma

### `publish.oauthCredentialModel` Enum

| Value         | Guarantees                                                                                                                         |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `"oauth-app"` | Repo-owned OAuth application; credentials are not tied to a personal user token; app can be rotated without individual user action |

Personal tokens (`"personal-token"`) are explicitly excluded from CT-14B satisfaction. The credential model must be org-owned and rotatable.

### Determinism Invariant

The determinism invariant is defined at the **variable-value level**: two consecutive runs of the hardened rail with the same input (`design-tokens/dist/figma/tokens.json` at the same revision) must produce identical variable names, values, and collection assignments in Figma.

Full API response-level determinism is NOT required — timestamps, request IDs, and other API metadata may differ between runs. Only the variable state that Figma persists is subject to the invariant.

## Canonical Example — Satisfied State

```json
{
  "ledgerVersion": "2",
  "artifact": {
    "path": "design-tokens/dist/figma/tokens.json",
    "revision": "2ee89e27306a1caa846d904ad6229370f371b1b3"
  },
  "publish": {
    "mode": "oauth-variables-api",
    "tokensStudioCarrier": false,
    "figmaFile": "figma://file/23PLdynlRYoBYQx9teoC8A",
    "oauthCredentialModel": "oauth-app",
    "lastHardenedRunStatus": "passed",
    "lastHardenedRunTimestamp": "2026-03-25T14:30:00Z",
    "successMarkers": {
      "variableCount": 42,
      "collectionCount": 3,
      "determinismVerified": true
    }
  },
  "verification": {
    "materializationStatus": "passed",
    "lastVerifiedRevision": "2ee89e27306a1caa846d904ad6229370f371b1b3"
  },
  "promotion": {
    "parityMode": "deferred",
    "parityDeferredReason": "Parity remains deferred because the hardened Variables API rail and release-governed promotion gate are not yet in place for Collider.",
    "highestEarnedLevel": "D-publish-valid"
  },
  "exceptions": []
}
```

Note: `parityMode` remains `"deferred"` when CT-14B is satisfied. Ratcheting to `"required"` is owned by SEAM-13B / CT-15B.

## Scope Boundary

CT-14B describes rail **state**, not rail **procedure**. How the OAuth flow works, how the command is invoked, how variables are mapped from tokens, and how determinism is tested are owned by SEAM-12B S2. CT-14B only specifies what the landed result must look like for downstream consumption.

## Relationship to CT-13B

CT-14B extends CT-13B. CT-13B proves the plugin-import-manual rail works at the current artifact revision. CT-14B proves the hardened OAuth/Variables API rail works at the same revision. Both can be satisfied simultaneously — CT-14B satisfaction requires CT-13B satisfaction (criterion 6).

CT-14B satisfaction implies the repo has a hardened, automatable publish path. It does NOT imply the plugin-import-manual path is removed — that path remains as fallback.
