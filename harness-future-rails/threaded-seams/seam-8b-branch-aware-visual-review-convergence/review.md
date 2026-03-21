---
seam_id: SEAM-8B
status: exec-ready
execution_horizon: active
basis_ref: seam.md#seam-brief-restated
---

# Review Bundle — SEAM-8B Branch-Aware Visual Review Convergence

## Falsification Questions

- Can the visual-review rail publish against a Storybook build that does not match the landed `CT-9B` proof inventory revision and selected component scope?
- Does the recorded `SEAM-7B` seam-exit handoff still match the `CT-9B` proof surfaces this seam plans to consume through `THR-02`?
- Can `chromatic-review` appear healthy while `artifacts/chromatic/status.json` is missing, stale, or only records human-readable vendor output?
- Could downstream mapping or promotion seams consume build URLs or review conclusions directly from a vendor UI instead of the repo-owned `CT-10B` artifact?

## R1 — Branch-Aware Review Publication Workflow

```mermaid
flowchart LR
  Author["Repo author updates proof-scoped component work"] --> Inventory["Landed CT-9B proof inventory<br/>component IDs + story IDs + tier policy"]
  Inventory --> Build["build-storybook job builds Storybook<br/>from the selected git revision"]
  Build --> Publish["Branch-aware publish step<br/>chromatic-review"]
  Publish --> Status["Generated CT-10B artifact<br/>artifacts/chromatic/status.json"]
  Status --> Reviewers["PR reviewers and maintainers"]
  Status --> Downstream["SEAM-9B and SEAM-10B consumers"]
```

## R2 — CI And Status-Normalization Data Flow

```mermaid
flowchart TB
  ProofGate["storybook-proof job<br/>pnpm govern:storybook-proof"] --> Inventory["storybook/story-inventory.json<br/>storybook/component-specs/**<br/>artifacts/storybook/proof-coverage.json"]
  Workflow[".github/workflows/ci.yml"] --> BuildCmd["build-storybook job<br/>pnpm storybook:build"]
  BuildCmd --> PublishCmd["pnpm chromatic:review"]
  Inventory --> PublishCmd
  PublishCmd --> Vendor["Chromatic or equivalent branch-review host"]
  Vendor --> Normalizer["scripts/lib/chromatic-status.mjs"]
  Normalizer --> Artifact["artifacts/chromatic/status.json"]
  Artifact --> Validator["scripts/validate-chromatic-status.mjs"]
  Validator --> Check["Named GitHub check<br/>chromatic-review"]
  Artifact --> Consumers["SEAM-9B / SEAM-10B"]
```

## R3 — Touch-Surface Handoff Map

```mermaid
flowchart LR
  Inventory["storybook/story-inventory.json"] --> Policy["storybook/chromatic-review-policy.md"]
  Specs["storybook/component-specs/**"] --> Policy
  Policy --> Contract["storybook/chromatic-review-contract.md"]
  Contract --> Scripts["scripts/lib/chromatic-status.mjs<br/>scripts/validate-chromatic-status.mjs"]
  Scripts --> Workflow[".github/workflows/ci.yml<br/>build-storybook + chromatic-review owner"]
  Workflow --> Artifact["artifacts/chromatic/status.json"]
  Artifact --> Future["Future mapping and promotion seams"]
```

## R4 — Sequence For Optional-To-Consumable Review Status

```mermaid
sequenceDiagram
  participant PR as Pull Request
  participant CI as CI Workflow
  participant Inv as CT-9B Inventory
  participant Gate as SEAM-7B Closeout
  participant Pub as Publish Step
  participant Art as CT-10B Artifact
  participant Cons as Downstream Seams
  PR->>CI: trigger branch build
  CI->>Inv: resolve selected proof scope + git SHA
  Inv-->>CI: component IDs, story IDs, review mode
  Gate-->>CI: prior seam handoff must be recorded before exec-ready promotion
  CI->>Pub: publish the built Storybook revision
  Pub-->>CI: build URL + diff outcome
  CI->>Art: normalize provider output into repo-owned status
  Art-->>Cons: expose branch, revision, build URL, diff outcome, mode
  Cons-->>PR: consume artifact instead of vendor UI
```

## Likely Mismatch Hotspots

- `SEAM-7B` no longer risks changing `CT-9B`, but `SEAM-8B` still depends on the recorded seam-exit handoff remaining aligned with the published proof inventory, component-spec identity fields, and proof-coverage report it plans to consume.
- The current CI file already has `storybook-proof` and `build-storybook` jobs, but no dedicated `chromatic-review` owner; a rushed publish step could emit vendor output without guaranteeing the generated `CT-10B` artifact is written on success, diff, deferred, and failure paths.
- Review-mode semantics can drift if the named check implies blocking behavior before `SEAM-10B` formally promotes the rail from optional to required for reusable-component claims.
- Downstream seams could still bypass the repo-owned contract if build URLs or review conclusions are summarized in prose or vendor UI links without matching `artifacts/chromatic/status.json`.

## Findings And Blocker Posture

- `CT-9B` is landed and consumable through `storybook/story-inventory.json`, `storybook/component-tier-policy.json`, `storybook/component-specs/button.json`, `artifacts/storybook/proof-coverage.json`, and `pnpm govern:storybook-proof`.
- The recorded `SEAM-7B` closeout now publishes a realized seam-exit handoff with `status: passed` and `promotion_readiness: ready`, so `THR-02` remains current for downstream promotion instead of only active-window planning.
- The active seam basis is current against repo reality: Storybook still builds through `pnpm storybook:build`, `build-storybook` remains the closest publish precursor, and no competing repo-owned `CT-10B` artifact exists yet.
- No blocking pre-exec remediations remain for `SEAM-8B`. `REM-002` stays open as execution work owned by this seam, not as a readiness blocker.

## Pre-Exec Gate Disposition

- **Review gate**: passed. The refreshed diagrams, falsification questions, and mismatch hotspots still let a reviewer disprove the planned branch-aware review flow and its downstream boundaries.
- **Contract gate**: passed. Ownership stays aligned with `threading.md`: `SEAM-8B` owns `CT-10B`, consumes landed `CT-9B`, and preserves `THR-03` and `THR-06` as unpublished outbound threads.
- **Revalidation gate**: passed. The seam basis is current, and the upstream `SEAM-7B` closeout now records the realized seam-exit handoff that readiness promotion requires.

## Planned Seam-Exit Focus

- Publish a repo-owned `CT-10B` contract and policy that bind review scope, build URL, diff outcome, and named-check semantics to the landed `CT-9B` proof scope.
- Ensure the final slice captures validator, artifact-freshness, and closeout evidence that `SEAM-9B` and `SEAM-10B` can consume without vendor scraping.
- Keep `SEAM-8B` in `status: exec-ready` while implementation lands `CT-10B`; re-open readiness only if the published `CT-9B` handoff or CI basis drifts.

## Reviewer Checklist

- The diagrams describe the actual Storybook publish, normalization, and downstream-consumption work that would land, not only seam topology.
- Contract ownership matches `threading.md`: `SEAM-8B` owns `CT-10B`; `SEAM-7B` remains the authority for proof selection via `CT-9B`.
- The flow prevents downstream consumers from reading vendor-only state or a mismatched Storybook revision.
- The readiness posture is explicit: the seam is `exec-ready`, and any regression must come from `CT-9B` drift or `CT-10B` planning mismatches rather than a missing upstream handoff record.
