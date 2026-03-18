### S1 — Sync Contract and Policy Baseline

- **User/system value**: freeze one safe v1 Figma sync posture and one exact repo artifact path so designers, maintainers, and downstream governance work from the same contract instead of ad hoc plugin settings.
- **Scope (in/out)**:
  - In: the default read-only or equivalently locked sync mode; operational policy docs under `src/figma/**`; a seed sync ledger that records the pilot file, artifact path, and policy branch.
  - Out: pilot-file execution inside Figma; enterprise REST parity automation; CI or preflight wiring.
- **Acceptance criteria**:
  - `CT-7` names `design-tokens/dist/figma/tokens.json` as the canonical Figma-facing artifact.
  - The operational doc states that repo JSON remains canonical and that bidirectional sync needs an explicit policy override.
  - A machine-readable pilot ledger exists and passes `scripts/validate-sync-ledger.mjs`.
- **Dependencies**: `SEAM-1/CT-2`, `SEAM-3/CT-5`
- **Verification**: review the policy doc for exact mode and override language; run `node scripts/validate-sync-ledger.mjs src/figma/sync-ledger.json`; confirm the ledger references the pilot file and canonical artifact path.
- **Rollout/safety**: keep the seam additive and documentation-led first; do not let the presence of a plugin config imply that Figma edits are authoritative.

#### S1.T1 — Publish the `CT-7` sync posture and transport boundary

- **Outcome**: maintainers get one normative operational doc that defines how Figma consumes the repo artifact in v1.
- **Inputs/outputs**:
  - Inputs: `design-tokens/dist/figma/tokens.json` from `CT-5`; theme IDs and fallback behavior from `CT-2`; the scope-brief assumption that the repo stays canonical.
  - Outputs: `src/figma/README.md` describing the default sync mode, allowed override path, artifact location, theme expectations, and refresh workflow.
- **Implementation notes**: name one default transport such as Tokens Studio URL read-only or an equivalently locked mode; document the approval path for any later bidirectional override, but do not define that override as v1 behavior.
- **Acceptance criteria**:
  - The doc states that Figma is a consumer and not the source of truth.
  - The doc names the canonical artifact path and required theme baseline.
  - The doc makes the policy branch explicit enough that `SEAM-6` can consume it later without rewriting it.
- **Test notes**: walk through the doc with one maintainer who did not author it and confirm they can explain the allowed and forbidden sync behaviors.
- **Risk/rollback notes**: policy drift is the main risk; keep all Figma sync rules in this doc and link other docs back to it rather than duplicating prose.

Checklist:

- Implement: add `src/figma/README.md` with the v1 sync posture, artifact path, and override procedure.
- Test: review the doc against `CT-2` and `CT-5` so theme IDs and export location match upstream contracts exactly.
- Validate: confirm the doc explicitly forbids implicit source-of-truth flips through plugin settings.
- Cleanup: remove redundant Figma sync notes from any other repo docs once this becomes the canonical policy entrypoint.

#### S1.T2 — Seed the pilot sync ledger

- **Outcome**: the seam has a machine-readable record of the pilot Figma file, artifact source, and current policy status.
- **Inputs/outputs**:
  - Inputs: `src/figma/README.md`; the generated Figma export from `CT-5`; the existing structural expectations in `scripts/validate-sync-ledger.mjs`.
  - Outputs: `src/figma/sync-ledger.json` with `ledgerVersion`, `scope`, `name`, `links`, `status`, and `drift`, plus explicit `status` fields for `syncMode`, `artifactPath`, `themeIds`, and `parityMode`.
- **Implementation notes**: keep the ledger narrow and explicit; it should record one pilot file and one artifact source, not become a generic asset registry. Reuse the current validator shape and add only the fields needed to make `CT-7` concrete.
- **Acceptance criteria**:
  - The ledger validates with the current script shape.
  - The ledger names the pilot Figma file or URL, the canonical artifact path, and the current parity branch.
  - The happy-path ledger keeps `drift` empty and records known exceptions explicitly when the pilot file is not yet fully aligned.
- **Test notes**: run the validator once on the happy path and once with a missing required field to prove failures are visible.
- **Risk/rollback notes**: if the ledger shape changes later, preserve backward compatibility long enough for `SEAM-6` to consume the new fields deliberately rather than via silent breakage.

Checklist:

- Implement: add `src/figma/sync-ledger.json` with the pilot-file and artifact metadata required by `CT-7`.
- Test: run `node scripts/validate-sync-ledger.mjs src/figma/sync-ledger.json`.
- Validate: confirm the ledger and `src/figma/README.md` agree on sync mode, artifact path, and parity posture.
- Cleanup: keep the ledger limited to the pilot file until a deliberate multi-file policy exists.
