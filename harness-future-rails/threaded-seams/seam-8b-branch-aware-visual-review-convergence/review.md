---
seam_id: SEAM-8B
status: pending-human-review
execution_horizon: next
basis_ref: seam.md#seam-brief-restated
---

# Review Bundle — SEAM-8B Branch-Aware Visual Review Convergence

## Falsification Questions

- Can the visual-review rail publish against a Storybook build that does not match the proof inventory revision and selected component scope from `CT-9B`?
- Can `chromatic-review` appear healthy while `artifacts/chromatic/status.json` is missing, stale, or only records human-readable vendor output?
- Could downstream mapping or promotion seams consume build URLs or review conclusions directly from a vendor UI instead of the repo-owned `CT-10B` artifact?

## R1 — Branch-Aware Review Publication Workflow

```mermaid
flowchart LR
  Author["Repo author updates proof-scoped component work"] --> Inventory["CT-9B proof inventory<br/>component IDs + story IDs + tier policy"]
  Inventory --> Build["CI builds Storybook from the selected git revision"]
  Build --> Publish["Branch-aware publish step<br/>chromatic-review"]
  Publish --> Status["Generated CT-10B artifact<br/>artifacts/chromatic/status.json"]
  Status --> Reviewers["PR reviewers and maintainers"]
  Status --> Downstream["SEAM-9B and SEAM-10B consumers"]
```

## R2 — CI And Status-Normalization Data Flow

```mermaid
flowchart TB
  Workflow[".github/workflows/ci.yml"] --> BuildCmd["pnpm storybook:build"]
  BuildCmd --> PublishCmd["pnpm chromatic:review"]
  Inventory["storybook/story-inventory.json<br/>storybook/component-specs/**"] --> PublishCmd
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
  Scripts --> Workflow[".github/workflows/ci.yml"]
  Workflow --> Artifact["artifacts/chromatic/status.json"]
  Artifact --> Future["Future mapping and promotion seams"]
```

## R4 — Sequence For Optional-To-Consumable Review Status

```mermaid
sequenceDiagram
  participant PR as Pull Request
  participant CI as CI Workflow
  participant Inv as CT-9B Inventory
  participant Pub as Publish Step
  participant Art as CT-10B Artifact
  participant Cons as Downstream Seams
  PR->>CI: trigger branch build
  CI->>Inv: resolve selected proof scope + git SHA
  Inv-->>CI: component IDs, story IDs, review mode
  CI->>Pub: publish the built Storybook revision
  Pub-->>CI: build URL + diff outcome
  CI->>Art: normalize provider output into repo-owned status
  Art-->>Cons: expose branch, revision, build URL, diff outcome, mode
  Cons-->>PR: consume artifact instead of vendor UI
```

## Likely Mismatch Hotspots

- `SEAM-7B` may still change proof-scope shape, so a review selector built too early could drift from the final `CT-9B` inventory contract.
- The current CI file only builds Storybook; a rushed publish step could emit vendor output without guaranteeing the generated `CT-10B` artifact is written on success, diff, and failure paths.
- Review-mode semantics can drift if the named check implies blocking behavior before `SEAM-10B` formally promotes the rail from optional to required for reusable-component claims.

## Reviewer Checklist

- The diagrams describe the actual Storybook publish, normalization, and downstream-consumption work that would land, not only seam topology.
- Contract ownership matches `threading.md`: `SEAM-8B` owns `CT-10B`; `SEAM-7B` remains the authority for proof selection via `CT-9B`.
- The flow prevents downstream consumers from reading vendor-only state or a mismatched Storybook revision.
