# Bundle Inputs and Authority

This bundle is a self-contained handoff for the post-adjudication Collider/Agent Native proof-planning phase.

## Canonical Collider documents

These are the only canonical Collider documents in this bundle:

- `../canonical/00-collider-v1-glossary.md`
- `../canonical/01-collider-v1-foundations.md`
- `../canonical/02-collider-v1-open-architecture-questions.md`

`00` and `01` are unchanged from the verified research bundle. `02` is the current packet revision and remains a non-normative open-question register. All 27 `C-OQ-*` entries remain Open.

## Research evidence

- `../research/deep-seek-harness-deep-research-report.md` — non-normative DeepSeek/Cordis research.
- `../research/bb-deepseek-collider-architecture-report.md` — non-normative BB comparison research.
- `../research/bb-research-source-ledger.json` — BB evidence ledger only.
- `../research/agent-native-original-evaluation.md` — historical Agent Native evaluation.
- `../research/agent-native-evaluation-brief-v2.md` — controlling brief for the corrected evaluation; historical now that the evaluation is complete.
- `../research/corrected-agent-native-evaluation.md` — corrected evaluation report body, exact SHA-256 `2e23d0d698e5023483292828648dbfda7a08d408f88b5cc06de8bf6697f180f8`.

The original machine-readable evidence ledger referenced by the corrected Agent Native report is unavailable and is intentionally not reconstructed in this bundle.

## Adjudication evidence

- `../adjudication/adjudication-result.md` — main bounded adjudication narrative.
- `../adjudication/adjudication-decision-coverage.md` — 38 material recommendation rows and 14 stop/reversal rows.
- `../adjudication/adjudication-check-record.md` — new verification record with pinned source rechecks and evidence limits.
- `../adjudication/MISSING-EVIDENCE.md` — explicit record of the unavailable corrected-evaluation ledger.

The adjudication is advisory. It selects a proof direction, not adoption or implementation.

## Proof planning

- `../proof/agentkit-owner-boundary-proof-spec.md` — non-normative staged proof contract. It does not authorize implementation.

## Repository pins

See `REPOSITORIES.json` for the report/adjudication-pinned source refs and historical Agent Native pins.

## Phase boundary

The next bounded decision is whether to authorize and execute one or more proof stages. A future proof must keep contract, fixture/client, owner-integrated, and deployment/artifact evidence separate.
