---
pack_id: harness-completion
pack_version: v1
pack_status: active
source_ref: figma-ci-sync/target-state-harness.md
execution_horizon:
  active_seam: SEAM-14B
  next_seam: null
---

# Scope Brief — Harness Completion

- **Goal**: Complete the Collider target-state harness by refreshing live Figma publish proof, implementing the hardened OAuth/Variables API rail, ratcheting parity to required, and producing the final harness attestation.

- **Why now**: The `harness-future-rails` pack landed all four seams (SEAM-7B through SEAM-10B) and the remediation log is clear. But the repo still does not satisfy the full end-state in `target-state-harness.md`. The sync-ledger shows `materializationStatus: not-run`, `lastVerifiedRevision: null`, `parityMode: deferred`, and one open blocking exception (`figma-proof-pending`). The highest earned promotion level is `C-consumption-valid`. The harness requires Level E.

- **Primary user(s) + JTBD**: AI agents and human maintainers who need the design-to-code loop to be fully deterministic — canonical source through Figma publish, all verified, all promotable without guessing.

- **In-scope**:
  - Refreshing Figma publish proof against the current `design-tokens/dist/figma/tokens.json` revision
  - Implementing a repo-owned OAuth/Variables API rail as the hardened Figma publish path
  - Updating sync-ledger.json to reflect live proof and cleared exceptions
  - Moving parity from deferred to required once the hardened rail is real
  - Wiring release-governed promotion enforcement for Level E
  - Reconciling `target-state-harness.md` against landed repo surfaces
  - Producing a final machine-readable harness attestation

- **Out-of-scope**:
  - Reopening or modifying SEAM-7B through SEAM-10B
  - Changing canonical token ownership or the DTCG source model
  - Implementing Chromatic, Storybook Connect, or Code Connect rails (these remain optional per target-state-harness.md)
  - Altering the existing plugin-import-manual rail contract shape

- **Success criteria**:
  - sync-ledger.json shows `materializationStatus: verified`, non-null `lastVerifiedRevision`, `parityMode: required`, and no open blocking exceptions
  - A repo-owned OAuth/Variables API command or workflow can deterministically write approved tokens into Figma
  - `highestEarnedLevel` reaches `E-promotion-complete`
  - `target-state-harness.md` is reconciled: "Current Repo Position Versus Target State" reflects repo truth
  - Pack closeout produces a machine-readable harness attestation

- **Constraints**:
  - Figma Variables API access requires OAuth app registration and appropriate scopes — this is an external dependency
  - The plugin-import-manual rail must remain functional as the short-term path while the hardened rail is built
  - All work must preserve the source-of-truth model: repo canonical, Figma downstream-only

- **External systems / dependencies**:
  - Figma Variables API (REST, OAuth2)
  - Figma file `figma://file/SVcsU6gVvpezsJYrvBsS3V`
  - Current artifact at `design-tokens/dist/figma/tokens.json` (revision `5a567cd7d07860135ab0bfb1d8f2873ef1eec836`)

- **Known unknowns / risks**:
  - OAuth app registration timeline and scope availability are not repo-controlled
  - Variables API rate limits and error modes are not yet characterized
  - Whether the current plugin-import-manual proof can be refreshed without Figma-side schema changes is unverified

- **Assumptions**:
  - The harness-future-rails pack is correctly landed (all four seams closed, remediation log clear)
  - CT-8B through CT-12B contracts are current and consumable
  - The target-state-harness.md document is the authoritative model for what "complete" means
