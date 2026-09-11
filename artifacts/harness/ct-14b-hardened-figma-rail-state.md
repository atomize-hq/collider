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
schema_version: '2'
ledger_schema_ref: CT-7B
---

> Historical state/permission record, preserved as evidence of its original revision.
> It does not authorize the current branch or define current execution procedures.
> Use [current consumer policy](../../docs/stage1/sync-policy.md) and the installed
> product; old evaluator paths and claimed states below are historical observations.

# CT-14B — Deterministic Figma Rail State (Plugin)

## Purpose

Captures the operational status of Collider's deterministic **plugin-based** Figma rail, as recorded in `src/figma/sync-ledger.json`. This replaces the earlier assumption that the Variables REST API rail is generally available for write access (it is Enterprise/full-seat gated).

## Satisfaction Criteria

CT-14B is satisfied when **all five** conditions hold simultaneously:

1. `publish.mode` = `"plugin-import-manual"` in `src/figma/sync-ledger.json`
2. `publish.tokensStudioCarrier` = `false`
3. `verification.materializationStatus` = `"passed"`
4. `verification.lastVerifiedRevision` equals `artifact.revision` (verified-current)
5. CT-13B remains satisfied (proof state is still current)

## Consumer Verification Procedure

A downstream consumer (SEAM-13B) verifies CT-14B satisfaction by:

1. Read `src/figma/sync-ledger.json`
2. Assert `publish.mode === "plugin-import-manual"`
3. Assert `publish.tokensStudioCarrier === false`
4. Assert `verification.materializationStatus === "passed"`
5. Assert `verification.lastVerifiedRevision === artifact.revision`
6. Verify CT-13B satisfaction criteria still hold (see `artifacts/harness/ct-13b-figma-proof-state.md`)

If any assertion fails, CT-14B is not satisfied.

## Stale Triggers

- Artifact revision change in `design-tokens/dist/figma/tokens.json` (requires re-materialization and re-verification).
- Deterministic mapping changes in the repo-owned plugin (requires re-materialization and re-verification).

The consumer detects artifact staleness by comparing `artifact.revision` in the ledger against `git log -1 --format=%H -- design-tokens/dist/figma/tokens.json`.

## Owned Fields

CT-14B does not introduce new ledger fields. It constrains an allowed combination of existing `CT-8B` v2 fields to represent a verified-current plugin materialization attempt.

## Determinism Invariant

The determinism invariant is defined at the **variable-value level**: repeated plugin runs with the same input (`design-tokens/dist/figma/tokens.json` at the same revision) must produce identical variable names, values, and collection assignments in Figma.

## Canonical Example — Satisfied State

```json
{
  "ledgerVersion": "2",
  "artifact": {
    "path": "design-tokens/dist/figma/tokens.json",
    "revision": "2ee89e27306a1caa846d904ad6229370f371b1b3"
  },
  "publish": {
    "mode": "plugin-import-manual",
    "tokensStudioCarrier": false,
    "figmaFile": "figma://file/SVcsU6gVvpezsJYrvBsS3V"
  },
  "verification": {
    "materializationStatus": "passed",
    "lastVerifiedRevision": "2ee89e27306a1caa846d904ad6229370f371b1b3"
  },
  "promotion": {
    "parityMode": "deferred",
    "parityDeferredReason": "Parity remains deferred until a release-governed promotion gate and an explicit Enterprise-backed parity rail are adopted.",
    "highestEarnedLevel": "D-publish-valid"
  },
  "exceptions": []
}
```

## Relationship to CT-13B

CT-14B extends CT-13B by insisting the `plugin-import-manual` rail is deterministic and recorded as verified-current for the active artifact revision. CT-14B satisfaction requires CT-13B satisfaction.
