### S3c - Align CI with the Mandatory Gate

- **User/system value**: keep CI behavior consistent with local governance so drift fails once, early, and on the same command surface everywhere.
- **Scope (in/out)**:
  - In: CI workflow ordering, reuse of the seam-owned governance entrypoint, and downstream failure messaging for build and test stages.
  - Out: new governance logic, Figma policy design, and token-generation internals.
- **Acceptance criteria**:
  - CI invokes the same mandatory governance entrypoint before downstream app and Storybook work.
  - Drift and policy-triggered parity failures stop CI before expensive build and test stages.
  - Workflow ordering is documented clearly enough that maintainers know where governance failures belong.
- **Dependencies**:
  - `S3a`
  - `S3b`
  - `CT-8`
- **Verification**:
  - Run or simulate CI with stale artifacts and with a parity-required failure.
  - Confirm both failures occur before downstream build and test stages.
- **Rollout/safety**:
  - Debug seam-owned governance scripts first if CI is flaky; do not fork local and CI logic to paper over failures.

#### S3c.T1 - Move `S3.T3` into CI-only workflow alignment

- **Outcome**: CI preserves the same fail-fast drift contract as `just preflight` without copying shell logic into workflow files.
- **Files**:
  - `.github/workflows/**`
  - `package.json`
  - seam-owned governance docs or workflow comments, if needed for operator clarity

Checklist:

- Implement:
  - Update CI workflow configuration to call the mandatory governance entrypoint before downstream build and test stages.
  - Remove duplicated token-related CI steps that are replaced by the shared governance entrypoint.
- Test:
  - Simulate or run CI against stale artifacts and parity failures.
  - Confirm failure order and messaging match local `just preflight` behavior.
- Validate:
  - Confirm CI and local paths share one governance entrypoint and one policy branch.
  - Confirm workflow docs or comments explain where token drift failures should surface.
