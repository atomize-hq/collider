# Review Surfaces - Harness Future Rails

These diagrams are for rapid human review. They show the actual product and system shape that should land if the future harness rails are implemented as planned. The pack topology is implicit in the flow; these are not only planning diagrams.

## R1 — Reusable component review workflow

```mermaid
flowchart LR
  A["Repo author updates canonical tokens, recipes, or proof metadata"] --> B["Build projections and Storybook proof stories"]
  B --> C["storybook/story-inventory.json selects required proof coverage"]
  C --> D["Published Storybook proof surface"]
  D --> E["Chromatic branch review produces build URL and diff status"]
  D --> F["Storybook Connect metadata points Figma users at the published proof surface"]
  C --> G["Component spec metadata feeds Code Connect projections"]
  E --> H["Reusable-component promotion evaluator"]
  F --> H
  G --> H
  I["src/figma/sync-ledger.json parity state"] --> H
  H --> J["Merge, handoff, or release claim with explicit earned level"]
```

## R2 — Proof, review, and mapping surface flow

```mermaid
flowchart TB
  Canonical["Canonical source<br/>design-tokens/src/**<br/>storybook/component-specs/**"] --> Projections["Generated projections<br/>tokens.css<br/>tokens.ts<br/>figma/tokens.json"]
  Projections --> Proof["Storybook proof stories<br/>token docs<br/>recipe docs<br/>runtime parity"]
  Proof --> Inventory["Proof inventory<br/>storybook/story-inventory.json"]
  Inventory --> Publish["Storybook static publish<br/>pnpm storybook:build"]
  Publish --> Chromatic["Branch-aware visual review<br/>artifacts/chromatic/status.json"]
  Inventory --> Mapping["Component mapping projections<br/>storybook/connect/**<br/>figma/code-connect/**"]
  Mapping --> Figma["Figma design navigation and code mapping"]
  Chromatic --> Promotion["Reusable-component promotion status<br/>artifacts/harness/reusable-component-status.json"]
  Figma --> Promotion
  Ledger["src/figma/sync-ledger.json"] --> Promotion
```

## R3 — Promotion state transitions for reusable components

```mermaid
stateDiagram-v2
  [*] --> ProofDefined
  ProofDefined --> VisualReviewed: current proof inventory + published review status
  VisualReviewed --> MappedLinked: component mapping and Storybook link metadata current
  MappedLinked --> PromotionReady: figma parity current + policy allows required claim
  ProofDefined --> Blocked: missing proof inventory or stale component spec
  VisualReviewed --> Blocked: Chromatic status failed or stale
  MappedLinked --> Blocked: mapping or link metadata incomplete
  PromotionReady --> Blocked: figma parity stale or required rail deferred
  Blocked --> ProofDefined: contract repaired and revalidated
```

## R4 — Touch surface map

```mermaid
flowchart LR
  Stories["storybook/stories/**"] --> Inventory["storybook/story-inventory.json"]
  Specs["storybook/component-specs/**"] --> Inventory
  Inventory --> Connect["storybook/connect/**"]
  Inventory --> CodeConnect["figma/code-connect/**"]
  Build["storybook build + CI job"] --> Chromatic["artifacts/chromatic/status.json"]
  Ledger["src/figma/sync-ledger.json"] --> Promotion["artifacts/harness/reusable-component-status.json"]
  Chromatic --> Promotion
  Connect --> Promotion
  CodeConnect --> Promotion
```
