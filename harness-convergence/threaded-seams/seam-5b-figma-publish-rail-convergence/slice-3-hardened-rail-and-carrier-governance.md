### S3 — Hardened Rail and Carrier Governance

- **User/system value**: the project can move from proof-only materialization toward required parity without treating OAuth hardening or Tokens Studio carriage as informal follow-up work.
- **Scope (in/out)**:
  - In: the hardened `rest-variables-oauth` target contract, credential and tenancy ownership expectations, deterministic success markers, and the temporary-carrier exception lifecycle.
  - Out: implementing the OAuth app itself, defining merge-gate behavior, or claiming `E-promotion-complete`.
- **Acceptance criteria**:
  - The hardened rail contract names the required transport, owner-assigned credential model, and deterministic success markers.
  - Tokens Studio is described only as an optional temporary carrier with explicit entry, recording, and exit rules.
  - The slice states which `SEAM-5B` outputs are sufficient for proof-only publish validity and which are prerequisites before `SEAM-6B` may consider required parity.
  - No task here changes contract ownership for `CT-8B` or promotion-level policy.
- **Dependencies**: `S1`; `S2` is preferred evidence for hardening readiness but not a blocker for documenting the hardened target
- **Verification**: inspect the hardened-target contract and carrier policy for explicit owners, scopes, and success markers; confirm the docs make deferred versus hardening-ready evidence distinguishable.
- **Rollout/safety**: keep hardened-target work declarative until owned credentials and API access exist; treat carrier usage as an exception path, not a convenience default.

#### S3.T1 — Define the `rest-variables-oauth` hardening contract

- **Outcome**: maintainers have one exact contract for the only approved long-term hardened rail.
- **Inputs/outputs**:
  - Inputs: `CT-7B`, target-state harness Figma rail rules, `S1.T1` rail policy entrypoint
  - Outputs: a hardening contract doc under `src/figma/**` naming credential owner, tenancy model, required scopes, source artifact, destination behavior, and success markers.
- **Implementation notes**: keep the rail bound to `design-tokens/dist/figma/tokens.json`. Name the transport as a repo-owned OAuth app writing through the Figma Variables REST API. Define what counts as success in rail terms only: authenticated write path, explicit destination, deterministic completion marker, and no write-back of canonical meaning.
- **Acceptance criteria**:
  - The doc names `rest-variables-oauth` as the only approved hardening target.
  - The doc assigns ownership expectations for credentials, scopes, and tenancy.
  - The doc defines rail-level success markers without taking over `CT-8B` promotion decisions.
  - The doc keeps the artifact boundary and downstream-only rule identical to the proof rail.
- **Test notes**: review the contract with a governance owner and confirm no OAuth ambiguity remains around who owns credentials or what proves a successful push.
- **Risk/rollback notes**: the risk is pseudo-hardening through vague OAuth language; keep every required ownership and success marker explicit before implementation begins.

Checklist:

- Implement: add the hardened-rail contract doc for `rest-variables-oauth`.
- Test: confirm the contract names the required transport, owner, scopes, and success markers.
- Validate: check that the contract still uses `design-tokens/dist/figma/tokens.json` as the sole source artifact.
- Cleanup: remove any language that implies a different long-term rail is equally acceptable.

#### S3.T2 — Define the Tokens Studio temporary-carrier exception lifecycle

- **Outcome**: any Tokens Studio usage becomes an explicit, temporary exception path instead of a silent permanent dependency.
- **Inputs/outputs**:
  - Inputs: `CT-7B`, `S1.T2` publish-proof contract, `S2.T2` proof-record expectations
  - Outputs: a carrier-policy doc or appendix under `src/figma/**` describing when Tokens Studio may be used, what must be recorded, and what retires the exception.
- **Implementation notes**: require three things whenever Tokens Studio is used: the active rail still starts from the repo-approved artifact, the publish proof records `tokens-studio-carried`, and the doc names the exit condition back to non-carrier rails. Forbid wording that makes Tokens Studio required for steady-state parity.
- **Acceptance criteria**:
  - The policy allows Tokens Studio only as temporary carriage of repo-approved data.
  - The policy requires each usage to be recorded in the seam-owned publish-proof surface.
  - The policy names an exit expectation or retirement trigger.
  - The policy states that carrier usage alone cannot justify permanent required parity.
- **Test notes**: review one hypothetical carrier-assisted proof and confirm the policy makes clear why it is still temporary and what remains to be retired.
- **Risk/rollback notes**: the main risk is inertia; keep the policy biased toward removal by requiring explicit recording and exit criteria.

Checklist:

- Implement: add the temporary-carrier policy and exception-recording rules.
- Test: run a policy review against one Tokens Studio-assisted scenario and one non-carrier scenario.
- Validate: confirm the policy never treats Tokens Studio as canonical or permanently required.
- Cleanup: cross-link the carrier policy from the main rail entrypoint so maintainers cannot miss it.
