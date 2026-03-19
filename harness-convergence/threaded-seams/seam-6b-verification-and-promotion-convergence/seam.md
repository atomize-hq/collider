### Seam Brief (Restated)

- **Seam ID**: `SEAM-6B`
- **Name**: Verification and Promotion Convergence
- **Goal / value**: define the machine-readable status model and promotion policy that let maintainers distinguish a declared Figma rail from one that is verified for the current artifact revision and safe to treat as promotable.
- **Type**: risk
- **Scope**
  - In: `CT-8B`; ledger semantics for declared/published/verified/promotable states; deferred versus required parity rules; publish-valid versus promotion-complete thresholds; explicit gate ownership for the Figma rail.
  - Out: implementing CI jobs; implementing `plugin-import-manual`; implementing `rest-variables-oauth`; reopening canonical source, build, runtime, or Storybook contracts except as inherited inputs.
- **Touch surface**: planning/docs in the convergence pack now; future implementation expected in `src/figma/sync-ledger.json`, ledger readers/validators, and local or CI gate definitions once implementation is explicitly started.
- **Verification**: a maintainer can determine the highest earned promotion level for the current `design-tokens/dist/figma/tokens.json` revision without reading prose, and the ledger makes deferred parity, required parity, and blocking exceptions explicit.
- **Threading constraints**
  - Upstream blockers: inherited `SEAM-4`; `SEAM-5B`
  - Downstream blocked seams: no additional seam in this pack, but all future work that wants to claim Figma publish validity or promotion readiness depends on this seam
  - Contracts produced (owned): `CT-8B`
  - Contracts consumed: `CT-H1`, `CT-H2`, `CT-7B`
- **Seam-local strategy**: contract-first, because `SEAM-6B` owns `CT-8B` and downstream work cannot safely implement gates until the ledger contract and promotion semantics are frozen.

### Slice index

- `S1` -> `slice-1-ct-8b-ledger-contract.md`: freeze the `CT-8B` ledger schema and earned-level semantics.
- `S2` -> `slice-2-verification-conformance-evaluation.md`: define how validators prove freshness, publish success, and exception handling for the current artifact revision.
- `S3` -> `slice-3-promotion-governance-adoption.md`: define how local, CI, and release governance consume ledger outcomes without re-opening `SEAM-5B`.

### Threading Alignment (mandatory)

- **Contracts produced (owned)**:
  - `CT-8B`: Figma verification and promotion status contract; lives in this seam pack as the planning truth and is intended to materialize at `src/figma/sync-ledger.json` plus ledger-reader validation docs; produced in `S1`, with conformance semantics completed in `S2` and governance adoption completed in `S3`.
- **Contracts consumed**:
  - `CT-H1`: canonical source boundary inherited from `SEAM-1` and `SEAM-2`; consumed in `S1.T2` so earned levels never imply that Figma can redefine canonical values.
  - `CT-H2`: derived projection set inherited from `SEAM-3`; consumed in `S1.T1` and `S2.T2` so the ledger points to `design-tokens/dist/figma/tokens.json` and freshness is revision-bound.
  - `CT-7B`: Figma publish rail contract owned by `SEAM-5B`; consumed in `S1.T2`, `S2.T2`, and `S3.T1` so `publish.mode`, proof/hardening expectations, and temporary-carrier rules are not redefined here.
- **Dependency edges honored**:
  - inherited `SEAM-4` blocks `SEAM-6B`: `S1` and `S2` treat `C-consumption-valid` as an inherited input rather than re-specifying runtime or Storybook proof logic.
  - `SEAM-5B` blocks `SEAM-6B`: every slice treats the rail contract and success markers as inputs; no task implements or renames publish modes.
- **Parallelization notes**:
  - What can proceed now: `S1` can be planned immediately, because it freezes `CT-8B` without changing upstream ownership; historical `SEAM-4` evidence can be referenced in parallel.
  - What must wait: `S2` cannot be finalized unless `CT-7B` proof and hardening markers stay stable; `S3` should wait on `S1` and `S2` so governance rules consume a frozen ledger contract rather than draft status fields.
