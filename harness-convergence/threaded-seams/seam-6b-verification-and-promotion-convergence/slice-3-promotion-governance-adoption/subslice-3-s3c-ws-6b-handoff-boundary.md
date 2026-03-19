### S3c — Bounded `WS-6B` handoff and integration boundary

- **User/system value**: future implementation owners get a bounded handoff packet for `WS-6B` work and a separate list of cross-seam integration items, so they can start without re-reading the entire convergence pack or accidentally absorbing `WS-5B` work.
- **Scope (in/out)**:
  - In: handoff items for ledger implementation, ledger-reader validation, and promotion-policy gate wiring that stay inside `WS-6B`; explicit integration-only notes for tasks that cross into `SEAM-5B` or shared CI surfaces.
  - Out: rewriting the claim matrix; ownership policy tables; implementing any gate, transport, or credential code.
- **Acceptance criteria**:
  - The handoff packet contains only `WS-6B` work.
  - Cross-seam tasks are named explicitly and excluded from this seam task list.
  - Each handoff item fits one owner and one PR.
  - Future implementers can start from the packet without re-reading the whole pack.
- **Dependencies**:
  - `S1`
  - `S2`
  - `CT-7B`
  - `CT-8B`
  - `harness-convergence/threading.md`
- **Verification**:
  - Review the packet against the `WS-6B` and `WS-5B` boundaries in `threading.md`.
  - Check that each item maps to ledger shape, verification semantics, or promotion policy only.
  - Check that shared CI, transport, or credential work is called out as integration follow-up instead of being assigned into `WS-6B`.
- **Rollout/safety**:
  - Planning only. Keep cross-seam dependencies visible, but do not import them into this seam’s direct task list.

#### Boundary contract

- `WS-6B` owns only ledger artifact shape, ledger-reader verification semantics, and promotion-policy consumption of ledger outcomes.
- `WS-5B` remains the owner of publish-mode vocabulary, transport, credentials, success markers, and hardening-rail mechanics.
- Shared CI runner orchestration and repo-wide gate plumbing are integration work, not seam-local `WS-6B` handoff scope.
- `S1`, `S2`, `S3a`, and `S3b` remain the source-of-truth policy docs; this handoff packet packages their outputs for execution and does not reopen contract or ownership decisions.

#### S3.T3 — Package downstream implementation handoff items without duplicating other seams

- **Outcome**: future implementation owners get a bounded handoff list for `WS-6B` work, plus explicit integration work suggestions for anything that crosses into other seam touch surfaces.
- **Files**:
  - `harness-convergence/threaded-seams/seam-6b-verification-and-promotion-convergence/slice-3-promotion-governance-adoption/subslice-3-s3c-ws-6b-handoff-boundary.md`
  - `harness-convergence/threading.md`

##### Start here

Read only these artifacts, in this order, before implementation starts:

1. `harness-convergence/threading.md`
2. `slice-1-ct-8b-ledger-contract.md`
3. `slice-2-verification-conformance-evaluation.md`
4. `subslice-1-s3a-claim-matrix-consumers.md`
5. `subslice-2-s3b-governance-ownership.md`

Minimum expectations before taking a packet:

- Treat `threading.md` as the seam-boundary authority for `WS-5B` versus `WS-6B`.
- Treat `S1` as the source of truth for ledger keys, enums, literal values, and example payloads.
- Treat `S2` as the source of truth for evaluator states, freshness checks, and exception semantics.
- Treat `S3a` and `S3b` as the source of truth for policy consumption and governance ownership.

##### In-scope implementation packets

###### Packet ID: `WS-6B-P1`

- **Owner scope**: one owner, one PR, limited to ledger artifact implementation.
- **Goal**: materialize `src/figma/sync-ledger.json` so it matches the frozen `CT-8B` contract and example payload expectations.
- **Inputs**:
  - `harness-convergence/threading.md`
  - `slice-1-ct-8b-ledger-contract.md`
- **Exact owned outputs**:
  - A machine-readable ledger artifact at `src/figma/sync-ledger.json`
  - Exact root keys: `ledgerVersion`, `artifact`, `publish`, `verification`, `promotion`, `exceptions`
  - Enforced literal values for `ledgerVersion="2"` and `artifact.path="design-tokens/dist/figma/tokens.json"`
  - Field and enum handling aligned to the deferred, required, and blocked examples from `S1.T3`
- **Non-goals**:
  - Defining new root keys, enums, or ownership roles
  - Reworking `CT-7B` publish modes or publish-marker vocabulary
  - Wiring CI, transport, plugin, OAuth, or credential behavior
- **Primary touch surface**:
  - `src/figma/sync-ledger.json`
  - Ledger artifact generation or serialization surfaces that stay inside `WS-6B`
- **Acceptance checks**:
  - The artifact exposes only the frozen `CT-8B` root keys and allowed field rules
  - Happy-path and blocked payloads read back consistently against `S1.T3`
  - No implementation choice implies Figma becomes canonical or that projection paths change

###### Packet ID: `WS-6B-P2`

