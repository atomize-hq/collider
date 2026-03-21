---
slice_id: S1
seam_id: SEAM-8B
slice_kind: delivery
execution_horizon: active
status: decomposed
plan_version: v2
basis:
  currentness: current
  basis_ref: seam.md#basis
  stale_triggers:
    - Any change to landed `CT-9B` field names, proof-scope selection, or component-tier policy must be reflected here before execution starts.
gates:
  pre_exec:
    review: inherited
    contract: inherited
    revalidation: inherited
  post_exec:
    landing: pending
    closeout: pending
threads:
  - THR-02
  - THR-03
  - THR-06
contracts_produced:
  - CT-10B
contracts_consumed:
  - CT-9B
open_remediations:
  - REM-002
  - REM-005
---

### S1 — CT-10B Contract Baseline

- **User/system value**: downstream seams get one repo-owned visual-review contract with explicit schema, review-scope, and named-check semantics instead of parsing Chromatic state ad hoc.
- **Scope (in/out)**:
  - In: `artifacts/chromatic/status.json` field set and versioning, one contract document, one rollout policy document, the stable `chromatic-review` check name, and the exact `CT-9B` fields that flow into review selection.
  - Out: actual publish automation, downstream Storybook link generation, final promotion gating, or broad adoption beyond the pilot proof scope.
- **Acceptance criteria**:
  - The plan names exact required fields for `CT-10B`, including branch, git revision, proof-scope selection, build URL, diff outcome, and review mode.
  - One repo-owned document states who owns the named check, how local versus CI runs behave, and which secret or credential surface is allowed.
  - One repo-owned policy states when review is informational versus claim-relevant for reusable-component advancement.
- **Dependencies**: consumes landed `CT-9B` from `SEAM-7B`; uses the current `storybook-proof` plus `build-storybook` CI topology as the baseline; stays under the seam-level `REM-005` blocker until the upstream closeout is normalized.
- **Verification**: contract review against [review.md](./review.md#r1--branch-aware-review-publication-workflow) and [review.md](./review.md#r2--ci-and-status-normalization-data-flow), plus fixture review for at least one passed and one refused payload.
- **Rollout/safety**: keep the review rail explicitly non-blocking while only the contract and fixtures are being frozen.
- **Review surface refs**: [review.md](./review.md#r1--branch-aware-review-publication-workflow), [review.md](./review.md#r2--ci-and-status-normalization-data-flow), [review.md](./review.md#r3--touch-surface-handoff-map)

#### S1.T1 — Freeze The `CT-10B` Payload Contract

- **Outcome**: a repo-owned contract definition names the exact shape of `artifacts/chromatic/status.json` before any CI or provider wiring begins.
- **Inputs/outputs**:
  - Inputs: published `CT-9B` field names; `src/figma/publish-proof-contract.md` as the nearest contract-document precedent.
  - Outputs: `storybook/chromatic-review-contract.md` and checked-in fixtures under `scripts/fixtures/chromatic-status/**`.
- **Thread/contract refs**: consumes `CT-9B`; advances `THR-03`; defines `CT-10B`.
- **Implementation notes**: freeze root keys for `statusVersion`, `branch`, `revision`, `proofInventory`, `build`, `review`, `check`, and `generatedAt`; require `proofInventory` to carry the resolved inventory path, inventory version, selected component IDs, and selected story IDs that the publish step actually reviewed.
- **Acceptance criteria**: the contract document states the required keys, allowed enum values, and backward-compatibility rule for provider changes; fixtures include passed, changed, failed, and skipped or deferred examples.
- **Test notes**: review fixtures manually and run the future validator against at least one valid and one invalid example before wiring CI.
- **Risk/rollback notes**: if `CT-9B` still changes, revise the contract doc before any code wiring lands; do not let workflow logic become the source of truth for field semantics.

Checklist:

- Implement: author `storybook/chromatic-review-contract.md` with exact payload semantics.
- Test: add fixture JSON files under `scripts/fixtures/chromatic-status/**`.
- Validate: confirm every required `CT-10B` field traces back to `CT-9B` or provider output.
- Cleanup: remove any placeholder fields that would force downstream seams to parse vendor-specific payloads.

#### S1.T2 — Freeze Publish Command And Check Ownership

- **Outcome**: the plan names one stable command and one stable CI owner for the review rail.
- **Inputs/outputs**:
  - Inputs: `package.json`, `.github/workflows/ci.yml`, current `build-storybook` job.
  - Outputs: a planned `pnpm chromatic:review` command in `package.json`, a named `chromatic-review` job or step in `.github/workflows/ci.yml`, and a normalizer helper target at `scripts/lib/chromatic-status.mjs`.
- **Thread/contract refs**: consumes `CT-9B`; advances `THR-03`; supports `CT-10B`.
- **Implementation notes**: the command must publish the already-built Storybook output for the resolved git SHA instead of rebuilding ad hoc; the CI owner must be the only path allowed to emit the named status in shared branches; credential use stays confined to CI through one approved secret surface.
- **Acceptance criteria**: the plan names the command, the workflow owner, the allowed credential surface, and the rule that local runs may validate or dry-run but may not impersonate the shared branch-review status.
- **Test notes**: review the planned owner against the current `build-storybook` job so build and publish do not diverge on revision or output directory.
- **Risk/rollback notes**: if the workflow topology changes after this refresh, revalidate this task before implementing it; do not spread publish logic across multiple jobs with no single owner.

Checklist:

- Implement: record the planned command, workflow owner, and helper-module path.
- Test: compare the planned owner against the current `build-storybook` job boundaries.
- Validate: confirm the same git SHA and build directory flow through build, publish, and status emission.
- Cleanup: remove any alternate owner or duplicate command proposal from the seam notes.

#### S1.T3 — Freeze Review-Scope And Optionality Policy

- **Outcome**: the seam defines exactly how `CT-9B` proof scope maps into visual review and how optional versus claim-relevant review states are encoded.
- **Inputs/outputs**:
  - Inputs: `storybook/story-inventory.json`, `storybook/component-specs/**`, `THR-06` semantics from `threading.md`.
  - Outputs: `storybook/chromatic-review-policy.md` and matching `review.mode`, `review.scope`, and `review.requiredForClaim` fields in the `CT-10B` contract.
- **Thread/contract refs**: consumes `CT-9B`; advances `THR-02` and `THR-06`; defines `CT-10B`.
- **Implementation notes**: tie review scope to repo-owned component tiers and selected component IDs from `CT-9B`; allow `informational` and `claim-required` as the only initial review modes; require skipped or deferred states to explain why the rail did not run for the branch or claim type.
- **Acceptance criteria**: policy text names the pilot scope, the initial rollout mode, and the exact artifact fields that downstream promotion work may read; no policy statement requires vendor UI inspection.
- **Test notes**: review one example where review is intentionally deferred and one where it is claim-relevant so the artifact semantics stay explicit before the rail is wired.
- **Risk/rollback notes**: do not let the named check imply mandatory approval semantics before `SEAM-10B` promotes the rail; if tier policy drifts, revalidate against the final `CT-9B` component-spec rules.

Checklist:

- Implement: author `storybook/chromatic-review-policy.md`.
- Test: draft deferred and claim-relevant payload examples against the contract.
- Validate: confirm the selected proof scope comes from `CT-9B` only.
- Cleanup: remove any policy language that treats visual review as universal or vendor-owned.
