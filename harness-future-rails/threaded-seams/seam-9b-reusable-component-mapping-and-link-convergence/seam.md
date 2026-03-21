---
seam_id: SEAM-9B
seam_slug: reusable-component-mapping-and-link-convergence
status: exec-ready
execution_horizon: active
plan_version: v2
basis:
  currentness: current
  source_seam_brief: ../../seam-9b-reusable-component-mapping-and-link-convergence.md
  source_scope_ref: ../../scope_brief.md
  upstream_closeouts:
    - SEAM-5B
    - SEAM-6B
    - SEAM-7B
    - SEAM-8B
  required_threads:
    - THR-03
    - THR-04
  stale_triggers:
    - Any change to `storybook/component-specs/*.json`, `storybook/story-inventory.json`, or `artifacts/storybook/proof-coverage.json` that alters component identity, required coverage, or downstream mapping hooks carried by `CT-9B`.
    - Any change to the `CT-10B` field-consumption boundary, `build.url` shape, or review-mode semantics recorded in `harness-future-rails/governance/seam-8b-closeout.md`, `storybook/chromatic-review-contract.md`, or `storybook/chromatic-review-policy.md`.
    - Any repo-owned mapping or link metadata appearing outside `storybook/connect/**` and `figma/code-connect/**`, or any consumer reading vendor UI instead of repo-owned `CT-10B` or future `CT-11B` fields.
gates:
  pre_exec:
    review: passed
    contract: passed
    revalidation: passed
  post_exec:
    landing: pending
    closeout: pending
seam_exit_gate:
  required: true
  planned_location: S4
  status: planned
open_remediations:
  - REM-003
---

# SEAM-9B - Reusable Component Mapping and Link Convergence

## Seam Brief (Restated)

- **Goal / value**: publish one repo-owned mapping and link contract that lets a reusable component resolve from the current proof inventory to code entrypoints, supported variants, slot examples, Figma references, and Storybook proof surfaces without turning Chromatic, Figma, or Code Connect into the source of truth.
- **Type**: integration
- **Slicing strategy**: contract-first, because `SEAM-9B` owns undefined contract `CT-11B`, blocks `SEAM-10B`, and must freeze repo-owned identity plus projection rules before any vendor-specific descriptor or promotion consumer can safely depend on them.
- **Scope**
  - **In**: repo-owned component identity fields carried from `CT-9B`; projection rules for `storybook/connect/<component-id>.json` and `figma/code-connect/<component-id>.json`; code entrypoint, variant, slot, and example references; Figma component references; Storybook proof link fields that resolve from the current `CT-10B` contract boundary; fail-closed validation and drift guards for mapping completeness.
  - **Out**: changing proof inventory ownership in `CT-9B`; changing branch-review publication semantics in `CT-10B`; final promotion policy in `CT-12B`; Figma publish transport, parity policy, or vendor-specific publish workflows.
- **Touch surface**: `storybook/component-specs/**`, `storybook/connect/**`, `figma/code-connect/**`, repo-owned generator or validator scripts under `scripts/**`, and any contract docs needed to freeze `CT-11B`.
- **Verification**: for the pilot reusable component family, one repo-owned identity resolves to a current component spec, code entrypoint metadata, supported variants, slot references, example stories, and a Figma component reference; the same identity resolves to a published Storybook URL through the current `CT-10B` contract boundary without hand-authored vendor truth; structural validation fails closed on missing or stale required fields.
- **Basis posture**:
  - **Currentness**: `current`
  - **Upstream closeouts assumed**: `SEAM-5B`, `SEAM-6B`, landed `SEAM-7B`, and landed `SEAM-8B`
  - **Required threads**: `THR-03` and `THR-04` are both `revalidated` against the recorded `SEAM-8B` and `SEAM-7B` seam-exit handoffs.
  - **Stale triggers**: any `CT-9B` identity drift, any `CT-10B` URL or status-schema drift, or any premature repo-owned mapping surface outside the planned projection paths
- **Threading constraints**
  - **Upstream blockers**: none on published inputs; the active seam may execute against the landed `SEAM-7B` and `SEAM-8B` handoffs.
  - **Downstream blocked seams**: `SEAM-10B`
  - **Contracts produced**: `CT-11B`
  - **Contracts consumed**: `CT-9B`, `CT-10B`

## Review Bundle

- `review.md` is the authoritative artifact for `gates.pre_exec.review`

## Seam-Exit Gate Plan

- **Planned location**: `S4` -> `slice-4-seam-exit-gate.md`
- **Why this seam needs an explicit exit gate**: `SEAM-10B` cannot promote mapping completeness from prose or vendor UIs; it needs a closeout-backed statement that `CT-11B` is published, which fields are authoritative, and whether Storybook links were resolved from published `CT-10B` reality or remain blocked.
- **Expected contracts to publish**: `CT-11B` at repo-owned mapping/link projection surfaces plus validation or generator entrypoints that make completeness inspectable.
- **Expected threads to publish / advance**: `THR-07` must move toward `published`; inbound `THR-03` and `THR-04` remain `revalidated` while the active seam basis stays current.
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
  - `CT-10B`: branch-aware build URL and review status from the repo-owned `CT-10B` contract surfaces; consumed as current basis in `S1` through `S4` because `THR-03` is now revalidated against the landed `SEAM-8B` closeout.
- **Threads touched**:
  - `THR-03`: `revalidated`; `S1` freezes the Storybook link field and provenance rules against the published `CT-10B` boundary, `S2` consumes the current review contract for pilot outputs, and `S4` records the downstream stale triggers that would force revalidation again.
  - `THR-04`: `revalidated`; `S1` and `S2` consume the stable component identity and downstream hook fields already published by `SEAM-7B`.
  - `THR-07`: `identified`; `S1`, `S3`, and `S4` advance it by freezing the mapping contract, validating completeness, and publishing closeout-backed handoff evidence for `SEAM-10B`.
- **Dependency edges honored**:
  - `SEAM-7B` no longer blocks planning depth: `CT-9B` is landed and available as current identity basis.
  - `SEAM-8B` no longer blocks execution: `CT-10B` is landed, its seam-exit handoff is ready, and Storybook link semantics are current basis.
  - `SEAM-9B` blocks `SEAM-10B`: promotion policy cannot require mapping completeness until `CT-11B` is published and inspectable.
- **Revalidation requirements**:
  - Reconfirm that the `SEAM-8B` closeout, `storybook/chromatic-review-contract.md`, and `storybook/chromatic-review-policy.md` still expose the same `CT-10B` field boundary this seam consumes.
  - Reconfirm that `storybook/component-specs/button.json` or other pilot specs still carry the same identity shape and downstream hook semantics assumed here.
  - Reconfirm that no repo-owned mapping generator or validation path has already diverged from the planned `storybook/connect/**` and `figma/code-connect/**` surfaces.
- **Parallelization notes**:
  - **What can proceed now**: `S1` can define the repo-owned identity, authority boundary, and current-versus-incomplete link rules; pilot metadata inventory for `S2` can be reviewed against current component specs and the published `CT-10B` contract boundary.
  - **What must wait**: only landing and closeout work that publishes `CT-11B` surfaces and advances `THR-07` remains outside the current `exec-ready` posture.
