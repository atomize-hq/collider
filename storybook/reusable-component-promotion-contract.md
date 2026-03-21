# Reusable Component Promotion Contract

`storybook/reusable-component-promotion-contract.md` is the repo-owned `CT-12B` contract for `artifacts/harness/reusable-component-status.json`.

## Scope

- This document freezes the contract-first baseline for reusable-component promotion status.
- This document defines the exact `CT-12B` root shape, claim-profile matrix, and upstream field-consumption boundary.
- This document does not define evaluator execution, validator CLI wiring, or consumer blocking behavior. Those remain in later `SEAM-10B` slices.
- Downstream consumers must read this repo-owned contract instead of reconstructing promotion posture from prose, vendor UIs, or raw upstream payloads.

## Root Shape

`artifacts/harness/reusable-component-status.json` must be a JSON object with exactly these top-level keys and no extras:

1. `statusVersion`
2. `generatedAt`
3. `changeClass`
4. `railSummaries`
5. `claimProfiles`
6. `highestEarnedClaim`
7. `reasonCodes`
8. `enforcementMode`

The initial `statusVersion` is the literal string `"1"`.

## Field Definitions

| Field                | Type / literal                                                                                       | Notes                                                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `statusVersion`      | `"1"`                                                                                                | Explicit contract version for `CT-12B`.                                                                             |
| `generatedAt`        | `string`                                                                                             | ISO-8601 UTC timestamp for the current repo-owned status payload.                                                   |
| `changeClass`        | `"reusable-component-advancement"` or `"token-only"` or `"docs-only"` or `"proof-only"` or `"other"` | Closed set for claim-profile selection.                                                                             |
| `railSummaries`      | `object`                                                                                             | Exact four-entry summary map keyed by `ct8b`, `ct9b`, `ct10b`, and `ct11b`.                                         |
| `claimProfiles`      | `object`                                                                                             | Repo-owned change-class claim matrix keyed by the same closed `changeClass` values.                                 |
| `highestEarnedClaim` | `object`                                                                                             | Placeholder claim output with exactly `profileId` and `claimId`. Final evaluator semantics are owned by `S2`.       |
| `reasonCodes`        | `string[]`                                                                                           | Placeholder refusal/deferral codes. Final taxonomy is owned by `S2`.                                                |
| `enforcementMode`    | `"informational"` or `"blocking"`                                                                    | Contract-level enforcement surface. `S1` remains informational-only for all committed fixtures and policy defaults. |

## `railSummaries` Shape

`railSummaries` must be a JSON object with exactly these keys and no extras:

1. `ct8b`
2. `ct9b`
3. `ct10b`
4. `ct11b`

Each rail summary must be a JSON object with exactly these keys and no extras:

1. `contractId`
2. `threadId`
3. `sourcePath`
4. `sourceVersionOrRevision`
5. `freshness`
6. `outcome`
7. `claimRelevant`

### Rail Summary Field Definitions

| Field                     | Type / literal                                                         | Notes                                                                                  |
| ------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `contractId`              | `string`                                                               | Must be the upstream repo-owned contract ID (`CT-8B`, `CT-9B`, `CT-10B`, `CT-11B`).    |
| `threadId`                | `string`                                                               | Must be the upstream thread ID (`THR-05`, `THR-06`, `THR-07`, `THR-08`).               |
| `sourcePath`              | `string`                                                               | Repo-relative path for the summarized upstream artifact or contract surface.           |
| `sourceVersionOrRevision` | `string`                                                               | Repo-owned provenance marker derived from the allowed upstream fields named below.     |
| `freshness`               | `"current"` or `"stale"` or `"missing"`                                | Freshness posture of the summarized upstream rail.                                     |
| `outcome`                 | `"satisfied"` or `"unsatisfied"` or `"deferred"` or `"not-applicable"` | Repo-owned normalized rail outcome.                                                    |
| `claimRelevant`           | `boolean`                                                              | Whether the summarized upstream rail is claim-relevant for the current status payload. |

## `claimProfiles` Shape

`claimProfiles` must be a JSON object with exactly these keys and no extras:

1. `reusable-component-advancement`
2. `token-only`
3. `docs-only`
4. `proof-only`
5. `other`

Each claim profile must be a JSON object with exactly these keys and no extras:

1. `changeClasses`
2. `readsRails`
3. `enforcementMode`
4. `informationalOnly`
5. `mayPromoteToBlockingInS3`

### Claim Profile Baseline

