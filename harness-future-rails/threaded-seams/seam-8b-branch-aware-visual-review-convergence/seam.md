---
seam_id: SEAM-8B
seam_slug: branch-aware-visual-review-convergence
status: decomposed
execution_horizon: active
plan_version: v2
basis:
  currentness: current
  source_seam_brief: ../../seam-8b-branch-aware-visual-review-convergence.md
  source_scope_ref: ../../scope_brief.md
  upstream_closeouts:
    - SEAM-5B
    - SEAM-6B
    - SEAM-7B
  required_threads:
    - THR-02
  stale_triggers:
    - `harness-future-rails/governance/seam-7b-closeout.md` is missing the realized `seam_exit_gate` record required for downstream promotion.
    - Any change to `storybook/story-inventory.json`, `storybook/component-tier-policy.json`, `storybook/component-specs/*.json`, or `artifacts/storybook/proof-coverage.json` that changes the proof scope consumed by `CT-10B`.
    - Any CI topology or provider-transport change that bypasses `.github/workflows/ci.yml`, `pnpm storybook:build`, or the future `artifacts/chromatic/status.json` contract.
gates:
  pre_exec:
    review: passed
    contract: passed
    revalidation: failed
  post_exec:
    landing: pending
    closeout: pending
seam_exit_gate:
  required: true
  planned_location: S3
  status: pending
open_remediations:
  - REM-002
  - REM-005
---

# SEAM-8B — Branch-Aware Visual Review Convergence

## Seam Brief (Restated)

- **Seam ID**: `SEAM-8B`
- **Name**: Branch-Aware Visual Review Convergence
- **Goal / value**: turn the repo-owned Storybook proof contract into a branch-aware visual-review rail with one machine-readable status surface, so later mapping and promotion seams can distinguish reviewed reusable components from components that only built locally.
- **Type**: integration
- **Slicing strategy**: contract-first, because `SEAM-8B` owns `CT-10B`, blocks `SEAM-9B` and `SEAM-10B`, and must first freeze the generated status artifact, named check boundary, and review-scope semantics before a vendor-backed publish path can be trusted.
- **Scope**
  - **In**: the `CT-10B` payload contract at `artifacts/chromatic/status.json`; one repo-owned contract document and rollout policy for branch-aware visual review; CI ownership for a named `chromatic-review` status; a publish command that consumes the exact `pnpm storybook:build` revision selected by `CT-9B`; validator and fixture coverage for success, diff, skip, and failure outcomes.
  - **Out**: redesigning `CT-9B`; defining Storybook Connect or Code Connect outputs; reopening Figma publish or parity policy; making visual review universally blocking before downstream policy consumes it; final reusable-component promotion decisions.
- **Touch surface**: `.github/workflows/ci.yml`, `package.json`, `storybook/story-inventory.json`, `storybook/component-specs/**`, `storybook/chromatic-review-contract.md`, `storybook/chromatic-review-policy.md`, `scripts/lib/chromatic-status.mjs`, `scripts/validate-chromatic-status.mjs`, `scripts/fixtures/chromatic-status/**`, and generated `artifacts/chromatic/status.json`.
- **Verification**: a PR or branch run publishes the same proof-scoped Storybook revision selected by `CT-9B`, emits a named `chromatic-review` status, and writes `artifacts/chromatic/status.json` with branch, git revision, selected proof scope, build URL, review mode, and diff outcome; stale or missing status is detectable locally and in CI without reading vendor UI.
- **Basis posture**:
  - **Currentness**: `current`
  - **Upstream closeouts assumed**: inherited `SEAM-4` via `harness-convergence/threading.md`; `SEAM-5B` via the published Figma publish-proof contract and handoff boundary; `SEAM-6B` via `src/figma/sync-ledger.json` and parity-policy semantics; `SEAM-7B` via `harness-future-rails/governance/seam-7b-closeout.md` plus the landed `CT-9B` surfaces.
  - **Required threads**: `THR-02` is `revalidated`; seam-owned outbound `THR-03` and `THR-06` remain `identified` until `CT-10B` lands with evidence.
  - **Stale triggers**: the upstream `SEAM-7B` closeout still lacks the required realized `seam_exit_gate` record; the proof inventory, tier policy, component-spec shape, or proof-coverage report may drift; the current CI topology may change before a dedicated review owner is wired; the publish host may change as long as the repo-owned `CT-10B` schema stays stable.
- **Threading constraints**
  - **Upstream blockers**: landed `CT-9B` is available through `THR-02`; readiness remains blocked by `REM-005` until the upstream closeout records the required handoff.
  - **Downstream blocked seams**: `SEAM-9B`, `SEAM-10B`
  - **Contracts produced (owned)**: `CT-10B`
  - **Contracts consumed**: `CT-9B`

## Review Bundle

- [review.md](./review.md) — authoritative pre-exec review artifact for the active seam

## Seam-Exit Gate Plan

