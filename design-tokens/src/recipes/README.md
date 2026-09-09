# Component recipes

A recipe describes one component's variants, slots, states, defaults, and token
references. The source is `<component-id>.recipe.json`; `componentId` must match
that filename. The live example is [badge.recipe.json](badge.recipe.json).

There is no separate enrollment or second declaration of a component's shape.
Any component may have a recipe. Passing recipe validation means the recipe is
valid; it does not assert component readiness or successful Figma publication.

## Source contract

The v1 structural contract is [schema/recipe.schema.json](schema/recipe.schema.json).
All seven fields below are required; extra root fields are rejected.

| Field           | Meaning                                                              |
| --------------- | -------------------------------------------------------------------- |
| `recipeVersion` | Fixed to `"1"`                                                       |
| `componentId`   | Lowercase kebab-case, aligned with the filename stem                 |
| `variantAxes`   | Non-empty array of named axes and their supported values             |
| `defaults`      | Default value for every declared axis and a declared default state   |
| `slots`         | Named slots containing token-reference trees                         |
| `states`        | Named states containing overrides keyed by declared slot names       |
| `fallbacks`     | `missingVariantBehavior: "use-defaults"` and state fallback mappings |

Recipe payloads are not runtime component implementations. Changing a recipe does
not change a component's TSX API or styles automatically. Component source,
Storybook specifications and applicable proof requirements remain separate concerns.

## Validation

The actual token validation entry checks recipes in this order:

1. **Shape:** required fields and types, supported version, identifiers, filename
   alignment, unique axis values, no extra properties in closed objects, and valid
   token-reference trees. Inline scalar values are not accepted.
2. **Internal consistency:** unique axis names; defaults refer to every declared
   axis and one of its values; the default state exists; state overrides refer to
   declared slots; fallback sources and targets exist and chains terminate.
3. **Token existence:** every token-bearing leaf resolves to a live source token.

Names and defaults come from the recipe itself, not a mirrored contract. A recipe
may add or remove its own axes/slots/states or change defaults as long as these
relationships remain valid. State fallback mappings may be omitted where no
fallback is needed; a cycle, including a self-reference, is invalid.

Use brace-wrapped references accepted by the schema and present in token sources:

- `{semantic.color.text.primary}`
- `{accent.primary}`

A raw color such as `#ffffff` or a CSS expression such as `var(--primary)` is not
a token reference. A well-formed but nonexistent token ID is also rejected.

## Build and documentation

`pnpm build:tokens` validates sources before generating the typed `recipeMap` in
`design-tokens/dist/tokens.ts`. Runtime CSS and the Figma token artifact remain
token outputs; recipes do not enroll components into a publication workflow.

The build discovers all regular `*.recipe.json` sources here. The docs model reads
exactly the generated `recipeMap`, and the Generated Tokens Storybook surface
renders those entries. There is no hand-maintained discovery index or independent
status filter. Adding a valid source and rebuilding makes it available to both
consumers; the docs integration test detects a stale source/generated-map split.
Documentation presence is not a validity, readiness, or publication claim.

The publication ledger under `src/figma/` records token publication evidence. It
has no role in allowing a component to have a recipe.

## Commands and tests

```bash
pnpm validate:tokens
pnpm build:tokens
pnpm govern:tokens
pnpm exec vitest run --project unit src/lib/tokens/recipe-validity.test.ts
```

`recipe-validity.test.ts` exercises the real token validator with temporary recipe
files and real token sources. It covers valid new components, lawful shape changes,
empty recipe sets, internal consistency, malformed shape, and missing references.
Each negative asserts the intended diagnostic so a failure at an unrelated rule
cannot masquerade as coverage. These cases replace the unwired duplicate CLI and
its unusable fixture set.

The implementation still resides in Collider during this first retirement packet.
The approved ds-skills separation moves reusable schema/validation/build mechanics
into the installed product; Collider retains its recipe data and integration proof.
