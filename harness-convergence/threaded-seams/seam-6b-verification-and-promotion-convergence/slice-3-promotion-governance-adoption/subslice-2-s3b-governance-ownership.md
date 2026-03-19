### S3b — Governance ownership for parity transitions and blockers

- **User/system value**: maintainers can determine who owns deferred-versus-required parity decisions and who must clear blocking exceptions before higher promotion claims are allowed.
- **Scope (in/out)**:
  - In: owner roles for release or governance maintainers, design-system tooling maintainers, and design maintainers; approval expectations for parity-mode changes; owner and clearing-condition rules for blocking exceptions.
  - Out: claim matrix details for consumer contexts; implementation tickets or handoff packaging; credentials, scopes, or transport changes owned by `SEAM-5B`.
- **Acceptance criteria**:
  - Required parity cannot be claimed without explicit governance ownership for the enforcing gate.
  - Every blocking exception has an owner and a clearing condition.
  - The hardening target remains `rest-variables-oauth`; no alternate permanent rail is introduced.
  - Ownership language does not reassign `SEAM-5B` transport or credential ownership.
- **Dependencies**:
  - `S1`
  - `S2`
  - inherited `SEAM-4`
  - `SEAM-5B`
  - `CT-7B`
  - `CT-8B`
- **Verification**:
  - Check that every transition or blocked state from the claim matrix has a named owner.
  - Check that every blocking exception from `S2.T3` has a clearing condition.
  - Confirm no role table introduces a second hardening target or alternate permanent rail.
- **Rollout/safety**:
  - Governance-policy only. If ownership remains unclear, parity stays deferred and the ambiguity is recorded explicitly.

#### S3.T2 — Assign governance ownership for parity transitions and blockers

- **Outcome**: owner roles and approval expectations are explicit for moving from proof mode to required parity and for clearing blocking exceptions.
- **Files**:
  - `harness-convergence/threaded-seams/seam-6b-verification-and-promotion-convergence/slice-3-promotion-governance-adoption/subslice-2-s3b-governance-ownership.md`
  - `harness-convergence/threading.md`
- **Inputs/outputs**:
  - Inputs: claim-matrix contexts from `S3.T1`; exception categories and evaluator blocked states from `S2.T1` through `S2.T3`; seam owner roles from `SEAM-6B`; hardening-readiness outputs consumed from `SEAM-5B`.
  - Outputs: one parity-transition ownership table and one blocker-clearing table that future governance or release maintainers can apply without reopening transport policy.
- **Implementation notes**:
  - `SEAM-6B` owns the governance decision for parity-mode changes and promotion claims that consume ledger evidence.
  - `SEAM-5B` remains the owner of `publish.mode`, transport shape, credential and scope ownership expectations, tenancy model, and hardening success-marker definitions.
  - Design maintainers may confirm design-surface readiness or carrier retirement readiness, but they do not inherit OAuth transport, credential, or scope ownership from `SEAM-5B`.
  - If a decision owner, evidence owner, or clearing condition is missing, the affected row stays deferred or blocked; shared or implied ownership is not accepted.

Parity-transition ownership table:

| Transition or state                                  | Allowed claim boundary                                                                                       | Primary decision owner                                            | Supporting evidence owner             | Required approvals or confirmations                                                                                                                  | Clearing condition                                                                                                                                                       | Explicit non-goals / ownership boundary                                                              |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `deferred` proof posture with `plugin-import-manual` | May reach `D-publish-valid`, but not `E-promotion-complete`                                                  | release/governance maintainer                                     | design-system tooling maintainer      | release/governance maintainer approves continued deferral; design maintainers confirm design-side materialization readiness when needed              | current `D-publish-valid` proof exists for the current artifact revision, `promotion.parityMode="deferred"` is explicit, and `promotion.parityDeferredReason` is present | does not authorize `required` parity, `E-promotion-complete`, or any alternate permanent rail        |
| transition from `deferred` to `required`             | Opens the path to `E-promotion-complete` only after the required state is active and blocker rows are clear  | release/governance maintainer                                     | design-system tooling maintainer      | explicit gate ownership is assigned; design maintainers confirm design-side readiness; release/governance maintainer approves the parity-mode change | `publish.mode="rest-variables-oauth"`, current verification is machine-readable for the active artifact revision, and no blocker row remains unresolved                  | does not create OAuth transport, credentials, scopes, or tenancy; those stay consumed from `SEAM-5B` |
| `required` parity steady state                       | May reach `E-promotion-complete` only while all required blockers remain cleared                             | release/governance maintainer                                     | design-system tooling maintainer      | release/governance maintainer keeps required parity in force; design maintainers provide design-side confirmation only when applicable               | `rest-variables-oauth` remains the active hardened rail, current revision verification is still valid, and the blocker-clearing table is fully satisfied                 | does not weaken inherited `A/B/C` prerequisites or replace ledger evidence with prose review         |
| blocked `required` parity state                      | Highest allowed claim falls back to `C-consumption-valid` or `D-publish-valid`, depending on the blocker row | release/governance maintainer for claim denial or continued block | depends on the blocker category below | release/governance maintainer records the continued block until the named owner clears it                                                            | the named blocker row has a single clearing owner, a satisfied clearing condition, and explicit approval where required                                                  | no shared-ownership fallback and no substitute permanent rail beyond `rest-variables-oauth`          |

