# Collider visual review evidence

The installed ds-skills product owns the review record schema, validation and provider
adapter. Collider owns `storybook.chromatic` configuration in `ds-skills.project.json`.
`artifacts/chromatic/status.json` is generated, revision-bound evidence, not a committed
baseline. Its absence is not approval. Do not rewrite historical evidence to match HEAD.

Use `pnpm validate:chromatic-status` for a read-only check. Explicit restoration uses
`pnpm restore:chromatic-status` and the configured GitHub repository/workflow/artifact
identity; it neither publishes nor approves a review. Status format version 1 remains
supported by the installed product, not a second frozen consumer implementation.

Current scope comes from actual specs and story inventory. Valid record structure is
not a passed visual result: changed, failed and deferred outcomes remain unmet under
Collider's explicit component-review policy. See [consumer installation](../docs/ds-skills-consumer.md).
