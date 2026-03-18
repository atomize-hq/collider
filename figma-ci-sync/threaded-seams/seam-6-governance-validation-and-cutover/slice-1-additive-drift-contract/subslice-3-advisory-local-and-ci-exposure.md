### S1c — Advisory Local and CI Exposure

- **User/system value**: surface the additive governance contract in the places maintainers already work so drift signal can be tuned before it becomes a required preflight gate.
- **Scope (in/out)**:
  - In: advisory `justfile` wiring, advisory CI invocation, and seam-local guidance that points maintainers at one governance entrypoint.
  - Out: new drift logic, mandatory `just preflight` promotion, and any parallel local/CI command definitions.
- **Acceptance criteria**:
  - Local and CI workflows invoke the same seam-owned governance command.
  - Failures are visible in advisory mode without yet becoming a required `just preflight` blocker.
  - No duplicate token-governance shell logic exists between `justfile` and CI configuration.
- **Dependencies**:
  - `S1a`
  - `S1b`
- **Verification**:
  - Run the advisory path locally through the `justfile` surface and confirm it resolves to the shared governance command.
  - Exercise a representative CI invocation with an intentional stale-artifact failure and confirm the signal is reported without mandatory promotion.
- **Rollout/safety**:
  - Keep this sub-slice advisory only; if signal quality is poor, remove the advisory hook rather than forking the command surface.

#### S1c.T1 — Expose additive governance in local and CI workflows

- **Outcome**: maintainers can run and observe the additive governance path through repo-native local and CI surfaces before `S3` promotes it into `just preflight`.
- **Files**:
  - `justfile`
  - CI workflow config
  - seam-local docs or recipe comments that point to the shared command

Checklist:

- Implement:
  - Add advisory `justfile` wiring that calls the seam-owned governance command.
  - Add advisory CI wiring that calls the same entrypoint instead of copying shell logic.
  - Point maintainers at the single additive governance command from the local workflow surface.
- Test:
  - Verify local and CI invocations resolve to identical script entrypoints.
  - Exercise one intentional stale-artifact failure through the advisory path.
- Validate:
  - Confirm failures are visible but not yet coupled to `just preflight`.
  - Confirm no duplicate token-governance logic is introduced between `justfile` and CI.
