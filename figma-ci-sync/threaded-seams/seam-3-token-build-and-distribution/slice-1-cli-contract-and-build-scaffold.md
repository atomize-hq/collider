### S1 — CLI contract and build scaffold

- **User/system value**: gives the repo stable, seam-owned token commands and path contracts so downstream seams can depend on deterministic entrypoints instead of ad hoc scripts.
- **Scope (in/out)**:
  - In: build-path constants; `design-tokens/build/validate-tokens.mjs`; `design-tokens/build/build-tokens.mjs`; additive `package.json` commands; seam-local helper modules under `scripts/` if needed.
  - Out: runtime adoption changes in `src/app/globals.css` or `.storybook/**`; Figma sync policy; `justfile` and CI wiring.
- **Acceptance criteria**:
  - `pnpm validate:tokens` and `pnpm build:tokens` exist and resolve from repo root.
  - Both CLIs share one authoritative path module for source roots and artifact destinations.
  - Validation fails closed on malformed DTCG JSON, unknown theme IDs, malformed recipe shape, and broken token references.
  - The command contract fixes exit-code semantics, stdout/stderr ownership, and machine-readable `--json` output before downstream seams script against it.
- **Dependencies**: `SEAM-1/CT-1`, `SEAM-1/CT-2`, `SEAM-2/CT-3`
- **Verification**: run `pnpm validate:tokens` on valid input and at least one invalid fixture; run the build CLI smoke path to confirm it resolves the expected roots and output targets.
- **Rollout/safety**: additive only; no consumer imports or merge gates change in this slice.

#### CLI I/O contract

- `pnpm validate:tokens [--json]`
  - Exit `0`: all source contracts are valid.
  - Exit `1`: contract/input violation such as malformed JSON, unknown theme ID, invalid recipe shape, or broken token reference.
  - Exit `3`: unexpected tool/runtime failure.
- `pnpm build:tokens [--json]`
  - Exit `0`: artifacts were generated successfully.
  - Exit `1`: upstream source validation failed and build stopped before writing artifacts.
  - Exit `2`: the artifact path/write contract could not be satisfied, such as a missing destination path, unwritable target, or manifest mismatch in the build's own output stage.
  - Exit `3`: unexpected transform/runtime failure.
- Stdout is reserved for concise success summaries or a single machine-readable JSON object when `--json` is supplied.
- Stderr is reserved for human-readable diagnostics and unexpected failure output.
- JSON mode emits exactly one UTF-8 JSON object to stdout with the stable top-level keys `ok`, `command`, `artifacts`, and `diagnostics`.
- Top-level schema:
  - `ok`: boolean. `true` only for exit `0`; `false` for exits `1`, `2`, or `3`.
  - `command`: string literal `validate:tokens` or `build:tokens`.
  - `artifacts`: array, never `null`. `validate:tokens` always returns `[]`. `build:tokens` returns one entry per committed output on success and `[]` on any failure so downstream code never has to reason about partial writes.
  - `diagnostics`: array, never `null`. Success returns `[]`. Failure returns one or more diagnostic objects sorted in the same deterministic order as the human-readable stderr output.
- `artifacts[]` entry schema for `build:tokens` success:
  - `id`: `runtime-css`, `typed-tokens`, or `figma-tokens`.
  - `path`: repo-relative output path.
  - `kind`: `css`, `typescript`, or `json`.
  - `status`: `written` or `unchanged`.
- `diagnostics[]` entry schema for failures:
  - `severity`: `error` or `fatal`.
  - `code`: stable machine-readable identifier such as `INVALID_THEME_ID` or `ARTIFACT_PATH_UNWRITABLE`.
  - `message`: non-empty human-readable summary.
  - `path`: optional repo-relative file path associated with the problem.
  - `rule`: optional contract identifier such as `CT-2` or `CT-3`.
  - `line`: optional 1-based line number when the failure points at a source file location.
  - `column`: optional 1-based column number; only present when `line` is present.
- Canonical success example for `pnpm build:tokens --json`:

```json
{
  "ok": true,
  "command": "build:tokens",
  "artifacts": [
    {
      "id": "runtime-css",
      "path": "src/lib/tokens/tokens.css",
      "kind": "css",
      "status": "written"
    },
    {
      "id": "typed-tokens",
      "path": "design-tokens/dist/tokens.ts",
      "kind": "typescript",
      "status": "written"
    },
    {
      "id": "figma-tokens",
      "path": "design-tokens/dist/figma/tokens.json",
      "kind": "json",
      "status": "written"
    }
  ],
  "diagnostics": []
}
```

