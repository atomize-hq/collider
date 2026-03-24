### S3 — Optional Parity Hooks and Governance Handoff

- **User/system value**: make `CT-7` enforceable enough for later governance adoption while keeping enterprise-only parity automation optional in v1.
- **Scope (in/out)**:
  - In: mode-aware validation for `src/figma/sync-ledger.json`; one explicit parity-policy branch for `deferred`, `advisory`, or `required`; handoff notes that tell `SEAM-6` exactly what to wire later.
  - Out: `package.json`, `justfile`, CI workflow changes, or mandatory enterprise REST integration.
- **Acceptance criteria**:
  - `scripts/validate-sync-ledger.mjs` fails closed on missing or contradictory `CT-7` fields.
  - The repo documents whether Figma parity is deferred, advisory, or ready to become required, along with the enabling criteria for changing that branch.
  - `SEAM-6` can adopt the settled policy without inventing its own Figma contract.
- **Dependencies**: `S1`, `S2`, `SEAM-3/CT-5`
- **Verification**: run the ledger validator against a valid ledger and at least two invalid policy combinations; review the parity doc and confirm it names the same branch recorded in the ledger.
- **Rollout/safety**: keep hardening local to the seam; governance promotion happens later and only after the pilot path is already proven.

#### S3.T1 — Extend ledger validation for mode-specific `CT-7` fields

- **Outcome**: the existing sync-ledger validator can enforce the minimum fields and contradictions that matter for the settled Figma sync contract.
- **Inputs/outputs**:
  - Inputs: `scripts/validate-sync-ledger.mjs`; `src/figma/sync-ledger.json`; the policy and pilot fields published by `S1` and `S2`.
  - Outputs: updates to `scripts/validate-sync-ledger.mjs` that require `syncMode`, `artifactPath`, pilot-file linkage, and `parityMode`, plus branch-specific validation such as requiring a defer reason when parity is not enforced.
- **Implementation notes**: keep the CLI interface stable and file-path agnostic; validate contract invariants, not live Figma API reachability. If the team chooses an enterprise branch later, require the identifying metadata but do not make network calls here.
- **Acceptance criteria**:
  - The validator exits non-zero when the ledger omits required `CT-7` fields.
  - The validator rejects contradictory states such as `syncMode=read-only-url` with a status claiming Figma authored the latest canonical change.
  - Happy-path ledgers still validate deterministically from the command line.
- **Test notes**: run the validator on one valid ledger, one missing-field ledger, and one contradictory-mode ledger.
- **Risk/rollback notes**: over-validation too early can create churn; keep checks limited to the settled v1 contract and expand only when policy actually changes.

Checklist:

- Implement: update `scripts/validate-sync-ledger.mjs` with the contract fields and mode-specific assertions needed by `CT-7`.
- Test: run the validator against valid and invalid ledger fixtures or edited copies.
- Validate: confirm the script remains deterministic and independent of live network access.
- Cleanup: remove any temporary compatibility allowances once the ledger shape is stable.

#### S3.T2 — Publish the parity posture and `SEAM-6` handoff

- **Outcome**: downstream governance work receives one explicit policy branch and one list of inputs to wire later.
- **Inputs/outputs**:
  - Inputs: `src/figma/README.md`; `src/figma/sync-ledger.json`; the validator contract from `S3.T1`.
  - Outputs: `src/figma/parity-policy.md` defining whether parity is `deferred`, `advisory`, or `required`, which files and fields `SEAM-6` should consume, and what event changes that branch.
- **Implementation notes**: keep the policy branch singular and explicit. If enterprise REST parity is not required in v1, say so directly and name the evidence needed before the branch can move to `required`.
- **Acceptance criteria**:
  - `src/figma/parity-policy.md` names the current branch and the trigger for changing it.
  - The parity-policy doc references the ledger and validator as the only seam-owned inputs governance should read.
  - `SEAM-6` can adopt the handoff without adding new Figma-specific assumptions.
- **Test notes**: review the doc with the future governance owner and confirm they can describe exactly which command and which files they would wire into a gate.
- **Risk/rollback notes**: duplicate policy sources create ambiguity; keep the handoff in this file and make `src/figma/README.md` point to it rather than restating the entire branch logic.

Checklist:

- Implement: add `src/figma/parity-policy.md` with the current branch, enabling criteria, and governance handoff inputs.
- Test: review the handoff with the owner of `SEAM-6` and confirm the file is sufficient without extra chat context.
- Validate: confirm `src/figma/parity-policy.md`, `src/figma/README.md`, and `src/figma/sync-ledger.json` all declare the same parity posture.
- Cleanup: remove any placeholder branch names or TODO gating notes once the policy is final.
