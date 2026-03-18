# Threading

## Contract Registry

### `CT-1` — DTCG token source tree

- Type: schema
- Owner seam: `SEAM-1`
- Consumers (seams): `SEAM-2`, `SEAM-3`, `SEAM-5`
- Definition: canonical scalar tokens live under `design-tokens/src/tokens/**/*.tokens.json` in DTCG-compatible JSON, split by concerns such as `core`, `semantic`, `motion`, and `themes/<theme>.tokens.json`.
- Versioning/compat: additive token introduction is non-breaking; token rename or removal requires a migration mapping and regenerated consumer artifacts.

### `CT-2` — Theme contract

- Type: config
- Owner seam: `SEAM-1`
- Consumers (seams): `SEAM-3`, `SEAM-4`, `SEAM-5`
- Definition: `design-tokens/src/tokens/themes/registry.json` is the only theme registry; it declares supported theme IDs, `dark` as the required default theme, omitted-theme fallback to `dark`, and additive-theme fallback chains of `requested theme -> declared extends chain -> dark`. An explicitly unknown theme ID is a contract error and must not silently remap to another additive theme.
- Versioning/compat: theme IDs become stable public names once referenced by runtime or Figma exports.

### `CT-3` — Component recipe manifest

- Type: schema
- Owner seam: `SEAM-2`
- Consumers (seams): `SEAM-3`, `SEAM-4`, `SEAM-6`
- Definition: recipe files live under `design-tokens/src/recipes/*.recipe.json` and define `recipeVersion`, `componentId`, `variantAxes`, `defaults`, `slots`, `states`, and `fallbacks`. `SEAM-2` owns only the source recipe contract plus validation rules; any later generated helper derived from recipes is a `CT-5` build artifact owned by `SEAM-3`, not a second seam-owned output here.
- Versioning/compat: recipe shape is versioned independently from tokens; breaking changes require validator updates and pilot-component migration notes.

### `CT-4` — Token validation CLI

- Type: config
- Owner seam: `SEAM-3`
- Consumers (seams): `SEAM-6`
- Definition: `pnpm validate:tokens` validates DTCG structure, theme registry semantics, recipe shape, and token-reference integrity using repo scripts under `scripts/`. It exits `0` on success, `1` on contract/input violations, and `3` on unexpected tool/runtime failure. By default it writes concise success output to stdout, failures to stderr, and when invoked with `--json` it emits exactly one JSON object to stdout shaped as `{ ok: boolean, command: "validate:tokens", artifacts: [], diagnostics: Diagnostic[] }`, where every `Diagnostic` has required `severity`, `code`, and `message` fields plus optional `path`, `rule`, `line`, and `column`.
- Versioning/compat: validators must fail closed on malformed input and remain deterministic in local and CI environments.

### `CT-5` — Token build CLI

- Type: config
- Owner seam: `SEAM-3`
- Consumers (seams): `SEAM-4`, `SEAM-5`, `SEAM-6`
- Definition: `pnpm build:tokens` runs Style Dictionary plus any recipe transforms and emits the committed runtime CSS artifact at `src/lib/tokens/tokens.css`, the committed typed token output at `design-tokens/dist/tokens.ts`, and the committed Figma-facing export at `design-tokens/dist/figma/tokens.json`. `design-tokens/src/**` remains the only editable source; `dist/**` and `src/lib/tokens/tokens.css` are derived outputs regenerated in place. The command exits `0` on success, `1` when upstream source validation fails, `2` when an artifact path or write contract cannot be satisfied, and `3` on transform/runtime failure; stdout is reserved for concise success summaries or `--json` output, stderr for failures. In `--json` mode it emits exactly one object shaped as `{ ok: boolean, command: "build:tokens", artifacts: BuildArtifact[], diagnostics: Diagnostic[] }`, where `artifacts` is `[]` on any failure and on success contains exactly three entries with IDs `runtime-css`, `typed-tokens`, and `figma-tokens`, each carrying `path`, `kind`, and `status`.
- Versioning/compat: the command must be deterministic; output paths stay stable once consumers import them.

### `CT-6` — Runtime CSS artifact

- Type: UX affordance
- Owner seam: `SEAM-3`
- Consumers (seams): `SEAM-4`
- Definition: `src/lib/tokens/tokens.css` becomes the generated CSS-variable contract consumed by `src/app/globals.css` and Storybook preview/config.
- Versioning/compat: legacy variable names needed by the app stay available until the cutover plan retires them.

### `CT-7` — Figma export artifact and sync mode

