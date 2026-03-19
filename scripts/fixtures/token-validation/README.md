These fixtures exercise `scripts/lib/token-validation.mjs` without adding public CLI flags.

- `valid/`: minimal source tree that passes all four validation phases.
- `invalid-json/`: malformed token JSON for parse failure coverage.
- `invalid-theme/`: theme registry with an unknown `extends` target.
- `invalid-recipe-shape/`: recipe file with an inline scalar instead of a token reference.
- `invalid-token-reference/`: broken token reference in semantic token source.
