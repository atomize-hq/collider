---
seam_id: SEAM-9B
seam_slug: reusable-component-mapping-and-link-convergence
type: integration
status: proposed
execution_horizon: future
plan_version: v1
basis:
  source_scope_ref: scope_brief.md
  source_scope_version: v1
  upstream_closeouts:
    - SEAM-5B
    - SEAM-6B
  required_threads:
    - THR-03
    - THR-04
gates:
  review: pending
  contract: pending
  revalidation: pending
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
    - `SEAM-7B`
    - `SEAM-8B`
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
- **Downstream decomposition context**: this seam stays future because it depends on both the proof metadata and the published review rail. The first review bundle should focus on whether the proposed identity schema is sufficiently stable to generate both Code Connect and Storybook Connect style outputs without vendor lock-in.
