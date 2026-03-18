# Token ID And Family Rules

`design-tokens/src/**` is the editable source of truth for canonical tokens and recipes in this repo. Token IDs published from `design-tokens/src/tokens/**` are the stable public names that downstream seams must reference.

Use `design-tokens/src/tokens/AUTHORING.md` for file placement, allowed references, and canonical token authoring decisions. This README stays focused on the public token-family and token-ID contract.

## Canonical Token Families

| Family prefix | Ownership                         | Allowed content                                                                                      | Excluded content                                                                                  |
| ------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `core`        | Raw scalar primitives             | Base color values, scalar durations, and other primitive values that can be reused without UI intent | Component meaning, slot/state naming, runtime CSS variable names, recipes, theme-selection policy |
| `semantic`    | Runtime-facing meaning and intent | Tokens that describe how the UI uses values, such as background, text, and status-strip roles        | Raw value ownership, recipe manifests, runtime CSS variable names                                 |
| `motion`      | Motion primitives                 | Duration and easing namespaces such as `motion.duration.*` and `motion.easing.*`                     | Color families, component recipes, runtime CSS variable names                                     |

Theme files under `themes/<theme>.tokens.json` publish theme-specific values and overrides for canonical token IDs, but they do not create a fourth public family prefix. Public token IDs still begin with `core`, `semantic`, or `motion`.

Semantic IDs are the preferred public handoff surface for downstream seams such as `SEAM-2` and `SEAM-3`. Downstream recipe and build work must reference canonical token IDs, not invent alternate naming or bind directly to CSS variable names.

## Canonical Token ID Grammar

Canonical token IDs are dot-separated identifiers:

```text
<token-id> = <family> ("." <segment>)+
<family>   = "core" | "semantic" | "motion"
<segment>  = lowercase letters and digits, with optional internal hyphens
```

Use this regex when checking the public ID shape:

```text
^(core|semantic|motion)(\.[a-z0-9]+(?:-[a-z0-9]+)*)+$
```

Rules:

- All segments are lowercase.
- Segments may contain digits.
- Hyphens are allowed only inside a segment, never in place of dots.
- CSS custom-property syntax such as `--color-background-base` is not a canonical token ID.
- Public IDs always start with `core`, `semantic`, or `motion`.

Examples:

- `core.color.neutral.950`
- `semantic.color.background.base`
- `motion.duration.fast`

## Runtime CSS Is Derived Output

`src/lib/tokens/tokens.css` is a generated runtime artifact path owned by later seams. Its CSS custom properties remain important compatibility inputs for migration planning, but they are not the canonical naming surface for new token work.

## Component Recipes Are Out Of Scope

`CT-1` is limited to scalar token data. Component recipes, variant axes, slot rules, state fallbacks, and other recipe concerns belong under `design-tokens/src/recipes/**`, not under `design-tokens/src/tokens/**`.
