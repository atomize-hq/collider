# Collider Agent Native — canonical research/adjudication/proof handoff

**Bundle role:** Self-contained handoff after the corrected Agent Native evaluation and bounded adjudication.  
**Current phase:** Owner-boundary/proof planning.  
**Implementation authorization:** None.  
**Dependency/adoption authorization:** None.

## 1. What is current in this bundle

The canonical Collider inputs are:

- [`canonical/00-collider-v1-glossary.md`](canonical/00-collider-v1-glossary.md)
- [`canonical/01-collider-v1-foundations.md`](canonical/01-collider-v1-foundations.md)
- [`canonical/02-collider-v1-open-architecture-questions.md`](canonical/02-collider-v1-open-architecture-questions.md)

`00` and `01` are preserved byte-for-byte from the verified research bundle. `02` is the only canonical document changed by this packet. It now records the completed corrected evaluation, bounded adjudication, provisional proof shortlist, controller/owner-boundary hazards, evidence stages, and the next evaluation sequence while keeping all 27 open questions Open.

The proof-planning document is:

- [`proof/agentkit-owner-boundary-proof-spec.md`](proof/agentkit-owner-boundary-proof-spec.md)

It is non-normative and does **not** authorize implementation. It defines what a separately authorized proof would have to establish.

## 2. Research and adjudication status

The corrected Agent Native evaluation and adjudication are included under `research/` and `adjudication/`.

The advisory disposition is:

> **ADJUST — retain AgentKit/Toolkit as serious proof candidates; defer adoption. Preserve Collider-defined semantics and owner-system authority, not bespoke implementations. Keep bounded frontend forks and broader owner-preserving adaptations as genuine alternatives.**

No Agent Native, AgentKit, Toolkit, Core, sidecar, fork, controller, datastore, or dependency is selected for production.

## 3. Missing evidence

The corrected evaluation states that it produced a machine-readable `agent-native-collider-evidence-ledger.json`, but those original bytes were not recovered. The claimed SHA-256 is documented in [`adjudication/MISSING-EVIDENCE.md`](adjudication/MISSING-EVIDENCE.md) but was not independently verified.

The included [`adjudication/adjudication-check-record.md`](adjudication/adjudication-check-record.md) is **new adjudication evidence**, not a reconstructed ledger.

The included `research/bb-research-source-ledger.json` belongs to the earlier BB investigation and is unrelated to the missing Agent Native ledger.

Historical reports may contain stale `sandbox:/...` links from their original sessions. Use the files included in this bundle instead. Do not treat an inaccessible historical link as missing when the corresponding artifact is present here.

## 4. How to use this bundle

Before any proof or implementation work:

1. Run `python3 meta/VERIFY-BUNDLE.py` from the bundle root.
2. Read `canonical/00`, `canonical/01`, and the updated `canonical/02`.
3. Read `adjudication/adjudication-result.md` and `adjudication/adjudication-decision-coverage.md`.
4. Use `adjudication/adjudication-check-record.md` for the exact evidence limitations and report-pinned source rechecks.
5. Read `proof/agentkit-owner-boundary-proof-spec.md` before proposing or authorizing any proof branch.
6. Use `meta/REPOSITORIES.json` for the adjudication-pinned repository refs; refresh refs only when the controlling task explicitly requires current heads.

Do not rerun the broad Agent Native investigation unless specifically authorized. The next research/engineering boundary is the owner-contract inventory and staged proof defined by the proof specification.

## 5. What may proceed independently

Implementation-neutral Workspace Shell design may continue where product behavior is already settled. The AgentKit/Toolkit decision MUST NOT be used to choose canonical history storage, provisional execution vocabulary, or owner authority.

Execution and Binding work should consume real owner-supported operations and the owner-surface inventory. Where a required path is unavailable, record it as unavailable/unproved rather than inventing a candidate-shaped backend contract.

## 6. Integrity

See:

- [`meta/INPUTS.md`](meta/INPUTS.md)
- [`meta/MANIFEST.json`](meta/MANIFEST.json)
- [`meta/SHA256SUMS.txt`](meta/SHA256SUMS.txt)
- [`meta/REPOSITORIES.json`](meta/REPOSITORIES.json)
