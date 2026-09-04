# Seam Map

Source: `figma-ci-sync-plan.md`

Extraction strategy: `integration-first`, with a domain pass for scalar token definitions and component recipe contracts. The plan is integration-heavy because the main risk is not inventing values; it is keeping repo JSON, generated outputs, Storybook, and Figma aligned without hidden coupling.

## Final Seams

| ID       | Name                                | Type        | Unlocks                                                                        | Primary blockers             |
| -------- | ----------------------------------- | ----------- | ------------------------------------------------------------------------------ | ---------------------------- |
| `SEAM-1` | Canonical Token Source              | domain      | Repo-owned scalar design decisions in DTCG JSON                                | none                         |
| `SEAM-2` | Component Recipe Manifest           | capability  | Repo-owned variant/state contracts separate from scalar tokens                 | `SEAM-1`                     |
| `SEAM-3` | Token Build and Distribution        | integration | Deterministic generation of runtime, typed, and Figma artifacts                | `SEAM-1`, `SEAM-2`           |
| `SEAM-4` | App and Storybook Consumption       | platform    | Shared runtime token consumption and token visibility inside app and Storybook | `SEAM-2`, `SEAM-3`           |
| `SEAM-5` | Figma Sync Rail                     | integration | Designer-facing consumption of repo-approved tokens in Figma                   | `SEAM-1`, `SEAM-3`           |
| `SEAM-6` | Governance, Validation, and Cutover | risk        | Local and CI enforcement, staged rollout, and drift prevention                 | `SEAM-3`, `SEAM-4`, `SEAM-5` |

## Seam Brief Index

- `SEAM-1` → `seam-1-canonical-token-source.md`
- `SEAM-2` → `seam-2-component-recipe-manifest.md`
- `SEAM-3` → `seam-3-token-build-and-distribution.md`
- `SEAM-4` → `seam-4-app-and-storybook-consumption.md`
- `SEAM-5` → `seam-5-figma-sync-rail.md`
- `SEAM-6` → `seam-6-governance-validation-and-cutover.md`

## Candidate Seams Considered and Pruned

- A standalone "workspace/package-topology seam" was pruned into assumptions because repo topology is an implementation choice, not the value boundary.
- A standalone "enterprise Figma Variables API seam" was folded into `SEAM-5` and `SEAM-6` because it is optional hardening, not a separate capability in v1.
- A standalone "migration seam" was folded into `SEAM-6` because cutover safety is governance work attached to validation and rollout, not an independently shippable product capability.
