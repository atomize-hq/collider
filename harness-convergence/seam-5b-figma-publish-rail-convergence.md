# `SEAM-5B` — Figma Publish Rail Convergence

- Name: Figma Publish Rail Convergence
- Type: integration
- Goal / user value: define the live repo-to-Figma publish rail that matches the target-state harness without turning Figma into a second source of truth.
- Primary owner role: design-system tooling maintainer
- Supporting owner roles: design maintainers, release/governance maintainer

## Scope

- In: the active repo-to-Figma publish contract; the short-term proof rail; the long-term hardened rail; explicit treatment of Tokens Studio as optional temporary carrier only; expected proof artifacts and status surfaces for downstream gate ownership.
- Out: canonical token or recipe authoring; implementation of the plugin/importer; implementation of the OAuth app; runtime and Storybook consumption details; CI wiring.

## Canonical Source and Inputs

- Canonical source remains inherited from historical `SEAM-1` and `SEAM-2`.
- This seam consumes:
  - stable token and theme definitions from canonical source
  - the generated Figma-facing artifact `design-tokens/dist/figma/tokens.json`
  - the target-state harness rule that Figma is a publish rail, not a canonical authoring surface

## Derived Projection Consumed

- Required input artifact: `design-tokens/dist/figma/tokens.json`
- Rule: the seam may define how the artifact is transported and verified, but it may not redefine the artifact as a hand-maintained surface

## Publish Rails

### Short-term proof rail

- Name: `plugin-import-manual`
- Purpose: prove that the repo-approved Figma artifact can be materialized into Figma deterministically without manual value transcription
- Allowed transport shape: repo-owned or OSS-backed plugin/importer flow
- Required posture: human-triggered import is acceptable; undocumented manual interpretation is not

### Long-term hardened rail

- Name: `rest-variables-oauth`
- Purpose: make the repo-to-Figma rail durable enough for required parity and promotion-safe automation
- Allowed transport shape: repo-owned OAuth app writing approved artifact contents into Figma through the Variables REST API
- Required posture: credentials, scopes, tenancy, and success markers must be explicit and owner-assigned

### Optional temporary carrier

- Name: Tokens Studio carrier mode
- Status: allowed only as a temporary carrier
- Required rule: if used, it carries the repo-approved projection and does not become a required permanent dependency of the harness
- Forbidden interpretation: Tokens Studio is not the permanent rail, not the canonical source, and not a prerequisite for the hardened harness state

## Primary Interfaces (Contracts)

- Inputs:
  - `CT-H1` canonical source boundary
  - `CT-H2` derived projection set
- Outputs:
  - `CT-7B` Figma publish rail contract
  - publish-mode definitions for `plugin-import-manual`, `rest-variables-oauth`, and optional temporary carrier usage
  - explicit success markers for downstream verification and promotion

## Key Invariants / Rules

- Repo PRs remain the only path that changes canonical token or recipe meaning.
- Figma consumes approved projections only.
- `plugin-import-manual` is the required proof target for short-term convergence.
- `rest-variables-oauth` is the required hardening target for long-term required parity.
- Tokens Studio may appear only as a temporary carrier, never as the permanent harness dependency.
- Any Figma-originated value edit is downstream noise until canonical repo source changes.
- The seam is not done when the rail is merely described; it is done only when downstream verification can state whether the active publish mode has been exercised successfully for the current artifact revision.

## Dependencies

- Blocks: `SEAM-6B`
- Blocked by: inherited `SEAM-1`, inherited `SEAM-3`

## Touch Surface

- planning/docs only in this pack
- future implementation touch surface is expected to include:
  - `design-tokens/dist/figma/**`
  - `src/figma/**`
  - plugin/importer code or OAuth app code once implementation work is explicitly started

## Verification

- proof rail verification:
  - a maintainer can materialize the current `design-tokens/dist/figma/tokens.json` artifact into a Figma pilot file through `plugin-import-manual`
  - the import flow does not require manual value re-entry
  - the artifact revision used for the attempt is recorded in the machine-readable ledger
- hardening verification:
  - the same artifact can be written through `rest-variables-oauth`
  - credential ownership and success markers are explicit
- temporary carrier verification:
  - if Tokens Studio is used, the ledger records that it is temporary and carrier-only

## Risks / Unknowns

- Risk: the proof rail works but is too informal to support deterministic promotion.
- De-risk plan: hand off explicit status and proof requirements to `SEAM-6B`.
- Risk: OAuth availability or scope rules delay the hardened rail.
- De-risk plan: keep parity deferred until the hardened rail is real and verified.
- Risk: temporary Tokens Studio usage becomes de facto permanent through inertia.
- De-risk plan: treat any Tokens Studio usage as an exception that must be recorded and eventually retired.

## Done Criteria

- the active publish rail names are frozen
- the proof and hardening roles are distinct and explicit
- Tokens Studio is demoted to optional temporary carrier only
- downstream verification and promotion have enough contract detail to consume this seam without guessing
