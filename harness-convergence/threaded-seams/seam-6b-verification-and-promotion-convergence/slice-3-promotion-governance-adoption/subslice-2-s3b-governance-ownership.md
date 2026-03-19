### S3b — Governance ownership for parity transitions and blockers

- **User/system value**: maintainers can determine who owns deferred-versus-required parity decisions and who must clear blocking exceptions before higher promotion claims are allowed.
- **Scope (in/out)**:
  - In: owner roles for release or governance maintainers, design-system tooling maintainers, and design maintainers; approval expectations for parity-mode changes; owner and clearing-condition rules for blocking exceptions.
  - Out: claim matrix details for consumer contexts; implementation tickets or handoff packaging; credentials, scopes, or transport changes owned by `SEAM-5B`.
- **Acceptance criteria**:
  - Required parity cannot be claimed without explicit governance ownership for the enforcing gate.
  - Every blocking exception has an owner and a clearing condition.
  - The hardening target remains `rest-variables-oauth`; no alternate permanent rail is introduced.
  - Ownership language does not reassign `SEAM-5B` transport or credential ownership.
- **Dependencies**:
  - `S1`
  - `S2`
  - inherited `SEAM-4`
  - `SEAM-5B`
  - `CT-7B`
  - `CT-8B`
- **Verification**:
  - Check that every transition or blocked state from the claim matrix has a named owner.
  - Check that every blocking exception from `S2.T3` has a clearing condition.
  - Confirm no role table introduces a second hardening target or alternate permanent rail.
- **Rollout/safety**:
  - Governance-policy only. If ownership remains unclear, parity stays deferred and the ambiguity is recorded explicitly.

#### S3.T2 — Assign governance ownership for parity transitions and blockers

- **Outcome**: owner roles and approval expectations are explicit for moving from proof mode to required parity and for clearing blocking exceptions.
- **Files**:
  - `harness-convergence/threaded-seams/seam-6b-verification-and-promotion-convergence/slice-3-promotion-governance-adoption/subslice-2-s3b-governance-ownership.md`
  - `harness-convergence/threading.md`

Checklist:

- Implement:
  - Define owner roles and approvals for parity changes and exception clearance.
  - Map blocked states to explicit owner and clearing-condition pairs.
  - Keep `SEAM-5B` publish-mode and transport ownership as consumed inputs.
- Test:
  - Verify each claim-matrix transition has an owner and clearing condition.
  - Verify a deferred case and a required-parity case both resolve without shared or ambiguous ownership.
- Validate:
  - Confirm no task reassigns `SEAM-5B` transport ownership into this seam.
  - Confirm `rest-variables-oauth` remains the only hardening target before required parity.
  - Confirm unresolved ownership keeps parity deferred rather than silently accepted.
