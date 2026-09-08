---
slice_id: S1
seam_id: SEAM-7B
execution_horizon: active
status: exec-ready
plan_version: v1
basis_ref: seam.md#seam-brief-restated
threads:
  - THR-01
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

### S1 — CT-9B Contract Baseline

- **User/system value**: downstream review, mapping, and promotion seams get one explicit proof metadata contract instead of reverse-engineering Storybook stories or generated docs.
- **Scope (in/out)**:
  - **In**: the root shape and versioning rules for `storybook/story-inventory.json`; the root shape and identity rules for `storybook/component-specs/<component-id>.json`; the repo-owned component-tier coverage policy; reserved downstream mapping hooks that remain repo-owned instead of vendor-owned.
  - **Out**: backfilling every component in the design system; implementing proof validators against live Storybook stories; publishing Chromatic or mapping/link artifacts.
- **Acceptance criteria**:
  - `CT-9B` names the validator kind set exactly as listed in `threading.md`: `default`, `variant-matrix`, `state-matrix`, `actions`, `controlled`, `keyboard`, `focus`, `workflow`, `motion`, `async`, `docs`, `responsive`, `composition`.
  - The inventory contract defines a version field, stable component identity, and pointers to proof-story coverage without storing token or recipe truth locally.
  - The component-spec contract binds component identity, tier, required story coverage, and reserved downstream mapping hooks in repo-owned fields.
  - The coverage policy freezes the exact tier enum and required-kind matrix in the same PR as the schema, so later seams do not infer tier rules from folder names or reviewer memory.
- **Dependencies**: inherited `SEAM-4`; `CT-H1`; `CT-H2`; `THR-01`
- **Verification**: compare the schema and coverage policy line-by-line against `harness-future-rails/threading.md`; confirm no field reopens token, recipe, or Figma parity ownership; confirm the contract is concrete enough that `SEAM-8B`, `SEAM-9B`, and `SEAM-10B` can name their inputs without new prose contracts.
- **Rollout/safety**: keep the first PR contract-definition only; avoid backfilling component data until the schema, versioning, and tier policy are frozen.
- **Review surface refs**: `review.md#r1--proof-contract-authoring-and-review-flow`, `review.md#r2--proof-metadata-and-validator-data-flow`

#### S1.T1 — Freeze the proof inventory schema and vocabulary

- **Outcome**: `storybook/story-inventory.json` becomes a repo-owned contract with explicit versioning, stable component references, and the exact validator kind vocabulary downstream seams must consume.
- **Inputs/outputs**:
  - **Inputs**: `CT-H1`, `CT-H2`, `THR-01`, current Storybook proof-story organization, `harness-future-rails/threading.md`
  - **Outputs**: the committed inventory contract at `storybook/story-inventory.json` plus an adjacent schema or typed validator entrypoint such as `storybook/story-inventory.schema.json` or `scripts/storybook/validate-story-inventory.ts`
- **Thread/contract refs**: consumes `CT-H1`, `CT-H2`, `THR-01`; advances `THR-02` and `THR-08`
- **Implementation notes**: freeze one root version field, one stable component identifier field, one owned list of implemented proof story refs, and one owned list of validator kinds per component. Keep generated token docs and recipe docs as references only; never duplicate their values inside the inventory.
- **Acceptance criteria**:
  - Breaking changes to the inventory shape require an explicit version bump rule in the contract.
  - No validator kind outside the `threading.md` vocabulary is accepted.
  - Story refs are stable enough for later visual-review selection without inventing new identity rules.
  - The inventory remains repo-authored and reviewable; it is not generated solely from Storybook runtime output.
- **Test notes**: dry-run the schema against at least one existing proof-story cluster and confirm the validator rejects unknown kind names and missing component IDs.
- **Risk/rollback notes**: the largest risk is overfitting to today’s story layout; keep the contract focused on stable identity and coverage facts, not ephemeral file paths beyond story ownership.

Checklist:

