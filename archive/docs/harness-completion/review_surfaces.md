# Review Surfaces — Harness Completion

These diagrams orient the pack. They show the actual product/work shape that is expected to land.
They do not, by themselves, satisfy seam-local pre-exec review.
Active and next seams (SEAM-11B, SEAM-12B) still require seam-local `review.md` as the authoritative pre-exec review artifact before execution begins.

## R1 — Figma publish workflow progression

```mermaid
flowchart LR
  A[Token source edit] --> B[pnpm build:tokens]
  B --> C[design-tokens/dist/figma/tokens.json]
  C --> D{Publish rail}
  D -->|SEAM-11B: manual proof| E[Plugin import → Figma]
  D -->|SEAM-12B: hardened| F[OAuth/Variables API → Figma]
  E --> G[sync-ledger: D-publish-valid]
  F --> G
  G -->|SEAM-13B| H[Parity: required]
  H --> I[sync-ledger: E-promotion-complete]
  I -->|SEAM-14B| J[Harness attestation]
```

## R2 — Data flow through sync-ledger state transitions

```mermaid
stateDiagram-v2
  [*] --> C_consumption_valid: Current state
  C_consumption_valid --> D_publish_valid: SEAM-11B\nproof refresh\nmaterializationStatus=verified
  D_publish_valid --> D_publish_valid_hardened: SEAM-12B\nhardened rail\nnew publish mode
  D_publish_valid_hardened --> E_promotion_complete: SEAM-13B\nparityMode=required\nexceptions cleared
  E_promotion_complete --> Attested: SEAM-14B\nharness attestation
```

## R3 — Contract and thread flow

```mermaid
flowchart TB
  subgraph Upstream ["Upstream basis (landed)"]
    CT7B["CT-7B\nledger schema"]
    CT8B["CT-8B\ndrift gate"]
    CT12B["CT-12B\ncomponent status"]
  end

  subgraph Pack ["Harness completion"]
    S11B["SEAM-11B\nProof refresh"]
    S12B["SEAM-12B\nHardened rail"]
    S13B["SEAM-13B\nParity ratchet"]
    S14B["SEAM-14B\nFinalization"]

    CT13B["CT-13B\nproof state"]
    CT14B["CT-14B\nrail state"]
    CT15B["CT-15B\nparity enforcement"]
  end

  CT7B --> S11B
  CT8B --> S11B
  S11B --> CT13B
  CT13B -->|THR-09| S12B
  S12B --> CT14B
  CT14B -->|THR-10| S13B
  CT12B --> S13B
  S13B --> CT15B
  CT15B -->|THR-11| S14B
  S14B -->|THR-12| Done["Harness complete"]
```

## R4 — Touch surface map

```mermaid
flowchart TB
  subgraph Artifacts ["Key artifacts"]
    TOKENS["design-tokens/dist/figma/tokens.json"]
    LEDGER["src/figma/sync-ledger.json"]
    STATUS["artifacts/harness/reusable-component-status.json"]
    HARNESS["figma-ci-sync/target-state-harness.md"]
  end

  subgraph External ["External surfaces"]
    FIGMA["Figma file\nSVcsU6gVvpezsJYrvBsS3V"]
    OAUTH["Figma OAuth app"]
    VARAPI["Figma Variables API"]
  end

  S11B_touch["SEAM-11B"] --> LEDGER
  S11B_touch --> FIGMA
  S11B_touch -.->|reads| TOKENS

  S12B_touch["SEAM-12B"] --> LEDGER
  S12B_touch --> FIGMA
  S12B_touch --> OAUTH
  S12B_touch --> VARAPI
  S12B_touch -.->|reads| TOKENS

  S13B_touch["SEAM-13B"] --> LEDGER
  S13B_touch --> STATUS

  S14B_touch["SEAM-14B"] --> HARNESS
```
