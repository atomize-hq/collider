### S2 — Runtime Coverage And Migration Map

- This slice was decomposed into sub-slices in this directory:
  - `slice-2-runtime-coverage-and-migration-map/`
- Archived original: `archive/slice-2-runtime-coverage-and-migration-map.md`
- Decomposition rationale: borderline-oversized because it spans runtime inventory extraction, canonical alias mapping, and cutover policy across both app runtime files and canonical token artifacts.

#### Sub-slices

- `subslice-1-runtime-variable-inventory.md` — `S2a`; inventories every live runtime CSS variable and records the stable import-path dependency.
- `subslice-2-canonical-alias-map.md` — `S2b`; maps each legacy runtime variable to one canonical token ID, theme, and compatibility action.
- `subslice-3-runtime-cutover-compatibility.md` — `S2c`; records cutover policy and preservation rules that downstream seams must honor during migration.
