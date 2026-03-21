---
seam_id: SEAM-9B
seam_slug: reusable-component-mapping-and-link-convergence
type: integration
status: exec-ready
execution_horizon: active
plan_version: v2
basis:
  currentness: current
  source_scope_ref: scope_brief.md
  source_scope_version: v1
  upstream_closeouts:
    - SEAM-5B
    - SEAM-6B
    - SEAM-7B
    - SEAM-8B
  required_threads:
    - THR-03
    - THR-04
gates:
  pre_exec:
    review: passed
    contract: passed
    revalidation: passed
  post_exec:
    landing: pending
    closeout: pending
open_remediations:
  - REM-003
---

# SEAM-9B — Reusable Component Mapping and Link Convergence

- **Goal / user value**: create repo-owned mapping and link surfaces that bind reusable component identity across Storybook, code, and Figma without turning external tools into the source of truth.
- **Scope**
  - In: reusable-component identity schema; Code Connect style projection descriptors; Storybook Connect style metadata; code entrypoint, variant, slot, and example references; Figma component references; policy that mapping surfaces are downstream projections from repo-owned metadata.
  - Out: Storybook proof inventory ownership; branch-aware visual diff status; final promotion enforcement; Figma publish transport or parity rules.
- **Primary interfaces (contracts)**
  - Inputs:
    - `CT-9B`
    - `CT-10B`
  - Outputs:
    - `CT-11B`
- **Key invariants / rules**:
  - component identity starts from repo-owned metadata, not from vendor-generated IDs alone
  - mapping projections are downstream-only and may not redefine token, recipe, or proof coverage truth
  - Storybook links point to the published proof surface selected by `CT-10B`, not to ad hoc local paths
  - only reusable components with stable component-spec records are eligible for mapping or link projections
- **Dependencies**
  - Direct blockers:
    - none; published `SEAM-7B` and `SEAM-8B` handoffs are current basis
  - Transitive blockers:
    - `SEAM-5B`
    - inherited `SEAM-4`
  - Direct consumers:
    - `SEAM-10B`
  - Derived consumers:
    - designers locating code-backed component examples in Figma
    - engineers locating Figma-backed component context from Storybook
- **Touch surface**: `storybook/component-specs/**`, `storybook/connect/**`, `figma/code-connect/**`, any repo-owned mapping generator or validator scripts
- **Verification**: for a pilot reusable component, one repo-owned identity resolves to a current Storybook URL, a Figma component reference, and a code entrypoint with variant and slot examples; mapping descriptors validate structurally and fail closed when required fields are missing.
- **Risks / unknowns**
  - Risk: vendor-specific descriptor formats drive the schema instead of the repo-owned identity contract.
  - De-risk plan: define the repo-owned mapping identity first, then generate vendor projections from it.
  - Risk: Storybook links drift because published URLs and component specs are maintained separately.
  - De-risk plan: consume `CT-10B` build URLs and `CT-9B` identities through one projection path.
- **Rollout / safety**: start with a narrow pilot component family and fail closed on incomplete mapping fields before broadening to the full reusable-component catalog.
- **Downstream decomposition context**: this seam remains the active execution target and is now `exec-ready` because `SEAM-8B` landed `CT-10B`, recorded a ready seam-exit handoff, and published the field boundary that Storybook-link execution consumes. The remaining blocker is post-exec and already explicit in `REM-003`: `THR-07` cannot publish until current repo-owned `CT-10B` evidence is available again for the live pilot mapping outputs.
