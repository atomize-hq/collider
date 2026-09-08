---
slice_id: S3
seam_id: SEAM-7B
execution_horizon: active
status: exec-ready
plan_version: v1
basis_ref: seam.md#seam-brief-restated
threads:
  - THR-02
  - THR-04
  - THR-08
contracts_produced:
  - CT-9B
contracts_consumed:
  - CT-H1
  - CT-H2
open_remediations:
  - REM-001
---

### S3 — Proof Conformance And Gating

- **User/system value**: maintainers and downstream seams can trust `CT-9B` because missing proof coverage becomes machine-visible and eventually required, not a best-effort review convention.
- **Scope (in/out)**:
  - **In**: structural validation for the inventory and component specs; machine-readable missing-coverage reporting; a clear informational-to-required ratchet that must go green before `SEAM-8B` treats `CT-9B` as published.
  - **Out**: Chromatic checks, mapping/link projection code, reusable-component promotion policy, or broad design-system migration beyond the pilot.
- **Acceptance criteria**:
  - Validators can fail on schema drift, unknown validator kinds, missing required story coverage, and missing generated artifact refs.
  - Validator output includes a machine-readable coverage report that later seams can consume without scraping prose.
  - The repo has one documented gate transition from informational mode to required mode for `CT-9B`.
  - `THR-02`, `THR-04`, and `THR-08` have explicit evidence conditions for publication rather than ambiguous “done enough” language.
- **Dependencies**: `S1`; `S2`; `CT-9B`; `THR-02`; `THR-04`; `THR-08`
- **Verification**: run the validator on the pilot family; confirm machine-readable output distinguishes schema failures from coverage failures; confirm the required gate only turns on after the pilot is green and the policy text is committed.
- **Rollout/safety**: keep the first validator in informational mode long enough to expose inventory drift; then ratchet to required in a dedicated PR so failures are attributable to coverage, not schema churn.
- **Review surface refs**: `review.md#r2--proof-metadata-and-validator-data-flow`, `review.md#r3--touch-surface-handoff-map`, `review.md#r4--sequence-for-informational-to-required-gating`

#### S3.T1 — Implement structural validation for inventory and component specs

- **Outcome**: one validator entrypoint can prove that the inventory, component specs, and tier policy are structurally sound before any downstream seam consumes them.
- **Inputs/outputs**:
  - **Inputs**: `S1.T1`, `S1.T2`, `S1.T3`, pilot data from `S2`
  - **Outputs**: a validator entrypoint under `scripts/**` or `storybook/**` that checks schema shape, validator kind vocabulary, required fields, and spec-to-inventory referential integrity
- **Thread/contract refs**: consumes `CT-9B`; advances `THR-02`, `THR-04`, `THR-08`
- **Implementation notes**: keep validation concerns seam-local. Structural validation should fail on unknown kinds, duplicate component IDs, missing spec files, broken story refs, and any generated artifact reference that no longer resolves to an upstream owned surface.
- **Acceptance criteria**:
  - Validator failures distinguish schema drift from missing coverage.
  - Referential integrity between inventory entries and component specs is enforced.
  - Generated artifact refs are validated as references to upstream-owned surfaces, not freeform strings.
  - The validator can run locally without downstream seam code.
- **Test notes**: add passing and failing fixtures or pilot examples that demonstrate duplicate IDs, unknown kinds, and missing refs.
- **Risk/rollback notes**: do not mix downstream policy into the validator; if a rule is only for visual review or promotion, leave it for the later seam that owns it.

Checklist:

- Implement: add the structural validator entrypoint and fixtures.
- Test: run the validator on both valid pilot data and intentionally broken samples.
- Validate: confirm failures name the broken contract field or missing ref directly.
- Cleanup: keep downstream-only rules out of the validator until those seams own them.

#### S3.T2 — Emit a machine-readable proof coverage report

- **Outcome**: maintainers and future rails can inspect proof coverage from one generated status surface instead of reading prose or scraping Storybook pages.
- **Inputs/outputs**:
  - **Inputs**: `CT-9B`, validator output, pilot coverage data
  - **Outputs**: a generated coverage report such as `artifacts/storybook/proof-coverage.json` plus an optional concise console or markdown summary for human review
- **Thread/contract refs**: advances `THR-08`; supports `THR-02` and `THR-04`
- **Implementation notes**: the report should identify component ID, tier, required kinds, implemented kinds, missing kinds, and referenced generated artifacts. Keep it generated from the validator so it cannot drift from the contract source.
- **Acceptance criteria**:
  - The report is machine-readable and stable enough for later seams to consume directly.
  - Missing required kinds are explicit per component.
  - The report is generated from `CT-9B` data rather than hand-authored.
  - Reviewers can tell whether the pilot family is ready without opening each story manually.
- **Test notes**: snapshot one passing and one failing pilot report so drift is easy to spot during review.
- **Risk/rollback notes**: avoid baking downstream review URLs or mapping descriptors into this report; keep it scoped to proof coverage facts.

Checklist:

- Implement: generate the proof-coverage report from validator output.
- Test: snapshot a passing and failing report for the pilot family.
- Validate: confirm report fields align with `CT-9B` and do not introduce vendor-shaped truth.
- Cleanup: keep the report path and field names stable once `SEAM-8B` starts consuming them.

#### S3.T3 — Ratchet CT-9B from informational mode to required gate

- **Outcome**: `CT-9B` becomes a required precondition for `SEAM-8B` consumption, with explicit evidence rules for when seam-owned outbound threads may be treated as published.
- **Inputs/outputs**:
  - **Inputs**: green pilot validation, coverage report semantics, `REM-001`, downstream dependency notes from `threading.md`
  - **Outputs**: one repo-owned gate definition or task-runner entrypoint, plus an implementation note describing when `THR-02`, `THR-04`, and `THR-08` may be marked published in seam closeout
- **Thread/contract refs**: advances `THR-02`, `THR-04`, `THR-08`; closes `REM-001` once evidence lands
- **Implementation notes**: keep the ratchet explicit. The first required gate should block on schema validity plus pilot-family required coverage only; broader design-system rollout can stay follow-up work after the contract is published.
- **Acceptance criteria**:
  - The repo has one named command or gate that asserts `CT-9B` validity for the pilot scope.
  - The gate conditions for thread publication are explicit and reviewable.
  - `SEAM-8B` has a clear basis for when it may start consuming the proof inventory.
  - Any remaining broad backfill work is clearly separated from the contract publication event.
- **Test notes**: run the gate once on passing pilot data and once with an intentionally removed required kind to prove the failure mode is actionable.
- **Risk/rollback notes**: turning the gate on too early will stall adoption; limit the first required scope to the pilot family and published contract evidence.

Checklist:

- Implement: add the named required gate and the seam-owned publication criteria.
- Test: prove the gate passes on complete pilot data and fails on a missing required kind.
- Validate: confirm thread publication criteria are explicit enough for seam closeout evidence.
- Cleanup: separate broad component backfill into later follow-up work instead of expanding the first required gate.
