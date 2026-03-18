# Scope Brief

- Goal (1 sentence): Establish a repo-owned design-token and component-recipe system that generates the runtime artifacts consumed by Collider, Storybook, and Figma, with CI drift detection enforcing the contract.
- Why now: the repo currently has a hand-authored token surface at `src/lib/tokens/tokens.css`, while the source outline calls for canonical JSON, generated artifacts, Figma sync, and pre-build validation instead of manual drift.
- Primary user(s) + JTBD: design-system maintainers need one editable source of truth; frontend engineers need stable generated outputs for Next.js and Storybook; designers need Figma variables and styles that reflect repo-approved tokens.
- In-scope: canonical DTCG token sources; theme structure; component recipe manifest; token and recipe validation; build transforms and generated artifacts; Next.js and Storybook consumption; Figma sync rails via Tokens Studio; local and CI drift checks; migration off hand-edited runtime token CSS.
- Out-of-scope: a full component-library rollout; a monorepo/workspace conversion; two-way Figma authoring as the normal workflow; enterprise-only Figma Variables API automation unless it becomes a hard requirement; broad visual redesign work unrelated to the token system.
- Success criteria: one canonical repo source for token values and component recipes; `src/lib/tokens/tokens.css` becomes generated or generated-from-source; Storybook and app runtime consume the same outputs; Figma can pull the canonical export without manual value copying; `just preflight` or equivalent CI gates fail on drift.
- Constraints: the repo is currently single-package; `just preflight`, `just check`, and LOC limits are hard gates; the current app surface is dark-themed; Storybook is already part of the contract layer; Figma access may be limited to plugin-based sync rather than enterprise REST write access.
- External systems / dependencies: Figma, Tokens Studio, Style Dictionary, `@tokens-studio/sd-transforms`, Storybook, CI, optional Chromatic, optional Figma Variables REST API.
- Known unknowns / risks: final source-directory layout; strict read-only versus Git-mediated Figma sync; which components should be the initial recipe pilots; whether generated artifacts are committed or regenerated on every build; the availability of enterprise Figma API access.
- Assumptions: canonical editing happens in the repo; v1 can start with the current dark theme and add more themes later; the existing `scripts/validate-component-loop.mjs` and `scripts/validate-sync-ledger.mjs` patterns can be extended rather than replaced; the runtime import path should change as little as possible during initial cutover.

## Capability Inventory

- DTCG token taxonomy for core, semantic, motion, and theme values.
- Component recipe schema for variant, state, and slot-level token references.
- Deterministic build pipeline that turns source JSON into runtime, typed, and Figma-facing outputs.
- Next.js runtime consumption from generated CSS instead of hand-maintained variables.
- Storybook consumption and token visibility so design contracts are inspectable alongside components.
- Figma sync policy, transport, and export shape for designers.
- Validation and drift-detection scripts for tokens, recipes, and generated artifacts.
- Preflight and CI wiring so token drift fails before app or Storybook builds.

## Open Questions

- Should v1 enforce read-only Figma consumption by default, or is Git-based bidirectional Tokens Studio sync acceptable if guarded by team policy?
- Which component set is the correct v1 pilot for the recipe manifest in this repo: token-only, a minimal set of primitives, or a specific user-facing component?
- Is enterprise Figma Variables REST parity checking required for launch, or can it remain a deferred hardening step behind the plugin-based flow?
