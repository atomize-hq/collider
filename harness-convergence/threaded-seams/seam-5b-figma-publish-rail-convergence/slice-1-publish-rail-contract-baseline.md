### S1 — Publish Rail Contract Baseline

- **User/system value**: designers, tooling maintainers, and downstream governance work from one exact repo-to-Figma rail contract instead of historical seam-5 assumptions or ad hoc plugin behavior.
- **Scope (in/out)**:
  - In: the approved source artifact path, the allowed publish mode vocabulary, the downstream-only source-of-truth rule, and seam-owned publish-proof semantics that `SEAM-6B` will later embed into `CT-8B`.
  - Out: executing a Figma import, implementing OAuth credentials, or defining the `CT-8B` ledger root keys and promotion ladder.
- **Acceptance criteria**:
  - `CT-7B` is restated in implementation-facing docs with `design-tokens/dist/figma/tokens.json` as the only approved rail source artifact.
  - The allowed modes are exactly `plugin-import-manual`, `rest-variables-oauth`, and optional `tokens-studio-carried`, with Tokens Studio explicitly forbidden as a terminal or required rail.
  - The contract states that no Figma write-back may redefine canonical repo values.
  - Publish-proof semantics are explicit enough that `SEAM-6B` can consume them without inventing new meaning for mode, artifact revision, or carrier state.
- **Dependencies**: inherited `SEAM-1/CT-H1`, inherited `SEAM-3/CT-H2`
- **Verification**: review the contract docs against `harness-convergence/threading.md`; confirm the published vocabulary and artifact path exactly match `CT-7B`; confirm no task here defines `CT-8B`-owned ledger root structure.
- **Rollout/safety**: keep the first PR documentation-first and seam-local; do not let tooling defaults or plugin screenshots become the contract.

#### S1.T1 — Publish the `CT-7B` rail policy entrypoint

- **Outcome**: one implementation-facing policy entrypoint states what may be published to Figma, from where, and under which allowed modes.
- **Inputs/outputs**:
  - Inputs: `CT-H1`, `CT-H2`, `harness-convergence/threading.md`, `harness-convergence/seam-5b-figma-publish-rail-convergence.md`
  - Outputs: `src/figma/README.md` or `src/figma/publish-rail.md` naming the approved source artifact, allowed modes, canonical-source rule, and forbidden write-back behaviors.
- **Implementation notes**: use the exact mode names from `CT-7B`. State that `plugin-import-manual` is the default proof target, `rest-variables-oauth` is the only approved hardening target, and `tokens-studio-carried` is optional temporary carriage only. Keep the artifact boundary fixed at `design-tokens/dist/figma/tokens.json`.
- **Acceptance criteria**:
  - The doc names the canonical repo surfaces that remain authoritative.
  - The doc fixes the Figma source artifact path and does not allow alternate hand-maintained JSON sources.
  - The doc distinguishes proof rail versus hardened rail without implying both are already implemented.
  - The doc makes Tokens Studio temporary and replaceable rather than required.
- **Test notes**: walk the doc with one maintainer who did not author it and confirm they can answer which source artifact, mode names, and write-back rules are allowed.
- **Risk/rollback notes**: policy drift is the main risk; keep the contract in one entrypoint and link other docs to it instead of duplicating wording.

Checklist:

- Implement: author the Figma publish-rail policy entrypoint under `src/figma/**`.
- Test: compare the doc line-by-line against `CT-7B` in `harness-convergence/threading.md`.
- Validate: confirm the doc forbids any Figma-originated value change from becoming canonical without a repo PR.
- Cleanup: add local cross-links or supersession notes so implementers land on the `SEAM-5B` rail contract without rewriting historical `figma-ci-sync/*` docs.

#### S1.T2 — Define seam-owned publish-proof semantics for downstream verification

- **Outcome**: `SEAM-5B` publishes the exact publish-proof facts that downstream ledger work must carry forward, without taking ownership of the ledger root contract.
- **Inputs/outputs**:
  - Inputs: `CT-7B`, `SEAM-6B` brief, target-state harness publish/verification sections
  - Outputs: a seam-owned contract appendix such as `src/figma/publish-proof-contract.md` or `src/figma/publish-proof.example.json` documenting the required proof facts for each rail attempt.
- **Implementation notes**: keep this scoped to publish semantics only. The publish-proof contract should require, at minimum, the active mode, source artifact path, source artifact revision, destination Figma file reference, materialization outcome, and whether Tokens Studio was used as temporary carrier. Do not define the full `src/figma/sync-ledger.json` root structure here; that remains `CT-8B` work.
- **Acceptance criteria**:
  - The seam-owned proof contract uses the exact three mode values from `CT-7B`.
  - The proof contract makes the artifact revision mandatory for any successful publish proof.
  - The proof contract distinguishes “carrier used temporarily” from “carrier is required,” with only the first allowed.
  - The handoff is concrete enough that `SEAM-6B` can map it into `publish.*` and `verification.*` fields without inventing missing semantics.
- **Test notes**: review the appendix with the `SEAM-6B` owner and confirm no missing publish facts remain for later ledger adoption.
- **Risk/rollback notes**: if this contract drifts from `CT-8B` later, resolve it by updating `SEAM-6B`; do not let `SEAM-5B` silently start owning ledger shape.

Checklist:

- Implement: add the seam-owned publish-proof appendix under `src/figma/**`.
- Test: confirm the appendix is limited to rail semantics and does not introduce extra mode values or alternate artifact paths.
- Validate: map each required publish-proof fact to a downstream `SEAM-6B` consumer need.
- Cleanup: keep any example payloads minimal so they do not become a second, competing schema surface.
