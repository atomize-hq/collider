### S2b — Cutover And Rollback Runbook

- **User/system value**: maintainers get one executable runbook for turning `src/lib/tokens/tokens.css` from hand-edited to generated, with a rollback path that is simple enough to trust under time pressure.
- **Scope (in/out)**:
  - In: seam-local cutover prerequisites; evidence checklist; explicit cutover commands; explicit rollback commands; post-cutover validation steps and operator notes.
  - Out: implementing the compatibility checker itself; adding mandatory `preflight` or CI gates; long-term token cleanup after cutover.
- **Acceptance criteria**:
  - The runbook names the exact preconditions that must be met before cutover, including generated artifact parity and proof from `SEAM-4`.
  - The runbook lists the exact validation commands to run before cutover, immediately after cutover, and after rollback.
  - The rollback path restores the last known-good generated CSS state through a small revert-and-rebuild sequence rather than a bespoke artifact store.
- **Dependencies**:
  - `S1`
  - `S2a`
  - `SEAM-4`
  - `CT-6`
- **Verification**:
  - Dry-run the runbook against a representative generated CSS change without merging it.
  - Walk the rollback section step-by-step and confirm each command is already available in the repo.
  - Confirm the runbook explicitly marks manual edits to `src/lib/tokens/tokens.css` as disallowed after cutover.
- **Rollout/safety**:
  - Keep the runbook in the seam directory so it can change with the cutover policy without modifying broader product docs.
  - If the rollback sequence needs more than reverting the last known-good artifact change and rebuilding, simplify it before treating the slice as done.

#### S2.T2 — Write the cutover and rollback runbook

- **Outcome**: the seam has one operator-facing source of truth for cutover timing, validation evidence, and rollback recovery.
- **Files**:
  - `figma-ci-sync/threaded-seams/seam-6-governance-validation-and-cutover/runtime-css-cutover-runbook.md`
  - `package.json`
  - `src/lib/tokens/tokens.css`

Checklist:

- Implement:
  - Write `runtime-css-cutover-runbook.md` with explicit preconditions, cutover steps, post-cutover validation, and rollback steps.
  - Reference the exact package scripts and validation commands that must pass before and after the switch.
  - State clearly that direct edits to `src/lib/tokens/tokens.css` stop at cutover.
- Test:
  - Perform a dry-run walkthrough using a representative generated artifact update and confirm each step is executable.
  - Walk the rollback section against the previous generated CSS state and confirm the commands are sufficient to recover.
- Validate:
  - Confirm the runbook depends on the compatibility proof from `S2a` rather than restating a second compatibility policy.
  - Confirm the rollback path is repo-native and does not invent a separate storage or release process.
