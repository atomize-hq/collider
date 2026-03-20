---
seam_id: SEAM-7B
seam_slug: storybook-proof-system-convergence
status: exec-ready
execution_horizon: active
plan_version: v1
basis:
  source_seam_brief: ../../seam-7b-storybook-proof-system-convergence.md
  source_scope_ref: ../../scope_brief.md
  upstream_closeouts:
    - SEAM-4
    - SEAM-5B
    - SEAM-6B
  required_threads:
    - THR-01
gates:
  review: pending-human-review
  contract: pending
  revalidation: pending
  landing: pending
  closeout: pending
open_remediations:
  - REM-001
---

# SEAM-7B — Storybook Proof System Convergence

## Seam Brief (Restated)

- **Seam ID**: `SEAM-7B`
- **Name**: Storybook Proof System Convergence
- **Goal / value**: freeze one repo-owned proof metadata contract for Storybook so later rails can consume explicit component identity, required coverage, and proof-story ownership instead of inferring them from stories or vendor state.
- **Type**: conformance
- **Slicing strategy**: contract-first, because `SEAM-7B` owns `CT-9B`, blocks `SEAM-8B`/`SEAM-9B`/`SEAM-10B`, and must publish concrete proof metadata before any downstream review or mapping rail can become required.
- **Scope**
  - **In**: `storybook/story-inventory.json`; `storybook/component-specs/<component-id>.json`; the validator kind vocabulary already named in `threading.md`; the component-tier coverage policy; proof-story ownership for generated token docs, recipe docs, runtime parity stories, and reusable-component proof stories; validator and review expectations that make missing proof coverage inspectable.
  - **Out**: branch-aware visual-review publication or status artifacts; Chromatic policy; Storybook Connect or Code Connect projections; final promotion enforcement; any change to canonical token or recipe ownership carried by `CT-H1`/`CT-H2`.
- **Touch surface**: `storybook/stories/**`, `storybook/story-inventory.json`, `storybook/component-specs/**`, Storybook proof docs that consume generated artifacts, and local validators or loaders under `scripts/**` plus `src/lib/tokens/**`.
- **Verification**: the inventory validates structurally; each reusable component in the pilot family has a concrete component-spec record; required proof stories exist for the pilot family and point at generated token or recipe truth instead of copying it; maintainers can detect missing coverage from validator output without prose.
- **Basis / revalidation posture**:
  - **Status**: `current`
  - **Basis version**: pack `v1`, seam brief `v1`, and `harness-future-rails/threading.md` as the authoritative control plane.
  - **Upstream closeouts assumed**: inherited `SEAM-4` via `harness-convergence/threading.md`; `SEAM-5B` via `harness-convergence/threaded-seams/seam-5b-figma-publish-rail-convergence/seam.md`; `SEAM-6B` via `harness-convergence/threaded-seams/seam-6b-verification-and-promotion-convergence/seam.md`.
  - **Required threads + states**: `THR-01` is `published` and must remain stable; `THR-02`, `THR-04`, and `THR-08` are seam-owned outbound threads that start as `identified` and only advance once `CT-9B` is concrete and inspectable.
  - **Likely stale-plan risks**: Storybook proof-story organization may drift from the `THR-01` basis before implementation starts; the validator kind set named in `threading.md` may expand if upstream Storybook policy changes; `harness-convergence/` does not expose dedicated seam closeout files for `SEAM-5B` or `SEAM-6B`, so implementation should revalidate against the latest landed artifact paths and ledger semantics before the first PR.
- **Threading constraints**
  - **Upstream blockers**: inherited `SEAM-4` via `THR-01`
  - **Downstream blocked seams**: `SEAM-8B`, `SEAM-9B`, `SEAM-10B`
  - **Contracts produced (owned)**: `CT-9B`
  - **Contracts consumed**: `CT-H1`, `CT-H2`

## Review Bundle

- [review.md](./review.md) — detailed product/work review surfaces for the active seam

## Slice Index