- **Planned location**: `S3`
- **Why this seam needs an explicit exit gate**: downstream `SEAM-9B` and `SEAM-10B` depend on a stable review URL, machine-readable status payload, and explicit optional-versus-claim-relevant policy; the closeout must publish those boundaries without vendor scraping.
- **Expected contracts to publish**: `CT-10B` rooted at `artifacts/chromatic/status.json`, the stable `chromatic-review` owner, and repo-owned contract or policy docs under `storybook/**`.
- **Expected threads to publish / advance**: publish `THR-03` with stable build URL and status fields for `SEAM-9B`; publish `THR-06` with review-mode semantics for `SEAM-10B`; keep `THR-02` revalidated while `CT-9B` remains current.
- **Likely downstream stale triggers**: provider transport or URL-shape changes, proof-scope drift from `CT-9B`, artifact freshness failures, or any attempt to read vendor-only status outside `CT-10B`.
- **Expected closeout evidence**: landed workflow owner, generated status artifacts or fixtures, validator output, named-check conclusion rules, and one downstream-readable closeout record that names the fields `SEAM-9B` and `SEAM-10B` may consume.

## Slice Index

- `S1` → [slice-1-ct-10b-contract-baseline.md](./slice-1-ct-10b-contract-baseline.md): freeze the repo-owned status schema, named-check boundary, and review-scope policy for `CT-10B`.
- `S2` → [slice-2-pilot-branch-review-publication.md](./slice-2-pilot-branch-review-publication.md): prove one pilot proof scope can publish branch-aware review from CI and emit the generated status artifact.
- `S3` → [slice-3-seam-exit-gate.md](./slice-3-seam-exit-gate.md): plan the validator, closeout evidence, and downstream handoff needed to publish `THR-03` and `THR-06`.

## Governance Pointers

- Pack remediation log: [../../governance/remediation-log.md](../../governance/remediation-log.md)
- Seam closeout: [../../governance/seam-8b-closeout.md](../../governance/seam-8b-closeout.md)

## Threading Alignment (mandatory)

- **Contracts produced (owned)**:
  - `CT-10B`: the repo-owned branch-aware visual-review status contract rooted at `artifacts/chromatic/status.json` plus the stable `chromatic-review` check boundary; `S1` freezes the payload and policy shape, `S2` proves status generation against a pilot proof scope, and `S3` adds validator and handoff evidence that later seams can consume without vendor scraping.
- **Contracts consumed**:
  - `CT-9B`: required from `SEAM-7B`; `S1.T1` and `S1.T3` define how proof inventory version, component IDs, story IDs, and review-required scope flow into `CT-10B`; `S2.T1` and `S2.T2` consume the published proof selection so the review rail builds and publishes the exact same revision.
- **Threads touched**:
  - `THR-02`: `revalidated`; the active seam already consumed the landed proof contract, and `S1.T3` plus `S2.T1` keep the pilot review subset aligned with that published contract.
  - `THR-03`: `identified`; `S1.T1`, `S2.T2`, and `S3.T3` advance it by freezing the build URL and status schema that `SEAM-9B` will later consume for Storybook linking.
  - `THR-06`: `identified`; `S1.T3`, `S2.T3`, and `S3.T2` advance it by making optional-versus-required review semantics explicit for reusable-component claims before `SEAM-10B` reads them.
- **Dependency edges honored**:
  - `SEAM-7B` no longer blocks contract input: `CT-9B` is landed and revalidated, but `REM-005` keeps readiness blocked until the prior closeout records the required seam-exit handoff.
  - `SEAM-8B` blocks `SEAM-9B`: `S2` and `S3` publish a stable build URL and generated status artifact before mapping or Storybook-link work may depend on them.
  - `SEAM-8B` blocks `SEAM-10B`: `S1.T3` and `S3.T2` freeze the review-mode semantics before promotion policy may treat visual review as claim-relevant.
- **Revalidation requirements**:
  - Reconfirm that `SEAM-7B` published the current `CT-9B` field names, tier policy, and pilot family the review rail should consume.
  - Reconfirm the current CI topology: `storybook-proof` governs `CT-9B`, `build-storybook` builds Storybook, and no branch-aware review owner exists yet.
  - Reconfirm whether the publish transport remains Chromatic for the first landing; if it changes, preserve the `CT-10B` schema and named-check contract.
  - Reconfirm that no downstream seam has started projecting build URLs or review status directly from vendor state outside `artifacts/chromatic/status.json`.
- **Parallelization notes**:
  - **What can proceed now**: `S1` can settle contract and policy wording immediately; fixture design and validator scaffolding can begin in parallel because `CT-9B` is already landed and revalidated.
  - **What must wait**: `S2` should not wire a provider-backed publish path until `S1` freezes the contract and policy; `S3.T2` may not ratchet any status semantics into required territory until the pilot artifact is stable and downstream consumers confirm they can read it.
