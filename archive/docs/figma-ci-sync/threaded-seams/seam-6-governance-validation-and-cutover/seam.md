# `SEAM-6` — Governance, Validation, and Cutover

## Seam Brief (Restated)

- **Seam ID**: `SEAM-6`
- **Name**: Governance, Validation, and Cutover
- **Goal / value**: Make the repo-authored token system trustworthy by proving generated artifacts stay fresh, staging the CSS handoff safely, and promoting the final drift contract into the same local and CI gates the repo already treats as mandatory.
- **Type**: risk
- **Slicing strategy**: risk-first, because the seam is primarily about preventing silent drift and making the one-time runtime CSS cutover reversible before the gate becomes mandatory.
- **Scope**
  - In: validation script wiring; stale-artifact checks; `package.json` script orchestration; `justfile` integration; CI ordering; rollout rules for converting `src/lib/tokens/tokens.css` from hand-edited to generated.
  - Out: token taxonomy design; recipe schema design; Figma plugin mechanics; generation internals owned by `SEAM-3`; runtime and Storybook consumption work owned by `SEAM-4`.
- **Touch surface**: `package.json`, `justfile`, `scripts/**`, CI workflow config, and seam-local governance/cutover docs that describe the one-time migration and rollback path.
- **Verification**: stale generated artifacts fail deterministically; malformed token or recipe inputs fail before app and Storybook builds; the cutover path names an exact rollback action to restore the last known-good generated CSS artifact.
- **Threading constraints**
  - Upstream blockers: `SEAM-3`, `SEAM-4`, `SEAM-5`
  - Downstream blocked seams: none
  - Contracts produced (owned): `CT-8`
  - Contracts consumed: `CT-4`, `CT-5`, `CT-6`, `CT-7`

## Slice Index

- `S1` → `slice-1-additive-drift-contract.md`: Define the non-blocking governance contract and freshness checks without tightening repo gates too early.
- `S2` → `slice-2-runtime-cutover-guardrails.md`: Prove the generated CSS handoff is reversible and compatible before manual editing is retired.
- `S3` → `slice-3-mandatory-preflight-and-ci-enforcement.md`: Promote the drift contract into `just preflight` and CI after runtime and Figma consumers are stable.

## Threading Alignment

- **Contracts produced (owned)**:
  - `CT-8`: local and CI drift gates that run validation, build, freshness checks, Storybook checks, and policy-gated Figma parity checks. This contract lives across `package.json`, `justfile`, CI workflow config, and token-governance scripts under `scripts/**`. It is established in `S1`, extended with cutover rules in `S2`, and made mandatory in `S3`.
- **Contracts consumed**:
  - `CT-4`: required from `SEAM-3`; `S1.T1` wires `pnpm validate:tokens` into a seam-owned governance entrypoint without redefining validator behavior.
  - `CT-5`: required from `SEAM-3`; `S1.T1` and `S1.T2` depend on `pnpm build:tokens` and stable artifact paths to detect freshness deterministically.
  - `CT-6`: required from `SEAM-3` and proven through `SEAM-4`; `S2.T1` and `S2.T2` use the generated runtime CSS artifact and its compatibility obligations to govern the cutover.
  - `CT-7`: required from `SEAM-5`; `S3.T2` uses the settled sync policy to decide whether parity or sync-ledger checks are mandatory or explicitly deferred.
- **Dependency edges honored**:
  - `SEAM-3 blocks SEAM-6`: this plan assumes validation/build commands and generated artifact paths already exist; no task redefines build internals or token schemas.
  - `SEAM-4 blocks SEAM-6`: the mandatory gate is not promoted until runtime and Storybook are already consuming generated artifacts and the CSS handoff can be verified end to end.
  - `SEAM-5 blocks SEAM-6`: Figma parity enforcement is policy-driven and only becomes blocking after the sync mode and export artifact are stable.
- **Parallelization notes**:
  - What can proceed now: `S1` can start as soon as `CT-4` and `CT-5` are available, because additive governance only wires existing commands and adds freshness logic in `scripts/**`.
  - What must wait: `S2` waits for `SEAM-4` to prove runtime and Storybook adoption against generated CSS; `S3` waits for `S2` completion and the final `SEAM-5` sync policy before turning the gate into a required preflight/CI check.
