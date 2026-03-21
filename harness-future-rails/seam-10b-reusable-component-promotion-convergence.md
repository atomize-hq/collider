---
seam_id: SEAM-10B
seam_slug: reusable-component-promotion-convergence
type: conformance
status: proposed
execution_horizon: next
plan_version: v1
basis:
  source_scope_ref: scope_brief.md
  source_scope_version: v1
  upstream_closeouts:
    - SEAM-6B
  required_threads:
    - THR-05
    - THR-06
    - THR-07
    - THR-08
gates:
  review: pending
  contract: pending
  revalidation: pending
  landing: pending
  closeout: pending
open_remediations:
  - REM-004
---

# SEAM-10B — Reusable Component Promotion Convergence

- **Goal / user value**: extend the promotion model so reusable-component advancement can require current proof coverage, visual review status, mapping completeness, and Figma parity without forcing those rails onto unrelated changes.
- **Scope**
  - In: claim matrix for reusable-component advancement; machine-readable status at `artifacts/harness/reusable-component-status.json`; local, CI, PR or handoff, and release policy consumers for the future rails; explicit distinction between informational status and blocking promotion authority.
  - Out: implementing the upstream proof, review, or mapping rails themselves; reopening Figma parity rules; forcing the same requirement set onto token-only or documentation-only changes.
- **Primary interfaces (contracts)**
  - Inputs:
    - `CT-8B`
    - `CT-9B`
    - `CT-10B`
    - `CT-11B`
  - Outputs:
    - `CT-12B`
- **Key invariants / rules**:
  - reusable-component promotion consumes upstream status contracts; it does not redefine them
  - optional rails stay explicitly optional until policy promotes them to required for the relevant claim
  - a stronger claim may not be emitted than the combined status surfaces actually support
  - token-only, docs-only, or proof-surface-only changes may use a narrower gate profile than reusable-component advancement
- **Dependencies**
  - Direct blockers:
    - `SEAM-6B`
    - `SEAM-7B`
    - `SEAM-8B`
    - `SEAM-9B`
  - Transitive blockers:
    - `SEAM-5B`
  - Direct consumers:
    - merge policy
    - handoff policy
    - release policy
  - Derived consumers:
    - AI agents answering whether a reusable component is fully promotable
    - maintainers deciding whether a component has earned the highest available level
- **Touch surface**: `artifacts/harness/reusable-component-status.json`, policy and validator scripts, CI gate wiring, promotion documentation that references the new status contract
- **Verification**: maintainers can determine the highest earned reusable-component level without reading prose; failure cases name which upstream status is missing or stale; informational mode and blocking mode are distinguishable.
- **Risks / unknowns**
  - Risk: the final policy becomes too broad and blocks changes that do not need full reusable-component rigor.
  - De-risk plan: scope the policy explicitly to reusable-component advancement and keep narrower change classes on smaller gate profiles.
  - Risk: the promotion status duplicates upstream state instead of consuming it.
  - De-risk plan: require the final status artifact to reference upstream status records by revision and current outcome.
- **Rollout / safety**: start with informational status only, then promote selected claims to blocking once the published `CT-9B`, `CT-10B`, and `CT-11B` inputs remain stable and `S3` defines the consumer ratchet explicitly.
- **Downstream decomposition context**: this is now the next seam because `SEAM-9B` is landed basis and the remaining work is convergence: consuming `CT-11B` through one repo-owned evaluator, then defining consumer ratchets and seam-exit evidence without reopening upstream contract ownership.
