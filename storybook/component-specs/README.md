# Component Specs

`storybook/component-specs/<component-id>.json` is the repo-owned `CT-9B` component-spec surface.

- `S1b` owns the field names and structural validation rules for each component spec file.
- `S1c` owns the allowed `tier` values and the required-kind matrix that later constrains those fields.
- `S3a` owns repo-wide multi-file validation, referential integrity, and coverage reporting across component specs and the story inventory.
