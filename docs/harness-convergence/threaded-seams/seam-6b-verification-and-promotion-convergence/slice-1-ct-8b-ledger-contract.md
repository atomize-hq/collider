### S1 — CT-8B ledger contract

- **User/system value**: downstream implementation owners get one concrete, machine-readable status shape for the Figma rail instead of inheriting ambiguous prose from historical seam-5 or seam-6 notes.
- **Scope (in/out)**:
  - In: `src/figma/sync-ledger.json` shape; allowed root keys; required fields and enums; earned-level vocabulary; deferred versus required parity rules at the schema level.
  - Out: validator implementation; plugin or OAuth transport implementation; CI-job wiring.
- **Acceptance criteria**:
  - `CT-8B` is restated as a concrete ledger contract with no placeholder fields.
  - The ledger shape makes `declared`, `published`, `verified`, `deferred`, `required`, and `promotion-complete` distinguishable without prose.
  - `D-publish-valid` and `E-promotion-complete` have explicit field-level preconditions tied to the current artifact revision.
- **Dependencies**: inherited `SEAM-4`; `SEAM-5B`; `CT-H1`; `CT-H2`; `CT-7B`
- **Verification**: review the slice against `threading.md` and confirm every `CT-8B` rule in the contract registry appears exactly once with stable naming and allowed values.
- **Rollout/safety**: additive planning artifact only; no production behavior changes.

#### S1.T1 — Freeze the ledger schema and storage surface

- **Outcome**: a single schema definition for `src/figma/sync-ledger.json` names every required root key, nested object, enum, and conditional field rule required by `CT-8B`.
- **Inputs/outputs**:
  - Inputs: `threading.md` contract registry; `seam-6b-verification-and-promotion-convergence.md`
  - Outputs: documented schema contract for `ledgerVersion`, `artifact`, `publish`, `verification`, `promotion`, and `exceptions`
- **Implementation notes**: keep `ledgerVersion="2"` and `artifact.path="design-tokens/dist/figma/tokens.json"` literal so downstream validators do not infer alternate paths.
- **Acceptance criteria**:
  - All `CT-8B` root keys and field rules are represented.
  - `publish.mode` and `publish.tokensStudioCarrier` rules match `CT-7B`.
  - No field implies that Figma can become canonical.
- **Test notes**: perform a checklist review against the `CT-8B` definition in `threading.md`; verify no extra root keys or alternate enum values were introduced.
- **Risk/rollback notes**: if an upstream rail field is still disputed, stop at the boundary and record the missing upstream decision instead of inventing a ledger field in this seam.

Checklist:

- Implement: write the explicit schema section for the ledger path and required keys.
- Test: compare every field and enum against `CT-8B` in `threading.md`.
- Validate: confirm the schema still points only at `design-tokens/dist/figma/tokens.json`.
- Cleanup: remove any prose that duplicates schema rules with weaker wording.

#### S1.T2 — Map earned levels and parity transitions onto concrete fields

- **Outcome**: the planning pack explains how `A-source-valid` through `E-promotion-complete` are represented or constrained by ledger fields, with explicit preconditions for `deferred` versus `required`.
- **Inputs/outputs**:
  - Inputs: `CT-H1`; `CT-H2`; `CT-7B`; target-state promotion ladder
  - Outputs: a field-to-promotion-level mapping for `verification.materializationStatus`, `verification.lastVerifiedRevision`, `promotion.parityMode`, `promotion.parityDeferredReason`, and `promotion.highestEarnedLevel`
- **Implementation notes**: treat `A` through `C` as inherited prerequisites, and only let this seam define how `D` and `E` consume them.
- **Acceptance criteria**:
  - `plugin-import-manual` may reach `D-publish-valid` only while `promotion.parityMode="deferred"`.
  - `rest-variables-oauth` is the only allowed hardening target before `promotion.parityMode="required"`.
  - `E-promotion-complete` is explicitly forbidden while parity remains deferred.
- **Test notes**: walk one deferred example and one required example and confirm both can be evaluated from fields alone.
- **Risk/rollback notes**: do not encode `SEAM-5B` success-marker details here beyond what the ledger must consume; those remain owned by the upstream seam.

Checklist:

- Implement: define the promotion-level decision table and parity transition rules.
- Test: validate one happy path for deferred proof mode and one happy path for required parity.
- Validate: confirm the table never bypasses inherited `A/B/C` requirements.
- Cleanup: strip any wording that suggests manual judgment is enough without ledger evidence.

#### S1.T3 — Add canonical examples for happy-path and blocked ledger states

- **Outcome**: downstream implementers have concrete sample payloads for a valid deferred proof state, a valid required-parity state, and a blocked or incomplete state.
- **Inputs/outputs**:
  - Inputs: outputs from `S1.T1` and `S1.T2`
  - Outputs: example ledger payloads or field snapshots tied to the contract
- **Implementation notes**: examples should show `exceptions=[]` on the happy path and at least one explicit blocking exception on the blocked path.
- **Acceptance criteria**:
  - Each example uses the exact required root keys.
  - The blocked example demonstrates why missing or stale verification cannot be promoted.
  - The required-parity example uses `rest-variables-oauth`, not `plugin-import-manual`.
- **Test notes**: validate the examples by reading them back against the decision table from `S1.T2`.
- **Risk/rollback notes**: examples must not become a second source of truth; if they drift from the schema, the schema wins.

Checklist:

- Implement: add one deferred example, one required example, and one blocked example.
- Test: check each example against the schema and promotion mapping.
- Validate: confirm the blocked example fails because of explicit fields, not prose.
- Cleanup: remove redundant narrative once the examples are self-explanatory.
