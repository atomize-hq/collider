### S3 — Mandatory Preflight and CI Enforcement

- **Status**: decomposed into session-sized sub-slices
- **Why this was split**:
  - The original slice combined three primary touch surfaces: `justfile`, policy wiring in `package.json` and `scripts/**`, and CI workflow configuration.
  - Verification crossed three layers in one slice: local `just preflight`, policy-fixture coverage, and CI fail-fast behavior.
  - The work would likely require coordinated edits across 6+ files and mixes rollout policy with enforcement wiring.
- **Archived original**: `archive/slice-3-mandatory-preflight-and-ci-enforcement.md`
- **Sub-slice directory**: `slice-3-mandatory-preflight-and-ci-enforcement/`

#### Sub-slices

- `subslice-1-preflight-promotion.md` - moves `S3.T1` into a local-only promotion slice for `just preflight` ordering and failure behavior.
- `subslice-2-figma-policy-branch.md` - moves `S3.T2` into a policy-resolution slice for required vs deferred Figma parity handling.
- `subslice-3-ci-fail-fast-enforcement.md` - moves `S3.T3` into a CI-only slice that reuses the same governance entrypoint and policy branch.
