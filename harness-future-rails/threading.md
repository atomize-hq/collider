# Threading

## Execution Horizon

- Active seam: none
- Next seam: `SEAM-10B`
- Future seams: none

Reasoning:

- `SEAM-9B` is now landed basis because `CT-11B` is published, `THR-07` is published, and the recorded seam-exit handoff is `promotion_readiness: ready`.
- `SEAM-10B` is next because it is the nearest direct consumer of the now-published `CT-11B` handoff.
- No future seams remain because the pack now exposes only the current execution target and its immediate downstream consumer.

## Contract Registry

- **Contract ID**: `CT-H1`
  - **Type**: config
  - **Owner seam**: inherited `SEAM-1` and inherited `SEAM-2`
  - **Direct consumers (seams)**: `SEAM-7B`
  - **Derived consumers (seams)**: `SEAM-8B`, `SEAM-9B`, `SEAM-10B`
  - **Thread IDs**: `THR-01`
  - **Definition**: design-system meaning may be edited only in `design-tokens/src/tokens/**/*.tokens.json`, `design-tokens/src/tokens/themes/registry.json`, and `design-tokens/src/recipes/*.recipe.json`, plus any proof metadata surface that this pack explicitly declares canonical for reusable-component proof scope.
  - **Versioning/compat**: token and recipe ownership remains unchanged; proof metadata additions must be explicit and repo-owned, never inferred from vendor state.

- **Contract ID**: `CT-H2`
  - **Type**: schema
  - **Owner seam**: inherited `SEAM-3`
  - **Direct consumers (seams)**: inherited `SEAM-4`, `SEAM-7B`
  - **Derived consumers (seams)**: `SEAM-8B`, `SEAM-9B`, `SEAM-10B`
  - **Thread IDs**: `THR-01`
  - **Definition**: the stable derived projections remain `src/lib/tokens/tokens.css`, `design-tokens/dist/tokens.ts`, and `design-tokens/dist/figma/tokens.json`; Storybook proof stories and future mapping surfaces inspect or project from these artifacts but do not replace them.
  - **Versioning/compat**: future rails may add proof, mapping, or status surfaces, but they must continue to trace back to the same projection set or explicitly declare a new projection contract.

- **Contract ID**: `CT-8B`
  - **Type**: state
  - **Owner seam**: `SEAM-6B`
  - **Direct consumers (seams)**: `SEAM-10B`
  - **Derived consumers (seams)**: none
  - **Thread IDs**: `THR-05`
  - **Definition**: `src/figma/sync-ledger.json` remains the machine-readable Figma verification and parity contract for the current artifact revision, including `promotion.parityMode`, `promotion.highestEarnedLevel`, and exception semantics.
  - **Versioning/compat**: this pack consumes `CT-8B` as published basis and does not rename, extend, or reinterpret its fields.

- **Contract ID**: `CT-9B`
  - **Type**: config
  - **Owner seam**: `SEAM-7B`
  - **Direct consumers (seams)**: `SEAM-8B`, `SEAM-9B`, `SEAM-10B`
  - **Derived consumers (seams)**: AI agents and maintainers reviewing reusable-component readiness
  - **Thread IDs**: `THR-02`, `THR-04`, `THR-08`
  - **Definition**: the repo-owned proof metadata contract is `storybook/story-inventory.json` plus `storybook/component-specs/<component-id>.json`; inventory entries must use the current validator kind set (`default`, `variant-matrix`, `state-matrix`, `actions`, `controlled`, `keyboard`, `focus`, `workflow`, `motion`, `async`, `docs`, `responsive`, `composition`) and each reusable component spec must bind component identity, tier, required story coverage, and downstream mapping hooks.
  - **Versioning/compat**: breaking changes to inventory or component-spec shape require a version bump inside those metadata files and downstream validator updates before new rails may consume them.

