# Collider publication parity policy

`src/figma/sync-ledger.json` records the consumer's token-publication posture. Its
current declaration is `parityMode: required` and
`highestEarnedLevel: E-promotion-complete`, based on an earlier publication. Those
fields are claims to validate, not evidence of a new live check.

The pinned product owns allowed states, earned levels, proof binding and evaluation.
Required parity must satisfy the evaluator's current publication requirements;
structurally valid JSON is insufficient. Deferred parity cannot earn full promotion.
Do not clear blocking exceptions, advance a level, or set a verification revision
without the actual evidence and explicit consumer policy supporting it.

The installed `pnpm validate:figma-parity` validates ledger/proof consistency. The
plugin's **Check Drift** observes live variables. Neither verifies every component's
visual design, and the token ledger has no per-component eligibility or sync list.
See [publication guidance](README.md) and
[independent readiness profiles](../../docs/stage1/sync-policy.md).
