# Reusable Component Promotion Contract

`storybook/reusable-component-promotion-contract.md` is the repo-owned `CT-12B` contract for `artifacts/harness/reusable-component-status.json`.

## Scope

- This document defines the current reusable-component promotion status contract.
- This document defines the exact `CT-12B` root shape, claim-profile matrix, and upstream field-consumption boundary.
- Status is generated and validated by the reusable-component status commands; consumer blocking behavior is defined in the companion promotion policy.
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

The current `statusVersion` is the literal string `"2"`. Earlier report shapes are rejected; regenerate from current inputs.

## Field Definitions

| Field                | Type / literal                                                                                       | Notes                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `statusVersion`      | `"2"`                                                                                                | Explicit contract version for `CT-12B`.                                                  |
| `generatedAt`        | `string`                                                                                             | ISO-8601 UTC timestamp for the current repo-owned status payload.                        |
| `changeClass`        | `"reusable-component-advancement"` or `"token-only"` or `"docs-only"` or `"proof-only"` or `"other"` | Closed set for claim-profile selection.                                                  |
| `railSummaries`      | `object`                                                                                             | Exact three-entry summary map keyed by `ct8b`, `ct9b`, and `ct10b`.                      |
| `claimProfiles`      | `object`                                                                                             | Repo-owned change-class claim matrix keyed by the same closed `changeClass` values.      |
| `highestEarnedClaim` | `object`                                                                                             | Derived claim with exactly `profileId` and `claimId`; see Claim Derivation below.        |
| `reasonCodes`        | `string[]`                                                                                           | Deduplicated reason codes from relevant inputs and profile policy.                       |
| `enforcementMode`    | `"informational"` or `"blocking"`                                                                    | Status generation is informational; consumer policy separately decides whether to block. |

## `railSummaries` Shape

`railSummaries` must be a JSON object with exactly these keys and no extras:

1. `ct8b`
2. `ct9b`
3. `ct10b`

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
| `contractId`              | `string`                                                               | Must be the upstream repo-owned contract ID (`CT-8B`, `CT-9B`, `CT-10B`).              |
| `threadId`                | `string`                                                               | Must be the upstream thread ID (`THR-05`, `THR-06`, `THR-08`).                         |
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

| Profile key                      | `changeClasses`                      | `readsRails`                | Report `enforcementMode` | Notes                                                                                                                                 |
| -------------------------------- | ------------------------------------ | --------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `reusable-component-advancement` | `["reusable-component-advancement"]` | `["ct8b", "ct9b", "ct10b"]` | `informational`          | The only profile that reads all three current rails. Consumer policy permits blocking in explicitly selected CI and release contexts. |
| `token-only`                     | `["token-only"]`                     | `["ct8b"]`                  | `informational`          | Narrower informational profile; it may not inherit reusable-component review or proof requirements.                                   |
| `docs-only`                      | `["docs-only"]`                      | `["ct9b"]`                  | `informational`          | Narrower informational profile; it may not inherit parity or review requirements by default.                                          |
| `proof-only`                     | `["proof-only"]`                     | `["ct9b", "ct10b"]`         | `informational`          | Narrower informational profile; it may inspect proof and review without inheriting full reusable-component parity requirements.       |
| `other`                          | `["other"]`                          | `[]`                        | `informational`          | Explicit catch-all profile that stays outside reusable-component ratchets by default.                                                 |

No non-reusable profile may read all three current rails.

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

## Claim Derivation

For `reusable-component-advancement`, claims progress from
`reusable-component-informational` (proof not ready), to
`reusable-component-proof-ready` (proof ready, review not satisfied), then:

- `reusable-component-parity-current` when proof, review, and publication parity are current and satisfied;
- `reusable-component-status-baseline` when proof and review are ready but current parity is explicitly deferred;
- `reusable-component-reviewed` when proof and review are ready but publication parity is otherwise missing, stale, or unsatisfied.

These labels describe evidence; none substitutes for the consumer's blocking
policy. In particular, deferred publication cannot establish release readiness.
`reasonCodes` contains deduplicated reasons from claim-relevant inputs plus profile
policy. Generated reports remain informational; the promotion gate evaluates the
requested consumer context and explicit change class separately.

The legacy field name `mayPromoteToBlockingInS3` remains part of the profile
schema: only the reusable-component profile sets it to true. It describes the
existing consumer policy, not a pending implementation phase.

## Invalid Inputs And Forbidden Truth Sources

- `CT-12B` may not copy raw upstream payloads into `railSummaries`.
- `CT-12B` may not introduce vendor-native IDs, vendor UI URLs, vendor-only status fields, or prose-only interpretations as independent truth.
- `CT-12B` may not infer proof readiness from story existence alone.
- `CT-12B` may not re-decide `review.requiredForClaim`; it must consume that field from published `CT-10B`.
- Extra root keys, extra rail summary keys, and extra claim-profile keys are invalid until a future contract version publishes them explicitly.

## Compatibility Rule

Future evaluator and consumer work may add semantics, but the root keys, closed `changeClass` set, three `railSummaries` keys, and upstream field-consumption boundaries above must remain stable until `statusVersion` is bumped explicitly.

Any `CT-12B` root-field, claim-profile, or upstream-boundary change must be implemented atomically across this contract, `storybook/reusable-component-promotion-policy.md`, `scripts/lib/reusable-component-status-contract.mjs`, `storybook/reusable-component-promotion-contract.test.ts`, and the reusable-component-status fixtures.