- **Owner scope**: one owner, one PR, limited to ledger-reader validation semantics.
- **Goal**: implement the deterministic reader/evaluator that classifies ledger state and freshness for the current artifact revision.
- **Inputs**:
  - `harness-convergence/threading.md`
  - `slice-1-ct-8b-ledger-contract.md`
  - `slice-2-verification-conformance-evaluation.md`
- **Exact owned outputs**:
  - Reader/evaluator logic for `declared`, `verified-current`, `verified-stale`, `blocked-exception`, and `incomplete`
  - Revision freshness checks that compare the current artifact revision against `verification.lastVerifiedRevision`
  - Blocking behavior for explicit exception records without redefining upstream publish contract terms
  - Marker consumption that reads `CT-7B` proof and hardening expectations rather than renaming them
- **Non-goals**:
  - Changing publish modes, success markers, or hardening targets
  - Implementing plugin import, OAuth transport, or credentials
  - Converting reader semantics into shared CI orchestration
- **Primary touch surface**:
  - Ledger-reader and validator surfaces that consume `src/figma/sync-ledger.json`
  - Revision comparison and exception evaluation logic inside `WS-6B`
- **Acceptance checks**:
  - Missing or stale `verification.lastVerifiedRevision` is rejected as stale or incomplete
  - `D-publish-valid` depends on current-revision evidence, not an older pilot run
  - Carrier-only Tokens Studio usage stays recorded as a temporary condition, never a permanent rail

###### Packet ID: `WS-6B-P3`

- **Owner scope**: one owner, one PR, limited to promotion-policy gate consumption of ledger outcomes.
- **Goal**: wire ledger outcomes into local, CI, PR/handoff, and release policy consumers without reopening transport or governance ownership.
- **Inputs**:
  - `subslice-1-s3a-claim-matrix-consumers.md`
  - `subslice-2-s3b-governance-ownership.md`
  - `slice-2-verification-conformance-evaluation.md`
- **Exact owned outputs**:
  - Consumer-facing gate consumption aligned to the claim matrix for local, CI, PR/handoff, and release contexts
  - Enforcement of deferred-versus-required parity rules for `D-publish-valid` and `E-promotion-complete`
  - Consumption of blocker ownership and clearing-condition policy without redefining owners
  - Clear separation between informational status output and promotable or releasable assertions
- **Non-goals**:
  - Rewriting the claim matrix or governance ownership tables
  - Reassigning `WS-5B` transport, credential, or publish-mode ownership
  - Building shared CI orchestration or repo-wide gate plumbing
- **Primary touch surface**:
  - Policy-consumer and gate-decision surfaces that read ledger outcomes
  - Local, CI, PR/handoff, and release policy wiring that stays inside `WS-6B`
- **Acceptance checks**:
  - Deferred parity never permits `E-promotion-complete` for Figma-dependent claims
  - Required parity stays blocked until the policy and ownership conditions from `S3a` and `S3b` are satisfied
  - No consumer path bypasses inherited `A/B/C` prerequisites or publishes a stronger claim than the ledger supports

##### Integration-only follow-ups

These items must be named and tracked separately from `WS-6B`; they are not valid packet scope:

- **`SEAM-5B` publish-marker or mode changes**
  - Any rename, expansion, or reinterpretation of `plugin-import-manual`, `rest-variables-oauth`, `tokens-studio-carried`, or upstream success-marker vocabulary
- **Credential ownership, OAuth app, or transport hardening work**
  - Any repo-owned app registration, secret handling, scope management, or delivery mechanism work for the hardened rail
- **Shared CI runner orchestration and repo-wide gate plumbing**
  - Any work that turns `WS-6B` reader or policy surfaces into shared runners, reusable CI entrypoints, or repo-wide enforcement jobs
- **Canonical source or projection path changes**
  - Any work that reopens `CT-H1`, `CT-H2`, or the path `design-tokens/dist/figma/tokens.json`

If a downstream task cannot be completed without taking one of these items, stop the packet and record the blocker as integration work instead of absorbing it into `WS-6B`.

##### Out of scope / do not absorb

- Do not redefine `CT-8B` fields, enums, or literal values inside this handoff packet.
- Do not redefine `CT-7B` publish modes, proof markers, or hardening targets.
- Do not implement plugin import, OAuth transport, credential storage, or Tokens Studio migration work here.
- Do not reopen claim-matrix policy, ownership roles, or exception categories unless an upstream planning artifact is first updated.
- Do not turn shared CI or release-process changes into seam-local `WS-6B` scope.

##### Exit criteria

The handoff packet is usable only when all of the following are true:

- Each in-scope packet can be assigned to one owner and delivered in one PR without requiring `WS-5B` edits.
- Every packet output traces directly to `S1`, `S2`, `S3a`, or `S3b` rather than inventing seam-local policy.
- Cross-seam dependencies are listed only under integration follow-ups and never restated as required `WS-6B` outputs.
- A future implementer can start from this file alone and identify the exact three implementation buckets, their inputs, their outputs, and their excluded dependencies.
