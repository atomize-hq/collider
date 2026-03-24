### S3 — Promotion governance adoption

- **User/system value**: release and governance maintainers get one clear rule set for when local checks, CI gates, handoffs, or merge decisions may claim Figma publish validity or complete parity, without re-reading historical planning prose.
- **Scope (in/out)**:
  - In: decision matrix for local, CI, and release/handoff consumers; governance ownership for deferred versus required parity; rollout path from proof rail to hardened rail; bounded handoff items for later implementation.
  - Out: implementing gate code; implementing credentials or transport; changing `SEAM-5B` success markers or ownership.
- **Acceptance criteria**:
  - The seam spells out which claim levels are allowed in deferred mode versus required mode.
  - Governance ownership for parity transitions and blocking exceptions is explicit.
  - Future implementation teams know which work belongs in `WS-6B` and which cross-seam items must be handled as separate integration work.
- **Dependencies**: `S1`; `S2`; inherited `SEAM-4`; `SEAM-5B`; `CT-7B`; `CT-8B`
- **Verification**: a reviewer can pick any ledger state and determine what claims a PR, handoff, or release note may and may not make.
- **Rollout/safety**: the slice is policy-only and should not trigger enforcement code until downstream implementation work is explicitly started.

#### S3.T1 — Write the claim matrix for local, CI, and release/handoff contexts

- **Outcome**: each consumer context has a clear policy for what it may claim from the ledger, especially around `D-publish-valid` and `E-promotion-complete`.
- **Inputs/outputs**:
  - Inputs: `CT-8B`; `CT-7B`; target-state promotion ladder
  - Outputs: claim matrix mapping ledger states to allowed and forbidden assertions in local checks, CI summaries, PR/handoff notes, and release decisions
- **Implementation notes**: keep the matrix focused on consumption of ledger outcomes, not implementation details of the gate runner.
- **Acceptance criteria**:
  - Deferred parity allows `D-publish-valid` only when the ledger shows current successful proof.
  - `E-promotion-complete` is forbidden for Figma-dependent claims while parity is deferred.
  - The matrix distinguishes informational status from promotable status.
- **Test notes**: review the matrix against the example payloads from `S1.T3` and evaluator states from `S2.T1`.
- **Risk/rollback notes**: if a consumer needs richer status than the ledger provides, add it to a future implementation packet rather than overloading this policy slice.

Checklist:

- Implement: define the claim matrix for local, CI, PR/handoff, and release contexts.
- Test: exercise the matrix with deferred, required, and blocked examples.
- Validate: confirm no context can claim promotion-complete from deferred parity.
- Cleanup: remove any wording that blurs status reporting with promotion authority.

#### S3.T2 — Assign governance ownership for parity transitions and blockers

- **Outcome**: owner roles and approval expectations are explicit for moving from proof mode to required parity and for clearing blocking exceptions.
- **Inputs/outputs**:
  - Inputs: seam brief owner roles; promotion rules; exception model from `S2.T3`
  - Outputs: owner-assignment table for release/governance maintainers, design-system tooling maintainers, and design maintainers
- **Implementation notes**: this task defines decision ownership only; it does not create credentials, scopes, or transport code.
- **Acceptance criteria**:
  - Required parity cannot be claimed without explicit governance ownership for the enforcing gate.
  - Blocking exceptions have an owner and a clearing condition.
  - The hardening target remains `rest-variables-oauth`; no alternate permanent rail is introduced.
- **Test notes**: check that every transition or blocking state in the claim matrix has an owner.
- **Risk/rollback notes**: if ownership is unclear, keep parity deferred and record the ambiguity explicitly rather than assuming shared ownership.

Checklist:

- Implement: define owner roles and approvals for parity changes and exception clearance.
- Test: verify each claim-matrix transition has an owner and clearing condition.
- Validate: confirm no task reassigns `SEAM-5B` transport ownership into this seam.
- Cleanup: remove duplicate owner language from surrounding prose once the table exists.

#### S3.T3 — Package downstream implementation handoff items without duplicating other seams

- **Outcome**: future implementation owners get a bounded handoff list for `WS-6B` work, plus explicit integration work suggestions for anything that crosses into other seam touch surfaces.
- **Inputs/outputs**:
  - Inputs: outputs from `S1` and `S2`; conflict-safe workstream rules from `threading.md`
  - Outputs: a handoff packet for ledger implementation, ledger-reader validation, and gate wiring, plus separate integration notes for cross-seam work
- **Implementation notes**: keep `WS-6B` scoped to ledger shape, verification semantics, and promotion policy; if a task needs `SEAM-5B` or shared CI transport changes, flag it as integration work rather than assigning it here.
- **Acceptance criteria**:
  - The handoff packet only contains `WS-6B` work.
  - Cross-seam tasks are named explicitly and excluded from this seam’s task list.
  - Future implementers can start work without re-reading the entire convergence pack.
- **Test notes**: review the packet against the conflict-safe workstreams and confirm no task crosses into `WS-5B`.
- **Risk/rollback notes**: if a task cannot be cleanly isolated to `WS-6B`, leave it out and record it as an integration dependency.

Checklist:

- Implement: write the bounded `WS-6B` handoff items and separate integration notes.
- Test: verify each handoff item fits one owner and one PR.
- Validate: confirm cross-seam work is excluded from this seam plan.
- Cleanup: collapse duplicated handoff notes into a single packet reference.
