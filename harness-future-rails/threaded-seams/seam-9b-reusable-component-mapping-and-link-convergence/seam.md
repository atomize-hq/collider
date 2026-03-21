---
seam_id: SEAM-9B
seam_slug: reusable-component-mapping-and-link-convergence
status: decomposed
execution_horizon: next
plan_version: v1
basis:
  currentness: provisional
  source_seam_brief: ../../seam-9b-reusable-component-mapping-and-link-convergence.md
  source_scope_ref: ../../scope_brief.md
  upstream_closeouts:
    - SEAM-5B
    - SEAM-6B
    - SEAM-7B
  required_threads:
    - THR-03
    - THR-04
  stale_triggers:
    - Any change to `storybook/component-specs/*.json`, `storybook/story-inventory.json`, or `artifacts/storybook/proof-coverage.json` that alters component identity, required coverage, or downstream mapping hooks carried by `CT-9B`.
    - Publication of `CT-10B` with a build URL shape, status schema, or review-mode rule that differs from this plan's assumptions about Storybook linking.
    - Any repo-owned mapping or link metadata appearing outside `storybook/connect/**` and `figma/code-connect/**` before `CT-11B` is frozen.
gates:
  pre_exec:
    review: pending
    contract: pending
    revalidation: pending
  post_exec:
    landing: pending
    closeout: pending
seam_exit_gate:
  required: true
  planned_location: S4
  status: pending
open_remediations:
  - REM-003
---

# SEAM-9B - Reusable Component Mapping and Link Convergence

## Seam Brief (Restated)

- **Goal / value**: publish one repo-owned mapping and link contract that lets a reusable component resolve from the current proof inventory to code entrypoints, supported variants, slot examples, Figma references, and Storybook proof surfaces without turning Chromatic, Figma, or Code Connect into the source of truth.
- **Type**: integration
- **Slicing strategy**: contract-first, because `SEAM-9B` owns undefined contract `CT-11B`, blocks `SEAM-10B`, and must freeze repo-owned identity plus projection rules before any vendor-specific descriptor or promotion consumer can safely depend on them.
- **Scope**
  - **In**: repo-owned component identity fields carried from `CT-9B`; projection rules for `storybook/connect/<component-id>.json` and `figma/code-connect/<component-id>.json`; code entrypoint, variant, slot, and example references; Figma component references; Storybook proof link fields that resolve from `CT-10B` once published; fail-closed validation and drift guards for mapping completeness.
  - **Out**: changing proof inventory ownership in `CT-9B`; changing branch-review publication semantics in `CT-10B`; final promotion policy in `CT-12B`; Figma publish transport, parity policy, or vendor-specific publish workflows.
- **Touch surface**: `storybook/component-specs/**`, `storybook/connect/**`, `figma/code-connect/**`, repo-owned generator or validator scripts under `scripts/**`, and any contract docs needed to freeze `CT-11B`.
- **Verification**: for the pilot reusable component family, one repo-owned identity resolves to a current component spec, code entrypoint metadata, supported variants, slot references, example stories, and a Figma component reference; when `CT-10B` is published, the same identity resolves to a published Storybook URL without hand-authored vendor truth; structural validation fails closed on missing or stale required fields.
- **Basis posture**:
  - **Currentness**: `provisional`
  - **Upstream closeouts assumed**: `SEAM-5B`, `SEAM-6B`, and landed `SEAM-7B`
  - **Required threads**: `THR-04` is `published`; `THR-03` is still `identified` and keeps Storybook link completion provisional until `SEAM-8B` lands `CT-10B`
  - **Stale triggers**: any `CT-9B` identity drift, any `CT-10B` URL or status-schema drift, or any premature repo-owned mapping surface outside the planned projection paths
- **Threading constraints**
  - **Upstream blockers**: `SEAM-8B` must publish `CT-10B` through `THR-03` before Storybook link fields can be considered current
  - **Downstream blocked seams**: `SEAM-10B`
  - **Contracts produced**: `CT-11B`
  - **Contracts consumed**: `CT-9B`, `CT-10B`

## Review Bundle

- `review.md` is the authoritative artifact for `gates.pre_exec.review`

