# Target-State Harness

This document defines the desired end-state harness for Collider's design-token, Storybook, Figma, and CI workflow.

It is a planning artifact for convergence:

- the skill pack already assumes a tightly structured design-to-code loop,
- the repo currently implements only part of that loop,
- this file defines the full contract stack the repo should grow into.

This file is not a replacement for the existing seam docs.
It is the higher-level model that explains how those seams should eventually compose into one deterministic system for humans and AI agents.

## Goal

Create a harness where:

- canonical design decisions are authored once in the repo,
- every downstream surface is generated or validated from that source,
- design and code iteration happen inside constrained, reviewable rails,
- and promotion is blocked when any required surface drifts.

The harness is intentionally stricter than a normal design-system workflow because its purpose is not only human coordination.
It is also meant to give AI agents a bounded operating environment with explicit contracts, derived artifacts, proof surfaces, and promotion rules.

## Contract Stack

The target-state harness has five layers:

1. canonical source
2. derived projections
3. publish rails
4. verification rails
5. promotion gates

Each higher layer is downstream-only.
No downstream layer is allowed to silently become a second source of truth.

---

## 1. Canonical Source

This layer owns editable truth.

### Purpose

Define the only files that may change design-system meaning directly.

### Owned surfaces

- `design-tokens/src/tokens/**/*.tokens.json`
- `design-tokens/src/tokens/themes/registry.json`
- `design-tokens/src/recipes/*.recipe.json`
- any future repo-owned story inventory or component contract metadata that is explicitly declared canonical

### Rules

- Figma is not canonical.
- Storybook is not canonical.
- Chromatic is not canonical.
- generated CSS, typed modules, and Figma exports are not canonical.
- agents may propose edits anywhere, but design-system meaning only changes when canonical source files change.

### AI-agent contract

Agents must be able to answer:

- which file owns this token,
- which file owns this theme rule,
- which file owns this recipe contract,
- whether a requested change is canonical or downstream-only.

If an agent cannot identify the owning canonical surface, the change is not ready to implement.

---

## 2. Derived Projections

This layer turns canonical source into deterministic downstream surfaces.

### Purpose

Project the same design-system truth into the formats needed by runtime, Storybook, Figma, and tooling.

### Required target projections

- runtime CSS artifact
  - `src/lib/tokens/tokens.css`
- typed token/recipe artifact
  - `design-tokens/dist/tokens.ts`
- Figma-facing token artifact
  - `design-tokens/dist/figma/tokens.json`
- Storybook-facing contract surfaces
  - generated token docs
  - recipe docs
  - story inventory
  - component spec metadata
- optional future mapping projections
  - Code Connect descriptors
  - Storybook Connect metadata
  - Chromatic story metadata

### Rules

- projections are regenerated, never hand-maintained in parallel with source.
- projections may be committed when reviewability matters.
- if a projection cannot be regenerated deterministically, it is not a valid projection surface.

### AI-agent contract

Agents must be able to trace:

- source file -> build command -> generated artifact -> consuming surface

for every supported projection.

If an agent changes a canonical token without updating or validating every required projection, the loop is incomplete.

---

## 3. Publish Rails

This layer moves derived projections into the operational surfaces where design and implementation are reviewed.

### Purpose

Take generated artifacts and publish them into the environments that humans and agents actually use.

### Required publish rails

#### Runtime rail

- app runtime consumes generated CSS through the stable import surface in `src/app/globals.css`

#### Storybook rail

- Storybook consumes generated CSS and generated token/recipe artifacts
- reusable components expose story contracts from the real code surface

#### Figma rail

- Figma receives repo-approved tokens through an explicit import/push path
- the transport must be deterministic, documented, and policy-bound
- Figma may materialize variables, styles, or mapped component metadata, but it does not author canonical values
- short-term proof may use a repo-owned or OSS-backed plugin/importer that materializes variables from `design-tokens/dist/figma/tokens.json`
- long-term hardening may use a repo-owned OAuth app plus the Figma Variables API once access and scopes are in place
- Tokens Studio is optional and replaceable; it is not part of the permanent harness contract

#### Optional visual-review rail

- Chromatic publishes the Storybook proof surface for branch-aware visual review

#### Optional design-link rail

- Storybook Connect links the published Storybook proof surface back into Figma

#### Optional design-to-code mapping rail

- Code Connect maps reusable Figma components to code props, variants, slots, and examples

### Rules

- every publish rail must declare its source artifact, transport, destination, and credential model.
- publish rails may be deferred, but deferred rails must be explicit.
- no publish rail may require undocumented manual interpretation to succeed.

### AI-agent contract

Agents must be able to answer:

- what gets published,
- from which artifact,
- by which command or integration,
- into which external surface,
- with which success marker.

---

## 4. Verification Rails

This layer proves that projections and publish rails still match canonical truth.

### Purpose

Make the system inspectable and testable at every boundary.

### Required verification rails

#### Source validation

- token validation
- theme validation
- recipe validation

#### Artifact validation

- deterministic build checks
- freshness checks
- runtime compatibility checks

#### Runtime verification

- app continues consuming generated runtime CSS

#### Storybook verification

- `pnpm test:storybook`
- story inventory validation
- proof stories for generated token docs and recipe docs

#### Figma verification

- sync ledger validation
- explicit sync mode and parity mode
- proof that the projected artifact can actually be materialized in Figma

#### Optional visual verification

- Chromatic build and diff status

#### Optional mapping verification

- Code Connect mapping completeness for reusable components
- Storybook Connect link validity

### Rules