- Type: config
- Owner seam: `SEAM-5`
- Consumers (seams): design maintainers, `SEAM-6`
- Definition: `design-tokens/dist/figma/tokens.json` is the Figma-facing export; v1 uses exactly one transport, `pull-url-readonly`, meaning Tokens Studio pulls the repo-hosted artifact by URL and no Figma write-back path is configured. The lock is both technical (no write credentials or automation in v1) and policy-enforced (repo PRs remain the only path to change canonical values). The seam-owned pilot ledger at `src/figma/sync-ledger.json` has fixed root keys `ledgerVersion`, `scope`, `name`, `links`, `status`, and `drift`; `ledgerVersion="1"`, `scope="figma-pilot"`, `status.syncMode="pull-url-readonly"`, `status.artifactPath="design-tokens/dist/figma/tokens.json"`, `status.artifactGitSha` stores the reviewed commit SHA for the pull, `status.themeIds` and `status.themeMapping` record imported themes, and `status.parityMode` has two allowed values only, `deferred` and `required`. When `parityMode=deferred`, `status.parityDeferredReason` is required; when `parityMode=required`, that field is forbidden. `drift` is always an array of explicit exception objects; the happy path uses `[]`.
- Versioning/compat: two-way sync is opt-in and requires an explicit policy override because it changes the system-of-record model.

### `CT-8` — Drift gate contract

- Type: permission
- Owner seam: `SEAM-6`
- Consumers (seams): all implementation seams
- Definition: local and CI gates run `pnpm validate:tokens`, `pnpm build:tokens`, artifact freshness checks against the committed generated outputs, `pnpm test:storybook`, and policy-gated Figma parity checks before merge or release. While `parityMode=deferred`, the gate reports the deferral explicitly and does not fail on Figma parity; once `parityMode=required`, parity failures become blocking.
- Versioning/compat: drift gates may tighten over time, but they cannot silently weaken without an explicit policy change in `justfile` and package scripts.

## Integration Points

- Repo-authored token JSON flows from `SEAM-1` into `SEAM-3`, which produces runtime CSS and Figma exports.
- Repo-authored recipe JSON flows from `SEAM-2` into `SEAM-3` for validation/build transforms and into `SEAM-4` for Storybook-visible component contracts.
- `SEAM-4` consumes the runtime CSS artifact through `src/app/globals.css` and Storybook configuration so app and Storybook render against the same values.
- `SEAM-5` consumes the Figma export artifact and sync policy so designers pull approved values without becoming the canonical authoring surface.
- `SEAM-6` wires the validators and freshness checks into `package.json`, `justfile`, CI, and any sync-ledger enforcement scripts.

## Dependency Graph

- `SEAM-1 blocks SEAM-2` because recipe manifests need stable token IDs and semantic naming before they can safely reference values.
- `SEAM-1 blocks SEAM-3` because the build cannot transform undefined token sources.
- `SEAM-2 blocks SEAM-3` because recipe outputs and reference validation depend on a settled manifest shape.
- `SEAM-3 blocks SEAM-4` because the app and Storybook must import generated artifacts, not provisional source JSON.
- `SEAM-3 blocks SEAM-5` because Figma needs a stable export artifact before sync policy can be validated.
- `SEAM-4 blocks SEAM-6` because runtime consumption must exist before CI can guard it end to end.
- `SEAM-5 blocks SEAM-6` because the final drift gate has to know whether Figma parity is required or intentionally deferred.

## Critical Path

`SEAM-1 → SEAM-2 → SEAM-3 → SEAM-4 → SEAM-6`

Why this is the critical path:

- The plan explicitly separates scalar tokens from component recipes, so both source contracts must exist before build automation is stable.
- Once build automation exists, app and Storybook consumption become the first end-to-end proof that generated artifacts are real and not just documented.
- Governance and cutover should land only after the runtime path works, otherwise CI will enforce an incomplete system.

`SEAM-5` is near-critical but can run in parallel after `SEAM-3` if Figma parity is not a launch blocker.

## Conflict-Safe Workstreams

- `WS-A (Canonical Definitions)`: `SEAM-1` and the schema half of `SEAM-2`; touch surface is `design-tokens/src/tokens/**`, `design-tokens/src/recipes/**`, and validator contracts under `scripts/`.
- `WS-B (Build + Runtime Integration)`: `SEAM-3` and `SEAM-4`; touch surface is `design-tokens/build/**`, generated outputs, `src/lib/tokens/tokens.css`, `src/app/globals.css`, `.storybook/preview.ts`, and Storybook config.
- `WS-C (Figma Rails)`: `SEAM-5`; touch surface is Figma export generation, sync-policy docs, and any sync-ledger artifacts or validators.
- `WS-INT (Integration)`: the merge point for `SEAM-6`; touch surface is `package.json`, `justfile`, CI config, and end-to-end validation.

## Thin Contract-Definition Items

- Canonical source root for v1 is top-level `design-tokens/`; command names stay stable even if repo topology changes later.
- Generated artifacts under `design-tokens/dist/**` and `src/lib/tokens/tokens.css` are committed, derived outputs regenerated from `design-tokens/src/**`.
- Figma sync posture for v1 is `pull-url-readonly`, with `parityMode` fixed to `deferred` until enterprise parity automation is real and explicitly adopted.
- The v1 recipe pilot set is `button` only.
