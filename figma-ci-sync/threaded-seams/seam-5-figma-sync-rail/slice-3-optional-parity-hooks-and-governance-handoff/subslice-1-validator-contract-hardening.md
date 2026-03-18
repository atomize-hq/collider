### S3a — Validator Contract Hardening

- **User/system value**: make the `CT-7` ledger contract machine-checkable before governance consumes it.
- **Scope (in/out)**:
  - In: mode-aware validation in `scripts/validate-sync-ledger.mjs`; required `syncMode`, `artifactPath`, pilot linkage, and `parityMode` fields in `src/figma/sync-ledger.json`; deterministic valid and invalid ledger exercises.
  - Out: `package.json`, `justfile`, CI wiring, parity-policy branch prose, or live Figma API reachability.
- **Acceptance criteria**:
  - `scripts/validate-sync-ledger.mjs` exits non-zero when required `CT-7` fields are missing.
  - The validator rejects contradictory states such as `syncMode=pull-url-readonly` paired with `canonicalSource` metadata claiming Figma authored the latest canonical change.
  - Happy-path ledgers still validate deterministically from the command line.
- **Dependencies**:
  - `S1`
  - `SEAM-3/CT-5`
- **Parallelization note**: `S3a` can start once `S1.T2` has seeded the ledger shape. It does not wait for `S2` pilot execution, but it must accept the additional `themeMapping`, `artifactGitSha`, and `lastSuccessfulPullAt` values that `S2` later fills into the same schema.
- **Verification**:
  - Run `node scripts/validate-sync-ledger.mjs src/figma/sync-ledger.json`.
  - Run the validator against one missing-field ledger copy and one contradictory-mode ledger copy.
- **Rollout/safety**:
  - Keep checks limited to settled v1 contract invariants.
  - Do not add network reachability or CI ownership here.

#### S3.T1 — Extend ledger validation for mode-specific `CT-7` fields

- **Outcome**: the existing sync-ledger validator can enforce the minimum fields and contradictions that matter for the settled Figma sync contract.
- **Files**:
  - `scripts/validate-sync-ledger.mjs`
  - `src/figma/sync-ledger.json`
- **Validator assertions owned here**:
  - Require `ledgerVersion="1"` and `scope="figma-pilot"`.
  - Require `links.figmaFile`, `links.artifact`, `links.policy`, and `links.parityPolicy`.
  - Require `status.syncMode="pull-url-readonly"`, `status.artifactPath="design-tokens/dist/figma/tokens.json"`, `status.artifactGitSha`, `status.themeIds`, `status.themeMapping`, `status.parityMode`, `status.lastSuccessfulPullAt|nullable`, and `status.canonicalSource="repo-pr"`.
  - Require `status.parityDeferredReason` when `status.parityMode="deferred"` and reject it when `status.parityMode="required"`.
  - Require every `drift[]` entry to carry `code`, `severity`, `message`, and `status`, and reject unknown `severity` or `status` values.

Checklist:

- Implement:
  - Update `scripts/validate-sync-ledger.mjs` with the contract fields and mode-specific assertions needed by `CT-7`.
  - Require branch-specific metadata such as `status.parityDeferredReason` when parity is not enforced.
- Test:
  - Run the validator on one valid ledger.
  - Run the validator on one missing-field ledger.
  - Run the validator on one contradictory-mode ledger.
- Validate:
  - Confirm the CLI interface remains stable and file-path agnostic.
  - Confirm the validator stays deterministic and independent of live network access.