- **Contract ID**: `CT-10B`
  - **Type**: state
  - **Owner seam**: `SEAM-8B`
  - **Direct consumers (seams)**: `SEAM-9B`, `SEAM-10B`
  - **Derived consumers (seams)**: PR reviewers and release/governance maintainers
  - **Thread IDs**: `THR-03`, `THR-06`
  - **Definition**: branch-aware visual review publishes the current Storybook proof surface from `pnpm storybook:build`, emits a named GitHub check `chromatic-review`, and writes a machine-readable status artifact at `artifacts/chromatic/status.json` with branch, revision, build URL, and diff outcome for the reviewed Storybook revision.
  - **Versioning/compat**: review status is generated, never hand-authored; if the host-of-record changes from Chromatic, the build URL and status schema must remain backwards-compatible or be versioned explicitly.

- **Contract ID**: `CT-11B`
  - **Type**: schema
  - **Owner seam**: `SEAM-9B`
  - **Direct consumers (seams)**: `SEAM-10B`
  - **Derived consumers (seams)**: designers and engineers navigating component mappings
  - **Thread IDs**: `THR-07`
  - **Definition**: reusable-component mapping and link metadata is projected from `CT-9B` into `storybook/connect/<component-id>.json` and `figma/code-connect/<component-id>.json`; each record must bind one repo-owned component identity to its Storybook story IDs or published URL, Figma component reference, code entrypoint, supported variants, slots, and example references.
  - **Versioning/compat**: vendor-specific projections may evolve, but the repo-owned component identity and mapping fields must stay stable enough that promotion policy can consume them without tool-specific parsing.

- **Contract ID**: `CT-12B`
  - **Type**: state
  - **Owner seam**: `SEAM-10B`
  - **Direct consumers (seams)**: merge, handoff, and release policy consumers
  - **Derived consumers (seams)**: maintainers and AI agents deciding whether a reusable component is fully promotable
  - **Thread IDs**: `THR-05`, `THR-06`, `THR-07`, `THR-08`
  - **Definition**: reusable-component promotion status is emitted at `artifacts/harness/reusable-component-status.json` and must combine proof coverage from `CT-9B`, visual review state from `CT-10B`, mapping completeness from `CT-11B`, and Figma parity status from `CT-8B` into a single non-prose decision surface.
  - **Versioning/compat**: token-only or docs-only changes may remain outside this contract, but reusable-component advancement may not claim full harness completion without a current `CT-12B` status record.

## Thread Registry

- **Thread ID**: `THR-01`
  - **Producer seam**: inherited `SEAM-4`
  - **Consumer seam(s)**: `SEAM-7B`
  - **Carried contract IDs**: `CT-H1`, `CT-H2`
  - **Purpose**: carry the current Storybook consumption basis into a formal proof inventory seam without reopening runtime or Figma parity work
  - **State**: published
  - **Satisfied by**: `harness-convergence/threading.md`
  - **Revalidation trigger**: any change to token build outputs, Storybook proof-story organization, or canonical ownership boundaries
  - **Notes**: this is basis only; `SEAM-7B` must not reinterpret `SEAM-4` as already having the future proof-system contract

- **Thread ID**: `THR-02`
  - **Producer seam**: `SEAM-7B`
  - **Consumer seam(s)**: `SEAM-8B`
  - **Carried contract IDs**: `CT-9B`
  - **Purpose**: ensure branch-aware visual review consumes an explicit proof inventory instead of ad hoc story selection
  - **State**: revalidated
  - **Satisfied by**: `storybook/story-inventory.json`, `storybook/component-tier-policy.json`, `storybook/component-specs/button.json`, `artifacts/storybook/proof-coverage.json`, `pnpm govern:storybook-proof`, `harness-future-rails/governance/seam-7b-closeout.md`
  - **Revalidation trigger**: any change to `storybook/story-inventory.json`, component-tier rules, or required story-kind policy
  - **Notes**: `SEAM-8B` consumed the published proof contract during promotion into the active window and revalidated it against the recorded `SEAM-7B` seam-exit handoff; downstream execution now depends on landing `CT-10B`, not further `CT-9B` closeout normalization

