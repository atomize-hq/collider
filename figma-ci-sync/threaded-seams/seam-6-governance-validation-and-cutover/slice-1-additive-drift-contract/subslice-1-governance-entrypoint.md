### S1a — Governance Entrypoint Wiring

- **User/system value**: establish one clear additive command surface for token governance so every later gate consumes the same validation-first flow.
- **Scope (in/out)**:
  - In: `package.json` script wiring for the seam-owned governance entrypoint, command naming, and documented invocation order.
  - Out: artifact freshness checker implementation, `justfile`/CI rollout wiring, and any changes to validator or generator internals.
- **Acceptance criteria**:
  - One seam-owned governance entrypoint delegates to `pnpm validate:tokens` and `pnpm build:tokens` in that order.
  - Validation failure stops the sequence before any downstream drift checks run.
  - The command name and invocation order are explicit enough for later `justfile` and CI adoption without reinterpretation.
- **Dependencies**:
  - `SEAM-3`
  - `CT-4`
  - `CT-5`
- **Verification**:
  - Run the governance entrypoint with valid inputs and confirm validation precedes build.
  - Run it again with a known invalid token or recipe fixture and confirm the command exits non-zero before any freshness stage.
- **Rollout/safety**:
  - Keep this slice additive only; rollback is limited to reverting package script wiring with no artifact-shape change.

#### S1a.T1 — Wire the seam-owned governance entrypoint

- **Outcome**: `package.json` exposes a stable governance command sequence that composes existing validation and build commands without redefining `SEAM-3`.
- **Files**:
  - `package.json`

Checklist:

- Implement:
  - Add the seam-owned governance script entrypoint in `package.json`.
  - Delegate to the existing `validate:tokens` and `build:tokens` commands instead of inlining logic.
  - Document the invocation order in the script naming or adjacent seam-local notes used by downstream slices.
- Test:
  - Execute the entrypoint once on the happy path.
  - Execute it once with a known invalid token or recipe fixture.
- Validate:
  - Confirm validation always runs before build.
  - Confirm invalid input stops the sequence with a deterministic non-zero exit code.
