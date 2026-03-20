---
seam_id: SEAM-7B
seam_slug: storybook-proof-system-convergence
type: conformance
status: proposed
execution_horizon: active
plan_version: v1
basis:
  source_scope_ref: scope_brief.md
  source_scope_version: v1
  upstream_closeouts:
    - SEAM-4
    - SEAM-5B
    - SEAM-6B
  required_threads:
    - THR-01
gates:
  review: pending
  contract: pending
  revalidation: pending
  landing: pending
  closeout: pending
open_remediations:
  - REM-001
---

# SEAM-7B — Storybook Proof System Convergence

- **Goal / user value**: formalize Storybook proof surfaces into a repo-owned contract that future rails can consume without guessing which stories, components, and coverage rules matter.
- **Scope**
  - In: `storybook/story-inventory.json`; `storybook/component-specs/<component-id>.json`; required story-kind policy by component tier; proof-story ownership for generated token docs, recipe docs, runtime parity stories, and reusable-component proof stories; validator and review expectations that make proof coverage inspectable.
  - Out: branch-aware visual-review publishing; Chromatic diff policy; Storybook Connect metadata; Code Connect descriptors; final promotion enforcement.
- **Primary interfaces (contracts)**
  - Inputs:
    - `CT-H1`
    - `CT-H2`
  - Outputs:
    - `CT-9B`
- **Key invariants / rules**:
  - proof metadata is repo-owned and reviewable; it is never inferred from Storybook output alone
  - required story coverage is explicit by component tier, not left to ad hoc reviewer memory
  - proof stories continue to consume generated artifacts instead of copying token or recipe truth locally
  - this seam may add proof metadata surfaces, but it does not weaken token or recipe canonical ownership
- **Dependencies**
  - Direct blockers:
    - inherited `SEAM-4`
  - Transitive blockers:
    - inherited `SEAM-1`
    - inherited `SEAM-2`
    - inherited `SEAM-3`
  - Direct consumers:
    - `SEAM-8B`
    - `SEAM-9B`
    - `SEAM-10B`
  - Derived consumers:
    - maintainers reviewing reusable-component readiness
    - AI agents deciding required proof coverage
- **Touch surface**: `storybook/stories/**`, `storybook/story-inventory.json`, `storybook/component-specs/**`, existing Storybook validators and docs loaders under `scripts/**` and `src/lib/tokens/**`
- **Verification**: inventory validates structurally; each reusable component has a concrete component-spec record; proof stories required by the inventory exist and are implemented; Storybook tests and proof-story review can identify missing coverage without prose.
- **Risks / unknowns**
  - Risk: proof metadata expands into a second design-system source of truth.
  - De-risk plan: keep metadata limited to proof coverage, component identity, and downstream hooks; do not store token values or recipe truth here.
  - Risk: the required story-kind matrix becomes too broad and blocks simple component promotion.
  - De-risk plan: start with tier-based minimums and ratchet upward only where later seams actually consume the coverage.
- **Rollout / safety**: introduce the metadata contract in informational mode first, backfill a pilot component family, then make inventory validation required before `SEAM-8B` consumes it.
- **Downstream decomposition context**: this seam is active because it defines the proof contract every later seam needs. The first seam-local review bundle should focus on whether the proposed inventory and component-spec schema are minimal, repo-owned, and sufficient for later visual review and mapping seams.
