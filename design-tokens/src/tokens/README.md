# Token ID And Family Rules

`design-tokens/src/**` is the editable source of truth for canonical tokens and recipes in this repo. Token IDs published from `design-tokens/src/tokens/**` are the stable public names that downstream seams must reference. Runtime CSS variables such as `src/lib/tokens/tokens.css` are derived output, not canonical input.

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

## Allowed References

- `core` tokens own raw scalar values and do not reference `semantic`, `motion`, runtime CSS variables, or component recipes.
- `semantic` tokens may reference `core` tokens by DTCG reference string, for example `{core.color.neutral.950}`.
- `semantic` tokens must not reference runtime CSS variables or recipe manifests.
- `motion` tokens are self-owned in v1 and do not reference color families or component recipes.
- Theme files may publish theme-specific values for canonical IDs, but they do not redefine the public family prefix rules from this document.

## Runtime CSS Is Derived Output

`src/lib/tokens/tokens.css` is a generated runtime artifact path owned by later seams. Its CSS custom properties remain important compatibility inputs for migration planning, but they are not the canonical naming surface for new token work.

When a current runtime variable is mapped into the canonical tree:

- keep the runtime variable available until the migration plan says otherwise,
- publish one canonical token ID for downstream seams to reference,
- treat the CSS variable name as a legacy runtime contract, not as the source token ID.

## Component Recipes Are Out Of Scope

`CT-1` is limited to scalar token data. Component recipes, variant axes, slot rules, state fallbacks, and other recipe concerns belong under `design-tokens/src/recipes/**`, not under `design-tokens/src/tokens/**`.

Token files must not contain:

- component IDs,
- slot names,
- variant definitions,
- state matrices,
- recipe-only defaults or fallbacks.

## Worked Mappings From Current Runtime Variables

These examples are illustrative naming contracts for the current runtime surface in `src/lib/tokens/tokens.css`. They do not replace the exhaustive alias map that lands in `S2`.

| Legacy CSS variable           | Proposed canonical semantic token ID  | Referenced core token ID | Theme ID |
| ----------------------------- | ------------------------------------- | ------------------------ | -------- |
| `--color-background-base`     | `semantic.color.background.base`      | `core.color.neutral.950` | `dark`   |
| `--color-text-secondary`      | `semantic.color.text.secondary`       | `core.color.neutral.500` | `dark`   |
| `--color-statusstrip-success` | `semantic.color.status-strip.success` | `core.color.green.800`   | `dark`   |

Notes:

- Each example lands in one family and one canonical semantic ID. Downstream seams should reference the semantic ID, not the legacy CSS variable.
- The `semantic -> core` relationship is explicit in every example so the public contract stays separate from raw scalar ownership.
- `status-strip` is the chosen canonical segment form for new token IDs. The legacy CSS variable remains `statusstrip` for compatibility, but downstream token references should use `status-strip`.
