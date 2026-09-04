### S1 — Additive Drift Contract

- **Status**: decomposed into sub-slices for single-session execution.
- **Why split**:
  - The original slice crossed multiple primary touch surfaces: `package.json`, `scripts/**`, `justfile`, and CI workflow config.
  - It combined three different concerns: command wiring, deterministic drift detection, and advisory rollout wiring.
  - Keeping each concern separate reduces the chance that script-surface churn and CI rollout work block the core freshness contract.
- **Archived original**: `archive/slice-1-additive-drift-contract.md`
- **Sub-slice directory**: `slice-1-additive-drift-contract/`

#### Sub-slices

- `subslice-1-governance-entrypoint.md` (`S1a`): wires the seam-owned governance command in `package.json` and proves validation runs before build/freshness work.
- `subslice-2-artifact-freshness-validation.md` (`S1b`): adds the explicit watched-artifact freshness checker under `scripts/**`.
- `subslice-3-advisory-local-and-ci-exposure.md` (`S1c`): exposes the additive governance command through `justfile` and CI in advisory mode without promoting it into `just preflight`.
