---
seam_id: SEAM-9B
review_phase: pre_exec
execution_horizon: active
basis_ref: seam.md#basis
---

# Review Bundle - SEAM-9B Reusable Component Mapping and Link Convergence

This artifact feeds `gates.pre_exec.review`.
`../../review_surfaces.md` is pack orientation only.

## Falsification Questions

- Can the proposed mapping schema still let vendor-generated IDs, Figma metadata, or Chromatic URLs redefine component identity instead of projecting from `CT-9B`?
- Could a component appear fully mapped even when `codeEntrypoint`, `figmaComponentRef`, or published Storybook link data is missing or only locally inferred?
- If the published `CT-10B` contract later changes its URL shape or review-mode rule, would this seam silently bake stale Storybook link semantics into `CT-11B`?

## R1 - Repo-Owned Mapping Projection Flow

```mermaid
flowchart LR
  Spec["storybook/component-specs/<component-id>.json<br/>repo-owned identity + hooks"] --> Mapping["CT-11B projection rules"]
  Coverage["storybook/story-inventory.json<br/>artifacts/storybook/proof-coverage.json"] --> Mapping
  Mapping --> StorybookConnect["storybook/connect/<component-id>.json"]
  Mapping --> CodeConnect["figma/code-connect/<component-id>.json"]
  StorybookConnect --> Engineers["Engineers navigating proof surfaces"]
  CodeConnect --> Designers["Designers navigating code-backed components"]
```

## R2 - Storybook Link Resolution And Published Handoff

```mermaid
flowchart TB
  CT9B["CT-9B published identity<br/>THR-04 published"] --> Contract["CT-11B contract baseline"]
  CT10B["CT-10B branch review contract<br/>THR-03 revalidated"] --> Contract
  Contract --> Generator["Repo-owned mapping generator / validator"]
  Generator --> Connect["storybook/connect/<component-id>.json"]
  Generator --> Figma["figma/code-connect/<component-id>.json"]
  Connect --> Promotion["SEAM-10B promotion consumer"]
  CT10B --> Connect
```

## R3 - Pilot Component Mapping Surface

```mermaid
flowchart LR
  ButtonSpec["button component spec"] --> Fields["componentId<br/>entrypoint<br/>variants<br/>slots<br/>exampleStoryIds"]
  Fields --> StorybookProjection["Storybook mapping projection"]
  Fields --> FigmaProjection["Figma mapping projection"]
  StorybookProjection --> PublishedProof["published proof URL or unresolved placeholder"]
  FigmaProjection --> FigmaRef["figma component reference"]
  PublishedProof --> Status["mapping completeness status"]
  FigmaRef --> Status
```

## Likely Mismatch Hotspots

- `storybook/component-specs/button.json` currently leaves `codeEntrypoint` and `figmaComponentRef` as `null`, so the pilot identity basis exists but the mapping seam still has to decide which fields are required before a component may claim completeness.
- `THR-03` is now revalidated, so any field that promises a current Storybook URL must stay tied to the repo-owned `CT-10B` field boundary instead of host conventions, vendor UI links, or prose summaries.
- Storybook and Figma projections can drift if they each acquire separate normalization logic instead of sharing one repo-owned identity transform.
- The temptation to reuse vendor terminology directly in `CT-11B` can make downstream promotion parse tool-specific payloads instead of a stable repo-owned shape.

## Pre-Exec Findings

- The current basis is coherent and falsifiable: `storybook/component-specs/button.json`, `storybook/story-inventory.json`, `artifacts/storybook/proof-coverage.json`, `storybook/chromatic-review-contract.md`, `storybook/chromatic-review-policy.md`, and `harness-future-rails/governance/seam-8b-closeout.md` expose the identity and link-consumption boundary this seam needs.
- `THR-03` and `THR-04` are both revalidated for this seam. The remaining gap is delivery, not handoff ambiguity: `CT-11B` still needs to be published, but upstream proof and review contracts are current enough to execute against.
- `storybook/component-specs/button.json` still leaves `codeEntrypoint` and `figmaComponentRef` as `null`, which is a real landing task for the pilot metadata slice, but it is not a pre-exec blocker because the missing values are exactly what the active seam is meant to author.
- `REM-003` remains open as the seam-owned delivery objective for landing `CT-11B`; it no longer blocks pre-exec readiness because contract ownership, review posture, and upstream revalidation are all explicit.

## Pre-Exec Gate Disposition

- **Review gate**: passed. The active seam still has reviewer-visible failure modes around identity ownership, missing pilot metadata, and Storybook link provenance.
- **Contract gate**: passed. Ownership stays aligned with `threading.md`: `SEAM-9B` owns `CT-11B`, consumes revalidated `CT-9B` and `CT-10B`, and preserves `THR-07` as the only unpublished outbound thread.
- **Revalidation gate**: passed. `SEAM-8B` landed `CT-10B`, recorded a ready seam-exit handoff in `../../governance/seam-8b-closeout.md`, and the current repo surfaces still match the seam's planned consumption boundary.
- **Opened remediations**: none for pre-exec gating. `REM-003` stays open as the active seam's landing and closeout obligation.

## Planned Seam-Exit Gate Focus

- **What must be true before downstream promotion is legal**: `CT-11B` is published in repo-owned projection surfaces, required mapping fields are explicit, and Storybook link fields are either backed by published `CT-10B` reality or explicitly marked unavailable.
- **Which outbound contracts/threads matter most**: `CT-11B` and `THR-07`
- **Which review-surface deltas would force downstream revalidation**: any change to component identity shape, Figma reference conventions, Storybook URL resolution logic, or nullable-versus-required completeness rules.