Blocker-clearing table:

| Blocker / exception category                             | Blocks `D`, `E`, or both | Owner responsible for clearing   | Evidence required to clear                                                                                                   | Escalation / approval owner   | Notes                                                                                                                  |
| -------------------------------------------------------- | ------------------------ | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| deferred parity remains active                           | `E`                      | release/governance maintainer    | governance-approved move to `required`, backed by current `rest-variables-oauth` verification and explicit gate ownership    | release/governance maintainer | `D-publish-valid` may still be claimable when the proof rail is current; deferred posture alone cannot justify `E`     |
| Tokens Studio carrier still active                       | `E`                      | design-system tooling maintainer | a non-carrier rail is current and verified for the active artifact revision, and carrier retirement is explicitly recorded   | release/governance maintainer | design maintainers may confirm design-side readiness, but carrier usage alone cannot justify permanent required parity |
| missing credential ownership for the hardened rail       | `E`                      | design-system tooling maintainer | `SEAM-5B` hardening docs explicitly name the credential, scope, and tenancy owner for `rest-variables-oauth`                 | release/governance maintainer | `SEAM-6B` consumes this ownership evidence; it does not assign credentials itself                                      |
| incomplete hardened-rail success markers                 | `E`                      | design-system tooling maintainer | `SEAM-5B` success-marker definitions are complete and the ledger shows current hardened-rail verification                    | release/governance maintainer | success-marker vocabulary stays upstream; this seam only requires that it exist and be current                         |
| stale or missing current-revision verification           | both                     | design-system tooling maintainer | `verification.materializationStatus="passed"` and `verification.lastVerifiedRevision` matches the current artifact revision  | release/governance maintainer | stale or incomplete verification blocks current `D` and therefore also blocks `E`                                      |
| ambiguous owner assignment or missing clearing condition | both                     | release/governance maintainer    | the affected transition or blocker row is updated to name one decision owner, one evidence owner, and one clearing condition | release/governance maintainer | ambiguity is treated as a policy failure; the seam prefers explicit deferral or block over shared ownership            |

- **Acceptance notes**:
  - The parity-transition table is complete only if every consumer-facing state from `S3.T1` has one primary decision owner.
  - The blocker table is complete only if every exception path from `S2.T3` maps to one clearing owner and one clearing condition.
  - `rest-variables-oauth` stays the only approved hardening target before `required` parity or `E-promotion-complete` may be claimed.
- **Test notes**:
  - Review one deferred proof example and confirm that ownership ends at `D-publish-valid` with no implied path to `E`.
  - Review one required-parity example and confirm the same three roles can explain who decides the state, who supplies the evidence, and who clears blockers.
  - Review each blocker row and confirm no row reassigns transport, credential, scope, or tenancy ownership from `SEAM-5B`.
- **Risk/rollback notes**:
  - If a future blocker does not fit one of these rows, default to deferred or blocked status until a new explicit row is added.
  - If `SEAM-5B` changes its hardening evidence shape, update the consumed evidence reference here rather than inventing a seam-local substitute.

Checklist:

- Implement:
  - Define owner roles and approvals for parity changes and exception clearance.
  - Map blocked states to explicit owner and clearing-condition pairs.
  - Keep `SEAM-5B` publish-mode and transport ownership as consumed inputs.
- Test:
  - Verify each claim-matrix transition has an owner and clearing condition.
  - Verify a deferred case and a required-parity case both resolve without shared or ambiguous ownership.
- Validate:
  - Confirm no task reassigns `SEAM-5B` transport ownership into this seam.
  - Confirm `rest-variables-oauth` remains the only hardening target before required parity.
  - Confirm unresolved ownership keeps parity deferred rather than silently accepted.
