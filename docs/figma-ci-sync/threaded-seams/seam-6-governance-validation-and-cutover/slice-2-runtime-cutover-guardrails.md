### S2 — Runtime Cutover Guardrails

- **Audit result**: decomposed. The original slice combined three different execution surfaces: a new runtime CSS compatibility checker under `scripts/**`, a seam-owned operational cutover/rollback runbook, and post-cutover guard wiring back into the additive governance path from `S1`. Even with only three top-level tasks, completing it would span `scripts/**`, `package.json`, `src/lib/tokens/tokens.css`, and seam-local governance docs with three different verification layers, so the split keeps each sub-slice to one primary outcome and one main proof path.
- **Archived original**: `archive/slice-2-runtime-cutover-guardrails.md`
- **Sub-slice directory**: `slice-2-runtime-cutover-guardrails/`

#### Sub-slices

- `slice-2-runtime-cutover-guardrails/subslice-1-runtime-css-compatibility-surface.md`
  - Moves original `S2.T1` into the compatibility-surface definition and validation script that proves generated runtime CSS still carries the legacy variables required during the cutover window.
- `slice-2-runtime-cutover-guardrails/subslice-2-cutover-and-rollback-runbook.md`
  - Moves original `S2.T2` into the seam-owned runbook that defines evidence gates, cutover steps, and the exact rollback command sequence.
- `slice-2-runtime-cutover-guardrails/subslice-3-post-cutover-drift-guard.md`
  - Moves original `S2.T3` into additive governance guard wiring that treats manual edits to `src/lib/tokens/tokens.css` as drift only after the compatibility proof and runbook exist.

#### Sequencing

- `S2a` should land first so the seam has an explicit, versioned compatibility surface before maintainers decide that generated CSS is safe to make authoritative.
- `S2b` should follow once `S2a` is stable, because the runbook needs the exact validation command and evidence surface the compatibility checker establishes.
- `S2c` should land last so the no-manual-edit guard depends on an already-proven compatibility check and an already-documented rollback path instead of creating bypass pressure.
