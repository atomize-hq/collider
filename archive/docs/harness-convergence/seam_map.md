# Seam Map

Source set:

- governing target-state model: [figma-ci-sync/target-state-harness.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/figma-ci-sync/target-state-harness.md)
- historical/original pack: [figma-ci-sync](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/figma-ci-sync)

Extraction strategy: integration-first, because the remaining convergence risk is not scalar token design. The live risk is aligning the Figma publish rail and the promotion model with the harness contract without rewriting historical planning artifacts in place.

## Inherited Historical Seams

These seams are not reopened here. They are treated as satisfied inputs or baseline evidence.

| ID       | Name                                | Status in convergence pack | Reason                                                                                               |
| -------- | ----------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------- |
| `SEAM-1` | Canonical Token Source              | satisfied input            | still defines canonical token ownership and theme rules                                              |
| `SEAM-2` | Component Recipe Manifest           | satisfied input            | still defines component-contract ownership and reference discipline                                  |
| `SEAM-3` | Token Build and Distribution        | satisfied input            | still defines deterministic projection paths and build ownership                                     |
| `SEAM-4` | App and Storybook Consumption       | satisfied input            | still defines the primary proof/consumption surfaces used by engineers                               |
| `SEAM-5` | Figma Sync Rail                     | historical evidence only   | transport assumptions are no longer sufficient as the permanent harness model                        |
| `SEAM-6` | Governance, Validation, and Cutover | historical baseline only   | governance framing remains useful, but the Figma/promotion contract must be re-grounded on `SEAM-5B` |

## Active Convergence Seams

| ID        | Name                                   | Type        | Unlocks                                                                                                                   | Primary blockers                       |
| --------- | -------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `SEAM-5B` | Figma Publish Rail Convergence         | integration | a target-state-aligned repo-to-Figma rail with explicit proof and hardening paths                                         | inherited `SEAM-1`, inherited `SEAM-3` |
| `SEAM-6B` | Verification and Promotion Convergence | risk        | machine-readable publish validity and promotion rules that consume `SEAM-5B` instead of the historical seam-5 assumptions | inherited `SEAM-4`, `SEAM-5B`          |

## Seam Brief Index

- `SEAM-5B` → [seam-5b-figma-publish-rail-convergence.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/harness-convergence/seam-5b-figma-publish-rail-convergence.md)
- `SEAM-6B` → [seam-6b-verification-and-promotion-convergence.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/harness-convergence/seam-6b-verification-and-promotion-convergence.md)

## Candidate Seams Considered and Pruned

- A new canonical-token seam was pruned because the old pack already established canonical source boundaries and this convergence scope is not reopening them.
- A new build/distribution seam was pruned because `design-tokens/dist/figma/tokens.json` remains an inherited derived projection rather than a newly disputed artifact path.
- A standalone Tokens Studio seam was pruned because Tokens Studio is intentionally not part of the permanent harness contract; it is only an optional temporary carrier within `SEAM-5B`.
- A standalone migration seam was pruned into [supersession.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/harness-convergence/supersession.md) because the main migration need is document-level truth migration, not an independently shippable product capability.
