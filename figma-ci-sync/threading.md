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
- Definition: the theme registry defines supported theme IDs and fallback behavior; v1 assumes `dark` is required and additional themes are additive.
- Versioning/compat: theme IDs become stable public names once referenced by runtime or Figma exports.

### `CT-3` — Component recipe manifest

- Type: schema
- Owner seam: `SEAM-2`
- Consumers (seams): `SEAM-3`, `SEAM-4`, `SEAM-6`
- Definition: recipe files live under `design-tokens/src/recipes/*.recipe.json` and define component ID, variant axes, states, slots, token references, and fallback rules.
- Versioning/compat: recipe shape is versioned independently from tokens; breaking changes require validator updates and pilot-component migration notes.

### `CT-4` — Token validation CLI

- Type: config
- Owner seam: `SEAM-3`
- Consumers (seams): `SEAM-6`
- Definition: `pnpm validate:tokens` validates DTCG structure, recipe shape, and token-reference integrity using repo scripts under `scripts/`.
- Versioning/compat: validators must fail closed on malformed input and remain deterministic in local and CI environments.

### `CT-5` — Token build CLI

- Type: config
- Owner seam: `SEAM-3`
- Consumers (seams): `SEAM-4`, `SEAM-5`, `SEAM-6`
- Definition: `pnpm build:tokens` runs Style Dictionary plus any recipe transforms and emits the runtime CSS artifact, typed token output, and the Figma-facing export.
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
- Definition: `design-tokens/dist/figma/tokens.json` is the Figma-facing export; v1 default policy is repo-authored, read-only Figma consumption through Tokens Studio URL or similarly locked sync.
- Versioning/compat: two-way sync is opt-in and requires an explicit policy override because it changes the system-of-record model.

### `CT-8` — Drift gate contract

- Type: permission
- Owner seam: `SEAM-6`
- Consumers (seams): all implementation seams
- Definition: local and CI gates run validation, token build, artifact freshness checks, Storybook checks, and optional Figma parity checks before merge or release.
- Versioning/compat: drift gates may tighten over time, but they cannot silently weaken without an explicit policy change in `justfile` and package scripts.

## Integration Points

- Repo-authored token JSON flows from `SEAM-1` into `SEAM-3`, which produces runtime CSS and Figma exports.
- Repo-authored recipe JSON flows from `SEAM-2` into `SEAM-3` for typed outputs and into `SEAM-4` for Storybook-visible component contracts.
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

- Decide the canonical source root before implementation starts: `design-tokens/` top-level is the default assumption, but it can be swapped if the repo later adopts workspaces.
- Decide the Figma sync posture before implementation starts: default to read-only consumer mode unless the team explicitly accepts the risk of bidirectional sync.
- Decide the v1 recipe pilot set before implementation starts: keep it small enough that recipe shape can be verified without inventing a full component library.
