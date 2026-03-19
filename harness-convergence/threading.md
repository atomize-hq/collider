# Threading

## Contract Registry

### `CT-H1` — Canonical source boundary

- Type: policy
- Owner seam: inherited `SEAM-1` and inherited `SEAM-2`
- Consumers (seams): `SEAM-5B`, `SEAM-6B`
- Definition: design-system meaning may be edited only in `design-tokens/src/tokens/**/*.tokens.json`, `design-tokens/src/tokens/themes/registry.json`, and `design-tokens/src/recipes/*.recipe.json`. Figma, Storybook, generated CSS, typed artifacts, and sync ledgers are downstream-only surfaces.
- Versioning/compat: any request that changes design-system meaning without identifying one of these canonical files is not ready for implementation.

### `CT-H2` — Derived projection set

- Type: build artifact set
- Owner seam: inherited `SEAM-3`
- Consumers (seams): inherited `SEAM-4`, `SEAM-5B`, `SEAM-6B`
- Definition: the required derived projections are `src/lib/tokens/tokens.css`, `design-tokens/dist/tokens.ts`, and `design-tokens/dist/figma/tokens.json`. Storybook proof surfaces and docs consume those outputs; they do not replace them as canonical or projection surfaces.
- Versioning/compat: projection paths stay stable once a downstream rail depends on them; changes require an explicit migration note and downstream consumer update.

### `CT-7B` — Figma publish rail contract

- Type: publish rail
- Owner seam: `SEAM-5B`
- Consumers (seams): designers, `SEAM-6B`
- Definition: `design-tokens/dist/figma/tokens.json` is the only approved source artifact for the repo-to-Figma rail in this convergence pack. The allowed publish modes are exactly:
  - `plugin-import-manual`: the short-term proof rail; a plugin or importer materializes repo-approved variables from the generated artifact into a Figma file
  - `rest-variables-oauth`: the long-term hardened rail; a repo-owned OAuth app writes the same approved artifact into Figma through the Variables REST API
  - `tokens-studio-carried`: an optional temporary carrier mode only; if used, it must still carry the repo-approved artifact and must not become a required permanent rail
- Additional rules:
  - no Figma write-back may redefine canonical repo values
  - `plugin-import-manual` is the default proof target for initial convergence
  - `rest-variables-oauth` is the only approved hardening target for eventual required parity
  - `tokens-studio-carried` is forbidden as a terminal state for this seam
- Versioning/compat: replacing the source artifact path or adding a bidirectional sync model requires a new explicit planning decision because it changes the harness contract.

### `CT-8B` — Figma verification and promotion status contract

- Type: gate/status
- Owner seam: `SEAM-6B`
- Consumers (seams): all future implementation work that claims Figma publish validity or promotion readiness
- Definition: the machine-readable proof surface for Figma convergence is `src/figma/sync-ledger.json`. When implemented, it must contain exactly these root keys:
  - `ledgerVersion`
  - `artifact`
  - `publish`
  - `verification`
  - `promotion`
  - `exceptions`
- Required field rules:
  - `ledgerVersion` must be `"2"`
  - `artifact.path` must be `"design-tokens/dist/figma/tokens.json"`
  - `publish.mode` must be one of `plugin-import-manual`, `rest-variables-oauth`, or `tokens-studio-carried`
  - `publish.tokensStudioCarrier` must be `true` only when `publish.mode="tokens-studio-carried"`
  - `verification.materializationStatus` must be one of `not-run`, `passed`, or `failed`
  - `verification.lastVerifiedRevision` must record the git revision of the artifact used for the verification attempt
  - `promotion.parityMode` must be either `deferred` or `required`
  - `promotion.parityDeferredReason` is required when `promotion.parityMode="deferred"` and forbidden when `promotion.parityMode="required"`
  - `promotion.highestEarnedLevel` must be one of `A-source-valid`, `B-projection-valid`, `C-consumption-valid`, `D-publish-valid`, or `E-promotion-complete`
  - `exceptions` must be an array; the happy path uses `[]`
- Versioning/compat: absence of the ledger or missing required fields means the Figma rail may be declared, but it is not verified or promotable.

## Canonical Source

- Canonical source is inherited from historical `SEAM-1` and `SEAM-2`.
- This pack does not reopen token IDs, theme registry ownership, or recipe ownership.
- Any future convergence work that appears to require changing canonical source boundaries should create a separate pack instead of mutating this one.

## Derived Projections