- Canonical failure example for `pnpm validate:tokens --json`:

```json
{
  "ok": false,
  "command": "validate:tokens",
  "artifacts": [],
  "diagnostics": [
    {
      "severity": "error",
      "code": "INVALID_THEME_ID",
      "message": "Theme registry references an unknown extends target `night`.",
      "path": "design-tokens/src/tokens/themes/registry.json",
      "rule": "CT-2",
      "line": 14,
      "column": 11
    }
  ]
}
```

#### S1.T1 — Define the build path and artifact manifest

- **Outcome**: one seam-owned module defines canonical input roots and stable output locations for all `SEAM-3` artifacts.
- **Inputs/outputs**:
  - Inputs: `design-tokens/src/tokens/**/*.tokens.json`, `design-tokens/src/recipes/*.recipe.json`
  - Outputs: shared constants for `design-tokens/dist/tokens.ts`, `design-tokens/dist/figma/tokens.json`, any staging CSS output, and `src/lib/tokens/tokens.css`
- **Implementation notes**: centralize path resolution in `design-tokens/build/paths.mjs` so future workspace/package moves only update one file; include a generated-file banner constant for artifacts that should never be hand-edited.
- **Acceptance criteria**: both CLIs import the same path module; there are no duplicated hard-coded artifact paths across build helpers.
- **Test notes**: smoke-test the path helper from repo root and from inside `design-tokens/build/` so relative-path assumptions cannot drift.
- **Risk/rollback notes**: if repo topology changes later, the command names stay stable and only the shared path module changes.

Checklist:

- Implement: add `design-tokens/build/paths.mjs` with source and artifact constants.
- Test: run a node smoke script or unit test that prints/resolves every expected path.
- Validate: confirm `package.json` scripts and build helpers import the shared constants instead of duplicating paths.
- Cleanup: remove any temporary hard-coded output paths introduced while bootstrapping.

#### S1.T2 — Implement the fail-closed token validation CLI

- **Outcome**: `CT-4` exists as a deterministic validator for tokens, themes, recipes, and cross-file references.
- **Inputs/outputs**:
  - Inputs: canonical token JSON from `CT-1`, theme registry from `CT-2`, recipe manifests from `CT-3`
  - Outputs: `design-tokens/build/validate-tokens.mjs` and any helper validation modules under `scripts/`
- **Implementation notes**: reuse existing repo script patterns for deterministic diagnostics; validate JSON shape first, then theme IDs, then recipe references so failures are ordered and actionable.
- **Acceptance criteria**: the CLI exits `1` on malformed JSON, unknown themes, missing token IDs, and recipe references to undefined tokens; output order is deterministic; stdout/stderr behavior matches the contract above.
- **Test notes**: cover at least one good fixture and one bad fixture per failure class; verify repeated runs print the same diagnostics.
- **Risk/rollback notes**: keep validators repo-local and deterministic so `SEAM-6` can later wire them into CI without special environment assumptions.

Checklist:

- Implement: add the validator entrypoint and helpers for DTCG shape, theme contract, and recipe-reference integrity.
- Test: execute the validator against positive and negative fixtures.
- Validate: confirm the CLI fails closed and returns the same error ordering on repeated runs.
- Cleanup: remove any permissive fallback logic that would silently accept malformed inputs.

#### S1.T3 — Expose seam-owned commands without taking on CI ownership

- **Outcome**: humans and downstream seams can call the `SEAM-3` commands locally, while `SEAM-6` remains the owner of merge-gate wiring.
- **Inputs/outputs**:
  - Inputs: `design-tokens/build/validate-tokens.mjs`, `design-tokens/build/build-tokens.mjs`
  - Outputs: additive `package.json` script entries for `validate:tokens` and `build:tokens`
- **Implementation notes**: keep script names stable and repo-root runnable; do not add `justfile` recipes or CI steps here.
- **Acceptance criteria**: `pnpm validate:tokens` and `pnpm build:tokens` resolve cleanly from repo root; they preserve the exit-code and output contract defined above; no `justfile`/CI files are modified in this slice.
- **Test notes**: run both commands from repo root and from a clean shell session to prove no implicit cwd assumptions.
- **Risk/rollback notes**: keeping gate wiring out of this slice prevents ownership overlap with `SEAM-6`.

Checklist:

- Implement: add additive scripts in `package.json`.
- Test: run both commands directly through `pnpm`.
- Validate: confirm no `justfile` or CI config changes are bundled into this PR.
- Cleanup: remove temporary bootstrap aliases once the final script names are in place.
