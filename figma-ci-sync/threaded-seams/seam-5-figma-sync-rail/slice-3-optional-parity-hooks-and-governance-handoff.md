### S3 — Optional Parity Hooks and Governance Handoff

- **Status**: decomposed into session-sized sub-slices.
- **Audit result**:
  - `S1`: OK as written; single primary touch surface and only two atomic tasks.
  - `S2`: OK as written; pilot setup and ledger proof stay within one primary outcome.
  - `S3`: oversized for one Codex session because it bundles validator hardening, invalid-ledger verification, parity-policy publication, and `SEAM-6` handoff alignment across `scripts/validate-sync-ledger.mjs` and `src/figma/**`.
- **Archived original**: `archive/slice-3-optional-parity-hooks-and-governance-handoff.md`
- **Sub-slice directory**: `slice-3-optional-parity-hooks-and-governance-handoff/`

#### Sub-slices

- `slice-3-optional-parity-hooks-and-governance-handoff/subslice-1-validator-contract-hardening.md`
  - `S3a`; moves `S3.T1` into a validator-focused session covering mode-aware `CT-7` assertions and deterministic valid/invalid ledger checks.
- `slice-3-optional-parity-hooks-and-governance-handoff/subslice-2-parity-policy-and-seam-6-handoff.md`
  - `S3b`; moves `S3.T2` into a documentation-focused session covering parity-branch publication, ledger/README alignment, and the explicit governance handoff for `SEAM-6`.