- Runtime projection: `src/lib/tokens/tokens.css`
- Typed projection: `design-tokens/dist/tokens.ts`
- Figma-facing projection: `design-tokens/dist/figma/tokens.json`
- Storybook proof projections: generated token docs, recipe docs, story inventory, and component spec metadata as described by the target-state harness

Inherited rule: all projections must derive from the same canonical revision. No projection surface may be hand-maintained as a parallel truth source.

## Publish Rails

### Inherited publish rails

- Runtime rail: app runtime consumes generated CSS through `src/app/globals.css`
- Storybook rail: Storybook consumes generated CSS and generated token/recipe artifacts

### Active convergence publish rail

- Figma rail: owned by `SEAM-5B`
- Proof target: `plugin-import-manual`
- Hardened target: `rest-variables-oauth`
- Temporary carrier allowance: `tokens-studio-carried`
- Permanent rule: Tokens Studio is optional and replaceable; it is never a required permanent harness dependency

## Verification Rails

- Source validation: inherited from historical validation/build seams
- Artifact validation: inherited deterministic build and freshness checks
- Runtime verification: inherited app consumption proof
- Storybook verification: inherited Storybook proof surface and `pnpm test:storybook`
- Figma verification: `CT-8B` ledger plus a successful materialization attempt for the current generated artifact

Required Figma verification outcomes:

- proof rail verified: artifact materializes via `plugin-import-manual` without manual value entry
- hardened rail verified: artifact materializes via `rest-variables-oauth` using owned credentials and deterministic transport
- temporary carrier usage recorded: if Tokens Studio is used at all, the ledger must record that it is temporary and carrier-only

## Promotion Gates

Promotion levels follow the governing target-state harness:

- `A-source-valid`: canonical source is valid
- `B-projection-valid`: required artifacts rebuild and freshness checks pass
- `C-consumption-valid`: runtime and Storybook consume current projections
- `D-publish-valid`: the active Figma publish rail is verified for the current artifact revision
- `E-promotion-complete`: required rails and gates are current, verified, and non-deferred

Figma-specific rules:

- `plugin-import-manual` may earn `D-publish-valid` while `promotion.parityMode="deferred"`
- `rest-variables-oauth` is the expected rail before `promotion.parityMode` can safely move to `required`
- `tokens-studio-carried` can support proof work, but it cannot by itself justify permanent `required` parity
- if `promotion.parityMode="deferred"`, `E-promotion-complete` is not allowed for claims that depend on required Figma parity

## Integration Points

- inherited canonical source flows through inherited build outputs into the Figma artifact
- `SEAM-5B` defines how that artifact is published into Figma without changing source-of-truth ownership
- `SEAM-6B` defines how machine-readable verification distinguishes declared, published, verified, and promotable states
- historical seam-6 material remains evidence, but live promotion claims must trace through `CT-7B` and `CT-8B`

## Dependency Graph

- inherited `SEAM-1` blocks `SEAM-5B` because stable token and theme ownership are prerequisites for any Figma rail
- inherited `SEAM-3` blocks `SEAM-5B` because the Figma rail depends on `design-tokens/dist/figma/tokens.json`
- inherited `SEAM-4` blocks `SEAM-6B` because consumption validity must exist before promotion claims can be elevated
- `SEAM-5B` blocks `SEAM-6B` because verification and promotion cannot be grounded on the historical seam-5 assumptions

## Critical Path

inherited `SEAM-3` -> `SEAM-5B` -> `SEAM-6B`

Why this is the critical path:

- the convergence delta starts only after the Figma-facing artifact exists
- the new live work is first to define the publish rail, then to define how that rail becomes verified and promotable
- historical seams 1 through 4 are treated as inputs, so the remaining blocker chain is strictly about the Figma rail and the gates that consume it

## Conflict-Safe Workstreams

- `WS-HIST`: reference-only workstream; reads historical pack outputs and keeps old seams 1 through 4 treated as evidence instead of reopening them
- `WS-5B`: owns publish-mode, transport, credential-model, and temporary-carrier rules for the new Figma rail
- `WS-6B`: owns ledger shape, verification semantics, and promotion policy that consumes `SEAM-5B`

## Thin Contract-Definition Items

- the new live Figma contract is `CT-7B`, not historical `CT-7`
- `plugin-import-manual` is the required short-term proof target
- `rest-variables-oauth` is the required long-term hardening target
- Tokens Studio is allowed only as a temporary carrier and must be recorded as such
- any future pack that reopens canonical source or projection paths must explicitly say so rather than mutating this pack implicitly
