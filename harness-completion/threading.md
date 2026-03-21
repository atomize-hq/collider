# Threading — Harness Completion

## Execution horizon

| Seam     | Horizon | Status   |
| -------- | ------- | -------- |
| SEAM-11B | active  | proposed |
| SEAM-12B | next    | proposed |
| SEAM-13B | future  | proposed |
| SEAM-14B | future  | proposed |

Policy: only SEAM-11B is eligible for authoritative sub-slices by default. SEAM-12B may later receive seam-local review and slices with provisional candidate-subslice hints. SEAM-13B and SEAM-14B remain at seam-brief depth.

## Contract registry

### Inherited contracts (consumed as upstream basis)

- **Contract ID**: `CT-7B`
  - **Type**: config
  - **Owner seam**: SEAM-5B (harness-convergence)
  - **Direct consumers**: SEAM-11B
  - **Definition**: Figma sync-ledger schema shape
  - **Notes**: Defines the ledger structure that SEAM-11B writes into

- **Contract ID**: `CT-8B`
  - **Type**: permission
  - **Owner seam**: SEAM-6B (harness-convergence)
  - **Direct consumers**: SEAM-11B
  - **Definition**: Drift gate contract — governs when promotion is allowed/blocked

- **Contract ID**: `CT-12B`
  - **Type**: state
  - **Owner seam**: SEAM-10B (harness-future-rails)
  - **Direct consumers**: SEAM-13B
  - **Definition**: Reusable-component promotion status at `artifacts/harness/reusable-component-status.json`

### New contracts (produced by this pack)

- **Contract ID**: `CT-13B`
  - **Type**: state
  - **Owner seam**: SEAM-11B
  - **Direct consumers**: SEAM-12B
  - **Derived consumers**: SEAM-13B
  - **Thread IDs**: THR-09
  - **Definition**: Figma publish proof state — the verified status of the current artifact revision through the plugin-import-manual rail, as recorded in sync-ledger.json
  - **Versioning / compat**: Ledger field updates within existing v2 schema

- **Contract ID**: `CT-14B`
  - **Type**: state
  - **Owner seam**: SEAM-12B
  - **Direct consumers**: SEAM-13B
  - **Derived consumers**: SEAM-14B
  - **Thread IDs**: THR-09, THR-10
  - **Definition**: Hardened Figma rail state — the operational status of the OAuth/Variables API rail including mode, credential model, success markers, and sync-ledger updates
  - **Versioning / compat**: May extend sync-ledger v2 or introduce a parallel status surface

- **Contract ID**: `CT-15B`
  - **Type**: permission
  - **Owner seam**: SEAM-13B
  - **Direct consumers**: SEAM-14B
  - **Derived consumers**: downstream release process
  - **Thread IDs**: THR-10, THR-11
  - **Definition**: Parity enforcement state — the transition from deferred to required parity, including enforcement wiring and the Level E promotion claim
  - **Versioning / compat**: sync-ledger.json `parityMode` field change + reusable-component-status.json update

## Thread registry

- **Thread ID**: `THR-09`
  - **Producer seam**: SEAM-11B
  - **Consumer seam(s)**: SEAM-12B
  - **Carried contract IDs**: CT-13B
  - **Purpose**: Carry Figma publish proof freshness state from proof refresh to hardened rail implementation — SEAM-12B needs to know the current rail works before building the replacement
  - **State**: identified
  - **Revalidation trigger**: artifact revision change in `design-tokens/dist/figma/tokens.json`
  - **Satisfied by**: SEAM-11B landing with `materializationStatus: verified` in sync-ledger.json
  - **Notes**: This thread becomes stale if the artifact revision changes between SEAM-11B landing and SEAM-12B execution

- **Thread ID**: `THR-10`
  - **Producer seam**: SEAM-12B
  - **Consumer seam(s)**: SEAM-13B
  - **Carried contract IDs**: CT-14B
  - **Purpose**: Carry hardened rail readiness state to parity ratchet — SEAM-13B must not ratchet parity until the hardened rail is real and verified
  - **State**: identified
  - **Revalidation trigger**: hardened rail implementation change or Figma Variables API scope change
  - **Satisfied by**: SEAM-12B landing with a working OAuth/Variables API rail that writes deterministic success markers
  - **Notes**: External dependency (OAuth app registration) may delay satisfaction

- **Thread ID**: `THR-11`
  - **Producer seam**: SEAM-13B
  - **Consumer seam(s)**: SEAM-14B
  - **Carried contract IDs**: CT-15B
  - **Purpose**: Carry Level E promotion state to harness finalization — SEAM-14B cannot attest until promotion is complete
  - **State**: identified
  - **Revalidation trigger**: parity enforcement rule change or CT-12B status change
  - **Satisfied by**: SEAM-13B landing with `highestEarnedLevel: E-promotion-complete` and `parityMode: required` in sync-ledger.json
  - **Notes**: One-way ratchet — once satisfied, this thread should not regress without governance action

- **Thread ID**: `THR-12`
  - **Producer seam**: SEAM-14B
  - **Consumer seam(s)**: none (terminal)
  - **Carried contract IDs**: none
  - **Purpose**: Harness attestation completion signal — marks the entire target-state harness as verified and landed
  - **State**: identified
  - **Revalidation trigger**: target-state-harness.md change or new required invariant
  - **Satisfied by**: SEAM-14B landing with completed attestation artifact and reconciled target-state document
  - **Notes**: Terminal thread — closes the harness completion scope

## Dependency graph

```
CT-7B (upstream) ──┐
CT-8B (upstream) ──┤
                   ├──→ SEAM-11B ──[CT-13B/THR-09]──→ SEAM-12B ──[CT-14B/THR-10]──→ SEAM-13B ──[CT-15B/THR-11]──→ SEAM-14B ──[THR-12]──→ done
CT-12B (upstream) ─────────────────────────────────────────────────────┘
```

## Critical path

```
SEAM-11B → SEAM-12B → SEAM-13B → SEAM-14B
```

All four seams are strictly sequential. No parallel workstreams are possible within this pack because each seam produces the precondition consumed by the next.

## Workstreams

- **WS-11B** (Proof Refresh): SEAM-11B only — operational proof execution
- **WS-12B** (Hardened Rail): SEAM-12B only — platform implementation with external dependency
- **WS-13B** (Parity Enforcement): SEAM-13B only — conformance ratchet
- **WS-14B** (Attestation): SEAM-14B only — documentation and governance closeout
- **WS-INT** (Integration/Conformance): cross-cutting sync-ledger and governance artifact updates

All workstreams are sequential per the critical path. WS-INT is an overlay concern rather than a parallelizable stream.
