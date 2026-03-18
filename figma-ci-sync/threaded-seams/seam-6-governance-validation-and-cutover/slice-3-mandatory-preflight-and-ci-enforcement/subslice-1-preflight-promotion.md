### S3a - Promote Governance in `just preflight`

- **User/system value**: make token governance mandatory in the local pre-push path before maintainers spend time on slower downstream checks.
- **Scope (in/out)**:
  - In: `justfile` recipe ordering, the mandatory governance command reference, and local failure messaging expectations for `just preflight`.
  - Out: Figma policy branching, CI workflow edits, and new token-generation behavior.
- **Acceptance criteria**:
  - `just preflight` invokes the final governance entrypoint as a required step.
  - Governance fails before slower app, Storybook, or Rust work when drift is already known.
  - `just check` and `just preflight` remain explicit about which token checks are advisory versus mandatory.
- **Dependencies**:
  - `S1`
  - `S2`
  - `CT-8`
- **Verification**:
  - Run `just preflight` in a green state and a drifted state.
  - Confirm the governance stage fails before downstream build and test stages in the drifted run.
- **Rollout/safety**:
  - Revert only the `justfile` hook if local promotion is too disruptive; keep the seam-owned governance command intact.

#### S3a.T1 - Move `S3.T1` into the local preflight path

- **Outcome**: the repo's pre-push source of truth includes the final drift gate in a predictable, fail-fast position.
- **Files**:
  - `justfile`
  - `package.json`

Checklist:

- Implement:
  - Update `just preflight` to call the final governance entrypoint at the intended stage.
  - Keep command ordering explicit rather than relying on implicit recipe chaining.
- Test:
  - Run `just preflight` against green and intentionally stale states.
  - Verify the exit point is the governance stage when drift is present.
- Validate:
  - Confirm the added hook does not duplicate checks already covered elsewhere in the recipe chain.
  - Confirm mandatory vs advisory wording is consistent between `just check` and `just preflight`.
