---
slice_id: S2
seam_id: SEAM-12B
slice_kind: delivery
execution_horizon: active
status: exec-ready
plan_version: v2
basis:
  currentness: current
  basis_ref: seam.md#basis
  stale_triggers:
    - artifact_revision_change_in_design_tokens_dist_figma_tokens_json
    - figma_variables_api_scope_change
gates:
  pre_exec:
    review: inherited
    contract: inherited
    revalidation: passed
  post_exec:
    landing: pending
    closeout: pending
threads:
  - THR-09
  - THR-10
contracts_produced: []
contracts_consumed:
  - CT-13B
  - CT-14B
open_remediations: []
candidate_subslices:
  - id: CS-S2-01
    name: figma-variables-api-capability-probe
    kind: probe
    authoritative: false
    candidate_subslice_decision:
      result: passed
      score: 11
      rationale:
        - 'Upstream contract stability: 1 — CT-13B partly defined, not published'
        - 'Coupling to upstream semantics: 2 — API probe does not depend on CT-13B semantics'
        - 'Isolation of verification: 2 — fully isolatable, tests API access and scope only'
        - 'Rework tolerance: 2 — cheap to discard, probe script is throwaway'
        - 'Scope narrowness: 2 — narrow, single purpose'
        - 'Contract authority impact: 2 — no authoritative publication'
    eligible_for_subslice_decomposition_when:
      - SEAM-12B is promoted to active # satisfied 2026-03-21
      - basis.currentness is revalidated to current # satisfied 2026-03-21
      - Figma OAuth app registration path is characterized # pending
    stale_triggers:
      - figma_variables_api_scope_change
---

### S2 - OAuth/Variables API rail implementation

- **User/system value**: Implement the repo-owned command that reads the canonical token artifact and deterministically writes variables into Figma via the OAuth/Variables API, replacing manual interpretation with an automatable, auditable publish path.

- **Scope (in/out)**:
  - In:
    - OAuth app registration (or characterize the registration path and blockers)
    - Credential model implementation per CT-14B contract definition
    - `scripts/figma-variables-sync.ts` (or equivalent) command that:
      - reads `design-tokens/dist/figma/tokens.json`
      - authenticates via OAuth2
      - writes variables to the target Figma file via Variables API
      - writes machine-readable status to `src/figma/sync-ledger.json`
    - Error handling, failure reporting, and retry logic
    - Determinism verification (same input -> same variable state)
    - `justfile` or `package.json` script registration
  - Out:
    - Removing the plugin-import-manual rail
    - Figma-to-repo reverse sync
    - Chromatic, Code Connect, or Storybook Connect rails
    - CT-14B publication (that happens at seam exit)

- **Acceptance criteria**:
  - Command executes successfully against the current artifact and target Figma file
  - sync-ledger.json shows hardened rail mode (`oauth-variables-api`) alongside `plugin-import-manual`
  - Machine-readable success markers written on each execution
  - Credential model is documented, enforced, and does not rely on personal tokens
  - Determinism test passes: two consecutive runs with the same input produce the same Figma variable state
  - Error cases produce machine-readable failure status in sync-ledger.json
  - Command is registered in `justfile` or `package.json` scripts

- **Dependencies**:
  - S1 (CT-14B contract definition — must know the target shape before building)
  - CT-13B (proof state — confirms current rail works, consumed as basis validation)
  - Figma Variables API access (external — OAuth app registration)
  - Figma OAuth2 endpoint availability

- **Verification**:
  - Integration test: command runs end-to-end against target Figma file
  - Determinism test: two runs, diff variable state
  - Credential model test: command fails cleanly if personal tokens used instead of OAuth
  - Ledger update test: sync-ledger.json reflects correct mode and status after execution
  - Error path test: command writes failure status on API error

- **Rollout/safety**:
  - Plugin-import-manual rail remains functional throughout
  - First execution should target a branch-specific or test Figma file if available
  - Hardened rail is additive — it does not remove or modify the existing path

- **Review surface refs**: R1 (workflow — dual-mode rail), R2 (data flow — OAuth/Variables API path), R4 (touch surface)

#### S2.T1 - OAuth app registration and credential model

