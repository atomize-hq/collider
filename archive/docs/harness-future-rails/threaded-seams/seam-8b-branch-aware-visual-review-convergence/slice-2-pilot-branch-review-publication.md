---
slice_id: S2
seam_id: SEAM-8B
slice_kind: delivery
execution_horizon: active
status: exec-ready
plan_version: v2
basis:
  currentness: current
  basis_ref: seam.md#basis
  stale_triggers:
    - Any change to landed `CT-9B` proof scope, selected component IDs, or required story IDs must be reflected here before pilot wiring starts.
    - Any replacement of `build-storybook` as the pre-publish owner must be revalidated here before execution starts.
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
---

### S2 — Pilot Branch Review Publication

- **User/system value**: one real proof-scoped branch review proves that the repo can publish a visual-review surface and emit a stable status artifact without widening scope to the whole reusable-component catalog.
- **Scope (in/out)**:
  - In: CI wiring for one pilot proof scope, provider publish invocation, generated `artifacts/chromatic/status.json`, and artifact traceability back to the selected component IDs and story IDs.
  - Out: broad component-family adoption, blocking enforcement for all branches, downstream Storybook Connect links, or promotion policy.
- **Acceptance criteria**:
  - A branch or PR run publishes the exact pilot proof scope selected by `CT-9B` and records the same git SHA in the artifact.
  - The generated artifact exists for success, changed-diff, and failure paths.
  - Reviewers can map the build URL and diff outcome back to the selected proof scope without reading CI logs.
- **Dependencies**: requires `S1` to freeze the contract and policy, consumes the already-landed pilot proof scope carried by `THR-02`, and depends on the recorded `SEAM-7B` handoff staying aligned with the published proof scope.
- **Verification**: dry-run or pilot CI evidence reviewed against [review.md](./review.md#r1--branch-aware-review-publication-workflow) and [review.md](./review.md#r4--sequence-for-optional-to-consumable-review-status).
- **Rollout/safety**: keep this slice on a narrow pilot family and preserve the ability to mark the rail deferred when the branch is outside the selected claim scope.
- **Review surface refs**: [review.md](./review.md#r1--branch-aware-review-publication-workflow), [review.md](./review.md#r2--ci-and-status-normalization-data-flow), [review.md](./review.md#r4--sequence-for-optional-to-consumable-review-status)

#### S2.T1 — Wire The Pilot Publish Path To The Proof Inventory Revision

- **Outcome**: CI resolves the published proof scope from `CT-9B`, builds the matching Storybook revision, and hands that exact revision to the review provider.
- **Inputs/outputs**:
  - Inputs: published `storybook/story-inventory.json`, `storybook/component-specs/**`, `package.json`, `.github/workflows/ci.yml`.
  - Outputs: a `chromatic-review` CI path in `.github/workflows/ci.yml` and the wrapper command declared in `package.json`.
- **Thread/contract refs**: consumes `CT-9B`; advances `THR-02`; supports `CT-10B`.
- **Implementation notes**: resolve component IDs, story IDs, and git SHA before invoking the publish command; use the built Storybook output directory from `pnpm storybook:build`; fail closed if the resolved proof scope is empty or mismatched with the inventory revision.
- **Acceptance criteria**: the planned workflow shows a single revision flowing through build and publish; the pilot scope comes from `CT-9B`, not a hard-coded vendor story list.
- **Test notes**: exercise one pilot run and one empty-scope refusal path before widening branch coverage.
- **Risk/rollback notes**: if the proof inventory or pilot family changes after this refresh, revalidate this task before landing any workflow edits.

Checklist:

- Implement: wire the provisional `chromatic-review` path in `.github/workflows/ci.yml`.
- Test: run a pilot path that resolves non-empty proof scope from `CT-9B`.
- Validate: confirm the workflow records the same git SHA across build and publish.
- Cleanup: remove any temporary hard-coded story IDs once the inventory selector is reading `CT-9B`.

#### S2.T2 — Emit Generated `CT-10B` Status For All Publish Outcomes

- **Outcome**: every pilot run writes `artifacts/chromatic/status.json` with enough detail for downstream seams to consume it without reading vendor UI.
- **Inputs/outputs**:
  - Inputs: provider publish result, resolved proof scope, git SHA, branch name.
  - Outputs: `scripts/lib/chromatic-status.mjs`, generated `artifacts/chromatic/status.json`, and artifact-upload behavior in CI.
- **Thread/contract refs**: defines `CT-10B`; advances `THR-03`; supports `THR-06`.
- **Implementation notes**: normalize provider success, changed-diff, and failure outcomes into the repo-owned contract; always write the artifact even when the review outcome is refusal or failure; include the selected component IDs, selected story IDs, build URL, diff outcome, and review mode in the payload.
- **Acceptance criteria**: downstream readers can tell whether the run succeeded, changed, failed, or was deferred by reading the artifact alone; artifact generation is not gated on a passing provider result.
- **Test notes**: create sample runs or mocked outputs for each outcome and review the normalized payloads against the contract doc.
- **Risk/rollback notes**: do not let raw provider payloads leak into the checked-in contract; if the provider response changes, adapt the normalizer without changing downstream field names.

Checklist:

- Implement: add the normalizer path and generated artifact handoff.
- Test: cover success, diff, failure, and deferred outcomes.
- Validate: confirm the artifact is generated in every outcome branch.
- Cleanup: strip any provider-only fields that downstream seams should not parse.

#### S2.T3 — Prove Reviewer Traceability For The Pilot Scope

- **Outcome**: the pilot review artifact makes branch, revision, build URL, and reviewed proof scope easy to audit from the repo.
- **Inputs/outputs**:
  - Inputs: generated `CT-10B` artifact, published `CT-9B` proof scope, pilot branch or PR run.
  - Outputs: artifact fields that reference the selected component IDs and story IDs, plus any CI summary text that points reviewers back to the artifact instead of logs.
- **Thread/contract refs**: advances `THR-03` and `THR-06`; defines `CT-10B`.
- **Implementation notes**: keep reviewer-facing summaries terse and artifact-first; if a provider build URL exists, record it in the artifact and any summary surface, but treat the artifact as the system of record; include whether the rail is informational or claim-relevant for the pilot.
- **Acceptance criteria**: a reviewer can answer "what was reviewed, for which branch, and with what outcome?" without opening vendor UI; the build URL format is stable enough for `SEAM-9B` to consume later.
- **Test notes**: review one passing and one diff-present pilot summary to confirm they point back to the same artifact structure.
- **Risk/rollback notes**: do not publish narrative-only summaries that diverge from the artifact payload; if URL format is unstable, keep the field versioned and call out revalidation in closeout.

Checklist:

- Implement: ensure the artifact carries review-scope and URL traceability fields.
- Test: inspect pilot run evidence for both pass and diff outcomes.
- Validate: confirm summaries point to `artifacts/chromatic/status.json` as the authority.
- Cleanup: remove any reviewer instructions that require reading raw job logs.
