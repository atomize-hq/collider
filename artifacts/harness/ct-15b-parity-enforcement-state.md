---
contract_id: CT-15B
type: permission
owner_seam: SEAM-13B
pack: harness-completion
direct_consumers:
  - SEAM-14B
derived_consumers:
  - downstream release process
thread_ids:
  - THR-10
  - THR-11
schema_version: '2'
ledger_schema_ref: CT-7B
---

# CT-15B — Parity Enforcement State

## Purpose

Captures the **parity enforcement state** for Collider's Figma sync system: the machine-readable condition that must be met before SEAM-14B can attest that the harness is fully promoted to Level E. This is the gate that transitions parity from deferred mode to required mode, eliminating ambiguity about whether promotion may proceed.

## Satisfaction Criteria

CT-15B is satisfied when **all five** conditions hold simultaneously:

1. `promotion.parityMode` = `"required"` in `src/figma/sync-ledger.json`
2. `promotion.parityDeferredReason` is absent or `null`
3. `promotion.highestEarnedLevel` = `"E-promotion-complete"`
4. `exceptions` array contains no blocking items (all have `"blocking": false`)
5. `artifacts/harness/reusable-component-status.json` reflects full completion for the **release-grade** reusable-component claim surface:
   - `changeClass` = `"reusable-component-advancement"`
   - `railSummaries.ct8b.freshness` = `"current"` and `railSummaries.ct8b.outcome` = `"satisfied"`
   - `railSummaries.ct9b.freshness` = `"current"` and `railSummaries.ct9b.outcome` = `"satisfied"`
   - `railSummaries.ct10b.freshness` = `"current"` and `railSummaries.ct10b.outcome` = `"satisfied"`
   - `railSummaries.ct11b.freshness` = `"current"` and `railSummaries.ct11b.outcome` = `"satisfied"`
   - `highestEarnedClaim.profileId` = `"reusable-component-advancement"` and `highestEarnedClaim.claimId` = `"reusable-component-parity-current"`

   Note: these checks are intentionally aligned to the repo-owned `CT-12B` contract and evaluator semantics (see `storybook/reusable-component-promotion-contract.md` and `scripts/lib/reusable-component-status.mjs`).

## Consumer Verification Procedure

A downstream consumer (SEAM-14B) verifies CT-15B satisfaction by:

1. Read `src/figma/sync-ledger.json`
2. Assert `promotion.parityMode === "required"`
3. Verify `promotion.parityDeferredReason` is absent or `null`
4. Assert `promotion.highestEarnedLevel === "E-promotion-complete"`
5. Check `exceptions` array for any items with `"blocking": true` — fail if any found
6. Read `artifacts/harness/reusable-component-status.json`, confirm full completion under `reusable-component-advancement` claim profile

If any assertion fails, CT-15B is not satisfied and SEAM-14B must not proceed with attestation that the harness is fully promoted.

## Stale Triggers

- **Parity enforcement rule change**: Policy update modifies when parity transitions from deferred to required mode
- **CT-12B status change**: `reusable-component-status.json` changes (e.g., new claim profile applied, completion level shifts)

The consumer detects stale state by:

- For policy changes: re-check CT-15B against the current `src/figma/parity-policy.md` and `storybook/reusable-component-promotion-policy.md` surfaces for the commit being attested (treat any policy delta as “re-run verification required”).
- For CT-12B changes: re-check the `CT-12B` artifact fields directly (at minimum: `generatedAt`, `railSummaries.ct8b.sourceVersionOrRevision`, and `highestEarnedClaim`) for the commit being attested.

## Owned Fields Table

| Field                            | Expected Value (Satisfied) | Schema Owner             |
| -------------------------------- | -------------------------- | ------------------------ |
| `promotion.parityMode`           | `"required"`               | CT-8B (via CT-7B schema) |
| `promotion.parityDeferredReason` | absent or `null`           | CT-8B                    |
| `promotion.highestEarnedLevel`   | `"E-promotion-complete"`   | CT-8B                    |
| `exceptions`                     | `[]` (no blocking items)   | CT-8B                    |
| `reusable-component-status.json` | full completion            | CT-12B                   |

## Canonical Example — Satisfied State

```json
{
  "ledgerVersion": "2",
  "artifact": {
    "path": "design-tokens/dist/figma/tokens.json",
    "revision": "5a567cd7d07860135ab0bfb1d8f2873ef1eec836"
  },
  "publish": {
    "mode": "plugin-import-manual",
    "tokensStudioCarrier": false,
    "figmaFile": "figma://file/SVcsU6gVvpezsJYrvBsS3V"
  },
  "verification": {
    "materializationStatus": "passed",
    "lastVerifiedRevision": "5a567cd7d07860135ab0bfb1d8f2873ef1eec836"
  },
  "promotion": {
    "parityMode": "required",
    "highestEarnedLevel": "E-promotion-complete"
  },
  "exceptions": []
}
```

And `artifacts/harness/reusable-component-status.json`:

```json
{
  "statusVersion": "1",
  "generatedAt": "2026-03-22T00:00:00.000Z",
  "changeClass": "reusable-component-advancement",
  "railSummaries": {
    "ct8b": { "outcome": "satisfied" },
    "ct9b": { "outcome": "satisfied" },
    "ct10b": { "outcome": "satisfied" },
    "ct11b": { "outcome": "satisfied" }
  },
  "highestEarnedClaim": {
    "profileId": "reusable-component-advancement",
    "claimId": "reusable-component-parity-current"
  },
  "reasonCodes": [],
  "enforcementMode": "informational"
}
```

This excerpt is illustrative and intentionally omits the frozen `claimProfiles` matrix and the full rail-summary shape; consumers must validate the full artifact against the repo-owned `CT-12B` contract.

## Relationship to Consumed Contracts

- **CT-14B**: CT-15B assumes hardened rail (`plugin-import-manual`) is operational and verified-current. CT-14B satisfaction is a prerequisite for CT-15B because parity enforcement cannot be enabled on an unverified rail.
- **CT-12B**: CT-15B depends on `artifacts/harness/reusable-component-status.json` reflecting full completion for the `reusable-component-advancement` claim profile. Without CT-12B-level completion, Level E promotion cannot be claimed.

## Provisional Assumptions

> **Parity enforcement assumes SEAM-12B hardened rail (`plugin-import-manual`) remains the canonical v1 path. Enterprise Variables REST API rail remains deferred until explicitly reclassified in policy.**

This assumption may be revised if:

- Enterprise Variables REST API becomes generally available without seat restrictions
- Policy decision elevates REST API to primary rail while deprecating plugin

When such a change occurs, CT-15B satisfaction criteria must be updated to reference the new canonical rail and its verification conditions.