- **Thread ID**: `THR-03`
  - **Producer seam**: `SEAM-8B`
  - **Consumer seam(s)**: `SEAM-9B`
  - **Carried contract IDs**: `CT-10B`
  - **Purpose**: provide stable published Storybook URLs and review status for Storybook Connect style linking
  - **State**: revalidated
  - **Satisfied by**: `storybook/chromatic-review-contract.md`, `storybook/chromatic-review-policy.md`, `scripts/lib/chromatic-status.mjs`, `scripts/validate-chromatic-status.mjs`, `.github/workflows/ci.yml`, `harness-future-rails/governance/seam-8b-closeout.md`
  - **Revalidation trigger**: any change to Storybook publish host, build URL format, or status artifact schema
  - **Notes**: `SEAM-9B` consumed the published review contract during promotion into the active window and revalidated the allowed `CT-10B` field boundary against the recorded `SEAM-8B` seam-exit handoff; link execution may proceed, but `CT-11B` still must land before downstream promotion can consume it.

- **Thread ID**: `THR-04`
  - **Producer seam**: `SEAM-7B`
  - **Consumer seam(s)**: `SEAM-9B`
  - **Carried contract IDs**: `CT-9B`
  - **Purpose**: carry reusable-component identity and required coverage metadata into mapping/link projections
  - **State**: revalidated
  - **Satisfied by**: `storybook/component-specs/button.json`, `artifacts/storybook/proof-coverage.json`, `pnpm govern:storybook-proof`, `harness-future-rails/governance/seam-7b-closeout.md`
  - **Revalidation trigger**: any change to component identity schema, supported variants, or required mapping hooks
  - **Notes**: `SEAM-9B` revalidated the published identity and downstream-hook contract during promotion into the active window; this thread keeps Code Connect and Storybook Connect from inventing identity out of vendor state.

- **Thread ID**: `THR-05`
  - **Producer seam**: `SEAM-6B`
  - **Consumer seam(s)**: `SEAM-10B`
  - **Carried contract IDs**: `CT-8B`
  - **Purpose**: keep reusable-component promotion downstream of current Figma parity semantics instead of bypassing them
  - **State**: published
  - **Satisfied by**: `src/figma/sync-ledger.json`, `src/figma/parity-policy.md`
  - **Revalidation trigger**: any change to `CT-8B`, parity-mode policy, or Figma-dependent claim matrix
  - **Notes**: `SEAM-10B` may consume this thread but must not reopen `WS-6B`

- **Thread ID**: `THR-06`
  - **Producer seam**: `SEAM-8B`
  - **Consumer seam(s)**: `SEAM-10B`
  - **Carried contract IDs**: `CT-10B`
  - **Purpose**: allow promotion policy to distinguish reusable components that are visually reviewed from those that only build
  - **State**: published
  - **Satisfied by**: `storybook/chromatic-review-contract.md`, `storybook/chromatic-review-policy.md`, `.github/workflows/ci.yml`, `harness-future-rails/governance/seam-8b-closeout.md`
  - **Revalidation trigger**: any change to visual-review policy, required branch scope, or status artifact fields
  - **Notes**: this thread stays non-blocking until `SEAM-10B` explicitly promotes it to required for the relevant claim, but the review-mode semantics are now published basis rather than planned future work.

- **Thread ID**: `THR-07`
  - **Producer seam**: `SEAM-9B`
  - **Consumer seam(s)**: `SEAM-10B`
  - **Carried contract IDs**: `CT-11B`
  - **Purpose**: carry reusable-component mapping and link completeness into final promotion policy
  - **State**: published
  - **Satisfied by**: `storybook/reusable-component-mapping-contract.md`, `storybook/reusable-component-mapping-projection-policy.md`, `scripts/lib/component-mapping.mjs`, `scripts/validate-reusable-component-mapping.mjs`, `artifacts/chromatic/status.json`, `storybook/connect/button.json`, `figma/code-connect/button.json`, `artifacts/harness/reusable-component-mapping-status.json`, `harness-future-rails/governance/seam-9b-closeout.md`
  - **Revalidation trigger**: any change to component identity, Figma reference shape, or story URL projection rules
  - **Notes**: this is what makes mapping/link quality inspectable instead of anecdotal. Publication is now backed by restored repo-owned `CT-10B` evidence from the March 21, 2026 `chromatic-review` rerun for `e4a9f4f4e0a9dd75744a80cfe6a323882855c16e`; downstream consumers must still revalidate if the `CT-10B` URL or proof-scope semantics drift.

