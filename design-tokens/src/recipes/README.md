# Collider component recipes

[badge.recipe.json](badge.recipe.json) is ordinary consumer-owned recipe data. Any
component may have a `<component-id>.recipe.json`; there is no separate enrollment,
shape mirror or publication prerequisite. Validity does not assert implementation
readiness or successful Figma publication.

The recipe schema, intrinsic checks, token-reference validation and compiler belong
to the installed ds-skills release. Use its
[foundation workflow](../../../.agents/skills/stage-1-foundation-primitives-system/SKILL.md)
and [project invocation contract](../../../docs/ds-skills-consumer.md). Do not restore
a local schema, validator, fixture generator or discovery index.

```sh
pnpm validate:tokens
pnpm build:tokens
pnpm govern:tokens
pnpm exec vitest run --project unit src/lib/tokens/recipeDocs.test.ts
```

The build discovers regular `*.recipe.json` source files and validates structure,
internal consistency and real token references before emitting `recipeMap` in
`design-tokens/dist/tokens.ts`. The app's docs model reads that generated map;
`recipeDocs.test.ts` checks that source, generated map and rendered docs model agree.
No hand-maintained index or status filter authorizes discovery.

Changing a recipe does not change the component's TSX API/styles. Applicable
component specs, story/visual evidence and [readiness profiles](../../../docs/stage1/sync-policy.md)
remain separate. The ledger under `src/figma/` records token publication only.
