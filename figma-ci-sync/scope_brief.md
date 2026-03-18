# Scope Brief

- Goal (1 sentence): Establish a repo-owned design-token and component-recipe system that generates the runtime artifacts consumed by Collider, Storybook, and Figma, with CI drift detection enforcing the contract.
- Why now: the repo currently has a hand-authored token surface at `src/lib/tokens/tokens.css`, while the source outline calls for canonical JSON, generated artifacts, Figma sync, and pre-build validation instead of manual drift.
- Primary user(s) + JTBD: design-system maintainers need one editable source of truth; frontend engineers need stable generated outputs for Next.js and Storybook; designers need Figma variables and styles that reflect repo-approved tokens.
- In-scope: canonical DTCG token sources; theme structure; component recipe manifest; token and recipe validation; build transforms and generated artifacts; Next.js and Storybook consumption; Figma sync rails via Tokens Studio; local and CI drift checks; migration off hand-edited runtime token CSS.
- Out-of-scope: a full component-library rollout; a monorepo/workspace conversion; two-way Figma authoring as the normal workflow; enterprise-only Figma Variables API automation unless it becomes a hard requirement; broad visual redesign work unrelated to the token system.
- Success criteria: one canonical repo source for token values and component recipes; `src/lib/tokens/tokens.css` becomes generated or generated-from-source; Storybook and app runtime consume the same outputs; Figma can pull the canonical export without manual value copying; `just preflight` or equivalent CI gates fail on drift.
- Constraints: the repo is currently single-package; `just preflight`, `just check`, and LOC limits are hard gates; the current app surface is dark-themed; Storybook is already part of the contract layer; Figma access may be limited to plugin-based sync rather than enterprise REST write access.
- External systems / dependencies: Figma, Tokens Studio, Style Dictionary, `@tokens-studio/sd-transforms`, Storybook, CI, optional Chromatic, optional Figma Variables REST API.
- Known unknowns / risks: final source-directory layout if the repo later adopts workspaces; when additive themes beyond `dark` are worth standardizing; the availability of enterprise Figma API access if parity promotion is revisited after v1.
- Assumptions: canonical editing happens in the repo; v1 can start with the current dark theme and add more themes later; the existing `scripts/validate-component-loop.mjs` and `scripts/validate-sync-ledger.mjs` patterns can be extended rather than replaced; during the initial runtime cutover, `src/app/globals.css` remains the sole stable runtime import surface and continues importing `../lib/tokens/tokens.css`; downstream seams may replace the file contents behind that path but must not introduce a second runtime import route.

## Decision Snapshot

- Canonical source of truth is `design-tokens/src/**`; generated outputs under `design-tokens/dist/**` and `src/lib/tokens/tokens.css` are derived artifacts, committed to git, and refreshed by `pnpm build:tokens` as defined in `threading.md` (`CT-5`, `CT-6`) and `seam-3-token-build-and-distribution.md`.
- During the initial runtime cutover, `src/app/globals.css` remains the sole stable runtime import surface and continues importing `../lib/tokens/tokens.css`; downstream seams may replace the file contents behind that path but must not introduce a second runtime import route.
- Local workflow runs `pnpm validate:tokens` before `pnpm build:tokens`; governance and CI rerun both and fail if committed generated artifacts are missing, stale, or hand-edited.
- V1 Figma sync uses a single pull-only Tokens Studio URL flow against `design-tokens/dist/figma/tokens.json`; Figma does not push values back to the repo in v1. This matches `threading.md` (`CT-7`) and `threaded-seams/seam-5-figma-sync-rail/slice-1-sync-contract-and-policy-baseline.md`.
- V1 parity policy has two allowed states only: `deferred` and `required`. It starts at `deferred` and can move to `required` only after enterprise Figma API access exists, the pilot sync ledger is stable, and `SEAM-6` owns a deterministic parity gate. See `threaded-seams/seam-5-figma-sync-rail/seam.md`.
- The v1 recipe pilot is `button` only, with `intent` and `size` axes, `root` / `label` / `icon` slots, and `rest` / `hover` / `focus` / `disabled` states, per `threaded-seams/seam-2-component-recipe-manifest/slice-1-manifest-contract-and-pilot-boundary.md`.
- Theme fallback is explicit: omitted theme selection resolves to `dark`, while an explicitly unknown theme ID is a contract error rather than a silent fallback. See `threading.md` (`CT-2`) and `threaded-seams/seam-1-canonical-token-source/slice-1-contract-publication/subslice-3-theme-registry-contract.md`.

## Capability Inventory

- DTCG token taxonomy for core, semantic, motion, and theme values.
- Component recipe schema for variant, state, and slot-level token references.
- Deterministic build pipeline that turns source JSON into runtime, typed, and Figma-facing outputs.
- Next.js runtime consumption from generated CSS instead of hand-maintained variables.
- Storybook consumption and token visibility so design contracts are inspectable alongside components.
- Figma sync policy, transport, and export shape for designers.
- Validation and drift-detection scripts for tokens, recipes, and generated artifacts.
- Preflight and CI wiring so token drift fails before app or Storybook builds.

## Deferred Questions

- Does `design-tokens/` stay top-level permanently, or does it move behind a workspace/package boundary later while keeping the same command names?
- Which additive theme, if any, should follow `dark` once the v1 cutover is stable?
- When enterprise Figma API access becomes available, is the team ready to promote parity from `deferred` to `required` without reopening the source-of-truth model?
