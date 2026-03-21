---
seam_id: SEAM-10B
seam_slug: reusable-component-promotion-convergence
status: decomposed
execution_horizon: next
plan_version: v1
basis:
  currentness: provisional
  source_seam_brief: ../../seam-10b-reusable-component-promotion-convergence.md
  source_scope_ref: ../../scope_brief.md
  upstream_closeouts:
    - SEAM-6B
    - SEAM-7B
    - SEAM-8B
  required_threads:
    - THR-05
    - THR-06
    - THR-07
    - THR-08
  stale_triggers:
    - Any change to `src/figma/sync-ledger.json`, parity-mode policy, or `CT-8B` claim semantics that alters what reusable-component promotion may say about Figma parity.
    - Any change to `storybook/story-inventory.json`, `storybook/component-specs/*.json`, `artifacts/storybook/proof-coverage.json`, or component-tier policy that alters the proof coverage or reusable-component identity fields carried by `CT-9B`.
    - Any change to `artifacts/chromatic/status.json`, `storybook/chromatic-review-contract.md`, `storybook/chromatic-review-policy.md`, or the `CT-10B` field-consumption boundary that changes review freshness, scope, or build URL semantics.
    - Any `SEAM-9B` closeout delta that reopens `THR-07`, changes the `CT-11B` field boundary, or leaves mapping completeness non-consumable for downstream promotion policy.
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
  - REM-004
---

# SEAM-10B - Reusable Component Promotion Convergence

## Seam Brief (Restated)

- **Goal / value**: publish one repo-owned promotion-status contract that lets maintainers, policy consumers, and AI agents determine the highest earned reusable-component claim from current proof, review, mapping, and parity evidence without reading prose or broadening that rigor to unrelated changes.
- **Type**: conformance
- **Slicing strategy**: contract-first, because `SEAM-10B` owns undefined `CT-12B`, must scope change-class-specific claim rules before any consumer may enforce them, and must consume the published `CT-11B` boundary without reopening `SEAM-9B`.
- **Scope**
  - **In**: the repo-owned `CT-12B` artifact at `artifacts/harness/reusable-component-status.json`; claim-level policy for reusable-component advancement versus narrower change classes; informational-versus-blocking mode semantics; upstream-status provenance and freshness rules for `CT-8B`, `CT-9B`, `CT-10B`, and `CT-11B`; local, CI, PR or handoff, and release-consumer boundaries for reusable-component promotion.
  - **Out**: changing `CT-8B`, `CT-9B`, `CT-10B`, or `CT-11B`; broadening full reusable-component rigor to token-only, docs-only, or proof-only changes; reopening Figma parity semantics; implementing upstream proof, review, or mapping rails; vendor-specific status scraping outside repo-owned contracts.
- **Touch surface**: `artifacts/harness/reusable-component-status.json`, promotion-policy docs, local or CI validator entrypoints, merge or handoff or release policy wiring, and any repo-owned fixtures or reports needed to prove claim scoping and refusal behavior.
- **Verification**: maintainers can determine the highest earned reusable-component level from one machine-readable surface; refusal states name the missing, stale, or deferred upstream rail directly; informational mode and blocking mode are distinct; token-only or docs-only changes do not inherit reusable-component requirements accidentally.
- **Basis posture**:
  - **Currentness**: `provisional`
  - **Upstream closeouts assumed**: `SEAM-6B`, `SEAM-7B`, `SEAM-8B`, and `SEAM-9B` are published basis; `harness-future-rails/governance/seam-9b-closeout.md` dated March 21, 2026 records `CT-11B` published and `THR-07` ready for downstream consumption.
  - **Required threads**: `THR-05`, `THR-06`, `THR-07`, and `THR-08` are published side inputs. The seam remains `provisional` because consumer ratchets and pack closeout are still owned here, not because mapping is unpublished.
  - **Stale triggers**: any drift in parity semantics, proof coverage policy, visual-review field boundaries, or `CT-11B` mapping completeness rules; any `SEAM-9B` closeout delta that reopens or narrows the published mapping basis.
- **Threading constraints**
  - **Upstream blockers**: none at the contract-publication layer. `SEAM-9B` is now landed basis; this seam must consume that closeout rather than treating mapping as planning-only input.
  - **Downstream blocked seams**: none; this seam hands off to policy consumers and pack closeout rather than a later seam.
  - **Contracts produced**: `CT-12B`
  - **Contracts consumed**: `CT-8B`, `CT-9B`, `CT-10B`, `CT-11B`

## Review Bundle

- `review.md` is the authoritative artifact for `gates.pre_exec.review`
- `../../review_surfaces.md` is supportive orientation only and does not replace the seam-local gate artifact

## Seam-Exit Gate Plan

