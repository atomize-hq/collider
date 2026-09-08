---
seam_id: SEAM-7B
status: pending-human-review
execution_horizon: active
basis_ref: seam.md#seam-brief-restated
---

# Review Bundle — SEAM-7B Storybook Proof System Convergence

## Falsification Questions

- Can a reusable component still appear "covered" when it lacks a component spec or when its proof stories exist only as ad hoc stories outside `storybook/story-inventory.json`?
- Is any proof metadata field in the proposed contract trying to restate token values, recipe truth, or Figma parity state that should remain owned by `CT-H1`, `CT-H2`, or `CT-8B`?
- Could `SEAM-8B`, `SEAM-9B`, or `SEAM-10B` start consuming proof coverage before the validator can identify missing required story kinds for a concrete pilot component family?

## R1 — Proof Contract Authoring And Review Flow

```mermaid
flowchart LR
  Canonical["Canonical token and recipe sources<br/>CT-H1"] --> Projections["Generated projections and docs<br/>CT-H2"]
  Projections --> Stories["Storybook proof stories<br/>token docs, recipe docs, runtime parity, reusable proofs"]
  Stories --> Specs["Component specs<br/>storybook/component-specs/<component-id>.json"]
  Specs --> Inventory["Proof inventory<br/>storybook/story-inventory.json"]
  Inventory --> Validator["Coverage validator and review report"]
  Validator --> Reviewers["Maintainers and AI agents"]
  Validator --> Downstream["SEAM-8B / SEAM-9B / SEAM-10B consumers"]
```

## R2 — Proof Metadata And Validator Data Flow

```mermaid
flowchart TB
  Tokens["design-tokens/src/**"] --> Generated["Generated token docs, recipe docs, and CSS/TS projections"]
  Generated --> StoryFiles["storybook/stories/**"]
  StoryFiles --> InventoryBuilder["Inventory/spec authoring path"]
  InventoryBuilder --> Inventory["storybook/story-inventory.json"]
  InventoryBuilder --> ComponentSpecs["storybook/component-specs/<component-id>.json"]
  Inventory --> Validator["scripts/** validator"]
  ComponentSpecs --> Validator
  Validator --> Status["Missing-coverage status output"]
  Status --> VisualReview["SEAM-8B review selection"]
  Status --> Mapping["SEAM-9B mapping hooks"]
  Status --> Promotion["SEAM-10B proof coverage input"]
```

## R3 — Touch-Surface Handoff Map

```mermaid
flowchart LR
  Stories["storybook/stories/**"] --> Inventory["storybook/story-inventory.json"]
  Specs["storybook/component-specs/**"] --> Inventory
  Inventory --> Validators["scripts/** proof validators"]
  Validators --> Report["Inspectible coverage report"]
  DocsLoaders["src/lib/tokens/** docs loaders"] --> Stories
  Report --> Review["Human review and CI gate"]
  Report --> FutureRails["Future rails consume explicit proof facts"]
```

## R4 — Sequence For Informational-To-Required Gating

```mermaid
sequenceDiagram
  participant Maintainer
  participant Spec as Component Spec
  participant Inventory as Story Inventory
  participant Validator
  participant Gate as Required Gate
  participant Downstream as Future Seams
  Maintainer->>Spec: define component identity, tier, required coverage
  Maintainer->>Inventory: register proof stories and generated artifact refs
  Inventory->>Validator: run informational validation
  Validator-->>Maintainer: missing coverage and contract drift report
  Maintainer->>Validator: backfill pilot proof stories
  Validator->>Gate: green required validation
  Gate-->>Downstream: publish CT-9B as consumable basis
```

## Likely Mismatch Hotspots

- The pilot component family may already have stories whose IDs or locations drift from the current `THR-01` Storybook basis, which would make the first inventory backfill noisy.
- Component-tier policy can easily overreach if it mixes "nice to have" stories with truly required coverage; the first matrix should stay minimal and tied to actual downstream consumers.
- Downstream mapping hooks can become vendor-shaped too early; `SEAM-7B` should publish repo-owned identity and reserved hooks, not Storybook Connect or Code Connect projections.

## Reviewer Checklist

- The diagrams reflect the actual proof-authoring and validation work that would land, not only the pack topology.
- Contract ownership stays aligned with `threading.md`: `SEAM-7B` owns `CT-9B`, while `CT-H1`, `CT-H2`, and `CT-8B` remain upstream inputs.
- The gating sequence prevents downstream seams from consuming proof coverage before the validator can prove it against a real pilot family.
