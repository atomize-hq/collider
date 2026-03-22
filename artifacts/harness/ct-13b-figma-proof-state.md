---
contract_id: CT-13B
type: state
owner_seam: SEAM-11B
pack: harness-completion
direct_consumers:
  - SEAM-12B
derived_consumers:
  - SEAM-13B
thread_ids:
  - THR-09
schema_version: '1'
ledger_schema_ref: CT-7B
---

# CT-13B — Figma Publish Proof State

## Purpose

Captures the verified status of the current artifact revision through the plugin-import-manual rail, as recorded in `src/figma/sync-ledger.json`. Enables SEAM-12B to confirm the existing rail works before building the hardened replacement.

## Satisfaction Criteria

CT-13B is satisfied when **all three** conditions hold simultaneously:

1. `verification.materializationStatus` = `"verified"` in `src/figma/sync-ledger.json`
2. `verification.lastVerifiedRevision` is non-null and matches `artifact.revision` in the same ledger
3. Proof evidence artifact exists at `artifacts/harness/figma-proof-evidence.json`

## Consumer Verification Procedure

A downstream consumer (SEAM-12B) verifies CT-13B satisfaction by:

1. Read `src/figma/sync-ledger.json`
2. Assert `verification.materializationStatus === "verified"`
3. Assert `verification.lastVerifiedRevision !== null`
4. Assert `verification.lastVerifiedRevision === artifact.revision` (revision consistency)
5. Assert file exists: `artifacts/harness/figma-proof-evidence.json`
6. Assert `promotion.highestEarnedLevel` is at least `"D-publish-valid"`
7. Assert `exceptions` array contains no entries with `"blocking": true`

If any assertion fails, CT-13B is not satisfied and the consuming seam must not proceed with work that assumes a working proof rail.

## Stale Trigger

Artifact revision change in `design-tokens/dist/figma/tokens.json`.

If the artifact revision changes after CT-13B is satisfied, THR-09 becomes stale and the proof must be re-executed before SEAM-12B can rely on CT-13B. The consumer detects staleness by comparing `artifact.revision` in the ledger against `git log -1 --format=%H -- design-tokens/dist/figma/tokens.json`.

## Owned Fields

CT-13B describes state in fields owned by the CT-7B/CT-8B ledger schema. CT-13B does not define or extend the schema — it observes these fields:

| Field                                | Expected Value (Satisfied)            | Schema Owner |
| ------------------------------------ | ------------------------------------- | ------------ |
| `verification.materializationStatus` | `"verified"`                          | CT-8B        |
| `verification.lastVerifiedRevision`  | Non-null, matches `artifact.revision` | CT-8B        |
| `promotion.highestEarnedLevel`       | `"D-publish-valid"`                   | CT-8B        |
| `exceptions`                         | `[]` (no blocking exceptions)         | CT-8B        |

Additionally, CT-13B requires the existence of:

| Artifact       | Path                                          |
| -------------- | --------------------------------------------- |
| Proof evidence | `artifacts/harness/figma-proof-evidence.json` |

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
    "figmaFile": "figma://file/23PLdynlRYoBYQx9teoC8A"
  },
  "verification": {
    "materializationStatus": "verified",
    "lastVerifiedRevision": "5a567cd7d07860135ab0bfb1d8f2873ef1eec836"
  },
  "promotion": {
    "parityMode": "deferred",
    "parityDeferredReason": "Parity remains deferred because the hardened Variables API rail and release-governed promotion gate are not yet in place for Collider.",
    "highestEarnedLevel": "D-publish-valid"
  },
  "exceptions": []
}
```

## Scope Boundary

CT-13B describes proof **state**, not proof **procedure**. How the proof is executed (plugin import steps, Figma file interactions, evidence capture) is owned by SEAM-11B S1. CT-13B only specifies what the landed result must look like for downstream consumption.
