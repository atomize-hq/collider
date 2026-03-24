### S3b - Finalize the Figma Policy Branch

- **User/system value**: make the governance gate's Figma behavior explicit so parity is either required or intentionally deferred with a visible reason.
- **Scope (in/out)**:
  - In: policy resolution inputs from `SEAM-5`, seam-owned wiring in `package.json` and `scripts/**`, and fixture coverage for required vs deferred modes.
  - Out: CI ordering, local `justfile` promotion mechanics, and Figma export generation internals.
- **Acceptance criteria**:
  - If policy requires parity or sync-ledger checks, failing them blocks the governance command.
  - If policy defers parity, the governance command reports that branch explicitly instead of silently omitting the check.
  - The policy branch is data-driven and reusable by local and CI callers.
- **Dependencies**:
  - `SEAM-5`
  - `CT-7`
  - `S1`
- **Verification**:
  - Exercise one required-parity policy fixture and one deferred-parity policy fixture.
  - Confirm both modes resolve through the same governance entrypoint.
- **Rollout/safety**:
  - Keep the branch configuration-driven so future tightening is a policy update, not a script rewrite.

#### S3b.T1 - Move `S3.T2` into a dedicated policy-resolution slice

- **Outcome**: the governance command consumes the settled `SEAM-5` decision without inventing a second sync policy.
- **Files**:
  - `package.json`
  - `scripts/**`
  - policy fixtures under `scripts/**` or adjacent seam-owned test data

Checklist:

- Implement:
  - Wire sync-ledger or parity behavior into the governance command using the settled Figma policy input.
  - Make the required and deferred branches explicit in script output and failure paths.
- Test:
  - Verify required and deferred policy modes behave distinctly and predictably.
  - Confirm a parity-required failure blocks the governance command.
- Validate:
  - Confirm local and CI callers can consume the same policy-resolution surface.
  - Remove temporary policy toggles once the v1 decision is settled.
