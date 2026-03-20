# Seam Map

Source set:

- governing target-state model: [figma-ci-sync/target-state-harness.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/figma-ci-sync/target-state-harness.md)
- completed convergence basis: [harness-convergence/threading.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/harness-convergence/threading.md)
- boundary confirmation that `WS-6B` is done and future work should not be absorbed back into it: [subslice-3-s3c-ws-6b-handoff-boundary.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/harness-convergence/threaded-seams/seam-6b-verification-and-promotion-convergence/slice-3-promotion-governance-adoption/subslice-3-s3c-ws-6b-handoff-boundary.md)

Extraction strategy: integration-first with a conformance tail. The remaining harness risk is no longer the Figma publish rail itself; it is the missing contract layer that should connect Storybook proof, visual review, reusable-component mappings, and promotion policy into one deterministic system.

## Upstream Basis Seams

These seams are inputs to this pack. They are not reopened here.

| ID        | Name                                   | Status in this pack | Reason                                                                |
| --------- | -------------------------------------- | ------------------- | --------------------------------------------------------------------- |
| `SEAM-1`  | Canonical Token Source                 | satisfied input     | token ownership remains upstream truth                                |
| `SEAM-2`  | Component Recipe Manifest              | satisfied input     | recipe ownership remains upstream truth                               |
| `SEAM-3`  | Token Build and Distribution           | satisfied input     | projection paths remain upstream truth                                |
| `SEAM-4`  | App and Storybook Consumption          | satisfied input     | current proof surfaces and Storybook consumption are basis, not scope |
| `SEAM-5B` | Figma Publish Rail Convergence         | upstream closeout   | Figma publish mode and hardening posture are already defined upstream |
| `SEAM-6B` | Verification and Promotion Convergence | upstream closeout   | Figma ledger and parity policy are already defined upstream           |

## Active Future Seams

| ID         | Name                                            | Type        | Unlocks                                                                                  | Primary blockers                           |
| ---------- | ----------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------- | ------------------------------------------ |
| `SEAM-7B`  | Storybook Proof System Convergence              | conformance | explicit proof inventory and component metadata that the future rails can consume        | inherited `SEAM-4`                         |
| `SEAM-8B`  | Branch-Aware Visual Review Convergence          | integration | deterministic Chromatic-backed review status for published Storybook proof surfaces      | `SEAM-7B`                                  |
| `SEAM-9B`  | Reusable Component Mapping and Link Convergence | integration | repo-owned mapping/link surfaces that connect reusable components across code and Figma  | `SEAM-7B`, `SEAM-8B`                       |
| `SEAM-10B` | Reusable Component Promotion Convergence        | conformance | promotion policy that can eventually require proof, visual review, and mapping integrity | `SEAM-6B`, `SEAM-7B`, `SEAM-8B`, `SEAM-9B` |

## Seam Brief Index

- `SEAM-7B` -> [seam-7b-storybook-proof-system-convergence.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/harness-future-rails/seam-7b-storybook-proof-system-convergence.md)
- `SEAM-8B` -> [seam-8b-branch-aware-visual-review-convergence.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/harness-future-rails/seam-8b-branch-aware-visual-review-convergence.md)
- `SEAM-9B` -> [seam-9b-reusable-component-mapping-and-link-convergence.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/harness-future-rails/seam-9b-reusable-component-mapping-and-link-convergence.md)
- `SEAM-10B` -> [seam-10b-reusable-component-promotion-convergence.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/harness-future-rails/seam-10b-reusable-component-promotion-convergence.md)

## Candidate Seams Considered and Pruned

- A new Figma transport seam was pruned because `SEAM-5B` already owns publish mode, transport, credentials, and hardening posture.
- A new Figma parity seam was pruned because `SEAM-6B` already owns ledger semantics and parity-mode authority.
- A standalone Storybook publishing seam was pruned into `SEAM-8B` because branch-aware review only matters once Storybook proof inventory is explicit and tied to a machine-readable review rail.
- Separate Code Connect and Storybook Connect seams were pruned into `SEAM-9B` because both depend on the same reusable-component identity model and should not split that contract in two.
- A catch-all “future integrations” seam was pruned because it would hide coupling instead of naming the actual contract and promotion boundaries.
