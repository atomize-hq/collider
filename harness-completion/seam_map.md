# Seam Map — Harness Completion

## Extraction strategy

**Axis**: workflow-first — the seams follow the operational sequence needed to advance the Figma side from `C-consumption-valid` to `E-promotion-complete`.

**Rationale**: The remaining work is a linear progression: first prove the current rail works, then harden it, then ratchet policy, then attest. Each seam produces the precondition for the next. This is not an integration-first extraction because the integration contracts already exist from `harness-future-rails`; the gap is operational execution against those contracts.

## Upstream basis

These seams are consumed as landed basis but not reopened:

| Seam     | Pack                 | Status | Key contract                                 |
| -------- | -------------------- | ------ | -------------------------------------------- |
| SEAM-5B  | harness-convergence  | landed | CT-7B (Figma sync-ledger shape)              |
| SEAM-6B  | harness-convergence  | landed | CT-8B (drift gate)                           |
| SEAM-7B  | harness-future-rails | landed | CT-9B (Storybook proof metadata)             |
| SEAM-8B  | harness-future-rails | landed | CT-10B (visual review state)                 |
| SEAM-9B  | harness-future-rails | landed | CT-11B (mapping/link schema)                 |
| SEAM-10B | harness-future-rails | landed | CT-12B (reusable-component promotion status) |

## Active seams

| Seam     | Slug                          | Type        | Horizon | Purpose                                                          |
| -------- | ----------------------------- | ----------- | ------- | ---------------------------------------------------------------- |
| SEAM-11B | figma-publish-proof-refresh   | capability  | active  | Refresh plugin-import-manual proof for current artifact revision |
| SEAM-12B | hardened-figma-variables-rail | platform    | next    | Implement repo-owned OAuth/Variables API rail                    |
| SEAM-13B | parity-ratchet-promotion      | conformance | future  | Move parity to required, complete Level E promotion              |
| SEAM-14B | harness-finalization          | conformance | future  | Final harness attestation and target-state reconciliation        |

## Critical path

```
SEAM-11B → SEAM-12B → SEAM-13B → SEAM-14B
```

All four seams are strictly sequential. Each produces the precondition consumed by the next:

- SEAM-11B proves the current rail works → SEAM-12B can build the hardened replacement
- SEAM-12B delivers the hardened rail → SEAM-13B can ratchet parity to required
- SEAM-13B achieves Level E → SEAM-14B can attest and close out

## Pruned candidates

No seams were pruned. The user's recommended decomposition maps cleanly to four cohesive, naturally bounded seams with distinct verification paths and touch surfaces.
