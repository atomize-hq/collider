# Remediation Log - Harness Future Rails

## Open remediations

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

- **REM-003**
  - Source gate: closeout
  - Related seam/slice/thread/contract: `SEAM-9B`, `CT-11B`, `THR-07`
  - Severity: important
  - Finding: the repo-owned `CT-11B` contract, pilot projection outputs, and validation/reporting entrypoints were landed, but the pilot mapping remained incomplete until current repo-owned `CT-10B` publication evidence existed for the same proof scope.
  - Required fix: restore the `CHROMATIC_PROJECT_TOKEN` secret or otherwise restore current repo-owned `CT-10B` publication evidence, rerun the `chromatic-review` owner until `artifacts/chromatic/status.json` or `chromatic-status-<sha>` exists, then regenerate and validate the mapping outputs until `THR-07` is publishable.
  - Owner: `WS-9B`
  - Status: resolved
  - Must close before: `SEAM-9B` closeout may claim `CT-11B` published or advance `THR-07`
  - Resolution evidence: `chromatic-status-e4a9f4f4e0a9dd75744a80cfe6a323882855c16e` from GitHub Actions run `23382758983`, `artifacts/chromatic/status.json`, `pnpm restore:chromatic-status --sha e4a9f4f4e0a9dd75744a80cfe6a323882855c16e`, `pnpm validate:chromatic-status`, `pnpm generate:component-mapping`, `pnpm validate:reusable-component-mapping`, `storybook/connect/button.json`, `figma/code-connect/button.json`, `artifacts/harness/reusable-component-mapping-status.json`, `harness-future-rails/governance/seam-9b-closeout.md`

- **REM-002**
  - Source gate: review
  - Related seam/slice/thread/contract: `SEAM-8B`, `CT-10B`, `THR-03`, `THR-06`
  - Severity: important
  - Finding: `CT-9B` is now landed and consumable, but the repo still has only `pnpm storybook:build` plus the `build-storybook` CI job; there is no repo-owned `CT-10B` contract document, `chromatic-review` owner, normalizer, validator, or generated branch-aware visual review artifact for downstream seams to consume.
  - Required fix: publish the repo-owned `CT-10B` contract, policy, named review owner, and generated status artifact with build URL and diff outcome semantics.
  - Owner: `WS-8B`
  - Status: resolved
  - Must close before: `SEAM-10B` may require visual review for reusable-component advancement
  - Resolution evidence: `storybook/chromatic-review-contract.md`, `storybook/chromatic-review-policy.md`, `scripts/lib/chromatic-status.mjs`, `scripts/lib/chromatic-status-validator.mjs`, `scripts/validate-chromatic-status.mjs`, `.github/workflows/ci.yml`, `artifacts/chromatic/status.json`, `harness-future-rails/governance/seam-8b-closeout.md`

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
