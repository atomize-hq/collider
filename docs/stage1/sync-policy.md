# Collider evidence and sync policy

The reusable workflow belongs to the installed
[quality skill](../../.agents/skills/sync-quality-governor/SKILL.md) and
[component round-trip skill](../../.agents/skills/stage-2-component-roundtrip-loop/SKILL.md).
This document records Collider's consumer policy, not a second evaluator.

## Three independent facts

1. **Recipe validity:** source recipes under `design-tokens/src/recipes` have valid
   structure, unique axes and references to real tokens. Authoring a valid recipe
   requires no component enrollment or publication record. Recipe discovery is
   derived from actual files; documentation must not invent a second allow-list.
2. **Component readiness:** actual code, component specs, declared story references,
   applicable tier obligations and current visual review support a particular claim.
   A file or Figma node URL alone does not establish readiness.
3. **Figma publication:** the token artifact, publish proof and bound sync ledger
   describe an actual token publication. They do not contain per-component state.
   A structurally valid old attestation does not prove a new live publication.

## Configured readiness claims

`ds-skills.project.json` owns the selected profiles and enforcement:

| Profile              | Requirements                             | Blocking consumer |
| -------------------- | ---------------------------------------- | ----------------- |
| `reference`          | Story coverage                           | `docs`            |
| `component-review`   | Story coverage and current visual review | `ci`, `handoff`   |
| `publication-record` | Figma publication                        | `release`         |
| `release`            | Coverage, visual review and publication  | `release`         |

`component-review/local` is explicitly advisory; that verdict is not CI approval.
Missing, changed, stale or unaccepted review must not be silently promoted to passed.
The CI workflow checks the actual reviewed revision and current run's evidence.
Do not turn a missing review into a historical fixture or a skipped-success claim.

Use the thin installed commands:

```sh
pnpm govern:tokens
pnpm govern:storybook-proof
pnpm generate:reusable-component-status
pnpm govern:reusable-component-promotion --profile component-review --consumer ci
```

The last command can legitimately fail when review evidence is unavailable. Passing
preflight, source checks or Storybook tests does not substitute for visual approval.

## Project references and drift

- `storybook/component-specs/<id>.json` owns `downstreamHooks.codeEntrypoint` and
  `downstreamHooks.figmaComponentRef`; preserve real Figma references independently
  of token publication. A node's existence and visual match require actual inspection.
- `storybook/story-inventory.json` and `component-tier-policy.json` select the
  applicable story proof. Executed interaction/a11y tests remain separate evidence.
- `src/lib/tokens/tokens.css` is generated from canonical token source. Rebuild
  through the installed product; do not hand-edit generated CSS.
- `src/figma/sync-ledger.json` is a token-publication ledger. It has no `componentId`,
  per-component `syncStatus`, or component eligibility list.
- Plugin **Check Drift** measures loaded artifact versus Figma variables; ledger
  validation checks records. Neither proves pixel parity for every component.

See [Figma operator guidance](../../src/figma/README.md) for publication and drift.
Use `just preflight` before every push and `just sweep` before PR/merge. Both are
required, neither authorizes fabricating unavailable live or external review proof.
