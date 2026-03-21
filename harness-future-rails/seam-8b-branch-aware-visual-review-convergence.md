---
seam_id: SEAM-8B
seam_slug: branch-aware-visual-review-convergence
type: integration
status: landed
execution_horizon: future
plan_version: v2
basis:
  currentness: current
  source_scope_ref: scope_brief.md
  source_scope_version: v1
  upstream_closeouts:
    - SEAM-5B
    - SEAM-6B
    - SEAM-7B
  required_threads:
    - THR-02
  stale_triggers:
    - Any change to `storybook/story-inventory.json`, `storybook/component-tier-policy.json`, `storybook/component-specs/*.json`, or `artifacts/storybook/proof-coverage.json` that changes the proof scope consumed by `CT-10B`.
    - Any CI topology or provider-transport change that bypasses `.github/workflows/ci.yml`, `pnpm storybook:build`, or the future `artifacts/chromatic/status.json` contract.
gates:
  pre_exec:
    review: passed
    contract: passed
    revalidation: passed
  post_exec:
    landing: passed
    closeout: passed
seam_exit_gate:
  required: true
  planned_location: S3
  status: passed
open_remediations: []
---

# SEAM-8B — Branch-Aware Visual Review Convergence

- **Goal / user value**: publish the Storybook proof surface into a branch-aware visual-review rail with machine-readable status, so future promotion policy can distinguish reviewed reusable components from components that only build locally.
- **Scope**
  - In: Chromatic or equivalent branch-aware publish rail; a named CI or PR status contract; `artifacts/chromatic/status.json`; build URL and diff outcome capture; explicit policy for what proof inventory subset must be reviewed for a reusable-component claim.
  - Out: repo-owned proof inventory design; Figma publish or parity semantics; Code Connect descriptors; Storybook Connect metadata; final promotion-level decisions.
- **Primary interfaces (contracts)**
  - Inputs:
    - `CT-9B`
  - Outputs:
    - `CT-10B`
- **Key invariants / rules**:
  - visual review always points at the same Storybook revision that the proof inventory selected
  - review status is machine-readable and branch-specific, not a screenshot folder or human note
  - visual review may remain optional during rollout, but optionality must be explicit in policy and status output
  - this seam publishes proof surfaces; it does not redefine them
- **Dependencies**
  - Direct blockers:
    - none; landed `CT-9B` and the realized `SEAM-7B` seam-exit handoff are both current
  - Transitive blockers:
    - inherited `SEAM-4`
  - Direct consumers:
    - `SEAM-9B`
    - `SEAM-10B`
  - Derived consumers:
    - PR reviewers
    - release/governance maintainers
- **Touch surface**: `.github/workflows/**`, Storybook build and publish scripts, `artifacts/chromatic/status.json`, possible Chromatic config, review policy docs adjacent to the new status contract
- **Verification**: a PR or branch run emits a build URL plus diff status for the selected proof inventory; missing or stale status is detectable without reading CI logs; reviewers can map the review status back to the Storybook revision and branch.
- **Risks / unknowns**
  - Risk: visual review status stays trapped inside a vendor UI and never becomes a repo-consumable proof surface.
  - De-risk plan: require a generated status artifact and named GitHub check in the contract.
  - Risk: the reviewed story set diverges from the proof inventory and creates false confidence.
  - De-risk plan: make the inventory the only allowed source for required review scope.
- **Rollout / safety**: start with non-blocking status emission for a pilot reusable component slice, then promote it to a required review rail only after `CT-10B` is stable and current.
- **Downstream decomposition context**: this seam is landed basis. `SEAM-9B` now consumes the published `CT-10B` handoff, and `SEAM-10B` remains downstream of the review-mode semantics this seam closed out.
