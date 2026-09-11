# Token Family and ID Rules

`design-tokens/src/**` is the editable source of truth for canonical tokens and
recipes. This directory is intentionally filename-derived: every
`<family>.tokens.json` file supplies one canonical token family. The loader validates
the family name and derives that root from the filename; do not impose an older
three-family taxonomy on current source.

## Current canonical families

The current source contains these families:

`accent`, `core`, `elevation`, `font`, `layout`, `motion`, `radius`, `semantic`,
`shape`, `spacing`, `tailwind-colors`, `tailwind-variables`, and `type`.

A token's canonical ID starts with its source filename family and continues through
its object path—for example, `accent.primary`, `core.color.neutral.950`,
`motion.role.hover.duration`, and `type.font.poppins`. The validator is authoritative
for exact shape and reference resolution; do not rename, relocate, or reject a family
merely because it is not `core`, `semantic`, or `motion`.

Theme files supply approved theme-specific overrides for existing canonical token
paths. They are not a license to invent a family or bypass the declared theme
registry/change policy.

## Authoring boundary

Use [AUTHORING.md](AUTHORING.md) for placement and reference rules and
[CHANGE_POLICY.md](CHANGE_POLICY.md) for public token-ID/theme-ID changes. A file's
family is a source boundary, not a statement that every token is semantically
interchangeable: choose the existing family that owns the value's domain and preserve
references validated by the token build.

Runtime CSS such as `src/lib/tokens/tokens.css` is generated output, not an authoring
input. Component recipes, variant axes, slot rules, and state fallbacks belong under
`design-tokens/src/recipes/**`, not under `design-tokens/src/tokens/**`.