- **Outcome**: Registered OAuth app with appropriate scopes; credential configuration documented
- **Inputs/outputs**:
  - Input: Figma OAuth2 documentation, Variables API scope requirements
  - Output: Registered app, `src/figma/oauth-config.json` (no secrets), credential model documentation
- **Thread/contract refs**: CT-14B (credential model is part of the contract)
- **Implementation notes**:
  - Determine required scopes for Variables API write access
  - Register OAuth app at org level (preferred) or characterize the approval path
  - Create `oauth-config.json` with app ID, redirect URI, required scopes — no client secrets
  - Document the credential storage model (where secrets live, who owns them)
- **Acceptance criteria**: OAuth app exists or approval path is documented; config file exists; no secrets in repo
- **Test notes**: Verify OAuth flow produces a valid access token with Variables API write scope
- **Risk/rollback notes**: External dependency — if org admin approval is required with unknown timeline, document the blocker and define fallback (personal dev app as interim, with explicit downgrade acknowledgment in CT-14B)

#### S2.T2 - Token-to-variables sync command

- **Outcome**: Working `figma-variables-sync` command that reads tokens and writes Figma variables
- **Inputs/outputs**:
  - Input: `design-tokens/dist/figma/tokens.json`, OAuth credentials
  - Output: Updated Figma file variables, sync-ledger.json status update
- **Thread/contract refs**: CT-14B (success markers), CT-13B (proof state as input validation)
- **Implementation notes**:
  - Parse `tokens.json` into Figma Variables API payload format
  - Authenticate via OAuth2 flow
  - PUT variables to target Figma file
  - Write success/failure markers to sync-ledger.json per CT-14B shape
  - Handle rate limits, partial failures, and network errors
- **Acceptance criteria**: Command runs end-to-end; ledger shows correct status; determinism test passes
- **Test notes**: Integration test against Figma; unit tests for token parsing and payload generation
- **Risk/rollback notes**: Variables API rate limits may require batching or retry logic; API error modes need characterization

#### S2.T3 - Determinism verification and script registration

- **Outcome**: Determinism test script and `justfile`/`package.json` registration
- **Inputs/outputs**:
  - Input: Working sync command from T2
  - Output: Registered script, determinism test
- **Thread/contract refs**: CT-14B (determinism is a key invariant)
- **Implementation notes**:
  - Run sync command twice with same input, compare variable state
  - Define "same state" at variable-value level (ignore Figma metadata like timestamps)
  - Register `just figma-sync` or `pnpm figma-sync` command
- **Acceptance criteria**: Determinism test passes; command is discoverable via standard tooling
- **Test notes**: Determinism test should be repeatable in CI
- **Risk/rollback notes**: Figma may inject metadata that differs between runs — define equivalence carefully

Checklist:

- Implement: OAuth registration, sync command, determinism test
- Test: integration, determinism, credential model, error paths
- Validate: sync-ledger shows dual-mode rail status
- Cleanup: remove any spike/probe artifacts that aren't needed in the final implementation

### Candidate subslice: CS-S2-01 — Figma Variables API capability probe

> **Non-authoritative.** This candidate subslice is embedded per the provisional subslice matrix (score: 11/12). It is not eligible for execution until SEAM-12B is activated and revalidated.

- **Purpose**: Spike the Figma Variables API to characterize scope requirements, rate limits, error modes, and payload format before committing to the full implementation approach.
- **Scope**: A throwaway script that authenticates against the Variables API, reads current variables from the target Figma file, and attempts a minimal write. Documents findings in a spike report.
- **Why this is safe as a candidate**:
  - Does not publish any authoritative contract
  - Does not perform consumer adoption
  - Does not change rollout policy or user-visible flow
  - Fully isolatable — can run against a test Figma file
  - Cheap to discard — probe script and report are throwaway
- **Blocked until**:
  - ~~SEAM-12B is promoted to `active`~~ (satisfied 2026-03-21)
  - ~~`basis.currentness` is revalidated to `current`~~ (satisfied 2026-03-21)
  - OAuth app registration path is at least characterized (pending — this is the remaining gate for CS-S2-01 authoritative promotion)