- verification rails must be machine-checkable where possible.
- where human review is still required, the human checkpoint must produce a machine-readable status artifact.
- every deferred verification rail must declare why it is deferred and what promotes it to required.

### AI-agent contract

Agents must never infer “implemented” from files existing alone.
They must distinguish:

- declared,
- generated,
- published,
- verified,
- promoted.

---

## 5. Promotion Gates

This layer decides when work is allowed to advance.

### Purpose

Prevent incomplete or drifting states from being treated as done.

### Promotion levels

#### Level A — Source valid

Allowed when:

- canonical source passes validation

Use:

- early authoring confidence

#### Level B — Projection valid

Allowed when:

- required generated artifacts rebuild cleanly
- freshness and compatibility checks pass

Use:

- build-safe contract updates

#### Level C — Consumption valid

Allowed when:

- app and Storybook consume the current generated outputs
- required proof stories pass

Use:

- implementation-safe UI work

#### Level D — Publish valid

Allowed when:

- Figma publish/import rail works for the current artifact
- any enabled external publish rails complete successfully

Use:

- cross-surface sync claims

#### Level E — Promotion complete

Allowed when:

- local and CI gates pass
- required publish rails are current
- required verification rails are current
- no blocking drift remains in any status ledger

Use:

- merge, handoff, or component/system promotion

### Rules

- a surface may be implemented before it is promotable.
- a deferred rail must never silently count as promoted.
- “optional” means non-blocking only when explicitly documented as optional for that scope.

### AI-agent contract

Agents must be able to state the highest earned promotion level for a given change.
“Done” is invalid without a named promotion level.

---

## Surface Taxonomy

To keep the harness deterministic, every surface should be classified into one of these roles.

### 1. Authoring surface

Editable truth.

Current examples:

- `design-tokens/src/tokens/**`
- `design-tokens/src/recipes/**`

### 2. Projection surface

Generated from authoring surfaces.

Current examples:

- `design-tokens/dist/tokens.ts`
- `design-tokens/dist/figma/tokens.json`
- `src/lib/tokens/tokens.css`

### 3. Proof surface

Used to inspect and review the current projection.

Current examples:

- Storybook token docs stories
- Storybook recipe docs stories
- sync ledger

Future examples:

- Chromatic branch builds
- Storybook Connect links in Figma

### 4. Mapping surface

Binds equivalent concepts across tools without becoming the source of truth.

Future examples:

- Code Connect mappings
- Storybook Connect metadata
- component-loop metadata

### 5. Gate surface

Defines whether promotion is allowed.

Current examples:

- `pnpm validate:tokens`
- `pnpm build:tokens`
- `pnpm govern:tokens`
- `just preflight`
- CI workflow jobs

---

## Required End-State Invariants

The harness is considered complete only when all of these are true.

### Canonical-source invariants

- every token and recipe change originates in repo-owned canonical files
- no downstream tool is allowed to silently redefine canonical values

### Projection invariants

- runtime, Storybook, and Figma projections all derive from the same canonical revision
- generated artifacts are deterministic and freshness-checked

### Publish-rail invariants

- Figma has a deterministic repo-to-Figma path
- Storybook publishes the executable proof surface
- any enabled visual review rail is branch-aware and reproducible

### Verification invariants

- every enabled rail has at least one machine-readable health check
- human-only verification steps emit status into a ledger or equivalent contract file

### Promotion invariants

- merge or handoff is blocked when any required rail is stale, broken, or unverified
- deferrals are explicit, scoped, and reviewable

---

## Current Repo Position Versus Target State

### Implemented now

- canonical repo-owned token and recipe source
- deterministic build outputs
- runtime CSS cutover path
- Storybook consumption of generated artifacts
- token governance in local and CI workflows
- Figma sync policy and sync ledger scaffolding

### Partially implemented now

- Figma publish rail
- Storybook proof surfaces as a system-wide contract layer
- machine-readable sync status for cross-surface promotion

### Declared in skills but not yet implemented as repo truth

- branch-aware Chromatic publish and review
- Storybook Connect links back into Figma
- Code Connect mappings as a durable design-to-code layer
- promotion policy that treats those rails as required for reusable-component advancement

### Explicit tool posture

- Tokens Studio is not required by the target-state harness.
- A plugin-based Figma import proof is the preferred short-term `SEAM-5` rail.
- An OAuth-app-backed Variables API rail is the preferred long-term hardened `SEAM-5` rail.

---

## Recommended Convergence Order

The repo should converge toward the target-state harness in this order.

1. finish the current token, Storybook, and Figma baseline seams
2. formalize Storybook proof surfaces and story inventory as required verification rails
3. lock one deterministic Figma publish/import rail that does not weaken the source-of-truth model
4. add a branch-aware visual-review rail such as Chromatic only when it is wired into CI and status artifacts
5. add Code Connect only for reusable components once story contracts and Figma component contracts are already stable
6. add Storybook Connect only after Storybook publishing and Figma linking rules are deterministic
7. promote those additional rails from optional to required only after they have real gate ownership

This order preserves the tight-loop vision while preventing “declared but unenforced” integrations from becoming false structure for AI agents.

---

## Definition Of A Complete Harness

Collider has the intended harness only when an agent can perform this loop without guessing:

1. identify the canonical file that owns a change
2. update the canonical source
3. regenerate every required projection deterministically
4. publish those projections into app, Storybook, and Figma rails
5. verify each rail through machine-readable proof
6. determine promotion status from explicit gates
7. stop automatically if any required rail is stale, deferred, or broken

When that loop is true, the skill pack and the repo will finally describe the same system.
