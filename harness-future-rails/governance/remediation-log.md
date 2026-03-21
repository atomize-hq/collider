# Remediation Log - Harness Future Rails

## Open remediations

- **REM-002**
  - Source gate: review
  - Related seam/slice/thread/contract: `SEAM-8B`, `CT-10B`, `THR-03`, `THR-06`
  - Severity: important
  - Finding: `CT-9B` is now landed and consumable, but the repo still has only `pnpm storybook:build` plus the `build-storybook` CI job; there is no repo-owned `CT-10B` contract document, `chromatic-review` owner, normalizer, validator, or generated branch-aware visual review artifact for downstream seams to consume.
  - Required fix: publish the repo-owned `CT-10B` contract, policy, named review owner, and generated status artifact with build URL and diff outcome semantics.
  - Owner: future `WS-8B`
  - Status: open
  - Must close before: `SEAM-10B` may require visual review for reusable-component advancement

- **REM-003**
  - Source gate: contract
  - Related seam/slice/thread/contract: `SEAM-9B`, `CT-11B`, `THR-07`
  - Severity: important
  - Finding: the repo has no repo-owned reusable-component mapping or link contract for future Code Connect and Storybook Connect style rails.
  - Required fix: define the repo-owned identity and projection rules that can generate mapping and link metadata without vendor-authored truth.
  - Owner: future `WS-9B`
  - Status: open
  - Must close before: reusable-component mapping or link claims may become promotion-relevant

- **REM-004**
  - Source gate: closeout
  - Related seam/slice/thread/contract: `SEAM-10B`, `CT-12B`, `THR-05`, `THR-06`, `THR-07`, `THR-08`
  - Severity: follow-up
  - Finding: the current promotion model stops at Figma parity and does not yet define how future rails become required for reusable-component advancement.
  - Required fix: publish claim-level policy that consumes upstream proof, review, mapping, and parity status without broadening those requirements to unrelated changes.
  - Owner: future `WS-10B`
  - Status: open
  - Must close before: the pack can claim a complete reusable-component harness

## Resolved remediations

- **REM-005**
  - Origin phase: pre_exec
  - Source gate: revalidation
  - Related seam/slice/thread/contract: `SEAM-8B`, `THR-02`, `CT-9B`, `harness-future-rails/governance/seam-7b-closeout.md`
  - Severity: blocking
  - Finding: `SEAM-7B` landed `CT-9B`, but its closeout did not record the realized `seam_exit_gate` status, promotion-readiness signal, or downstream stale-trigger disposition required by the v2.3 promotion rules. `SEAM-8B` could keep an active planning window with a current basis, but it could not pass pre-exec revalidation or move to `exec-ready` until that upstream handoff record existed.
  - Required fix: backfill the realized `seam_exit_gate` record and downstream stale-trigger or remediation disposition in `harness-future-rails/governance/seam-7b-closeout.md` without changing the landed `CT-9B` facts.
  - Owner: `WS-INT`
  - Status: resolved
  - Must close before: `exec-ready`
  - Resolution evidence: `harness-future-rails/governance/seam-7b-closeout.md`

- **REM-001**
  - Source gate: contract
  - Related seam/slice/thread/contract: `SEAM-7B`, `CT-9B`, `THR-02`, `THR-04`, `THR-08`
  - Severity: blocking
  - Finding: the repo had proof stories and validators, but it did not yet have a repo-owned proof inventory or reusable-component metadata contract that later seams could consume.
  - Required fix: publish `CT-9B` with concrete `storybook/story-inventory.json` and `storybook/component-specs/**` schema, plus required story-kind policy by component tier.
  - Owner: `WS-7B`
  - Status: resolved
  - Resolution evidence: `pnpm govern:storybook-proof`, `artifacts/storybook/proof-coverage.json`, `harness-future-rails/governance/seam-7b-closeout.md`
