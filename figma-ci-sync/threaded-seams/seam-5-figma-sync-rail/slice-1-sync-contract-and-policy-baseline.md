### S1 — Sync Contract and Policy Baseline

- **User/system value**: freeze one safe v1 Figma sync posture and one exact repo artifact path so designers, maintainers, and downstream governance work from the same contract instead of ad hoc plugin settings.
- **Scope (in/out)**:
  - In: the default read-only or equivalently locked sync mode; operational policy docs under `src/figma/**`; a seed sync ledger that records the pilot file, artifact path, and policy branch.
  - Out: pilot-file execution inside Figma; API-backed parity automation; CI or preflight wiring.
- **Acceptance criteria**:
  - `CT-7` names `design-tokens/dist/figma/tokens.json` as the canonical Figma-facing artifact.
  - The operational doc states that repo JSON remains canonical and that bidirectional sync needs an explicit policy override.
  - The operational doc fixes the v1 proof transport to `plugin-import-manual` and states that the lock is both technical and policy-enforced.
  - The seam uses `parityMode=deferred|required` only; v1 starts at `deferred`.
  - A machine-readable pilot ledger exists and passes `scripts/validate-sync-ledger.mjs`.
- **Dependencies**: `SEAM-1/CT-2`, `SEAM-3/CT-5`
- **Verification**: review the policy doc for exact mode and override language; run `node scripts/validate-sync-ledger.mjs src/figma/sync-ledger.json`; confirm the ledger references the pilot file and canonical artifact path.
- **Rollout/safety**: keep the seam additive and documentation-led first; do not let the presence of a plugin config imply that Figma edits are authoritative.

#### S1.T1 — Publish the `CT-7` sync posture and transport boundary

- **Outcome**: maintainers get one normative operational doc that defines how Figma consumes the repo artifact in v1.
- **Inputs/outputs**:
  - Inputs: `design-tokens/dist/figma/tokens.json` from `CT-5`; theme IDs and fallback behavior from `CT-2`; the scope-brief assumption that the repo stays canonical.
  - Outputs: `src/figma/README.md` describing the default sync mode, allowed override path, artifact location, theme expectations, and refresh workflow.
- **Implementation notes**: name one default short-term transport only, `plugin-import-manual`, meaning a Figma plugin or importer materializes the repo-owned artifact and no write-back path is configured. Document the preferred long-term rail, `rest-variables-oauth`, as a later hardening path rather than v1 behavior. Tokens Studio may be mentioned only as a replaceable temporary carrier, not as the permanent contract. Treat the lock as both technical (no canonical write credentials/automation in v1) and policy-enforced (repo PRs remain canonical).
- **Acceptance criteria**:
  - The doc states that Figma is a consumer and not the source of truth.
  - The doc names the canonical artifact path and required theme baseline.
  - The doc names `plugin-import-manual` as the default v1 proof transport, names `rest-variables-oauth` as the preferred long-term hardened rail, and states that `parityMode` starts at `deferred`.
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
  - Outputs: `src/figma/sync-ledger.json` with the fixed root keys `ledgerVersion`, `scope`, `name`, `links`, `status`, and `drift`.
- **Implementation notes**: keep the ledger narrow and explicit; it should record one pilot file and one artifact source, not become a generic asset registry. Reuse the current validator shape and extend it to the following exact v1 schema:
  - `ledgerVersion`: required string literal `"1"`.
  - `scope`: required string literal `"figma-pilot"`.
  - `name`: required non-empty string naming the pilot file entry.
  - `links`: required object with exactly these seam-owned keys:
    - `figmaFile`: required string URL or `figma://file/<key>` reference for the pilot file.
    - `artifact`: required repo-relative string `design-tokens/dist/figma/tokens.json`.
    - `policy`: required repo-relative string `src/figma/README.md`.
    - `parityPolicy`: required repo-relative string `src/figma/parity-policy.md`.
  - `status`: required object with exactly these keys:
    - `syncMode`: required string literal `plugin-import-manual` or `rest-variables-oauth`.
    - `artifactPath`: required repo-relative string `design-tokens/dist/figma/tokens.json`.
    - `artifactGitSha`: required 40-character lowercase Git commit SHA for the repo revision used by the last reviewed pull. The contract stores the revision in this separate field and does not duplicate it under another name.
    - `themeIds`: required non-empty array of unique theme IDs from `CT-2`; it must include `dark`.
    - `themeMapping`: required non-empty array of objects shaped as `{ "themeId": string, "figmaMode": string }`, one per imported theme.
    - `parityMode`: required string literal `deferred` or `required`.
    - `parityDeferredReason`: required non-empty string when `parityMode=deferred`; forbidden when `parityMode=required`.
    - `lastSuccessfulPullAt`: required ISO-8601 UTC timestamp string when a pull has succeeded, otherwise `null`.
    - `canonicalSource`: required string literal `repo-pr`.
  - `drift`: required array. The happy path uses `[]`. Each exception entry is an object with required `code`, `severity`, `message`, and `status` keys plus optional `field`; `severity` is `info|warn|error`, `status` is `open|resolved`, and `field` is a dotted ledger path such as `status.themeMapping`.
  - Use `syncMode=plugin-import-manual|rest-variables-oauth` and `parityMode=deferred|required` only; v1 seeds the ledger at `syncMode=plugin-import-manual` and `parityMode=deferred`.
- **Acceptance criteria**:
  - The ledger validates with the current script shape.
  - The ledger names the pilot Figma file or URL, the canonical artifact path, and the current parity branch.
  - The happy-path ledger keeps `drift` empty and records known exceptions explicitly when the pilot file is not yet fully aligned.
  - The ledger stores the reviewed artifact revision in `status.artifactGitSha` and never as a second competing revision field.
  - The ledger never uses `advisory` or `ready for enforcement`; the allowed parity vocabulary is `deferred` or `required` only.
- **Test notes**: run the validator once on the happy path and once with a missing required field to prove failures are visible.
- **Risk/rollback notes**: if the ledger shape changes later, preserve backward compatibility long enough for `SEAM-6` to consume the new fields deliberately rather than via silent breakage.

Checklist:

- Implement: add `src/figma/sync-ledger.json` with the pilot-file and artifact metadata required by `CT-7`.
- Test: run `node scripts/validate-sync-ledger.mjs src/figma/sync-ledger.json`.
- Validate: confirm the ledger and `src/figma/README.md` agree on sync mode, artifact path, and parity posture.
- Cleanup: keep the ledger limited to the pilot file until a deliberate multi-file policy exists.
