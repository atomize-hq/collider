### S3b — Parity Policy and `SEAM-6` Handoff

- **User/system value**: give downstream governance one explicit parity branch and one bounded set of seam-owned inputs to wire later.
- **Scope (in/out)**:
  - In: `src/figma/parity-policy.md`; parity posture alignment across `src/figma/parity-policy.md`, `src/figma/README.md`, and `src/figma/sync-ledger.json`; explicit handoff notes for `SEAM-6`.
  - Out: validator implementation changes beyond consuming the settled contract, CI workflow updates, or mandatory API integration.
- **Acceptance criteria**:
  - `src/figma/parity-policy.md` names whether parity is `deferred` or `required` and states the trigger for changing that branch.
  - The parity-policy doc references the ledger and validator as the only seam-owned inputs governance should read.
  - `SEAM-6` can adopt the handoff without adding new Figma-specific assumptions.
- **Dependencies**:
  - `S1`
  - `S2`
  - `S3a`
- **Downstream consumer/handoff target**: `SEAM-6`
- **Verification**:
  - Review `src/figma/parity-policy.md` against `src/figma/README.md` and `src/figma/sync-ledger.json` to confirm they declare the same parity branch.
  - Review the handoff with the future governance owner and confirm they can describe which command and files they would wire into a gate.
- **Rollout/safety**:
  - Keep the policy branch singular and explicit.
  - Keep governance promotion later and outside this seam; `SEAM-6` reviews the handoff outputs but does not block this documentation slice from landing.

#### S3.T2 — Publish the parity posture and `SEAM-6` handoff

- **Outcome**: downstream governance work receives one explicit policy branch and one list of inputs to wire later.
- **Files**:
  - `src/figma/parity-policy.md`
  - `src/figma/README.md`
  - `src/figma/sync-ledger.json`

Checklist:

- Implement:
  - Add `src/figma/parity-policy.md` with the current branch, enabling criteria, and governance handoff inputs.
  - Update `src/figma/README.md` to point to the parity policy instead of restating the entire branch logic.
  - Align `src/figma/sync-ledger.json` with the same declared parity posture.
- Test:
  - Review the handoff with the owner of `SEAM-6` and confirm the file is sufficient without extra chat context.
- Validate:
  - Confirm `src/figma/parity-policy.md`, `src/figma/README.md`, and `src/figma/sync-ledger.json` all declare the same parity posture.
  - Confirm `SEAM-6` can consume only the ledger and validator command without inventing new Figma policy.
  - Confirm the policy starts at `deferred` and only promotes to `required` after enterprise parity automation exists and governance explicitly opts in.
