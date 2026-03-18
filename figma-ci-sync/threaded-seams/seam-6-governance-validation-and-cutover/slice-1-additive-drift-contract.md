### S1 — Additive Drift Contract

- **User/system value**: establish the token-governance surface early so maintainers can detect malformed inputs and stale artifacts without forcing the repo to absorb blocking churn before downstream consumers are proven.
- **Scope (in/out)**:
  - In: seam-owned script entrypoints in `package.json`; artifact freshness checks in `scripts/**`; non-blocking CI and local invocation paths that exercise `CT-4` and `CT-5`.
  - Out: token schema changes, Style Dictionary internals, runtime CSS imports, and Figma sync implementation.
- **Acceptance criteria**:
  - A single governance entrypoint runs `pnpm validate:tokens`, `pnpm build:tokens`, and artifact freshness checks in a deterministic order.
  - Freshness checks fail when generated outputs differ from canonical sources after a rebuild.
  - The new governance path is additive only: it can be run locally and in CI without yet becoming a hard blocker in `just preflight`.
- **Dependencies**: `SEAM-3`, `CT-4`, `CT-5`
- **Verification**: intentionally corrupt a token or recipe input and confirm validation fails before the build; intentionally stale a generated artifact and confirm the freshness check fails after rebuild.
- **Rollout/safety**: keep the seam in advisory mode first so consumers can fix false positives and path assumptions before the repo treats drift as release-blocking.

#### S1.T1 — Wire a seam-owned governance entrypoint

- **Outcome**: `package.json` exposes a clear governance command sequence that delegates to `pnpm validate:tokens` and `pnpm build:tokens` without redefining `SEAM-3` behavior.
- **Inputs/outputs**:
  - Inputs: `CT-4`, `CT-5`, current `package.json`
  - Outputs: new or updated package scripts for additive governance execution and a documented invocation order used by later slices
- **Implementation notes**: keep the entrypoint seam-local by composing existing commands; do not inline validation or build logic into the script wiring.
- **Acceptance criteria**:
  - Running the governance entrypoint invokes validation before build.
  - A validation failure stops the sequence before artifact freshness checks run.
  - The command surface is named clearly enough that `justfile` and CI can adopt it later without ambiguity.
- **Test notes**: run the governance entrypoint once in the happy path and once with a known invalid token or recipe fixture.
- **Risk/rollback notes**: because the task only adds script wiring, rollback is a script removal or reversion with no artifact format change.

Checklist:

- Implement: add the package-script entrypoint and reference the existing `validate:tokens` / `build:tokens` commands.
- Test: execute the command with valid inputs and with one intentionally invalid fixture.
- Validate: confirm command order and non-zero exit behavior are deterministic.
- Cleanup: remove any temporary debug logging before the script surface becomes a shared contract.

#### S1.T2 — Add deterministic artifact freshness validation

- **Outcome**: a seam-owned script under `scripts/**` proves generated outputs are up to date with canonical token and recipe sources after `pnpm build:tokens`.
- **Inputs/outputs**:
  - Inputs: generated outputs from `CT-5`, canonical sources from `SEAM-1` and `SEAM-2`
  - Outputs: a freshness checker script and a stable list of artifact paths that the drift gate watches
- **Implementation notes**: compare rebuilt outputs to tracked artifacts instead of duplicating `SEAM-3` generation logic; keep the artifact list explicit so future tightening is a policy change, not a surprise.
- **Acceptance criteria**:
  - If `src/lib/tokens/tokens.css` or another watched artifact is stale, the script exits non-zero.
  - A no-op rebuild produces no diff and passes.
  - The script output tells maintainers which artifact drifted and which command to rerun.
- **Test notes**: modify a watched artifact by hand, rerun the checker, and confirm it fails with a precise file-level message.
- **Risk/rollback notes**: false positives are the main risk; keep the watched-path set narrow and explicit until downstream consumers settle.

Checklist:

- Implement: add the freshness checker script and enumerate the artifact paths it guards.
- Test: simulate stale output and verify the script fails; rerun after rebuild and verify it passes.
- Validate: confirm the checker is deterministic across repeated runs with no source changes.
- Cleanup: remove any temporary allowances once the path set is stable.

#### S1.T3 — Expose additive governance in local and CI workflows

- **Outcome**: maintainers can run the governance path locally and in CI in advisory mode before it becomes part of `just preflight`.
- **Inputs/outputs**:
  - Inputs: outputs of `S1.T1` and `S1.T2`
  - Outputs: provisional `justfile` and CI wiring that surfaces failures without yet making them release-blocking
- **Implementation notes**: the advisory surface should use the same command entrypoint everywhere to avoid environment drift.
- **Acceptance criteria**:
  - Local docs or recipe comments point maintainers at one additive governance command.
  - CI can execute the same command and report failures without blocking unrelated stabilization work.
  - No duplicate token-governance logic exists between `justfile` and CI.
- **Test notes**: run the advisory path locally and in a representative CI invocation with one intentional stale-artifact failure.
- **Risk/rollback notes**: if advisory noise is high, keep the reporting path but remove the CI hook until signal quality is fixed.

Checklist:

- Implement: add advisory wiring in `justfile` and CI that calls the seam-owned governance command.
- Test: verify local and CI invocations use identical script entrypoints.
- Validate: confirm failures are visible but not yet coupled to `just preflight`.
- Cleanup: capture any false-positive causes for remediation before `S3`.
