# `SEAM-5B` — Figma Publish Rail Convergence

## Seam Brief (Restated)

- **Seam ID**: `SEAM-5B`
- **Name**: Figma Publish Rail Convergence
- **Goal / value**: define one live repo-to-Figma publish rail contract that preserves repo-owned canonical truth, proves the short-term materialization path, and gives downstream verification work enough exact publish semantics to consume without guessing.
- **Type**: integration
- **Slicing strategy**: contract-first, because `SEAM-5B` owns `CT-7B`, is blocked by inherited canonical/projection contracts, and blocks `SEAM-6B`.
- **Scope**
  - In: the approved Figma source artifact boundary; the `plugin-import-manual` proof rail; the `rest-variables-oauth` hardening target; Tokens Studio as optional temporary carrier only; publish-proof semantics that downstream verification will consume.
  - Out: canonical token or recipe authoring; changing projection ownership or artifact paths; implementing full CI enforcement; redefining the `CT-8B` ledger root contract; making Figma a write-back source of truth.
- **Touch surface**: planning/docs in this pack for decomposition; future implementation touch surface is expected to include `design-tokens/dist/figma/**`, `src/figma/**`, and proof-only plugin/importer or OAuth rail code once explicitly started.
- **Verification**: maintainers can identify exactly which artifact is allowed onto the rail, execute a proof materialization through `plugin-import-manual` without manual value transcription, and distinguish proof-only versus hardened publish evidence for the current artifact revision.
- **Threading constraints**
  - Upstream blockers: inherited `SEAM-1`, inherited `SEAM-3`
  - Downstream blocked seams: `SEAM-6B`
  - Contracts produced (owned): `CT-7B`
  - Contracts consumed: `CT-H1`, `CT-H2`

## Slice Index

- `S1` → `slice-1-publish-rail-contract-baseline.md`: freeze the approved artifact boundary, rail taxonomy, and seam-owned publish-proof semantics for `CT-7B`.
- `S2` → `slice-2-proof-rail-materialization.md`: prove the `plugin-import-manual` rail against a pilot Figma file without manual value entry.
- `S3` → `slice-3-hardened-rail-and-carrier-governance.md`: define the hardened OAuth target and temporary carrier exception path so `SEAM-6B` can consume them without inventing policy.

## Threading Alignment

- **Contracts produced (owned)**:
  - `CT-7B`: the live Figma publish rail contract centered on `design-tokens/dist/figma/tokens.json`, the allowed publish modes `plugin-import-manual`, `rest-variables-oauth`, and `tokens-studio-carried`, and the rule that Figma remains downstream-only. `S1` freezes the contract boundary and publish-proof vocabulary, `S2` proves the short-term rail against a current artifact revision, and `S3` defines the hardened-target and temporary-carrier governance needed for downstream promotion logic.
- **Contracts consumed**:
  - `CT-H1`: required from inherited `SEAM-1` and inherited `SEAM-2`; `S1.T1` anchors the rail policy to repo-owned canonical surfaces, and `S2.T2` uses that policy to reject any manual or Figma-originated value reinterpretation during proof execution.
  - `CT-H2`: required from inherited `SEAM-3`; `S1.T1` freezes `design-tokens/dist/figma/tokens.json` as the only approved publish source, `S2.T1` and `S2.T2` prove the rail against that artifact, and `S3.T1` keeps the hardened rail bound to the same artifact path rather than a new projection.
- **Dependency edges honored**:
  - inherited `SEAM-1` blocks `SEAM-5B`: every slice treats canonical ownership as settled input and forbids Figma write-back from mutating source meaning.
  - inherited `SEAM-3` blocks `SEAM-5B`: every slice consumes `design-tokens/dist/figma/tokens.json` as an input and avoids redefining projection paths or generation rules.
  - `SEAM-5B` blocks `SEAM-6B`: `S1` and `S3` publish the exact mode semantics, success markers, and carrier rules that `SEAM-6B` needs before it can own `CT-8B`.
- **Parallelization notes**:
  - What can proceed now: `S1` can start as soon as `CT-H1` and `CT-H2` remain stable; `S3.T2` can draft the Tokens Studio exception policy once `S1.T1` freezes the mode taxonomy.
  - What must wait: `S2` waits for a current `design-tokens/dist/figma/tokens.json` artifact and a pilot Figma file; `S3.T1` should not claim hardened readiness until the proof rail semantics from `S1` are frozen; any ledger-root schema work stays in `SEAM-6B`, even when `SEAM-5B` provides publish-proof inputs.