- **Planned location**: `S4` -> `slice-4-seam-exit-gate.md`
- **Why this seam needs an explicit exit gate**: this is the pack's final seam. Pack closeout, merge or handoff or release policy consumers, and AI-facing promotion answers all need a closeout-backed statement that `CT-12B` is published, which upstream rails became claim-relevant, and which blocker or stale-trigger branches still prevent a full reusable-component harness claim.
- **Expected contracts to publish**: `CT-12B` at `artifacts/harness/reusable-component-status.json` plus repo-owned policy or validator surfaces that define claim profiles, refusal semantics, and informational-versus-blocking boundaries.
- **Expected threads to publish / advance**: no new downstream seam thread is created here; instead this seam must consume `THR-05`, `THR-06`, `THR-07`, and `THR-08` against their recorded states and make that consumption boundary explicit for pack closeout and policy consumers.
- **Likely downstream stale triggers**: any change to parity semantics, proof coverage or component-tier rules, visual-review policy or status schema, mapping completeness rules, or change-class scoping for reusable-component advancement.
- **Expected closeout evidence**: a landed `CT-12B` artifact, policy-consumer guidance for informational versus blocking use, explicit evidence of which upstream revisions were consumed, and a closeout-backed readiness statement for pack completion or blocker carry-forward.

## Slice Index

- `S1` -> `slice-1-ct-12b-contract-and-claim-matrix-baseline.md`
- `S2` -> `slice-2-informational-status-evaluator-and-refusal-semantics.md`
- `S3` -> `slice-3-consumer-gating-and-ratchet-boundaries.md`
- `S4` -> `slice-4-seam-exit-gate.md`

## Governance Pointers

- Pack remediation log: `../../governance/remediation-log.md`
- Seam closeout: `../../governance/seam-10b-closeout.md`

## Threading Alignment

- **Contracts produced (owned)**:
  - `CT-12B`: the repo-owned reusable-component promotion-status contract rooted at `artifacts/harness/reusable-component-status.json`; `S1` freezes the schema, provenance, and claim matrix, `S2` plans the informational evaluator and refusal taxonomy, and `S3` freezes which consumers may read or enforce the resulting claims.
- **Contracts consumed**:
  - `CT-8B`: published Figma parity status and claim semantics from `src/figma/sync-ledger.json`; consumed as a side input for parity-sensitive reusable-component claims and as a refusal reason when parity is stale or insufficient.
  - `CT-9B`: published proof coverage and component metadata from `storybook/story-inventory.json`, `storybook/component-specs/*.json`, and `artifacts/storybook/proof-coverage.json`; consumed so `CT-12B` can distinguish story existence from required proof coverage.
  - `CT-10B`: published branch-aware review status and review-mode semantics from `artifacts/chromatic/status.json` plus the repo-owned contract or policy docs; consumed so reusable-component promotion may distinguish reviewed proof from proof that only builds.
  - `CT-11B`: mapping completeness and link metadata owned by `SEAM-9B`; consumed as current published basis through `artifacts/harness/reusable-component-mapping-status.json` and the March 21, 2026 seam closeout.
- **Threads touched**:
  - `THR-05`: `published`; `S1` and `S2` consume the current Figma parity boundary without reopening `WS-6B`.
  - `THR-06`: `published`; `S1` and `S3` consume review-mode and optionality semantics so `CT-12B` can separate informational review status from claim-relevant required review.
  - `THR-07`: `published`; this seam may consume mapping completeness as current basis, while keeping blocking consumer ratchets scoped to `S3`.
  - `THR-08`: `published`; `S1` and `S2` consume proof-coverage evidence instead of treating story existence as enough for promotion.
- **Dependency edges honored**:
  - `SEAM-6B`, `SEAM-7B`, and `SEAM-8B` are published side inputs and may be consumed as current basis unless their documented stale triggers fire.
  - `SEAM-9B` no longer blocks `SEAM-10B` at the contract layer: `CT-11B` is published basis, but consumer blocking ratchets still require `S3` and seam-exit evidence from this seam.
  - There is no downstream seam after `SEAM-10B`; instead this seam must publish a pack-closeout-consumable handoff for policy consumers.
- **Revalidation requirements**:
  - Reconfirm that `../../governance/seam-9b-closeout.md` records `seam_exit_gate.status: passed`, `promotion_readiness: ready`, and `THR-07` as `published` before promoting this seam past `decomposed`.
  - Reconfirm that `CT-8B`, `CT-9B`, and `CT-10B` still expose the same field boundaries and freshness expectations documented in `threading.md`.
  - Reconfirm that no merge, handoff, or release consumer already reads a stronger reusable-component claim surface outside the planned `CT-12B` contract.
- **Parallelization notes**:
  - **What can proceed now**: contract scoping, claim-matrix design, evaluator semantics, refusal taxonomy, and consumer-boundary planning against published `CT-8B`, `CT-9B`, `CT-10B`, and `CT-11B`.
  - **What must wait**: blocking promotion policy and pack-closeout readiness must still wait for `S3`/`S4`, even though current `CT-11B` evidence is now consumable.
  - **Candidate subslices**: none are admitted in this seam. Every planned slice either publishes authoritative `CT-12B` truth or changes promotion policy, which the provisional candidate-subslice matrix disqualifies for `execution_horizon: next`.
