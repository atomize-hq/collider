# Agent Native architecture/research packet (Packet 1)

This is Collider's repo-local copy of the verified post-adjudication Agent Native handoff.
It groups the canonical register, non-normative research, adjudication evidence, proof planning,
and bundle provenance in one architecture/research area. Run `python3 meta/VERIFY-BUNDLE.py` and
`shasum -a 256 -c meta/SHA256SUMS.txt` from this directory before relying on the copied payload.

## Packet status

- Research and adjudication are complete.
- AgentKit and Toolkit are shortlisted for a separately authorized proof; neither is adopted.
- [`C-OQ-027`](canonical/02-collider-v1-open-architecture-questions.md#c-oq-027--frontend-foundation-and-reuse-strategy) remains **Open**.
- The original corrected-evaluation machine-readable ledger was not recovered. The adjudication artifacts are new evidence and do not replace that ledger.
- [`proof/agentkit-owner-boundary-proof-spec.md`](proof/agentkit-owner-boundary-proof-spec.md) is non-normative and does not authorize implementation.
- Packet 2, if separately authorized, is the next step; do not begin it from this packet alone.

`canonical/00-collider-v1-glossary.md` and `canonical/01-collider-v1-foundations.md` are preserved
byte-for-byte from the verified bundle. `canonical/02-collider-v1-open-architecture-questions.md`
is the current repo-owned open-question register. See [START-HERE.md](START-HERE.md) for the full
handoff and [meta/INPUTS.md](meta/INPUTS.md) for the evidence and authority boundary.
