### S3 — Promotion governance adoption

- **Decomposition status**: decomposed into focused sub-slices because the original slice mixed three independent governance outcomes: claim-policy consumption, ownership/approval policy, and downstream `WS-6B` handoff packaging.
- **Archived original**: `archive/slice-3-promotion-governance-adoption.md`
- **Sub-slice directory**: `slice-3-promotion-governance-adoption/`
- **Audit result**:
  - `slice-1-ct-8b-ledger-contract.md`: OK
  - `slice-2-verification-conformance-evaluation.md`: OK
  - `slice-3-promotion-governance-adoption.md`: decomposed as borderline oversized because it spans multiple governance surfaces and more than one end deliverable.

#### Sub-slices

- `subslice-1-s3a-claim-matrix-consumers.md`
  - Moves `S3.T1` into a single outcome: the allowed and forbidden claim matrix for local, CI, PR/handoff, and release consumers.
- `subslice-2-s3b-governance-ownership.md`
  - Moves `S3.T2` into a single outcome: ownership and clearing rules for parity transitions and blocking exceptions.
- `subslice-3-s3c-ws-6b-handoff-boundary.md`
  - Moves `S3.T3` into a single outcome: bounded `WS-6B` handoff items plus separate integration-only follow-ups.