- **Thread ID**: `THR-08`
  - **Producer seam**: `SEAM-7B`
  - **Consumer seam(s)**: `SEAM-10B`
  - **Carried contract IDs**: `CT-9B`
  - **Purpose**: keep promotion grounded on explicit proof coverage instead of story existence alone
  - **State**: published
  - **Satisfied by**: `artifacts/storybook/proof-coverage.json`, `pnpm govern:storybook-proof`
  - **Revalidation trigger**: any change to required story kinds or component tier policy
  - **Notes**: promotion may read proof coverage, but `SEAM-10B` does not own the proof inventory contract

## Dependency Graph

- inherited `SEAM-4` blocks `SEAM-7B` because the new proof-system seam must start from the already-landed Storybook consumption posture rather than redefining it.
- `SEAM-7B` blocks `SEAM-8B` because branch-aware visual review cannot be required until Storybook proof inventory and component metadata are explicit.
- `SEAM-7B` blocks `SEAM-9B` because reusable-component mapping needs stable repo-owned identities and required story coverage first.
- `SEAM-8B` precedes `SEAM-9B` because Storybook link metadata needs a published review URL and repo-owned status boundary, not only local story IDs.
- `SEAM-6B` blocks `SEAM-10B` because reusable-component promotion still depends on the existing Figma parity ledger and claim semantics.
- `SEAM-7B` blocks `SEAM-10B` because promotion cannot require proof coverage that has not been formalized.
- `SEAM-8B` blocks `SEAM-10B` because visual review must exist before it can be promoted from optional to required.
- `SEAM-9B` blocks `SEAM-10B` because mapping/link completeness must exist before promotion policy can enforce it.

## Critical Path

`SEAM-7B` -> `SEAM-8B` -> `SEAM-9B` -> `SEAM-10B`

Why this is the critical path:

- the remaining harness cannot move past proof-story ambiguity until `SEAM-7B` freezes the proof inventory and component metadata contract
- visual review becomes the first downstream rail that turns those proof surfaces into a published, branch-aware review system
- mapping and link projections should consume that published proof surface instead of inventing external links independently
- only after proof, review, and mapping rails exist can promotion safely decide which of them become required for reusable-component advancement

`SEAM-6B` is a published side-input, not the main remaining chain.

## Conflict-Safe Workstreams

- **WS-7B (Proof Contracts)**: owns `storybook/story-inventory.json`, `storybook/component-specs/**`, proof-kind policy, and local validators
- **WS-8B (Visual Review Rail)**: owns Chromatic or equivalent publish configuration, CI status emission, and `artifacts/chromatic/status.json`
- **WS-9B (Mapping and Links)**: owns `storybook/connect/**`, `figma/code-connect/**`, and reusable-component identity projections
- **WS-10B (Promotion Conformance)**: owns `artifacts/harness/reusable-component-status.json`, local or CI policy consumers, and claim-level gating rules
- **WS-INT (Integration/Conformance)**: consumes `WS-7B` through `WS-10B` outputs, keeps review surfaces current, and resolves cross-seam policy drift

## Parallelization Notes

- `WS-7B` is landed basis and no longer occupies the forward execution window.
- `WS-8B` is landed basis and no longer occupies the forward execution window.
- `WS-9B` is landed basis and no longer occupies the forward execution window.
- `WS-10B` is next and may now consume published proof, visual-review, and mapping inputs, but it must still preserve the recorded `CT-8B`, `CT-9B`, `CT-10B`, and `CT-11B` field boundaries when it formalizes promotion policy.
