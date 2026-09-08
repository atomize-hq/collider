# `SEAM-6` — Governance, Validation, and Cutover

- Name: Governance, Validation, and Cutover
- Type: risk
- Goal / user value: make the new token system trustworthy by catching drift early, staging the rollout safely, and ensuring the repo's required gates enforce the intended workflow.

## Scope

- In: validation scripts; stale-artifact checks; `package.json` script wiring; `justfile` integration; CI ordering; rollout steps for converting `src/lib/tokens/tokens.css` from hand-edited to generated.
- Out: token authoring taxonomy; recipe schema design; Figma plugin mechanics.

## Primary Interfaces (Contracts)

- Inputs: `pnpm validate:tokens`; `pnpm build:tokens`; Storybook and runtime adoption from `SEAM-4`; Figma sync policy from `SEAM-5`.
- Outputs: an enforceable drift gate in local and CI workflows; cutover rules that define when legacy manual editing is no longer allowed; optional parity checks for Figma artifacts.

## Key Invariants / Rules

- `just preflight` remains the pre-push source of truth and must cover the final token drift contract if token drift is considered release-blocking.
- Generated artifacts cannot drift silently from canonical JSON.
- The cutover from manual CSS to generated CSS happens once, with a rollback path.

## Dependencies

- Blocks: none
- Blocked by: `SEAM-3`, `SEAM-4`, `SEAM-5`

## Touch Surface

- `package.json`
- `justfile`
- `scripts/**`
- CI workflow config

## Verification

- Intentionally stale generated artifacts fail the local or CI gate.
- A missing token reference or malformed recipe fails validation before app build.
- The rollout plan includes a concrete rollback path for reverting to the last known-good generated CSS artifact.

## Risks / Unknowns

- Risk: over-tightening the gate before the build and consumption seams are stable will create churn and bypass pressure.
- De-risk plan: land validation in additive mode first, then promote it into `just preflight` and CI once the runtime and Figma consumers are proven.

## Rollout / Safety

- Stage 1: additive scripts and optional validation.
- Stage 2: generated runtime CSS with backward-compatible variable coverage.
- Stage 3: mandatory drift gates in `just preflight` and CI.