- `S1` → [slice-1-ct-9b-contract-baseline.md](./slice-1-ct-9b-contract-baseline.md): freeze the inventory, component-spec, and coverage-policy shape for `CT-9B`.
- `S2` → [slice-2-pilot-proof-adoption.md](./slice-2-pilot-proof-adoption.md): backfill one pilot reusable-component family so the new contract is proven against real proof stories.
- `S3` → [slice-3-proof-conformance-and-gating.md](./slice-3-proof-conformance-and-gating.md): make proof coverage inspectable, then ratchet the validator from informational to required before `SEAM-8B` consumes it.

## Governance Pointers

- Pack remediation log: [../../governance/remediation-log.md](../../governance/remediation-log.md)
- Seam closeout: [../../governance/seam-7b-closeout.md](../../governance/seam-7b-closeout.md)

## Threading Alignment (mandatory)

- **Contracts produced (owned)**:
  - `CT-9B`: repo-owned Storybook proof metadata contract rooted at `storybook/story-inventory.json` plus `storybook/component-specs/<component-id>.json`; `S1` freezes the schema and coverage-policy boundary, `S2` proves it against a pilot family, and `S3` adds validator and reporting behavior that makes the contract inspectable for later seams.
- **Contracts consumed**:
  - `CT-H1`: inherited canonical-source boundary from `SEAM-1`/`SEAM-2`; consumed in `S1.T1`, `S1.T2`, and `S2.T2` so proof metadata points at canonical generated artifacts and never stores token or recipe truth locally.
  - `CT-H2`: inherited derived-projection boundary from `SEAM-3`; consumed in `S1.T1`, `S1.T2`, and `S2.T2` so proof stories and component specs reference generated CSS, typed artifacts, Figma token projections, token docs, and recipe docs without redefining them.
- **Threads touched**:
  - `THR-01`: `published`; `S1.T1` and `S2.T2` revalidate that current proof-story surfaces still match the inherited Storybook consumption basis before `CT-9B` is frozen.
  - `THR-02`: `identified`; `S1.T1`, `S1.T3`, and `S3.T3` advance it by publishing an explicit proof inventory, required coverage policy, and a required validator gate that `SEAM-8B` can consume.
  - `THR-04`: `identified`; `S1.T2` and `S2.T1` advance it by freezing reusable-component identity plus downstream mapping hooks inside repo-owned component specs.
  - `THR-08`: `identified`; `S1.T3` and `S3.T2` advance it by turning required story coverage into a machine-readable report surface that later promotion work can consume.
- **Dependency edges honored**:
  - inherited `SEAM-4` blocks `SEAM-7B`: every slice treats the current Storybook consumption posture as basis and avoids redefining runtime or Storybook projection ownership.
  - `SEAM-7B` blocks `SEAM-8B`: `S3` must land a concrete proof inventory and validator gate before branch-aware visual review can freeze review selection.
  - `SEAM-7B` blocks `SEAM-9B`: `S1` and `S2` must freeze component identity plus downstream hooks before mapping or link projections may start owning them.
  - `SEAM-7B` blocks `SEAM-10B`: `S1.T3` and `S3.T2` must make required proof coverage explicit before promotion can treat coverage as required.
- **Revalidation requirements**:
  - Reconfirm that the validator kind set in `threading.md` still matches the repo’s current Storybook review vocabulary.
  - Reconfirm that generated token docs, recipe docs, and runtime parity stories still live at the paths this plan assumes.
  - Reconfirm that no downstream seam has already started publishing parallel identity or coverage metadata outside `storybook/story-inventory.json` or `storybook/component-specs/**`.
- **Parallelization notes**:
  - **What can proceed now**: `S1` can start immediately; `S3.T1` can sketch validator mechanics once `S1.T1` and `S1.T2` freeze the schema; pilot-family discovery for `S2` can happen in parallel with `S1`.
  - **What must wait**: `S2` should not author pilot metadata until `S1.T1` and `S1.T2` freeze the contract shape; `S3.T3` should not ratchet the gate to required until pilot coverage is green; `SEAM-8B`, `SEAM-9B`, and `SEAM-10B` must wait for `CT-9B` to publish with evidence rather than draft prose.
