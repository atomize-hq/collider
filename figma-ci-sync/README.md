# Figma CI Sync — seam extraction (`figma-ci-sync-plan.md`)

Source: `figma-ci-sync-plan.md`

This directory contains seam artifacts extracted to make the Figma, token, Storybook, and CI sync work owner-assignable and parallelizable without hiding coupling.
These files are planning aids; they are not normative contracts.

- Start here: `scope_brief.md`
- Seam overview: `seam_map.md`
- Threading (contracts + dependencies + workstreams): `threading.md`
- Target-state harness model: `target-state-harness.md`

Extraction strategy: `integration-first`, with a second domain pass for scalar tokens and component recipe contracts.

Working assumptions for this pack:

- Collider remains a single-package repo in v1; the source outline's package examples are treated as a design target, not a precondition.
- The repository is the canonical authoring surface for tokens and recipes; Figma is a consumer, not the source of truth.
- The current runtime handoff path at `src/lib/tokens/tokens.css` is preserved through cutover to reduce migration risk.
