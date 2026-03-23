# Chromatic Review Policy

`storybook/chromatic-review-policy.md` is the repo-owned policy entrypoint for review scope and optionality in `CT-10B`.

## Scope Source Of Truth

- The only allowed source of review scope is landed `CT-9B`.
- `storybook/story-inventory.json` defines the selected component IDs and selected story IDs carried into `proofInventory` and `review.scope`.
- `storybook/component-specs/<component-id>.json` defines the component-tier values copied into `review.scope.componentTiers`.
- `storybook/component-tier-policy.json` defines the repo-owned tier vocabulary and the tier semantics that later promotion work may consume.
- Provider output, vendor UI state, GitHub check conclusions, and prose summaries may report execution results, but they may not choose or redefine review scope.

## Review Mode Policy

- `SEAM-8B` remains non-blocking and non-universal. The named `chromatic-review` check reports whether the rail ran and emitted repo-owned status; it does not communicate merge authority, approval semantics, or reusable-component advancement by itself.
- Claim-level ratcheting remains owned by `SEAM-10B`. `SEAM-8B` may mark a run as claim-relevant through `review.mode` and `review.requiredForClaim`, but it may not enforce that policy.
- `review.mode` is limited to `informational` and `claim-required`.
- If the resolved branch or claim context is not a reusable-component advancement claim, set `review.mode` to `informational` and `review.requiredForClaim` to `false`.
- If the resolved branch or claim context is a reusable-component advancement claim and the selected proof scope includes one or more `CT-9B` component IDs in scope for that claim, set `review.mode` to `claim-required` and `review.requiredForClaim` to `true`.
- Deferred, skipped, or out-of-scope runs do not create a third review mode. They remain execution outcomes or reasons elsewhere in `CT-10B`, while `review.mode` stays `informational` or `claim-required`.

## Review Scope Rules

- `review.scope` must be the same reviewed subset already recorded under `proofInventory`.
- `review.scope.componentIds` must match `proofInventory.selectedComponentIds` exactly.
- `review.scope.storyIds` must match `proofInventory.selectedStoryIds` exactly.
- `review.scope.componentTiers` must map each selected component ID to the tier recorded in `storybook/component-specs/<component-id>.json`.
- The review rail may not broaden, narrow, or replace `review.scope` from provider state, GitHub metadata, or manual reviewer choice.

## Initial Pilot Scope

The initial landed `CT-9B` pilot scope is:

- `componentIds`: `["thinking-indicator"]`
- `storyIds`:
  - `contracts-pilot-recipe--thinking-indicator-recipe`
  - `contracts-generated-tokens--token-registry`
- `componentTiers`: `{ "thinking-indicator": "primitive" }`

This pilot scope remains current until `CT-9B` changes.

## Normative Examples

### Deferred Or Out-Of-Scope Example

The rail may skip execution for a branch that is outside reusable-component advancement scope. In that case:

- `review.mode` is `informational`
- `review.requiredForClaim` is `false`
- `review.scope` still mirrors the selected `CT-9B` proof scope
- the artifact must explain the deferred or skipped outcome through repo-owned outcome or reason fields rather than by inventing a new review mode

### Claim-Required Example

The rail may run for a reusable-component advancement claim that includes the pilot `thinking-indicator` proof scope. In that case:

- `review.mode` is `claim-required`
- `review.requiredForClaim` is `true`
- `review.scope` mirrors the same pilot `CT-9B` scope:
  - `componentIds`: `["thinking-indicator"]`
  - `storyIds`: `["contracts-pilot-recipe--thinking-indicator-recipe", "contracts-generated-tokens--token-registry"]`
  - `componentTiers`: `{ "thinking-indicator": "primitive" }`

## Consumer Boundary

- Downstream consumers must read `artifacts/chromatic/status.json` and this policy, not vendor UI, to determine review scope and claim relevance.
- `SEAM-9B` may later consume repo-owned build URL and scope fields.
- `SEAM-10B` may later consume `review.mode` and `review.requiredForClaim` when it owns the blocking-policy ratchet.