- Implement: author the inventory contract and its schema or typed validator entrypoint.
- Test: validate one sample component entry against the schema and an intentionally invalid validator kind.
- Validate: confirm the contract references generated artifacts instead of copying token or recipe truth.
- Cleanup: add cross-links back to `harness-future-rails/threading.md` so later seams reuse the same vocabulary.

#### S1.T2 — Freeze the reusable-component spec schema and identity hooks

- **Outcome**: each reusable component gets one repo-owned spec file that binds stable identity, tier, required proof coverage, and reserved downstream hooks without emitting downstream projections yet.
- **Inputs/outputs**:
  - **Inputs**: `CT-H1`, `CT-H2`, `CT-9B`, `THR-04`, current reusable-component story surfaces
  - **Outputs**: `storybook/component-specs/<component-id>.json` contract docs or examples plus any validating schema/type definitions required to keep the shape stable
- **Thread/contract refs**: consumes `CT-H1`, `CT-H2`; advances `THR-04`
- **Implementation notes**: reserve repo-owned fields for `componentId`, tier, required story kinds, owned story refs, generated artifact refs, and downstream mapping hooks. The hook object may name repo-owned entrypoints or references, but it must not become a Storybook Connect or Code Connect descriptor.
- **Acceptance criteria**:
  - Each spec shape makes component identity explicit and independent of folder names or vendor metadata.
  - The spec binds required story coverage by kind instead of leaving coverage implied by prose.
  - Generated token docs, recipe docs, and runtime parity surfaces are referenced as upstream artifacts, not rewritten into the spec.
  - Downstream hooks are explicit enough that `SEAM-9B` can project from them later without inventing new identity.
- **Test notes**: validate one sample spec against the schema and confirm a reviewer can answer which proof kinds are required for that component without opening multiple story files.
- **Risk/rollback notes**: if hook fields start to accumulate vendor-specific projection data, cut them back to repo-owned references and move the projection detail into `SEAM-9B`.

Checklist:

- Implement: define the component-spec schema and one example record.
- Test: run schema validation on the example and on an intentionally incomplete spec.
- Validate: confirm component identity, tier, and required kinds are all reviewer-visible in one file.
- Cleanup: document which fields are reserved for downstream projection work so later seams do not fork the schema.

#### S1.T3 — Publish the component-tier required-coverage policy

- **Outcome**: the repo has one concrete matrix that names the exact tier enum and the minimum proof kinds required per tier.
- **Inputs/outputs**:
  - **Inputs**: `CT-9B`, `THR-02`, `THR-08`, current proof-story expectations, downstream needs from `SEAM-8B`, `SEAM-9B`, and `SEAM-10B`
  - **Outputs**: a repo-owned policy entrypoint such as `storybook/component-tier-policy.json` or an equivalent checked-in policy module consumed by validators
- **Thread/contract refs**: advances `THR-02` and `THR-08`
- **Implementation notes**: keep the first matrix minimal. Tie each required kind to a concrete downstream consumer or review need; optional kinds should stay optional until a later seam proves they must be required.
- **Acceptance criteria**:
  - The exact tier enum is frozen in the contract rather than inferred from folder structure.
  - Each required kind has a stated consumer or review purpose.
  - The policy can be consumed by a validator without additional prose translation.
  - The policy does not require future seams to invent new proof kinds to explain coverage gaps.
- **Test notes**: walk the matrix with one maintainer and confirm they can identify what minimum proof coverage a pilot reusable component needs before it is considered complete for `SEAM-7B`.
- **Risk/rollback notes**: over-broad coverage requirements will stall adoption; start from the smallest matrix that still unblocks downstream rails.

Checklist:

- Implement: add the tier-policy entrypoint that the validator can consume directly.
- Test: validate that each tier resolves to a finite required-kind set.
- Validate: confirm every required kind has a concrete downstream consumer or review purpose.
- Cleanup: mark non-required kinds as optional so future rails do not mistake them for blockers.
