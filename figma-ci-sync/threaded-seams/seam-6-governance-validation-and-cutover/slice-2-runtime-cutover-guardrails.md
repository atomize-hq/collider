### S2 — Runtime Cutover Guardrails

- **User/system value**: retire hand-edited runtime token CSS once, safely, and with a rollback path that protects engineers from losing required legacy variable coverage during the transition.
- **Scope (in/out)**:
  - In: CSS compatibility checks, cutover criteria, rollback documentation, and seam-owned scripts that protect `src/lib/tokens/tokens.css` during the migration from manual edits to generated output.
  - Out: generating the CSS artifact itself, changing app or Storybook consumers, and broad token taxonomy cleanup.
- **Acceptance criteria**:
  - The cutover has explicit entry criteria tied to generated artifact parity and runtime/Storybook adoption.
  - Manual edits to `src/lib/tokens/tokens.css` after cutover are detected as drift.
  - The rollback path names the exact action to restore the last known-good generated CSS state.
- **Dependencies**: `SEAM-3`, `SEAM-4`, `CT-5`, `CT-6`, `S1`
- **Verification**: prove compatibility checks catch missing legacy variables before cutover; simulate a bad generated CSS change and confirm the rollback steps restore the previous artifact cleanly.
- **Rollout/safety**: do not make the cutover until `SEAM-4` confirms the app and Storybook are consuming generated CSS through the existing import path.

#### S2.T1 — Define and automate CSS compatibility checks

- **Outcome**: a seam-owned compatibility rule verifies the generated runtime CSS still satisfies the legacy variable coverage required during transition.
- **Inputs/outputs**:
  - Inputs: current `src/lib/tokens/tokens.css`, generated CSS from `CT-5`, runtime expectations proven by `SEAM-4`
  - Outputs: a compatibility-check script or fixture set under `scripts/**` plus an explicit list of variables or selectors that must remain available during cutover
- **Implementation notes**: compare against the compatibility surface the app already imports, not against unrelated token-source internals.
- **Acceptance criteria**:
  - If a required legacy variable disappears before the migration is complete, the compatibility check fails.
  - The compatibility surface is small, explicit, and versionable.
  - The check can run alongside the freshness checker without duplicating its responsibilities.
- **Test notes**: remove a required legacy variable from a generated fixture and confirm the compatibility check fails with a specific missing-name report.
- **Risk/rollback notes**: overbroad compatibility lists will block progress; keep only the names required for staged rollout.

Checklist:

- Implement: codify the compatibility surface and add the validation script or fixture.
- Test: simulate a missing legacy variable and verify the failure message identifies it precisely.
- Validate: confirm the check passes against the known-good generated CSS artifact.
- Cleanup: prune compatibility allowances that are no longer needed after cutover.

#### S2.T2 — Write the cutover and rollback runbook

- **Outcome**: maintainers have one seam-owned runbook that defines when manual CSS editing stops, what evidence is required to cut over, and how to revert to the last known-good generated artifact.
- **Inputs/outputs**:
  - Inputs: outputs of `S1`, compatibility evidence from `S2.T1`, runtime and Storybook proof from `SEAM-4`
  - Outputs: a cutover document in the seam directory or adjacent governance docs, including explicit rollback commands and evidence checklist
- **Implementation notes**: the rollback path should prefer simple repo-native recovery such as reverting to the last known-good generated artifact commit rather than inventing a parallel artifact store.
- **Acceptance criteria**:
  - The runbook names preconditions, cutover steps, post-cutover validation, and rollback steps.
  - The runbook states that manual edits to `src/lib/tokens/tokens.css` are no longer allowed after cutover.
  - The runbook references the exact validation commands that must pass before and after the switch.
- **Test notes**: do a dry-run walkthrough of the runbook against a generated-artifact change and confirm each validation step is executable.
- **Risk/rollback notes**: if the rollback path needs more than a small revert and rebuild, the task is not done; simplify it before promotion.

Checklist:

- Implement: write the cutover and rollback runbook with explicit commands and evidence gates.
- Test: dry-run the sequence against a representative artifact update.
- Validate: confirm the rollback path restores the previous generated CSS state and passes the additive governance checks.
- Cleanup: remove obsolete references to hand-editing once cutover is accepted.

#### S2.T3 — Enforce post-cutover no-manual-edit behavior

- **Outcome**: the repo treats hand-editing of `src/lib/tokens/tokens.css` as drift once the cutover criteria are met.
- **Inputs/outputs**:
  - Inputs: outputs of `S2.T1` and `S2.T2`
  - Outputs: seam-owned script or guardrail updates that fail when runtime CSS changes are not explained by the token build flow
- **Implementation notes**: this guard should key off the build-and-freshness path from `S1` instead of introducing a second definition of “generated.”
- **Acceptance criteria**:
  - Editing `src/lib/tokens/tokens.css` directly after cutover causes the governance path to fail.
  - Rebuilding from canonical sources clears the failure.
  - The failure message points maintainers back to the cutover runbook and build command.
- **Test notes**: modify the runtime CSS by hand post-cutover and confirm the governance path fails until the artifact is regenerated or reverted.
- **Risk/rollback notes**: do not enable this guard until the runbook and compatibility checks are already proven, or it will create bypass pressure.

Checklist:

- Implement: add the post-cutover no-manual-edit guard using the existing governance entrypoint.
- Test: hand-edit the runtime CSS and verify failure; rebuild or revert and verify recovery.
- Validate: confirm the guard does not fire on legitimate generated-artifact updates.
- Cleanup: remove any temporary exceptions used during rollout rehearsal.
