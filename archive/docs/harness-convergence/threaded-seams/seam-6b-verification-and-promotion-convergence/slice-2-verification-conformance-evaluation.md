### S2 — Verification conformance evaluation

- **User/system value**: maintainers can prove whether the active Figma rail has been exercised successfully for the current artifact revision, instead of relying on a stale pilot run or ambiguous human memory.
- **Scope (in/out)**:
  - In: freshness semantics; revision binding; materialization-status transitions; exception structure; validator input and output expectations for local or CI consumers.
  - Out: implementing the plugin rail, OAuth app, or CI jobs themselves.
- **Acceptance criteria**:
  - The seam defines how validation reads `src/figma/sync-ledger.json` and determines whether the current revision is declared, verified, stale, or blocked.
  - Stale artifact proofs and missing verification data are treated as non-promotable states.
  - Temporary Tokens Studio carrier usage is recorded as a carrier-only condition, not as a permanent rail.
- **Dependencies**: `S1`; inherited `SEAM-4`; `SEAM-5B`; `CT-H2`; `CT-7B`
- **Verification**: review each validator expectation against the `CT-8B` field rules and verify that every decision path names the ledger fields it depends on.
- **Rollout/safety**: the slice only defines reader semantics and failure conditions; actual enforcement remains future implementation work.

#### S2.T1 — Define ledger-reader evaluation states and failure semantics

- **Outcome**: a validator contract exists for consumers that read the ledger and emit a deterministic state such as `declared`, `verified-current`, `verified-stale`, `blocked-exception`, or `incomplete`.
- **Inputs/outputs**:
  - Inputs: `CT-8B` schema from `S1`; target-state verification-rail rules
  - Outputs: evaluator state model and failure semantics for ledger readers
- **Implementation notes**: the evaluator should be field-driven and should not rely on free-form prose to classify status.
- **Acceptance criteria**:
  - Each evaluator state names the minimum required fields.
  - Missing `verification.lastVerifiedRevision` or a mismatched revision is treated as stale or incomplete, not silently accepted.
  - `exceptions` entries can block promotion without redefining the upstream publish contract.
- **Test notes**: table-test the evaluator with the example payloads from `S1.T3`.
- **Risk/rollback notes**: do not overload evaluator states with remediation guidance; keep the contract focused on deterministic status output.

Checklist:

- Implement: define evaluator states, inputs, outputs, and blocking behavior.
- Test: run the evaluator table against the happy-path and blocked examples.
- Validate: confirm no state can be inferred without ledger evidence.
- Cleanup: remove any duplicate prose descriptions of the same state machine.

#### S2.T2 — Specify freshness and publish-proof requirements for the current artifact revision

- **Outcome**: the seam documents exactly how a validator determines that the proof or hardening rail was exercised against the current `design-tokens/dist/figma/tokens.json` revision.
- **Inputs/outputs**:
  - Inputs: `CT-H2`; `CT-7B`; `verification.lastVerifiedRevision`; `artifact.path`
  - Outputs: current-revision freshness rules and required publish-proof markers
- **Implementation notes**: preserve `artifact.path` stability and make revision comparison mandatory before a publish-valid claim is allowed.
- **Acceptance criteria**:
  - `D-publish-valid` requires a successful materialization attempt for the same revision recorded in the ledger.
  - A successful pilot run against an older artifact revision cannot satisfy current publish validity.
  - Carrier-only Tokens Studio usage is explicitly recorded when applicable.
- **Test notes**: document one passing current-revision case and one stale-revision failure case.
- **Risk/rollback notes**: if `SEAM-5B` changes its success-marker vocabulary, update the consumed marker mapping here instead of inventing a seam-local substitute.

Checklist:

- Implement: define freshness comparison rules and proof-marker expectations.
- Test: walk a current-revision success case and a stale-revision rejection case.
- Validate: confirm the rules consume `CT-7B` rather than replacing it.
- Cleanup: remove any wording that treats old proof runs as evergreen evidence.

#### S2.T3 — Define the exception model for deferred parity and blocking conditions

- **Outcome**: exceptions become explicit machine-readable records that explain why parity remains deferred or why promotion is blocked, without weakening the happy-path contract.
- **Inputs/outputs**:
  - Inputs: `promotion.parityMode`; `promotion.parityDeferredReason`; `exceptions`
  - Outputs: exception categories, blocking rules, and review expectations
- **Implementation notes**: use the exception model for governance visibility, not as a loophole for bypassing required parity.
- **Acceptance criteria**:
  - Deferred parity requires an explicit reason.
  - Required parity forbids a deferred reason and treats unresolved blocking exceptions as promotion blockers.
  - Tokens Studio carrier usage, missing credential ownership, or incomplete hardening markers can be represented as explicit exceptions where appropriate.
- **Test notes**: validate one deferred-but-allowed case and one blocked-required-parity case.
- **Risk/rollback notes**: exception categories must remain narrow enough that later implementation can enforce them mechanically.

Checklist:

- Implement: define exception categories and which ones block `D` or `E`.
- Test: validate one deferred exception path and one blocking exception path.
- Validate: confirm the happy path still uses `exceptions=[]`.
- Cleanup: remove any exception wording that duplicates policy already carried by `parityMode`.
