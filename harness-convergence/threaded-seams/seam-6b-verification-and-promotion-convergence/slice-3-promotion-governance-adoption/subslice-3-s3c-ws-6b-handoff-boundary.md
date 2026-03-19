### S3c — Bounded `WS-6B` handoff and integration boundary

- **User/system value**: future implementation owners get a bounded handoff packet for `WS-6B` work and a separate list of cross-seam integration items, so they can start without re-reading the entire convergence pack or accidentally absorbing `WS-5B` work.
- **Scope (in/out)**:
  - In: handoff items for ledger implementation, ledger-reader validation, and promotion-policy gate wiring that stay inside `WS-6B`; explicit integration-only notes for tasks that cross into `SEAM-5B` or shared CI surfaces.
  - Out: rewriting the claim matrix; ownership policy tables; implementing any gate, transport, or credential code.
- **Acceptance criteria**:
  - The handoff packet contains only `WS-6B` work.
  - Cross-seam tasks are named explicitly and excluded from this seam task list.
  - Each handoff item fits one owner and one PR.
  - Future implementers can start from the packet without re-reading the whole pack.
- **Dependencies**:
  - `S1`
  - `S2`
  - `CT-7B`
  - `CT-8B`
  - `harness-convergence/threading.md`
- **Verification**:
  - Review the packet against the `WS-6B` and `WS-5B` boundaries in `threading.md`.
  - Check that each item maps to ledger shape, verification semantics, or promotion policy only.
  - Check that shared CI, transport, or credential work is called out as integration follow-up instead of being assigned into `WS-6B`.
- **Rollout/safety**:
  - Planning only. Keep cross-seam dependencies visible, but do not import them into this seam’s direct task list.

#### S3.T3 — Package downstream implementation handoff items without duplicating other seams

- **Outcome**: future implementation owners get a bounded handoff list for `WS-6B` work, plus explicit integration work suggestions for anything that crosses into other seam touch surfaces.
- **Files**:
  - `harness-convergence/threaded-seams/seam-6b-verification-and-promotion-convergence/slice-3-promotion-governance-adoption/subslice-3-s3c-ws-6b-handoff-boundary.md`
  - `harness-convergence/threading.md`

Checklist:

- Implement:
  - Write the bounded `WS-6B` handoff items for ledger shape, verification semantics, and promotion-policy consumption.
  - Separate shared CI, transport, or `SEAM-5B` dependencies into explicit integration notes.
  - Collapse duplicated handoff notes into one packet reference.
- Test:
  - Verify each handoff item fits one owner and one PR.
  - Verify no handoff item crosses into `WS-5B` ownership.
- Validate:
  - Confirm cross-seam work is excluded from this seam plan.
  - Confirm future implementers can start work from the handoff packet without re-deriving seam boundaries.
  - Confirm no integration note silently becomes required `WS-6B` scope.
