---
subslice_id: S1b
parent_slice: S1
seam_id: SEAM-8B
subslice_kind: delivery
execution_horizon: active
status: exec-ready
basis:
  currentness: current
  basis_ref: ../seam.md#basis
  stale_triggers:
    - Any change to landed `CT-9B` field names, proof-scope selection, or component-tier policy must be reflected here before execution starts.
gates:
  pre_exec:
    review: inherited
    contract: inherited
    revalidation: inherited
  post_exec:
    landing: pending
    closeout: pending
threads:
  - THR-02
  - THR-03
contracts_touched:
  - CT-9B
  - CT-10B
open_remediations:
  - REM-002
subslice_layout: expanded
---

### S1b - Publish Owner And Command Baseline

- **User/system value**: the visual-review rail gets one stable command and one stable CI owner, so downstream seams can trust who published `CT-10B` and which Storybook revision the review artifact describes.
- **Scope (in/out)**:
  - In:
    - Planned `pnpm chromatic:review` command boundary
    - One named `chromatic-review` workflow owner in `.github/workflows/ci.yml`
    - `scripts/lib/chromatic-status.mjs` as the normalizer target owned by that path
    - The approved credential surface and local-vs-CI execution rule
  - Out:
    - Full pilot publish-path implementation
    - Generated artifact normalization logic details
    - Review-mode policy semantics
- **Acceptance criteria**:
  - The plan names exactly one publish command, exactly one CI owner, and exactly one approved credential surface.
  - The publish path consumes the already-built Storybook output for the resolved git SHA instead of rebuilding ad hoc.
  - Local runs may validate or dry-run the flow but may not impersonate the shared branch-review status owner.
  - Build, publish, and status emission all refer to the same revision and output directory.
- **Dependencies**:
  - Landed `CT-9B` proof selection and current `build-storybook` topology
  - [../review.md](../review.md#r2--ci-and-status-normalization-data-flow)
  - [../review.md](../review.md#r3--touch-surface-handoff-map)
- **Verification**:
  - Compare the planned owner with the current `build-storybook` job boundary.
  - Confirm the selected proof scope and git SHA have one unbroken path through build and publish.
- **Rollout/safety**: keep credential use confined to CI and avoid splitting branch-review ownership across multiple jobs or commands.
- **Review surface refs**:
  - [../review.md](../review.md#r2--ci-and-status-normalization-data-flow)
  - [../review.md](../review.md#r3--touch-surface-handoff-map)

#### S1b.T1 - Freeze Publish Command, Owner, And Credential Boundary

- **Outcome**: the seam has one concrete execution-owner plan for branch review before provider-backed publishing begins.
- **Files**:
  - `package.json`
  - `.github/workflows/ci.yml`
  - `scripts/lib/chromatic-status.mjs`
- **Thread/contract refs**:
  - Consumes `CT-9B`
  - Advances `THR-02`
  - Advances `THR-03`
  - Supports `CT-10B`
- **Acceptance criteria**:
  - The command name, workflow owner, and helper-module path are recorded explicitly.
  - The planned owner is the only path allowed to emit shared branch-review status in CI.
  - The plan forbids revision drift between `pnpm storybook:build`, publish, and status emission.
- **Test notes**:
  - Review the current `build-storybook` topology for revision and output-directory continuity.
  - Confirm the local execution rule preserves dry-run or validation behavior without creating shared review state.

Checklist:

- Implement: record the command, workflow owner, helper-module path, and credential surface.
- Test: compare the planned owner boundary against the current CI topology.
- Validate: confirm one git SHA and one build directory flow through build, publish, and status emission.
