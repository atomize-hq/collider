---
pack_id: harness-future-rails
pack_version: v1
status: extracted
source_ref: figma-ci-sync/target-state-harness.md + harness-convergence/threading.md + seam-6b handoff boundary
execution_horizon:
  active_seam: SEAM-8B
  next_seam: SEAM-9B
---

# Scope Brief - Harness Future Rails

- **Goal (1 sentence)**: plan the remainder of Collider's target-state harness after `SEAM-5B` and `SEAM-6B`, with bounded seams for Storybook proof contracts, branch-aware visual review, reusable-component mapping/link rails, and promotion rules that can eventually treat those rails as required.
- **Why now**: the current convergence docs establish that `SEAM-5B` and `SEAM-6B` are the completed basis for Figma publish and parity semantics, but the future rails and proof systems named in `figma-ci-sync/target-state-harness.md` still have no dedicated pack, no thread registry, and no execution horizon.
- **Primary user(s) + JTBD**: design-system maintainers need a new planning pack that starts where `harness-convergence/` stops, so they can assign the remaining harness work without mixing it back into `WS-5B` or `WS-6B`; frontend engineers and AI agents need explicit contracts for Storybook proof inventory, Chromatic review, component mapping/link metadata, and reusable-component promotion gating.
- **In-scope**: a new pack rooted outside `harness-convergence/`; explicit treatment of `SEAM-5B` and `SEAM-6B` as upstream closeout basis; planning seams for Storybook proof-system formalization, branch-aware visual review, Code Connect plus Storybook Connect style mapping/link rails, and promotion gating for reusable-component advancement; review surfaces and governance scaffolds for this future scope.
- **Out-of-scope**: editing `harness-convergence/*`; reopening `CT-7B` or `CT-8B`; implementing Chromatic, Code Connect, Storybook Connect, or new gate code; changing token or recipe canonical source ownership beyond the explicit proof metadata surfaces named in this pack; creating deep slice plans for every seam in this turn.
- **Success criteria**: the repo has one separate planning pack for the future harness remainder; `SEAM-5B` and `SEAM-6B` are treated as basis instead of live scope; the remaining work is split into cohesive seams with named contracts, thread IDs, dependency direction, and execution horizon; future implementers can tell what is active now, what is next, and what remains future without rereading the convergence pack.
- **Constraints**: planning/doc work only; no code changes; no mutation of `harness-convergence/*`; one active seam and one next seam only; contracts must stay concrete enough for later threaded seam decomposition; paths and status surfaces should be repo-owned or explicitly generated, never vendor-only hidden state.
- **External systems / dependencies**: Storybook static publishing, GitHub Actions or equivalent CI status surfaces, Chromatic, Figma component references, Code Connect descriptors, Storybook Connect metadata, current Storybook proof stories under `storybook/stories/**`, current Figma parity policy under `src/figma/**`.
- **Known unknowns / risks**: the exact repo-owned schema for reusable-component contract metadata; the host-of-record for published Storybook proof URLs; the minimum proof-story set required by component tier; the vendor-specific descriptor format expected by future Code Connect or Storybook Connect integrations; how far reusable-component promotion should differ from token-only or docs-only change promotion.
- **Assumptions**:
  - `SEAM-5B` and `SEAM-6B` are completed enough to serve as upstream basis and do not need to be replanned here.
  - current Storybook token docs, recipe proof stories, and parity checks are real repo surfaces, but they do not yet form the full future proof-system contract.
  - `storybook/story-inventory.json` and `storybook/component-specs/*.json` can be declared repo-owned proof metadata surfaces without weakening token or recipe canonical source ownership.
  - branch-aware visual review should not become required until Storybook proof inventory and component metadata are explicit.
  - reusable-component mapping/link rails should stay downstream projections from repo-owned metadata, not vendor-authored sources of truth.
