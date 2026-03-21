# Chromatic Review Contract

`storybook/chromatic-review-contract.md` is the repo-owned `CT-10B` contract for `artifacts/chromatic/status.json`.

## Scope

- This document freezes the initial repo-owned payload shape for branch-aware visual review status.
- This document does not define workflow wiring, provider invocation, helper scripts, or claim policy ratchets.
- Downstream seams must consume this artifact instead of vendor UI state or raw provider payloads.

## Root Shape

`artifacts/chromatic/status.json` must be a JSON object with exactly these top-level keys and no extras:

1. `statusVersion`
2. `branch`
3. `revision`
4. `proofInventory`
5. `build`
6. `review`
7. `check`
8. `generatedAt`

The initial `statusVersion` is the literal string `"1"`.

## Field Definitions

| Field                                 | Type / literal                                           | Notes                                                                  |
| ------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------- |
| `statusVersion`                       | `"1"`                                                    | Explicit contract version for `CT-10B`.                                |
| `branch.name`                         | `string`                                                 | Branch name for the reviewed Storybook revision.                       |
| `revision.gitSha`                     | `string`                                                 | Must be a 40-character lowercase git SHA.                              |
| `proofInventory.path`                 | `"storybook/story-inventory.json"`                       | Fixed pointer to the landed `CT-9B` inventory source.                  |
| `proofInventory.inventoryVersion`     | `string`                                                 | Version copied from the selected `CT-9B` inventory.                    |
| `proofInventory.selectedComponentIds` | `string[]`                                               | Component IDs included in the reviewed proof scope.                    |
| `proofInventory.selectedStoryIds`     | `string[]`                                               | Story IDs included in the reviewed proof scope.                        |
| `build.url`                           | `string`                                                 | Stable repo-consumable build URL for the reviewed Storybook revision.  |
| `review.mode`                         | `"informational"` or `"claim-required"`                  | Repo-owned claim-relevance mode for downstream `THR-06` consumers.     |
| `review.requiredForClaim`             | `boolean`                                                | `true` only when the reviewed scope is claim-relevant for `SEAM-10B`.  |
| `review.scope.componentIds`           | `string[]`                                               | Reviewed component IDs derived from the selected `CT-9B` proof scope.  |
| `review.scope.storyIds`               | `string[]`                                               | Reviewed story IDs derived from the selected `CT-9B` proof scope.      |
| `review.scope.componentTiers`         | `{ [componentId: string]: string }`                      | Tier mapping copied from `storybook/component-specs/<component>.json`. |
| `review.diffOutcome`                  | `"passed"` or `"changed"` or `"failed"` or `"deferred"`  | Normalized diff outcome for the reviewed revision.                     |
| `check.name`                          | `"chromatic-review"`                                     | Stable named check boundary for `CT-10B`.                              |
| `check.conclusion`                    | `"success"` or `"neutral"` or `"failure"` or `"skipped"` | Repo-consumable check conclusion.                                      |
| `generatedAt`                         | `string`                                                 | Must be an ISO-8601 UTC timestamp.                                     |

## Field Origins

| Contract field(s)                     | Source                    | Rule                                                                                   |
| ------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------- |
| `proofInventory.path`                 | Landed `CT-9B`            | Must remain `"storybook/story-inventory.json"`.                                        |
| `proofInventory.inventoryVersion`     | Landed `CT-9B`            | Copied from `storybook/story-inventory.json`.                                          |
| `proofInventory.selectedComponentIds` | Landed `CT-9B`            | Must name the reviewed proof-scope components selected from the inventory contract.    |
| `proofInventory.selectedStoryIds`     | Landed `CT-9B`            | Must name the reviewed proof-scope stories selected from the inventory contract.       |
| `revision.gitSha`                     | Normalized publish output | Repo-owned field derived from the reviewed revision.                                   |
| `build.url`                           | Normalized publish output | Repo-owned field derived from the reviewed build.                                      |
| `review.requiredForClaim`             | Repo-owned policy         | Boolean claim-relevance signal for future `SEAM-10B` consumption only.                 |
| `review.scope.*`                      | Landed `CT-9B`            | Must mirror the same reviewed proof selection already recorded under `proofInventory`. |
| `review.diffOutcome`                  | Normalized publish output | Repo-owned normalized outcome, not vendor response shape.                              |
| `check.conclusion`                    | Normalized publish output | Repo-owned conclusion surface for the named check.                                     |

No raw provider payload, response blob, or vendor-only nested shape may appear in `CT-10B`.

## Review Object Semantics

- `review.mode` is restricted to `informational` and `claim-required`.
- If the resolved branch or claim context is not a reusable-component advancement claim, set `review.mode` to `informational` and `review.requiredForClaim` to `false`.
- If the resolved branch or claim context is a reusable-component advancement claim and the selected proof scope includes one or more `CT-9B` component IDs in scope for that claim, set `review.mode` to `claim-required` and `review.requiredForClaim` to `true`.
- Deferred, skipped, and out-of-scope cases are execution outcomes or reasons, not extra review modes. `review.mode` remains one of the two values above even when `review.diffOutcome` is `deferred`.
- `review.scope` is the repo-owned reviewed subset selected from `CT-9B`. It must carry the selected component IDs, selected story IDs, and the component-tier mapping used to decide claim relevance.
- `review.scope.componentIds` must match `proofInventory.selectedComponentIds` exactly.
- `review.scope.storyIds` must match `proofInventory.selectedStoryIds` exactly.
- `review.scope.componentTiers` must be copied from `storybook/component-specs/<component-id>.json`; it may not be inferred from vendor state.
- `review.requiredForClaim` is reserved for future reusable-component promotion consumption in `SEAM-10B`. It does not make the `chromatic-review` check a merge gate or approval signal.
- The selection and rollout rules for these fields are defined by [storybook/chromatic-review-policy.md](./chromatic-review-policy.md).

## Compatibility Rule

Provider or host changes must preserve these field names and meanings. If a transport or provider change would rename or reinterpret downstream fields, bump `statusVersion` instead of renaming the existing `CT-10B` keys.
