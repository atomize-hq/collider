### S3 — Mandatory Preflight and CI Enforcement

- **User/system value**: make token governance real by promoting the proven additive checks into the repo’s required gates, including the final policy decision on whether Figma parity is mandatory or intentionally deferred.
- **Scope (in/out)**:
  - In: `just preflight` integration, final CI ordering, policy-gated Figma parity or sync-ledger enforcement, and repo-facing failure messaging.
  - Out: Figma export generation, runtime artifact generation, and new consumer adoption work.
- **Acceptance criteria**:
  - `just preflight` runs the final token governance contract as a required step.
  - CI uses the same governance entrypoint and fails before app or Storybook builds when drift is present.
  - Figma parity enforcement is either required by policy or explicitly skipped with a documented policy reason from `SEAM-5`.
- **Dependencies**: `SEAM-5`, `CT-7`, `S1`, `S2`
- **Verification**: intentionally stale artifacts, malformed token inputs, and policy-triggered Figma parity failures all stop the gate before downstream build/test stages.
- **Rollout/safety**: promote only after additive runs have low false-positive rates and the runtime CSS cutover is complete.

#### S3.T1 — Promote token governance into `just preflight`

- **Outcome**: the repo’s pre-push source of truth includes the final drift gate in a predictable position.
- **Inputs/outputs**:
  - Inputs: seam-owned governance command from `S1`, cutover guardrails from `S2`, current `justfile`
  - Outputs: updated `justfile` recipes and any supporting package-script references required for mandatory execution
- **Implementation notes**: keep the final command order explicit so token governance fails before slower app, Storybook, or Rust work when the repo is already in drift.
- **Acceptance criteria**:
  - `just preflight` calls the token governance entrypoint as a required step.
  - Failure occurs early enough that maintainers do not waste time on downstream builds after drift is already known.
  - `just check` and `just preflight` stay aligned about which token checks are advisory versus mandatory.
- **Test notes**: run `just preflight` with a stale artifact and verify the run stops at the governance stage.
- **Risk/rollback notes**: if promotion meaningfully destabilizes day-to-day work, revert only the `justfile` hook while keeping the seam-owned governance command intact.

Checklist:

- Implement: update `justfile` to call the final governance command in `preflight` at the intended stage.
- Test: run `just preflight` on green and drifted states to confirm ordering and exit behavior.
- Validate: confirm the added step does not duplicate logic already handled elsewhere in the recipe chain.
- Cleanup: remove any temporary advisory-only wording once the hook is mandatory.

#### S3.T2 — Finalize policy-gated Figma parity enforcement

- **Outcome**: the gate treats Figma parity as either mandatory or explicitly deferred according to the sync policy defined by `SEAM-5`.
- **Inputs/outputs**:
  - Inputs: `CT-7`, current `scripts/validate-sync-ledger.mjs` precedent, outputs of `S1`
  - Outputs: seam-owned policy wiring in `package.json`, `scripts/**`, and CI that either enforces parity or documents why it is not required in v1
- **Implementation notes**: do not invent a second sync policy; consume the settled `SEAM-5` decision and make the branch explicit in the governance contract.
- **Acceptance criteria**:
  - If policy requires parity or ledger checks, failing them blocks the governance command.
  - If policy defers parity, the governance command reports that explicitly without silently omitting the check.
  - The policy branch is identical locally and in CI.
- **Test notes**: exercise one required-parity path and one deferred-parity path using fixture policy inputs.
- **Risk/rollback notes**: keep policy resolution data-driven so future tightening is a configuration change, not a script rewrite.

Checklist:

- Implement: wire the sync-ledger or parity decision into the governance command using the settled Figma policy input.
- Test: verify required and deferred policy modes behave distinctly and predictably.
- Validate: confirm local and CI flows resolve policy the same way.
- Cleanup: remove temporary policy toggles once the v1 decision is settled.

#### S3.T3 — Align CI ordering with the mandatory drift gate

- **Outcome**: CI runs the same mandatory governance path before downstream app and Storybook builds, preserving `CT-8` across environments.
- **Inputs/outputs**:
  - Inputs: outputs of `S3.T1`, `S3.T2`, current CI workflow config
  - Outputs: CI workflow updates that invoke the seam-owned governance entrypoint before build/test stages
- **Implementation notes**: CI should call the same command surface as local workflows; avoid copying shell logic into workflow files.
- **Acceptance criteria**:
  - CI fails fast on token drift before Next.js, Storybook, or other expensive jobs.
  - CI and local behavior share one governance entrypoint and one policy branch.
  - The workflow order is documented well enough that maintainers know where drift failures belong.
- **Test notes**: run or simulate a CI job with stale artifacts and with a Figma parity failure, confirming both stop before downstream build work.
- **Risk/rollback notes**: if CI flakiness appears, debug the seam-owned scripts first; do not fork local and CI logic as a workaround.

Checklist:

- Implement: update CI workflow config to call the mandatory governance entrypoint before build/test stages.
- Test: simulate or run CI against stale artifacts and parity failures.
- Validate: confirm failure order and messaging match local `just preflight` behavior.
- Cleanup: remove old token-related CI steps that duplicate the new governance contract.
