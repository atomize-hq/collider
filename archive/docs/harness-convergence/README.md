# Harness Convergence

This pack is the live planning surface for converging Collider onto the target-state harness defined in [figma-ci-sync/target-state-harness.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/figma-ci-sync/target-state-harness.md).

It exists alongside the original [figma-ci-sync](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/figma-ci-sync) pack on purpose:

- `figma-ci-sync/*` is preserved as historical/original landed planning context.
- `harness-convergence/*` is the forward planning pack for the remaining convergence work.
- The old pack is evidence, not the live place to keep evolving seam assumptions.

## Why `harness-convergence/`

The governing model for the new work is the north-star harness contract, not the original v1 transport assumptions. `harness-convergence/` keeps that explicit and avoids implying that the old `figma-ci-sync/*` pack is still the active seam-planning surface.

## Governing Inputs

- Governing target-state model: [figma-ci-sync/target-state-harness.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/figma-ci-sync/target-state-harness.md)
- Historical/original planning pack: [figma-ci-sync/README.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/figma-ci-sync/README.md)
- Historical Figma rail assumption to supersede, not rewrite: [figma-ci-sync/seam-5-figma-sync-rail.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/figma-ci-sync/seam-5-figma-sync-rail.md)
- Historical contract registry entry to supersede: [figma-ci-sync/threading.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/figma-ci-sync/threading.md)

## Pack Contents

- [scope_brief.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/harness-convergence/scope_brief.md): restated scope, assumptions, success criteria, and inherited evidence boundaries
- [seam_map.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/harness-convergence/seam_map.md): inherited seams versus active convergence seams
- [threading.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/harness-convergence/threading.md): contract registry, dependency graph, publish rails, verification rails, and promotion gates
- [supersession.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/harness-convergence/supersession.md): old-to-new mapping with insufficiency rationale and replacement targets
- [seam-5b-figma-publish-rail-convergence.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/harness-convergence/seam-5b-figma-publish-rail-convergence.md): the new live Figma seam
- [seam-6b-verification-and-promotion-convergence.md](/Users/spensermcconnell/__Active_Code/atomize-hq/collider/harness-convergence/seam-6b-verification-and-promotion-convergence.md): the downstream verification and promotion seam that consumes `SEAM-5B`

## Use This Pack When

- planning any future work that changes the repo-to-Figma publish model
- deciding whether Figma parity is still deferred or is ready to become required
- assigning implementation work for the proof rail, hardened rail, or promotion gates
- verifying whether an AI agent should treat a transport assumption as historical evidence or live truth

## Do Not Use This Pack To

- rewrite or retroactively reinterpret `figma-ci-sync/*`
- claim that old `SEAM-5` already captured the permanent harness design
- start implementation of the plugin rail, OAuth app, or CI integration without a downstream execution plan
