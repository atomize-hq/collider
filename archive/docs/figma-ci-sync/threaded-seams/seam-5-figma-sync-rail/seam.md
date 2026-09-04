# `SEAM-5` — Figma Sync Rail

## Seam Brief (Restated)

- **Seam ID**: `SEAM-5`
- **Name**: Figma Sync Rail
- **Goal / value**: let designers consume repo-approved tokens inside Figma through one explicit, read-only-by-default rail so Figma reflects canonical repo state without becoming an authoring surface.
- **Type**: integration
- **Slicing strategy**: contract-first, because `SEAM-5` owns `CT-7` and blocks `SEAM-6`; the first slice has to freeze the sync posture and artifact boundary before pilot pulls or optional parity hardening make sense.
- **Scope**
  - In: v1 sync-mode selection; operational docs under `src/figma/**`; one pilot sync ledger for a team-owned Figma test file; optional ledger/parity validation hooks under `scripts/validate-sync-ledger.mjs`.
  - Out: token or theme authoring; build-pipeline internals in `SEAM-3`; runtime or Storybook consumption; `package.json`, `justfile`, or CI gate wiring owned by `SEAM-6`; making bidirectional Figma authoring the default workflow.
- **Touch surface**: `design-tokens/dist/figma/**`, `src/figma/**`, `scripts/validate-sync-ledger.mjs`
- **Verification**: maintainers can use the chosen plugin/import rail to materialize the canonical export into one Figma test file without manual value entry, and inspect a ledger that states whether parity is `deferred` or `required`.
- **Threading constraints**
  - Upstream blockers: `SEAM-1`, `SEAM-3`
  - Downstream blocked seams: `SEAM-6`
  - Contracts produced (owned): `CT-7`
  - Contracts consumed: `CT-2`, `CT-5`

## Slice Index

- `S1` → `slice-1-sync-contract-and-policy-baseline.md`: publish the default sync posture, artifact boundary, and machine-readable pilot ledger that define `CT-7`.
- `S2` → `slice-2-pilot-pull-path-and-theme-materialization.md`: prove one Figma pilot file can pull the repo artifact and materialize the required theme contract.
- `S3` → `slice-3-optional-parity-hooks-and-governance-handoff.md`: harden the ledger and parity contract enough for `SEAM-6` to adopt later without taking over CI ownership here.

## Threading Alignment

- **Contracts produced (owned)**:
  - `CT-7`: the Figma-facing export contract centered on `design-tokens/dist/figma/tokens.json`, with the v1 sync posture and pilot operational state recorded under `src/figma/README.md` and `src/figma/sync-ledger.json`. `S1` publishes the baseline contract, `S2` proves it against a real pilot file, and `S3` sharpens the `deferred` versus `required` parity branch that `SEAM-6` will later consume.
- **Contracts consumed**:
  - `CT-2`: required from `SEAM-1`; `S1.T1` uses stable theme IDs and fallback rules to define the Figma sync posture, and `S2.T2` records how those theme IDs materialize into the pilot Figma file.
  - `CT-5`: required from `SEAM-3`; `S1.T1` anchors policy to `design-tokens/dist/figma/tokens.json`, `S2.T1` and `S2.T2` prove the pilot pull flow against the generated artifact, and `S3.T2` defines how future governance treats that artifact in parity checks.
- **Dependency edges honored**:
  - `SEAM-3 blocks SEAM-5`: every slice assumes the generated export already exists and treats build output shape as an input, not something `SEAM-5` is allowed to redefine.
  - `SEAM-5 blocks SEAM-6`: `S1` publishes the default sync mode and pilot ledger, while `S3` makes the parity branch explicit enough that governance can later enforce it without inventing new policy.
- **Parallelization notes**:
  - What can proceed now: `S1` can start as soon as `CT-5` has a stable artifact path and `CT-2` has settled theme IDs; `S3a` can begin once `S1.T2` seeds the ledger schema, even while the pilot import work in `S2` is still underway.
  - What must wait: `S2` waits for the actual generated Figma export from `SEAM-3`; `S3b` waits for both the validator contract from `S3a` and the observed pilot state from `S2`; any change to export serialization or artifact paths stays in `SEAM-3`; all `package.json`, `justfile`, and CI enforcement work stays in `SEAM-6`, which is a downstream consumer rather than a prerequisite for `S3b`.

## V1 Figma Policy Decisions

- The default v1 proof transport is `plugin-import-manual`: a Figma plugin or importer materializes `design-tokens/dist/figma/tokens.json` into the pilot file, and no write-back workflow is configured.
- The lock is both technical and policy-enforced: the v1 setup omits write credentials/automation, and canonical value changes still require repo PRs.
- `parityMode` has two allowed values only, `deferred` and `required`.
- V1 starts at `parityMode=deferred`.
- The preferred long-term hardened transport is `rest-variables-oauth`: a repo-owned OAuth app writes the approved artifact through the Figma Variables API once access, scopes, and governance are in place.
- Tokens Studio is not part of the permanent seam contract and may be used only as a temporary pilot carrier if needed.
- Promotion to `parityMode=required` requires all of the following: a supported API-backed Variables rail is available, the pilot sync ledger is stable, and `SEAM-6` owns a deterministic parity check in a merge gate.
