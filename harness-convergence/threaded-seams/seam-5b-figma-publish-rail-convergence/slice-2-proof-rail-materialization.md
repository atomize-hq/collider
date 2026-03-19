### S2 — Proof Rail Materialization

- **User/system value**: the project gets an end-to-end proof that the approved artifact can reach Figma through `plugin-import-manual` without manual value transcription or source-of-truth drift.
- **Scope (in/out)**:
  - In: one pilot Figma file, one deterministic proof-oriented importer path, one recorded publish attempt tied to the current generated artifact revision.
  - Out: hardened OAuth automation, CI gating, or permanent multi-file Figma rollout.
- **Acceptance criteria**:
  - A maintainer can materialize the current `design-tokens/dist/figma/tokens.json` artifact into a pilot Figma file through `plugin-import-manual`.
  - The proof flow requires no manual value re-entry or undocumented interpretation.
  - The publish attempt records the source artifact revision, destination file, active mode, and materialization result using the seam-owned proof contract from `S1`.
  - Any failure state is explicit and reviewable rather than hidden in prose or screenshots.
- **Dependencies**: `S1`, inherited `SEAM-3/CT-H2`
- **Verification**: execute the proof flow against a current artifact revision; inspect the recorded publish proof; confirm the imported values came from the generated artifact rather than manual patch-up.
- **Rollout/safety**: keep this limited to one pilot file and one proof mode; do not expand scope into production parity before the hardened rail exists.

#### S2.T1 — Wire a proof-only importer path around the generated Figma artifact

- **Outcome**: maintainers have one documented, reproducible way to feed `design-tokens/dist/figma/tokens.json` into a pilot Figma file through `plugin-import-manual`.
- **Inputs/outputs**:
  - Inputs: `S1.T1` rail policy entrypoint, `S1.T2` publish-proof contract, `design-tokens/dist/figma/tokens.json`
  - Outputs: proof-only importer or plugin configuration under the agreed Figma touch surface, plus a runbook that points to the pilot file and artifact refresh steps.
- **Implementation notes**: the importer path may be repo-owned or OSS-backed, but it must consume the generated artifact directly and avoid undocumented mapping logic. Keep the implementation proof-only: human-triggered execution is acceptable, silent manual interpretation is not.
- **Acceptance criteria**:
  - The proof path can be executed by a maintainer other than the author.
  - The importer consumes `design-tokens/dist/figma/tokens.json` directly.
  - The runbook names the pilot file and the exact refresh sequence from current artifact generation to Figma materialization.
  - No bidirectional sync or write-back capability is introduced.
- **Test notes**: perform one dry run on a fresh artifact revision and confirm the runbook is sufficient without out-of-band setup knowledge.
- **Risk/rollback notes**: tool-specific drift is the main risk; if the chosen importer becomes unstable, replace the importer while preserving the `plugin-import-manual` contract and artifact boundary.

Checklist:

- Implement: add the proof-only importer path and its pilot-file runbook.
- Test: execute the runbook from a current generated artifact to a pilot Figma file.
- Validate: confirm the flow consumes the repo artifact directly and never asks the operator to type token values manually.
- Cleanup: keep plugin-specific setup notes isolated so they can be swapped without changing `CT-7B`.

#### S2.T2 — Record and review the pilot publish proof for the current artifact revision

- **Outcome**: the seam produces one current, reviewable publish-proof record showing whether `plugin-import-manual` succeeded for the chosen artifact revision.
- **Inputs/outputs**:
  - Inputs: `S1.T2` publish-proof contract, `S2.T1` proof path, current git revision, pilot Figma file reference
  - Outputs: a publish-proof record under `src/figma/**` or another seam-owned surface that captures the current attempt and its result.
- **Implementation notes**: record success and failure using the same seam-owned fields. The minimum happy-path facts are mode=`plugin-import-manual`, artifact path=`design-tokens/dist/figma/tokens.json`, current artifact revision, pilot file reference, materialization outcome=`passed`, and whether any temporary carrier was used. If a carrier was used, record why and the exit expectation.
- **Acceptance criteria**:
  - The record points to the exact artifact revision used for the attempt.
  - The record identifies the pilot destination file unambiguously.
  - The record makes failure visible when materialization does not succeed.
  - The record can be consumed later by `SEAM-6B` without re-running the proof just to understand the semantics.
- **Test notes**: review both a happy-path record and one intentionally incomplete record to confirm missing artifact revision or destination data is treated as invalid proof.
- **Risk/rollback notes**: stale proof is the main risk; if the artifact revision changes, mark the proof outdated rather than implicitly carrying it forward.

Checklist:

- Implement: write one publish-proof record for the current pilot attempt.
- Test: verify the record includes mode, artifact path, artifact revision, destination file, and materialization result.
- Validate: confirm the recorded revision matches the generated artifact used in the pilot run.
- Cleanup: archive superseded proof records or mark them stale so only one current proof claim remains active.
