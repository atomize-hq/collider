# `SEAM-6B` — Verification and Promotion Convergence

- Name: Verification and Promotion Convergence
- Type: risk
- Goal / user value: define how the target-state harness decides whether the new Figma publish rail is merely declared, actually verified, or safe to treat as a promotable required rail.
- Primary owner role: release/governance maintainer
- Supporting owner roles: design-system tooling maintainer, design maintainers

## Scope

- In: machine-readable Figma verification semantics; parity deferral versus required rules; publish-valid versus promotion-complete thresholds; inheritance of source/projection/consumption levels from the old pack; explicit gate ownership for the new Figma rail.
- Out: implementing CI jobs; implementing the plugin rail; implementing the OAuth app; reopening canonical token, recipe, build, or Storybook contracts except as inputs.

## Inputs

- inherited source, projection, and consumption validity from historical `SEAM-1` through `SEAM-4`
- `CT-7B` from `SEAM-5B`
- the target-state harness promotion ladder

## Outputs

- `CT-8B` machine-readable verification and promotion status contract
- rules for when `parityMode` may remain `deferred`
- rules for when `parityMode` may move to `required`
- rules for when `D-publish-valid` and `E-promotion-complete` may be claimed

## Key Invariants / Rules

- historical seam-6 governance notes are evidence, not sufficient live truth, until they consume `SEAM-5B`
- no Figma rail is promotable on prose alone; it requires machine-readable status
- `plugin-import-manual` can satisfy publish proof but does not automatically justify required parity
- `rest-variables-oauth` is the expected rail before required parity can be claimed
- a deferred rail must remain explicitly deferred; it cannot silently count as complete
- if the ledger is absent or incomplete, the rail may be planned but not promoted

## Promotion Rules

### Allowed while `parityMode=deferred`

- `A-source-valid`
- `B-projection-valid`
- `C-consumption-valid`
- `D-publish-valid`, but only if the current artifact revision has a successful publish proof recorded

### Required before `parityMode=required`

- the hardened rail is `rest-variables-oauth`
- owned credentials and scopes exist
- deterministic success markers exist
- machine-readable verification is current for the active artifact revision
- governance ownership is explicit for the gate that will enforce parity

### Required before `E-promotion-complete` for Figma-dependent claims

- `promotion.parityMode="required"`
- no blocking exceptions remain in the ledger
- the required rail for the claim is current and verified
- the current artifact revision is the one that was published and verified

## Dependencies

- Blocks: future merge/handoff decisions that want to claim completed Figma parity
- Blocked by: inherited `SEAM-4`, `SEAM-5B`

## Touch Surface

- planning/docs only in this pack
- future implementation touch surface is expected to include:
  - `src/figma/sync-ledger.json`
  - validation scripts that read the ledger
  - local and CI gate definitions once implementation is explicitly started

## Verification

- a maintainer can determine the highest earned promotion level for the current artifact revision without reading prose
- the ledger distinguishes:
  - declared rail
  - published rail
  - verified rail
  - deferred parity
  - required parity
  - promotable completion
- exceptions are explicit and reviewable

## Risks / Unknowns

- Risk: the project claims publish validity from one successful pilot run without tracking artifact freshness.
- De-risk plan: require artifact revision recording in the ledger.
- Risk: parity remains deferred indefinitely because the hardening target is never owner-assigned.
- De-risk plan: keep `rest-variables-oauth` named as the only approved hardening target.
- Risk: gate language becomes ambiguous across local, CI, and handoff contexts.
- De-risk plan: keep `CT-8B` machine-readable and promotion-level based.

## Done Criteria

- the Figma rail has a concrete machine-readable status contract
- deferred versus required parity is explicit and enforceable
- the project can state when a change is publish-valid versus promotion-complete
- future implementation work can wire gates without reinterpreting historical seam-5 or seam-6 prose
