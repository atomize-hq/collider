### S2c — Post-Cutover Drift Guard

- **User/system value**: once the cutover is accepted, the additive governance path can treat hand edits to runtime token CSS as policy violations instead of silently absorbing them.
- **Scope (in/out)**:
  - In: package-script or seam-owned governance wiring that reuses the `S1` freshness path; failure messaging that points engineers back to the cutover runbook; post-cutover behavior for `src/lib/tokens/tokens.css`.
  - Out: mandatory `just preflight` promotion owned by `S3`; new runtime compatibility definitions; new generator behavior.
- **Acceptance criteria**:
  - Editing `src/lib/tokens/tokens.css` directly after cutover causes the additive governance command to fail.
  - Rebuilding from canonical sources or reverting to the last known-good generated artifact clears the failure.
  - Failure output points maintainers to the build command and the runbook instead of leaving recovery implicit.
- **Dependencies**:
  - `S1`
  - `S2a`
  - `S2b`
  - `CT-5`
  - `CT-6`
- **Verification**:
  - Run the additive governance command in a clean state and confirm it passes.
  - Hand-edit `src/lib/tokens/tokens.css`, rerun the governance command, and confirm the failure is explicit.
  - Rebuild from canonical sources or revert the CSS artifact, rerun the command, and confirm the failure clears.
- **Rollout/safety**:
  - Keep this guard advisory within `S2`; `S3` owns later promotion into mandatory `preflight` and CI behavior.
  - Do not enable the guard until the compatibility surface and rollback runbook are already in place, or maintainers will bypass it instead of trusting it.

#### S2.T3 — Enforce post-cutover no-manual-edit behavior

- **Outcome**: the seam can distinguish legitimate generated runtime CSS updates from direct manual edits after cutover.
- **Files**:
  - `package.json`
  - `scripts/validate-token-artifacts.mjs`
  - `scripts/validate-token-runtime-compatibility.mjs`
  - `figma-ci-sync/threaded-seams/seam-6-governance-validation-and-cutover/runtime-css-cutover-runbook.md`
  - `src/lib/tokens/tokens.css`

Checklist:

- Implement:
  - Extend the additive governance entrypoint from `S1` so post-cutover runs treat direct edits to `src/lib/tokens/tokens.css` as drift.
  - Reuse the freshness checker and compatibility checker instead of introducing a second definition of generated runtime CSS.
  - Emit failure messaging that tells maintainers to rebuild or follow the rollback runbook.
- Test:
  - Hand-edit `src/lib/tokens/tokens.css` after cutover and confirm the governance command fails.
  - Rebuild from canonical sources or revert the artifact and confirm the same command passes again.
- Validate:
  - Confirm legitimate generated artifact updates do not trigger the guard.
  - Confirm the guard remains additive in this slice and does not yet change `just preflight` or CI ordering.
