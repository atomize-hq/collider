---
seam_id: SEAM-8B
seam_slug: branch-aware-visual-review-convergence
status: provisional
execution_horizon: next
plan_version: v1
basis:
  source_seam_brief: ../../seam-8b-branch-aware-visual-review-convergence.md
  source_scope_ref: ../../scope_brief.md
  upstream_closeouts:
    - SEAM-5B
    - SEAM-6B
  required_threads:
    - THR-02
gates:
  review: pending-human-review
  contract: pending
  revalidation: pending
  landing: pending
  closeout: pending
open_remediations:
  - REM-002
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
- **Basis / revalidation posture**:
  - **Status**: `provisional`
  - **Basis version**: pack `v1`, seam brief `v1`, and `harness-future-rails/threading.md` as the authoritative control plane.
  - **Upstream closeouts assumed**: inherited `SEAM-4` via `harness-convergence/threading.md`; `SEAM-5B` via the published Figma publish-proof contract and handoff boundary; `SEAM-6B` via `src/figma/sync-ledger.json` and parity-policy semantics.
  - **Required threads + states**: `THR-02` is still `identified` and must publish `CT-9B` before execution starts; seam-owned outbound `THR-03` and `THR-06` start as `identified` and advance only after the review artifact schema, build URL shape, and rollout semantics land with evidence.
  - **Likely stale-plan risks**: `SEAM-7B` may still change proof-inventory fields, component-tier policy, or pilot-family scope before `CT-9B` publishes; the current CI topology is build-only and may shift before a dedicated review job is wired; the host-of-record may remain Chromatic or move to an equivalent provider, so `CT-10B` must stay repo-owned and backwards-compatible if the transport changes.
- **Threading constraints**
  - **Upstream blockers**: `SEAM-7B` via `THR-02`; inherited `SEAM-4` basis remains indirect via `CT-9B`.
  - **Downstream blocked seams**: `SEAM-9B`, `SEAM-10B`
  - **Contracts produced (owned)**: `CT-10B`
  - **Contracts consumed**: `CT-9B`

## Review Bundle

- [review.md](./review.md) — detailed product/work review surfaces for the next seam

## Slice Index

- `S1` → [slice-1-ct-10b-contract-baseline.md](./slice-1-ct-10b-contract-baseline.md): freeze the repo-owned status schema, named-check boundary, and review-scope policy for `CT-10B`.
- `S2` → [slice-2-pilot-branch-review-publication.md](./slice-2-pilot-branch-review-publication.md): prove one pilot proof scope can publish branch-aware review from CI and emit the generated status artifact.
- `S3` → [slice-3-review-conformance-and-handoff.md](./slice-3-review-conformance-and-handoff.md): validate freshness and failure semantics, then harden the downstream handoff that advances `THR-03` and `THR-06`.

## Governance Pointers

- Pack remediation log: [../../governance/remediation-log.md](../../governance/remediation-log.md)
- Seam closeout: [../../governance/seam-8b-closeout.md](../../governance/seam-8b-closeout.md)

## Threading Alignment (mandatory)

- **Contracts produced (owned)**:
  - `CT-10B`: the repo-owned branch-aware visual-review status contract rooted at `artifacts/chromatic/status.json` plus the stable `chromatic-review` check boundary; `S1` freezes the payload and policy shape, `S2` proves status generation against a pilot proof scope, and `S3` adds validator and handoff evidence that later seams can consume without vendor scraping.
- **Contracts consumed**:
  - `CT-9B`: required from `SEAM-7B`; `S1.T1` and `S1.T3` define how proof inventory version, component IDs, story IDs, and review-required scope flow into `CT-10B`; `S2.T1` and `S2.T2` consume the published proof selection so the review rail builds and publishes the exact same revision.
- **Threads touched**:
  - `THR-02`: `identified`; this plan may only become exec-ready after `SEAM-7B` publishes `CT-9B`, and `S1.T3` plus `S2.T1` revalidate the pilot review subset against that published contract.
  - `THR-03`: `identified`; `S1.T1`, `S2.T2`, and `S3.T3` advance it by freezing the build URL and status schema that `SEAM-9B` will later consume for Storybook linking.
  - `THR-06`: `identified`; `S1.T3`, `S2.T3`, and `S3.T2` advance it by making optional-versus-required review semantics explicit for reusable-component claims before `SEAM-10B` reads them.
- **Dependency edges honored**:
  - `SEAM-7B` blocks `SEAM-8B`: no execution task starts until `CT-9B` publishes and the review-scope policy is revalidated against the final proof inventory.
  - `SEAM-8B` blocks `SEAM-9B`: `S2` and `S3` publish a stable build URL and generated status artifact before mapping or Storybook-link work may depend on them.
  - `SEAM-8B` blocks `SEAM-10B`: `S1.T3` and `S3.T2` freeze the review-mode semantics before promotion policy may treat visual review as claim-relevant.
- **Revalidation requirements**:
  - Reconfirm that `SEAM-7B` published the final `CT-9B` field names, tier policy, and pilot family the review rail should consume.
  - Reconfirm the current Storybook build command and CI job topology before wiring a dedicated review job or named check.
  - Reconfirm whether the publish transport remains Chromatic for the first landing; if it changes, preserve the `CT-10B` schema and named-check contract.
  - Reconfirm that no downstream seam has started projecting build URLs or review status directly from vendor state outside `artifacts/chromatic/status.json`.
- **Parallelization notes**:
  - **What can proceed now**: `S1` can settle contract and policy wording while `SEAM-7B` finalizes `CT-9B`; fixture design and validator scaffolding can begin in parallel as long as they stay provisional and are revalidated once `CT-9B` publishes.
  - **What must wait**: `S2` may not wire the pilot publish path until `THR-02` becomes consumable; `S3.T2` may not ratchet any status semantics into required territory until the pilot artifact is stable and downstream consumers confirm they can read it.