## Seam-Exit Gate Plan

- **Planned location**: `S4` -> `slice-4-seam-exit-gate.md`
- **Why this seam needs an explicit exit gate**: `SEAM-10B` cannot promote mapping completeness from prose or vendor UIs; it needs a closeout-backed statement that `CT-11B` is published, which fields are authoritative, and whether Storybook links were resolved from published `CT-10B` reality or remain blocked.
- **Expected contracts to publish**: `CT-11B` at repo-owned mapping/link projection surfaces plus validation or generator entrypoints that make completeness inspectable.
- **Expected threads to publish / advance**: `THR-07` must move toward `published`; `THR-03` consumption must be revalidated against landed `SEAM-8B` closeout before execution becomes legal.
- **Likely downstream stale triggers**: any change to component identity fields, Figma reference shape, Storybook link resolution rules, or `CT-10B` build URL semantics.
- **Expected closeout evidence**: pilot projection artifacts, validator output, publication-ready field definitions, and a clear statement of which `CT-11B` fields downstream promotion may consume directly.

## Slice Index

- `S1` -> `slice-1-ct-11b-contract-baseline.md`
- `S2` -> `slice-2-pilot-component-mapping-adoption.md`
- `S3` -> `slice-3-mapping-conformance-and-drift-guards.md`
- `S4` -> `slice-4-seam-exit-gate.md`

## Governance Pointers

- Pack remediation log: `../../governance/remediation-log.md`
- Seam closeout: `../../governance/seam-9b-closeout.md`

## Threading Alignment

- **Contracts produced (owned)**:
  - `CT-11B`: repo-owned mapping and link metadata projected into `storybook/connect/<component-id>.json` and `figma/code-connect/<component-id>.json`; `S1` freezes the field set and authority boundary, `S2` proves it against a pilot component family, and `S3` adds validators and drift guards that make downstream consumption inspectable.
- **Contracts consumed**:
  - `CT-9B`: published component identity, tier, proof coverage, and downstream mapping hooks from `storybook/component-specs/*.json`, `storybook/story-inventory.json`, and `artifacts/storybook/proof-coverage.json`; consumed throughout the seam as the repo-owned identity basis.
  - `CT-10B`: branch-aware build URL and review status from `artifacts/chromatic/status.json`; consumed provisionally in `S1` and `S2`, then revalidated before execution because `THR-03` is not yet published.
- **Threads touched**:
  - `THR-03`: `identified`; `S1` reserves the Storybook link field and provenance rules, `S2` keeps link completion blocked or nullable until publication, and `S4` records whether the thread became consumable during closeout.
  - `THR-04`: `published`; `S1` and `S2` consume the stable component identity and downstream hook fields already published by `SEAM-7B`.
  - `THR-07`: `identified`; `S1`, `S3`, and `S4` advance it by freezing the mapping contract, validating completeness, and publishing closeout-backed handoff evidence for `SEAM-10B`.
- **Dependency edges honored**:
  - `SEAM-7B` no longer blocks planning depth: `CT-9B` is landed and available as current identity basis.
  - `SEAM-8B` still blocks execution: `CT-10B` must land and record closeout evidence before Storybook link semantics can become current.
  - `SEAM-9B` blocks `SEAM-10B`: promotion policy cannot require mapping completeness until `CT-11B` is published and inspectable.
- **Revalidation requirements**:
  - Reconfirm that `SEAM-8B` landed `CT-10B` with a realized `seam_exit_gate` record and published `THR-03`.
  - Reconfirm that `storybook/component-specs/button.json` or other pilot specs still carry the same identity shape and downstream hook semantics assumed here.
  - Reconfirm that no repo-owned mapping generator or validation path has already diverged from the planned `storybook/connect/**` and `figma/code-connect/**` surfaces.
- **Parallelization notes**:
  - **What can proceed now**: `S1` can define the repo-owned identity, authority boundary, and nullable-versus-required link fields; pilot metadata inventory for `S2` can be reviewed against current component specs.
  - **What must wait**: any slice that claims a current published Storybook URL, review-mode semantics, or closeout-ready downstream publication for `THR-03` must wait for `SEAM-8B` to land and for pre-exec revalidation to pass.