| Profile key                      | `changeClasses`                      | `readsRails`                         | `enforcementMode` in `S1` | Notes                                                                                                                                       |
| -------------------------------- | ------------------------------------ | ------------------------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `reusable-component-advancement` | `["reusable-component-advancement"]` | `["ct8b", "ct9b", "ct10b", "ct11b"]` | `informational`           | The only profile that reads all four future rails. Blocking adoption remains out of scope until `S3`.                                       |
| `token-only`                     | `["token-only"]`                     | `["ct8b"]`                           | `informational`           | Narrower informational profile; it may not inherit reusable-component review, proof, or mapping requirements.                               |
| `docs-only`                      | `["docs-only"]`                      | `["ct9b"]`                           | `informational`           | Narrower informational profile; it may not inherit parity, review, or mapping requirements by default.                                      |
| `proof-only`                     | `["proof-only"]`                     | `["ct9b", "ct10b"]`                  | `informational`           | Narrower informational profile; it may inspect proof and review without inheriting full reusable-component parity and mapping requirements. |
| `other`                          | `["other"]`                          | `[]`                                 | `informational`           | Explicit catch-all profile that stays outside reusable-component ratchets in this slice.                                                    |

No non-reusable profile may read all four future rails in `S1`.

## Upstream Field Origins And Allowed Inputs

`CT-12B` summarizes upstream repo-owned contracts. It must not duplicate or embed upstream payloads wholesale.

### `CT-8B` Consumption Boundary

`CT-12B` may consume only these repo-owned `CT-8B` fields:

- `ledgerVersion`
- `artifact.revision`
- `promotion.parityMode`
- `promotion.highestEarnedLevel`
- `exceptions`

`ct8b.sourceVersionOrRevision` must be derived from `ledgerVersion` and `artifact.revision`.

### `CT-9B` Consumption Boundary

`CT-12B` may consume only these repo-owned `CT-9B` surfaces:

- `storybook/story-inventory.json` `inventoryVersion`
- `storybook/story-inventory.json` component identity and implemented story refs
- `storybook/component-specs/<component-id>.json` `componentId`, `tier`, `requiredStoryKinds`, and `downstreamHooks`
- `artifacts/storybook/proof-coverage.json` `proofCoverageVersion`, per-component proof status, required kinds, implemented kinds, and missing kinds

`CT-12B` may not treat story existence alone as proof readiness.

`ct9b.sourceVersionOrRevision` must be derived from repo-owned proof metadata, including `inventoryVersion` and `proofCoverageVersion`.

### `CT-10B` Consumption Boundary

`CT-12B` may consume only these repo-owned `CT-10B` fields:

- `review.mode`
- `review.requiredForClaim`
- `review.scope`
- `review.diffOutcome`
- `revision.gitSha`
- `generatedAt`
- `statusVersion`

`CT-12B` may not consume `check.name` or `check.conclusion` as claim authority, and it may not read vendor UI summaries or raw provider payloads.

`ct10b.sourceVersionOrRevision` must be derived from `statusVersion` and `revision.gitSha`.

### `CT-11B` Consumption Boundary

`CT-12B` may consume only these repo-owned `CT-11B` surfaces:

- `artifacts/harness/reusable-component-mapping-status.json` `mappingStatusVersion`, `summary`, and per-component `state`, `linkState`, `issues`, `drift`, `sourcePaths`, `outputPaths`
- the published shared-field boundary in `storybook/reusable-component-mapping-contract.md`

`CT-12B` may not scrape `storybook/connect/**` or `figma/code-connect/**` for new truth beyond the published repo-owned `CT-11B` contract boundary.

`ct11b.sourceVersionOrRevision` must be derived from `mappingStatusVersion`.

## Placeholder Output Ownership

- `highestEarnedClaim` stays contract-only in `S1`. The field must be present, but final evaluator semantics are owned by `S2`.
- `reasonCodes` stays contract-only in `S1`. The field must be present, but the refusal taxonomy is owned by `S2`.
- `enforcementMode` is frozen now so later slices can reuse one repo-owned field instead of inventing a second consumer-specific flag.

## Invalid Inputs And Forbidden Truth Sources

- `CT-12B` may not copy raw upstream payloads into `railSummaries`.
- `CT-12B` may not introduce vendor-native IDs, vendor UI URLs, vendor-only status fields, or prose-only interpretations as independent truth.
- `CT-12B` may not infer proof readiness from story existence alone.
- `CT-12B` may not infer mapping completeness from vendor projections outside the published `CT-11B` repo-owned boundary.
- `CT-12B` may not re-decide `review.requiredForClaim`; it must consume that field from published `CT-10B`.
- Extra root keys, extra rail summary keys, and extra claim-profile keys are invalid until a future contract version publishes them explicitly.

## Compatibility Rule

Future evaluator and consumer work may add semantics, but the root keys, closed `changeClass` set, four `railSummaries` keys, and upstream field-consumption boundaries above must remain stable until `statusVersion` is bumped explicitly.

Any `CT-12B` root-field, claim-profile, or upstream-boundary change must be implemented atomically across this contract, `storybook/reusable-component-promotion-policy.md`, `scripts/lib/reusable-component-status-contract.mjs`, `storybook/reusable-component-promotion-contract.test.ts`, and the reusable-component-status fixtures.
