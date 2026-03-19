### S3a — Claim matrix by consumer context

- **User/system value**: local, CI, PR/handoff, and release consumers can read one policy matrix and know exactly which Figma-dependent claims are informational, allowed, or forbidden for the current ledger state.
- **Scope (in/out)**:
  - In: claim-policy matrix for local checks, CI summaries, PR or handoff notes, and release decisions; deferred versus required parity claim rules; separation between informational reporting and promotable assertions.
  - Out: owner assignment for parity transitions; `WS-6B` handoff packaging; enforcement code or gate-runner implementation details.
- **Acceptance criteria**:
  - Each consumer context maps ledger states to allowed and forbidden assertions.
  - `D-publish-valid` is allowed only when the ledger shows current successful proof for the current artifact revision.
  - `E-promotion-complete` is forbidden for Figma-dependent claims while `promotion.parityMode="deferred"`.
  - The matrix distinguishes informational status from promotion authority.
- **Dependencies**:
  - `S1`
  - `S2`
  - `CT-7B`
  - `CT-8B`
  - target-state promotion ladder
- **Verification**:
  - Review the matrix against the example payloads from `S1.T3`.
  - Review the matrix against the evaluator states from `S2.T1`.
  - Confirm every allowed claim traces to explicit ledger evidence instead of prose-only judgment.
- **Rollout/safety**:
  - Policy only. Do not define runner wiring, output rendering, or gate execution in this sub-slice.

#### S3.T1 — Write the claim matrix for local, CI, and release/handoff contexts

- **Outcome**: each consumer context has a clear policy for what it may claim from the ledger, especially around `D-publish-valid` and `E-promotion-complete`.
- **Files**:
  - `harness-convergence/threaded-seams/seam-6b-verification-and-promotion-convergence/slice-3-promotion-governance-adoption/subslice-1-s3a-claim-matrix-consumers.md`
  - `harness-convergence/threading.md`

Checklist:

- Implement:
  - Define the claim matrix for local, CI, PR/handoff, and release contexts.
  - Separate informational status output from promotable or releasable assertions.
  - Keep the matrix focused on ledger consumption, not gate implementation mechanics.
- Test:
  - Exercise the matrix with deferred, required, and blocked examples from `S1` and `S2`.
  - Check at least one context for each earned-level boundary from `D-publish-valid` through `E-promotion-complete`.
- Validate:
  - Confirm no context can claim promotion-complete from deferred parity.
  - Confirm no matrix row bypasses inherited `A/B/C` requirements.
  - Confirm all Figma-dependent claims remain revision-bound to current ledger evidence.
