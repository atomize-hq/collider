# Supersession Map

This document explains which historical planning artifacts remain evidence, which are no longer sufficient for live convergence planning, and what replaces them in this pack.

Rule of use:

- do not rewrite the old pack to make it appear it always said the new thing
- cite the old pack as historical/original planning context
- cite this pack for live convergence planning

## Governing Carry-Forward

These documents are not superseded by this pack. They remain authoritative inputs.

| Historical doc                                                                                                                                                           | Status here                  | Why                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- | ----------------------------------------------------------------- |
| [figma-ci-sync/target-state-harness.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/figma-ci-sync/target-state-harness.md)                                 | governing target-state model | it is the north-star contract model the new pack converges toward |
| [figma-ci-sync/seam-1-canonical-token-source.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/figma-ci-sync/seam-1-canonical-token-source.md)               | inherited satisfied input    | canonical source ownership remains valid                          |
| [figma-ci-sync/seam-2-component-recipe-manifest.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/figma-ci-sync/seam-2-component-recipe-manifest.md)         | inherited satisfied input    | recipe ownership remains valid                                    |
| [figma-ci-sync/seam-3-token-build-and-distribution.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/figma-ci-sync/seam-3-token-build-and-distribution.md)   | inherited satisfied input    | derived projection paths remain valid                             |
| [figma-ci-sync/seam-4-app-and-storybook-consumption.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/figma-ci-sync/seam-4-app-and-storybook-consumption.md) | inherited satisfied input    | runtime and Storybook proof surfaces remain valid                 |

## Live Supersession

| Historical seam/doc                                                                                                                                                                  | Why it is no longer sufficient                                                                                                                                                                                                                                                                                                         | Replaced by                                                                                                                                                                                                                                                                                                               | Migration effect                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [figma-ci-sync/seam-5-figma-sync-rail.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/figma-ci-sync/seam-5-figma-sync-rail.md)                                         | it captured an earlier v1 sync posture but is no longer sufficient as the live harness design because the active work now needs an explicit split between short-term proof rail and long-term hardened rail                                                                                                                            | [harness-convergence/seam-5b-figma-publish-rail-convergence.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/harness-convergence/seam-5b-figma-publish-rail-convergence.md)                                                                                                                                  | future planning work must cite `SEAM-5B` instead of historical `SEAM-5`                      |
| [figma-ci-sync/threaded-seams/seam-5-figma-sync-rail/seam.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/figma-ci-sync/threaded-seams/seam-5-figma-sync-rail/seam.md) | it still reflects the old seam boundary and should be treated as landed history, not as the active convergence seam brief                                                                                                                                                                                                              | [harness-convergence/seam_map.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/harness-convergence/seam_map.md) and [harness-convergence/seam-5b-figma-publish-rail-convergence.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/harness-convergence/seam-5b-figma-publish-rail-convergence.md) | downstream slice work should branch from `SEAM-5B`, not from the old threaded seam           |
| [figma-ci-sync/threading.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/figma-ci-sync/threading.md) `CT-7`                                                            | the old `CT-7` entry is historical evidence of the earlier posture, but it is no longer sufficient as the live contract because the permanent harness design must explicitly distinguish `plugin-import-manual`, `rest-variables-oauth`, and temporary Tokens Studio carriage without treating older assumptions as settled live truth | [harness-convergence/threading.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/harness-convergence/threading.md) `CT-7B`                                                                                                                                                                                    | all future repo-to-Figma planning should reference `CT-7B` as the live publish-rail contract |
| [figma-ci-sync/seam-6-governance-validation-and-cutover.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/figma-ci-sync/seam-6-governance-validation-and-cutover.md)     | historical seam-6 remains useful as governance background, but its Figma dependency model is not sufficient until it consumes the new publish rail contract and machine-readable promotion semantics                                                                                                                                   | [harness-convergence/seam-6b-verification-and-promotion-convergence.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/harness-convergence/seam-6b-verification-and-promotion-convergence.md)                                                                                                                  | future gate and parity planning should route through `SEAM-6B`                               |
| [figma-ci-sync/seam_map.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/figma-ci-sync/seam_map.md)                                                                     | it remains a valid map of the original landed pack, but it is not the active seam inventory for convergence work                                                                                                                                                                                                                       | [harness-convergence/seam_map.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/harness-convergence/seam_map.md)                                                                                                                                                                                              | future convergence work should treat the old map as history and the new map as live planning |

## `CT-7` to `CT-7B` Migration Notes

Historical `CT-7` should now be read this way:

- it proved the old pack understood that Figma needed a downstream-only sync contract
- it does not remain the live contract entry for the permanent harness design
- it should not be cited as if the old pack already fully settled the long-term hardened rail

`CT-7B` replaces it by making four things explicit:

1. the short-term proof rail is `plugin-import-manual`
2. the long-term hardened rail is `rest-variables-oauth`
3. Tokens Studio is optional and temporary only
4. machine-readable verification and promotion are defined downstream through `CT-8B`

## Operational Rule After This Pack Lands

- use `figma-ci-sync/*` for historical context and evidence
- use `harness-convergence/*` for all new convergence planning
- do not back-edit old seam-5 or old `CT-7` to pretend they always matched `SEAM-5B`
