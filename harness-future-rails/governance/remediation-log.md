# Remediation Log - Harness Future Rails

## Open remediations

- **REM-001**
  - Source gate: contract
  - Related seam/slice/thread/contract: `SEAM-7B`, `CT-9B`, `THR-02`, `THR-04`, `THR-08`
  - Severity: blocking
  - Finding: the repo has proof stories and validators, but it does not yet have a repo-owned proof inventory or reusable-component metadata contract that later seams can consume.
  - Required fix: publish `CT-9B` with concrete `storybook/story-inventory.json` and `storybook/component-specs/**` schema, plus required story-kind policy by component tier.
  - Owner: future `WS-7B`
  - Status: open
  - Must close before: `SEAM-8B` may enter detailed decomposition

- **REM-002**
  - Source gate: review
  - Related seam/slice/thread/contract: `SEAM-8B`, `CT-10B`, `THR-03`, `THR-06`
  - Severity: important
  - Finding: Storybook builds exist, but there is no machine-readable branch-aware visual review status artifact for future promotion or link surfaces to consume.
  - Required fix: publish a named review status contract with generated build URL and diff outcome semantics.
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

- None yet.
